// 用户相关类型定义

// 用户基本信息
export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
  nickname?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 用户状态
export interface UserState {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 登录请求
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
  remember?: boolean;
}

// 登录响应
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: UserInfo;
  expiresIn?: number;
}

// 注册请求
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
  phone?: string;
}

// 注册响应
export interface RegisterResponse {
  user: UserInfo;
  message: string;
}

// 更新用户信息请求
export interface UpdateUserRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 用户权限
export type UserRole = 'admin' | 'user' | 'guest';

// 用户设置
export interface UserSettings {
  language: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark';
  notifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// 用户API接口类型
export interface UserApiService {
  // 认证相关
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  register(request: RegisterRequest): Promise<RegisterResponse>;
  refreshToken(refreshToken: string): Promise<LoginResponse>;
  
  // 用户信息相关
  getUserInfo(): Promise<UserInfo>;
  updateUserInfo(request: UpdateUserRequest): Promise<UserInfo>;
  changePassword(request: ChangePasswordRequest): Promise<void>;
  
  // 用户设置相关
  getUserSettings(): Promise<UserSettings>;
  updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
}
