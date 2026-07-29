import { Outlet, Link, useLocation } from "react-router-dom";
import { FileText, PlusCircle, LayoutDashboard } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "New Invoice", href: "/invoice/new", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="font-bold text-xl text-gray-900">
                  InvoiceHub
                </span>
              </div>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                        ${
                          isActive
                            ? "border-blue-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
