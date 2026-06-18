'use client';

import Header from '../../../componentes/Header';
import FiltroUsuariosSelector from './FiltroUsuarios';
import TiposServicioSelector from './TipoServicioSelector';
import { CampoFormulario } from './CampoFormulario';
import { SeccionVigencia } from './SeccionVigencia';
import { SeccionDescuento } from './SeccionDescuento';
import { useFormularioPromocion } from './useFormularioPromocion';
import { PropsFormulario } from './types';

const inputClase = (error?: string) =>
  `bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] ${
    error ? 'border-red-500' : 'border-[#8D62A5]'
  }`;

export default function FormularioPromocion(props: PropsFormulario) {
  const {
    form, errores, filtroUsuarios, categorias,
    fechaInicio, tieneCaducidad, fechaFin,
    loading, loadingData, error, guardado, esEdicion,
    setFiltroUsuarios, setCategorias, setFechaInicio,
    setTieneCaducidad, setFechaFin, setErrores, setFiltroConError,
    handleChange, handleVolver, handleSubmit, validarCampo, marcarCambios, limpiarError,
  } = useFormularioPromocion(props);

  if (loadingData) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white items-center justify-center">
          <p className="text-[#FBDAF9]">Cargando promoción...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section className="max-w-2xl mx-auto w-full">

          <div className="flex items-center gap-4 mb-8">
            <button onClick={handleVolver} className="text-[#C392DD] hover:text-white transition-colors">
              ← Volver
            </button>
            <h2 className="text-3xl font-bold text-[#C392DD]">
              {esEdicion ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
          </div>

          <div className="flex flex-col gap-5 bg-[#1b0422] p-8 rounded-2xl border border-[#C392DD]">

            <CampoFormulario label="Nombre" requerido error={errores.nombre}>
              <input
                name="nombre"
                value={form.nombre ?? ''}
                onChange={handleChange}
                onBlur={() => validarCampo('nombre')}
                className={inputClase(errores.nombre)}
              />
            </CampoFormulario>

            <CampoFormulario label="Descripción" opcional>
              <textarea
                name="descripcion"
                value={form.descripcion ?? ''}
                onChange={handleChange}
                rows={3}
                className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] resize-none"
              />
            </CampoFormulario>

            <SeccionDescuento
              form={form}
              errores={errores}
              onChange={handleChange}
              onBlurValor={() => validarCampo('valor')}
              onBlurPrecioMinimo={() => validarCampo('precioMinimo')}
            />

            <SeccionVigencia
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              tieneCaducidad={tieneCaducidad}
              errorFechaFin={errores.fechaFin}
              onChangeFechaInicio={(v) => { marcarCambios(); setFechaInicio(v); }}
              onChangeFechaFin={(v) => { marcarCambios(); setFechaFin(v); }}
              onChangeTieneCaducidad={(v) => {
                marcarCambios();
                setTieneCaducidad(v);
                if (!v) {
                  setFechaFin('');
                  setErrores((prev) => { const n = { ...prev }; delete n.fechaFin; return n; });
                }
              }}
              onBlurFechaFin={() => validarCampo('fechaFin')}
            />

            <div className="pt-2 border-t border-[#8D62A5]">
              <TiposServicioSelector
                value={categorias}
                onAutoChange={(tipos) => {
                  setCategorias(tipos);
                  if (tipos.length > 0) limpiarError('categorias');
                }}
                onChange={(tipos) => {
                  marcarCambios();
                  setCategorias(tipos);
                  if (tipos.length > 0) limpiarError('categorias');
                }}
              />
              {errores.categorias && <p className="text-red-400 text-xs mt-2">{errores.categorias}</p>}
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-[#8D62A5]">
              {([
                { name: 'destacada', label: 'Destacada en el inicio' },
                { name: 'usoUnico', label: 'Uso único por usuario' },
              ] as const).map(({ name, label }) => (
                <label key={name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={form[name]}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#F500F1]"
                  />
                  <span className="text-[#FBDAF9]">{label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-[#8D62A5]">
              <FiltroUsuariosSelector
                value={filtroUsuarios}
                onChange={(filtro) => {
                  marcarCambios();
                  setFiltroUsuarios(filtro);
                }}
                onError={(hayError) => {
                  setFiltroConError(hayError);
                  if (!hayError) limpiarError('filtroUsuarios');
                }}
              />
              {errores.filtroUsuarios && <p className="text-red-400 text-xs mt-2">{errores.filtroUsuarios}</p>}
            </div>

            {guardado && <p className="text-green-400 text-sm font-medium animate-pulse">¡Cambios guardados con éxito!</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || guardado}
              className="mt-2 px-6 py-3 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? esEdicion ? 'Guardando...' : 'Creando...'
                : guardado ? '¡Guardado!'
                : esEdicion ? 'Guardar cambios' : 'Crear promoción'}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}