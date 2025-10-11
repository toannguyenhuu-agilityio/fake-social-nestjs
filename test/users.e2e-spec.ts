import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { COOKIE_KEYS } from '../src/shared/constants/cookies';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { ListUserResponseType, UserResponseType } from 'src/shared/interfaces';

describe('User (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: App;
  let cookies: string[];
  let userId: string;

  const BodyRequest = {
    email: 'user-e2e@example.com',
    firstName: 'E2E',
    lastName: 'User',
    password: 'Password123!',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    server = app.getHttpServer() as App;

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user successfully', async () => {
    const res: UserResponseType = await request(server)
      .post('/users')
      .send(BodyRequest)
      .expect(201);

    expect(res.body.email).toBe(BodyRequest.email);
    expect(res.body.id).toBeDefined();

    userId = res.body.id;
  });

  it('should fail if email is already registered', async () => {
    await request(server).post('/users').send(BodyRequest).expect(409);
  });

  it('should login and return JWT cookies', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email: BodyRequest.email, password: BodyRequest.password })
      .expect(201);

    cookies = res.headers['set-cookie'] as unknown as string[];

    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes(COOKIE_KEYS.ACCESS))).toBeTruthy();
    expect(cookies.some((c) => c.includes(COOKIE_KEYS.REFRESH))).toBeTruthy();
  });

  it('should get list of users when authenticated', async () => {
    const res: ListUserResponseType = await request(server)
      .get('/users?page=1&limit=5')
      .set('Cookie', cookies)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data[0]).toHaveProperty('email');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('currentPage', 1);
  });

  it('should get user by ID', async () => {
    const res: UserResponseType = await request(app.getHttpServer() as App)
      .get(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.id).toBe(userId);
    expect(res.body.email).toBe(BodyRequest.email);
  });

  it('should return 404 when getting a non-existent user', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(server)
      .get(`/users/${fakeId}`)
      .set('Cookie', cookies)
      .expect(404);
  });

  it('should update user firstName and lastName', async () => {
    const res: UserResponseType = await request(app.getHttpServer() as App)
      .patch(`/users/${userId}`)
      .set('Cookie', cookies)
      .send({ firstName: 'Updated', lastName: 'User' })
      .expect(200);

    expect(res.body.firstName).toBe('Updated');
    expect(res.body.lastName).toBe('User');
  });

  it('should return 404 when updating a non-existent user', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(server)
      .patch(`/users/${fakeId}`)
      .set('Cookie', cookies)
      .send({ firstName: 'Nope' })
      .expect(404);
  });

  it('should delete user successfully', async () => {
    const res: UserResponseType = await request(server)
      .delete(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.id).toBe(userId);

    const check = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(check).toBeNull();
  });

  it('should return 404 when deleting a non-existent user', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(server)
      .delete(`/users/${fakeId}`)
      .set('Cookie', cookies)
      .expect(404);
  });

  it('should reject unauthenticated access to protected route', async () => {
    await request(server).get('/users').expect(401);
  });
});
