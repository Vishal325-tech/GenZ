import React from 'react';

interface BrandLogoProps {
  className?: string;
  isDarkTheme?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', isDarkTheme = false }) => {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* GZ Monogram with Crown */}
      <div className="relative flex flex-col items-center justify-center shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-luxury-gold to-luxury-gold-dark rounded-full p-[2px] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
        <div className="w-full h-full bg-luxury-black-dark rounded-full flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-luxury-red/20 to-transparent" />
          
          {/* Crown SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-luxury-gold w-4 h-4 sm:w-5 sm:h-5 absolute top-1 sm:top-1.5 drop-shadow-sm">
            <path d="M2.25 18.75a.75.75 0 0 0 0 1.5h19.5a.75.75 0 0 0 0-1.5H2.25ZM21.75 16.5c.24 0 .463-.122.593-.324.13-.203.149-.457.052-.676l-3.374-7.587 1.579-2.527a.75.75 0 0 0-.963-1.07l-3.568 2.378L12.593 2.11a.75.75 0 0 0-1.186 0L7.93 6.695l-3.569-2.378a.75.75 0 0 0-.962 1.07l1.578 2.527-3.373 7.587a.75.75 0 0 0 .052.676c.13.202.353.324.593.324h19.5Z" />
          </svg>
          
          {/* GZ Text */}
          <span className="font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-luxury-gold-light via-luxury-gold to-luxury-gold-dark text-sm sm:text-base leading-none tracking-tighter mt-3 sm:mt-4">
            GZ
          </span>
        </div>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <span className={`font-serif font-black text-lg sm:text-xl lg:text-2xl tracking-[0.15em] leading-none shimmer-gold ${isDarkTheme ? 'text-white' : 'text-luxury-black-dark dark:text-white'}`}>
          GENZ
        </span>
        <div className="flex flex-col mt-0.5">
          <span className="font-sans font-bold text-[8px] sm:text-[10px] tracking-[0.25em] text-luxury-gold uppercase leading-tight">
            Royal Hampers
          </span>
          <span className="font-sans font-extrabold text-[8px] sm:text-[10px] tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-luxury-red to-luxury-gold dark:from-luxury-gold dark:to-white uppercase mt-1 drop-shadow-sm shadow-black/10 transition-all hover:scale-105 origin-left w-max">
            CEO: Vishal S H
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;
