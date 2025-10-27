import { db } from '@/db';
import { orderItems } from '@/db/schema';

async function main() {
    const sampleOrderItems = [
        {
            orderId: 1,
            productId: 7,
            quantity: 1,
            price: 59.99,
            createdAt: new Date().toISOString(),
        },
        {
            orderId: 1,
            productId: 1,
            quantity: 1,
            price: 3.99,
            createdAt: new Date().toISOString(),
        },
        {
            orderId: 2,
            productId: 14,
            quantity: 1,
            price: 39.99,
            createdAt: new Date().toISOString(),
        },
        {
            orderId: 2,
            productId: 15,
            quantity: 1,
            price: 49.99,
            createdAt: new Date().toISOString(),
        },
        {
            orderId: 2,
            productId: 2,
            quantity: 1,
            price: 2.49,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(orderItems).values(sampleOrderItems);
    
    console.log('✅ Order items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});