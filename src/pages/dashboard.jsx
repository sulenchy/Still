import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useAuth } from '../features/auth/useAuth.js';
import { invitePerson, keepCapsule, keepMemory } from '../features/archive/archiveActions.js';
import { selectCapsules } from '../features/archive/capsulesSlice.js';
import { selectMemories } from '../features/archive/memoriesSlice.js';
import { selectPeople } from '../features/archive/peopleSlice.js';
import { presentCapsule, presentMemory, presentPerson } from '../features/archive/present.js';
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
} from '../constants/dashboard.js';

function unwrapArchive(dispatch, thunk, input) {
  return dispatch(thunk(input)).then((result) => {
    if (thunk.rejected.match(result)) {
      throw new Error(result.payload || result.error?.message || 'Could not save that.');
    }
    return result.payload;
  });
}

function DashboardPage() {
  const dispatch = useDispatch();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('archive');
  const storedPeople = useSelector(selectPeople);
  const storedMemories = useSelector(selectMemories);
  const storedCapsules = useSelector(selectCapsules);
  const archiveStatus = useSelector((state) => state.people.status);
  const archiveError = useSelector((state) => state.people.error);
  const name = nameFromEmail(user?.email);
  const peopleById = useMemo(
    () => Object.fromEntries(storedPeople.map((person) => [person.id, person])),
    [storedPeople],
  );
  const people = useMemo(
    () => storedPeople.map(presentPerson),
    [storedPeople],
  );
  const memories = useMemo(
    () => storedMemories.map((memory) => presentMemory(
      memory,
      peopleById,
      memory.createdBy === user?.id ? (name || 'You') : 'Family',
    )),
    [storedMemories, peopleById, user?.id, name],
  );
  const capsules = useMemo(
    () => storedCapsules.map((capsule) => presentCapsule(capsule, peopleById)),
    [storedCapsules, peopleById],
  );
  const [selectedId, setSelectedId] = useState('');
  const [justAddedId, setJustAddedId] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
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
  };

  const openMemory = (id) => {
    setSelectedId(id);
    setJustAddedId('');
    setView('memories');
  };

  const saveMemory = async (input) => {
    const memory = await unwrapArchive(dispatch, keepMemory, input);
    setJustAddedId(memory.id);
    setSelectedId(memory.id);
    setView('memories');
  };

  const savePerson = (input) => unwrapArchive(dispatch, invitePerson, input);

  const saveCapsule = (input) => unwrapArchive(dispatch, keepCapsule, input);

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
        addedBy={name || 'You'}
        onCreate={saveMemory}
      />
    );
  } else if (view === 'capsules') {
    content = (
      <DashboardCapsules
        capsules={capsules}
        people={people}
        memories={memories}
        signature={name ? `${name}, for later` : 'Kept for later'}
        onCreate={saveCapsule}
      />
    );
  } else if (view === 'family') {
    content = (
      <DashboardFamily
        ownerName={name || 'You'}
        ownerEmail={user?.email || ''}
        people={people}
        onInvite={savePerson}
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
      onView={showView}
      onSignOut={handleSignOut}
      signingOut={signingOut}
      signOutError={signOutError}
    >
      {archiveStatus === 'failed' && archiveError ? (
        <p role="alert" className="mb-8 text-sm text-error">{archiveError}</p>
      ) : null}
      {content}
    </DashboardShell>
  );
}

export default DashboardPage;
