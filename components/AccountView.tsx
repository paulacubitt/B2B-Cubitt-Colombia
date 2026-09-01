
import React, { useState, useMemo } from 'react';
import { User, Order } from '../types';
import PdfTemplate from './PdfTemplate';
import { formatCOP } from '../utils';

interface AccountViewProps {
  user: User;
  onBack: () => void;
  orders: Order[];
  onDeleteOrder: (id: string) => void;
  onViewOrder: (order: Order) => void;
  onToggleStatus?: (orderId: string) => void;
}

const AccountView: React.FC<AccountViewProps> = ({ user, onBack, orders, onDeleteOrder, onViewOrder, onToggleStatus }) => {
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const uniqueOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter(order => {
      if (!order?.id || seen.has(order.id)) return false;
      seen.add(order.id);
      return true;
    });
  }, [orders]);

  const handleDownloadPDF = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el click se propague a la fila
    setDownloadingOrderId(order.id);
    
    // Allow React to render the PdfTemplate with the selected order
    setTimeout(async () => {
      try {
        const element = document.getElementById('proforma-invoice-content');
        if (!element) throw new Error('No se encontró el contenido para generar el PDF');

        // @ts-ignore
        const html2pdf = window.html2pdf;
        if (typeof html2pdf !== 'function') throw new Error('Librería PDF no cargada');
        
        const clientName = user?.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente';
        
        const opt = {
          margin:       0.3, 
          filename:     `${clientName}_PF_${order.id}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error(error);
        alert('Error generando PDF. Intente nuevamente.');
      } finally {
        setDownloadingOrderId(null);
      }
    }, 100);
  };

  const downloadingOrder = orders.find(o => o.id === downloadingOrderId);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8 animate-in fade-in zoom-in-95 duration-500 pb-24">
      <nav className="mb-4 md:mb-6">
        <button onClick={onBack} className="flex items-center text-[10px] font-black text-[#86868B] uppercase tracking-[0.4em] hover:text-black transition-all group">
          <span className="material-icons text-lg mr-3 group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Dashboard
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-black/5">
                <div className="bg-[#F5F5F7] p-10 border-b border-black/5 flex flex-col items-center text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-1 shadow-lg mb-6">
                        <img 
                        src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80"} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-black tracking-tight mb-2">{user.companyName}</h1>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest truncate max-w-[200px]">{user.email}</p>
                    <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <span className="material-icons text-sm">verified</span>
                        Partner
                    </div>
                </div>
                <div className="p-8">
                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Detalles</h3>
                    <div className="space-y-4 text-xs md:text-sm">
                        <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="text-gray-500">ID Cliente</span>
                            <span className="font-bold text-black font-mono">{user.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-2">
                             <span className="text-gray-500">Tipo de Precio</span>
                             <span className="font-bold text-black">{user.priceType || 'Estándar B2B'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] shadow-xl border border-black/5 p-6 md:p-10 min-h-[500px]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Historial de Pedidos</h2>
                    <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">{uniqueOrders.length}</span>
                </div>

                {uniqueOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                        <span className="material-icons text-6xl mb-4 text-gray-300">history</span>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay pedidos registrados</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {uniqueOrders.map((order, index) => {
                            const totalItems = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
                            const isPaid = order.status === 'Paid';
                            const isDownloading = downloadingOrderId === order.id;

                            return (
                                <div 
                                  key={`${order.id}-${index}`} 
                                  onClick={() => onViewOrder(order)}
                                  className="group bg-[#F5F5F7] rounded-[24px] p-5 md:p-6 transition-all hover:bg-[#EAEAEA] border border-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${isPaid ? 'bg-black' : 'bg-gray-400'}`}>
                                            <span className="material-icons">{isPaid ? 'check_circle' : 'pending'}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-sm md:text-base font-black text-black tracking-tight hover:underline">{order.id}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleStatus?.(order.id);
                                                    }}
                                                    title="Clic para alternar estado (Pendiente / Pagado)"
                                                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                                                        isPaid 
                                                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                                                    {isPaid ? 'Pagado' : 'Pendiente'}
                                                    <span className="material-icons text-[12px] opacity-60">swap_horiz</span>
                                                </button>
                                            </div>
                                            <div className="text-[10px] md:text-xs text-gray-500 font-medium">
                                                {order.date} • {totalItems} Unidades
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 border-t md:border-t-0 border-black/5 pt-4 md:pt-0">
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total COP</div>
                                            <div className="text-lg md:text-xl font-black text-black">{formatCOP(order.total, true)}</div>
                                        </div>
                                        
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={(e) => handleDownloadPDF(order, e)}
                                                disabled={isDownloading}
                                                className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm disabled:opacity-50"
                                                title="Descargar PDF"
                                            >
                                                {isDownloading ? (
                                                    <span className="material-icons text-lg animate-spin">refresh</span>
                                                ) : (
                                                    <span className="material-icons text-lg">picture_as_pdf</span>
                                                )}
                                            </button>
                                            
                                            <button 
                                                type="button"
                                                onClick={() => setOrderToDelete(order)}
                                                className="w-10 h-10 rounded-xl bg-white border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm active:scale-95"
                                                title="Eliminar Pedido"
                                            >
                                                <span className="material-icons text-lg">delete_outline</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Modal de confirmación para eliminar pedido */}
      {orderToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setOrderToDelete(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-black/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <span className="material-icons text-2xl">delete_outline</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">¿Eliminar pedido?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Se eliminará permanentemente la proforma <strong className="text-slate-900">{orderToDelete.id}</strong> del historial de pedidos.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {downloadingOrder && (
        <PdfTemplate 
          user={user}
          cart={downloadingOrder.items}
          orderId={downloadingOrder.id.replace('ORD-', '')}
          date={downloadingOrder.date}
          subtotal={downloadingOrder.subtotal}
          tax={downloadingOrder.tax}
          total={downloadingOrder.total}
          totalQuantity={downloadingOrder.items.reduce((acc, curr) => acc + curr.quantity, 0)}
        />
      )}
    </div>
  );
};

export default AccountView;
