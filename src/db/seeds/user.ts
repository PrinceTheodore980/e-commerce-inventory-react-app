import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            id: 'user_1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
        },
        {
            id: 'user_2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20'),
        },
        {
            id: 'user_3',
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01'),
        }
    ];

    await db.insert(user).values(sampleUsers);
    
    console.log('✅ User seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});