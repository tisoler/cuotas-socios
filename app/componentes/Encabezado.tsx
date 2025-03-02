'use client';
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "../contextos/usuario";
import { useEffect, useState } from "react";

const Encabezado: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isMounted) {
    return null;
  }

  const isLoginPage = pathname === '/';

  return (
    <header className={`relative bg-red-700 text-white p-4 flex items-center justify-between h-[100px]`}>
      <div className="flex gap-2 flex-col md:flex-row text-xs md:text-base">
        {!isLoginPage && (
          <>
            <div className="flex items-center">
              <button onClick={() => router.push('/cargar')} className="cursor-pointer bg-blue-500 px-4 py-2 rounded">
                Cargar
              </button>
            </div>
            <div className="flex items-center">
              <button onClick={() => router.push('/rendir')} className="cursor-pointer bg-green-700 px-4 py-2 rounded">
                {user?.rol === 'cobrador' ? 'Cargar muchas' : 'Rendir'}
              </button>
            </div>
            <div className="flex items-center">
              <button onClick={() => router.push('/rendiciones')} className="cursor-pointer bg-violet-600 px-4 py-2 rounded">
                Rendiciones
              </button>
            </div>
          </>
        )}
        {!isLoginPage && user?.rol === 'admin' && (
          <div className="flex items-center">
            <button onClick={() => router.push('/socios-carga')} className="cursor-pointer bg-amber-500 px-4 py-2 rounded">
              Cargar socios/as
            </button>
          </div>
        )}
      </div>
      <Image src="/escudo_social.svg" alt="Escudo Club Social" width={85} height={85} className="absolute left-[calc(50%-42.5px)]" />
      {!isLoginPage && user && (
        <div className="flex gap-2 items-center flex-col md:flex-row text-xs md:text-base justify-between">
          <span className="mr-4 h-[32px] leading-[32px]">Hola, {user.nombre_usuario}</span>
          <button onClick={handleLogout} className="cursor-pointer bg-red-500 px-4 py-2 rounded">
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}

export default Encabezado;
