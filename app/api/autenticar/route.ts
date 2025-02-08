import jwt from 'jsonwebtoken';
import { initUsuario, Usuario } from '../../modelos/usuario';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.NEXT_PUBLIC_JWT_SECRETO || '';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, {status: 401});
    }

    try {
      initUsuario();
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const decoded: any = jwt.verify(token, secretKey);
      const user = await Usuario.findByPk(decoded.id);

      if (!user) {
        return NextResponse.json({ message: 'Invalid token' }, {status: 401});
      }
      return NextResponse.json({ usuario: user }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token: ' + error }, {status: 401});
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error en autenticación: ' + error }, {status: 500});
  }
}