import { useEffect, useRef, useState } from 'react';
import { LOGO_URL } from '../utils/logo.js';

const LINKS = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'community', label: 'Community', icon: 'groups' },
  { id: 'reports', label: 'Reports', icon: 'campaign' },
];

export default function TopNav({ view, onNav, onHome, onSearch, onOpenAdd, demo, user, authLoading, onSignIn, onSignOut, searching, darkMode, onToggleTheme }) {
  const [term, setTerm] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    if (!accountOpen) return undefined;
    function closeOnOutsideClick(event) {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [accountOpen]);

  function submit(e) {
    e.preventDefault();
    onSearch(term);
  }

  return (
    <header className="topnav">
      <button className="logo" onClick={onHome} title="Roots & Routes home">
        <img className="logo-mark" src={LOGO_URL} alt="Roots & Routes logo" />
        <span className="logo-text">
          Roots &amp; <span>Routes</span>
          <small>Community map &amp; memories</small>
        </span>
      </button>

      <form className="searchbox" onSubmit={submit} role="search">
        <span className="material-symbols-outlined">search</span>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search posts or a place…"
          aria-label="Search posts or a place on the map"
        />
        <button type="submit" className="search-go" aria-label="Search" disabled={searching}>
          <span className="material-symbols-outlined">{searching ? 'hourglass_top' : 'arrow_forward'}</span>
        </button>
      </form>

      <nav className="nav-links">
        {LINKS.map((l) => (
          <button
            key={l.id}
            className={'nav-link' + (view === l.id ? ' nav-link--active' : '')}
            onClick={() => onNav(l.id)}
          >
            <span className="material-symbols-outlined">{l.icon}</span>
            {l.label}
          </button>
        ))}
      </nav>

      <div className="topnav-actions">
        {demo && (
          <span className="demo-badge" title="The backend is unreachable. Live posts cannot be loaded.">
            <span className="material-symbols-outlined">science</span>
            Offline
          </span>
        )}
        <button className="btn btn-primary btn-contribute" onClick={onOpenAdd}>
          <span className="material-symbols-outlined">add_location</span>
          <span className="contribute-label">Contribute</span>
        </button>
        <button
          className="icon-btn theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          aria-pressed={darkMode}
          title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
        {user ? (
          <div className="account-menu" ref={accountRef}>
            <button
              className="account-trigger"
              onClick={() => setAccountOpen((open) => !open)}
              aria-label="Open account menu"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              title="Account"
            >
              <span className="avatar" aria-hidden="true">
                {(user.name || user.email || 'U').slice(0, 1).toUpperCase()}
              </span>
            </button>
            {accountOpen && (
              <div className="account-popover" role="menu">
                <div className="account-popover-user">
                  <span className="account-popover-label">Role</span>
                  <strong className="account-popover-role">{user.role === 'admin' ? 'Admin' : 'User'}</strong>
                </div>
                <div className="account-popover-user">
                  <span className="account-popover-label">Signed in as</span>
                  <strong className="account-popover-email">{user.email}</strong>
                </div>
                <div className="account-popover-provider">
                  Signed in with {(user.provider || 'Google').replace(/^./, (letter) => letter.toUpperCase())}
                </div>
                <button
                  className="account-signout"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    onSignOut();
                  }}
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-ghost auth-signin" onClick={onSignIn} disabled={authLoading} aria-label="Sign in with Google" title="Sign in with Google">
            <span className="material-symbols-outlined">login</span>
            <span className="auth-signin-label">{authLoading ? 'Loading…' : 'Sign in'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
