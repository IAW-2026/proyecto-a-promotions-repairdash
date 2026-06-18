import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PromoForm, ErroresPromoForm, FiltroUsuarios, PropsFormulario } from './types';

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

export function desformatearMonto(valor: string): string {
  return valor.replace(/\./g, '');
}

export function formatearMonto(valor: string): string {
  const num = parseInt(valor.replace(/\./g, ''), 10);
  if (isNaN(num)) return valor;
  return num.toLocaleString('es-AR');
}

export function useFormularioPromocion(props: PropsFormulario) {
  const router = useRouter();
  const esEdicion = props.modo === 'editar';
  const promocionId = props.modo === 'editar' ? props.promocionId : null;

  const [form, setForm] = useState<PromoForm>(formInicial);
  const [errores, setErrores] = useState<ErroresPromoForm>({});
  const [filtroUsuarios, setFiltroUsuarios] = useState<FiltroUsuarios | null>(null);
  const [filtroConError, setFiltroConError] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string>(() => fechaLocalInicial());
  const [tieneCaducidad, setTieneCaducidad] = useState(false);
  const [fechaFin, setFechaFin] = useState('');
  const [hayCambios, setHayCambios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(esEdicion);
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);

  const cargandoInicial = useRef(true);

  const marcarCambios = useCallback(() => {
    if (!cargandoInicial.current) setHayCambios(true);
  }, []);

  const limpiarError = useCallback((campo: keyof ErroresPromoForm) => {
    setErrores((prev) => {
      const nuevos = { ...prev };
      delete nuevos[campo];
      return nuevos;
    });
  }, []);

  useEffect(() => {
    if (!esEdicion) {
      cargandoInicial.current = false;
      return;
    }

    cargandoInicial.current = true;

    fetch(`/api/admin/promociones/${promocionId}`)
      .then((res) => res.json())
      .then(({ data }) => {
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
        cargandoInicial.current = false;
      });
  }, [esEdicion, promocionId]);

  const validarCampo = useCallback((
    campo: string,
    valor?: string,
    contexto?: { tipoDescuento?: string; precioMinimo?: string; fechaFin?: string; tieneCaducidad?: boolean }
  ) => {
    if (!form.nombre && !valor) return;
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

  const validarTodo = (): boolean => {
    const nuevos: ErroresPromoForm = {};
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    marcarCambios();
    if (name === 'valor' && form.tipoDescuento === '$') {
      setForm((prev) => ({ ...prev, valor: desformatearMonto(value) }));
      return;
    }
    if (name === 'precioMinimo') {
      setForm((prev) => ({ ...prev, precioMinimo: desformatearMonto(value) }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleVolver = () => {
    if (hayCambios) {
      const confirmar = window.confirm('¿Seguro que querés salir? Se perderán los cambios que hayas hecho.');
      if (!confirmar) return;
    }
    router.back();
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

  return {
    // Estado del form
    form,
    errores,
    filtroUsuarios,
    categorias,
    fechaInicio,
    tieneCaducidad,
    fechaFin,
    // Estado UI
    loading,
    loadingData,
    error,
    guardado,
    esEdicion,
    // Setters que el formulario necesita directamente
    setFiltroUsuarios,
    setCategorias,
    setFechaInicio,
    setTieneCaducidad,
    setFechaFin,
    setErrores,
    setFiltroConError,
    // Handlers
    handleChange,
    handleVolver,
    handleSubmit,
    validarCampo,
    marcarCambios,
    limpiarError,
  };
}