
import React from 'react';
import { Category, Product, AppView } from '../types';

interface SidebarProps {
  products: Product[];
  selectedCategory: Category;
  setSelectedCategory: (c: Category) => void;
  onDataUpdate?: (products: Product[]) => void;
  onResetData?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  showDesktop?: boolean;
  onNavigate?: (view: AppView) => void;
  currentView?: AppView;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  products, 
  selectedCategory, 
  setSelectedCategory, 
  isOpen = false,
  onClose,
  showDesktop = true,
  onNavigate,
  currentView
}) => {
  const types: string[] = Array.from<string>(new Set(products.map(p => p.type))).sort();
  
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'smartwatches': return 'watch';
      case 'bocinas': return 'speaker';
      case 'básculas': return 'monitor_weight';
      case 'audífonos': return 'headphones';
      case 'teens': return 'face';
      case 'accesorios': return 'widgets';
      case 'hidratación': return 'water_drop';
      case 'termos': return 'water_drop';
      default: return 'label';
    }
  };

  const handleCategorySelect = (type: Category) => {
    setSelectedCategory(type);
    if (onClose) onClose(); // Cerrar menú en móvil al seleccionar
  };

  const sidebarContent = (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar h-full pb-20 md:pb-0">
      {/* Mobile Navigation Links */}
      {!showDesktop && onNavigate && (
        <div className="mb-6 lg:hidden">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-3">Menú Principal</h3>
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => { onNavigate('CATALOG'); if(onClose) onClose(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                  currentView === 'CATALOG' 
                    ? 'bg-slate-900/90 backdrop-blur-xl text-white shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-white/20 font-bold' 
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 font-medium'
                }`}
              >
                <span className="material-icons text-lg">grid_view</span>
                <span className="text-sm">Catálogo</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { onNavigate('REVIEW_ORDER'); if(onClose) onClose(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                  currentView === 'REVIEW_ORDER' 
                    ? 'bg-slate-900/90 backdrop-blur-xl text-white shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-white/20 font-bold' 
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 font-medium'
                }`}
              >
                <span className="material-icons text-lg">description</span>
                <span className="text-sm">Proformas</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { onNavigate('ACCOUNT'); if(onClose) onClose(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                  currentView === 'ACCOUNT' 
                    ? 'bg-slate-900/90 backdrop-blur-xl text-white shadow-[0_4px_16px_rgba(15,23,42,0.12)] border border-white/20 font-bold' 
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 font-medium'
                }`}
              >
                <span className="material-icons text-lg">person</span>
                <span className="text-sm">Mi Cuenta / Pedidos</span>
              </button>
            </li>
          </ul>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-3">Categorías</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => handleCategorySelect('All')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                selectedCategory === 'All' 
                  ? 'bg-white/90 backdrop-blur-2xl text-slate-950 shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/90 font-black' 
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-950 font-medium border border-transparent hover:border-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span className="text-sm">Todo el Catálogo</span>
            </button>
          </li>
          {types.map(type => (
            <li key={type}>
              <button
                onClick={() => handleCategorySelect(type)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                  selectedCategory === type 
                    ? 'bg-white/90 backdrop-blur-2xl text-slate-950 shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/90 font-black' 
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-950 font-medium border border-transparent hover:border-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{getIcon(type)}</span>
                <span className="text-sm">{type}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {showDesktop && (
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-6rem)]">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md" onClick={onClose} />
          <div className="relative w-80 bg-white/85 backdrop-blur-3xl h-full shadow-2xl p-6 border-r border-white/80 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Menú</h2>
               <button onClick={onClose} className="p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-500 hover:text-black border border-white/80 shadow-sm">
                 <span className="material-icons">close</span>
               </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
