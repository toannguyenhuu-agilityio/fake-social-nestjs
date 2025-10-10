import { JwtRefreshGuard } from '../refresh-token.guard';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('JwtRefreshGuard', () => {
  let guard: JwtRefreshGuard;

  beforeEach(() => {
    guard = new JwtRefreshGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard("jwt-refresh")', () => {
    const BaseGuard = AuthGuard('jwt-refresh');
    expect(guard).toBeInstanceOf(BaseGuard);
  });

  it('should call super.canActivate when executed', () => {
    const BaseGuard = AuthGuard('jwt-refresh');
    const mockCanActivate = jest
      .spyOn(BaseGuard.prototype, 'canActivate')
      .mockReturnValue(true as any);

    const context = {} as ExecutionContext;
    const result = guard.canActivate(context);

    expect(mockCanActivate).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
  });
});
