/**
 * Single source of truth for Present Mode v1 keyboard shortcuts.
 * Tested in phase2-tools.test.ts to guarantee zero duplicate bindings.
 */

export interface ShortcutDef {
  id: string;
  key: string; // normalized lowercase key, e.g. 'v', 'arrowright', ' '
  shift?: boolean;
  metaOrCtrl?: boolean;
  alt?: boolean;
  label: string;
  category: 'Tools' | 'Colours & Size' | 'Edit' | 'Navigation' | 'Boards & View';
}

export const PRESENT_SHORTCUTS: ShortcutDef[] = [
  // Tools
  { id: 'tool.select', key: 'v', label: 'Select / Pointer (default)', category: 'Tools' },
  { id: 'tool.pen', key: 'p', label: 'Pen (fine smooth line)', category: 'Tools' },
  { id: 'tool.brush', key: 'b', label: 'Brush pen (variable width)', category: 'Tools' },
  { id: 'tool.highlighter', key: 'h', label: 'Highlighter', category: 'Tools' },
  { id: 'tool.laser', key: 'l', label: 'Laser pointer', category: 'Tools' },
  { id: 'tool.arrow', key: 'a', label: 'Arrow (Shift = 15° snap)', category: 'Tools' },
  { id: 'tool.shape', key: 'g', label: 'Cycle Line / Rectangle / Ellipse', category: 'Tools' },
  { id: 'tool.text', key: 't', label: 'Text label', category: 'Tools' },
  { id: 'tool.eraser', key: 'e', label: 'Eraser (Alt = area erase)', category: 'Tools' },
  { id: 'tool.spotlight', key: 's', label: 'Spotlight', category: 'Tools' },
  { id: 'tool.zoomHold', key: 'z', label: 'Hold for 2× Zoom', category: 'Tools' },

  // Colours & Size
  { id: 'color.1', key: '1', label: 'Colour 1 (Ink / White)', category: 'Colours & Size' },
  { id: 'color.2', key: '2', label: 'Colour 2 (Blue)', category: 'Colours & Size' },
  { id: 'color.3', key: '3', label: 'Colour 3 (Red)', category: 'Colours & Size' },
  { id: 'color.4', key: '4', label: 'Colour 4 (Green)', category: 'Colours & Size' },
  { id: 'color.5', key: '5', label: 'Colour 5 (Orange)', category: 'Colours & Size' },
  { id: 'size.down', key: '[', label: 'Smaller size', category: 'Colours & Size' },
  { id: 'size.up', key: ']', label: 'Larger size', category: 'Colours & Size' },

  // Edit
  { id: 'edit.undo', key: 'z', metaOrCtrl: true, label: 'Undo', category: 'Edit' },
  { id: 'edit.redo', key: 'z', metaOrCtrl: true, shift: true, label: 'Redo', category: 'Edit' },
  { id: 'edit.clearStep', key: 'c', label: 'Clear current step ink', category: 'Edit' },
  { id: 'edit.clearQuestion', key: 'c', shift: true, label: 'Clear all ink on question', category: 'Edit' },

  // Navigation (Space is reserved for temporary Select)
  { id: 'nav.nextStep', key: 'arrowright', label: 'Next step', category: 'Navigation' },
  { id: 'nav.nextStepEnter', key: 'enter', label: 'Next step (Enter)', category: 'Navigation' },
  { id: 'nav.nextStepPgDn', key: 'pagedown', label: 'Next step (PageDown)', category: 'Navigation' },
  { id: 'nav.prevStep', key: 'arrowleft', label: 'Previous step', category: 'Navigation' },
  { id: 'nav.prevStepPgUp', key: 'pageup', label: 'Previous step (PageUp)', category: 'Navigation' },
  { id: 'nav.nextQuestion', key: 'arrowright', shift: true, label: 'Next question', category: 'Navigation' },
  { id: 'nav.prevQuestion', key: 'arrowleft', shift: true, label: 'Previous question', category: 'Navigation' },
  { id: 'nav.firstStep', key: 'home', label: 'First step of question', category: 'Navigation' },
  { id: 'nav.lastStep', key: 'end', label: 'Takeaway / last step', category: 'Navigation' },
  { id: 'nav.grid', key: 'q', label: 'Question grid', category: 'Navigation' },

  // Boards & View
  { id: 'board.white', key: 'w', label: 'White board', category: 'Boards & View' },
  { id: 'board.black', key: 'k', label: 'Black board', category: 'Boards & View' },
  { id: 'view.theme', key: 'm', label: 'Toggle Light / Dark theme', category: 'Boards & View' },
  { id: 'view.fullscreen', key: 'f', label: 'Fullscreen', category: 'Boards & View' },
  { id: 'view.help', key: '?', label: 'Shortcut sheet', category: 'Boards & View' },
];

export function shortcutSignature(s: Pick<ShortcutDef, 'key' | 'shift' | 'metaOrCtrl' | 'alt'>): string {
  return [
    s.metaOrCtrl ? 'mod' : '',
    s.shift ? 'shift' : '',
    s.alt ? 'alt' : '',
    s.key.toLowerCase(),
  ]
    .filter(Boolean)
    .join('+');
}

export function matchShortcut(e: {
  key: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}): ShortcutDef | null {
  const k = String(e.key || '').toLowerCase();
  const mod = Boolean(e.metaKey || e.ctrlKey);
  const shift = Boolean(e.shiftKey);
  const alt = Boolean(e.altKey);

  // Special case: '?' is produced with Shift+/ on US keyboards; ignore shift flag for '?'
  for (const s of PRESENT_SHORTCUTS) {
    if (s.key === '?' && k === '?' && !mod && !alt) return s;
    if (
      s.key === k &&
      Boolean(s.metaOrCtrl) === mod &&
      Boolean(s.shift) === shift &&
      Boolean(s.alt) === alt
    ) {
      return s;
    }
  }
  return null;
}
