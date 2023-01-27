import { Object3D } from 'three';
import { vi } from 'vitest';

class TextMock extends Object3D {
	text = '';
	fontSize = 14;
	color = 'black';
	setText = vi.fn();
	setFontSize = vi.fn();
	setColor = vi.fn();
	sync = vi.fn();
}
vi.mock('troika-three-text', () => {
	const Text = vi.fn().mockReturnValue(new TextMock());
	return {
		Text,
		getSelectionRects: vi.fn().mockReturnValue([]),
		preloadFont: vi.fn().mockReturnValue(undefined),
	};
});
