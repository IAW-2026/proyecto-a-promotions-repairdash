import { CampoFormulario } from './CampoFormulario';
import { PromoForm, Errores } from './types';
import { formatearMonto } from './useFormularioPromocion';

const inputClase = (error?: string) =>
  `bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] ${
    error ? 'border-red-500' : 'border-[#8D62A5]'
  }`;

type Props = {
  form: Pick<PromoForm, 'tipoDescuento' | 'valor' | 'precioMinimo'>;
  errores: Pick<Errores, 'valor' | 'precioMinimo'>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlurValor: () => void;
  onBlurPrecioMinimo: () => void;
};

export function SeccionDescuento({ form, errores, onChange, onBlurValor, onBlurPrecioMinimo }: Props) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1 md:w-1/3">
          <label className="text-[#C392DD] text-sm font-semibold">Tipo</label>
          <select
            name="tipoDescuento"
            value={form.tipoDescuento ?? '%'}
            onChange={onChange}
            onBlur={onBlurValor}
            className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1]"
          >
            <option value="%">% Porcentaje</option>
            <option value="$">$ Monto de descuento</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <CampoFormulario label="Valor" requerido error={errores.valor}>
            <input
              name="valor"
              type={form.tipoDescuento === '%' ? 'number' : 'text'}
              value={form.tipoDescuento === '$' ? formatearMonto(form.valor) : form.valor}
              onChange={onChange}
              onBlur={onBlurValor}
              className={inputClase(errores.valor)}
            />
          </CampoFormulario>
        </div>
      </div>

      <CampoFormulario
        label="Precio mínimo"
        requerido={form.tipoDescuento === '$'}
        opcional={form.tipoDescuento !== '$'}
        error={errores.precioMinimo}
      >
        <input
          name="precioMinimo"
          type="text"
          value={form.precioMinimo ? formatearMonto(form.precioMinimo) : ''}
          onChange={onChange}
          onBlur={onBlurPrecioMinimo}
          className={inputClase(errores.precioMinimo)}
        />
      </CampoFormulario>
    </>
  );
}