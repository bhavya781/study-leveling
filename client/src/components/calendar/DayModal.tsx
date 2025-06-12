import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Eraser, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number | null;
  initialStatus?: 'completed' | 'missed' | '';
  initialSummary?: string;
  onSave: (dayNumber: number, status: 'completed' | 'missed' | '', summary: string) => void;
}

export function DayModal({ 
  isOpen, 
  onClose, 
  dayNumber, 
  initialStatus = '', 
  initialSummary = '', 
  onSave 
}: DayModalProps) {
  const [status, setStatus] = useState<'completed' | 'missed' | ''>(initialStatus);
  const [summary, setSummary] = useState(initialSummary);

  useEffect(() => {
    if (isOpen) {
      setStatus(initialStatus);
      setSummary(initialSummary);
    }
  }, [isOpen, initialStatus, initialSummary]);

  const handleSave = () => {
    if (dayNumber !== null) {
      onSave(dayNumber, status, summary);
      onClose();
    }
  };

  if (!dayNumber) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Day {dayNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium mb-4 block">Mark this day as:</Label>
            <div className="space-y-2">
              <Button
                onClick={() => setStatus('completed')}
                className={`w-full justify-start p-3 h-auto ${
                  status === 'completed' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-green-600/20 hover:bg-green-600/30 border border-green-600'
                }`}
              >
                <CheckCircle className="mr-3 h-5 w-5" />
                Completed (+25 XP)
              </Button>
              <Button
                onClick={() => setStatus('missed')}
                className={`w-full justify-start p-3 h-auto ${
                  status === 'missed' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-red-600/20 hover:bg-red-600/30 border border-red-600'
                }`}
              >
                <XCircle className="mr-3 h-5 w-5" />
                Missed
              </Button>
              <Button
                onClick={() => setStatus('')}
                className={`w-full justify-start p-3 h-auto ${
                  status === '' 
                    ? 'bg-slate-600 hover:bg-slate-700' 
                    : 'bg-slate-600/20 hover:bg-slate-600/30 border border-slate-600'
                }`}
              >
                <Eraser className="mr-3 h-5 w-5" />
                Clear Status
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="day-summary" className="block text-sm font-medium mb-2">
              Day Summary (3-4 words):
            </Label>
            <Input
              id="day-summary"
              type="text"
              maxLength={30}
              placeholder="e.g. Mock test done"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-green-400"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
