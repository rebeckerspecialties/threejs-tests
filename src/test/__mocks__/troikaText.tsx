import { Mesh } from 'three';

class TextMock extends Mesh {
	text = '';
	fontSize = 14;
	color = 'black';
	textRenderInfo = {
		caretPositions: [],
		caretHeight: 0,
	};

	setText(newText: string) {
		this.text = newText;
	}

	setFontSize(newSize: number) {
		this.fontSize = newSize;
	}

	setColor(newColor: string) {
		this.color = newColor;
	}

	sync = vi.fn();
}

vi.mock('troika-three-text', async () => {
	const { getSelectionRects } = await vi.importActual<typeof import('troika-three-text')>(
		'troika-three-text',
	);
	return {
		Text: TextMock,
		getSelectionRects,
	};
});
