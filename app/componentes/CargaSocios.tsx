'use client'
import { useState } from 'react';
import Papa from 'papaparse';
import { getToken } from '../lib/autenticar';

const convertirTipoPago = (tipoPago: string) => {
  if (tipoPago.includes('anual')) return 'anual';
  if (tipoPago.includes('mensual')) return 'mensual';
  return tipoPago;
};

const convertirMedioPago = (medioPago: string) => {
  if (medioPago === 'Buffet de pádel') return 'buffet-efectivo';
  if (medioPago === 'Cobradora (efectivo)') return 'cobradora-efectivo';
  if (medioPago === 'Transferencia') return 'transferencia';
  return medioPago;
};

const convertirPlanFamiliar = (planFamiliar: string) => {
  if (planFamiliar === '3 socios/as, pagan 2') return '3x2';
  if (planFamiliar === '4 socios/as, pagan 3') return '4x3';
  return planFamiliar;
};

const CargarSocios: React.FC = () => {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const [socios, setSocios] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          /* eslint-disable  @typescript-eslint/no-explicit-any */
          const data = results.data.map((row: any) => ({
            nombre: row.nombre,
            domicilio: row.domicilio,
            dni: row.dni,
            telefono_contacto: row.telefono_contacto,
            actividad: row.actividad,
            fecha_inicio: row.fecha_inicio,
            tipo_pago: convertirTipoPago(row.tipo_pago),
            medio_pago: convertirMedioPago(row.medio_pago),
            plan_familiar: convertirPlanFamiliar(row.plan_familiar),
            otros_miembros: row.otros_miembros,
            numero_socio: row.numero_socio,
          }));
          setSocios(data);
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!socios?.length) return;

    try {
      setCargando(true);
      const response = await fetch('/api/socios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ socios }),
      });

      setCargando(false);
      if (response.ok) {
        alert('Datos cargados exitosamente');
      } else {
        console.error('Error cargando datos');
      }
    } catch (error) {
      setCargando(false);
      console.error('Error cargando datos:', error);
    }
  };

  if (cargando) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div>
      <input type="file" accept=".csv" className='cursor-pointer' onChange={handleFileUpload} />
      <button onClick={handleSubmit} className='cursor-pointer p-4 bg-amber-700'>Cargar Socios</button>
    </div>
  );
};

export default CargarSocios;
