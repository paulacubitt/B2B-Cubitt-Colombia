import React from 'react';
import { CartItem, User } from '../types';
import { formatCOP } from '../utils';

interface PdfTemplateProps {
  user?: User;
  cart: CartItem[];
  orderId: string;
  date: string;
  subtotal: number;
  tax?: number;
  total: number;
  totalQuantity: number;
}

const PdfTemplate: React.FC<PdfTemplateProps> = ({
  user,
  cart,
  orderId,
  date,
  subtotal,
  tax,
  total,
  totalQuantity
}) => {
  const calculatedTax = tax !== undefined ? tax : subtotal * 0.19;
  const calculatedTotal = total || (subtotal + calculatedTax);

  return (
    <div className="fixed top-0 left-0 w-[816px] pointer-events-none opacity-0 z-[-1]">
      <div id="proforma-invoice-content" className="bg-white p-6 w-full text-black font-sans relative">
          
          <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-3">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                     <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-lg">
                         <span className="material-icons text-lg">layers</span>
                     </div>
                     <h1 className="text-xl font-black uppercase tracking-tighter">Cubitt Colombia</h1>
                 </div>
                 <div className="text-[10px] text-gray-500 leading-tight">
                     Portal Corporativo B2B<br />
                     Cra 47 A #91-73, Bogotá, Colombia<br />
                     Tel / WhatsApp: (+57) 324 256 5268<br />
                     Paula@cubitt.com.co
                 </div>
              </div>
              <div className="text-right">
                  <h2 className="text-3xl font-black uppercase tracking-widest text-gray-200 mb-1">Proforma</h2>
                  <div className="text-xs font-bold">#{orderId}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{date}</div>
              </div>
          </div>

          <div className="mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Facturar a</h3>
                <div className="text-lg font-black uppercase tracking-tight">{user?.companyName || 'Cliente Corporativo'}</div>
              </div>
              {user?.priceType && (
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Tipo de Precio</span>
                  <span className="text-xs font-black uppercase px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200">{user.priceType}</span>
                </div>
              )}
          </div>

          <table className="w-full mb-6">
              <thead>
                  <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest">
                      <th className="text-left py-1.5 w-[46%]">Descripción</th>
                      <th className="text-center py-1.5">SKU</th>
                      <th className="text-center py-1.5">Cant</th>
                      <th className="text-right py-1.5">Precio Unit.</th>
                      <th className="text-right py-1.5">Total</th>
                  </tr>
              </thead>
              <tbody className="text-xs">
                  {cart.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                          <td className="py-1.5 pr-2 flex items-center gap-3">
                              {item.variant.image && (
                                  <div className="w-8 h-8 flex-shrink-0 bg-gray-50 rounded border border-gray-100 p-0.5">
                                      <img src={item.variant.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                  </div>
                              )}
                              <div>
                                  <div className="font-bold truncate max-w-[200px]">{item.product.title}</div>
                                  <div className="text-[10px] text-gray-500">{item.variant.option1}</div>
                              </div>
                          </td>
                          <td className="py-1.5 text-center font-mono text-xs font-bold text-gray-700">{item.variant.sku}</td>
                          <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                          <td className="py-1.5 text-right text-gray-600 font-medium">{formatCOP(item.variant.price)}</td>
                          <td className="py-1.5 text-right font-bold">{formatCOP(item.variant.price * item.quantity)}</td>
                      </tr>
                  ))}
              </tbody>
          </table>

          <div className="flex justify-end mb-6">
              <div className="w-56 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                      <span>Cant. Total</span>
                      <span className="font-medium">{totalQuantity} unds</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatCOP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                      <span>IVA (19%)</span>
                      <span className="font-medium">{formatCOP(calculatedTax)}</span>
                  </div>
                  <div className="h-px bg-black my-1"></div>
                  <div className="flex justify-between text-lg font-black">
                      <span>Total</span>
                      <span>{formatCOP(calculatedTotal, true)}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 text-right font-semibold">
                      * Precios en Pesos Colombianos (COP) • IVA (19%) incluido en el total
                  </div>
              </div>
          </div>

          <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">Términos y Condiciones</h4>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-600">
                  <div>
                      <span className="block font-bold text-black mb-0.5">Información Comercial</span>
                      Cotización oficial B2B<br />
                      Cra 47 A #91-73, Bogotá, Colombia<br />
                      Tel / WhatsApp: (+57) 324 256 5268<br />
                      Email: Paula@cubitt.com.co<br />
                      Cubitt Oficial Colombia
                  </div>
                  <div>
                      <span className="block font-bold text-black mb-0.5">Términos</span>
                      Validez: 15 días calendario.<br />
                      Despacho: 24-48 horas tras confirmación.<br />
                      Moneda: Pesos Colombianos (COP) • IVA (19%) incluido.
                  </div>
              </div>
          </div>

          <div className="text-center border-t border-gray-100 pt-3 mt-4">
               <p className="text-[8px] text-gray-400 font-medium uppercase tracking-widest">
                  Cubitt Oficial B2B • Cra 47 A #91-73, Bogotá
               </p>
          </div>

      </div>
    </div>
  );
};

export default PdfTemplate;
