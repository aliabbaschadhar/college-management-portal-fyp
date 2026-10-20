import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import { seedHsscCourses } from "./seed-hssc";
import { seedBsCourses } from "./seed-bs";

dotenv.config();

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function seedAllCourses() {
  console.log("🚀 Starting Course Curriculum Seeding (BS + Intermediate)...\n");
  
  await seedHsscCourses(prisma);
  await seedBsCourses(prisma);

  console.log("\n✨ All BS and Intermediate Course Curricula successfully seeded!");
}

seedAllCourses()
  .catch((e) => {
    console.error("❌ Course seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
