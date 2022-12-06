import { ThreeEvent, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { perfTestCubeGeometry } from '@/drawables/utils/geometries';

interface SampleBoxesProps {
	count?: number;
	object3D?: Object3D;
}

function getRandomPosition(): number {
	return Math.random() * 40 - 20;
}

function mountPositions(count: number): Array<[number, number, number]> {
	const result: Array<[number, number, number]> = [];
	for (let i = 0; i < count; i++) {
		result.push([getRandomPosition(), getRandomPosition(), getRandomPosition()]);
	}
	return result;
}

export const SampleBoxes: React.FC<SampleBoxesProps> = ({
	count = 1000,
	object3D = new Object3D(),
}) => {
	const [hovered, setHovered] = useState<number>();
	const meshRef = useRef<InstancedMesh>(null);
	const objectPositions = useMemo(() => mountPositions(count), [count]);

	useFrame(() => {
		// Set positions
		for (let i = 0; i < count; i++) {
			object3D.position.set(objectPositions[i][0], objectPositions[i][1], objectPositions[i][2]);

			// Make them all spinning
			if (i === 0) {
				object3D.rotateY(Math.PI / 360);
			}

			object3D.scale.set(1, 1, 1);
			if (i === hovered) {
				object3D.scale.set(1.25, 1.25, 1.25);
			}

			object3D.updateMatrix();
			meshRef?.current?.setMatrixAt(i, object3D.matrix);
		}
		// Update the instance
		if (meshRef?.current?.instanceMatrix != null) {
			meshRef.current.instanceMatrix.needsUpdate = true;
		}
	});

	const onCubeHover = (e: ThreeEvent<PointerEvent>) => {
		setHovered(e.instanceId);
		e.stopPropagation();
	};

	const onCubeBlur = (e: ThreeEvent<PointerEvent>) => {
		setHovered(undefined);
		e.stopPropagation();
	};

	return (
		<instancedMesh
			ref={meshRef}
			args={[perfTestCubeGeometry, undefined, count]}
			onPointerOver={onCubeHover}
			onPointerOut={onCubeBlur}
		>
			<meshPhongMaterial color="#708090" />
		</instancedMesh>
	);
};
