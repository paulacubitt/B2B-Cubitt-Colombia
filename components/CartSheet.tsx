
import React from 'react';
import { CartItem } from '../types';
import { formatCOP } from '../utils';

interface CartSheetProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (sku: string) => void;
  onUpdate: (sku: string, qty: number) => void;
  onCheckout: () => void;
}

const CartSheet: React.FC<CartSheetProps> = ({ cart, onClose, onRemove, onUpdate, onCheckout }) => {
  const subtotal = cart.reduce((acc, curr) => acc + (curr.variant.price * curr.quantity), 0);

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white/85 backdrop-blur-3xl h-full shadow-2xl flex flex-col p-6 md:p-8 border-l border-white/80 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">Tu Proforma</h2>
          <button onClick={onClose} className="p-2 bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 rounded-full border border-white/80 shadow-sm transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-100/80 backdrop-blur-md flex items-center justify-center mb-4 text-slate-400">
                <span className="material-symbols-outlined text-3xl">shopping_bag</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">Tu carrito está vacío.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={`${item.variant.sku}-${idx}`} className="flex gap-3.5 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-1">
                    <img src={item.variant.image} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold text-xs text-slate-900 leading-tight truncate pr-2">{item.product.title}</h4>
                      <button onClick={() => onRemove(item.variant.sku)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mb-2">{item.variant.option1} • {item.variant.sku}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-slate-100/80 rounded-full px-1.5 h-6 border border-slate-200/60">
                        <button onClick={() => onUpdate(item.variant.sku, item.quantity - 1)} className="px-1.5 font-bold text-slate-500 hover:text-slate-900">-</button>
                        <span className="text-[11px] w-6 text-center font-bold text-slate-900">{item.quantity}</span>
                        <button onClick={() => onUpdate(item.variant.sku, item.quantity + 1)} className="px-1.5 font-bold text-slate-500 hover:text-slate-900">+</button>
                      </div>
                      <span className="text-xs font-black text-slate-900">{formatCOP(item.variant.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200/60">
          <div className="flex justify-between items-center mb-5">
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Subtotal Estimado</span>
            <span className="text-2xl font-black text-slate-900">{formatCOP(subtotal)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full h-13 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl border border-white/20 active:scale-[0.98]"
          >
            <span>Revisar y Generar Proforma</span>
            <span className="material-icons text-base">arrow_forward</span>
          </button>
          <p className="text-[9px] text-slate-400 text-center mt-3 uppercase tracking-widest font-semibold">
            Generación de Orden B2B
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartSheet;
