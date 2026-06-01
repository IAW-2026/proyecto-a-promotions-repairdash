import type { PromoForm } from '@/types/promociones';

type Props = {
  form: PromoForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const OPCIONES = [
  { name: 'destacada', label: 'Destacada en el inicio' },
  { name: 'usoUnico', label: 'Uso único por usuario' },
];

export default function CheckboxesPromo({ form, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-[#8D62A5]">
      {OPCIONES.map(({ name, label }) => (
        <label key={name} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name={name}
            checked={form[name as keyof PromoForm] as boolean}
            onChange={onChange}
            className="w-4 h-4 accent-[#F500F1]"
          />
          <span className="text-[#FBDAF9]">{label}</span>
        </label>
      ))}
    </div>
  );
}