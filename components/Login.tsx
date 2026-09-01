
import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { fetchClientPriceType, fetchRawProducts, processRawRows, getFallbackRawProducts } from '../services/dataService';
import { PRODUCTS } from '../constants';
import BrandLogo from './BrandLogo';

interface LoginProps {
  onLogin: (user: User, products: Product[]) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawProducts, setRawProducts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const productsData = await fetchRawProducts();
        if (isMounted) {
          setRawProducts(productsData.length > 0 ? productsData : getFallbackRawProducts());
        }
      } catch (err: any) {
        console.warn("Error loading products, using default catalog:", err);
        if (isMounted) {
          setRawProducts(getFallbackRawProducts());
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Obtener tipo de precio
      let priceType: string | null = null;
      try {
        priceType = await fetchClientPriceType(companyName);
      } catch {
        priceType = null;
      }
      
      console.log(`Cliente: ${companyName}, Tipo de precio: ${priceType || 'Default'}`);

      // 2. Procesar productos con el tipo de precio
      const rowsToProcess = rawProducts.length > 0 ? rawProducts : getFallbackRawProducts();
      let products = processRawRows(rowsToProcess, priceType || undefined);

      if (!products || products.length === 0) {
        products = PRODUCTS;
      }

      if (!products || products.length === 0) {
        throw new Error('No se encontraron productos disponibles.');
      }

      // Generar avatar con iniciales usando UI Avatars
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=000000&color=ffffff&bold=true&length=2&size=128`;

      onLogin({
        id: `CUST-${Date.now().toString().slice(-4)}`,
        companyName: companyName,
        email: 'contacto@cliente.com', // Default placeholder
        taxId: '', // Optional now
        authorized: true,
        contractUpdateDate: new Date().toLocaleDateString('es-CO'),
        avatar: avatarUrl,
        priceType: priceType || 'Estándar B2B'
      }, products);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al procesar los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAEAF0] via-[#F5F5F7] to-[#DFDFE8] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle MacStore background ambient light blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* MacStore Frosted Glass Login Box */}
      <div className="bg-white/50 hover:bg-white/55 backdrop-blur-3xl p-8 md:p-12 rounded-[36px] md:rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.07),inset_0_1px_2px_rgba(255,255,255,0.95)] w-full max-w-[440px] border border-white/80 animate-in fade-in zoom-in-95 duration-500 relative z-10 transition-all">
        
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-4">
            <BrandLogo size="lg" />
          </div>
          <div className="flex items-center gap-2 justify-center mt-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Cubitt
            </h1>
            <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider bg-slate-900/[0.05] px-2 py-0.5 rounded-md border border-slate-900/[0.04]">
              B2B
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.25em]">
              Portal Corporativo
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Colombia
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
              Empresa / Razón Social
            </label>
            <input 
              className="w-full bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus:bg-white/80 focus:ring-2 focus:ring-slate-400/30 focus:border-white placeholder-slate-400 transition-all outline-none" 
              placeholder="Ej. Distribuidora Colombia S.A.S." 
              required 
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              disabled={loading || initialLoading}
            />
          </div>

          {error && (
            <div className="p-3.5 bg-red-50/80 backdrop-blur-md text-red-600 text-xs rounded-xl border border-red-200/60 font-medium">
              {error}
            </div>
          )}

          <div className="pt-2">
             <button 
                type="submit"
                disabled={!companyName || loading || initialLoading}
                className="w-full bg-slate-900/90 hover:bg-slate-900 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] backdrop-blur-xl border border-white/20 shadow-[0_10px_25px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all duration-200 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2 group"
             >
                {initialLoading ? (
                  <>
                    <span className="material-icons animate-spin text-sm">refresh</span>
                    <span>Iniciando Catálogo...</span>
                  </>
                ) : loading ? (
                  <>
                    <span className="material-icons animate-spin text-sm">refresh</span>
                    <span>Accediendo...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Portal</span>
                    <span className="material-icons text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </>
                )}
             </button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="material-icons text-xs text-emerald-500">lock</span> Acceso B2B Verificado
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
