import prisma from "../src/lib/prisma";

async function main() {
  console.log("Prisma client keys:", Object.keys(prisma));
  console.log("systemSettings model in prisma:", (prisma as any).systemSettings);
  try {
    const dbSettings = await (prisma as any).systemSettings.findUnique({
      where: { key: "admin_onboarding_secret" },
    });
    console.log("dbSettings result:", dbSettings);
  } catch (error) {
    console.error("Query failed with error:", error);
  }
}

main();
