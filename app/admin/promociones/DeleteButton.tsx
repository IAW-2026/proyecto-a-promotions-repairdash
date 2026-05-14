
'use client';
import { useRouter } from 'next/navigation';

export function DeleteButton({ id, usos }: { id: number; usos: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmMsg = usos > 0
      ? `Esta promoción tiene ${usos} uso(s). Se ocultará pero no se borrará. ¿Confirmás?`
      : '¿Seguro que querés borrar esta promoción?';

    if (!confirm(confirmMsg)) return;

    await fetch(`/api/admin/promociones/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 bg-[#271033] text-red-400 rounded-lg text-sm hover:bg-red-400 hover:text-white transition-colors"
    >
      Borrar
    </button>
  );
}