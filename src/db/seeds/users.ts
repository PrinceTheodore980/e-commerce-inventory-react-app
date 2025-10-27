import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            password: 'password123',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            password: 'password123',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});