import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function VersionPoller() {
  const { refreshData } = useAdmin();
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  useEffect(() => {
    // Initial fetch to set the current version
    const fetchVersion = async () => {
      try {
        const res = await fetch('/api/version');
        if (res.ok) {
          const data = await res.json();
          setCurrentVersion(data.version);
        }
      } catch (e) {
        console.warn("Version check failed during initialization", e);
      }
    };

    fetchVersion();

    // Check for updates every 60 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/version');
        if (res.ok) {
          const data = await res.json();
          if (currentVersion && data.version !== currentVersion) {
            setNewVersionAvailable(true);
            // Trigger a data refresh for seamless background update
            refreshData();
            // Once we detect a new version, we can stop polling
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.warn("Version check failed", e);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentVersion]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {newVersionAvailable && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 z-[1000]"
        >
          <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4">
            <div className="bg-green/20 p-2 rounded-xl">
              <RefreshCw className="w-5 h-5 text-green animate-spin-slow" />
            </div>
            <div>
              <p className="text-sm font-bold">New Version Available</p>
              <p className="text-[10px] text-white/60">A new update has been deployed.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReload}
                className="bg-green text-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-lime transition-all"
              >
                Update Now
              </button>
              <button
                onClick={() => setNewVersionAvailable(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
