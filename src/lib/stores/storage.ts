export interface StorageInterface {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
	clear(): void;
}

export class LocalStorageAdapter implements StorageInterface {
	getItem(key: string): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(key);
	}

	setItem(key: string, value: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem(key, value);
	}

	removeItem(key: string): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(key);
	}

	clear(): void {
		if (typeof window === 'undefined') return;
		localStorage.clear();
	}
}

export class MockStorageAdapter implements StorageInterface {
	private storage = new Map<string, string>();

	getItem(key: string): string | null {
		return this.storage.get(key) || null;
	}

	setItem(key: string, value: string): void {
		this.storage.set(key, value);
	}

	removeItem(key: string): void {
		this.storage.delete(key);
	}

	clear(): void {
		this.storage.clear();
	}

	// Test helper to inspect storage
	getAllItems(): Record<string, string> {
		return Object.fromEntries(this.storage);
	}
}
