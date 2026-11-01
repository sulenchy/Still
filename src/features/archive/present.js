import { formatMemoryDate } from '../../constants/dashboard.js';
import { kindLabels, roleLabels } from './api.js';

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds)));
  if (!Number.isFinite(total)) return '';
  const minutes = Math.floor(total / 60);
  const rest = String(total % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

function assetByRole(memory, role) {
  return memory.assets.find((asset) => asset.role === role && asset.url) || null;
}

export function presentPerson(person) {
  return {
    id: person.id,
    name: person.name,
    email: person.email || '',
    role: roleLabels[person.role] || person.role,
  };
}

export function presentMemory(memory, peopleById, authorName) {
  const names = (memory.personIds || [])
    .map((id) => peopleById[id]?.name)
    .filter(Boolean);

  const rawItems = memory.media || memory.assets || [];
  const items = rawItems.filter((item) => item && item.url);

  const allMedia = items.map((asset) => ({
    id: asset.id,
    role: asset.role,
    url: asset.url,
    alt: asset.alt || memory.title,
    mimeType: asset.mimeType || '',
    bytes: asset.bytes || 0,
    duration: asset.durationSeconds != null ? formatDuration(asset.durationSeconds) : '',
    durationSeconds: asset.durationSeconds ?? null,
    displayOrder: asset.displayOrder ?? 0,
  }));

  const image = items.find((asset) => asset.role === 'image') || null;
  const video = items.find((asset) => asset.role === 'video') || null;
  const audio = items.find((asset) => asset.role === 'audio') || null;
  const visual = memory.kind === 'video' ? (video || image) : (image || video);
  const speaker = memory.voiceSpeaker || '';
  const transcript = memory.voiceTranscript || '';
  const hasVoice = memory.kind === 'voice' || speaker || transcript || audio;

  return {
    id: memory.id,
    title: memory.title,
    story: memory.story || '',
    place: memory.place || '',
    date: memory.happenedOn ? formatMemoryDate(memory.happenedOn) : '',
    kind: kindLabels[memory.kind] || memory.kind,
    privacy: memory.privacy,
    addedBy: authorName || 'You',
    people: names,
    src: visual?.url || '',
    alt: visual?.alt || memory.title,
    mediaType: visual?.role === 'video' ? 'video' : (visual ? 'image' : ''),
    audioSrc: audio?.url || '',
    media: allMedia,
    voice: hasVoice
      ? {
        speaker: speaker || authorName || 'You',
        duration: audio?.durationSeconds != null ? formatDuration(audio.durationSeconds) : '',
        transcript,
      }
      : null,
  };
}

export function presentCapsule(capsule, peopleById) {
  const recipient = peopleById[capsule.recipientId];

  return {
    id: capsule.id,
    title: capsule.title,
    recipient: recipient?.name || 'Family',
    opens: capsule.opensOn || '',
    message: capsule.message || '',
    signature: capsule.signature || '',
    memoryIds: capsule.memoryIds || [],
    status: capsule.sealedAt ? 'Sealed' : 'Gathering',
  };
}
