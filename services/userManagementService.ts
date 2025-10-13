/**
 * @fileoverview userManagementService Module - Gerçek kullanıcı yönetimi implementasyonu
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';
import { db, collections, queryHelpers } from '../lib/database';
import type {
  ManagedUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserListResponse,
  UserActivity,
} from '../types/user';
import type { ApiResponse } from './config';

// Re-export types for backward compatibility
export type {
  ManagedUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserListResponse,
  UserActivity,
} from '../types/user';

// Kullanıcı yönetimi service'i - Appwrite Users API ile entegre
const userManagementService = {
  /**
   * Kullanıcıları listele (filtreleme ve sayfalama ile)
   */
  async getUsers(filters: UserFilters): Promise<UserListResponse> {
    try {
      logger.info('🔍 Kullanıcılar getiriliyor:', filters);
      
      const queries: string[] = [];
      
      // Filtreleme
      if (filters.search) {
        queries.push(queryHelpers.search('name', filters.search));
      }
      
      if (filters.role) {
        queries.push(queryHelpers.equal('role', filters.role));
      }
      
      if (filters.status) {
        queries.push(queryHelpers.equal('status', filters.status));
      }
      
      if (filters.email) {
        queries.push(queryHelpers.search('email', filters.email));
      }
      
      // Sıralama
      const orderBy = filters.sortBy || 'created_at';
      const orderDirection = filters.sortDirection || 'desc';
      queries.push(queryHelpers.order(orderDirection, orderBy));
      
      // Sayfalama
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      queries.push(queryHelpers.offset(offset));
      queries.push(queryHelpers.limit(limit));
      
      const { data, error } = await db.list(collections.USERS, queries);
      
      if (error) {
        logger.error('❌ Kullanıcılar getirilemedi:', error);
        return {
          users: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        };
      }
      
      const users = data?.documents?.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        email: doc.email,
        role: doc.role || 'viewer',
        status: doc.status || 'active',
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
        lastLogin: doc.last_login,
        avatar: doc.avatar,
        phone: doc.phone,
        department: doc.department,
        permissions: doc.permissions || [],
      })) || [];
      
      // Toplam sayıyı al
      const { data: countData } = await db.list(collections.USERS, [
        queryHelpers.limit(1)
      ]);
      const total = countData?.total || 0;
      
      const totalPages = Math.ceil(total / limit);
      
      logger.info(`✅ ${users.length} kullanıcı getirildi`);
      
      return {
        users,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('❌ Kullanıcılar getirilirken hata:', error);
      return {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  /**
   * Yeni kullanıcı oluştur
   */
  async createUser(request: CreateUserRequest): Promise<ManagedUser> {
    try {
      logger.info('👤 Yeni kullanıcı oluşturuluyor:', request.email);
      
      // Kullanıcı verilerini hazırla
      const userData = {
        name: request.name,
        email: request.email,
        phone: request.phone,
        role: request.role || 'viewer',
        status: request.status || 'active',
        department: request.department,
        permissions: request.permissions || [],
        avatar: request.avatar,
        created_by: 'current-user', // TODO: Auth'dan al
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await db.create(collections.USERS, userData);
      
      if (error || !data) {
        logger.error('❌ Kullanıcı oluşturulamadı:', error);
        throw new Error(`Kullanıcı oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`);
      }
      
      const newUser: ManagedUser = {
        id: data.$id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: data.$createdAt,
        updatedAt: data.$updatedAt,
        lastLogin: null,
        avatar: data.avatar,
        phone: data.phone,
        department: data.department,
        permissions: data.permissions || [],
      };
      
      logger.info(`✅ Kullanıcı oluşturuldu: ${newUser.name} (${newUser.email})`);
      return newUser;
    } catch (error) {
      logger.error('❌ Kullanıcı oluşturulurken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcı güncelle
   */
  async updateUser(id: string, request: UpdateUserRequest): Promise<ManagedUser> {
    try {
      logger.info(`✏️ Kullanıcı güncelleniyor: ${id}`);
      
      // Güncellenecek verileri hazırla
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (request.name !== undefined) updateData.name = request.name;
      if (request.email !== undefined) updateData.email = request.email;
      if (request.phone !== undefined) updateData.phone = request.phone;
      if (request.role !== undefined) updateData.role = request.role;
      if (request.status !== undefined) updateData.status = request.status;
      if (request.department !== undefined) updateData.department = request.department;
      if (request.permissions !== undefined) updateData.permissions = request.permissions;
      if (request.avatar !== undefined) updateData.avatar = request.avatar;
      
      const { data, error } = await db.update(collections.USERS, id, updateData);
      
      if (error || !data) {
        logger.error('❌ Kullanıcı güncellenemedi:', error);
        throw new Error(`Kullanıcı güncellenemedi: ${error?.message || 'Bilinmeyen hata'}`);
      }
      
      const updatedUser: ManagedUser = {
        id: data.$id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: data.$createdAt,
        updatedAt: data.$updatedAt,
        lastLogin: data.last_login,
        avatar: data.avatar,
        phone: data.phone,
        department: data.department,
        permissions: data.permissions || [],
      };
      
      logger.info(`✅ Kullanıcı güncellendi: ${updatedUser.name}`);
      return updatedUser;
    } catch (error) {
      logger.error('❌ Kullanıcı güncellenirken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcı sil
   */
  async deleteUser(id: string): Promise<void> {
    try {
      logger.info(`🗑️ Kullanıcı siliniyor: ${id}`);
      
      // Kullanıcıyı pasif hale getir (soft delete)
      const { error } = await db.update(collections.USERS, id, {
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (error) {
        logger.error('❌ Kullanıcı silinemedi:', error);
        throw new Error(`Kullanıcı silinemedi: ${error.message}`);
      }
      
      logger.info(`✅ Kullanıcı silindi: ${id}`);
    } catch (error) {
      logger.error('❌ Kullanıcı silinirken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcı şifresini sıfırla
   */
  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    try {
      logger.info(`🔐 Kullanıcı şifresi sıfırlanıyor: ${id}`);
      
      // Appwrite'da şifre sıfırlama için özel endpoint kullanılmalı
      // Bu implementasyon Appwrite Admin SDK ile yapılmalı
      
      // Geçici olarak kullanıcı kaydında şifre sıfırlama işareti koy
      const { error } = await db.update(collections.USERS, id, {
        password_reset_required: true,
        password_reset_token: `reset_${Date.now()}`,
        updated_at: new Date().toISOString(),
      });
      
      if (error) {
        logger.error('❌ Şifre sıfırlama ayarlanamadı:', error);
        throw new Error(`Şifre sıfırlama ayarlanamadı: ${error.message}`);
      }
      
      logger.info(`✅ Şifre sıfırlama ayarlandı: ${id}`);
      // TODO: Email ile şifre sıfırlama linki gönder
    } catch (error) {
      logger.error('❌ Şifre sıfırlanırken hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcı aktivitelerini getir
   */
  async getUserActivities(userId: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      logger.info(`📋 Kullanıcı aktiviteleri getiriliyor: ${userId}`);
      
      const { data, error } = await db.list(collections.USER_ACTIVITIES, [
        queryHelpers.equal('user_id', userId),
        queryHelpers.order('desc', 'created_at'),
        queryHelpers.limit(limit),
      ]);
      
      if (error) {
        logger.error('❌ Kullanıcı aktiviteleri getirilemedi:', error);
        return [];
      }
      
      const activities: UserActivity[] = data?.documents?.map((doc: any) => ({
        id: doc.$id,
        userId: doc.user_id,
        action: doc.action,
        description: doc.description,
        ipAddress: doc.ip_address,
        userAgent: doc.user_agent,
        timestamp: doc.created_at,
        metadata: doc.metadata || {},
      })) || [];
      
      logger.info(`✅ ${activities.length} aktivite getirildi`);
      return activities;
    } catch (error) {
      logger.error('❌ Kullanıcı aktiviteleri getirilirken hata:', error);
      return [];
    }
  },

  /**
   * Kullanıcı istatistiklerini getir
   */
  async getUserStats(): Promise<Record<string, unknown>> {
    try {
      logger.info('📊 Kullanıcı istatistikleri getiriliyor');
      
      // Toplam kullanıcı sayısı
      const { data: totalUsers } = await db.list(collections.USERS, [
        queryHelpers.limit(1)
      ]);
      
      // Aktif kullanıcı sayısı
      const { data: activeUsers } = await db.list(collections.USERS, [
        queryHelpers.equal('status', 'active'),
        queryHelpers.limit(1)
      ]);
      
      // Rol bazlı dağılım
      const roles = ['admin', 'manager', 'operator', 'viewer'];
      const roleStats: Record<string, number> = {};
      
      for (const role of roles) {
        const { data: roleData } = await db.list(collections.USERS, [
          queryHelpers.equal('role', role),
          queryHelpers.limit(1)
        ]);
        roleStats[role] = roleData?.total || 0;
      }
      
      // Son 30 gün içinde kayıt olan kullanıcılar
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentUsers } = await db.list(collections.USERS, [
        queryHelpers.greaterThanEqual('created_at', thirtyDaysAgo.toISOString()),
        queryHelpers.limit(1)
      ]);
      
      const stats = {
        totalUsers: totalUsers?.total || 0,
        activeUsers: activeUsers?.total || 0,
        inactiveUsers: (totalUsers?.total || 0) - (activeUsers?.total || 0),
        roleDistribution: roleStats,
        recentRegistrations: recentUsers?.total || 0,
        lastUpdated: new Date().toISOString(),
      };
      
      logger.info('✅ Kullanıcı istatistikleri hazırlandı');
      return stats;
    } catch (error) {
      logger.error('❌ Kullanıcı istatistikleri getirilirken hata:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        roleDistribution: {},
        recentRegistrations: 0,
        lastUpdated: new Date().toISOString(),
        error: 'İstatistikler alınamadı',
      };
    }
  },

  /**
   * Kullanıcı detaylarını getir
   */
  async getUserById(id: string): Promise<ApiResponse<ManagedUser>> {
    try {
      logger.info(`👤 Kullanıcı detayları getiriliyor: ${id}`);
      
      const { data, error } = await db.get(collections.USERS, id);
      
      if (error || !data) {
        logger.error('❌ Kullanıcı bulunamadı:', error);
        return { data: null, error: error?.message || 'Kullanıcı bulunamadı' };
      }
      
      const user: ManagedUser = {
        id: data.$id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: data.$createdAt,
        updatedAt: data.$updatedAt,
        lastLogin: data.last_login,
        avatar: data.avatar,
        phone: data.phone,
        department: data.department,
        permissions: data.permissions || [],
      };
      
      logger.info(`✅ Kullanıcı detayları getirildi: ${user.name}`);
      return { data: user, error: null };
    } catch (error) {
      logger.error('❌ Kullanıcı detayları getirilirken hata:', error);
      return { data: null, error: 'Kullanıcı detayları alınamadı' };
    }
  },
};

export { userManagementService };
export default userManagementService;