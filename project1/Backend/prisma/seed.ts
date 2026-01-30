import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const apiKey = crypto.randomBytes(24).toString("hex");

  await prisma.user.create({
    data: {
      apikey: apiKey,
    },
  });

  console.log("Demo API Key:", apiKey);
}

main();


//!delete later | useful
// npx prisma migrate dev FinConectaDB <migration_name>