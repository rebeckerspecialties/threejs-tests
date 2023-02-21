import { defaultThemeColor } from '@/drawables/utils/colors';
import { preSelectTextBoxGeometry, textHighlightBoxGeometry } from '@/drawables/utils/geometries';
import {
	defined,
	FONT_SIZE,
	getRectangleIdxFromPoint,
	getWordIndexesFromText,
	mergeRects,
	RectanglePoints,
	WordIndex,
} from '@/drawables/utils/utils';
import { useTextSelectionContext, useThemeContext } from '@/providers';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Interactive, XRInteractionEvent, XRInteractionHandler } from '@react-three/xr';
import { forwardRef, RefObject, useMemo, useRef, useState } from 'react';
import { Group, InstancedMesh, Intersection, LineSegments, Object3D } from 'three';
import { getSelectionRects, Text as TroikaText } from 'troika-three-text';

interface HighlightedTextProps {
	text: string;
	position: { x: number; y: number; z: number };
	fontSize?: number;
}

/**
 * This component uses the context TextSelectionContext to search and highlight
 * occurrences found in text.
 *
 * Remember to use <Suspense> to invoke this component to avoid VR glitches.
 */
export const HighlightedText = forwardRef<Group, HighlightedTextProps>(function HighlightedText(
	{ text, position, fontSize = FONT_SIZE },
	groupRef: RefObject<Group>,
) {
	const [selectionRectangles, setSelectionRectangles] = useState<RectanglePoints[]>([]);
	const [showPreSelectMesh, setShowPreSelectMesh] = useState(false);
	const { selectedText, setSelectedText } = useTextSelectionContext();
	const { fontURL } = useThemeContext();
	const textRef = useRef<typeof TroikaText>(null);
	const selectionMeshRef = useRef<InstancedMesh>(null);
	const preSelectMeshRef = useRef<LineSegments>(null);
	const tickRef = useRef({ lastSelectedText: '' });
	const object3D = new Object3D();

	const selectionIndexes: number[] = useMemo(() => {
		if (text.length === 0 || selectedText.length === 0) {
			return [];
		}

		// get indexes where text was found and mount colorRanges entity
		const selectionIndexes: WordIndex[] = getWordIndexesFromText(text, selectedText);
		return selectionIndexes.map((wordIndex) => wordIndex.start as number); // start is always present
	}, [text, selectedText]);

	// list of indexes (start and end) in text that are interactive - basically every word
	const wordIndexes: WordIndex[] = useMemo(() => {
		return getWordIndexesFromText(text);
	}, [text]);

	useFrame(() => {
		if (
			!defined(textRef.current) ||
			!defined(getSelectionRects) ||
			tickRef.current.lastSelectedText === selectedText
		) {
			return;
		}

		// highlight selected texts
		for (let i = 0; i < selectionIndexes.length; i++) {
			const selectionRects: RectanglePoints[] = getSelectionRects(
				textRef.current.textRenderInfo,
				selectionIndexes[i],
				selectionIndexes[i] + selectedText.length,
			) ?? [{ left: 0, right: 0, top: 0, bottom: 0 }];
			const { right = 0, left = 0, top = 0, bottom = 0 } = mergeRects(selectionRects);

			const width = right - left;
			const height = top - bottom;
			const posX = width / 2 + left;
			const posY = height / 2 + bottom;
			object3D.position.set(posX, posY, 0.0005); // adjust z position closer to text
			object3D.scale.set(width * 1000, height * 1000, 1); // 1000 factor since geometry starts at 0.001
			object3D.updateMatrix();
			selectionMeshRef.current?.setMatrixAt(i, object3D.matrix);
		}
		if (defined(selectionMeshRef.current)) {
			selectionMeshRef.current.instanceMatrix.needsUpdate = true;
		}
		tickRef.current.lastSelectedText = selectedText;
	});

	const updateWordRectPositions = () => {
		const selectionRects = wordIndexes.map(({ start = 0, end = 0 }) => {
			const rects: RectanglePoints[] = getSelectionRects(
				textRef.current.textRenderInfo,
				start,
				end,
			) ?? [
				{ left: 0, right: 0, top: 0, bottom: 0 }, // safety fallback, but maybe we should log a warning here?
			];
			// getSelectionRects may return multiple selection (break down for performance?)
			// since we don't break words, selection is always on the same line, so it's safe to merge into a single rect here
			return mergeRects(rects);
		});
		setSelectionRectangles(selectionRects);
	};

	const highlightWord = (event: XRInteractionEvent, type: 'pre-select' | 'select') => {
		if (selectionRectangles.length === 0 || !defined(groupRef?.current)) {
			return;
		}
		const { intersection } = event;
		const { point } = intersection as Intersection<Object3D<Event>>; // assuming intersection will never be undefined
		const { position: groupPosition } = groupRef.current;
		const relativePoint = {
			x: point.x - groupPosition.x,
			y: point.y - groupPosition.y,
		}; // relative point of the ray controller inside the text group
		const idx = getRectangleIdxFromPoint(selectionRectangles, relativePoint);
		if (type === 'pre-select') {
			if (idx !== -1) {
				const { left = 0, right = 0, top = 0, bottom = 0 } = selectionRectangles[idx];
				const width = right - left;
				const height = top - bottom;
				setShowPreSelectMesh(true); // need to set flag to show first so preSelectMeshRef exists
				if (defined(preSelectMeshRef?.current)) {
					preSelectMeshRef.current.position.set(left + width / 2, bottom + height / 2, 0);
					preSelectMeshRef.current.scale.set(width * 1000, height * 1000, 1); // 1000 factor since geometry starts at 0.001
				}
			} else {
				setShowPreSelectMesh(false);
			}
		} else {
			if (idx !== -1) {
				// found the selection rectangle clicked, its index follows the same from wordIndexes
				const { start, end } = wordIndexes[idx];
				const textToSelect = text.slice(start, end);
				setSelectedText(selectedText === textToSelect ? '' : textToSelect);
			}
		}
	};

	const textOnMove: XRInteractionHandler = (e) => highlightWord(e, 'pre-select');
	const textOnSelect: XRInteractionHandler = (e) => highlightWord(e, 'select');
	const textOnBlur: XRInteractionHandler = () => setShowPreSelectMesh(false);

	return (
		<group ref={groupRef} position={[position.x, position.y, position.z]}>
			<Interactive onMove={textOnMove} onSelect={textOnSelect} onBlur={textOnBlur}>
				<Text
					ref={textRef}
					fontSize={fontSize}
					color={defaultThemeColor.editor.foreground}
					font={fontURL}
					onSync={updateWordRectPositions} // lifecycle - now we have textRenderInfo to get proper rectangles
				>
					{text}
				</Text>
			</Interactive>
			{showPreSelectMesh && (
				<lineSegments ref={preSelectMeshRef} args={[preSelectTextBoxGeometry]} position={[0, 0, 0]}>
					<lineBasicMaterial color={defaultThemeColor.editor.selectionBackground} />
				</lineSegments>
			)}
			{
				// blocks for highlighted text
				selectionIndexes.length > 0 && (
					<instancedMesh
						ref={selectionMeshRef}
						args={[textHighlightBoxGeometry, undefined, selectionIndexes.length]}
						position={[0, 0, -0.001]} // initially render slight behind
					>
						<meshBasicMaterial color={defaultThemeColor.editor.findMatchBackground} />
					</instancedMesh>
				)
			}
		</group>
	);
});
