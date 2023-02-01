import { Button } from '@/drawables';
import { GraphBlock, NodeGraph } from '@/drawables/NodeGraph/NodeGraph';
import { useTextSelectionContext } from '@/providers/TextSelectionProvider/TextSelectionProvider';
import React from 'react';

export const GraphExample: React.FC = () => {
	const { setSelectedText } = useTextSelectionContext();

	const blocks: GraphBlock[] = [
		{
			text: 'Lorem ipsum dolor sit amet',
			source: 0,
			target: 1,
		},
		{
			text: 'At vero eos et accusamus et\niusto odio dignissimos ducimus\nqui tempor praesentium.',
			source: 1,
			target: 2,
		},
		{
			text: 'Lorem ipsum',
			source: 2,
			target: 3,
		},
		{
			text: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor.',
			source: 3,
			target: 4,
		},
		{
			text: 'Test',
			source: 4,
			target: 0,
		},
	];

	return (
		<>
			<NodeGraph blocks={blocks} />
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 1, -2]}
				onClick={() => setSelectedText('Lorem')}
				onSelect={() => setSelectedText('Lorem')}
			>
				select &quot;Lorem&quot;
			</Button>
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 0.5, -2]}
				onClick={() => setSelectedText('tempor')}
				onSelect={() => setSelectedText('tempor')}
			>
				select &quot;tempor&quot;
			</Button>
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 0, -2]}
				onClick={() => setSelectedText('do')}
				onSelect={() => setSelectedText('do')}
			>
				select &quot;do&quot;
			</Button>
		</>
	);
};
