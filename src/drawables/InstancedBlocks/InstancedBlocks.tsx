import { Text } from '@react-three/drei';
import React, { createRef, useEffect, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { defaultBoxGeometry, defaultBoxSize } from '../utils/geometries';
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

interface InstancedBlocksProps {
	blocks: Block[];
}

export const InstancedBlocks: React.FC<InstancedBlocksProps> = ({ blocks }) => {
	const meshRef = useRef<InstancedMesh>(null);
	const textRefs = useRef<any[]>([]); // forcing any here - Text from @react-three/drei doesn't have type in its ref

	// each block may have a text, each text has a ref
	blocks?.forEach((_block) => textRefs.current.push(createRef()));

	useEffect(() => {
		if (meshRef.current === null) {
			return;
		}

		const object3D = new Object3D();
		let lastBlockRotation = 0;
		for (let idx = 0; idx < blocks.length; idx++) {
			const {
				position = { x: 0, y: 0, z: 0 },
				scale = { width: 1, height: 1, depth: 1 },
				rotationY = 0,
				text = '',
			} = blocks[idx];

			// setting blocks
			object3D.position.set(position.x, position.y, position.z);
			object3D.scale.set(scale.width, scale.height, scale.depth);

			// object3D keeps last rotation, need to revert and apply current
			object3D.rotateY(rotationY - lastBlockRotation);
			lastBlockRotation = rotationY;

			object3D.updateMatrix();
			meshRef.current.setMatrixAt(idx, object3D.matrix);

			// setting text
			// only front face for now
			if (text?.length > 0) {
				const textFace = textRefs.current[idx].current;
				textFace.position.set(position.x, position.y, position.z);
				textFace.geometry.translate(0, 0, defaultBoxSize / 2 + 0.001);
				textFace.rotateY(rotationY);
			}
		}
		// update the instance
		meshRef.current.instanceMatrix.needsUpdate = true;
	}, [blocks]);

	return (
		<>
			<instancedMesh ref={meshRef} args={[defaultBoxGeometry, undefined, blocks.length]}>
				<meshPhongMaterial color="#708090" />
			</instancedMesh>
			{blocks.map(
				({ text = '' }, blockIdx) =>
					text.length > 0 && (
						<Text
							key={`b-${blockIdx}`}
							ref={textRefs.current[blockIdx]}
							color="#000"
							fontSize={0.05}
						>
							{text}
						</Text>
					),
			)}
		</>
	);
};
