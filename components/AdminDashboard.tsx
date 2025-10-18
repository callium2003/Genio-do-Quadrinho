import React from 'react';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#7C4DFF]">Painel de Administração</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 font-bold text-2xl"
          aria-label="Fechar painel de administração"
        >
          &times;
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6">
        <h3 className="font-bold">Nota sobre a Implementação</h3>
        <p className="text-sm">
          Este painel é um protótipo visual. Para que ele funcione e exiba dados reais, é necessário construir um serviço de backend que gerencie as chaves de API, monitore o uso e armazene o histórico de chamadas. A aplicação frontend já está preparada para se comunicar com esse backend.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-700 mb-4">Relatório de Uso da API (Exemplo)</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Data</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Chamadas (Tier Gratuito)</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Chamadas (Tier Pago)</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Custo Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-2">24/07/2024</td>
                <td className="px-4 py-2">1500 / 1500</td>
                <td className="px-4 py-2">215</td>
                <td className="px-4 py-2 text-green-600 font-medium">$0.43</td>
              </tr>
              <tr>
                <td className="px-4 py-2">23/07/2024</td>
                <td className="px-4 py-2">1500 / 1500</td>
                <td className="px-4 py-2">88</td>
                <td className="px-4 py-2 text-green-600 font-medium">$0.18</td>
              </tr>
               <tr className="bg-gray-50">
                <td className="px-4 py-2 font-bold">Total do Mês</td>
                <td className="px-4 py-2 font-bold">-</td>
                <td className="px-4 py-2 font-bold">303</td>
                <td className="px-4 py-2 font-bold text-green-700">$0.61</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;