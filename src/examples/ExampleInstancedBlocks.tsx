import { Button } from '@/drawables';
import { useTextSelectionContext } from '@/providers/TextSelectionProvider/TextSelectionProvider';
import React from 'react';
import { Block, InstancedBlocks } from '../drawables/InstancedBlocks/InstancedBlocks';

export const ExampleInstancedBlocks: React.FC = () => {
	const { setSelectedText } = useTextSelectionContext();

	const blocks: Block[] = [
		{
			position: { x: 0, y: 0.5, z: -2 },
			scale: { width: 2, height: 2, depth: 1 },
			text: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor.',
		},
		// {
		// 	position: { x: -1, y: 0.5, z: -2 },
		// 	text: 'Sample text',
		// 	rotationY: (75 * Math.PI) / 180,
		// },
		// {
		// 	position: { x: 1, y: 0.5, z: -2 },
		// 	text: 'Sample text',
		// 	rotationY: (-75 * Math.PI) / 180,
		// },
		// {
		// 	position: { x: 1, y: 1.5, z: -2 },
		// 	text: 'Sample text',
		// 	rotationY: (45 * Math.PI) / 180,
		// },
		{
			position: { x: 0, y: 2, z: -2 },
			scale: { width: 2, height: 2, depth: 1 },
			text: 'At vero eos et accusamus et\niusto odio dignissimos ducimus\nqui tempor praesentium.',
		},
		// {
		// 	position: { x: -1, y: 1.5, z: -2 },
		// 	text: 'Sample text',
		// 	rotationY: (-45 * Math.PI) / 180,
		// },
		// {
		// 	position: { x: 1, y: 2.5, z: -2 },
		// 	text: 'Sample text',
		// 	rotationY: (225 * Math.PI) / 180,
		// },
		// {
		// 	position: { x: 0, y: 2.5, z: -2 },
		// 	text: 'Sample text',
		// 	rotationY: Math.PI,
		// },
		// {
		// 	position: { x: -1, y: 2.5, z: -2 },
		// 	text: 'Sample text',
		// 	rotationY: (135 * Math.PI) / 180,
		// },
	];

	return (
		<>
			<InstancedBlocks blocks={blocks} />
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 1, -2]}
				onClick={() => setSelectedText('Lorem')}
			>
				select &quot;Lorem&quot;
			</Button>
			<Button
				size={[0.4, 0.3, 0.15]}
				position={[-1, 0.5, -2]}
				onClick={() => setSelectedText('tempor')}
			>
				select &quot;tempor&quot;
			</Button>
			<Button size={[0.4, 0.3, 0.15]} position={[-1, 0, -2]} onClick={() => setSelectedText('do')}>
				select &quot;do&quot;
			</Button>
		</>
	);
};
