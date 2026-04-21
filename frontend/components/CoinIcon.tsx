"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CoinIconProps {
  symbol: string;
  icon?: string;
  className?: string;
}

export default function CoinIcon({ symbol, icon, className }: CoinIconProps) {
  const [error, setError] = useState(false);
  
  // OKX static icon CDN pattern
  const iconUrl = `https://static.okx.com/cdn/oksupport/asset/currency/icon/${symbol.toLowerCase()}.png`;

  if (!error && symbol) {
    return (
      <div className={cn("relative flex-shrink-0", className)}>
        <img
          src={iconUrl}
          alt={symbol}
          className="w-full h-full object-contain rounded-full"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Fallback to text/emoji if image fails to load
  return (
    <div className={cn("flex items-center justify-center bg-muted rounded-full font-bold text-xs overflow-hidden flex-shrink-0", className)}>
      {icon && icon !== '?' ? icon : symbol[0].toUpperCase()}
    </div>
  );
}
