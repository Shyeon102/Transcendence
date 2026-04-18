import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  StoredUser,
} from '../../types';

const DELAY_MS = 500;
const mockUsers: StoredUser[] = [
  {
    id: 1,
    email: 'demo@demo.demo',
    username: 'demo',
    password: 'demo1234',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const withoutPassword = (user: StoredUser) => {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
};

const makeToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export async function mockLogin(req: LoginRequest): Promise<LoginResponse> {
  await delay(DELAY_MS);
  const found = mockUsers.find(
    (u) => u.email === req.email && u.password === req.password
  );
  if (!found) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  return { user: withoutPassword(found), token: makeToken() };
}

export async function mockSignup(req: SignupRequest): Promise<SignupResponse> {
  await delay(DELAY_MS);
  if (req.password !== req.passwordConfirm) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }
  if (req.password.length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다.');
  }
  if (mockUsers.some((u) => u.email === req.email)) {
    throw new Error('이미 사용 중인 이메일입니다.');
  }
  const newUser: StoredUser = {
    id: Date.now(),
    email: req.email,
    username: req.username,
    password: req.password,
  };
  mockUsers.push(newUser);
  return { user: withoutPassword(newUser), token: makeToken() };
}
