'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#1B7B4E] flex flex-col items-center justify-center
                    transition-opacity duration-500"
         style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Zap size={40} className="text-white" fill="white" />
        <h1 className="text-4xl font-bold text-white tracking-tight">PlugMeNow</h1>
      </div>
      <p className="text-white/80 text-sm">Βρες φορτιστή, τώρα!</p>
    </div>
  );
}
