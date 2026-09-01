
import React from 'react';
import { User, AppView } from '../types';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  user: User;
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: AppView) => void;
  onResetCatalog?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onToggleMobileMenu?: () => void;
  currentView?: AppView;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  cartCount, 
  onOpenCart, 
  onNavigate, 
  onResetCatalog,
  searchQuery, 
  setSearchQuery, 
  onToggleMobileMenu,
  currentView = 'CATALOG'
}) => {
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
      'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
      'bg-pink-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = user.companyName.substring(0, 2).toUpperCase();
  const avatarColor = getAvatarColor(user.companyName);

  return (
    <header className="sticky top-2 md:top-3 z-40 px-3 md:px-6 w-full max-w-[1440px] mx-auto transition-all duration-300 pointer-events-none">
      <div className="pointer-events-auto bg-white/40 hover:bg-white/50 backdrop-blur-2xl border border-white/70 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.85)] px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3 md:gap-4 relative overflow-hidden transition-all duration-300">
        
        {/* Subtle top specular glass highlight */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* Left Section: Logo & Mobile Menu */}
        <div className="flex items-center gap-2.5 md:gap-6">
          {/* Mobile Menu Button */}
          <button 
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 -ml-1 text-slate-800 hover:text-black rounded-full hover:bg-white/60 backdrop-blur-sm transition-colors border border-transparent hover:border-white/60 shadow-sm"
          >
            <span className="material-icons text-xl">menu</span>
          </button>

          {/* Logo with MacStore Glass effect and diagonal Colombian flag */}
          <button 
            onClick={() => {
              if (onResetCatalog) {
                onResetCatalog();
              } else {
                onNavigate('CATALOG');
              }
            }}
            className="group flex items-center gap-2.5 transition-transform duration-200 active:scale-95 text-left"
            title="Restablecer filtros y ver todo el catálogo"
          >
            <BrandLogo size="md" showText={true} />
          </button>

          {/* Navigation Links with Frosted Glass Pills */}
          <nav className="hidden lg:flex items-center p-1 bg-black/[0.02] backdrop-blur-md rounded-full border border-black/[0.03]">
            <button 
              onClick={() => {
                if (onResetCatalog) {
                  onResetCatalog();
                } else {
                  onNavigate('CATALOG');
                }
              }} 
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                currentView === 'CATALOG' 
                  ? 'bg-white/80 backdrop-blur-2xl text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/80 font-black' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
              }`}
            >
              Catálogo
            </button>
            <button 
              onClick={() => onNavigate('REVIEW_ORDER')} 
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                currentView === 'REVIEW_ORDER' || currentView === 'SAVED_ORDER_DETAIL'
                  ? 'bg-white/80 backdrop-blur-2xl text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/80 font-black' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
              }`}
            >
              Proformas
            </button>
            <button 
              onClick={() => onNavigate('ACCOUNT')} 
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                currentView === 'ACCOUNT' 
                  ? 'bg-white/80 backdrop-blur-2xl text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/80 font-black' 
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
              }`}
            >
              Cuenta
            </button>
          </nav>
        </div>
        
        {/* Right Section: Search & Actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          <div className="relative flex-1 max-w-[180px] sm:max-w-[220px] md:max-w-[300px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <span className="material-icons text-[16px] md:text-[18px]">search</span>
            </span>
            <input 
              className="w-full pl-9 pr-8 py-2 bg-white/40 backdrop-blur-xl border border-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] rounded-full text-[12px] md:text-[13px] font-medium focus:bg-white/80 focus:ring-2 focus:ring-slate-300/40 focus:border-white placeholder-slate-400 text-slate-900 transition-all outline-none" 
              placeholder="Buscar modelos, SKU..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                title="Limpiar búsqueda"
              >
                <span className="material-icons text-[16px]">close</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2.5">
            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              className="p-2 md:p-2.5 text-slate-700 hover:text-slate-950 bg-white/40 hover:bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full transition-all duration-200 relative group active:scale-95"
              title="Ver Proforma"
            >
               <span className="material-icons text-xl md:text-[22px]">shopping_bag</span>
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-[9px] h-4 w-4 md:h-4.5 md:w-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                   {cartCount}
                 </span>
               )}
            </button>

            {/* Profile Avatar Button */}
            <button 
              onClick={() => onNavigate('ACCOUNT')} 
              className="flex items-center gap-2 md:gap-3 pl-1.5 md:pl-3 md:border-l border-slate-300/40 group py-1"
            >
              <div className="text-right hidden xl:block">
                <p className="text-[11px] font-black uppercase text-slate-900 leading-none mb-0.5 group-hover:text-link-blue transition-colors max-w-[140px] truncate">{user.companyName}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Mi Cuenta</p>
              </div>
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-[10px] md:text-xs ring-2 ring-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.08)] ${avatarColor}`}>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.companyName} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
