
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant } from '../types';
import { formatCOP } from '../utils';

interface ProductDetailViewProps {
  product: Product;
  onAddToCart: (p: Product, variantSku: string, quantity: number) => void;
  onBack: () => void;
  onViewOrder: () => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onAddToCart, onBack, onViewOrder }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isAdded, setIsAdded] = useState(false);
  const isAddingRef = useRef(false);

  const availableVariants = product.variants.filter(v => v.inventory > 0);

  useEffect(() => {
    const firstAvailable = product.variants.find(v => v.inventory > 0);
    if (firstAvailable) {
      setSelectedVariant(firstAvailable);
    } else {
      setSelectedVariant(product.variants[0]);
    }
    setQuantity(1);
  }, [product]);

  const currentQty = typeof quantity === 'number' ? quantity : 1;
  const itemTotal = (selectedVariant.price * currentQty).toFixed(2);

  const handleAdd = () => {
    if (currentQty <= 0 || isAddingRef.current) return;
    
    isAddingRef.current = true;
    onAddToCart(product, selectedVariant.sku, currentQty);
    setIsAdded(true);
    setQuantity(1);
    
    setTimeout(() => {
      setIsAdded(false);
      isAddingRef.current = false;
    }, 500);
  };

  const handleQuantityChange = (val: string) => {
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const increment = () => setQuantity(prev => (typeof prev === 'number' ? prev : 1) + 1);
  const decrement = () => setQuantity(prev => {
    const val = typeof prev === 'number' ? prev : 1;
    return val > 1 ? val - 1 : 1;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4 md:py-8 animate-in fade-in zoom-in-95 duration-500 pb-24 md:pb-8">
      <nav className="mb-4 md:mb-8">
        <button onClick={onBack} className="flex items-center text-[9px] md:text-[10px] font-black text-[#86868B] uppercase tracking-[0.4em] hover:text-black transition-all group">
          <span className="material-icons text-base md:text-lg mr-2 md:mr-3 group-hover:-translate-x-1 transition-transform">arrow_back</span> Regresar
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 bg-white rounded-[32px] md:rounded-[40px] border border-black/5 p-6 md:p-12 shadow-xl">
        
        {/* Galería Técnica compacta */}
        <div className="lg:col-span-5 flex items-center justify-center bg-[#F5F5F7] rounded-[24px] md:rounded-[32px] p-6 md:p-8 h-full min-h-[300px] border border-black/5 shadow-inner self-stretch">
          {selectedVariant.image ? (
            <img 
              src={selectedVariant.image} 
              alt={selectedVariant.sku} 
              className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-300">
              <span className="material-icons text-[60px] md:text-[80px] mb-4 md:mb-6">inventory_2</span>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Visual no disponible</span>
            </div>
          )}
        </div>

        {/* Configuración de Pedido */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div>
            <header className="mb-2 md:mb-4 pb-2 md:pb-4 border-b border-black/5">
              <div className="text-[9px] md:text-[10px] font-black text-link-blue uppercase tracking-[0.4em] mb-1 md:mb-2">
                {product.category} • {product.type}
              </div>
              <h1 className="text-xl md:text-3xl font-black text-black tracking-tighter uppercase leading-tight mb-1 md:mb-2">
                {product.title}
              </h1>
              {/* Descripción eliminada para dar espacio a los colores */}
            </header>

            {/* Selector de SKU Avanzado - Expandido */}
            <div className="mb-4 md:mb-6">
              <div className="flex justify-between items-end mb-4 md:mb-6">
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-black uppercase tracking-[0.4em] mb-1">Colores Disponibles</h3>
                  <div className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total: {availableVariants.length} variantes</div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] md:text-[9px] font-mono font-black text-black bg-black/5 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-black/5 uppercase">
                    SKU: {selectedVariant.sku} | Unitario: {formatCOP(selectedVariant.price)} {selectedVariant.compareAtPrice ? `| MSRP: ${formatCOP(selectedVariant.compareAtPrice)}` : ''}
                  </span>
                </div>
              </div>

              {/* Grid sin límite de altura y sin scroll para ver todos */}
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-1.5 md:gap-2">
                {availableVariants.map((v) => (
                  <button 
                    key={v.sku}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex flex-col items-center gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                      selectedVariant.sku === v.sku 
                        ? 'border-black bg-black/15 text-black shadow-sm' 
                        : 'border-black/5 hover:border-black/20 bg-white text-black'
                    }`}
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {v.image ? (
                        <img src={v.image} alt={v.option1} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <span className="material-icons text-gray-400 text-[16px]">inventory_2</span>
                      )}
                    </div>
                    <div className="text-center w-full min-w-0">
                      <div className="text-[7px] md:text-[8px] font-black uppercase tracking-tight leading-none mb-0.5 truncate w-full">{v.option1}</div>
                      <div className={`text-[6px] md:text-[7px] font-mono truncate ${selectedVariant.sku === v.sku ? 'text-gray-500 font-bold' : 'text-gray-400'}`}>{v.sku}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Acción Maestro con diseño Cristal MacStore */}
          <div className="bg-white/45 hover:bg-white/55 backdrop-blur-3xl rounded-[28px] md:rounded-[36px] p-4 md:p-6 text-slate-900 border border-white/75 shadow-[0_20px_50px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.9)] mt-auto flex flex-col items-center text-center max-w-md mx-auto w-full transition-all">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 mb-3 md:mb-4 w-full">
              <div className="w-full md:w-40 flex flex-col items-center">
                <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Cantidad</div>
                <div className="flex items-center bg-white/40 backdrop-blur-md rounded-2xl border border-white/80 h-9 md:h-11 px-1.5 transition-all hover:bg-white/60 relative w-full justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <button 
                    type="button" 
                    onClick={decrement} 
                    className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-xl text-slate-700 hover:text-black transition-all active:scale-90 z-10 shadow-sm"
                  >
                    <span className="material-icons text-sm md:text-base">remove</span>
                  </button>
                  <input 
                    type="number" 
                    className="flex-1 bg-transparent border-none text-center font-black text-sm md:text-base focus:ring-0 text-slate-900 p-0 min-w-0 max-w-[50px]" 
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    onBlur={() => setQuantity(currentQty)}
                  />
                  <button 
                    type="button" 
                    onClick={increment} 
                    className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-xl text-slate-700 hover:text-black transition-all active:scale-90 z-10 shadow-sm"
                  >
                    <span className="material-icons text-sm md:text-base">add</span>
                  </button>
                </div>
              </div>
              
              <div className="text-center w-full md:w-auto flex-1 md:border-l border-slate-300/40 md:pl-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-300/40 mt-2 md:mt-0">
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1">Total SKU</span>
                <div className="text-xl md:text-3xl font-black tracking-tighter text-slate-900 leading-none">
                  {formatCOP(selectedVariant.price * currentQty)}
                </div>
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAdd();
              }}
              disabled={currentQty <= 0 || isAdded}
              className={`w-full h-11 md:h-13 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all flex items-center justify-center gap-2 mb-2 ${
                isAdded ? 'bg-emerald-500 text-white scale-[1.01] shadow-lg shadow-emerald-500/25' : 
                currentQty <= 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' :
                'bg-slate-900/90 hover:bg-slate-900 active:scale-[0.98] text-white backdrop-blur-xl border border-white/20 shadow-[0_10px_25px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.2)]'
              }`}
            >
              <span className="material-icons text-base md:text-lg">{isAdded ? 'done' : 'add_shopping_cart'}</span>
              {isAdded ? 'Añadido a Proforma' : 'Cargar a Proforma'}
            </button>

            <button 
              onClick={onViewOrder}
              className="w-full h-9 md:h-10 rounded-2xl font-bold text-[8px] md:text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 border border-white/80 bg-white/40 hover:bg-white/80 backdrop-blur-xl text-slate-800 hover:text-black shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              <span className="material-icons text-xs">description</span> Ver Proforma Actual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
