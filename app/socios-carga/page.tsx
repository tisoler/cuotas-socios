'use client';
import React from 'react';
import Autenticado from '../hoc/autenticado';
import CargaSocios from '../componentes/CargaSocios';

const CargarSocios = () => {
  return (
    <div className="flex md:pt-12 pt-6 items-start justify-center w-full h-screen">
      <CargaSocios />
    </div>
  );
};

export default Autenticado(CargarSocios);
