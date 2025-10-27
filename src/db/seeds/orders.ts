import { db } from '@/db';
import { orders } from '@/db/schema';

async function main() {
    const sampleOrders = [
        {
            userId: 1,
            total: 63.98,
            status: 'pending',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 2,
            total: 91.97,
            status: 'completed',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(orders).values(sampleOrders);
    
    console.log('✅ Orders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});