import { BoxGeometryProps, MeshPhongMaterialProps, MeshProps, useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { Mesh } from 'three';

type Props = MeshProps &
	Pick<MeshPhongMaterialProps, 'color'> & {
		size: BoxGeometryProps['args'];
		rotating?: boolean;
	};

export const Box: React.FC<Props> = ({ size, color, rotating, children, ...meshProps }) => {
	const meshRef = useRef<Mesh>(null);

	useFrame(({ clock }) => {
		if ((rotating ?? false) && meshRef?.current?.rotation != null) {
			meshRef.current.rotation.y = clock.getElapsedTime();
		}
	});

	return (
		<mesh ref={meshRef} {...meshProps}>
			<boxGeometry args={size} />
			<meshPhongMaterial color={color} />
			{children}
		</mesh>
	);
};
