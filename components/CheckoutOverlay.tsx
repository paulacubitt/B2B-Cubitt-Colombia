
import React, { useState } from 'react';
import { CartItem, User } from '../types';
import { formatCOP } from '../utils';

interface CheckoutOverlayProps {
  cart: CartItem[];
  user?: User;
  onClose: () => void;
  onConfirm: () => void;
}

const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({ cart, user, onClose, onConfirm }) => {
  const [step, setStep] = useState<'review' | 'success'>('review');
  const subtotal = cart.reduce((acc, curr) => acc + (curr.variant.price * curr.quantity), 0);
  const total = subtotal; // Precios en Colombia incluyen IVA
  const totalQuantity = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleWhatsApp = () => {
    const br = "\n";
    let text = `Nombre: ${user?.companyName || 'Cliente'}${br}`;
    text += `Tipo de precio: ${user?.priceType || 'Estándar B2B'}${br}${br}`;
    text += `Productos:${br}`;
    cart.forEach((i) => {
      text += `- ${i.product.title} (${i.variant.option1}) - Cant: ${i.quantity} - Precio: ${formatCOP(i.variant.price)}${br}`;
    });
    text += `${br}Total: ${formatCOP(total, true)}${br}`;
    text += `Cantidad de productos: ${totalQuantity}`;

    window.open(`https://wa.me/573242565268?text=${encodeURIComponent(text)}`);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" />
      
      <div className="relative w-full max-w-4xl z-10">
        <header className="text-center mb-12">
          <h2 className="text-5xl font-bold tracking-tight mb-4">Confirmación de Orden</h2>
          <p className="text-xl text-[#86868b] font-light">Revise los detalles de su orden de compra corporativa.</p>
        </header>

        <div className="bg-white rounded-[40px] border border-[#d2d2d7]/50 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 p-10 lg:p-12 overflow-y-auto max-h-[60vh]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#86868b] mb-8">Productos Seleccionados</h3>
            <div className="space-y-8">
              {cart.map((item, idx) => (
                <div key={`${item.variant.sku}-${idx}`} className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-[#f5f5f7] rounded-xl overflow-hidden border border-black/5 shrink-0">
                    <img src={item.variant.image} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-lg">{item.product.title}</span>
                      <span className="font-semibold text-lg">{formatCOP(item.variant.price * item.quantity)}</span>
                    </div>
                    <div className="text-sm text-[#86868b] mt-1">
                      {item.variant.option1} • {item.quantity} unds • Unitario: {formatCOP(item.variant.price)} • SKU: {item.variant.sku}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[350px] bg-[#f5f5f7] p-10 lg:p-12 flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#86868b] mb-8">Resumen</h3>
            <div className="space-y-4 mb-10">
              <div className="flex justify-between text-[#424245]">
                <span>Cantidad Total</span>
                <span className="font-bold">{totalQuantity} unds</span>
              </div>
              <div className="flex justify-between text-[#424245]">
                <span>Subtotal</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#424245]">
                <span>Envío B2B</span>
                <span className="text-emerald-600 font-medium">Incluido</span>
              </div>
              <div className="h-px bg-[#d2d2d7] my-4" />
              <div className="flex justify-between items-baseline text-black">
                <div>
                  <span className="text-xl font-bold block">Total COP</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">IVA Incluido</span>
                </div>
                <span className="text-2xl font-black">{formatCOP(total, true)}</span>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <button 
                onClick={handleWhatsApp}
                className="w-full h-14 bg-[#25D366] text-white rounded-2xl font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined">chat</span>
                Confirmar vía WhatsApp
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-[#86868b] font-medium hover:text-black transition-colors"
              >
                Modificar Orden
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-[#86868b] text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">location_on</span>
            Cra 47 A #91-73, Bogotá
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">call</span>
            (+57) 324 256 5268
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">verified</span>
            Cubitt Colombia Oficial
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOverlay;
