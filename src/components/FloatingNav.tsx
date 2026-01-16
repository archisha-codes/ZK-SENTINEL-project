import { motion } from 'framer-motion';
import { Home, FileText, Activity, Settings } from 'lucide-react';
import { useState } from 'react';

type NavItem = 'home' | 'documents' | 'activity' | 'settings';

interface FloatingNavProps {
  activeItem?: NavItem;
  onNavigate?: (item: NavItem) => void;
}

export const FloatingNav = ({ activeItem = 'home', onNavigate }: FloatingNavProps) => {
  const [hoveredItem, setHoveredItem] = useState<NavItem | null>(null);

  const items: Array<{ id: NavItem; icon: typeof Home; label: string }> = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 148, 0.1) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <div className="relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-full px-6 py-4 shadow-2xl">
          <div className="flex flex-col items-center gap-2">

            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isHovered = hoveredItem === item.id;

              return (
                <div key={item.id} className="relative">
                  <motion.button
                    onClick={() => onNavigate?.(item.id)}
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                    className={`relative p-4 rounded-full transition-colors ${
                      isActive
                        ? 'text-black'
                        : 'text-white/60 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-cyber to-cyber-purple rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                  </motion.button>

                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"

                    >
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1.5">
                        <span className="text-white text-xs font-body font-medium">
                          {item.label}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
