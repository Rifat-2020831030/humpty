import { PrismaClient } from '@prisma/client';
import { SEED_DRIVERS } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GariKoi SQLite database...');
  console.log(`Loaded ${SEED_DRIVERS.length} seed driver profiles for real-time simulation.`);

  // Verify connection by checking ride count
  const rideCount = await prisma.ride.count();
  console.log(`Current active/archived rides count: ${rideCount}`);

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
