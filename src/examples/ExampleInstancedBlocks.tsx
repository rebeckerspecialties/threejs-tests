import React from 'react';
import { Block, InstancedBlocks } from '../drawables/InstancedBlocks/InstancedBlocks';

export const ExampleInstancedBlocks: React.FC = () => {
	const blocks: Block[] = [
		{
			position: { x: 0, y: 0.5, z: -2 },
			text: 'Sample text1',
		},
		{
			position: { x: -1, y: 0.5, z: -2 },
			text: 'Sample text',
			rotationY: (75 * Math.PI) / 180,
		},
		{
			position: { x: 1, y: 0.5, z: -2 },
			text: 'Sample text',
			rotationY: (-75 * Math.PI) / 180,
		},
		{
			position: { x: 1, y: 1.5, z: -2 },
			text: 'Sample text',
			rotationY: (45 * Math.PI) / 180,
		},
		{
			position: { x: 0, y: 1.5, z: -2 },
			text: 'Sample text',
		},
		{
			position: { x: -1, y: 1.5, z: -2 },
			text: 'Sample text',
			rotationY: (-45 * Math.PI) / 180,
		},
		{
			position: { x: 1, y: 2.5, z: -2 },
			text: 'Sample text',
			rotationY: (225 * Math.PI) / 180,
		},
		{
			position: { x: 0, y: 2.5, z: -2 },
			text: 'Sample text',
			rotationY: Math.PI,
		},
		{
			position: { x: -1, y: 2.5, z: -2 },
			text: 'Sample text',
			rotationY: (135 * Math.PI) / 180,
		},
	];

	return <InstancedBlocks blocks={blocks} />;
};
