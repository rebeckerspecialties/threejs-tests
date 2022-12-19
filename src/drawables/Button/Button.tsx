import { Text } from '@react-three/drei';
import { BoxGeometryProps, MeshPhongMaterialProps, MeshProps } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import React, { useState } from 'react';
import { Box } from '@/drawables/Box/Box';

type ButtonProps = Pick<MeshProps, 'position'> &
	Pick<MeshPhongMaterialProps, 'color'> & {
		size: BoxGeometryProps['args'];
		children?: string;
	};

export const Button: React.FC<ButtonProps> = ({ position, size, children }) => {
	// hard coding some stuff for now - experimenting
	const [hover, setHover] = useState(false);
	const [color, setColor] = useState(0x123456);
	const [isRotating, setIsRotating] = useState(false);

	const onSelect = () => {
		setColor((Math.random() * 0xffffff) | 0);
		setIsRotating(!isRotating);
	};

	return (
		<Interactive onSelect={onSelect} onHover={() => setHover(true)} onBlur={() => setHover(false)}>
			<Box
				color={color}
				scale={hover ? [1.25, 1.25, 1.25] : [1, 1, 1]}
				size={size}
				position={position}
				rotating={isRotating}
			>
				<Text
					position={[0, 0, (size?.[2] ?? 0.1) / 2 + 0.01]}
					fontSize={0.05}
					color="#000"
					anchorX="center"
					anchorY="middle"
				>
					{children}
				</Text>
			</Box>
		</Interactive>
	);
};
