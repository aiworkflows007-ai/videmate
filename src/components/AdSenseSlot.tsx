import React, { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, isAdSenseEnabled } from '../config/site';
import { pushAdSlot } from '../lib/adsense';

interface AdSenseSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  label?: string;
}

export function AdSenseSlot({
  slotId,
  format = 'auto',
  className = '',
  label = 'Advertisement',
}: AdSenseSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!isAdSenseEnabled || pushed.current) return;
    pushed.current = true;
    pushAdSlot();
  }, [slotId]);

  if (!isAdSenseEnabled) {
    return null;
  }

  return (
    <aside
      className={`ad-slot w-full overflow-hidden rounded-xl border border-white/5 bg-surface-container/50 ${className}`}
      aria-label={label}
    >
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 text-center py-1.5 border-b border-white/5">
        {label}
      </p>
      <ins
        className="adsbygoogle block min-h-[90px]"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        {...(slotId ? { 'data-ad-slot': slotId } : {})}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
