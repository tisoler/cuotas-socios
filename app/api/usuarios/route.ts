import { NextResponse } from 'next/server';
import { Usuario, initUsuario } from '../../modelos/usuario';

export async function GET() {
  try {
    await initUsuario();

    const usuarios = await Usuario.findAll();

    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ message: 'Error recuperando usuarios: ' + error }, { status: 500 });
  }
}
