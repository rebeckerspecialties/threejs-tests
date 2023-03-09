import React from 'react';
import { Block, InstancedBlocks } from '../drawables/InstancedBlocks/InstancedBlocks';

export const ExampleHighlightedText: React.FC = () => {
	const blocks: Block[] = [
		{
			position: { x: 0, y: 0.5, z: -5 },
			text: 'Test text',
		},
		{
			position: { x: 0, y: 2, z: -5 },
			text: 'Test text',
		},
		{
			position: { x: 2, y: 2, z: -5 },
			text: 'Test text',
		},
	];

	return <InstancedBlocks blocks={blocks} />;
};
