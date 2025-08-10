import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
if (process.env.NODE_ENV !== 'production') {
  // In development, save the Prisma client globally to reuse it during hot reloads
  globalForPrisma.prisma = prisma;
}


export default prisma;
