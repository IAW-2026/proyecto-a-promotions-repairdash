import FormularioPromocion from '../FormularioPromocion';

export default async function EditarPromocion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <FormularioPromocion modo="editar" promocionId={id} />;
}
