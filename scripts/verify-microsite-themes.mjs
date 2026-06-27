import fs from 'fs';
import path from 'path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

// 1. Check src/lib/microsite-themes.ts
const registryPath = path.join(root, 'src/lib/microsite-themes.ts');
assert(fs.existsSync(registryPath), 'src/lib/microsite-themes.ts must exist');

const registryContent = fs.readFileSync(registryPath, 'utf8');
assert(registryContent.includes('DEFAULT_MICROSITE_THEME_ID'), 'Registry must export DEFAULT_MICROSITE_THEME_ID');
assert(registryContent.includes('MICROSITE_THEMES'), 'Registry must export MICROSITE_THEMES');
assert(registryContent.includes('MicrositeThemeId'), 'Registry must export MicrositeThemeId type/helper');
assert(registryContent.includes('isMicrositeThemeId'), 'Registry must export isMicrositeThemeId function');
assert(registryContent.includes('normalizeMicrositeTheme'), 'Registry must export normalizeMicrositeTheme function');
assert(registryContent.includes('getMicrositeTheme'), 'Registry must export getMicrositeTheme function');

const expectedThemes = ['dark', 'light', 'gradient', 'midnight', 'sunset', 'forest', 'mono'];
for (const theme of expectedThemes) {
  assert(
    new RegExp(`['"]${theme}['"]`).test(registryContent),
    `Registry must define theme ID: ${theme}`
  );
}

// 2. Check imports in consumer files
const editorPath = path.join(root, 'src/app/dashboard/microsites/[id]/microsite-editor.tsx');
const newPagePath = path.join(root, 'src/app/dashboard/microsites/new/page.tsx');
const publicRendererPath = path.join(root, 'src/components/microsite-page-client.tsx');
const actionPath = path.join(root, 'src/app/actions/microsite.ts');
const listPagePath = path.join(root, 'src/app/dashboard/microsites/page.tsx');

const files = [editorPath, newPagePath, publicRendererPath, actionPath, listPagePath];
for (const file of files) {
  assert(fs.existsSync(file), `${file} must exist`);
}

const editorContent = fs.readFileSync(editorPath, 'utf8');
const newPageContent = fs.readFileSync(newPagePath, 'utf8');
const publicRendererContent = fs.readFileSync(publicRendererPath, 'utf8');
const actionContent = fs.readFileSync(actionPath, 'utf8');
const listPageContent = fs.readFileSync(listPagePath, 'utf8');

// Assert imports
assert(
  editorContent.includes('microsite-themes') || editorContent.includes('@/lib/microsite-themes'),
  'Editor must import from microsite-themes'
);
assert(
  newPageContent.includes('microsite-themes') || newPageContent.includes('@/lib/microsite-themes'),
  'New page must import from microsite-themes'
);
assert(
  publicRendererContent.includes('microsite-themes') || publicRendererContent.includes('@/lib/microsite-themes'),
  'Public renderer must import from microsite-themes'
);
assert(
  actionContent.includes('microsite-themes') || actionContent.includes('@/lib/microsite-themes'),
  'Server action must import from microsite-themes'
);
assert(
  listPageContent.includes('microsite-themes') || listPageContent.includes('@/lib/microsite-themes'),
  'List page must import from microsite-themes'
);

// Assert absence of local definitions (avoid self-matching in the check code)
const localThemeStylesMarker = 'const themeStyles =';
assert(!publicRendererContent.includes(localThemeStylesMarker), 'Public renderer must not contain local themeStyles object');

const localThemesMarker = 'const THEMES =';
assert(!editorContent.includes(localThemesMarker), 'Editor must not contain local THEMES array');
assert(!newPageContent.includes(localThemesMarker), 'New page must not contain local THEMES array');

const hardcodedThemeThumbnailMarker = 'theme === "gradient"';
assert(!listPageContent.includes(hardcodedThemeThumbnailMarker), 'List page ThemeThumbnail must not hardcode theme checks');

console.log('All verification assertions passed!');
