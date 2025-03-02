import { NextRequest, NextResponse } from 'next/server';
import { Cuota, initCuota } from '../../../modelos/cuota';
import { VALOR_BONO_ANUAL, VALOR_CUOTA_MENSUAL } from '../../../lib/constantes';

export async function POST(request: NextRequest) {
  try {
    await initCuota();
    const data = await request.json();
    const cuotasParaActualizar = data.cuotas;
    const idUsuario = data.idUsuario;

    for (const cuota of cuotasParaActualizar) {
      if (cuota.id > -1) {
        // Si tiene id actualizo la cuota
        await Cuota.update(
          {
            estado: 'pagada',
            id_usuario_carga: idUsuario,
            monto: cuota.mes === 13 ? VALOR_BONO_ANUAL : VALOR_CUOTA_MENSUAL,
          },
          { where: { id: cuota.id } }
        );
      } else {
        // Si no tiene id creo una nueva cuota
        await Cuota.create({
          id_socio: cuota.idSocio,
          mes: cuota.mes,
          anio: new Date().getFullYear(),
          medio_pago: 'cobradora-efectivo',
          id_usuario_carga: idUsuario,
          estado: 'pagada',
          fecha_carga: new Date(),
          monto: cuota.mes === 13 ? VALOR_BONO_ANUAL : VALOR_CUOTA_MENSUAL,
        });
      }
    }

    return NextResponse.json({ message: 'Cuotas actualizadas exitosamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error actualizando cuotas: ' + error }, { status: 500 });
  }
}
