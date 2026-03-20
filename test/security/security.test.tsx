import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { resolveIncludes } from '../../src/utils/includeResolver';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Suppress expected console errors during security tests
beforeEach(() => {
  localStorageMock.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Feature: Security Regression Tests', () => {
  describe('Scenario: XSS payloads in story output', () => {
    it('Given a story outputs HTML script tags, When rendered, Then they should be displayed as text not executed', async () => {
      const xssPayload = JSON.stringify([{
        id: '1',
        name: 'main.ink',
        content: '<script>alert("xss")</script>\n* [choice]\n  -> END',
      }]);
      localStorageMock.setItem('inkEditor_content', xssPayload);

      render(<App />);

      await waitFor(() => {
        // The script tag should be rendered as text content, not as an actual script element
        const storyOutput = document.querySelector('.story-output');
        expect(storyOutput).toBeInTheDocument();
      }, { timeout: 3000 });

      // No script elements should have been injected into the story pane
      const storyPane = document.querySelector('.story-pane');
      const scriptElements = storyPane?.querySelectorAll('script');
      expect(scriptElements?.length ?? 0).toBe(0);
    });

    it('Given story output contains img onerror XSS, When rendered, Then it should be text only', async () => {
      const xssPayload = JSON.stringify([{
        id: '1',
        name: 'main.ink',
        content: '<img onerror="alert(1)" src=x>\n* [choice]\n  -> END',
      }]);
      localStorageMock.setItem('inkEditor_content', xssPayload);

      render(<App />);

      await waitFor(() => {
        const storyOutput = document.querySelector('.story-output');
        expect(storyOutput).toBeInTheDocument();
      }, { timeout: 3000 });

      // No img elements should have been injected
      const storyPane = document.querySelector('.story-pane');
      const imgElements = storyPane?.querySelectorAll('img');
      expect(imgElements?.length ?? 0).toBe(0);
    });
  });

  describe('Scenario: Malicious localStorage data', () => {
    it('Given localStorage contains non-array JSON, When app loads, Then it should fall back to defaults', () => {
      localStorageMock.setItem('inkEditor_content', '{"not": "an array"}');

      render(<App />);

      // App should render without crashing
      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('Given localStorage contains array with invalid items, When app loads, Then it should fall back to defaults', () => {
      localStorageMock.setItem('inkEditor_content', JSON.stringify([
        { id: 123, name: null, content: undefined },
      ]));

      render(<App />);

      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('Given localStorage contains prototype pollution attempt, When app loads, Then it should be safe', () => {
      localStorageMock.setItem('inkEditor_content', '{"__proto__":{"polluted":"yes"}}');

      render(<App />);

      // Prototype should not be polluted
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('Given localStorage contains empty array, When app loads, Then it should fall back to defaults', () => {
      localStorageMock.setItem('inkEditor_content', '[]');

      render(<App />);

      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('Given localStorage contains corrupt JSON, When app loads, Then it should fall back to defaults', () => {
      localStorageMock.setItem('inkEditor_content', '{corrupt json!!!');

      render(<App />);

      expect(screen.getByText('Editor')).toBeInTheDocument();
    });
  });

  describe('Scenario: INCLUDE path traversal attempts', () => {
    it('Given an INCLUDE with path traversal, When resolved, Then it should report file not found', () => {
      const files = [
        { id: '1', name: 'main.ink', content: 'INCLUDE ../../etc/passwd' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('does not exist');
    });

    it('Given an INCLUDE with absolute path, When resolved, Then it should report file not found', () => {
      const files = [
        { id: '1', name: 'main.ink', content: 'INCLUDE /etc/passwd' },
      ];

      const result = resolveIncludes(files, '1');

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('does not exist');
    });
  });

  describe('Scenario: Filename sanitization', () => {
    it('Given a file rename with HTML in name, When stored, Then it should be treated as plain text', async () => {
      const maliciousFiles = JSON.stringify([{
        id: '1',
        name: '<script>alert(1)</script>.ink',
        content: 'Hello\n* [choice]\n  -> END',
      }]);
      localStorageMock.setItem('inkEditor_content', maliciousFiles);

      render(<App />);

      // The filename should be rendered as text, not as HTML
      await waitFor(() => {
        const tabBar = document.querySelector('.tab-bar');
        expect(tabBar).toBeInTheDocument();
        const scriptInTab = tabBar?.querySelectorAll('script');
        expect(scriptInTab?.length ?? 0).toBe(0);
      });
    });
  });
});
