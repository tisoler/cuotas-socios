import { NextRequest, NextResponse } from 'next/server';
import { Cuota, initCuota } from '../../../modelos/cuota';
import { VALOR_BONO_ANUAL, VALOR_CUOTA_MENSUAL } from '../../../lib/constantes';

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
        fecha_carga: new Date(),
        monto: tipoPago === 'anual' ? VALOR_BONO_ANUAL : VALOR_CUOTA_MENSUAL,
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
