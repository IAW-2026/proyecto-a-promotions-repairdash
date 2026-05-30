type Props = {
  label: string;
  valor: number;
  alerta?: boolean;
  icono: React.ReactNode;
};

export default function TarjetaMetrica({ label, valor, alerta = false, icono }: Props) {
  const activa = alerta && valor > 0;
  return (
    <div className={`p-6 bg-[#1b0422] rounded-2xl border flex items-center justify-between gap-4 ${activa ? 'border-[#F500F1]' : 'border-[#8D62A5]'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activa ? 'bg-[#F500F1]/20 text-[#F500F1]' : 'bg-[#8D62A5]/20 text-[#C392DD]'}`}>
          {icono}
        </div>
        <p className={`text-base font-semibold ${activa ? 'text-[#F500F1]' : 'text-[#FBDAF9]'}`}>{label}</p>
      </div>
      <p className={`text-4xl font-extrabold shrink-0 ${activa ? 'text-[#F500F1]' : 'text-white'}`}>{valor}</p>
    </div>
  );
}