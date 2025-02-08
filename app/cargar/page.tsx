'use client';
import FormularioCuota from '../componentes/FormularioCuota';
import Autenticado from '../hoc/autenticado';

const CargarCuota = () => {
  return (
    <div className="flex md:pt-12 pt-6 items-start justify-center w-full h-screen">
      <FormularioCuota />
    </div>
  );
}

export default Autenticado(CargarCuota);
