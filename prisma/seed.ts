import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const batchSize = 100;
  const totalPlayers = 100;

  for (let i = 0; i < totalPlayers / batchSize; i++) {
    const players = Array.from({ length: batchSize }).map(() => ({
      name: faker.name.firstName(),
      country: faker.address.country(),
      //Remove zeros from the end of the number
      money: Number(faker.finance.amount({ min: 0, max: 1000, dec: 2 })),
    }));

    console.log(players);

    await prisma.player.createMany({
      data: players,
      skipDuplicates: true, // Skip if there's a duplicate record (e.g., by name)
    });

    console.log(`Inserted batch ${i + 1}/${totalPlayers / batchSize}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
