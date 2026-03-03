import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SvelteKit modules if needed
vi.mock('$app/environment', () => ({
    browser: true,
    dev: true,
    building: false,
    version: 'any'
}));
