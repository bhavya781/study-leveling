import { Link, useLocation } from 'wouter';
import { Trophy, User, BookOpen, Dumbbell, Calendar } from 'lucide-react';
import { useXP } from '@/hooks/useXP';

export function Navbar() {
  const [location] = useLocation();
  const { xpData } = useXP();

  const navItems = [
    { href: '/', label: 'Home', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/study', label: 'Study', icon: BookOpen },
    { href: '/gym', label: 'Gym', icon: Dumbbell },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Productivity Quest</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <span className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  location === href
                    ? 'text-green-400 bg-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </span>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="bg-slate-700 px-3 py-1 rounded-full">
              <span className="text-slate-300">Level</span>
              <span className="text-yellow-400 font-bold ml-1">{xpData.level}</span>
            </div>
            <div className="bg-slate-700 px-3 py-1 rounded-full">
              <span className="text-slate-300">XP:</span>
              <span className="text-green-400 font-bold ml-1">{xpData.totalXP}</span>
            </div>
            <div className="bg-slate-700 px-3 py-1 rounded-full">
              <span className="text-slate-300">Rank:</span>
              <span 
                className="font-bold ml-1" 
                style={{ color: xpData.rank.color }}
              >
                {xpData.rank.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
