const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('DATABASE_URL:', connectionString ? 'SET (' + connectionString.split('@')[1] + ')' : 'NOT SET');

async function main() {
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    try {
        const result = await prisma.user.findFirst();
        console.log('DB OK! First user:', result?.email || 'none found');
    } catch (e) {
        console.error('DB ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
