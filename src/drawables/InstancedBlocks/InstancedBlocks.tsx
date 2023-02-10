import { HighlightedText } from '@/drawables/HighlightedText/HighlightedText';
import { getBlockScaleFromText } from '@/drawables/utils/block';
import { defaultBlockColor, findMatchBlockColor } from '@/drawables/utils/colors';
import { defaultBoxGeometry, defaultBoxSize } from '@/drawables/utils/geometries';
import { defaultBlockMaterial } from '@/drawables/utils/materials';
import { defined } from '@/drawables/utils/utils';
import { useTextSelectionContext } from '@/providers';
import { useFrame } from '@react-three/fiber';
import React, { createRef, RefObject, useCallback, useLayoutEffect, useRef } from 'react';
import { Color, Group, InstancedMesh, Object3D, Vector3 } from 'three';

export interface Block {
	position?: {
		x: number;
		y: number;
		z: number;
	};
	scale?: {
		width: number;
		height: number;
		depth: number;
	};
	rotationY?: number;
	// text only on front face for now
	text?: string;
}

interface Props {
	blocks: Block[];
}

const SCALE_MOD = 0.1;

export const InstancedBlocks: React.FC<Props> = ({ blocks }) => {
	const { selectedText } = useTextSelectionContext();
	const meshRef = useRef<InstancedMesh>(null);
	const textPositionRefs: Array<RefObject<Group>> = blocks.map(() => createRef());

	useLayoutEffect(() => {
		if (meshRef.current === null) {
			return;
		}

		const object3D = new Object3D();
		for (let idx = 0; idx < blocks.length; idx++) {
			const {
				position = { x: 0, y: 0, z: 0 },
				scale = { width: 0, height: 0, depth: 1 },
				rotationY = 0,
				text = '',
			} = blocks[idx];
			let scaleMod = 0;
			let blockColor: Color = defaultBlockColor;

			if (selectedText.length > 0 && text.includes(selectedText)) {
				scaleMod = SCALE_MOD;
				blockColor = findMatchBlockColor;
			}

			// calculate dynamic block size from its text content
			const { x: textWidth, y: textHeight } = getBlockScaleFromText(text);

			// setting blocks
			object3D.position.set(position.x, position.y, position.z);
			object3D.scale.set(
				scale.width + scaleMod + textWidth,
				scale.height + scaleMod + textHeight,
				scale.depth + scaleMod,
			);
			object3D.rotation.y = rotationY;

			object3D.updateMatrix();
			meshRef.current.setColorAt(idx, blockColor);
			meshRef.current.setMatrixAt(idx, object3D.matrix);
		}
		// update the instance
		meshRef.current.instanceMatrix.needsUpdate = true;
		if (defined(meshRef.current.instanceColor)) {
			meshRef.current.instanceColor.needsUpdate = true;
		}
	}, [blocks, selectedText]);

	useFrame(() => {
		for (let idx = 0; idx < blocks.length; idx++) {
			const { rotationY = 0, scale, text, position = { x: 0, y: 0, z: 0 } } = blocks[idx];

			if (defined(textPositionRefs?.[idx]?.current)) {
				textPositionRefs[idx].current?.position.set(position.x, position.y, position.z);
				textPositionRefs[idx].current?.translateOnAxis(
					new Vector3(0, 0, 1),
					getZTranslation(text, scale),
				);
				textPositionRefs[idx].current?.setRotationFromAxisAngle(new Vector3(0, 1, 0), rotationY);
			}
		}
	});

	const getZTranslation = useCallback(
		(
			text: string = '',
			scale: { width: number; height: number; depth: number } = { width: 1, height: 1, depth: 1 },
		) => {
			if (selectedText.length > 0 && text.includes(selectedText)) {
				return (defaultBoxSize * (scale.depth + SCALE_MOD)) / 2 + 0.011;
			} else {
				return (defaultBoxSize * scale.depth) / 2 + 0.011;
			}
		},
		[selectedText],
	);

	return (
		<>
			<instancedMesh
				ref={meshRef}
				args={[defaultBoxGeometry, defaultBlockMaterial, blocks.length]}
			/>
			{blocks.map(
				({ text = '', position = { x: 0, y: 0, z: 0 } }, blockIdx) =>
					text.length > 0 && (
						<HighlightedText
							key={`t-${blockIdx}`}
							ref={textPositionRefs[blockIdx]}
							text={text}
							position={{
								x: position.x,
								y: position.y,
								z: position.z,
							}}
						/>
					),
			)}
		</>
	);
};
