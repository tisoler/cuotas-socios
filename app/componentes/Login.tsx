'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useUser } from '../contextos/usuario';
import { setToken } from '../lib/autenticar';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setUser } = useUser();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setUser(data.usuario);
      // Redirigir a /cargar
      router.push('/cargar');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:w-4/12 w-8/12">
      <div className='flex flex-col items-center'>
        <label>Usuario</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2 w-full" />
      </div>
      <div className='flex flex-col items-center'>
        <label>Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" />
      </div>
      <button type="submit" className="cursor-pointer bg-blue-500 text-white p-2 mt-6">Login</button>
    </form>
  );
}
