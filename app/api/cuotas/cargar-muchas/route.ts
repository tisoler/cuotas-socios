import { NextRequest, NextResponse } from 'next/server';
import { Cuota, initCuota } from '@/app/modelos/cuota';

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
          },
          { where: { id: cuota.id } }
        );
      } else {
        // Si no tiene id creo una nueva cuota
        await Cuota.create({
          id_socio: cuota.idSocio,
          mes: cuota.tipoPago === 'anual' ? 13 : cuota.mes,
          anio: new Date().getFullYear(),
          medio_pago: 'cobradora-efectivo',
          id_usuario_carga: idUsuario,
          estado: 'pagada',
        });
      }
    }

    return NextResponse.json({ message: 'Cuotas actualizadas exitosamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error actualizando cuotas: ' + error }, { status: 500 });
  }
}
