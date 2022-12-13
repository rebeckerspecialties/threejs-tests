import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { Box } from '../Box/Box';

export const ImmersiveStats: React.FC = () => {
	// ref in Text is unknown :( - forcing the prop I need
	const fpsText = useRef<{ text?: string }>({ text: ' FPS' });
	const frameCount = useRef(0);
	const lastFPS = useRef(0);
	const lastFPSUpdate = useRef(0);

	useFrame(() => {
		const now = performance.now();
		frameCount.current++;

		if (now >= lastFPSUpdate.current + 1000) {
			const fps = Math.round(frameCount.current / ((now - lastFPSUpdate.current) / 1000));
			if (lastFPS.current !== fps) {
				fpsText.current.text = `${fps} FPS`;
				lastFPS.current = fps;
			}
			lastFPSUpdate.current = now;
			frameCount.current = 0;
		}
	});

	return (
		<Box position={[-0.2, 0.2, -1]} size={[0.5, 0.2, 0.01]} color="#ccc">
			<Text
				position={[-0.23, 0.07, 0.01]}
				fontSize={0.03}
				color="#000"
				anchorX="left"
				anchorY="middle"
			>
				Stats:
			</Text>
			<Text
				ref={fpsText}
				position={[-0.2, 0.02, 0.01]}
				fontSize={0.03}
				color="#000"
				anchorX="left"
				anchorY="middle"
			>
				{''}
			</Text>
		</Box>
	);
};
