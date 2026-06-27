import fs from 'fs';
import path from 'path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

// Check if critical files exist
const editorPath = path.join(root, 'src/app/dashboard/microsites/[id]/microsite-editor.tsx');
const actionPath = path.join(root, 'src/app/actions/microsite.ts');

assert(fs.existsSync(editorPath), 'src/app/dashboard/microsites/[id]/microsite-editor.tsx must exist');
assert(fs.existsSync(actionPath), 'src/app/actions/microsite.ts must exist');

const editorContent = fs.readFileSync(editorPath, 'utf8');
const actionContent = fs.readFileSync(actionPath, 'utf8');

// 1. Verify server action implementation
assert(
  actionContent.includes('$transaction'),
  'reorderMicrositeLinks in src/app/actions/microsite.ts must perform updates inside a prisma.$transaction'
);
assert(
  actionContent.includes('reorderMicrositeLinks'),
  'src/app/actions/microsite.ts must export reorderMicrositeLinks server action'
);
assert(
  actionContent.includes('revalidatePath') && actionContent.includes('slug'),
  'reorderMicrositeLinks must call revalidatePath with the microsite slug to invalidate caches'
);

// 2. Verify editor component implementation
assert(
  editorContent.includes('draggable'),
  'Editor must use standard HTML5 draggable attribute'
);
assert(
  editorContent.includes('onDragStart'),
  'Editor must handle onDragStart'
);
assert(
  editorContent.includes('onDragOver'),
  'Editor must handle onDragOver'
);
assert(
  editorContent.includes('onDrop'),
  'Editor must handle onDrop'
);
assert(
  editorContent.includes('ChevronUp') || editorContent.includes('ArrowUp'),
  'Editor must render move up chevrons or buttons'
);
assert(
  editorContent.includes('ChevronDown') || editorContent.includes('ArrowDown'),
  'Editor must render move down chevrons or buttons'
);
assert(
  editorContent.includes('reorderMicrositeLinks'),
  'Editor must call reorderMicrositeLinks server action'
);

console.log('All link ordering verification assertions passed!');
