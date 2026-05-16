// server/prismaClient.js
import { PrismaClient } from "@prisma/client";  // ✅ correct path
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
export default prisma;