import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('asdf1234', 10);

  const user = await prisma.user.create({
    data: {
      username: 'specter',
      password: hashedPassword,
      role: 'MASTER',
      nickname: 'exit',
      memo: '스펙터 최고관리자',
      organizationId: null,
    },
  });

  console.log('User created:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
