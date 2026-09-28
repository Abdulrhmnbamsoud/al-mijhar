import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const runs = await prisma.generationRun.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(JSON.stringify(runs, null, 2));
}
main();
