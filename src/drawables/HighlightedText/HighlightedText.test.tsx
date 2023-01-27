// This needs to be imported at the top of the file or we will have a import race condition
import '@/test/__mocks__/dreiText';

// Add new imports below here
import { TextProviderWrapper } from '@/test/utils/TextProviderWrapper';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { InstancedMesh } from 'three';
import { describe, expect, it } from 'vitest';
import { HighlightedText } from './HighlightedText';

describe('HighlightedText', () => {
	const textContent = 'aFakeText';

	async function createTestRenderer(text: string, search: string) {
		const result = await ReactThreeTestRenderer.create(
			<TextProviderWrapper key="t0" searchText={search}>
				<HighlightedText key="t1" position={{ x: 0, y: 0, z: 0 }} text={text} />
			</TextProviderWrapper>,
		);

		return result;
	}

	it('should render', async () => {
		const renderer = await createTestRenderer(textContent, '');
		const highlightedTextObj = renderer.scene.children[0].children[0];
		expect(highlightedTextObj?.props?.name).toMatch(/^DreiTextMock/);
		expect(renderer.scene.children.length).toBe(1);
		expect(renderer.scene.children[0].children.length).toBe(1);
	});

	it('should receive correct text', async () => {
		const renderer = await createTestRenderer(textContent, '');
		const highlightedTextObj = renderer.scene.children[0].children[0];
		// Mocked @react-three/drei receives text and overwrites name in props
		expect(highlightedTextObj?.props?.name).toBe(`DreiTextMock-${textContent}`);
	});

	it('should find no occurrence for highlight', async () => {
		const renderer = await createTestRenderer(textContent, 'ThisShouldNotHighlight');
		const highlightBlocksMeshObj = renderer.scene.children[0].children[1];
		expect(highlightBlocksMeshObj).toBeUndefined();
	});

	it('should find one occurrence for highlight', async () => {
		const renderer = await createTestRenderer(textContent, 'Fake');
		const highlightBlocksMeshObj = renderer.scene.children[0].children[1];
		expect((highlightBlocksMeshObj.instance as InstancedMesh).isInstancedMesh).toBe(true);
		expect((highlightBlocksMeshObj.instance as InstancedMesh).count).toBe(1);
	});

	it('should find more than one occurrence for highlight', async () => {
		const renderer = await createTestRenderer(textContent, 'a');
		const highlightBlocksMeshObj = renderer.scene.children[0].children[1];
		expect((highlightBlocksMeshObj.instance as InstancedMesh).isInstancedMesh).toBe(true);
		expect((highlightBlocksMeshObj.instance as InstancedMesh).count).toBe(2);
	});

	// Test created from a bug found during manual testing
	it('should be consistent between search changes', async () => {
		const renderer = await createTestRenderer(textContent, 'a');
		let highlightBlocksMeshObj = renderer.scene.children[0].children[1];
		expect((highlightBlocksMeshObj.instance as InstancedMesh).isInstancedMesh).toBe(true);
		expect((highlightBlocksMeshObj.instance as InstancedMesh).count).toBe(2);

		await renderer.update(
			<TextProviderWrapper key="t0" searchText="ThisShouldNotHighlight">
				<HighlightedText key="t1" position={{ x: 0, y: 0, z: 0 }} text={textContent} />
			</TextProviderWrapper>,
		);
		highlightBlocksMeshObj = renderer.scene.children[0].children[1];
		expect(highlightBlocksMeshObj).toBeUndefined();

		await renderer.update(
			<TextProviderWrapper key="t0" searchText="Fake">
				<HighlightedText key="t1" position={{ x: 0, y: 0, z: 0 }} text={textContent} />
			</TextProviderWrapper>,
		);
		highlightBlocksMeshObj = renderer.scene.children[0].children[1];
		expect((highlightBlocksMeshObj.instance as InstancedMesh).isInstancedMesh).toBe(true);
		expect((highlightBlocksMeshObj.instance as InstancedMesh).count).toBe(1);
	});
});
