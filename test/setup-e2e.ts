import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma';

dotenv.config({
  path: '.env.test',
});

const prisma = new PrismaClient();

beforeAll(() => {
  console.log('Setting up E2E test environment...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
  });
});

afterAll(async () => {
  console.log('Cleaning up E2E test environment...');

  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$disconnect();
});
