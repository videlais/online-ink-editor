import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  analyzeInkStory,
  saveToLocalStorage,
  loadFromLocalStorage,
  exportAsJSON,
} from '../../src/utils/inkUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Feature: Ink Story Utilities', () => {
  describe('Scenario: Analyzing Ink story content', () => {
    it('Given a simple story text, When analyzed, Then it should count the words correctly', () => {
      const content = 'This is a simple story with ten words in it.';
      
      const result = analyzeInkStory(content);
      
      expect(result.wordCount).toBe(10);
    });

    it('Given an empty story, When analyzed, Then it should return zero words', () => {
      const content = '';
      
      const result = analyzeInkStory(content);
      
      expect(result.wordCount).toBe(0);
    });

    it('Given content with multiple spaces, When analyzed, Then it should count words correctly', () => {
      const content = 'Word1    Word2     Word3';
      
      const result = analyzeInkStory(content);
      
      expect(result.wordCount).toBe(3);
    });
  });

  describe('Scenario: Detecting knots in Ink story', () => {
    it('Given a story with a knot, When analyzed, Then it should identify the knot', () => {
      const content = `=== introduction ===
This is the introduction.
-> END`;
      
      const result = analyzeInkStory(content);
      
      expect(result.knots).toContain('introduction');
      expect(result.knots).toHaveLength(1);
    });

    it('Given a story with multiple knots, When analyzed, Then it should identify all knots', () => {
      const content = `=== knot_one ===
First knot.

=== knot_two ===
Second knot.

=== knot_three ===
Third knot.`;
      
      const result = analyzeInkStory(content);
      
      expect(result.knots).toContain('knot_one');
      expect(result.knots).toContain('knot_two');
      expect(result.knots).toContain('knot_three');
      expect(result.knots).toHaveLength(3);
    });

    it('Given a story with no knots, When analyzed, Then it should return an empty knots array', () => {
      const content = 'Just a simple story without any knots.';
      
      const result = analyzeInkStory(content);
      
      expect(result.knots).toHaveLength(0);
    });

    it('Given a story with alternative knot syntax, When analyzed, Then it should recognize both formats', () => {
      const content = `== short_knot ==
=== long_knot ===`;
      
      const result = analyzeInkStory(content);
      
      expect(result.knots).toContain('short_knot');
      expect(result.knots).toContain('long_knot');
    });
  });

  describe('Scenario: Detecting stitches in Ink story', () => {
    it('Given a story with a stitch, When analyzed, Then it should identify the stitch', () => {
      const content = `=== knot ===
= first_stitch
This is a stitch.`;
      
      const result = analyzeInkStory(content);
      
      expect(result.stitches).toContain('first_stitch');
      expect(result.stitches).toHaveLength(1);
    });

    it('Given a story with multiple stitches, When analyzed, Then it should identify all stitches', () => {
      const content = `=== knot ===
= stitch_a
Content A.

= stitch_b
Content B.

= stitch_c
Content C.`;
      
      const result = analyzeInkStory(content);
      
      expect(result.stitches).toContain('stitch_a');
      expect(result.stitches).toContain('stitch_b');
      expect(result.stitches).toContain('stitch_c');
      expect(result.stitches).toHaveLength(3);
    });

    it('Given a story with knots but no stitches, When analyzed, Then it should return an empty stitches array', () => {
      const content = `=== knot_only ===
Just knot content.`;
      
      const result = analyzeInkStory(content);
      
      expect(result.stitches).toHaveLength(0);
    });
  });

  describe('Scenario: Detecting variables in Ink story', () => {
    it('Given a story with a variable declaration, When analyzed, Then it should identify the variable', () => {
      const content = 'VAR health = 100';
      
      const result = analyzeInkStory(content);
      
      expect(result.variables).toContain('health');
      expect(result.variables).toHaveLength(1);
    });

    it('Given a story with multiple variables, When analyzed, Then it should identify all variables', () => {
      const content = `VAR player_name = "Hero"
VAR score = 0
VAR level = 1`;
      
      const result = analyzeInkStory(content);
      
      expect(result.variables).toContain('player_name');
      expect(result.variables).toContain('score');
      expect(result.variables).toContain('level');
      expect(result.variables).toHaveLength(3);
    });

    it('Given a story with no variables, When analyzed, Then it should return an empty variables array', () => {
      const content = 'Story without any variables.';
      
      const result = analyzeInkStory(content);
      
      expect(result.variables).toHaveLength(0);
    });
  });

  describe('Scenario: Saving content to localStorage', () => {
    beforeEach(() => {
      localStorageMock.clear();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('Given some Ink content, When saved to localStorage, Then it should be stored', () => {
      const content = 'My Ink story content';
      
      saveToLocalStorage(content);
      
      const saved = localStorage.getItem('inkEditor_content');
      expect(saved).toBe(content);
    });

    it('Given content is saved, When saved, Then it should also store a timestamp', () => {
      const now = new Date('2025-11-12T10:00:00Z');
      vi.setSystemTime(now);
      
      saveToLocalStorage('Test content');
      
      const timestamp = localStorage.getItem('inkEditor_lastSaved');
      expect(timestamp).toBe(now.toISOString());
    });

    it('Given existing content in localStorage, When new content is saved, Then it should overwrite the old content', () => {
      localStorage.setItem('inkEditor_content', 'Old content');
      
      saveToLocalStorage('New content');
      
      const saved = localStorage.getItem('inkEditor_content');
      expect(saved).toBe('New content');
    });
  });

  describe('Scenario: Loading content from localStorage', () => {
    beforeEach(() => {
      localStorageMock.clear();
    });

    it('Given content exists in localStorage, When loaded, Then it should return the saved content', () => {
      const savedContent = 'Previously saved story';
      localStorage.setItem('inkEditor_content', savedContent);
      
      const loaded = loadFromLocalStorage();
      
      expect(loaded).toBe(savedContent);
    });

    it('Given no content exists in localStorage, When loaded, Then it should return null', () => {
      const loaded = loadFromLocalStorage();
      
      expect(loaded).toBeNull();
    });

    it('Given empty string is saved, When loaded, Then it should return empty string or null', () => {
      localStorage.setItem('inkEditor_content', '');
      
      const loaded = loadFromLocalStorage();
      
      // Mock localStorage may return '' or null for empty string
      expect(loaded === '' || loaded === null).toBe(true);
    });
  });

  describe('Scenario: Exporting story as JSON', () => {
    it('Given Ink content, When exported as JSON, Then it should create a downloadable file', () => {
      // Mock DOM methods
      const createElementSpy = vi.spyOn(document, 'createElement');
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      
      createElementSpy.mockReturnValue(mockLink as unknown as HTMLElement);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node);
      
      const content = 'Test Ink story';
      exportAsJSON(content);
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      
      // Cleanup
      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('Given content to export, When exported, Then the JSON should include content and timestamp', () => {
      const blobSpy = vi.spyOn(global, 'Blob');
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLElement);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));
      
      const content = 'My story';
      exportAsJSON(content);
      
      expect(blobSpy).toHaveBeenCalled();
      const blobCall = blobSpy.mock.calls[0];
      if (blobCall && blobCall[0] && blobCall[0][0]) {
        const jsonString = blobCall[0][0];
        const jsonData = JSON.parse(jsonString as string);
        
        expect(jsonData.content).toBe(content);
        expect(jsonData.timestamp).toBeDefined();
        expect(new Date(jsonData.timestamp).toString()).not.toBe('Invalid Date');
      }
      
      vi.restoreAllMocks();
    });
  });

  describe('Scenario: Complex story analysis', () => {
    it('Given a complete Ink story, When analyzed, Then it should detect all elements correctly', () => {
      const content = `VAR score = 0
VAR player_health = 100

=== start ===
Welcome to the adventure!

* [Enter the cave]
    -> cave
* [Visit the village]
    -> village

=== cave ===
= entrance
You stand at the cave entrance.

= depths
The cave goes deep underground.

=== village ===
The village is quiet.
-> END`;
      
      const result = analyzeInkStory(content);
      
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.knots).toEqual(['start', 'cave', 'village']);
      expect(result.stitches).toEqual(['entrance', 'depths']);
      expect(result.variables).toEqual(['score', 'player_health']);
    });
  });
});
