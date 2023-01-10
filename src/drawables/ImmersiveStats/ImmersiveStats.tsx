import { Box } from '@/drawables/Box/Box';
import { formatBytes } from '@/drawables/utils/formats';
import useGetMemoryStats from '@/drawables/utils/ImmersiveStats/hooks/useGetMemoryStats';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';

export const ImmersiveStats: React.FC = () => {
	// ref in Text is unknown :( - forcing the prop I need
	const fpsText = useRef<{
		text?: string;
	}>({
		text: ' FPS',
	});
	const frameCount = useRef(0);
	const lastFPS = useRef(0);
	const lastFPSUpdate = useRef(0);
	const lastMemoryUpdate = useRef<{
		text?: string;
		color?: string;
	}>({
		text: '',
	});

	const { measuredMemory, loading } = useGetMemoryStats();

	useFrame(() => {
		const now = performance.now();
		frameCount.current++;

		if (now >= lastFPSUpdate.current + 1000) {
			const fps = Math.round(frameCount.current / ((now - lastFPSUpdate.current) / 1000));
			if (lastFPS.current !== fps) {
				fpsText.current.text = `FPS: ${fps}`;
				lastFPS.current = fps;
			}
			lastFPSUpdate.current = now;
			frameCount.current = 0;
		}
	});

	useEffect(() => {
		if (loading ?? false) {
			lastMemoryUpdate.current.text = 'Memory usage: calculating...';
			return;
		}

		if (measuredMemory == null) {
			lastMemoryUpdate.current.text = 'Memory usage: not supported';
			return;
		}

		lastMemoryUpdate.current.text = `Memory usage ${
			measuredMemory?.legacyResult ? '(legacy measurement)' : ''
		}: ${formatBytes(measuredMemory?.result ?? 0)}`;

		lastMemoryUpdate.current.color = measuredMemory?.legacyResult ? '#f00' : '#000';
	}, [loading, measuredMemory]);

	return (
		<Box position={[-0.1, 0.2, -1]} size={[0.5, 0.2, 0.01]} color="#ccc">
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
				position={[-0.21, 0.02, 0.01]}
				fontSize={0.025}
				color="#000"
				anchorX="left"
				anchorY="middle"
			>
				{''}
			</Text>
			<Text
				ref={lastMemoryUpdate}
				position={[-0.21, -0.02, 0.01]}
				fontSize={0.025}
				color="#000"
				anchorX="left"
				anchorY="middle"
			>
				Memory usage: calculating...
			</Text>
		</Box>
	);
};
