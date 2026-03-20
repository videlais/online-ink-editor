import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Stub DOM APIs not implemented in jsdom that CodeMirror relies on
// during its requestAnimationFrame measurement cycle.
Range.prototype.getClientRects = () => ({
  length: 0,
  item: () => null,
  [Symbol.iterator]: function* () {},
});
Range.prototype.getBoundingClientRect = () => ({
  x: 0, y: 0, width: 0, height: 0,
  top: 0, right: 0, bottom: 0, left: 0,
  toJSON: () => '{}',
});
document.elementFromPoint = () => null;

afterEach(() => {
  cleanup();
});
