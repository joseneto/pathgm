import { CREDIT_COSTS } from '../../../shared/src/config/credits';

export async function seedMonetization() {
  console.log('🌱 Seeding monetization data...');

  // Create subscription plans
  const plans = [
    {
      name: 'apprentice',
      displayName: 'Apprentice',
      price: 0,
      creditsPerMonth: 50,
      features: [
        'All generation commands',
        `Text generation: ${CREDIT_COSTS.TEXT_GENERATION} credits`,
        `Audio narration: ${CREDIT_COSTS.AUDIO_GENERATION} credits`,
        'Community support'
      ]
    },
    {
      name: 'adventurer',
      displayName: 'Adventurer', 
      price: 4.90,
      creditsPerMonth: 150,
      features: [
        'All generation commands',
        `Text generation: ${CREDIT_COSTS.TEXT_GENERATION} credits`,
        `Audio narration: ${CREDIT_COSTS.AUDIO_GENERATION} credits`,
        'Priority support',
        'Early access to features'
      ]
    },
    {
      name: 'guild-master',
      displayName: 'Guild Master',
      price: 9.90,
      creditsPerMonth: 360,
      features: [
        'All generation commands',
        `Text generation: ${CREDIT_COSTS.TEXT_GENERATION} credits`,
        `Audio narration: ${CREDIT_COSTS.AUDIO_GENERATION} credits`,
        'Priority support',
        'Early access to features',
        'Advanced analytics'
      ]
    },
    {
      name: 'world-lord',
      displayName: 'World Lord',
      price: 19.90,
      creditsPerMonth: 900,
      features: [
        'All generation commands',
        `Text generation: ${CREDIT_COSTS.TEXT_GENERATION} credits`,
        `Audio narration: ${CREDIT_COSTS.AUDIO_GENERATION} credits`,
        'Premium support',
        'Early access to features',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations'
      ]
    }
  ];
  const { PrismaClient } = await import('@pathgm/shared/generated/client');
  const prisma = new PrismaClient();
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        displayName: plan.displayName,
        price: plan.price,
        creditsPerMonth: plan.creditsPerMonth,
        features: plan.features
      },
      create: {
        name: plan.name,
        displayName: plan.displayName,
        price: plan.price,
        creditsPerMonth: plan.creditsPerMonth,
        features: plan.features
      }
    });
    console.log(`✅ Created/updated plan: ${plan.displayName}`);
  }

  // Create credit packages
  const packages = [
    {
      name: 'credit-pack',
      displayName: "Scribe's Codex",
      creditAmount: 100,
      price: 3.90,
      sortOrder: 1
    }
  ];

  for (const pkg of packages) {
    await prisma.creditPackage.upsert({
      where: { name: pkg.name },
      update: {
        displayName: pkg.displayName,
        creditAmount: pkg.creditAmount,
        price: pkg.price,
        sortOrder: pkg.sortOrder
      },
      create: pkg
    });
    console.log(`✅ Created/updated package: ${pkg.displayName}`);
  }

  console.log('🎉 Monetization seeding completed!');
  
  await prisma.$disconnect();
}

// Run seeding if called directly
if (require.main === module) {
  seedMonetization()
    .catch((e) => {
      console.error('❌ Error seeding monetization:', e);
      process.exit(1);
    })
}