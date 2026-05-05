import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, jest } from 'bun:test';
import { AuthService } from './auth.service.js';
import { User } from '../users/entities/user.entity.js';

describe('AuthService tenancy context', () => {
  const buildService = () => {
    const usersService = {
      findOne: jest.fn(),
      hasRole: jest.fn(),
    };
    const jwtService = {
      sign: jest.fn().mockReturnValue('token'),
      verify: jest.fn(),
    };
    const configService = {
      get: jest.fn().mockReturnValue({
        secret: 'secret',
        refreshSecret: 'refresh',
        expiresIn: '1h',
        refreshExpiresIn: '7d',
      }),
    };
    const googleOauthService = {};
    const redisService = {
      isAvailable: jest.fn().mockReturnValue(false),
      set: jest.fn(),
      getDel: jest.fn(),
    };
    const tenantRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    const userTenantRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn().mockImplementation((v) => v),
    };
    const roleRepository = {
      findOne: jest.fn(),
      manager: { query: jest.fn() },
    };

    const service = new AuthService(
      usersService as any,
      jwtService as any,
      configService as any,
      googleOauthService as any,
      redisService as any,
      tenantRepository as any,
      userTenantRepository as any,
      roleRepository as any,
    );

    return {
      service,
      usersService,
      tenantRepository,
      userTenantRepository,
    };
  };

  it('rejects non-superadmin when setting tenant outside membership', async () => {
    const { service, usersService, userTenantRepository } = buildService();
    const user = { id: 'u-1', roles: [{ code: 'admin' }] } as User;
    usersService.findOne.mockResolvedValue(user);
    usersService.hasRole.mockReturnValue(false);
    userTenantRepository.findOne.mockResolvedValue(null);

    await expect(
      service.setActiveTenant(user, 'tenant-unauthorized'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows superadmin to set any valid tenant', async () => {
    const { service, usersService, tenantRepository } = buildService();
    const user = { id: 'u-1', roles: [{ code: 'superadmin' }] } as User;
    usersService.findOne.mockResolvedValue(user);
    usersService.hasRole.mockImplementation(
      (_u: User, roleCode: string) => roleCode === 'superadmin',
    );
    tenantRepository.findOne.mockResolvedValue({ id: 'tenant-1', code: 't1' });

    const result = await service.setActiveTenant(user, 'tenant-1');

    expect(result.activeTenantId).toBe('tenant-1');
  });
});
