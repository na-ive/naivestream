'use server';

import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function authenticate(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (username === validUsername && password === validPassword) {
    // Valid credentials, set session
    await login(username);
    redirect('/admin');
  } else {
    return { error: 'Invalid username or password. Are you sure you belong here?' };
  }
}
