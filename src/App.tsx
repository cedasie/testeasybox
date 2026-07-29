import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="invoice/new" element={<CreateInvoice />} />
          <Route path="invoice/:id" element={<InvoiceDetails />} />

          {/* Catch-all route for 404s */}
          <Route
            path="*"
            element={
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-gray-900">
                  404 - Page Not Found
                </h2>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
