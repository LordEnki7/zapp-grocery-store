// Security utilities for ZAPP e-commerce platform
import DOMPurify from 'dompurify';

// Input validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  productId: /^[A-Z]{3}-\d{3,}$/,
  currency: /^[A-Z]{3}$/,
  price: /^\d+(\.\d{2})?$/,
  quantity: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  slug: /^[a-z0-9-]+$/
};

// Input sanitization
export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>\"'&]/g, '');
  }

  static sanitizeNumber(input: string | number): number {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    return isNaN(num) ? 0 : Math.max(0, num);
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static sanitizeProductData(product: any): any {
    return {
      ...product,
      name: this.sanitizeString(product.name || ''),
      description: this.sanitizeHtml(product.description || ''),
      price: this.sanitizeNumber(product.price || 0),
      category: this.sanitizeString(product.category || ''),
      origin: this.sanitizeString(product.origin || '')
    };
  }
}

// Rate limiting for API calls
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static readonly WINDOW_MS = 60000; // 1 minute
  private static readonly MAX_REQUESTS = 100; // per window

  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}

// Security headers for API responses
export const SecurityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.googleapis.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Encryption utilities for sensitive data
export class DataEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer
    );
    
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);
    
    return btoa(String.fromCharCode(...result));
  }

  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}

// Session management
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly STORAGE_KEY = 'zapp_session';

  static createSession(userId: string, role: string): void {
    const session = {
      userId,
      role,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  static getSession(): any | null {
    const sessionData = localStorage.getItem(this.STORAGE_KEY);
    if (!sessionData) return null;
    
    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check if session has expired
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.clearSession();
        return null;
      }
      
      // Update last activity
      session.lastActivity = now;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isValidSession(): boolean {
    return this.getSession() !== null;
  }
}

// Audit logging
export class AuditLogger {
  static async log(action: string, userId: string, details: any = {}): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      details,
      userAgent: navigator.userAgent,
      ip: await this.getClientIP()
    };
    
    // In production, send to secure logging service
    console.log('AUDIT LOG:', logEntry);
    
    // Store in local storage for development (in production, use secure backend)
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 logs in local storage
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(logs));
  }

  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

// Permission system
export enum Permission {
  READ_PRODUCTS = 'read:products',
  WRITE_PRODUCTS = 'write:products',
  DELETE_PRODUCTS = 'delete:products',
  READ_ORDERS = 'read:orders',
  WRITE_ORDERS = 'write:orders',
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  ADMIN_DASHBOARD = 'admin:dashboard',
  MANAGE_INVENTORY = 'manage:inventory',
  VIEW_ANALYTICS = 'view:analytics'
}

export const RolePermissions = {
  customer: [
    Permission.READ_PRODUCTS,
    Permission.WRITE_ORDERS
  ],
  admin: [
    Permission.READ_PRODUCTS,
    Permission.WRITE_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.READ_ORDERS,
    Permission.WRITE_ORDERS,
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.ADMIN_DASHBOARD,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_ANALYTICS
  ],
  manager: [
    Permission.READ_PRODUCTS,
    Permission.WRITE_PRODUCTS,
    Permission.READ_ORDERS,
    Permission.WRITE_ORDERS,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_ANALYTICS
  ]
};

export class PermissionChecker {
  static hasPermission(userRole: string, permission: Permission): boolean {
    const rolePermissions = RolePermissions[userRole as keyof typeof RolePermissions];
    return rolePermissions?.includes(permission) || false;
  }

  static requirePermission(userRole: string, permission: Permission): void {
    if (!this.hasPermission(userRole, permission)) {
      throw new Error(`Access denied: Missing permission ${permission}`);
    }
  }
}