// app/admin/promociones/componentes/CampoFormulario.tsx

type Props = {
  label: string;
  error?: string;
  requerido?: boolean;
  opcional?: boolean;
  children: React.ReactNode;
};

export function CampoFormulario({ label, error, requerido, opcional, children }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#C392DD] text-sm font-semibold">
        {label}
        {requerido && '*'}
        {opcional && <span className="text-[#8D62A5] font-normal"> (opcional)</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}