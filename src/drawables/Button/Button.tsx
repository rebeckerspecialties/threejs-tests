import { Box } from '@/drawables/Box/Box';
import { Text } from '@react-three/drei';
import {
	BoxGeometryProps,
	MeshPhongMaterialProps,
	MeshProps,
	ThreeEvent,
} from '@react-three/fiber';
import { Interactive, XRInteractionEvent } from '@react-three/xr';
import React, { useState } from 'react';

type ButtonProps = Pick<MeshProps, 'position'> &
	Pick<MeshPhongMaterialProps, 'color'> & {
		size: BoxGeometryProps['args'];
		children?: string;
		onClick?: (e: ThreeEvent<MouseEvent>) => void;
		onSelect?: (e: XRInteractionEvent) => void;
	};

export const Button: React.FC<ButtonProps> = ({ position, size, children, onClick, onSelect }) => {
	const [hover, setHover] = useState(false);

	return (
		<Interactive onSelect={onSelect} onHover={() => setHover(true)} onBlur={() => setHover(false)}>
			<Box
				color={0x123456}
				scale={hover ? [1.25, 1.25, 1.25] : [1, 1, 1]}
				size={size}
				position={position}
				onClick={onClick}
				onPointerOver={() => setHover(true)}
				onPointerOut={() => setHover(false)}
			>
				<Text
					position={[0, 0, (size?.[2] ?? 0.1) / 2 + 0.01]}
					fontSize={0.06}
					color={0xffffff}
					anchorX="center"
					anchorY="middle"
				>
					{children}
				</Text>
			</Box>
		</Interactive>
	);
};
