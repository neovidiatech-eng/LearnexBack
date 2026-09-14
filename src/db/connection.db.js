import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('😍 PostgreSQL Database connected successfully via Prisma');
    } catch (error) {
        console.error('😢 Database connection failed:', error.message);
        process.exit(1);
    }
};

export default prisma;
