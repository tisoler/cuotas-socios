import { NextRequest, NextResponse } from 'next/server';
import { Cuota, initCuota } from '../../../modelos/cuota';

export async function POST(request: NextRequest) {
  try {
    await initCuota();
    const data = await request.json();
    const cuotasParaActualizar = data.cuotas;
    const idUsuario = data.idUsuario;

    for (const cuota of cuotasParaActualizar) {
      // NO RENDIR SI NO ESTÄ PAGADA
      if (cuota.id > -1) {
        // Si tiene id actualizo la cuota
        await Cuota.update(
          {
            estado: 'rendida',
            rendido: true,
            id_usuario_rendicion: idUsuario,
            fecha_rendicion: new Date(),
          },
          { where: { id: cuota.id } }
        );
      }
    }

    return NextResponse.json({ message: 'Cuotas actualizadas exitosamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error actualizando cuotas: ' + error }, { status: 500 });
  }
}
