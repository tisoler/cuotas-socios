'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contextos/usuario';

const Autenticado = (WrappedComponent: React.ComponentType) => {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const ComponentWithAuth = (props: any) => {
    const router = useRouter();
    const { cargandoUsuario, user } = useUser();

    useEffect(() => {
      if (!cargandoUsuario && !user) {
        router.push('/');
      }
    }, [cargandoUsuario, user, router]);

    if (cargandoUsuario) {
      return <div>Cargando...</div>; // O un spinner de carga
    }

    if (!user) {
      return null; // O un spinner de carga mientras redirige
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default Autenticado;
