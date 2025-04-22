import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts, key = '') => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyCombo = `${event.ctrlKey ? 'Control+' : ''}${event.altKey ? 'Alt+' : ''}${event.key}`;

      let action;
      let conditionFn = () => true; 

      if (Array.isArray(shortcuts)) {
        const shortcut = shortcuts.find(s => s.key === keyCombo);
        if (shortcut) {
          action = shortcut.action;
          conditionFn = shortcut.condition || (() => true);
        }
      }

      if (typeof shortcuts === 'object' && !Array.isArray(shortcuts)) {
        action = shortcuts[keyCombo];
      }

      if (typeof shortcuts === 'function' && keyCombo === key) {
        action = shortcuts;
      }

      if (action && conditionFn()) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, key]);
};
