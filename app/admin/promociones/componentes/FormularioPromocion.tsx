'use client';

import Header from '../../../componentes/Header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FiltroUsuariosSelector from './FiltroUsuarios';
import TiposServicioSelector from './TipoServicioSelector';

type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

type PromoForm = {
  nombre: string;
  tipoDescuento: string;
  valor: string;
  descripcion: string;
  precioMinimo: string;
  destacada: boolean;
  usoUnico: boolean;
};

type Props =
  | {
      modo: 'crear';
    }
  | {
      modo: 'editar';
      promocionId: string;
    };

const formInicial: PromoForm = {
  nombre: '',
  tipoDescuento: '%',
  valor: '',
  descripcion: '',
  precioMinimo: '',
  destacada: false,
  usoUnico: false,
};

function fechaLocalInicial() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function fechaParaInput(fecha: string) {
  const d = new Date(fecha);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function FormularioPromocion(props: Props) {
  const router = useRouter();
  const esEdicion = props.modo === 'editar';
  const promocionId = props.modo === 'editar' ? props.promocionId : null;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(esEdicion);
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [filtroUsuarios, setFiltroUsuarios] = useState<FiltroUsuarios | null>(null);
  const [filtroConError, setFiltroConError] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string>(() => fechaLocalInicial());
  const [tieneCaducidad, setTieneCaducidad] = useState<boolean>(false);
  const [fechaFin, setFechaFin] = useState<string>('');
  const [form, setForm] = useState<PromoForm>(formInicial);

  useEffect(() => {
    if (!esEdicion) return;

    fetch(`/api/admin/promociones/${promocionId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          nombre: data.nombre,
          tipoDescuento: data.tipoDescuento,
          valor: String(data.valor),
          descripcion: data.descripcion,
          precioMinimo: data.precioMinimo ? String(data.precioMinimo) : '',
          destacada: data.destacada,
          usoUnico: data.usoUnico,
        });
        setCategorias(data.categorias ?? []);
        setFiltroUsuarios(data.filtroUsuarios ?? null);

        if (data.fechaInicio) {
          setFechaInicio(fechaParaInput(data.fechaInicio));
        }
        if (data.fechaFin) {
          setTieneCaducidad(true);
          setFechaFin(fechaParaInput(data.fechaFin));
        }

        setLoadingData(false);
      });
  }, [esEdicion, promocionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const res = await fetch(esEdicion ? `/api/admin/promociones/${promocionId}` : '/api/admin/promociones', {
      method: esEdicion ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        valor: parseFloat(form.valor),
        precioMinimo: form.precioMinimo ? parseFloat(form.precioMinimo) : null,
        categorias,
        filtroUsuarios: filtroUsuarios ?? null,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: tieneCaducidad && fechaFin ? new Date(fechaFin).toISOString() : null,
      }),
    });

    if (res.ok) {
      if (esEdicion) {
        setGuardado(true);
        setTimeout(() => {
          router.push('/admin/promociones');
          router.refresh();
        }, 1500);
      } else {
        router.push('/admin/promociones');
        router.refresh();
      }
    } else {
      setError(esEdicion ? 'Hubo un error al guardar los cambios.' : 'Hubo un error al crear la promoción.');
      setLoading(false);
    }
  };

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
            <button
              onClick={() => router.back()}
              className="text-[#C392DD] hover:text-white transition-colors"
            >
              ← Volver
            </button>
            <h2 className="text-3xl font-bold text-[#C392DD]">
              {esEdicion ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
          </div>

          <div className="flex flex-col gap-5 bg-[#1b0422] p-8 rounded-2xl border border-[#C392DD]">
            <div className="flex flex-col gap-1">
              <label className="text-[#C392DD] text-sm font-semibold">Nombre*</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-1 md:w-1/3">
                <label className="text-[#C392DD] text-sm font-semibold">Tipo</label>
                <select
                  name="tipoDescuento"
                  value={form.tipoDescuento}
                  onChange={handleChange}
                  className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
                >
                  <option value="%">% Porcentaje</option>
                  <option value="$">$ Monto de descuento</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#C392DD] text-sm font-semibold">Valor*</label>
                <input
                  name="valor"
                  type="number"
                  value={form.valor}
                  onChange={handleChange}
                  className="w-full bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C392DD] text-sm font-semibold">
                Descripción <span className="text-[#8D62A5] font-normal">(opcional)</span>
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C392DD] text-sm font-semibold">
                Precio mínimo <span className="text-[#8D62A5] font-normal">(opcional)</span>
              </label>
              <input
                name="precioMinimo"
                type="number"
                value={form.precioMinimo}
                onChange={handleChange}
                className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
              />
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-[#8D62A5]">
              <h3 className="text-[#C392DD] font-bold text-base">Vigencia por Fechas</h3>

              <div className="flex flex-col gap-1">
                <label className="text-[#FBDAF9] text-sm font-semibold">Fecha de Inicio</label>
                <input
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] w-full [color-scheme:dark]"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tieneCaducidad}
                  onChange={(e) => setTieneCaducidad(e.target.checked)}
                  className="w-4 h-4 accent-[#F500F1]"
                />
                <span className="text-[#FBDAF9] text-sm">¿Esta promoción tiene fecha de vencimiento?</span>
              </label>

              {tieneCaducidad && (
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#8D62A5]">
                  <label className="text-[#FBDAF9] text-sm font-semibold">Fecha de Finalización</label>
                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    min={fechaInicio}
                    className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] w-full [color-scheme:dark]"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#8D62A5]">
              <TiposServicioSelector value={categorias} onChange={setCategorias} />
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-[#8D62A5]">
              {[
                { name: 'destacada', label: 'Destacada en el inicio' },
                { name: 'usoUnico', label: 'Uso único por usuario' },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={form[name as keyof PromoForm] as boolean}
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
                onChange={setFiltroUsuarios}
                onError={setFiltroConError}
              />
            </div>

            {guardado && (
              <p className="text-green-400 text-sm font-medium animate-pulse">
                ¡Cambios guardados con éxito!
              </p>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || guardado || filtroConError || categorias.length === 0}
              className="mt-2 px-6 py-3 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (esEdicion ? 'Guardando...' : 'Creando...') : guardado ? '¡Guardado!' : esEdicion ? 'Guardar cambios' : 'Crear promoción'}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
