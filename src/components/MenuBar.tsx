import React, { useState, useRef } from 'react';
import './MenuBar.css';

interface MenuBarProps {
  onNew: () => void;
  onSave: () => void;
  onExport: () => void;
  onSaveAsInk: () => void;
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
        <button onClick={() => toggleMenu('file')} className="menu-button">
          File
        </button>
        {openMenu.file && (
          <div className="dropdown">
            <button onClick={() => handleAction(onNew)}>New Project</button>
            <button onClick={() => handleAction(onSave)}>Save Project</button>
            <button onClick={() => handleAction(onSaveAsInk)}>Save as Ink</button>
            <button onClick={() => handleAction(onExport)}>Export as JSON</button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button onClick={() => toggleMenu('edit')} className="menu-button">
          Edit
        </button>
        {openMenu.edit && (
          <div className="dropdown">
            <button onClick={() => handleAction(onCopy)}>Copy</button>
            <button onClick={() => handleAction(onPaste)}>Paste</button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button onClick={() => toggleMenu('story')} className="menu-button">
          Story
        </button>
        {openMenu.story && (
          <div className="dropdown">
            <button onClick={() => handleAction(onShowStats)}>Story Statistics</button>
          </div>
        )}
      </div>

      <div className="menu-item">
        <button onClick={() => toggleMenu('view')} className="menu-button">
          View
        </button>
        {openMenu.view && (
          <div className="dropdown">
            <button onClick={() => handleAction(onZoomIn)}>Zoom In</button>
            <button onClick={() => handleAction(onZoomOut)}>Zoom Out</button>
          </div>
        )}
      </div>
    </div>
  );
};
