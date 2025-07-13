import { seedMonetization } from './seeds/monetization';

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed monetization data (plans and packages)
    await seedMonetization();
    
    console.log('🎉 All seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })