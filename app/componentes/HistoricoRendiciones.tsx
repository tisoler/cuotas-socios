import { useEffect, useState } from "react";
import { getToken } from "../lib/autenticar";
import { Rendicion } from "../modelos/rendicion";
import { useUser } from "../contextos/usuario";

type DiccionarioRendicion = {
  [idUsuario: number]: Rendicion[];
}

const HistoricoRencdiciones = () => {
  const [cargando, setCargando] = useState(true);
  const [historicosRendiones, setHistoricosRendiciones] = useState<DiccionarioRendicion>();
   const { user } = useUser();

  useEffect(() => {
    const fetchRendiciones = async () => {
      setCargando(true);
      const res = await fetch('/api/rendicion', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      
      const data = await res.json();

      if (res.ok && data) {
        const diccionarioRendiciones: DiccionarioRendicion = {};
        data?.forEach((rendicion: Rendicion) => {
          if (!diccionarioRendiciones[rendicion.id_usuario]) {
            diccionarioRendiciones[rendicion.id_usuario] = [];
          }

          diccionarioRendiciones[rendicion.id_usuario].push(rendicion);
        });
        setHistoricosRendiciones(diccionarioRendiciones);
      }

      setCargando(false);
    };

    fetchRendiciones();
  }, []);

  if (cargando) {
    return <div className="flex m-4 justify-center h-screen">Cargando...</div>;
  }


  return (
    <div>
      <h1 className="text-center pb-6 text-xl">Historico de Rendiciones</h1>
      <div className="flex gap-16">
        {
          historicosRendiones && Object.keys(historicosRendiones).map((idUsuario) => {
            if (user?.rol === 'cobrador' && parseInt(idUsuario) !== user.id) {
              return null;
            }

            const rendiciones = historicosRendiones[parseInt(idUsuario)];
            return (
              <div key={idUsuario}>
                <div className={`py-2`} style={{ backgroundColor: rendiciones[0].usuario?.color }}>
                  <h2 className="text-center font-bold">{rendiciones[0].usuario?.nombre_usuario}</h2>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th className="border border-white p-2">Fecha</th>
                      <th className="border border-white p-2">Monto rendido</th>
                      <th className="border border-white p-2">Comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendiciones?.map(rendicion => (
                      <tr key={rendicion.id}>
                        <td className="border border-white p-2">{rendicion.fecha ? new Date(rendicion.fecha).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        }) : ''}</td>
                        <td className="border border-white p-2">{rendicion.monto_rendido}</td>
                        <td className="border border-white p-2">{rendicion.comision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default HistoricoRencdiciones;
