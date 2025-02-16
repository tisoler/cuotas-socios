'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Socio } from '../modelos/socio';
import { Usuario } from '../modelos/usuario';
import { getToken } from '../lib/autenticar';
import { useUser } from '../contextos/usuario';
import * as XLSX from 'xlsx';

type Celda = { id: number, idSocio: number, mes: number };

const MatrizCuotas= () => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [selectedCells, setSelectedCells] = useState<Celda[]>([]);
  const [filtroTipoPago, setFiltroTipoPago] = useState<string>('');
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>('');
  const { user } = useUser();
  const [total, setTotal] = useState<number>(0);
  const [totalPagado, setTotalPagado] = useState<number>(0);
  const [totalRendido, setTotalRendido] = useState<number>(0);
  const [totalPorRendir, setTotalPorRendir] = useState<number>(0);
  const [comisionCobradora, setComisionCobradora] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(true);

  const fetchSocios = async () => {
    setCargando(true);
    const res = await fetch('/api/socios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    const data = await res.json();
    setSocios(data);
    setCargando(false);
  };

  const fetchUsuarios = async () => {
    const res = await fetch('/api/usuarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => {
    fetchSocios();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (selectedCells?.length) {
      const nuevoTotal = selectedCells.reduce((p: number, a) => p + (a.mes === 13 ? 40000 : 4000), 0)
      setTotalPorRendir(nuevoTotal);
    } else {
      setTotalPorRendir(0);
    }
  }, [selectedCells]);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handleCellClick = (idSocio: number, mes: number, id: number) => {
    const socio = socios.find(s => s.id === idSocio);
    if (!socio) return;
    const cuotaExistente = socio.cuotas?.find(c => c.mes === mes && c.anio === new Date().getFullYear());
    // Si el socio/a está bonificado/a o becado/a
    if (socio.tipo_pago === 'bonificado/a' || socio.tipo_pago === 'becado/a') return;
    // Si es cuota rendida no se puede elegir
    if (cuotaExistente?.rendido) return;
    // Si estamos cargando y es cuota pagada no se puede elegir
    if (user?.rol === 'cobrador' && cuotaExistente?.estado === 'pagada') return;
    // Si estamos rindiendo y es cuota pendiente no se puede elegir
    if (user?.rol === 'tesorero' && (cuotaExistente?.estado === 'pendiente' || !cuotaExistente)) return;

    const cellIndex = selectedCells.findIndex(cell => cell.idSocio === idSocio && cell.mes === mes);
    const yaSeleccionada = cellIndex > -1;
    if (yaSeleccionada) {
      // Desseleccionar la celda
      setSelectedCells(selectedCells.filter((_, index) => index !== cellIndex));
    } else {
      setSelectedCells([...selectedCells, { id: id, idSocio, mes }]);
    }
  };

  const handleCargarClick = async () => {
    if (selectedCells?.length === 0) return;
    setCargando(true);
    await fetch('/api/cuotas/cargar-muchas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ cuotas: selectedCells, idUsuario: user?.id || 1 }),
    });

    setSelectedCells([]);
    fetchSocios();
    setCargando(false);
  };

  const handleRendirClick = async () => {
    if (selectedCells?.length === 0) return;
    setCargando(true);
    await fetch('/api/cuotas/rendir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ cuotas: selectedCells, idUsuario: user?.id || 1 }),
    });

    setSelectedCells([]);
    fetchSocios();
    setCargando(false);
  };

  const handleUsuarioClick = (idUsuario: number) => {
    const mismoUsuario = usuarioSeleccionado?.id === idUsuario;
    if (mismoUsuario) {
      setUsuarioSeleccionado(null);
      setSelectedCells([]);
      return;
    }

    setUsuarioSeleccionado(usuarios.find(u => u.id === idUsuario) || null);
    const nuevasCeldasSeleccionadas = socios?.flatMap(socio =>
      socio.cuotas
        ?.filter(cuota => cuota.estado?.toLowerCase() === 'pagada' && cuota.id_usuario_carga === idUsuario)
        .map(cuota => ({ id: cuota.id, idSocio: socio.id, mes: cuota.mes }))
    ) as Celda[];
    setSelectedCells(nuevasCeldasSeleccionadas);
  };

  const exportarAExcel = async () => {
    setCargando(true);
    const table = document.getElementById('cuotas-table');
    const worksheet = XLSX.utils.table_to_sheet(table);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cuotas');
    XLSX.writeFile(workbook, 'cuotas.xlsx');
    setCargando(false);
  };

  const sociosFiltrados = socios.filter(socio => {
    return (
      (filtroTipoPago ? socio.tipo_pago === filtroTipoPago : true) &&
      (filtroMedioPago ? socio.medio_pago === filtroMedioPago : true)
    );
  });

  const calcularTotales = useCallback(() => {
    let total = 0;
    let totalPagado = 0;
    let totalRendido = 0;
    let comision = 0;
    socios?.forEach(s => {
      s.cuotas?.forEach(c => {
        const montoCuota = s.tipo_pago === 'mensual' ? 4000 : 40000;
        total += montoCuota;
        if (c.estado === 'pagada') {
          totalPagado += montoCuota;
        }
        if (c.estado === 'rendida') {
          totalRendido += montoCuota;
        }
      });
    });
    selectedCells?.forEach(cs => {
      if (cs.mes === 13) {
        comision += 40000 * 0.1;
      } else {
        comision += 4000 * 0.2;
      }
    });
    setTotal(total);
    setTotalPagado(totalPagado);
    setTotalRendido(totalRendido);
    setComisionCobradora(comision);
  }, [socios, selectedCells]);

  useEffect(() => {
    calcularTotales();
  }, [socios, calcularTotales]);

  if (cargando) {
    return <div className="flex m-4 justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-2 p-4 px-2 flex flex-col">
      <div className='flex items-center justify-between mb-4'>
        <h1 className="w-full text-xl text-center font-bold">Listado de socios/as y cuotas</h1>
        <div className='flex gap-2 items-center'>
          {
            user?.rol !== 'tesorero' && (
              <button
                className="px-4 py-2 cursor-pointer font-bold bg-blue-300 text-white rounded hover:bg-white hover:text-blue-500 active:bg-blue-700 active:text-white"
                onClick={handleCargarClick}
              >
                Cargar
              </button>
            )
          }
          {
            user?.rol !== 'cobrador' && (
              <button
                className="px-4 py-2 cursor-pointer font-bold bg-blue-500 text-white rounded hover:bg-white hover:text-blue-700 active:bg-blue-900 active:text-white"
                onClick={handleRendirClick}
              >
                Rendir
              </button>
            )
          }
          <button
            className="px-4 py-2 cursor-pointer font-bold bg-green-500 text-white rounded hover:bg-white hover:text-green-700 active:bg-green-900 active:text-white"
            onClick={exportarAExcel}
          >
            Exportar
          </button>
        </div>
      </div>
      <div className="flex w-full">
        <div className='flex flex-col w-11/12'>
          <div className="mb-4 border-1 px-2 py-2 flex justify-between items-center">
            <div>
              <label className="mr-2">Tipo de Pago:</label>
              <select value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)} className="mr-4 py-2 px-1 border-1">
                <option value="">Todos</option>
                <option value="anual">Anual</option>
                <option value="mensual">Mensual</option>
              </select>
              <label className="mr-2">Medio de Pago:</label>
              <select value={filtroMedioPago} onChange={(e) => setFiltroMedioPago(e.target.value)} className="py-2 px-1 border-1">
                <option value="">Todos</option>
                <option value="cobradora-efectivo">Cobradora Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="buffet-efectivo">Buffet Efectivo</option>
              </select>
            </div>
            <div className='flex gap-1 h-full bg-white text-black items-center px-2'>
              <span className='pr-2 border-r-2'>Total pagado no rendido: ${totalPagado} (%{totalPagado/total})</span>
              <span className='pr-2 border-r-2'>Total rendido: ${totalRendido} (%{totalRendido/total})</span>
              <span className='bg-blue-400 p-1'>
                {user?.rol === 'admin' ? 'Monto a cargar o rendir' : user?.rol === 'cobrador' ? 'Monto a cargar' : 'Monto a rendir' }: ${totalPorRendir}
              </span>
              <span className='bg-blue-400 p-1'>
                Comisión: ${comisionCobradora}
              </span>
            </div>
          </div>
          <table id="cuotas-table" className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-2 py-1">Socio/a</th>
                {meses.map((mes, index) => (
                  <th key={index} className="px-2 py-1">{mes}</th>
                ))}
                <th className="px-2 py-1">Contacto</th>
              </tr>
            </thead>
            <tbody className='text-sm'>
              {sociosFiltrados.map((socio) => (
                <tr key={socio.id}>
                  <td className="border px-2 py-1">{socio.nombre}</td>
                  {
                    (socio.tipo_pago === 'bonificado/a' || socio.tipo_pago === 'becado/a') ? (
                      <td
                        key={`${socio.id}-13`}
                        className={`border px-2 py-1 text-center cursor-pointer bg-neutral-400 text-black`}
                        colSpan={12}
                      >
                        { socio.tipo_pago.charAt(0).toUpperCase() + socio.tipo_pago.slice(1).toLowerCase() }
                      </td>
                    ) : socio.tipo_pago === 'anual' ? (
                      (() => {
                        const cuotaExistente = socio?.cuotas?.find(c => c.mes === 13 && c.anio === new Date().getFullYear());
                        const isSelected = selectedCells.some(cell => cell.idSocio === socio.id && cell.mes === 13);
                        let backgroundColor = '';
                        if (usuarioSeleccionado?.id === cuotaExistente?.id_usuario_carga && cuotaExistente?.estado?.toLowerCase() === 'pagada') {
                          backgroundColor = usuarioSeleccionado?.color || '';
                        } else if (cuotaExistente?.estado?.toLowerCase() === 'rendida') {
                          backgroundColor = '#279341';
                        }

                        return (
                          <td
                            key={`${socio.id}-13`}
                            className={`border px-2 py-1 text-center cursor-pointer ${isSelected ? 'bg-indigo-400' : ''}`}
                            style={{ backgroundColor }}
                            onClick={() => handleCellClick(socio.id, 13, cuotaExistente?.id || -1)}
                            colSpan={12}
                          >
                            {cuotaExistente
                              ? cuotaExistente.estado.charAt(0).toUpperCase() + cuotaExistente.estado.slice(1).toLowerCase()
                              : 'Pendiente'
                            }
                          </td>
                        );
                      })()
                    ) : (
                      meses.map((_, index) => {
                        const cuotaExistente = socio?.cuotas?.find(c => c.mes === index + 1 && c.anio === new Date().getFullYear());
                        const isSelected = selectedCells.some(cell => cell.idSocio === socio.id && cell.mes === index + 1);
                        let backgroundColor = '';
                        if (usuarioSeleccionado?.id === cuotaExistente?.id_usuario_carga && cuotaExistente?.estado?.toLowerCase() === 'pagada') {
                          backgroundColor = usuarioSeleccionado?.color || '';
                        } else if (cuotaExistente?.estado?.toLowerCase() === 'rendida') {
                          backgroundColor = '#279341';
                        }
      
                        return (
                          <td
                            key={`${socio.id}-${index + 1}`}
                            className={`border px-2 py-1 text-center cursor-pointer ${isSelected ? 'bg-indigo-400' : ''}`}
                            style={{ backgroundColor }}
                            onClick={() => handleCellClick(socio.id, index + 1, cuotaExistente?.id || -1)}
                          >
                            {cuotaExistente
                              ? cuotaExistente.estado.charAt(0).toUpperCase() + cuotaExistente.estado.slice(1).toLowerCase()
                              : 'Pendiente'
                            }
                          </td>
                        );
                      })
                    )
                  }
                  <td className="border px-1 py-1 text-center">
                    {socio.telefono_contacto && (
                      <a href={`https://wa.me/${socio.telefono_contacto}`} className='flex justify-center' target="_blank" rel="noopener noreferrer">
                        <Image width={30} height={30} className="object-cover" alt="WhatsApp" src={`/whatsapp.svg`} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center w-1/12 ml-2 p-2 border-1">
          <h2 className="text-base font-bold mb-4">Usuario/a</h2>
          {usuarios.map(usuario => (
            <button
              key={usuario.id}
              className={`block w-full text-base font-bold mb-2 px-3 py-2 cursor-pointer text-white hover:bg-white hover:text-black rounded`}
              style={{ backgroundColor: usuario.color }}
              onClick={() => handleUsuarioClick(usuario.id)}
            >
              {usuario.nombre_usuario}
            </button>
          ))}
        </div>
      </div>
      <div className='flex flex-col w-full'>
        {
          user?.rol !== 'tesorero' && (
            <button
              className="mt-4 px-4 py-2 cursor-pointer font-bold bg-blue-300 text-white rounded hover:bg-white hover:text-blue-500 active:bg-blue-700 active:text-white"
              onClick={handleCargarClick}
            >
              Cargar
            </button>
          )
        }
        {
          user?.rol !== 'cobrador' && (
            <button
              className="mt-2 px-4 py-2 cursor-pointer font-bold bg-blue-500 text-white rounded hover:bg-white hover:text-blue-700 active:bg-blue-900 active:text-white"
              onClick={handleRendirClick}
            >
              Rendir
            </button>
          )
        }
        <button
          className="mt-2 px-4 py-2 cursor-pointer font-bold bg-green-500 text-white rounded hover:bg-white hover:text-green-700 active:bg-green-900 active:text-white"
          onClick={exportarAExcel}
        >
          Exportar
        </button>
      </div>
    </div>
  );
};

export default MatrizCuotas;
