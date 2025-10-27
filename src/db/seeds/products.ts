import { db } from '@/db';
import { products } from '@/db/schema';

async function main() {
    const sampleProducts = [
        {
            name: 'Fresh Apples',
            price: 3.99,
            category: 'groceries',
            image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
            description: 'Fresh red apples',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Whole Milk',
            price: 2.49,
            category: 'groceries',
            image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
            description: 'Fresh whole milk',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'White Bread',
            price: 1.99,
            category: 'groceries',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
            description: 'Soft white bread',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Orange Juice',
            price: 4.29,
            category: 'groceries',
            image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
            description: 'Fresh orange juice',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Pasta',
            price: 1.79,
            category: 'groceries',
            image: 'https://images.unsplash.com/photo-1551462147-37a42b6f866a?w=400',
            description: 'Italian pasta',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Rice',
            price: 5.99,
            category: 'groceries',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            description: 'Long grain rice',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Wireless Headphones',
            price: 59.99,
            category: 'electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            description: 'Bluetooth headphones',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Smart Watch',
            price: 199.99,
            category: 'electronics',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            description: 'Fitness smart watch',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Laptop Mouse',
            price: 15.99,
            category: 'electronics',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
            description: 'Wireless mouse',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'USB Cable',
            price: 9.99,
            category: 'electronics',
            image: 'https://images.unsplash.com/photo-1591290619762-3ab4e3fc4002?w=400',
            description: 'Type-C USB cable',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Phone Case',
            price: 12.99,
            category: 'electronics',
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
            description: 'Protective phone case',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Power Bank',
            price: 24.99,
            category: 'electronics',
            image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
            description: '10000mAh power bank',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Blue T-Shirt',
            price: 19.99,
            category: 'dress',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            description: 'Cotton blue t-shirt',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Black Jeans',
            price: 39.99,
            category: 'dress',
            image: 'https://images.unsplash.com/photo-1542272454315-7f6f5d0df8cc?w=400',
            description: 'Slim fit black jeans',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'White Sneakers',
            price: 49.99,
            category: 'dress',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
            description: 'Casual white sneakers',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Summer Dress',
            price: 34.99,
            category: 'dress',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
            description: 'Floral summer dress',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Leather Jacket',
            price: 89.99,
            category: 'dress',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
            description: 'Black leather jacket',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Winter Coat',
            price: 79.99,
            category: 'dress',
            image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
            description: 'Warm winter coat',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(products).values(sampleProducts);
    
    console.log('✅ Products seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});