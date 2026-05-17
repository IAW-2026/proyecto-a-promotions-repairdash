'use client';
import Header from '../../../components/Header';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FiltroUsuariosSelector from '../FiltroUsuarios';
import TiposServicioSelector from '../TipoServicioSelector';

type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

export default function NuevaPromocion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtroUsuarios, setFiltroUsuarios] = useState<FiltroUsuarios | null>(null);
  const [filtroConError, setFiltroConError] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    tipoDescuento: '%',
    valor: '',
    descripcion: '',
    precioMinimo: '',
    destacada: false,
    usoUnico: false,
  });

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

    const res = await fetch('/api/admin/promociones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        valor: parseFloat(form.valor),
        precioMinimo: form.precioMinimo ? parseFloat(form.precioMinimo) : null,
        categorias,
        filtroUsuarios: filtroUsuarios ?? null,
      }),
    });

    if (res.ok) {
      router.push('/admin/promociones');
      router.refresh();
    } else {
      setError('Hubo un error al crear la promoción.');
      setLoading(false);
    }
  };

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
            <h2 className="text-3xl font-bold text-[#C392DD]">Nueva Promoción</h2>
          </div>

          <div className="flex flex-col gap-5 bg-[#1b0422] p-8 rounded-2xl border border-[#C392DD]">
            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-[#C392DD] text-sm font-semibold">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
              />
            </div>

            {/* Código */}
            <div className="flex flex-col gap-1">
              <label className="text-[#C392DD] text-sm font-semibold">Código</label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-[#F500F1]"
              />
            </div>

            {/* Tipo de descuento + valor */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1 w-1/3">
                <label className="text-[#C392DD] text-sm font-semibold">Tipo</label>
                <select
                  name="tipoDescuento"
                  value={form.tipoDescuento}
                  onChange={handleChange}
                  className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
                >
                  <option value="%">% Porcentaje</option>
                  <option value="$">$ Monto fijo</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#C392DD] text-sm font-semibold">Valor</label>
                <input
                  name="valor"
                  type="number"
                  value={form.valor}
                  onChange={handleChange}
                  className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-[#C392DD] text-sm font-semibold">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] resize-none"
              />
            </div>

            {/* Precio mínimo */}
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

            {/* Tipos de servicio */}
            <div className="pt-2 border-t border-[#8D62A5]">
              <TiposServicioSelector value={categorias} onChange={setCategorias} />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#8D62A5]">
              {[
                { name: 'destacada', label: 'Destacada en el inicio' },
                { name: 'usoUnico', label: 'Uso único por usuario' },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={form[name as keyof typeof form] as boolean}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#F500F1]"
                  />
                  <span className="text-[#FBDAF9]">{label}</span>
                </label>
              ))}
            </div>

            {/* Filtro de usuarios */}
            <div className="pt-2 border-t border-[#8D62A5]">
              <FiltroUsuariosSelector
                value={filtroUsuarios}
                onChange={setFiltroUsuarios}
                onError={setFiltroConError}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || filtroConError || categorias.length === 0}
              className="mt-2 px-6 py-3 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear promoción'}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}