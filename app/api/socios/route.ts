import { NextRequest, NextResponse } from 'next/server';
import { Socio, initSocio } from '../../modelos/socio';
import { Cuota } from '../../modelos/cuota';

export async function GET(request: NextRequest) {
  try {
    await initSocio();
    if (request.method === 'GET') {
      const socios = await Socio.findAll({
        include: [
          {
            model: Cuota,
            as: 'cuotas',
          },
        ],
      }) || [];

      socios.forEach((socio) => {
        if (socio.tipo_pago === 'mensual') {
          // Verificar que el socio tiene cuotas cargadas hasta el mes en curso para el año actual en estado diferente a pendiente
          const mesActual = new Date().getMonth() + 1;
          const cuotas = socio.cuotas?.filter((cuota) => cuota.anio === new Date().getFullYear());
          if (cuotas?.every((cuota) => cuota.estado?.toLowerCase() !== 'pendiente') && Array(mesActual).fill(0).map((_, i) => i + 1).every((mes) => cuotas.some((cuota) => cuota.mes === mes))) {
            socio.estado_socio = 'al-dia';
          } else {
            socio.estado_socio = 'moroso';
          }
        } else {
          // Verificar que tiene una cuota con año actual y mes = 13 con estado diferente de pendiente
          const cuotaAnualPagada = socio.cuotas?.find((cuota) => cuota.anio === new Date().getFullYear() && cuota.mes === 13 && cuota.estado?.toLowerCase() !== 'pendiente');
          socio.estado_socio = cuotaAnualPagada ? 'al-dia' : 'moroso';
        }
      });

      return NextResponse.json(socios);
    } else {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error recuperando socios/as: ' + error }, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  try {
    await initSocio();
    const data = await request.json();
    const socios = data.socios;

    await Socio.bulkCreate(socios);

    return NextResponse.json({ message: 'Socios agregados exitosamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error agregando socios: ' + error }, { status: 500 });
  }
}
