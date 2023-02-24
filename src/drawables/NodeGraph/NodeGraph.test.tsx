// This needs to be imported at the top of the file or we will have a import race condition
import '@/test/__mocks__/dreiText';
import '@/test/__mocks__/reactThreeXR';

import ReactThreeTestRenderer from '@react-three/test-renderer';
import { InstancedMesh } from 'three';
import { GraphBlock, NodeGraph } from './NodeGraph';

import { TextProviderWrapper } from '@/test/utils/TextProviderWrapper';

// mock blocks for the graph
const blocks: GraphBlock[] = [
	{
		text: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor.',
		source: 0,
		target: 1,
	},
	{
		text: 'At vero eos et accusamus et\niusto odio dignissimos ducimus\nqui tempor praesentium.',
		source: 1,
		target: 2,
	},
	{
		text: 'tests',
		source: 2,
		target: 3,
	},
	{
		text: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor.',
		source: 3,
		target: 4,
	},
	{
		text: 'At vero eos et accusamus et\niusto odio dignissimos ducimus\nqui tempor praesentium.',
		source: 4,
		target: 0,
	},
];

interface InstancedMeshNode extends InstancedMesh {
	__data?: {
		index: number;
		x: number;
		y: number;
		z: number;
	};
}

async function createTestRenderer(search: string) {
	const result = await ReactThreeTestRenderer.create(
		<TextProviderWrapper key="t0" searchText={search}>
			<NodeGraph blocks={blocks} />
		</TextProviderWrapper>,
	);

	// advance frames to render the graph
	await ReactThreeTestRenderer.act(async () => {
		vi.useFakeTimers();
		vi.runAllTimers();
	});

	return result;
}

describe('NodeGraph', () => {
	it('should render the correct amount of blocks, texts meshes, and lines in the graph', async () => {
		const renderer = await createTestRenderer('Fake');

		// get instanced mesh from children of the graph and check if the correct amount of blocks are rendered
		// nodegraph is always the last one of the scene.children (first ones are text groups)
		const instancedMesh = renderer.scene.children[renderer.scene.children.length - 1].children[0];

		expect((instancedMesh?.instance as InstancedMeshNode).count).toBe(blocks.length);

		// check if the correct amount of texts are rendered
		// get children but skip the last one as it is the graph itself
		const children = renderer.scene.children.slice(0, renderer.scene.children.length - 1);

		expect(children.length).toBe(blocks.length);

		// check if the correct amount of lines are rendered
		const lines = renderer.scene.children[renderer.scene.children.length - 1].children.filter(
			(child) => child._fiber.name !== 'graph-blocks',
		);

		expect(lines.length).toBe(blocks.length - 1);
	});

	it('should mantain the same position of the blocks when a rerender happens', async () => {
		const renderer = await createTestRenderer('Fake');
		await ReactThreeTestRenderer.act(async () => {
			await renderer.advanceFrames(4000, 1);
		});

		// get instanced mesh from children of the graph and check if the correct amount of blocks are rendered
		// nodegraph is always the last one of the scene.children (first ones are text groups)
		let instancedMesh = renderer.scene.children[renderer.scene.children.length - 1].children[0]
			.instance as InstancedMeshNode;

		// get the position of the first block - this is the one that will be used to compare
		const firstPosition = {
			x: instancedMesh.__data?.x.toFixed(),
			y: instancedMesh.__data?.y.toFixed(),
			z: instancedMesh.__data?.z.toFixed(),
		};

		// rerender the graph
		await renderer.update(
			<TextProviderWrapper key="t0" searchText={'search'}>
				<NodeGraph blocks={blocks} />
			</TextProviderWrapper>,
		);
		await ReactThreeTestRenderer.act(async () => {
			await renderer.advanceFrames(4000, 1);
		});
		instancedMesh = renderer.scene.children[renderer.scene.children.length - 1].children[0]
			.instance as InstancedMeshNode;

		const secondPosition = {
			x: instancedMesh.__data?.x.toFixed(),
			y: instancedMesh.__data?.y.toFixed(),
			z: instancedMesh.__data?.z.toFixed(),
		};

		// check if the position remains the same
		expect(firstPosition).toEqual(secondPosition);
	});

	it('should render correctly the selected mesh instance when a word is selected', async () => {
		const renderer = await createTestRenderer('Lorem');
		await ReactThreeTestRenderer.act(async () => {
			await renderer.advanceFrames(1, 1);
		});

		// get instanced mesh from children and check if the correct amount of blocks are rendered
		const selectionInstancedMesh = renderer.scene.children[0].children[1]
			.instance as InstancedMeshNode;

		expect(selectionInstancedMesh.count).toBe(1);
		expect(renderer.scene.children[1].children.length).toBe(1);

		await renderer.update(
			<TextProviderWrapper key="t0" searchText={'accusamus'}>
				<NodeGraph blocks={blocks} />
			</TextProviderWrapper>,
		);
		await ReactThreeTestRenderer.act(async () => {
			await renderer.advanceFrames(1, 1);
		});

		const secondInstancedMesh = renderer.scene.children[1].children[1]
			.instance as InstancedMeshNode;

		expect(secondInstancedMesh.count).toBe(1);
		expect(renderer.scene.children[0].children.length).toBe(1);
	});
});
