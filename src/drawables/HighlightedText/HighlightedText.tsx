import { useTextSelectionContext } from '@/providers';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { Group, InstancedMesh, Object3D } from 'three';
import { getSelectionRects, Text as TroikaText } from 'troika-three-text';
import { defaultThemeColor } from '../utils/colors';
import { textHighlightBoxGeometry } from '../utils/geometries';
import { defined } from '../utils/utils';

const TICK_SEC = 1;

interface HighlightedTextProps {
	text: string;
	position: { x: number; y: number; z: number };
	translate?: { x: number; y: number; z: number };
	rotationY?: number;
}

/**
 * This component uses the context TextSelectionContext to search and highlight
 * occurrences found in text.
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
	text,
	position,
	translate = { x: 0, y: 0, z: 0 },
	rotationY = 0,
}) => {
	const { selectedText } = useTextSelectionContext();
	const groupRef = useRef<Group>(null);
	const textRef = useRef<typeof TroikaText>(null);
	const meshRef = useRef<InstancedMesh>(null);
	const tickRef = useRef({ lastTick: 0, lastSelectedText: '' });
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

	useEffect(() => {
		if (!defined(groupRef.current)) {
			return;
		}

		groupRef.current.position.set(position.x, position.y, position.z);
		groupRef.current.translateX(translate.x);
		groupRef.current.translateY(translate.y);
		groupRef.current.translateZ(translate.z);
		groupRef.current.rotation.y = rotationY;
	}, [position, translate, rotationY]);

	useFrame(({ clock }) => {
		if (
			!defined(textRef.current) ||
			!defined(meshRef.current) ||
			!defined(getSelectionRects) ||
			selectionIndexes.length === 0 ||
			clock.elapsedTime < tickRef.current.lastTick + TICK_SEC
		) {
			return;
		}

		tickRef.current.lastTick = clock.elapsedTime;

		if (tickRef.current.lastSelectedText !== selectedText) {
			for (let i = 0; i < selectionIndexes.length; i++) {
				// considering word selection (line doesn't break in Text), so we only need first occurrence
				const [{ left, right, top, bottom }]: [
					{ left: number; right: number; top: number; bottom: number },
				] = getSelectionRects(
					textRef.current.textRenderInfo,
					selectionIndexes[i],
					selectionIndexes[i] + selectedText.length,
				);

				const width = right - left;
				const height = top - bottom;
				const posX = width / 2 + left;
				const posY = height / 2 + bottom;
				object3D.position.set(posX, posY, 0.0005); // adjust z position closer to text
				object3D.scale.set(width * 1000, height * 1000, 1000); // 1000 factor since geometry starts at 0.001
				object3D.updateMatrix();
				meshRef.current.setMatrixAt(i, object3D.matrix);
			}
			meshRef.current.instanceMatrix.needsUpdate = true;
			tickRef.current.lastSelectedText = selectedText;
		}
	});

	return (
		<group ref={groupRef}>
			<Text ref={textRef} fontSize={0.05} color={defaultThemeColor.editor.foreground}>
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
};
