import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../data/store.js';
import { ROLE_PERMISSIONS, UserRole } from '../types/index.js';

describe('Authentication & RBAC Unit Tests', () => {
  beforeEach(() => {
    store.resetToSeedData();
  });

  describe('11 Personas Initialization & Credentials', () => {
    it('should initialize with exactly 11 distinct test personas', () => {
      const users = store.getUsers();
      expect(users.length).toBe(11);

      const roles = users.map(u => u.role);
      expect(roles).toContain('admin');
      expect(roles).toContain('store_manager');
      expect(roles).toContain('inventory_clerk');
      expect(roles).toContain('content_editor');
      expect(roles).toContain('order_fulfillment');
      expect(roles).toContain('support_agent');
      expect(roles).toContain('book_reviewer');
      expect(roles).toContain('auditor');
      expect(roles).toContain('vip_customer');
      expect(roles).toContain('standard_customer');
      expect(roles).toContain('marketplace_seller');
    });

    it('should protect core personas from deletion but allow custom user deletion', () => {
      const admin = store.getUserByUsername('admin');
      expect(admin).toBeDefined();

      // Deleting core persona should return error
      const failRes = store.deleteUser(admin!.id);
      expect(failRes.success).toBe(false);
      expect(failRes.error).toMatch(/cannot delete core/i);

      // Creating and deleting custom user should succeed
      const customRes = store.createUser({
        username: 'custom_tester',
        password: 'Pass@12345',
        fullName: 'Custom QA Tester',
        email: 'tester@custom.org',
        role: 'standard_customer',
        currency: 'USD',
        timezone: 'America/New_York'
      });
      expect(customRes.success).toBe(true);
      expect(customRes.user).toBeDefined();
      expect(store.getUserByUsername('custom_tester')).toBeDefined();

      // Deleting custom user
      const deletedRes = store.deleteUser(customRes.user!.id);
      expect(deletedRes.success).toBe(true);
      expect(store.getUserByUsername('custom_tester')).toBeUndefined();
    });

    it('should authenticate admin user with valid password', () => {
      const user = store.getUserByUsername('admin');
      expect(user).toBeDefined();
      expect(user?.password).toBe('Admin@Pass123');
      expect(user?.status).toBe('active');
    });

    it('should assign correct regional currencies and timezones to personas', () => {
      const admin = store.getUserByUsername('admin');
      expect(admin?.currency).toBe('USD');
      expect(admin?.timezone).toBe('America/New_York');

      const manager = store.getUserByUsername('store_manager');
      expect(manager?.currency).toBe('AED');
      expect(manager?.timezone).toBe('Asia/Dubai');

      const clerk = store.getUserByUsername('inventory_clerk');
      expect(clerk?.currency).toBe('INR');
      expect(clerk?.timezone).toBe('Asia/Kolkata');

      const editor = store.getUserByUsername('content_editor');
      expect(editor?.currency).toBe('JPY');
      expect(editor?.timezone).toBe('Asia/Tokyo');

      const fulfillment = store.getUserByUsername('order_fulfillment');
      expect(fulfillment?.currency).toBe('AUD');
      expect(fulfillment?.timezone).toBe('Australia/Sydney');
    });
  });

  describe('Role-Based Access Control (RBAC) Permissions Matrix', () => {
    it('should grant admin full administrative permissions', () => {
      const adminPerms = ROLE_PERMISSIONS.admin;
      expect(adminPerms).toContain('catalog:create');
      expect(adminPerms).toContain('catalog:delete');
      expect(adminPerms).toContain('users:manage');
      expect(adminPerms).toContain('system:reset');
      expect(adminPerms).toContain('audit:read');
    });

    it('should grant store_manager catalog management without user management', () => {
      const managerPerms = ROLE_PERMISSIONS.store_manager;
      expect(managerPerms).toContain('catalog:create');
      expect(managerPerms).toContain('catalog:update');
      expect(managerPerms).not.toContain('users:manage');
      expect(managerPerms).not.toContain('system:reset');
    });

    it('should restrict auditor to read-only audit permissions', () => {
      const auditorPerms = ROLE_PERMISSIONS.auditor;
      expect(auditorPerms).toContain('audit:read');
      expect(auditorPerms).not.toContain('catalog:create');
      expect(auditorPerms).not.toContain('catalog:update');
      expect(auditorPerms).not.toContain('catalog:delete');
      expect(auditorPerms).not.toContain('users:manage');
    });

    it('should give vip_customer the discount:vip privilege', () => {
      const vipPerms = ROLE_PERMISSIONS.vip_customer;
      expect(vipPerms).toContain('discount:vip');
      expect(vipPerms).toContain('catalog:read');
      expect(vipPerms).not.toContain('catalog:create');
    });

    it('should give standard_customer basic browsing without vip discount', () => {
      const customerPerms = ROLE_PERMISSIONS.standard_customer;
      expect(customerPerms).toContain('catalog:read');
      expect(customerPerms).toContain('orders:read_own');
      expect(customerPerms).not.toContain('discount:vip');
      expect(customerPerms).not.toContain('users:manage');
    });
  });

  describe('Admin User Management & Status Modifications', () => {
    it('should update user full name, role, status, timezone, and currency', () => {
      const targetUser = store.getUserByUsername('standard_customer');
      expect(targetUser).toBeDefined();

      const updated = store.updateUserDetails(targetUser!.id, {
        fullName: 'Jane Doe VIP',
        email: 'janedoe@example.com',
        role: 'vip_customer',
        status: 'active',
        timezone: 'Asia/Dubai',
        currency: 'AED'
      });

      expect(updated).toBeDefined();
      expect(updated?.fullName).toBe('Jane Doe VIP');
      expect(updated?.email).toBe('janedoe@example.com');
      expect(updated?.role).toBe('vip_customer');
      expect(updated?.timezone).toBe('Asia/Dubai');
      expect(updated?.currency).toBe('AED');

      // Verify persistence in store
      const persisted = store.getUserById(targetUser!.id);
      expect(persisted?.role).toBe('vip_customer');
      expect(persisted?.currency).toBe('AED');
    });

    it('should toggle user account status between active and suspended', () => {
      const targetUser = store.getUserByUsername('book_reviewer');
      expect(targetUser?.status).toBe('active');

      const suspended = store.updateUserStatus(targetUser!.id, 'suspended');
      expect(suspended?.status).toBe('suspended');

      const reactivated = store.updateUserStatus(targetUser!.id, 'active');
      expect(reactivated?.status).toBe('active');
    });
  });
});
