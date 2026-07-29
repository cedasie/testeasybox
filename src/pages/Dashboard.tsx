import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, AlertCircle, RefreshCw } from "lucide-react";
import { invoiceApi } from "../api/invoiceApi";
import { Invoice } from "../types/invoice";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.getInvoices();
      setInvoices(data);
    } catch (err) {
      setError("Failed to load invoices. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Helper to color-code statuses
  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-gray-100 text-gray-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div>
      {/* Header section */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Invoices
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            A list of all invoices including their number, customer, amount, and
            status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/invoice/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Invoice
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Loading invoices...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-red-200 bg-red-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchInvoices}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Success State / Table */}
            {!isLoading && !error && (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Invoice
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Issue Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Due Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {invoice.customerName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(invoice.issueDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(
                            invoice.totalAmount,
                            invoice.currency,
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/invoice/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                            <span className="sr-only">
                              , {invoice.invoiceNumber}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
