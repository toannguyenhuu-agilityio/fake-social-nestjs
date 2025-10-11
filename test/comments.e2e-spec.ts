import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { COOKIE_KEYS } from '../src/shared/constants/cookies';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { PostResponseType, UserResponseType } from 'src/shared/interfaces';
import { CommentResponseType } from 'src/shared/interfaces/comments';

jest.setTimeout(30000);

describe('Comments E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: App;
  let cookies: string[];
  let userId: string;
  let postId: string;
  let commentId: string;

  const userData = {
    email: 'comment.e2e@example.com',
    firstName: 'Comment',
    lastName: 'Tester',
    password: 'Password123!',
  };

  const postData = {
    title: 'Post for Comment',
    content: 'This is a post created for comment tests.',
  };

  const commentData = {
    content: 'This is my first comment!',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());

    // setup global pipes if used in main.ts
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    prisma = app.get(PrismaService);

    await app.init();

    server = app.getHttpServer() as App;

    await prisma.$connect();
  });

  afterAll(async () => {
    // cleanup
    await prisma.cleanDb();

    await prisma.$disconnect();

    await app.close();
  });

  it('should create a user successfully', async () => {
    const res: UserResponseType = await request(server)
      .post('/users')
      .send(userData)
      .expect(201);

    expect(res.body.email).toBe(userData.email);
    userId = res.body.id;
  });

  it('should login and return JWT cookies', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(201);

    cookies = res.headers['set-cookie'] as unknown as string[];

    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes(COOKIE_KEYS.ACCESS))).toBeTruthy();
    expect(cookies.some((c) => c.includes(COOKIE_KEYS.REFRESH))).toBeTruthy();
  });

  it('should create a post successfully (for comment)', async () => {
    const res: PostResponseType = await request(server)
      .post('/posts')
      .set('Cookie', cookies)
      .send({ ...postData, authorId: userId })
      .expect(201);

    expect(res.body.title).toBe(postData.title);
    postId = res.body.id;
  });

  it('should create a comment successfully', async () => {
    const res: CommentResponseType = await request(server)
      .post('/comments')
      .set('Cookie', cookies)
      .send({ ...commentData, postId, authorId: userId })
      .expect(201);

    expect(res.body.content).toBe(commentData.content);
    expect(res.body.postId).toBe(postId);
    commentId = res.body.id;
  });

  it('should get a comment by id', async () => {
    const res: CommentResponseType = await request(server)
      .get(`/comments/${commentId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.id).toBe(commentId);
    expect(res.body.content).toBe(commentData.content);
  });

  it('should update the comment successfully', async () => {
    const updatedData = { content: 'Updated comment content' };

    const res: CommentResponseType = await request(server)
      .patch(`/comments/${commentId}`)
      .set('Cookie', cookies)
      .send(updatedData)
      .expect(200);

    expect(res.body.content).toBe(updatedData.content);
  });

  it('should deny updating comment by another user', async () => {
    // Create another user
    await request(server)
      .post('/users')
      .send({
        email: 'otheruser@example.com',
        firstName: 'Other',
        lastName: 'User',
        password: 'Password123!',
      })
      .expect(201);

    // Login as second user
    const resLogin = await request(server)
      .post('/auth/login')
      .send({
        email: 'otheruser@example.com',
        password: 'Password123!',
      })
      .expect(201);

    const otherCookies = resLogin.headers['set-cookie'];

    await request(server)
      .patch(`/comments/${commentId}`)
      .set('Cookie', otherCookies)
      .send({ content: 'Malicious edit' })
      .expect(403);
  });

  it('should delete the comment successfully (by author)', async () => {
    const res: CommentResponseType = await request(server)
      .delete(`/comments/${commentId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.id).toBe(commentId);

    const check = await prisma.comment.findUnique({ where: { id: commentId } });
    expect(check).toBeNull();
  });

  it('should reject unauthenticated comment creation', async () => {
    await request(server)
      .post('/comments')
      .send({ content: 'No auth', postId, authorId: userId })
      .expect(401);
  });
});
