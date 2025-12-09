import { SignIn, SignInDTO } from '../dto/auth.dto';

export class AuthService {
 constructor(private baseUrl: string = 'http://localhost:3000') {}

 async signIn(username: string, password: string): Promise<SignIn> {
  const dto: SignInDTO = { username, password };
  const response = await fetch(`${this.baseUrl}/auth/login`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(dto),
  });

  if (!response.ok) {
   const error = await response.json();
   throw new Error(error.message || 'Failed to sign in');
  }

  const data = (await response.json()) as SignIn;
  return data;
 }
}

export const authService = new AuthService();
