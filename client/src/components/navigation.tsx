import { Film } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "espetaculos", label: "Espetáculos" },
    { id: "clientes", label: "Clientes" },
    { id: "ingressos", label: "Ingressos" },
  ];

  return (
    <nav className="bg-navy-800 border-b border-navy-700" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3" data-testid="logo">
            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
              <Film className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">Cineminha</span>
          </div>
          
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-white bg-navy-700"
                    : "text-slate-300 hover:text-white hover:bg-navy-700"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
