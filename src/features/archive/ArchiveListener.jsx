import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { archiveCleared, loadArchiveForUser } from './archiveActions.js';

function ArchiveListener() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const userId = useSelector((state) => state.auth.user?.id ?? null);
  const archiveStatus = useSelector((state) => state.people.status);
  const archiveUserId = useSelector((state) => state.people.userId);

  useEffect(() => {
    if (authStatus === 'initializing') return undefined;

    if (authStatus !== 'authenticated' || !userId) {
      if (archiveStatus !== 'idle' || archiveUserId) {
        dispatch(archiveCleared());
      }
      return undefined;
    }

    const sameUser = archiveUserId === userId;
    const settled = archiveStatus === 'loading'
      || archiveStatus === 'ready'
      || archiveStatus === 'failed';
    if (sameUser && settled) return undefined;

    dispatch(loadArchiveForUser(userId));
    return undefined;
  }, [authStatus, userId, archiveStatus, archiveUserId, dispatch]);

  return null;
}

export default ArchiveListener;
