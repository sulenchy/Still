import { memories as galleryMemories } from './data.js';

export const dashboardNav = [
  ['archive', 'Archive'],
  ['memories', 'Memories'],
  ['add', 'Add'],
  ['capsules', 'Capsules'],
  ['family', 'Family'],
  ['account', 'Account'],
];

export const dashboardTitles = {
  archive: 'Your archive | Still',
  memories: 'Memories | Still',
  add: 'Add a moment | Still',
  capsules: 'Time capsules | Still',
  family: 'Family | Still',
  account: 'Account | Still',
};

export const momentKinds = ['Photo', 'Story', 'Voice', 'Video'];

export const privacyChoices = [
  ['family', 'Family', 'People you invite can see it.'],
  ['private', 'Private', 'Only you, until you decide otherwise.'],
];

export const inviteRoles = ['Family member', 'Contributor', 'Viewer'];

const memoryDetails = {
  'The summer we stayed out late': {
    id: 'summer-late',
    place: 'The back field',
    story: 'The light stayed, and so did we. Mara taught Leo the names of the grasses, and nobody called them in.',
    voice: null,
    addedBy: 'Mara',
    kind: 'Photo',
    privacy: 'family',
  },
  'Sunday at Nana’s': {
    id: 'sunday-nana',
    place: 'Nana’s house',
    story: 'She pulled the blue chair closer to the window and told the dance-hall story again, slower this time, so Mara could keep it.',
    voice: {
      speaker: 'Nana',
      duration: '1:12',
      transcript: 'The band was too loud, and your grandfather still heard me say yes.',
    },
    addedBy: 'Mara',
    kind: 'Photo',
    privacy: 'family',
  },
  'Her favorite stories': {
    id: 'favorite-stories',
    place: 'Nana’s house',
    story: 'October light, the same chair, Mara listening with her whole face. This is the afternoon the dance hall became a family story.',
    voice: {
      speaker: 'Nana',
      duration: '0:42',
      transcript: 'Every Sunday, the blue chair, and the dance hall on the corner.',
    },
    addedBy: 'Nana',
    kind: 'Voice',
    privacy: 'family',
  },
  'Tiny explorer': {
    id: 'tiny-explorer',
    place: 'The lane',
    story: 'Leo insisted the puddle was an ocean. We agreed, took off his shoes, and let him captain it.',
    voice: null,
    addedBy: 'You',
    kind: 'Photo',
    privacy: 'family',
  },
  'Picnic weather': {
    id: 'picnic-weather',
    place: 'The park',
    story: 'We forgot the blanket. Nobody minded. The strawberries did most of the talking.',
    voice: {
      speaker: 'Mara',
      duration: '0:28',
      transcript: 'The one with the strawberries. Don’t crop him out.',
    },
    addedBy: 'Mara',
    kind: 'Photo',
    privacy: 'family',
  },
  'Always up here': {
    id: 'always-up-here',
    place: 'The kitchen garden',
    story: 'She wanted the view from his shoulders. He didn’t put her down until the song in the kitchen had finished.',
    voice: null,
    addedBy: 'You',
    kind: 'Photo',
    privacy: 'private',
  },
};

export const starterMemories = galleryMemories.map((memory) => ({
  place: '',
  story: '',
  voice: null,
  addedBy: 'You',
  kind: 'Photo',
  privacy: 'family',
  ...memory,
  ...memoryDetails[memory.title],
  id: memoryDetails[memory.title]?.id || memory.title,
}));

export const starterPeople = [
  {
    id: 'mara',
    name: 'Mara',
    email: 'mara@example.com',
    role: 'Family member',
  },
  {
    id: 'leo',
    name: 'Leo',
    email: 'leo@example.com',
    role: 'Contributor',
  },
  {
    id: 'nana',
    name: 'Nana',
    email: 'nana@example.com',
    role: 'Viewer',
  },
];

export const starterCapsules = [
  {
    id: 'for-mara',
    title: 'For when you wonder',
    recipient: 'Mara',
    opens: '2040-06-18',
    message: 'For when you wonder how deeply you were loved from the very beginning.',
    signature: 'Dad, on your fourth birthday',
    memoryIds: ['picnic-weather', 'always-up-here', 'sunday-nana'],
    status: 'Sealed',
  },
  {
    id: 'leos-ocean',
    title: 'Your first ocean',
    recipient: 'Leo',
    opens: '2032-09-01',
    message: 'You called a puddle an ocean. We kept the afternoon so you can meet the boy who believed it.',
    signature: 'Kept for your first day of school',
    memoryIds: ['tiny-explorer'],
    status: 'Gathering',
  },
];

export function nameFromEmail(email) {
  const word = String(email || '')
    .split('@')[0]
    .split(/[._+\-]/)[0]
    .replace(/[^A-Za-z]/g, '');

  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function initialFromName(name) {
  const letter = String(name || '').trim().charAt(0);
  return letter ? letter.toUpperCase() : '?';
}

export function formatMemoryDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function formatLongDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function privacyLabel(privacy) {
  return privacy === 'private' ? 'Private' : 'Family';
}
