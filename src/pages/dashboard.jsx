import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/auth-provider.jsx';
import { DashboardAccount } from '../components/dashboard-account.jsx';
import { DashboardArchive } from '../components/dashboard-archive.jsx';
import { DashboardCapsules } from '../components/dashboard-capsules.jsx';
import { DashboardFamily } from '../components/dashboard-family.jsx';
import { DashboardMemories } from '../components/dashboard-memories.jsx';
import { DashboardMoment } from '../components/dashboard-moment.jsx';
import { DashboardShell } from '../components/dashboard-shell.jsx';

import {
  dashboardTitles,
  nameFromEmail,
  starterCapsules,
  starterMemories,
  starterPeople,
} from '../constants/dashboard.js';

function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('archive');
  const [menuOpen, setMenuOpen] = useState(false);
  const [memories, setMemories] = useState(starterMemories);
  const [people, setPeople] = useState(starterPeople);
  const [capsules, setCapsules] = useState(starterCapsules);
  const [selectedId, setSelectedId] = useState('');
  const [justAddedId, setJustAddedId] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const name = nameFromEmail(user?.email);
  const selectedRef = useRef(selectedId);
  const previousView = useRef(view);
  selectedRef.current = selectedId;

  useEffect(() => {
    const previous = document.title;
    document.title = dashboardTitles[view] || 'Your archive | Still';
    return () => {
      document.title = previous;
    };
  }, [view]);

  useEffect(() => {
    if (previousView.current === view) return undefined;
    previousView.current = view;
    if (view === 'memories' && selectedRef.current) return undefined;
    document.getElementById('dashboard-title')?.focus();
    return undefined;
  }, [view]);

  const showView = (next) => {
    if (next !== 'memories') setSelectedId('');
    setJustAddedId('');
    setView(next);
    setMenuOpen(false);
  };

  const openMemory = (id) => {
    setSelectedId(id);
    setJustAddedId('');
    setView('memories');
    setMenuOpen(false);
  };

  const addMemory = (memory) => {
    setMemories((current) => [memory, ...current]);
    setJustAddedId(memory.id);
    setSelectedId(memory.id);
    setView('memories');
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSignOutError('');
    setSigningOut(true);
    const { error } = await signOut();
    setSigningOut(false);
    if (error) {
      setSignOutError(error.message || 'Could not log out. Please try again.');
      return;
    }
    navigate('/login', { replace: true });
  };

  let content = null;
  if (view === 'archive') {
    content = (
      <DashboardArchive
        name={name}
        memories={memories}
        people={people}
        capsules={capsules}
        onOpenMemory={openMemory}
        onView={showView}
      />
    );
  } else if (view === 'memories') {
    content = (
      <DashboardMemories
        memories={memories}
        people={people}
        selectedId={selectedId}
        justAddedId={justAddedId}
        onOpen={(id) => {
          setJustAddedId('');
          setSelectedId(id);
        }}
        onClose={() => setSelectedId('')}
        onAdd={() => showView('add')}
      />
    );
  } else if (view === 'add') {
    content = (
      <DashboardMoment
        people={people}
        memories={memories}
        addedBy={name || 'You'}
        onCreate={addMemory}
      />
    );
  } else if (view === 'capsules') {
    content = (
      <DashboardCapsules
        capsules={capsules}
        people={people}
        memories={memories}
        signature={name ? `${name}, for later` : 'Kept for later'}
        onCreate={(capsule) => setCapsules((current) => [capsule, ...current])}
      />
    );
  } else if (view === 'family') {
    content = (
      <DashboardFamily
        ownerName={name || 'You'}
        ownerEmail={user?.email || ''}
        people={people}
        onInvite={(person) => setPeople((current) => [...current, person])}
      />
    );
  } else {
    content = (
      <DashboardAccount
        email={user?.email || ''}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
    );
  }

  return (
    <DashboardShell
      view={view}
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((open) => !open)}
      onCloseMenu={() => setMenuOpen(false)}
      onView={showView}
      onSignOut={handleSignOut}
      signingOut={signingOut}
      signOutError={signOutError}
    >
      {content}
    </DashboardShell>
  );
}

export default DashboardPage;
