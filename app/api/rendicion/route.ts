import { NextRequest, NextResponse } from 'next/server';
import { initRendicion, Rendicion } from '../../modelos/rendicion';
import { Usuario } from '../../modelos/usuario';

export async function GET(request: NextRequest) {
  try {
    await initRendicion();
    if (request.method === 'GET') {
      const rendiciones = await Rendicion.findAll({
        include: [
          {
            model: Usuario,
            as: 'usuario',
          },
        ],
      }) || [];

      return NextResponse.json(rendiciones);
    } else {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error recuperando rendiciones: ' + error }, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  try {
    await initRendicion();
    if (request.method === 'POST') {
      const { idUsuario, montoRendido, comision } = await request.json();
      const rendicion = await Rendicion.create({
        fecha: new Date(),
        id_usuario: idUsuario,
        monto_rendido: montoRendido,
        comision,
      });
      if (rendicion?.id) {
        return NextResponse.json(rendicion);
      } else {
        return NextResponse.json({ message: 'Error al guardar rendición.' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error al guardar rendición: ' + error }, {status: 500});
  }
}
