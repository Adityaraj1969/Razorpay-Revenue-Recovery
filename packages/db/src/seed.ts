import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1 test merchant
  const merchant = await prisma.merchant.create({
    data: {
      rzpMerchantId: 'acc_test_revloop_001',
      businessName: 'TechServe India Pvt Ltd',
      webhookSecret: 'whsec_test_revloop_buildathon_2026',
      configGuardrails: {
        maxConcessionPercent: 5.0,
        operatingWindowStart: '09:00',
        operatingWindowEnd: '19:00'
      }
    }
  });

  console.log(`Created merchant: ${merchant.businessName} (${merchant.id})`);

  // 3 test customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        phoneHash: 'hash_phone_1',
        emailHash: 'hash_email_1',
        pseudonymizedRef: 'ref_001',
        rfmScore: 8.5
      }
    }),
    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        phoneHash: 'hash_phone_2',
        emailHash: 'hash_email_2',
        pseudonymizedRef: 'ref_002',
        rfmScore: 6.2
      }
    }),
    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        phoneHash: 'hash_phone_3',
        emailHash: 'hash_email_3',
        pseudonymizedRef: 'ref_003',
        rfmScore: 4.1
      }
    })
  ]);

  console.log(`Created ${customers.length} customers.`);
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
