import React, { useState, useRef } from 'react';
import './MenuBar.css';

interface MenuBarProps {
  onNew: () => void;
  onSave: () => void;
  onExport: () => void;
  onSaveAsInk: () => void;
  onLoadInk: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onShowStats: () => void;
  onRestart: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

interface MenuState {
  file: boolean;
  edit: boolean;
  story: boolean;
  view: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNew,
  onSave,
  onExport,
  onSaveAsInk,
  onLoadInk,
  onCopy,
  onPaste,
  onShowStats,
  onRestart,
  onZoomIn,
  onZoomOut,
}) => {
  // Detect platform for keyboard shortcuts display
  const isMac = navigator.userAgent.toUpperCase().includes('MAC');
  const modifierKey = isMac ? '⌘' : 'Ctrl';
  
  const getShortcut = (key: string) => `${modifierKey}+${key}`;
  const [openMenu, setOpenMenu] = useState<MenuState>({
    file: false,
    edit: false,
    story: false,
    view: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menu: keyof MenuState) => {
    setOpenMenu({
      file: menu === 'file' ? !openMenu.file : false,
      edit: menu === 'edit' ? !openMenu.edit : false,
      story: menu === 'story' ? !openMenu.story : false,
      view: menu === 'view' ? !openMenu.view : false,
    });
  };

  const closeMenus = () => {
    setOpenMenu({ file: false, edit: false, story: false, view: false });
  };

  const handleAction = (action: () => void) => {
    action();
    closeMenus();
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="menu-bar" ref={menuRef}>
      <div className="menu-item">
        <button 
          onClick={() => toggleMenu('file')} 
          className="menu-button"
          aria-expanded={openMenu.file}
          aria-haspopup="true"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && openMenu.file) {
              e.preventDefault();
              const firstItem = menuRef.current?.querySelector('.dropdown button');
              (firstItem as HTMLElement)?.focus();
            } else if (e.key === 'Escape') {
              closeMenus();
            }
          }}
        >
          File
        </button>
        {openMenu.file && (
          <div className="dropdown" role="menu" aria-label="File menu">
            <button onClick={() => handleAction(onNew)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>New Project</span>
              <span className="shortcut">{getShortcut('N')}</span>
            </button>
            <button onClick={() => handleAction(onLoadInk)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Load Ink File</span>
              <span className="shortcut">{getShortcut('O')}</span>
            </button>
            <button onClick={() => handleAction(onSave)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Save Project</span>
              <span className="shortcut">{getShortcut('S')}</span>
            </button>
            <button onClick={() => handleAction(onSaveAsInk)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Save as Ink</button>
            <button onClick={() => handleAction(onExport)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Export as JSON</span>
              <span className="shortcut">{getShortcut('E')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          onClick={() => toggleMenu('edit')} 
          className="menu-button"
          aria-expanded={openMenu.edit}
          aria-haspopup="true"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && openMenu.edit) {
              e.preventDefault();
              const firstItem = menuRef.current?.querySelector('.dropdown button');
              (firstItem as HTMLElement)?.focus();
            } else if (e.key === 'Escape') {
              closeMenus();
            }
          }}
        >
          Edit
        </button>
        {openMenu.edit && (
          <div className="dropdown" role="menu" aria-label="Edit menu">
            <button onClick={() => handleAction(onCopy)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Copy</span>
              <span className="shortcut">{getShortcut('C')}</span>
            </button>
            <button onClick={() => handleAction(onPaste)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Paste</span>
              <span className="shortcut">{getShortcut('V')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          onClick={() => toggleMenu('story')} 
          className="menu-button"
          aria-expanded={openMenu.story}
          aria-haspopup="true"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && openMenu.story) {
              e.preventDefault();
              const firstItem = menuRef.current?.querySelector('.dropdown button');
              (firstItem as HTMLElement)?.focus();
            } else if (e.key === 'Escape') {
              closeMenus();
            }
          }}
        >
          Story
        </button>
        {openMenu.story && (
          <div className="dropdown" role="menu" aria-label="Story menu">
            <button onClick={() => handleAction(onRestart)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Restart Story</span>
              <span className="shortcut">{getShortcut('R')}</span>
            </button>
            <button onClick={() => handleAction(onShowStats)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Story Statistics</span>
              <span className="shortcut">{getShortcut('I')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button 
          onClick={() => toggleMenu('view')} 
          className="menu-button"
          aria-expanded={openMenu.view}
          aria-haspopup="true"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && openMenu.view) {
              e.preventDefault();
              const firstItem = menuRef.current?.querySelector('.dropdown button');
              (firstItem as HTMLElement)?.focus();
            } else if (e.key === 'Escape') {
              closeMenus();
            }
          }}
        >
          View
        </button>
        {openMenu.view && (
          <div className="dropdown" role="menu" aria-label="View menu">
            <button onClick={() => handleAction(onZoomIn)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Zoom In</span>
              <span className="shortcut">{getShortcut('+')}</span>
            </button>
            <button onClick={() => handleAction(onZoomOut)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>
              <span>Zoom Out</span>
              <span className="shortcut">{getShortcut('-')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
