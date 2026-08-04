import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const root = process.cwd();

function assert(condition, message) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

// 1. Verify files exist
const redirectActionPath = path.join(root, 'src/app/actions/short-link-redirect.ts');
const clickApiPath = path.join(root, 'src/app/api/click/microsite-link/[linkId]/route.ts');

assert(fs.existsSync(redirectActionPath), 'short-link-redirect.ts must exist');
assert(fs.existsSync(clickApiPath), 'microsite-link route handler must exist');

const redirectContent = fs.readFileSync(redirectActionPath, 'utf8');
const clickContent = fs.readFileSync(clickApiPath, 'utf8');

// 2. Assert short link expiration check before bcrypt.compare in verifyPasswordAndRedirect
assert(
  redirectContent.includes('expiresAt'),
  'verifyPasswordAndRedirect in short-link-redirect.ts must reference expiresAt'
);
const bcryptIndex = redirectContent.indexOf('bcrypt.compare');
const expiresIndex = redirectContent.indexOf('expiresAt');
assert(bcryptIndex !== -1, 'verifyPasswordAndRedirect must compare passwords using bcrypt');
assert(expiresIndex !== -1 && expiresIndex < bcryptIndex, 'verifyPasswordAndRedirect must check expiresAt before comparing password');

// 3. Assert microsite link API route checks isPublished and isActive
assert(
  clickContent.includes('isPublished'),
  'api/click/microsite-link/[linkId]/route.ts must check if microsite isPublished'
);
assert(
  clickContent.includes('isActive'),
  'api/click/microsite-link/[linkId]/route.ts must check if link is isActive'
);
assert(
  clickContent.includes('NextResponse.redirect'),
  'api/click/microsite-link/[linkId]/route.ts must redirect on inactive or fallback'
);

// 4. Verify database schema: query avatarImage without errors
async function verifyDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://taut_admin:taut_password_123!@localhost:5436/taut_db?schema=public';
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  try {
    // Attempt to query microsite schema properties including avatarImage
    await prisma.microsite.findFirst({
      select: {
        id: true,
        avatarImage: true,
      }
    });
    console.log('Database verification: Microsite.avatarImage queried successfully.');
  } catch (e) {
    assert(false, `Database query failed for Microsite.avatarImage: ${e.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

await verifyDatabase();
console.log('All static and database verification assertions passed!');
