import { GraphBlock, NodeGraph } from '@/drawables/NodeGraph/NodeGraph';
import React from 'react';

export const GraphExample: React.FC = () => {
	const blocks: GraphBlock[] = [
		{
			text: 'Sample text',
			source: 0,
		},
		{
			text: 'Sample text',
			source: 1,
			target: 0,
		},
		{
			text: 'Sample text',
			source: 2,
			target: 0,
		},
		{
			text: 'Sample text',
			source: 3,
			target: 0,
		},
		{
			text: 'Sample text',
			source: 4,
			target: 3,
		},
		{
			text: 'Sample text',
			source: 5,
			target: 0,
		},
		{
			text: 'Sample text',
			source: 6,
			target: 5,
		},
		{
			text: 'Sample text',
			source: 7,
			target: 6,
		},
	];

	return <NodeGraph blocks={blocks} />;
};
