import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from 'src/app.module';
import { COOKIE_KEYS } from 'src/shared/constants/cookies';
import { App } from 'supertest/types';

import cookieParser from 'cookie-parser';

type ReponseType = {
  body: { message: string; email: string };
  headers: Record<string, string>;
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockUserData = {
    email: 'toannguyen@gmail.com',
    password: 'password123',
    firstName: 'Toan',
    lastName: 'Nguyen',
  };

  const mockRightRequestBody = {
    email: 'toannguyen@gmail.com',
    password: 'password123',
  };
  const mockWrongEmailRequestBody = {
    email: 'wrongEmail@gmail.com',
    password: 'password123',
  };
  const mockWrongPasswordRequestBody = {
    email: 'toannguyen@gmail.com',
    password: 'wrongPassword',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.use(cookieParser());

    await app.init();

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
    await prisma.cleanDb();
  });

  it('should create a new user', async () => {
    const res: ReponseType = await request(app.getHttpServer() as App)
      .post('/users')
      .send(mockUserData)
      .expect(201);

    expect(res.body.email).toBe(mockUserData.email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('auth/login (POST)', async () => {
    const response = await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send(mockRightRequestBody) // adjust based on real hash
      .expect(201);

    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('auth/login (POST) - failure with wrong email', async () => {
    await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send(mockWrongEmailRequestBody)
      .expect(404);
  });

  it('auth/login (POST) - failure with wrong password', async () => {
    await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send(mockWrongPasswordRequestBody)
      .expect(401);
  });

  it('auth/refresh (POST)', async () => {
    const loginResponse = await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send(mockRightRequestBody)
      .expect(201);

    const cookies = loginResponse.headers['set-cookie'];

    const refreshResponse: ReponseType = await request(
      app.getHttpServer() as App,
    )
      .post('/auth/refresh')
      .set('Cookie', cookies)
      .send()
      .expect(201);

    expect(refreshResponse?.body?.message).toBe('Tokens refreshed');
    expect(refreshResponse.headers['set-cookie']).toBeDefined();
  });

  it('auth/logout (POST)', async () => {
    const loginResponse = await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send(mockRightRequestBody)
      .expect(201);

    const cookies = loginResponse.headers['set-cookie'];

    const logoutResponse: ReponseType = await request(
      app.getHttpServer() as App,
    )
      .post('/auth/logout')
      .set(COOKIE_KEYS.ACCESS, cookies)
      .send()
      .expect(201);

    expect(logoutResponse?.body?.message).toBe('Logged out');
  });
});
