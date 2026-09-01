import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  className?: string;
  subtitle?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  textClassName = '',
  className = '',
  subtitle
}) => {
  const sizeMap = {
    sm: {
      container: 'w-7 h-7 rounded-lg',
      icon: 'text-xs',
      text: 'text-sm',
      sub: 'text-[7px]'
    },
    md: {
      container: 'w-9 h-9 md:w-10 md:h-10 rounded-[13px]',
      icon: 'text-sm md:text-base',
      text: 'text-[14px] md:text-[15px]',
      sub: 'text-[8px] md:text-[9px]'
    },
    lg: {
      container: 'w-14 h-14 md:w-16 md:h-16 rounded-[22px]',
      icon: 'text-xl md:text-2xl',
      text: 'text-xl md:text-2xl',
      sub: 'text-[9px] md:text-[10px]'
    },
    xl: {
      container: 'w-20 h-20 rounded-[26px]',
      icon: 'text-2xl md:text-3xl',
      text: 'text-2xl md:text-3xl',
      sub: 'text-xs'
    }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 md:gap-3 ${className}`}>
      {/* Contenedor del icono con efecto cristal de MacStore */}
      <div className="relative shrink-0">
        <div 
          className={`relative ${currentSize.container} flex items-center justify-center overflow-hidden
            bg-gradient-to-b from-white/95 via-white/80 to-white/60 
            backdrop-blur-2xl 
            border border-white/90 
            shadow-[0_10px_25px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)] 
            text-slate-900 group-hover:shadow-[0_14px_30px_rgba(0,0,0,0.1)] 
            transition-all duration-300`}
        >
          {/* Brillo de reflejo especular tipo cristal */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Glifo central */}
          <span className={`material-icons ${currentSize.icon} text-slate-900 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative z-0`}>
            layers
          </span>

          {/* Cinta diagonal de la bandera de Colombia (con amarillo ampliado y muy visible) */}
          <div 
            className="absolute top-0 right-0 w-full h-full pointer-events-none z-10 overflow-hidden"
            title="Colombia"
          >
            <svg 
              viewBox="0 0 100 100" 
              className="absolute -top-[1px] -right-[1px] w-[75%] h-[75%] drop-shadow-[-3px_4px_6px_rgba(0,0,0,0.32)]"
            >
              <defs>
                {/* Degradados luminosos de alta fidelidad para dar textura, volumen y reflejo */}
                <linearGradient id="banderaAmarillo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF266" />
                  <stop offset="35%" stopColor="#FCD116" />
                  <stop offset="85%" stopColor="#F5B800" />
                  <stop offset="100%" stopColor="#D99B00" />
                </linearGradient>
                <linearGradient id="banderaAzul" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A68FF" />
                  <stop offset="45%" stopColor="#003893" />
                  <stop offset="100%" stopColor="#001E54" />
                </linearGradient>
                <linearGradient id="banderaRojo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2E4C" />
                  <stop offset="45%" stopColor="#CE1126" />
                  <stop offset="100%" stopColor="#8A0010" />
                </linearGradient>
              </defs>

              <g>
                {/* Franja Roja (20% del lazo diagonal - interior) */}
                <polygon 
                  points="2,0 16,0 100,84 100,98" 
                  fill="url(#banderaRojo)" 
                />
                {/* Franja Azul (22% del lazo diagonal - media) */}
                <polygon 
                  points="16,0 32,0 100,68 100,84" 
                  fill="url(#banderaAzul)" 
                />
                {/* Franja Amarilla (58% del lazo diagonal - exterior y esquina completa, muy visible y destacada) */}
                <polygon 
                  points="32,0 100,0 100,68" 
                  fill="url(#banderaAmarillo)" 
                />
                
                {/* Reflejos de seda satinada sobre la cinta */}
                <line x1="2" y1="0" x2="100" y2="98" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                <line x1="32" y1="0" x2="100" y2="68" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" />
                <line x1="65" y1="0" x2="100" y2="35" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
              </g>
            </svg>
          </div>

          {/* Borde interior de cristal */}
          <div className="absolute inset-0 rounded-[inherit] border border-white/40 pointer-events-none" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-bold tracking-tight text-slate-900 ${currentSize.text} ${textClassName}`}>
              Cubitt
            </span>
            <span className="font-semibold text-[10px] md:text-[11px] text-slate-500 uppercase tracking-wider bg-slate-900/[0.05] px-1.5 py-0.5 rounded-md border border-slate-900/[0.04]">
              B2B
            </span>
          </div>
          <span className={`font-semibold text-slate-400 uppercase tracking-[0.22em] mt-1 ${currentSize.sub}`}>
            {subtitle || 'Colombia'}
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
