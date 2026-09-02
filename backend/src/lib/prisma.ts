import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  {
    // Bağlantı havuzu: eş zamanlı yükte connection exhaustion önler
    max: 10,
  }
);

const prisma = new PrismaClient({ adapter });

export default prisma;