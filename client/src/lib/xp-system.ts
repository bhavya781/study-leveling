export interface XPData {
  totalXP: number;
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  rank: {
    name: string;
    color: string;
    title: string;
  };
}

export interface XPSystemEvents {
  xpUpdated: CustomEvent<XPData>;
  levelUp: CustomEvent<{ newLevel: number; oldLevel: number }>;
}

const RANKS = [
  { name: 'E-Rank', color: '#8B5A3C', title: 'Beginner', minLevel: 1 },
  { name: 'D-Rank', color: '#A0522D', title: 'Novice', minLevel: 5 },
  { name: 'C-Rank', color: '#CD853F', title: 'Apprentice', minLevel: 10 },
  { name: 'B-Rank', color: '#DAA520', title: 'Skilled', minLevel: 20 },
  { name: 'A-Rank', color: '#FFD700', title: 'Expert', minLevel: 35 },
  { name: 'S-Rank', color: '#FF6347', title: 'Master', minLevel: 50 },
  { name: 'SS-Rank', color: '#FF1493', title: 'Grandmaster', minLevel: 75 },
  { name: 'SSS-Rank', color: '#9400D3', title: 'Legend', minLevel: 100 }
];

export class XPSystem {
  private static STORAGE_KEY = 'productivity_quest_xp';

  static getXPData(): XPData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...data,
        rank: this.getRankFromLevel(data.level)
      };
    }

    return {
      totalXP: 0,
      level: 1,
      currentXP: 0,
      xpForNextLevel: 100,
      rank: RANKS[0]
    };
  }

  static saveXPData(data: XPData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    
    // Dispatch event for other components to listen to
    const event = new CustomEvent('xpUpdated', { detail: data });
    document.dispatchEvent(event);
  }

  static addXP(amount: number, source?: string): { leveledUp: boolean; oldLevel: number; newLevel: number } {
    const currentData = this.getXPData();
    const oldLevel = currentData.level;
    
    currentData.totalXP += amount;
    
    // Recalculate level and current XP
    const levelData = this.calculateLevelFromTotalXP(currentData.totalXP);
    currentData.level = levelData.level;
    currentData.currentXP = levelData.currentXP;
    currentData.xpForNextLevel = levelData.xpForNextLevel;
    currentData.rank = this.getRankFromLevel(currentData.level);

    this.saveXPData(currentData);

    const leveledUp = currentData.level > oldLevel;
    if (leveledUp) {
      const levelUpEvent = new CustomEvent('levelUp', { 
        detail: { newLevel: currentData.level, oldLevel } 
      });
      document.dispatchEvent(levelUpEvent);
    }

    return {
      leveledUp,
      oldLevel,
      newLevel: currentData.level
    };
  }

  static removeXP(amount: number): void {
    const currentData = this.getXPData();
    currentData.totalXP = Math.max(0, currentData.totalXP - amount);
    
    // Recalculate level and current XP
    const levelData = this.calculateLevelFromTotalXP(currentData.totalXP);
    currentData.level = Math.max(1, levelData.level);
    currentData.currentXP = levelData.currentXP;
    currentData.xpForNextLevel = levelData.xpForNextLevel;
    currentData.rank = this.getRankFromLevel(currentData.level);

    this.saveXPData(currentData);
  }

  private static calculateLevelFromTotalXP(totalXP: number): {
    level: number;
    currentXP: number;
    xpForNextLevel: number;
  } {
    let level = 1;
    let xpAccumulated = 0;
    let xpForCurrentLevel = 100;

    while (xpAccumulated + xpForCurrentLevel <= totalXP) {
      xpAccumulated += xpForCurrentLevel;
      level++;
      xpForCurrentLevel = Math.floor(100 * Math.pow(1.2, level - 1));
    }

    const currentXP = totalXP - xpAccumulated;
    const xpForNextLevel = xpForCurrentLevel;

    return { level, currentXP, xpForNextLevel };
  }

  private static getRankFromLevel(level: number) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (level >= RANKS[i].minLevel) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }
}
