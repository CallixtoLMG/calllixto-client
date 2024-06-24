import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts, key) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      let action;

      if (typeof shortcuts === 'function') {
        const keyCombo = `${event.ctrlKey ? 'Control+' : ''}${event.key}`;
        if (keyCombo === key) {
          event.preventDefault();
          action = shortcuts;
        }
      }
      if (typeof shortcuts === 'object') {
        const keyCombo = `${event.ctrlKey ? 'Control+' : ''}${event.key}`;
        action = shortcuts[keyCombo];
      }

      if (action) {
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