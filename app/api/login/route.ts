import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { initUsuario, Usuario } from '../../modelos/usuario';

export async function POST(request: NextRequest) {
  try {
    await initUsuario();
    if (request.method === 'POST') {
      const { username, password } = await request.json();
      const user = await Usuario.findOne({ where: { nombre_usuario: username } });
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, nombre_usuario: user.nombre_usuario }, process.env.NEXT_PUBLIC_JWT_SECRETO || '', { expiresIn: '5d' });
        return NextResponse.json({ token, usuario: user });
      } else {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error en login: ' + error }, {status: 500});
  }
}
