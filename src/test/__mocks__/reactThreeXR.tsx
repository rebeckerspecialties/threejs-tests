import React from 'react';
import { vi } from 'vitest';

vi.mock('@react-three/xr', async () => {
	return {
		__esModule: true,
		Interactive: ({ children }: { children: React.ReactNode }) => (
			<React.Fragment>{children}</React.Fragment>
		),
	};
});
