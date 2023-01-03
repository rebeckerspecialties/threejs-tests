import React, { useEffect, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { HighlightedText } from '../HighlightedText/HighlightedText';
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
			} = blocks[idx];

			// setting blocks
			object3D.position.set(position.x, position.y, position.z);
			object3D.scale.set(scale.width, scale.height, scale.depth);

			// object3D keeps last rotation, need to revert and apply current
			object3D.rotateY(rotationY - lastBlockRotation);
			lastBlockRotation = rotationY;

			object3D.updateMatrix();
			meshRef.current.setMatrixAt(idx, object3D.matrix);
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
				({ text = '', position = { x: 0, y: 0, z: 0 }, rotationY = 0 }, blockIdx) =>
					text.length > 0 && (
						<HighlightedText
							key={`t-${blockIdx}`}
							text={text}
							position={position}
							rotationY={rotationY}
							translate={{ x: 0, y: 0, z: defaultBoxSize / 2 + 0.011 }}
						/>
					),
			)}
		</>
	);
};
