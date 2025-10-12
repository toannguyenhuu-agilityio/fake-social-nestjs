import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { COOKIE_KEYS } from '../src/shared/constants/cookies';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import {
  PostListReponseType,
  PostResponseType,
  UserResponseType,
} from 'src/shared/interfaces';

jest.setTimeout(60000);

describe('Posts E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: App;
  let cookies: string[];
  let userId: string;
  let postId: string;

  const BodyRequest = {
    email: 'post.e2e@example.com',
    firstName: 'Post',
    lastName: 'Tester',
    password: 'Password123!',
  };

  const postData = {
    title: 'My First Post',
    content: 'This is an E2E test post.',
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

  it('should create a user successfully', async () => {
    const res: UserResponseType = await request(server)
      .post('/users')
      .send(BodyRequest)
      .expect(201);

    expect(res.body.email).toBe(BodyRequest.email);
    expect(res.body).not.toHaveProperty('password');

    userId = res.body.id;
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

  it('should create a post successfully', async () => {
    const res: PostResponseType = await request(server)
      .post('/posts')
      .set('Cookie', cookies)
      .send({ ...postData, authorId: userId })
      .expect(201);

    expect(res.body.title).toBe(postData.title);
    expect(res.body.authorId).toBe(userId);
    postId = res.body.id;
  });

  it('should get paginated posts list', async () => {
    const res: PostListReponseType = await request(server)
      .get('/posts?page=1&limit=10')
      .set('Cookie', cookies)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.meta).toHaveProperty('totalItems');
  });

  it('should get post by id', async () => {
    const res: PostResponseType = await request(server)
      .get(`/posts/${postId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.id).toBe(postId);
    expect(res.body.title).toBe(postData.title);
  });

  it('should update the post successfully', async () => {
    const updatedData = { title: 'Updated Post Title' };

    const res: PostResponseType = await request(server)
      .patch(`/posts/${postId}`)
      .set('Cookie', cookies)
      .send(updatedData)
      .expect(200);

    expect(res.body.title).toBe(updatedData.title);
  });

  it('should deny updating post by another user', async () => {
    // Create another user
    await request(server)
      .post('/users')
      .send({
        email: 'another@example.com',
        firstName: 'Another',
        lastName: 'User',
        password: 'Password123!',
      })
      .expect(201);

    // Login as the second user
    const resLogin = await request(server)
      .post('/auth/login')
      .send({
        email: 'another@example.com',
        password: 'Password123!',
      })
      .expect(201);

    const anotherCookies = resLogin.headers['set-cookie'];

    // Attempt to update post not owned by this user
    await request(server)
      .patch(`/posts/${postId}`)
      .set('Cookie', anotherCookies)
      .send({ title: 'Malicious Edit' })
      .expect(403);
  });

  it('should delete post successfully', async () => {
    const res: PostResponseType = await request(server)
      .delete(`/posts/${postId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.id).toBe(postId);

    const check = await prisma.post.findUnique({ where: { id: postId } });
    expect(check).toBeNull();
  });

  it('should reject unauthenticated access', async () => {
    await request(server).get('/posts').expect(401);
  });
});
