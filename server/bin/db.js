import { PrismaClient } from '@prisma/client';
import createServerAdmin from './createServerAdmin.js';

const prisma = new PrismaClient();

prisma.$connect().then(() => {
    console.log('Connected to database');

    // CREATE/UPDATE SERVERADMIN
    createServerAdmin();

}).catch((error) => {
    console.err(error);
}).finally(async () => {
    await prisma.$disconnect();
});

export default prisma;
