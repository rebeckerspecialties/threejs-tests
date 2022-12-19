import React, { useRef } from 'react';
import { BoxGeometryProps, MeshPhongMaterialProps, MeshProps, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

type BoxProps = Pick<MeshProps, 'position' | 'scale' | 'children'> &
	Pick<MeshPhongMaterialProps, 'color'> & { size: BoxGeometryProps['args']; rotating?: boolean };

export const Box: React.FC<BoxProps> = ({ position, scale, size, color, children, rotating }) => {
	const meshRef = useRef<Mesh>(null);

	useFrame(({ clock }) => {
		if ((rotating ?? false) && meshRef?.current?.rotation != null) {
			meshRef.current.rotation.y = clock.getElapsedTime();
		}
	});

	return (
		<mesh ref={meshRef} scale={scale} position={position}>
			<boxGeometry args={size} />
			<meshPhongMaterial color={color} />
			{children}
		</mesh>
	);
};
