import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import { invoiceApi } from "../api/invoiceApi";
import { formatCurrency } from "../utils/formatters";

// 1. Zod Schema: Notice the z.coerce.number() - HTML inputs return strings by default!
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

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      currency: "USD",
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }], // Start with one empty row
    },
  });

  // 2. Setup Field Array for dynamic line items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // 3. Watch form values to auto-calculate totals dynamically
  const watchedLineItems = useWatch({ control, name: "lineItems" });
  const selectedCurrency = watch("currency");

  const grandTotal =
    watchedLineItems?.reduce((sum, item) => {
      const qty = Number(item?.quantity) || 0;
      const price = Number(item?.unitPrice) || 0;
      return sum + qty * price;
    }, 0) || 0;

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Map the form data to our domain model
      const finalLineItems = data.lineItems.map((item) => ({
        id: `li_${Math.random().toString(36).substring(2, 9)}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));

      await invoiceApi.createInvoice({
        customerName: data.customerName,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        currency: data.currency,
        totalAmount: grandTotal,
        lineItems: finalLineItems,
      });

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
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
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
              <input
                id="customerName"
                type="text"
                {...register("customerName")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-red-600">
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
              <select
                id="currency"
                {...register("currency")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <input
                type="date"
                {...register("issueDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.issueDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Section */}
          <div className="border-t border-gray-200 pt-8 pb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Line Items</h4>
              {errors.lineItems?.root && (
                <span className="text-sm text-red-600">
                  {errors.lineItems.root.message}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Header row for desktop */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {fields.map((field, index) => {
                const qty = Number(watchedLineItems?.[index]?.quantity) || 0;
                const price = Number(watchedLineItems?.[index]?.unitPrice) || 0;
                const rowTotal = qty * price;

                return (
                  <div
                    key={field.id}
                    className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-md"
                  >
                    <div className="w-full sm:col-span-6">
                      <label className="sm:hidden text-xs text-gray-500 mb-1 block">
                        Description
                      </label>
                      <input
                        {...register(`lineItems.${index}.description`)}
                        placeholder="Item description"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      {errors.lineItems?.[index]?.description && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.lineItems[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:col-span-2">
                      <label className="sm:hidden text-xs text-gray-500 mb-1 block">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...register(`lineItems.${index}.quantity`)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      {errors.lineItems?.[index]?.quantity && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.lineItems[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:col-span-2">
                      <label className="sm:hidden text-xs text-gray-500 mb-1 block">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`lineItems.${index}.unitPrice`)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      {errors.lineItems?.[index]?.unitPrice && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.lineItems[index]?.unitPrice?.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:col-span-1 text-left sm:text-right font-medium text-gray-900 pt-2 sm:pt-0">
                      <span className="sm:hidden text-gray-500 font-normal mr-2">
                        Total:
                      </span>
                      {formatCurrency(rowTotal, selectedCurrency)}
                    </div>

                    <div className="w-full sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed p-2"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  append({ description: "", quantity: 1, unitPrice: 0 })
                }
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Line Item
              </button>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="border-t border-gray-200 pt-6 flex flex-col items-end">
            <div className="w-full sm:w-1/3 space-y-3">
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-900 pt-3">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal, selectedCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-8 flex justify-end gap-3">
            <Link
              to="/"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
