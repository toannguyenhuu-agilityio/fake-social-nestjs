import { JwtAuthGuard } from '../jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import * as passportModule from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let mockContext: Partial<ExecutionContext>;

  const mockGetAllAndOverride = jest.fn();
  const mockGetHandler = jest.fn();
  const mockGetClass = jest.fn();

  beforeEach(() => {
    reflector = {
      getAllAndOverride: mockGetAllAndOverride,
    } as unknown as Reflector;

    guard = new JwtAuthGuard(reflector);
    mockContext = {
      getHandler: mockGetHandler,
      getClass: mockGetClass,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when @Public() decorator is present', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const result = await guard.canActivate(mockContext as ExecutionContext);

    expect(result).toBe(true);
    expect(mockGetAllAndOverride).toHaveBeenCalled();
  });

  it('should call super.canActivate() when route is protected', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    // Spy on the prototype of AuthGuard('jwt')
    const superGuard = passportModule.AuthGuard('jwt');
    const mockCanActivate = jest
      .spyOn(superGuard.prototype, 'canActivate')
      .mockReturnValue(true as any);

    const result = await guard.canActivate(mockContext as ExecutionContext);

    expect(mockCanActivate).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);
  });
});
