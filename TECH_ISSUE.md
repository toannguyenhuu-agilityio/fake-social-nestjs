# Technical Issue Documentation

## Title

JWT Access Token Expiration & Refresh Token Mechanism (Cookie-Based Auth)

## Document ID

TID-001

## Author(s)

Toan Nguyen

## Date Created

2025-10-13

## Last Updated

2025-10-14

## Status

Draft

## 1. Purpose

To ensure continuous authenticated user sessions by automatically refreshing expired JWT access tokens using secure HttpOnly cookies, without exposing tokens to client-side JavaScript.

## 2.Scope

- Included:
  - Handling expired access tokens.
  - Refreshing access token using refresh tokens stored in cookies.
  - Automatic retry of failed requests on the Frontend.
  - Backend refresh endpoint implementation.
- Excluded:
  - Login and logout flows.
  - User CRUD and profile management.

## 3. Component Overview

### 3.1 Description

This component handles automatic re-authentication when an access token expires. The Backend issues two JWTs (access and refresh token) stored as HttpOnly cookies. When the access token expires, the Frontend detects a **401 Unauthorized response** and silently requests new token via the **/auth/refresh** endpoint.

This ensure seamless user experience and session continutiy without forcing re-login, while maintaining security.

### 3.2 Dependencies

- NestJS (Authentication Module)
- @nestjs/jwt (JWT service)
- cookie-parser (to read cookies)
- axios (Frontend HTTP client with interceptors)
- bcrypt (for password hashing)
- dotenv (for environment variables)
- Prisma (database ORM)
- Database table:
  - users

## 4. Solution Design

### 4.1 Data Models

Entity: users

```Bash
model User {
  id String @id @default(uuid())
  email String @unique
  firstName String
  lastName String
  password String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4.2 Flow Description

Step 1. User login

- Backend validates credentials.
- Generates:
  - accessToken (expires in 15 minutes)
  - refreshToken (expires in 7 days)
- Sends both tokens as HttpOnly cookies:

```bash
res.cookie('access_token', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
```

Step 2. Access Token Expiration

- After 15 minutes, the access token becomes invalid.
- The next API call returns:

```bash
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

Step 3. Frontend Detection & Refresh

- The frontend Axios instance has a response interceptor:

```bash
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post('/auth/refresh', {}, { withCredentials: true });

        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

- On 401, it calls /auth/refresh silently.
- If refresh succeeds, the API retries automatically.
- If refresh fails (e.g., refresh token expired), the user is redirected to login.

Step 4. Backend Refresh Endpoint

```bash
@UseGuards(AuthGuard('jwt-refresh'))
@Post('refresh')
async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies['refresh_token'];
  const tokens = await this.authService.refreshTokens(refreshToken);

  res.cookie('access_token', tokens.accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.send({ success: true });
}
```

### 4.3 Error Handling

| Scenario              | Description                            | Action                              |
| --------------------- | -------------------------------------- | ----------------------------------- |
| Access token expired  | Token in `access_token` cookie invalid | FE calls `/auth/refresh`            |
| Refresh token expired | Refresh endpoint also returns `401`    | FE redirects to login               |
| Tampered cookie       | JWT verification fails                 | Clear cookies and redirect to login |

### 4.4 Security Considerations

- Tokens stored as HttpOnly cookies — not accessible by JS.
- Use secure: true and sameSite: 'strict'.
- Rotate refresh tokens on each use.
- Invalidate refresh token on logout or manual revocation.
- Use short-lived access tokens.

## 5. References

- [Refactoring Token Management – A Cleaner Approach to Handling Access and Refresh Tokens](https://medium.com/@eric_abell/refactoring-token-management-a-cleaner-approach-to-handling-access-and-refresh-tokens-542c38212162)
- [The Struggle: Managing Access and Refresh Tokens in Web Apps](https://medium.com/@eric_abell/the-struggle-managing-access-and-refresh-tokens-in-web-apps-1bd70a3a6f01)
- [YouTube: JWT Authentication Best Practices & Refresh Tokens Explained](https://www.youtube.com/watch?v=AcYF18oGn6Y)
