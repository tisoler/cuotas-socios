import { NextRequest, NextResponse } from 'next/server';
import { Cuota, initCuota } from '@/app/modelos/cuota';

export async function POST(request: NextRequest) {
  try {
    await initCuota();
    if (request.method === 'POST') {
      const { idSocio, tipoPago, mes, medioPago, idUsuario } = await request.json();
      const cuota = await Cuota.create({
        id_socio: idSocio,
        mes: tipoPago === 'anual' ? 13 : mes,
        anio: new Date().getFullYear(),
        medio_pago: medioPago,
        id_usuario_carga: idUsuario,
        estado: 'pagada',
      });
      if (cuota?.id) {
        return NextResponse.json(cuota);
      } else {
        return NextResponse.json({ message: 'Error al guardar cuota.' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error al guardar cuota: ' + error }, {status: 500});
  }
}
