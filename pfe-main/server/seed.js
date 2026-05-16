import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("nutrition1234", 10);

  const nutritionists = [
    {
      email:     "amira.hassan@test.com",
      firstName: "Amira",
      lastName:  "Hassan",
      image:     "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
    },
    {
      email:     "youssef.mansour@test.com",
      firstName: "Youssef",
      lastName:  "Mansour",
      image:     "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
    },
    {
      email:     "nour.khalil@test.com",
      firstName: "Nour",
      lastName:  "Khalil",
      image:     "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
    },
    {
      email:     "omar.farouq@test.com",
      firstName: "Omar",
      lastName:  "Farouq",
      image:     "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&q=80",
    },
    {
      email:     "lina.saad@test.com",
      firstName: "Lina",
      lastName:  "Saad",
      image:     "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&q=80",
    },
  ];

  const nutritionist = await prisma.user.upsert({
    where: { email: "nutrition@test1.com" },
    update: {},
    create: {
      email:      "nutrition@test1.com",
      password:   hashedPassword,
      role:       "NUTRITION",
      firstName:  "Sarah",
      lastName:   "Mitchell",
      needsSetup: false,
    },
  });

  console.log("✅ Nutritionist created:");
  console.log("  Email:    nutrition@test.com");
  console.log("  Password: nutrition123");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
  for (const n of nutritionists) {
    await prisma.user.upsert({
      where:  { email: n.email },
      update: {},
      create: {
        email:      n.email,
        password:   hashedPassword,
        role:       "NUTRITION",
        firstName:  n.firstName,
        lastName:   n.lastName,
        image:      n.image,
        needsSetup: false,
      },
    });
    console.log(`✅ Created: ${n.firstName} ${n.lastName} — ${n.email}`);
  }

  console.log("\n🔑 Password for all accounts: nutrition1234");


main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());