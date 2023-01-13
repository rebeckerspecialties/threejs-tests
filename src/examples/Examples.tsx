import { Button } from '@/drawables';
import React, { useState } from 'react';
import { ExampleBatchTexts } from './ExampleBatchTexts';
import { ExampleHighlightedText } from './ExampleHighlightedText';
import { ExampleInstancedBlocks } from './ExampleInstancedBlocks';

type AvailableExamples = null | 'InstancedBlocks' | 'BatchTexts' | 'HighlightedText';

export const Examples: React.FC = () => {
	const [showExample, setShowExample] = useState<AvailableExamples>(null);

	const toggleExample = (example: AvailableExamples) => {
		setShowExample(showExample !== example ? example : null);
	};

	return (
		<>
			<Button
				size={[1, 0.5, 0.1]}
				position={[-2, 0.5, -2]}
				color={0xffffff}
				onClick={() => toggleExample('InstancedBlocks')}
				onSelect={() => toggleExample('InstancedBlocks')}
			>
				Instanced Blocks
			</Button>
			<Button
				size={[1, 0.5, 0.1]}
				position={[-0.5, 0.5, -2]}
				color={0xffffff}
				onClick={() => toggleExample('BatchTexts')}
				onSelect={() => toggleExample('BatchTexts')}
			>
				Batched Texts
			</Button>
			<Button
				size={[1, 0.5, 0.1]}
				position={[1, 0.5, -2]}
				color={0xffffff}
				onClick={() => toggleExample('HighlightedText')}
				onSelect={() => toggleExample('HighlightedText')}
			>
				Highlighted Text
			</Button>

			{showExample === 'BatchTexts' && <ExampleBatchTexts />}
			{showExample === 'HighlightedText' && <ExampleHighlightedText />}
			{showExample === 'InstancedBlocks' && <ExampleInstancedBlocks />}
		</>
	);
};
