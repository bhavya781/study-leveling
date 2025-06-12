import { Flame, Rocket } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  bonusXP: number;
}

export function StreakModal({ isOpen, onClose, streakDays, bonusXP }: StreakModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm text-center">
        <div className="space-y-6 p-2">
          <div className="space-y-4">
            <Flame className="mx-auto h-16 w-16 text-yellow-400" />
            <h3 className="text-3xl font-bold text-yellow-400">Streak Bonus!</h3>
          </div>
          
          <div className="space-y-4">
            <div className="text-5xl font-bold text-yellow-400">{streakDays}</div>
            <p className="text-xl text-white">Day Streak Achieved!</p>
            <div className="text-3xl font-bold text-green-400">+{bonusXP} XP</div>
            <p className="text-slate-400">Keep up the momentum!</p>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Continue Quest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
