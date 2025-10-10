import * as bcrypt from 'bcrypt';
import { hashPassword, validatePassword } from '../password.util';

jest.mock('bcrypt');

describe('Password Utils', () => {
  const plainPassword = 'mySecret123';
  const hashedPassword = 'hashedPassword123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await hashPassword(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('validatePassword', () => {
    it('should return true if password matches hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validatePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false if password does not match hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await validatePassword('wrongPass', hashedPassword);

      expect(result).toBe(false);
    });
  });
});
