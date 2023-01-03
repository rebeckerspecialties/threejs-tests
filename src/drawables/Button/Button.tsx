import { Box } from '@/drawables/Box/Box';
import { Text } from '@react-three/drei';
import { BoxGeometryProps, MeshPhongMaterialProps, MeshProps } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import React, { useState } from 'react';

type ButtonProps = Pick<MeshProps, 'position'> &
	Pick<MeshPhongMaterialProps, 'color'> & {
		size: BoxGeometryProps['args'];
		children?: string;
	} & { onClick: () => void };

export const Button: React.FC<ButtonProps> = ({ position, size, children, onClick }) => {
	// hard coding some stuff for now - experimenting
	const [hover, setHover] = useState(false);

	return (
		<Interactive onSelect={onClick} onHover={() => setHover(true)} onBlur={() => setHover(false)}>
			<Box
				color="#123456"
				scale={hover ? [1.2, 1.2, 1.2] : [1, 1, 1]}
				size={size}
				position={position}
				onClick={onClick}
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
