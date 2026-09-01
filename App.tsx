
import React, { useState, useMemo, useEffect } from 'react';
import { User, Product, CartItem, Category, AppView, Order } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProductGrid from './components/ProductGrid';
import ProductDetailView from './components/ProductDetailView';
import ReviewOrderView from './components/ReviewOrderView';
import AccountView from './components/AccountView';
import Login from './components/Login';
import { formatCOP } from './utils';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); // Historial de pedidos
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<AppView>('CATALOG');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Estado para controlar el menú lateral en móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cargar pedidos guardados al iniciar y desduplicar por ID
  useEffect(() => {
    const savedOrders = localStorage.getItem('cubitt_b2b_orders');
    if (savedOrders) {
      try {
        const parsed: Order[] = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const deduplicated: Order[] = [];
          for (const order of parsed) {
            if (order && order.id && !seen.has(order.id)) {
              seen.add(order.id);
              deduplicated.push(order);
            }
          }
          setOrders(deduplicated);
          localStorage.setItem('cubitt_b2b_orders', JSON.stringify(deduplicated));
        }
      } catch (e) {
        console.error('Error loading orders', e);
      }
    }
  }, []);

  const saveOrder = (newOrder: Order) => {
    setOrders(prev => {
      const filtered = prev.filter(o => o.id !== newOrder.id);
      const updatedOrders = [newOrder, ...filtered];
      localStorage.setItem('cubitt_b2b_orders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => {
      const updatedOrders = prev.filter(o => o.id !== orderId);
      localStorage.setItem('cubitt_b2b_orders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
  };

  const toggleOrderStatus = (orderId: string) => {
    setOrders(prev => {
      const updatedOrders = prev.map(o => {
        if (o.id === orderId) {
          const nextStatus: 'Paid' | 'Pending' = o.status === 'Paid' ? 'Pending' : 'Paid';
          return { ...o, status: nextStatus };
        }
        return o;
      });
      localStorage.setItem('cubitt_b2b_orders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.type === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStock = !p.isOutOfStock;
      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = cart.reduce((acc, curr) => acc + (curr.variant.price * curr.quantity), 0);
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleProductSelect = (p: Product) => {
    setActiveProduct(p);
    setCurrentView('PRODUCT_DETAIL');
  };

  const handleAddToCart = (product: Product, variantSku: string, quantity: number) => {
    const variant = product.variants.find(v => v.sku === variantSku)!;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.variant.sku === variantSku);
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        };
        return newCart;
      }
      return [...prev, { product, variant, quantity }];
    });
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(item => item.variant.sku !== sku));
  };

  const updateCartQuantity = (sku: string, qty: number) => {
    setCart(prev => prev.map(item => item.variant.sku === sku ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (view !== 'PRODUCT_DETAIL') setActiveProduct(null);
    if (view !== 'SAVED_ORDER_DETAIL') setViewingOrder(null);
    window.scrollTo(0,0);
    setIsMobileMenuOpen(false);
  };

  const handleResetCatalog = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveProduct(null);
    setViewingOrder(null);
    setCurrentView('CATALOG');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  // Si no hay usuario, mostrar Login
  if (!user) {
    return <Login onLogin={(u, loadedProducts) => {
      setUser(u);
      setProducts(loadedProducts); 
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans transition-colors duration-200">
      <Navbar 
        user={user} 
        cartCount={cartCount}
        onOpenCart={() => navigateTo('REVIEW_ORDER')}
        onNavigate={navigateTo}
        onResetCatalog={handleResetCatalog}
        currentView={currentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <Sidebar 
        products={products}
        selectedCategory={selectedCategory} 
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'CATALOG') navigateTo('CATALOG');
        }} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        showDesktop={false}
        onNavigate={navigateTo}
        currentView={currentView}
      />

      {currentView === 'CATALOG' && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-8 flex gap-8 w-full h-[calc(100vh-60px)] md:h-[calc(100vh-80px)]">
          <Sidebar 
            products={products}
            selectedCategory={selectedCategory} 
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
            }} 
            isOpen={false}
            onClose={() => {}}
            showDesktop={true}
            onNavigate={navigateTo}
            currentView={currentView}
          />
          
          <ProductGrid 
            products={filteredProducts} 
            onSelect={handleProductSelect} 
            selectedCategory={selectedCategory}
            isEmpty={products.length === 0} 
          />
        </div>
      )}

      {currentView === 'PRODUCT_DETAIL' && activeProduct && (
        <ProductDetailView 
          product={activeProduct} 
          onAddToCart={handleAddToCart}
          onBack={() => navigateTo('CATALOG')}
          onViewOrder={() => navigateTo('REVIEW_ORDER')}
        />
      )}

      {currentView === 'REVIEW_ORDER' && (
        <ReviewOrderView 
          user={user}
          cart={cart} 
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onBack={() => navigateTo('CATALOG')}
          onSaveOrder={saveOrder}
          onConfirm={() => {
            setCart([]);
            navigateTo('CATALOG');
          }}
        />
      )}

      {currentView === 'SAVED_ORDER_DETAIL' && viewingOrder && (
        <ReviewOrderView 
          user={user}
          cart={viewingOrder.items} 
          onUpdateQuantity={() => {}}
          onRemove={() => {}}
          onBack={() => navigateTo('ACCOUNT')}
          onSaveOrder={() => {}}
          onConfirm={() => {}}
          isReadOnly={true}
          existingOrder={viewingOrder}
        />
      )}

      {currentView === 'ACCOUNT' && (
        <AccountView 
          user={user} 
          onBack={() => navigateTo('CATALOG')} 
          orders={orders}
          onDeleteOrder={deleteOrder}
          onToggleStatus={toggleOrderStatus}
          onViewOrder={(order) => {
            setViewingOrder(order);
            navigateTo('SAVED_ORDER_DETAIL');
          }}
        />
      )}

      {currentView === 'CATALOG' && cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce-in">
          <div 
            onClick={() => navigateTo('REVIEW_ORDER')}
            className="relative overflow-hidden bg-white/50 hover:bg-white/70 text-slate-900 px-5 py-3.5 md:px-6 md:py-4 rounded-full backdrop-blur-3xl border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            {/* Top specular reflection line */}
            <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

            <div className="relative">
              <span className="material-icons text-slate-900 text-xl md:text-2xl group-hover:scale-110 transition-transform">shopping_bag</span>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 text-[10px] md:text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold hidden md:block">Proforma Actual</span>
              <span className="text-base md:text-xl font-black text-slate-950 leading-none">{formatCOP(cartTotal)}</span>
            </div>
            <span className="material-icons text-slate-400 group-hover:text-slate-950 group-hover:translate-x-0.5 transition-all text-lg md:text-xl">arrow_forward</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
