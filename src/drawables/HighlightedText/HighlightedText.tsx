import {
	defaultFindMatchTextBackground,
	defaultThemeColor,
	getAvailableHighlightHexColor,
	textBgColorsEntity,
} from '@/drawables/utils/colors';
import { preSelectTextBoxGeometry, textHighlightBoxGeometry } from '@/drawables/utils/geometries';
import { defaultBasicMaterial } from '@/drawables/utils/materials';
import {
	arrayMatches,
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

interface Props {
	text: string;
	position: { x: number; y: number; z: number };
	fontSize?: number;
	addInteraction?: boolean;
}

/**
 * This component uses the context TextSelectionContext to search and highlight
 * occurrences found in text.
 */
export const HighlightedText = forwardRef<Group, Props>(function HighlightedText(
	{ text, position, fontSize = FONT_SIZE, addInteraction = true },
	groupRef: RefObject<Group>,
) {
	const [selectionRectangles, setSelectionRectangles] = useState<RectanglePoints[]>([]);
	const [showPreSelectMesh, setShowPreSelectMesh] = useState(false);
	const { textSelections, setTextSelections } = useTextSelectionContext();
	const { fontURL } = useThemeContext();
	const textRef = useRef<typeof TroikaText>(null);
	const selectionMeshRef = useRef<InstancedMesh>(null);
	const preSelectMeshRef = useRef<LineSegments>(null);
	const tickRef = useRef<{ lastSelectedTexts: string[] }>({ lastSelectedTexts: [] });
	const object3D = new Object3D();

	const selectionIndexes: WordIndex[] = useMemo(() => {
		const selectedTexts = Object.keys(textSelections);
		if (text.length === 0 || selectedTexts.length === 0) {
			return [];
		}

		// get indexes where text was found and mount colorRanges entity
		return getWordIndexesFromText(text, selectedTexts);
	}, [text, textSelections]);

	// list of indexes (start and end) in text that are interactive - basically every word
	const wordIndexes: WordIndex[] = useMemo(() => {
		return getWordIndexesFromText(text);
	}, [text]);

	useFrame(() => {
		const selectedTexts = Object.keys(textSelections);
		if (
			!defined(textRef.current) ||
			!defined(getSelectionRects) ||
			arrayMatches(tickRef.current.lastSelectedTexts, selectedTexts)
		) {
			return;
		}

		// highlight selected texts
		for (let i = 0; i < selectionIndexes.length; i++) {
			const { start, end, text: textToSelect = '' } = selectionIndexes[i];
			const selectionRects: RectanglePoints[] = getSelectionRects(
				textRef.current.textRenderInfo,
				start,
				end,
			) ?? [{ left: 0, right: 0, top: 0, bottom: 0 }];
			const { right = 0, left = 0, top = 0, bottom = 0 } = mergeRects(selectionRects);

			const width = right - left;
			const height = top - bottom;
			const posX = width / 2 + left;
			const posY = height / 2 + bottom;
			object3D.position.set(posX, posY, 0.0005); // adjust z position closer to text
			object3D.scale.set(width * 1000, height * 1000, 1); // 1000 factor since geometry starts at 0.001
			object3D.updateMatrix();
			selectionMeshRef.current?.setColorAt(
				i,
				textBgColorsEntity[textSelections[textToSelect].hexColor] ?? defaultFindMatchTextBackground,
			);
			selectionMeshRef.current?.setMatrixAt(i, object3D.matrix);
		}
		if (defined(selectionMeshRef.current)) {
			selectionMeshRef.current.instanceMatrix.needsUpdate = true;
		}
		tickRef.current.lastSelectedTexts = [...selectedTexts];
	});

	const updateWordRectPositions = () => {
		const selectionRects = wordIndexes.map(({ start = 0, end = 0 }) => {
			const rects: RectanglePoints[] = getSelectionRects(
				textRef.current?.textRenderInfo,
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
				if (textSelections[textToSelect] !== undefined) {
					// selection already exists - user wants to de-select
					const { [textToSelect]: _removed, ...newSelections } = textSelections;
					setTextSelections(newSelections);
				} else {
					// user wants to select new text
					if (Object.keys(textSelections).length < 3) {
						const availableColor = getAvailableHighlightHexColor(textSelections);
						const newSelections = {
							...textSelections,
							[textToSelect]: { hexColor: availableColor },
						};
						setTextSelections(newSelections);
					}
				}
			}
		}
	};

	const textOnMove: XRInteractionHandler = (e) => highlightWord(e, 'pre-select');
	const textOnSelect: XRInteractionHandler = (e) => highlightWord(e, 'select');
	const textOnBlur: XRInteractionHandler = () => setShowPreSelectMesh(false);

	return (
		<group ref={groupRef} position={[position.x, position.y, position.z]}>
			{addInteraction ? (
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
			) : (
				<Text
					ref={textRef}
					fontSize={fontSize}
					color={defaultThemeColor.editor.foreground}
					font={fontURL}
					onSync={updateWordRectPositions} // lifecycle - now we have textRenderInfo to get proper rectangles
				>
					{text}
				</Text>
			)}

			{showPreSelectMesh && (
				<lineSegments ref={preSelectMeshRef} args={[preSelectTextBoxGeometry]} position={[0, 0, 0]}>
					<lineBasicMaterial color={defaultThemeColor.editor.selectionBackground} />
				</lineSegments>
			)}
			{
				// blocks for highlighted text
				selectionIndexes.length !== 0 && (
					<instancedMesh
						ref={selectionMeshRef}
						args={[textHighlightBoxGeometry, defaultBasicMaterial, selectionIndexes.length]}
						position={[0, 0, -0.001]} // initially render slight behind
					/>
				)
			}
		</group>
	);
});
