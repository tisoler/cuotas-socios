'use client';
import React from 'react';
import MatrizCuotas from '../componentes/MatrizCuotas';
import Autenticado from '../hoc/autenticado';

const RendirCuotas = () => {
  return (
    <div className="flex md:pt-12 pt-6 items-start justify-center w-full h-screen">
      <MatrizCuotas />
    </div>
  );
};

export default Autenticado(RendirCuotas);
