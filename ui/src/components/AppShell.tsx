import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useRtl } from '../hooks/useRtl';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const isRtl = useRtl();
  // Desktop: icon-only collapsed state (persisted)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true',
  );
  // Mobile: off-canvas open state
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMenuClick = () => {
    if (window.innerWidth >= 768) {
      setCollapsed((c) => !c); // desktop: toggle icon-only
    } else {
      setMobileOpen((o) => !o); // mobile: open drawer
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-body)' }}>
      {/* ── Sidebar ── */}
      <Sidebar
        open={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* ── Right column: topbar + content ── */}
      <div
        className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-[padding] duration-300 ${
          isRtl ? (collapsed ? 'md:pr-14' : 'md:pr-56') : collapsed ? 'md:pl-14' : 'md:pl-56'
        }`}
      >
        <TopBar onMenuClick={handleMenuClick} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
