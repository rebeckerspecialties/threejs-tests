import { Button } from '@/drawables';
import { useTextSelectionContext } from '@/providers/TextSelectionProvider/TextSelectionProvider';
import React, { useEffect } from 'react';
import { Block, InstancedBlocks } from '../drawables/InstancedBlocks/InstancedBlocks';

export const ExampleHighlightedText: React.FC = () => {
	const { setSelectedText } = useTextSelectionContext();

	const blocks: Block[] = [
		{
			position: { x: 0, y: 0.5, z: -5 },
			scale: { width: 2, height: 2, depth: 1 },
			text: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor.',
		},
		{
			position: { x: 0, y: 2, z: -5 },
			scale: { width: 2, height: 2, depth: 1 },
			text: 'At vero eos et accusamus et\niusto odio dignissimos ducimus\nqui tempor praesentium.',
		},
	];

	useEffect(() => {
		return function cleanup() {
			setSelectedText('');
		};
	}, [setSelectedText]);

	return (
		<>
			<InstancedBlocks blocks={blocks} />
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 1, -5]}
				onClick={() => setSelectedText('Lorem')}
				onSelect={() => setSelectedText('Lorem')}
			>
				select &quot;Lorem&quot;
			</Button>
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 0.5, -5]}
				onClick={() => setSelectedText('tempor')}
				onSelect={() => setSelectedText('tempor')}
			>
				select &quot;tempor&quot;
			</Button>
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 0, -5]}
				onClick={() => setSelectedText('eos')}
				onSelect={() => setSelectedText('eos')}
			>
				select &quot;eos&quot;
			</Button>
		</>
	);
};
