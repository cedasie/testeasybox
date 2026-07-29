import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { invoiceApi } from "../api/invoiceApi";

const invoiceSchema = z
  .object({
    customerName: z.string().min(1, "Customer name is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    currency: z.enum(["USD", "EUR", "GBP"]),
    lineItems: z
      .array(
        z.object({
          description: z.string().min(1, "Description required"),
          quantity: z.coerce.number().min(1, "Min 1"),
          unitPrice: z.coerce.number().min(0.01, "Min 0.01"),
        }),
      )
      .min(1, "At least one line item is required"),
  })
  .refine(
    (data) => {
      return new Date(data.dueDate) >= new Date(data.issueDate);
    },
    {
      message: "Due date cannot be before the issue date",
      path: ["dueDate"],
    },
  );

// Infer the TypeScript type from our Zod schema
type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      issueDate: new Date().toISOString().split("T")[0], // Today as YYYY-MM-DD
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // +14 days
      currency: "USD",
      lineItems: [],
    },
  });

  // 3. Handle Form Submission
  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Calculate the real total amount based on line items
      const totalAmount = 0;

      await invoiceApi.createInvoice({
        customerName: data.customerName,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        currency: data.currency,
        totalAmount,
        lineItems: [], // Placeholder
      });

      // On success, redirect back to dashboard
      navigate("/");
    } catch (err) {
      setSubmitError("Failed to create invoice. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to invoices
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Create New Invoice
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 sm:p-6">
          {submitError && (
            <div className="mb-6 p-4 rounded-md bg-red-50 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Form Grid - Basic Details */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-8">
            <div className="sm:col-span-3">
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="customerName"
                  {...register("customerName")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.customerName
                      ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.customerName && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700"
              >
                Currency
              </label>
              <div className="mt-1">
                <select
                  id="currency"
                  {...register("currency")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="issueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Issue Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="issueDate"
                  {...register("issueDate")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.issueDate
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.issueDate && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="dueDate"
                  {...register("dueDate")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.dueDate
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.dueDate && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Placeholder for Line Items */}
          <div className="border-t border-gray-200 pt-8 pb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Line Items
            </h4>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500 text-sm">
              Dynamic line items will be implemented in the next step!
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-5 border-t border-gray-200 flex justify-end gap-3">
            <Link
              to="/"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
