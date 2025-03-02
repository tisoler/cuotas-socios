'use client';
import FormularioCuota from '../componentes/FormularioCuota';
import Autenticado from '../hoc/autenticado';

const CargarCuota = () => {
  return (
    <div className="flex md:pt-12 pt-6 items-start justify-center w-full h-screen bg-black text-white">
      <FormularioCuota />
    </div>
  );
}

export default Autenticado(CargarCuota);
