import { useParams } from "react-router-dom";

export default function InvoiceDetails() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Invoice #{id}
      </h1>

      <div className="mt-8 border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center text-gray-400">
        [Invoice Details Will Go Here]
      </div>
    </div>
  );
}
