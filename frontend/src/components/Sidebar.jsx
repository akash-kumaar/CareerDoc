import { useState } from 'react';

// ── Icons ─────────────────────────────────────────────
function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="1" y1="3.5" x2="13" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="1" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconHelp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5.5 5.5C5.5 4.67 6.17 4 7 4s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="7" cy="10.5" r="0.6" fill="currentColor"/>
    </svg>
  );
}

function IconCollapse() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ── Sidebar Component ─────────────────────────────────
export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'overview',      label: 'Overview',      icon: <IconGrid /> },
    { id: 'opportunities', label: 'Opportunities', icon: <IconList /> },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <span className="mobile-wordmark">JobTrack</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`}>
        {/* Wordmark */}
        <div className="sidebar-wordmark">
          <span className="sidebar-wordmark-text">JobTrack</span>
          <div className="sidebar-wordmark-dot">
            <span />
            <span />
            <span />
          </div>
          {mobileOpen && (
            <button
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          )}
        </div>

        {/* Nav items */}
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom controls */}
        <div className="sidebar-bottom">
          <button
            className="sidebar-bottom-item"
            title={collapsed ? 'Help' : undefined}
            onClick={() => {}}
          >
            <IconHelp />
            <span className="sidebar-bottom-label">Help</span>
          </button>
          <button
            className="sidebar-bottom-item"
            title={collapsed ? 'Expand' : 'Collapse'}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <IconExpand /> : <IconCollapse />}
            <span className="sidebar-bottom-label">
              {collapsed ? 'Expand' : 'Collapse'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
