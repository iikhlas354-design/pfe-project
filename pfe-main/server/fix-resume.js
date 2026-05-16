import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔧 Fixing nutritionist resumes...\n");

  const resumes = await prisma.resume.findMany({
    include: { user: { select: { role: true, email: true } } },
  });

  const nutritionistResumes = resumes.filter(r => r.user.role === "NUTRITION");

  console.log(`Found ${nutritionistResumes.length} nutritionist resume(s)\n`);

  for (const resume of nutritionistResumes) {
    const needsPackage = !resume.offersTypes.includes("PACKAGE");
    const needsPlan    = !resume.offersTypes.includes("PLAN");

    if (!needsPackage && !needsPlan) {
      console.log(`✅ ${resume.user.email} — already has PACKAGE and PLAN`);
      continue;
    }

    const newTypes = [...resume.offersTypes];
    if (needsPackage) newTypes.push("PACKAGE");
    if (needsPlan)    newTypes.push("PLAN");

    await prisma.resume.update({
      where: { id: resume.id },
      data:  { offersTypes: newTypes },
    });

    console.log(`✅ ${resume.user.email} — updated offersTypes: ${newTypes.join(", ")}`);
  }

  console.log("\n🎉 Done!");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());