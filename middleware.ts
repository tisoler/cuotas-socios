import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Excluir la ruta de login
  if (pathname.startsWith('/api/login') || !pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Verificar el token para todas las demás rutas
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 403 });
  }

  try {
    const secretKey = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRETO || '');
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const decoded: any = jwtVerify(token, secretKey);
    req.headers.set('id_usuario', decoded.id);
    return NextResponse.next();
  } catch (err) {
    console.error(`Error autenticando el token: ${err}`);
    return NextResponse.json({ message: 'Error autenticando el token' }, { status: 500 });
  }
}
