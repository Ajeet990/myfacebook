import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Create admin user
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@yopmail.com',
      password: hashedPassword,
      phone: '9999999999', // any dummy phone number
      role: 'ADMIN', // matches your enum
    },
  });

  console.log('✅ Admin user created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
