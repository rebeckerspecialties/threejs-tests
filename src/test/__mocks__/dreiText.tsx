import React from 'react';
import { Color } from 'three';
import { vi } from 'vitest';

interface Props {
	fontSize?: number;
	color?: Color;
	children: string;
}

const DreiTextMock = React.forwardRef(function FakeDreiText(
	props: Props,
	ref: React.ForwardedRef<any>,
) {
	return <group ref={ref} name={`DreiTextMock-${props.children}`} />;
});
vi.mock('@react-three/drei', async () => {
	const { forwardRef } = await vi.importActual<typeof import('react')>('react');
	return {
		__esModule: true,
		Text: forwardRef((props: Props, ref) => <DreiTextMock {...props} ref={ref} />),
	};
});
