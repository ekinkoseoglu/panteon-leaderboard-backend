import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const batchSize = 1000;
  const totalPlayers = 1000000;

  for (let i = 0; i < totalPlayers / batchSize; i++) {
    const players = Array.from({ length: batchSize }).map(() => ({
      name: faker.name.firstName(),
      country: faker.address.country(),
      money: faker.number.int({ min: 0, max: 10000 }),
    }));

    console.log(players);

    await prisma.player.createMany({
      data: players,
      skipDuplicates: true, // Tekrarlanan data varsa sil.
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
