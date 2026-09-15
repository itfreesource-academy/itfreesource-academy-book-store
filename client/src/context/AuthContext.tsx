import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission, PersonaInfo } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { useToast } from './ToastContext.js';

export const TEST_PERSONAS: PersonaInfo[] = [
  {
    username: 'admin',
    role: 'admin',
    label: 'Super Admin',
    description: 'Full CRUD on catalog, user management, audit logs, system reset.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    username: 'store_manager',
    role: 'store_manager',
    label: 'Store Manager',
    description: 'Manage catalog, prices, categories, authors, view orders.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    username: 'inventory_clerk',
    role: 'inventory_clerk',
    label: 'Inventory Clerk',
    description: 'Stock levels, warehouse inventory, restock slider adjustments.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    username: 'content_editor',
    role: 'content_editor',
    label: 'Content Editor',
    description: 'Edit book descriptions, cover images, blog tags.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    username: 'order_fulfillment',
    role: 'order_fulfillment',
    label: 'Order Fulfillment',
    description: 'Update shipment tracking, dispatch packages, transition statuses.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    username: 'support_agent',
    role: 'support_agent',
    label: 'Support Agent',
    description: 'View customer orders, process return/refund requests.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    username: 'book_reviewer',
    role: 'book_reviewer',
    label: 'Lead Reviewer',
    description: 'Review moderation queue, publish verified book critiques.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    username: 'auditor',
    role: 'auditor',
    label: 'Compliance Auditor',
    description: 'Read-only access to audit logs, security events, financial stats.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  {
    username: 'vip_customer',
    role: 'vip_customer',
    label: 'VIP Customer',
    description: '20% VIP automatic cart discount, VIP exclusive titles access.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    username: 'standard_customer',
    role: 'standard_customer',
    label: 'Regular Customer',
    description: 'Browse catalog, standard cart, checkout, personal orders.',
    badgeColor: 'bg-green-100 text-green-800 border-green-300'
  },
  {
    username: 'marketplace_seller',
    role: 'marketplace_seller',
    label: 'Marketplace Seller',
    description: 'Independent publisher: list books for rent/sale with live platform fee & commission calculation.',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-400'
  }
];

export const PERSONA_PASSWORDS: Record<string, string> = {
  admin: 'Admin@Pass123',
  store_manager: 'Manager@Pass123',
  inventory_clerk: 'Stock@Pass123',
  content_editor: 'Editor@Pass123',
  order_fulfillment: 'Orders@Pass123',
  support_agent: 'Support@Pass123',
  book_reviewer: 'Reviewer@Pass123',
  auditor: 'Audit@Pass123',
  vip_customer: 'Vip@Pass123',
  standard_customer: 'User@Pass123',
  marketplace_seller: 'Seller@Pass123'
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  quickLogin: (username: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [permissions, setPermissions] = useState<Permission[]>(() => {
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data.user);
          setPermissions(res.data.permissions || []);
          localStorage.setItem('permissions', JSON.stringify(res.data.permissions || []));
        } catch {
          // Token invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('permissions');
          setToken(null);
          setUser(null);
          setPermissions([]);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      const { token: newToken, user: newUser, permissions: newPerms } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('permissions', JSON.stringify(newPerms));

      setToken(newToken);
      setUser(newUser);
      setPermissions(newPerms);

      addToast(`Logged in successfully as ${newUser.fullName} (${newUser.role})`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Login failed. Check credentials.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (username: string): Promise<void> => {
    const password = PERSONA_PASSWORDS[username] || 'Admin@Pass123';
    await login(username, password);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    setToken(null);
    setUser(null);
    setPermissions([]);
    addToast('Logged out successfully.', 'info');
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        logout,
        hasPermission,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
