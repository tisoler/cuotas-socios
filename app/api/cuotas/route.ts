import { NextRequest, NextResponse } from 'next/server';
import { initSocio, Socio } from '../../modelos/socio';
import { Cuota, initCuota } from '../../modelos/cuota';

export async function GET(request: NextRequest) {
  try {
    await initCuota();
    await initSocio();
    if (request.method === 'GET') {
      const cuotas = await Cuota.findAll({
        include: [
          {
            model: Socio,
            as: 'socio',
          },
        ],
      }) || [];

      return NextResponse.json(cuotas);
    } else {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error recuperando cuotas: ' + error }, {status: 500});
  }
}
