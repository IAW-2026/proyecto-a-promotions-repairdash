'use client';

import Header from '../../../componentes/Header';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FiltroUsuariosSelector from './FiltroUsuarios';
import TiposServicioSelector from './TipoServicioSelector';
import type { FiltroUsuarios } from '@/types/promociones';
import type { PromoForm } from '@/types/promociones';

type Errores = Partial<Record<keyof PromoForm | 'fechaFin' | 'filtroUsuarios' | 'categorias', string>>;

type Props =
  | { modo: 'crear' }
  | { modo: 'editar'; promocionId: string };

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
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function fechaParaInput(fecha: string) {
  const d = new Date(fecha);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function formatearMonto(valor: string): string {
  const num = parseInt(valor.replace(/\./g, ''), 10);
  if (isNaN(num)) return valor;
  return num.toLocaleString('es-AR');
}

function desformatearMonto(valor: string): string {
  return valor.replace(/\./g, '');
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
  const [hayCambios, setHayCambios] = useState(false);
  const [errores, setErrores] = useState<Errores>({});

  const marcarCambios = useCallback(() => {
    if (!loadingData) setHayCambios(true);
  }, [loadingData]);

  const limpiarError = useCallback((campo: keyof Errores) => {
    setErrores((prev) => {
      const nuevos = { ...prev };
      delete nuevos[campo];
      return nuevos;
    });
  }, []);

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
        if (data.fechaInicio) setFechaInicio(fechaParaInput(data.fechaInicio));
        if (data.fechaFin) {
          setTieneCaducidad(true);
          setFechaFin(fechaParaInput(data.fechaFin));
        }
        setLoadingData(false);
        setTimeout(() => setHayCambios(false), 0);
      });
  }, [esEdicion, promocionId]);

  const validarCampo = useCallback((campo: string, valor?: string, contexto?: { tipoDescuento?: string; precioMinimo?: string; fechaFin?: string; tieneCaducidad?: boolean }) => {
    const tipo = contexto?.tipoDescuento ?? form.tipoDescuento;

    setErrores((prev) => {
      const nuevos = { ...prev };
      if (campo === 'nombre') {
        const v = valor ?? form.nombre;
        if (!v.trim()) nuevos.nombre = 'El nombre es obligatorio.';
        else delete nuevos.nombre;
      }
      if (campo === 'valor') {
        const v = valor ?? form.valor;
        const num = parseFloat(v);
        if (!v || isNaN(num)) {
          nuevos.valor = 'El valor es obligatorio.';
        } else if (tipo === '%' && (num <= 1 || num >= 100)) {
          nuevos.valor = 'El porcentaje debe ser mayor a 1 y menor a 100.';
        } else {
          delete nuevos.valor;
        }
      }
      if (campo === 'precioMinimo' || campo === 'valor') {
        const pm = contexto?.precioMinimo ?? form.precioMinimo;
        const val = campo === 'valor' ? (valor ?? form.valor) : form.valor;
        if (tipo === '$') {
          const pmNum = parseFloat(pm);
          const valNum = parseFloat(val);
          if (!pm || isNaN(pmNum)) {
            nuevos.precioMinimo = 'Para descuento por monto es obligatorio definir un precio mínimo.';
          } else if (!isNaN(valNum) && pmNum < valNum) {
            nuevos.precioMinimo = `El precio mínimo debe ser al menos $${valNum.toLocaleString('es-AR')}.`;
          } else {
            delete nuevos.precioMinimo;
          }
        } else {
          delete nuevos.precioMinimo;
        }
      }
      if (campo === 'fechaFin') {
        const tiene = contexto?.tieneCaducidad ?? tieneCaducidad;
        const fFin = contexto?.fechaFin ?? fechaFin;
        if (tiene && !fFin) nuevos.fechaFin = 'Ingresá la fecha de finalización o desmarcá la opción.';
        else delete nuevos.fechaFin;
      }
      return nuevos;
    });
  }, [form, tieneCaducidad, fechaFin]);

  const handleVolver = () => {
    if (hayCambios) {
      const confirmar = window.confirm('¿Seguro que querés salir? Se perderán los cambios que hayas hecho.');
      if (!confirmar) return;
    }
    router.back();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    marcarCambios();

    if (name === 'valor' && form.tipoDescuento === '$') {
      const raw = desformatearMonto(value);
      setForm((prev) => ({ ...prev, valor: raw }));
      return;
    }
    if (name === 'precioMinimo') {
      const raw = desformatearMonto(value);
      setForm((prev) => ({ ...prev, precioMinimo: raw }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validarTodo = (): boolean => {
    const nuevos: Errores = {};
    if (!form.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio.';
    const valorNum = parseFloat(form.valor);
    if (!form.valor || isNaN(valorNum)) {
      nuevos.valor = 'El valor es obligatorio.';
    } else if (form.tipoDescuento === '%' && (valorNum <= 1 || valorNum >= 100)) {
      nuevos.valor = 'El porcentaje debe ser mayor a 1 y menor a 100.';
    }
    if (form.tipoDescuento === '$') {
      const pmNum = parseFloat(form.precioMinimo);
      if (!form.precioMinimo || isNaN(pmNum)) {
        nuevos.precioMinimo = 'Para descuento por monto es obligatorio definir un precio mínimo.';
      } else if (pmNum < valorNum) {
        nuevos.precioMinimo = `El precio mínimo debe ser al menos $${valorNum.toLocaleString('es-AR')}.`;
      }
    }
    if (tieneCaducidad && !fechaFin) nuevos.fechaFin = 'Ingresá la fecha de finalización o desmarcá la opción.';
    if (filtroConError) nuevos.filtroUsuarios = 'El filtro de usuarios tiene errores. Revisalo antes de guardar.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarTodo()) return;
    setLoading(true);
    setError('');
    const res = await fetch(
      esEdicion ? `/api/admin/promociones/${promocionId}` : '/api/admin/promociones',
      {
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
      }
    );
    if (res.ok) {
      setHayCambios(false);
      if (esEdicion) {
        setGuardado(true);
        setTimeout(() => { router.push('/admin/promociones'); router.refresh(); }, 1500);
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
            <button onClick={handleVolver} className="text-[#C392DD] hover:text-white transition-colors">
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
                onBlur={() => validarCampo('nombre')}
                className={`bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] ${errores.nombre ? 'border-red-500' : 'border-[#8D62A5]'}`}
              />
              {errores.nombre && <p className="text-red-400 text-xs mt-1">{errores.nombre}</p>}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-1 md:w-1/3">
                <label className="text-[#C392DD] text-sm font-semibold">Tipo</label>
                <select
                  name="tipoDescuento"
                  value={form.tipoDescuento}
                  onChange={handleChange}
                  onBlur={() => validarCampo('valor')}
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
                  type={form.tipoDescuento === '%' ? 'number' : 'text'}
                  value={form.tipoDescuento === '$' ? formatearMonto(form.valor) : form.valor}
                  onChange={handleChange}
                  onBlur={() => validarCampo('valor')}
                  className={`w-full bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] ${errores.valor ? 'border-red-500' : 'border-[#8D62A5]'}`}
                />
                {errores.valor && <p className="text-red-400 text-xs mt-1">{errores.valor}</p>}
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
                Precio mínimo{form.tipoDescuento === '$' ? '*' : ''}
                {form.tipoDescuento !== '$' && <span className="text-[#8D62A5] font-normal"> (opcional)</span>}
              </label>
              <input
                name="precioMinimo"
                type="text"
                value={form.precioMinimo ? formatearMonto(form.precioMinimo) : ''}
                onChange={handleChange}
                onBlur={() => validarCampo('precioMinimo')}
                className={`bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] ${errores.precioMinimo ? 'border-red-500' : 'border-[#8D62A5]'}`}
              />
              {errores.precioMinimo && <p className="text-red-400 text-xs mt-1">{errores.precioMinimo}</p>}
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-[#8D62A5]">
              <h3 className="text-[#C392DD] font-bold text-base">Vigencia por Fechas</h3>
              <div className="flex flex-col gap-1">
                <label className="text-[#FBDAF9] text-sm font-semibold">Fecha de Inicio</label>
                <input
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={(e) => {
                    marcarCambios();
                    setFechaInicio(e.target.value);
                  }}
                  className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] w-full [color-scheme:dark]"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tieneCaducidad}
                  onChange={(e) => {
                    marcarCambios();
                    setTieneCaducidad(e.target.checked);
                    if (!e.target.checked) {
                      setFechaFin('');
                      setErrores((prev) => { const n = { ...prev }; delete n.fechaFin; return n; });
                    }
                  }}
                  className="w-4 h-4 accent-[#F500F1]"
                />
                <span className="text-[#FBDAF9] text-sm">¿Esta promoción tiene fecha de vencimiento?</span>
              </label>

              {tieneCaducidad && (
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#8D62A5]">
                  <label className="text-[#FBDAF9] text-sm font-semibold">Fecha de Finalización*</label>
                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => {
                      marcarCambios();
                      setFechaFin(e.target.value);
                    }}
                    onBlur={() => validarCampo('fechaFin')}
                    min={fechaInicio}
                    className={`bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] w-full [color-scheme:dark] ${errores.fechaFin ? 'border-red-500' : 'border-[#8D62A5]'}`}
                  />
                  {errores.fechaFin && <p className="text-red-400 text-xs mt-1">{errores.fechaFin}</p>}
                </div>
              )}
            </div>

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
