'use client';
import { useState, useEffect, useRef } from 'react';
import { Socio } from '../modelos/socio';
import { getToken } from '../lib/autenticar';
import { useUser } from '../contextos/usuario';

type Mes = {
  etiqueta: string,
  valor: number,
}

const MESES = [
  { etiqueta: 'Enero', valor: 1 },
  { etiqueta: 'Febrero', valor: 2 },
  { etiqueta: 'Marzo', valor: 3 },
  { etiqueta: 'Abril', valor: 4 },
  { etiqueta: 'Mayo', valor: 5 },
  { etiqueta: 'Junio', valor: 6 },
  { etiqueta: 'Julio', valor: 7 },
  { etiqueta: 'Agosto', valor: 8 },
  { etiqueta: 'Septiembre', valor: 9 },
  { etiqueta: 'Octubre', valor: 10 },
  { etiqueta: 'Noviembre', valor: 11 },
  { etiqueta: 'Diciembre', valor: 12 },
]

export default function FormularioCuota() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [mes, setMes] = useState<Mes>();
  const [medioPago, setMedioPago] = useState('');
  const meses = useRef<Mes[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredSocios, setFilteredSocios] = useState<Socio[]>([]);
  const [buscandoSocio, setBuscandoSocio] = useState<boolean>(false);

  const { user } = useUser();

  const cargarSocios = () => {
    setCargando(true);
    fetch('/api/socios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setSocios(data);
        setMedioPago(medioPago || 'cobradora-efectivo');
        if (data?.length > 0) {
          if (selectedSocio) {
            setSelectedSocio(data.find((s: Socio) => s.id === selectedSocio.id) || data[0]);
          } else {
            setSelectedSocio(data[0]);
          }
        }
        setCargando(false);
      }).catch(() => {
        alert('Error cargando socios');
        setCargando(false);
      });
  };

  useEffect(() => {
    // Fetch socios from API
    cargarSocios();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      setFilteredSocios(socios.filter(socio => socio.nombre.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      setFilteredSocios(socios);
    }
  }, [searchTerm, socios]);

  useEffect(() => {
    if (!selectedSocio) return;
    meses.current = MESES.filter(mes => 
      !selectedSocio?.cuotas?.some(c => c.mes === mes.valor && 
        c.anio === new Date().getFullYear() && 
        c.estado?.toLowerCase() !== 'pendiente') && mes.valor <= new Date().getMonth() + 1
      );

    if (meses.current?.length > 0) setMes(meses.current[0]);
  }, [selectedSocio]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!selectedSocio) return;
    e.preventDefault();
    const res = await fetch('/api/cuotas/cargar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ idSocio: selectedSocio.id, tipoPago: selectedSocio.tipo_pago, mes: mes?.valor, medioPago, idUsuario: user?.id || 1 }),
    });
    if (res.ok) {
      alert('Cuota guardada correctamente.');
      cargarSocios();
    } else {
      alert('Error guardando cuota');
    }
  };

  // Mostrar spinner de carga hasta que se carguen los socios
  if (cargando) {
    return <div className="flex m-4 justify-center h-screen">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:w-4/12 w-11/12">
      <div className='flex justify-between items-center gap-2'>
        <label>Socio/a</label>
        <div className='w-8/12 flex flex-col gap-2'>
          <input
            type="text"
            className="w-full border p-2"
            placeholder="Buscar socio/a..."
            value={selectedSocio?.nombre || searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setSelectedSocio(null);
              setBuscandoSocio(true);
            }}
            onBlur={() => setBuscandoSocio(false)}
          />
          {buscandoSocio && filteredSocios.length > 0 && (
            <ul className="border p-2 max-h-40 overflow-y-auto">
              {filteredSocios.map((socio: Socio) => (
                <li
                  key={socio.id}
                  className="cursor-pointer p-2 hover:bg-gray-200"
                  onMouseDown={() => {
                    setSelectedSocio(socio);
                    setSearchTerm('');
                    setFilteredSocios([]);
                  }}
                >
                  {socio.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className='flex justify-between items-center gap-2'>
        <label>Tipo de Pago</label>
        <input type="text" value={`${!selectedSocio ? '' : selectedSocio?.tipo_pago === 'anual' ? 'Anual' : 'Mensual'}`} className="w-8/12 border p-2" disabled />
      </div>

      {
        (selectedSocio?.tipo_pago === 'anual' || selectedSocio?.estado_socio !== 'al-dia') && (
          <div className='flex justify-between items-center gap-2'>
            <label>{selectedSocio?.tipo_pago === 'anual' ? 'Año' : 'Mes'}</label>
            {selectedSocio?.tipo_pago === 'anual' ? (
                <input type="text" value={new Date().getFullYear()} className="w-8/12 border p-2" disabled />
              ) : (
                <select
                  onChange={(e) => setMes(MESES.find(m => m.valor === parseInt(e.target.value)))}
                  value={mes?.valor}
                  className="w-8/12 border p-2"
                >
                  { 
                    meses.current?.map((m) => (
                      <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
                    )
                  )}
                </select>
              )
            }
          </div>
        )
      }

      {
        selectedSocio?.estado_socio === 'al-dia' ? (
          <div className='flex justify-between items-center gap-2 w-full'>
            <label className='w-full text-center text-green-700 text-2xl font-bold border-white border-2 py-2 mt-4'>Al día</label>
          </div>
        ) : (
          <div className='flex justify-between items-center gap-2'>
            <label>Medio de Pago</label>
            <select onChange={(e) => setMedioPago(e.target.value)} value={medioPago} className="w-8/12 border p-2">
              <option value="cobradora-efectivo">Cobradora (Efectivo)</option>
              <option value="transferencia">Transferencia</option>
              <option value="buffet-efectivo">Buffet Pádel</option>
            </select>
          </div>
        )
      }

      {
        selectedSocio?.estado_socio !== 'al-dia' && (
          <>
            <button type="submit" className="bg-blue-500 text-white p-2 mt-5">Guardar</button>
            <button type="button" className="bg-gray-500 text-white p-2" onClick={() => { /* Reset form */ }}>Cancelar</button>
          </>
        )}
    </form>
  );
}
