import { BatchText } from '@/drawables';
import React from 'react';
import { Block } from '../drawables/InstancedBlocks/InstancedBlocks';

export const ExampleBatchTexts: React.FC = () => {
	const blocks: Block[] = [];
	const xPos = -1.5;
	const yPos = 0;
	const zPos = -2;
	const max = 50;
	for (let i = 0; i < max; i++) {
		blocks.push({
			position: {
				x: xPos + 0.6 * (i % 10),
				y: yPos + 0.35 * Math.floor((i % 50) / 10),
				z: zPos - 1 * Math.floor(i / 50),
			},
			text: `Sample text ${i}`,
		});
	}

	return <BatchText blocks={blocks} />;
};
