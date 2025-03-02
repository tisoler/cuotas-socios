'use client';
import React from 'react';
import Autenticado from '../hoc/autenticado';
import HistoricoRendiciones from '../componentes/HistoricoRendiciones';

const Rendiciones = () => {
  return (
    <div className="flex md:pt-12 pt-6 items-start justify-center w-full h-screen bg-black text-white">
      <HistoricoRendiciones />
    </div>
  );
};

export default Autenticado(Rendiciones);
