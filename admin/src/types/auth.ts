export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'editor';
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export type FieldError = string | null;
export type FormErrors<T> = Partial<Record<keyof T, string>>;
