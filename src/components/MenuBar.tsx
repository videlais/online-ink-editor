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
  onZoomIn,
  onZoomOut,
}) => {
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
            <button onClick={() => handleAction(onNew)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>New Project</button>
            <button onClick={() => handleAction(onLoadInk)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Load Ink File</button>
            <button onClick={() => handleAction(onSave)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Save Project</button>
            <button onClick={() => handleAction(onSaveAsInk)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Save as Ink</button>
            <button onClick={() => handleAction(onExport)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Export as JSON</button>
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
            <button onClick={() => handleAction(onCopy)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Copy</button>
            <button onClick={() => handleAction(onPaste)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Paste</button>
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
            <button onClick={() => handleAction(onShowStats)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Story Statistics</button>
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
            <button onClick={() => handleAction(onZoomIn)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Zoom In</button>
            <button onClick={() => handleAction(onZoomOut)} role="menuitem" onKeyDown={(e) => e.key === 'Escape' && closeMenus()}>Zoom Out</button>
          </div>
        )}
      </div>
    </div>
  );
};
