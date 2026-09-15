import { CreateRecordForm } from "@/components/CreateRecordForm";

export const metadata = {
  title: "Create record — Disclosure Ledger",
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Create a disclosure record</h1>
      <p className="mt-2 text-sm text-slate-600">
        First 3 records are free on this instance. After that you will see a
        soft gate for ~$29/mo (Stripe Checkout when configured).
      </p>
      <div className="mt-8">
        <CreateRecordForm />
      </div>
    </div>
  );
}
