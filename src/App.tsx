import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { HelmetProvider } from 'react-helmet-async';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AdminProvider, useAdmin } from './context/AdminContext';
import WelcomeOverlay from './components/WelcomeOverlay';
import HeadManager from './components/HeadManager';
import { VersionPoller } from './components/VersionPoller';

// Pages - Optimized with Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Sports = lazy(() => import('./pages/Sports'));
const Contact = lazy(() => import('./pages/Contact'));
const BosVenue = lazy(() => import('./pages/BosVenue'));
const Login = lazy(() => import('./pages/Login'));
const Legal = lazy(() => import('./pages/Legal'));
const AdminDashboard = lazy(() => import('./pages/Admin'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 border-t-2 border-green rounded-full"
      />
    </div>
  );
}

function LocationProvider() {
  const location = useLocation();
  const { data } = useAdmin();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        {/* @ts-expect-error key is used for AnimatePresence tracking */}
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/sports/:slug" element={<Sports />} />
          <Route path="/sports" element={<Navigate to={`/sports/${data?.sportsPages?.[0]?.slug || 'track'}`} replace />} />
          <Route path="/bos-venue" element={<BosVenue />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal/:type" element={<Legal />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function ThemeInjector() {
  const { data } = useAdmin();
  const location = useLocation();
  const isVenue = location.pathname === '/bos-venue';
  const theme = isVenue ? data?.bosVenue?.theme : data?.theme;
  
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-green', theme.accentColor);
    root.style.setProperty('--color-lime', theme.accentHover);
    root.style.setProperty('--color-border', theme.borderColor);
    root.style.setProperty('--color-bg', theme.backgroundColor);
    
    root.style.setProperty('--radius-btn', theme.buttonRadius);
    root.style.setProperty('--radius-card', theme.cardRadius);
    
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
    
    root.style.setProperty('--font-display', theme.headingFont);
    root.style.setProperty('--font-sans', theme.bodyFont);
  }, [theme]);

  return (
    <style>{`
      :root {
        --color-primary: ${theme?.primaryColor || '#35144F'};
        --color-secondary: ${theme?.secondaryColor || '#f5f5f5'};
        --color-green: ${theme?.accentColor || '#00A850'};
        --color-lime: ${theme?.accentHover || '#D6E01A'};
        --color-border: ${theme?.borderColor || '#e5e5e5'};
        --radius-btn: ${theme?.buttonRadius || '0.75rem'};
        --radius-card: ${theme?.cardRadius || '1.5rem'};
        --font-display: ${theme?.headingFont || '"Oswald", sans-serif'};
        --font-sans: ${theme?.bodyFont || '"Inter", sans-serif'};
      }
      body {
        background-color: ${theme?.backgroundColor || '#ffffff'};
        color: ${theme?.textColor || '#171717'};
      }
      /* Apply radii to components that should respect theme */
      .rounded-btn { border-radius: var(--radius-btn); }
      .rounded-card { border-radius: var(--radius-card); }
      .border-theme { border-color: var(--color-border); }
    `}</style>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AdminProvider>
        <Router>
          <HeadManager />
          <WelcomeOverlay />
          <ThemeInjector />
          <VersionPoller />
          <div className="min-h-screen text-primary flex flex-col font-sans relative overflow-x-hidden transition-colors duration-500" style={{backgroundColor: 'var(--color-bg)'}}>
            
            {/* SYSTEM-WIDE MOVING BLURRED BACKGROUNDS - Optimized for scroll performance */}
            <div className="fixed inset-0 pointer-events-none z-[0] opacity-30 select-none overflow-hidden">
              <motion.div 
                 animate={{ x: ["-2%", "8%", "-2%"], y: ["-2%", "5%", "-2%"] }}
                 transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                 className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-purple-400/30 rounded-full blur-[80px]" 
                 style={{ willChange: 'transform' }}
              />
              <motion.div 
                 animate={{ x: ["5%", "-8%", "5%"], y: ["5%", "-3%", "5%"] }}
                 transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                 className="absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] bg-green/30 rounded-full blur-[100px]" 
                 style={{ willChange: 'transform' }}
              />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-grow">
                <LocationProvider />
              </main>
              <Footer />
            </div>
          </div>
        </Router>
      </AdminProvider>
    </HelmetProvider>
  );
}

