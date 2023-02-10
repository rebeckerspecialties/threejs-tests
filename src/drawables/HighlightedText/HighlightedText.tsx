import { defaultThemeColor } from '@/drawables/utils/colors';
import { textHighlightBoxGeometry } from '@/drawables/utils/geometries';
import { defined, FONT_SIZE } from '@/drawables/utils/utils';
import { useTextSelectionContext, useThemeContext } from '@/providers';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useMemo, useRef } from 'react';
import { Group, InstancedMesh, Object3D } from 'three';
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
	groupRef,
) {
	const { selectedText } = useTextSelectionContext();
	const { fontURL } = useThemeContext();
	const textRef = useRef<typeof TroikaText>(null);
	const meshRef = useRef<InstancedMesh>(null);
	const tickRef = useRef({ lastSelectedText: '' });
	const object3D = new Object3D();

	const selectionIndexes: number[] = useMemo(() => {
		if (text.length === 0 || selectedText.length === 0) {
			return [];
		}

		// get indexes where text was found and mount colorRanges entity
		const selectionIndexes: number[] = [];
		for (let i = 0; i <= text.length - selectedText.length; i++) {
			if (text.slice(i, i + selectedText.length) === selectedText) {
				selectionIndexes.push(i);
			}
		}
		return selectionIndexes;
	}, [text, selectedText]);

	useFrame(() => {
		if (
			!defined(textRef.current) ||
			!defined(getSelectionRects) ||
			tickRef.current.lastSelectedText === selectedText
		) {
			return;
		}

		for (let i = 0; i < selectionIndexes.length; i++) {
			// considering word selection (line doesn't break in Text), so we only need first occurrence
			const [{ left, right, top, bottom }]: [
				{ left: number; right: number; top: number; bottom: number },
			] = getSelectionRects(
				textRef.current.textRenderInfo,
				selectionIndexes[i],
				selectionIndexes[i] + selectedText.length,
			) ?? [{ left: 0, right: 0, top: 0, bottom: 0 }];

			const width = right - left;
			const height = top - bottom;
			const posX = width / 2 + left;
			const posY = height / 2 + bottom;
			object3D.position.set(posX, posY, 0.0005); // adjust z position closer to text
			object3D.scale.set(width * 1000, height * 1000, 1000); // 1000 factor since geometry starts at 0.001
			object3D.updateMatrix();
			meshRef.current?.setMatrixAt(i, object3D.matrix);
		}
		if (defined(meshRef.current)) {
			meshRef.current.instanceMatrix.needsUpdate = true;
		}
		tickRef.current.lastSelectedText = selectedText;
	});

	return (
		<group ref={groupRef} position={[position.x, position.y, position.z]}>
			<Text
				ref={textRef}
				fontSize={fontSize}
				color={defaultThemeColor.editor.foreground}
				font={fontURL}
			>
				{text}
			</Text>
			{selectionIndexes.length > 0 && (
				<instancedMesh
					ref={meshRef}
					args={[textHighlightBoxGeometry, undefined, selectionIndexes.length]}
					position={[0, 0, -0.01]} // initially render slight behind
				>
					<meshBasicMaterial color={defaultThemeColor.editor.findMatchBackground} />
				</instancedMesh>
			)}
		</group>
	);
});
