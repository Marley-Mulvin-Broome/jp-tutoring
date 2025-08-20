import { beforeEach, vi } from 'vitest';

// Mock localStorage for unit tests
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
};

// Make localStorage available in tests
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
	writable: true
});

// Reset localStorage mock before each test
beforeEach(() => {
	localStorageMock.getItem.mockClear();
	localStorageMock.setItem.mockClear();
	localStorageMock.removeItem.mockClear();
	localStorageMock.clear.mockClear();
	localStorageMock.key.mockClear();
});

export { localStorageMock };
