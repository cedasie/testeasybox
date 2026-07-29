import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  PlusCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { invoiceApi } from "../api/invoiceApi";
import { Invoice } from "../types/invoice";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook into the URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";

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

  // Update URL params without losing existing ones
  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Apply filters to our loaded data
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search by invoice or customer..."
            value={searchQuery}
            onChange={(e) => updateSearchParam("q", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => updateSearchParam("status", e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Loading invoices...</p>
              </div>
            )}

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

            {/* Absolute Empty State (No data in system) */}
            {!isLoading && !error && invoices.length === 0 && (
              <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white mt-4">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No invoices
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new invoice.
                </p>
              </div>
            )}

            {/* Search No Results State (Data exists, but filtered out) */}
            {!isLoading &&
              !error &&
              invoices.length > 0 &&
              filteredInvoices.length === 0 && (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white mt-4">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No matching invoices found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters.
                  </p>
                  <button
                    onClick={() => setSearchParams({})}
                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

            {/* Success State / Table */}
            {!isLoading && !error && filteredInvoices.length > 0 && (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Invoice
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Issue Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Due Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredInvoices.map((invoice) => (
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
