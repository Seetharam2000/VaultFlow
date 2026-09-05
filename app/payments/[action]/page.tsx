import PaymentActionClient from "./PaymentActionClient";

export default async function PaymentActionPage({
  params,
}: {
  params: Promise<{ action: string }>;
}) {
  const { action } = await params;
  return <PaymentActionClient action={action} />;
}
