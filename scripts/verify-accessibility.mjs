import fs from 'fs';
import path from 'path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

const editorPath = path.join(root, 'src/app/dashboard/microsites/[id]/microsite-editor.tsx');

assert(fs.existsSync(editorPath), 'src/app/dashboard/microsites/[id]/microsite-editor.tsx must exist');

const editorContent = fs.readFileSync(editorPath, 'utf8');

// 1. Verify focus management state and side-effects
assert(
  editorContent.includes('focusTarget'),
  'Editor must declare a focusTarget state variable for keyboard navigation recovery'
);
assert(
  editorContent.includes('useEffect') && editorContent.includes('btn-up-') && editorContent.includes('btn-down-'),
  'Editor must restore focus to chevrons inside useEffect using unique element IDs'
);

// 2. Verify screen reader elements and ARIA live regions
assert(
  editorContent.includes('aria-live="polite"') || editorContent.includes('aria-live=\'polite\'') || editorContent.includes('aria-live'),
  'Editor must implement a polite aria-live region'
);
assert(
  editorContent.includes('sr-only'),
  'ARIA live region should be visually hidden using sr-only class'
);
assert(
  editorContent.includes('aria-hidden="true"'),
  'Drag handles must be hidden from screen readers using aria-hidden="true"'
);
assert(
  editorContent.includes('aria-label=') && editorContent.includes('Pindahkan') && editorContent.includes('ke atas') && editorContent.includes('ke bawah'),
  'Move chevrons must have Indonesian aria-labels specifying the item title and move directions'
);

// 3. Verify mobile responsive layouts
assert(
  editorContent.includes('border-t') && editorContent.includes('border-zinc-800/60') && editorContent.includes('md:border-t-0'),
  'Editor must implement a two-row mobile responsive toolbar structure with a top border on mobile viewports'
);

console.log('All accessibility and layout verification assertions passed!');
