import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity.js';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      relations: ['roles'],
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { code },
      relations: ['roles'],
    });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { resource },
      relations: ['roles'],
      order: { action: 'ASC' },
    });
  }

  async findByAction(action: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { action },
      relations: ['roles'],
      order: { resource: 'ASC' },
    });
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(permissionData);
    return this.permissionRepository.save(permission);
  }

  async update(
    id: number,
    permissionData: Partial<Permission>,
  ): Promise<Permission | null> {
    await this.permissionRepository.update(id, permissionData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}
