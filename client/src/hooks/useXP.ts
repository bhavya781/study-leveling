import { useState, useEffect } from 'react';
import { XPSystem, XPData } from '@/lib/xp-system';

export function useXP() {
  const [xpData, setXPData] = useState<XPData>(XPSystem.getXPData());

  useEffect(() => {
    const handleXPUpdate = (event: CustomEvent<XPData>) => {
      setXPData(event.detail);
    };

    document.addEventListener('xpUpdated', handleXPUpdate as EventListener);
    
    return () => {
      document.removeEventListener('xpUpdated', handleXPUpdate as EventListener);
    };
  }, []);

  const addXP = (amount: number, source?: string) => {
    const result = XPSystem.addXP(amount, source);
    setXPData(XPSystem.getXPData());
    return result;
  };

  const removeXP = (amount: number) => {
    XPSystem.removeXP(amount);
    setXPData(XPSystem.getXPData());
  };

  return {
    xpData,
    addXP,
    removeXP,
    refreshXP: () => setXPData(XPSystem.getXPData())
  };
}
