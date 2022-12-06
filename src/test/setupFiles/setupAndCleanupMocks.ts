import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
	// Mock scheduler to test React features
	vi.mock('scheduler', () => require('scheduler/unstable_mock'));
});

afterEach(() => {
	// https://vitest.dev/api/vi.html#vi-clearallmocks
	vi.clearAllMocks();
});
