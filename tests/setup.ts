// Test setup file for Vitest
// Set up environment defaults or global mocks if needed
(process.env as Record<string, string | undefined>).NODE_ENV = 'test';

if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'undefined') {
  (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => '';
}
if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'undefined') {
  (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
}
