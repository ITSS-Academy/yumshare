import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as admin from 'firebase-admin'

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseStorageService) {}


  async verifyToken(idToken: string) {
    try {
      let token = idToken || '';
      if (token.startsWith('Bearer ')) token = token.slice(7);
  
      const decoded = await admin.auth().verifyIdToken(token);
      const email = decoded.email;
      const displayName = decoded.name || decoded.name || '';
      const photoURL = decoded.picture || null;
      const id = decoded.uid;
  
      if (!email) {
        throw new HttpException('Email is required from IdToken', HttpStatus.BAD_REQUEST);
      }
  
      // Tìm user theo email
      const { data: found, error: findErr } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('email', email);
  
      if (findErr) {
        throw new HttpException(findErr.message, HttpStatus.BAD_REQUEST);
      }
  
      // Nếu chưa có: tạo mới
      if (!found || found.length === 0) {
        const usernameBase = (displayName || email.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '-');
        let username = usernameBase;
  
        // Đảm bảo unique username (thêm hậu tố khi cần)
        let suffix = 1;
        while (true) {
          const { data: existU, error: ue } = await this.supabaseService.getClient()
            .from('users')
            .select('id')
            .eq('username', username);
  
          if (ue) {
            throw new HttpException(ue.message, HttpStatus.BAD_REQUEST);
          }
          if (!existU || existU.length === 0) break;
          username = `${usernameBase}-${suffix++}`;
        }
  
        const insertPayload = {
          id,
          username,
          email,
          avatar_url: photoURL,
          bio: null,
          // phone: null, // chỉ thêm nếu DB có cột 'phone'
        };
  
        const { data: created, error: insErr } = await this.supabaseService.getClient()
          .from('users')
          .insert(insertPayload)
          .select()
          .single();
  
        if (insErr) {
          throw new HttpException(insErr.message, HttpStatus.BAD_REQUEST);
        }
        return created;
      }
  
      // Đã có user: trả về
      return found[0];
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(err.message || 'Token verification failed', HttpStatus.UNAUTHORIZED);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .insert(createUserDto)
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to create user: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll(search?: string): Promise<User[]> {
    try {
      let query = this.supabaseService.getClient()
        .from('users')
        .select('*');

      if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch users: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .update(updateUserDto)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        throw new HttpException(
          'User not found or update failed',
          HttpStatus.NOT_FOUND
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.getClient()
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Failed to delete user: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateStatus(id: string, isOnline: boolean): Promise<User> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .update({ is_online: isOnline, last_seen: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        throw new HttpException(
          'User not found or update failed',
          HttpStatus.NOT_FOUND
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user status',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}