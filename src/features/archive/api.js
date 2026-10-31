import supabase from '../../lib/supabase.js';
import { loadSubscription, subscriptionIsOpen } from '../subscription/api.js';

export const roleLabels = {
  family_member: 'Family member',
  contributor: 'Contributor',
  viewer: 'Viewer',
};

export const roleValues = {
  'Family member': 'family_member',
  Contributor: 'contributor',
  Viewer: 'viewer',
};

export const kindLabels = {
  photo: 'Photo',
  story: 'Story',
  voice: 'Voice',
  video: 'Video',
};

export const kindValues = {
  Photo: 'photo',
  Story: 'story',
  Voice: 'voice',
  Video: 'video',
};

export const privacyLabels = {
  family: 'Family',
  private: 'Private',
};

const mediaBucket = 'archive-media';
const maxMediaBytes = 52428800;
const signedUrlSeconds = 60 * 60;

const fileRoleByKind = {
  photo: 'image',
  story: 'image',
  video: 'video',
  voice: 'audio',
};

const fileErrorByKind = {
  photo: 'Choose an image file.',
  story: 'Choose an image file.',
  video: 'Choose a video file.',
  voice: 'Choose an audio file.',
};

const mimeByExtension = {
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  heic: 'image/heic',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  webm: 'video/webm',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
};

const constraintMessages = {
  people_archive_email_key: 'That person is already in this archive.',
  people_role_check: 'Choose a role.',
  memories_kind_check: 'Choose what kind of moment this is.',
  memories_privacy_check: 'Choose who can see this moment.',
  memories_voice_pair: 'A voice needs both a speaker and the words.',
  memory_assets_bytes_check: 'Choose a file that is not empty.',
  memory_assets_mime_matches_role: 'Choose an image, video, or audio file.',
  memory_assets_role_key: 'That moment already has this kind of file.',
};

function friendlyMessage(error, fallback) {
  const message = error?.message || '';
  const known = Object.entries(constraintMessages).find(([name]) => message.includes(name));
  if (known) return known[1];
  if (error?.code === '23505' && message.includes('people_archive_email')) {
    return constraintMessages.people_archive_email_key;
  }
  if (message.includes('email must look like')) {
    return 'Enter an email address like anna@example.com';
  }
  if (message.includes('name is required')) return 'Name is required';
  if (message.includes('title and story are required')) return 'Title is required';
  if (message.includes('title, message, and signature are required')) {
    return 'Title is required';
  }
  if (message.includes('same archive')) return 'Choose someone from this archive.';
  if (message.includes('maximum allowed size') || message.includes('Payload too large')) {
    return 'That file is larger than 50 MB.';
  }
  return message || fallback;
}

function fail(error, fallback) {
  if (!error) return;
  throw new Error(friendlyMessage(error, fallback));
}

function isEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '');
}

function isoDaysFromNow(days) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function mapProfile(row) {
  return {
    id: row.id,
    displayName: row.display_name || null,
  };
}

function mapArchive(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    createdAt: row.created_at,
  };
}

function mapPerson(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function mapAsset(row, url = null) {
  return {
    id: row.id,
    role: row.role,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    bytes: row.bytes,
    alt: row.alt || null,
    durationSeconds: row.duration_seconds ?? null,
    url,
  };
}

function mapMemory(row) {
  const people = row.memory_people || [];
  const assets = row.memory_assets || [];

  return {
    id: row.id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    title: row.title,
    story: row.story,
    place: row.place || null,
    happenedOn: row.happened_on,
    kind: row.kind,
    privacy: row.privacy,
    voiceSpeaker: row.voice_speaker || null,
    voiceTranscript: row.voice_transcript || null,
    personIds: people.map((person) => person.person_id),
    assets: assets.map((asset) => mapAsset(asset)),
  };
}

function mapCapsule(row) {
  const links = [...(row.capsule_memories || [])].sort(
    (left, right) => left.position - right.position,
  );

  return {
    id: row.id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    title: row.title,
    recipientId: row.recipient_id,
    opensOn: row.opens_on,
    message: row.message,
    signature: row.signature,
    sealedAt: row.sealed_at || null,
    memoryIds: links.map((link) => link.memory_id),
  };
}

async function requireUser() {
  const { data, error } = await supabase.auth.getSession();
  fail(error, 'Sign in to open your archive.');
  const user = data.session?.user;
  if (!user) throw new Error('Sign in to open your archive.');
  return user;
}

async function readProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', userId)
    .maybeSingle();
  fail(error, 'Could not open your archive.');
  return data;
}

async function ensureProfile(userId) {
  const existing = await readProfile(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId })
    .select('id, display_name')
    .single();

  if (error?.code === '23505') {
    const raced = await readProfile(userId);
    if (raced) return raced;
  }
  fail(error, 'Could not open your archive.');
  return data;
}

async function readArchive() {
  const { data, error } = await supabase
    .from('archives')
    .select('id, owner_id, created_at')
    .maybeSingle();
  fail(error, 'Could not open your archive.');
  return data;
}

async function ensureArchive(userId) {
  const existing = await readArchive();
  if (existing) return existing;

  const { data, error } = await supabase
    .from('archives')
    .insert({ owner_id: userId })
    .select('id, owner_id, created_at')
    .single();

  if (error?.code === '23505') {
    const raced = await readArchive();
    if (raced) return raced;
  }
  fail(error, 'Could not open your archive.');
  return data;
}

async function openArchive() {
  const user = await requireUser();
  const [profile, archive] = await Promise.all([
    ensureProfile(user.id),
    ensureArchive(user.id),
  ]);
  return { user, profile, archive };
}

const memoryColumns = `
  id,
  created_by,
  created_at,
  title,
  story,
  place,
  happened_on,
  kind,
  privacy,
  voice_speaker,
  voice_transcript,
  memory_people (person_id),
  memory_assets (
    id,
    role,
    storage_path,
    mime_type,
    bytes,
    alt,
    duration_seconds
  )
`;

async function signMemories(memories) {
  const paths = memories.flatMap((memory) => (
    memory.assets.map((asset) => asset.storagePath).filter(Boolean)
  ));
  if (paths.length === 0) return memories;

  const { data, error } = await supabase.storage
    .from(mediaBucket)
    .createSignedUrls(paths, signedUrlSeconds);
  fail(error, 'Could not open a saved file.');

  const urls = new Map();
  (data || []).forEach((item) => {
    if (item.path && item.signedUrl && !item.error) urls.set(item.path, item.signedUrl);
  });

  return memories.map((memory) => ({
    ...memory,
    assets: memory.assets.map((asset) => ({
      ...asset,
      url: urls.get(asset.storagePath) || null,
    })),
  }));
}

async function loadPeople(archiveId) {
  const { data, error } = await supabase
    .from('people')
    .select('id, name, email, role, created_at')
    .eq('archive_id', archiveId)
    .order('created_at', { ascending: true });
  fail(error, 'Could not load your people.');
  return (data || []).map(mapPerson);
}

async function loadMemories(archiveId) {
  const { data, error } = await supabase
    .from('memories')
    .select(memoryColumns)
    .eq('archive_id', archiveId)
    .order('created_at', { ascending: false });
  fail(error, 'Could not load your memories.');
  return signMemories((data || []).map(mapMemory));
}

async function loadCapsules(archiveId) {
  const { data, error } = await supabase
    .from('capsules')
    .select(`
      id,
      created_by,
      created_at,
      title,
      recipient_id,
      opens_on,
      message,
      signature,
      sealed_at,
      capsule_memories (memory_id, position)
    `)
    .eq('archive_id', archiveId)
    .order('created_at', { ascending: false });
  fail(error, 'Could not load your capsules.');
  return (data || []).map(mapCapsule);
}

function cleanVoice(speaker, transcript) {
  const voiceSpeaker = speaker == null ? '' : String(speaker).trim();
  const voiceTranscript = transcript == null ? '' : String(transcript).trim();
  if (!voiceSpeaker && !voiceTranscript) {
    return { voiceSpeaker: null, voiceTranscript: null };
  }
  if (!voiceSpeaker || !voiceTranscript) {
    throw new Error('A voice needs both a speaker and the words.');
  }
  return { voiceSpeaker, voiceTranscript };
}

function mediaFromFile(file) {
  const type = String(file.type || '').toLowerCase();
  if (type.startsWith('image/') || type.startsWith('video/') || type.startsWith('audio/')) {
    return { role: type.slice(0, type.indexOf('/')), mimeType: type };
  }

  const extension = String(file.name || '').toLowerCase().split('.').pop();
  const mimeType = mimeByExtension[extension];
  if (!mimeType) return null;
  return { role: mimeType.slice(0, mimeType.indexOf('/')), mimeType };
}

function cleanDuration(role, value) {
  if (value == null || value === '') return null;
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration < 0) {
    throw new Error('The recording length is not valid.');
  }
  if (role === 'image') return null;
  return Math.round(duration);
}

function prepareFile(file, kind, title, durationSeconds) {
  if (!file) return null;
  const bytes = file.size;
  if (!bytes) throw new Error('Choose a file that is not empty.');
  if (bytes > maxMediaBytes) throw new Error('That file is larger than 50 MB.');

  const media = mediaFromFile(file);
  if (!media) throw new Error(fileErrorByKind[kind] || 'Choose an image, video, or audio file.');
  if (media.role !== fileRoleByKind[kind]) throw new Error(fileErrorByKind[kind]);

  return {
    body: file,
    bytes,
    role: media.role,
    mimeType: media.mimeType,
    alt: media.role === 'image' ? title : null,
    durationSeconds: cleanDuration(media.role, durationSeconds),
  };
}

function uniqueIds(ids, message) {
  const values = [...new Set(ids || [])];
  if (values.some((id) => !isUuid(id))) throw new Error(message);
  return values;
}

async function removeMemory(memoryId) {
  const { error } = await supabase.from('memories').delete().eq('id', memoryId);
  return error;
}

async function requireOpenSubscription() {
  let row = null;
  try {
    row = await loadSubscription();
  } catch {
    throw new Error('Could not check the subscription.');
  }
  if (!subscriptionIsOpen(row)) {
    throw new Error('Start a subscription before adding to this archive.');
  }
}

export async function loadArchive() {
  const { profile, archive } = await openArchive();
  const [people, memories, capsules] = await Promise.all([
    loadPeople(archive.id),
    loadMemories(archive.id),
    loadCapsules(archive.id),
  ]);

  return {
    profile: mapProfile(profile),
    archive: mapArchive(archive),
    people,
    memories,
    capsules,
  };
}

export async function createPerson({ name, email, role }) {
  await requireOpenSubscription();
  const { archive } = await openArchive();
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();

  if (!trimmedName) throw new Error('Name is required');
  if (!trimmedEmail) throw new Error('Email is required');
  if (!isEmailAddress(trimmedEmail)) {
    throw new Error('Enter an email address like anna@example.com');
  }
  if (!roleLabels[role]) throw new Error('Choose a role');

  const { data, error } = await supabase
    .from('people')
    .insert({
      archive_id: archive.id,
      name: trimmedName,
      email: trimmedEmail,
      role,
    })
    .select('id, name, email, role, created_at')
    .single();
  fail(error, 'Could not invite that person.');
  return mapPerson(data);
}

export async function createMemory({
  title,
  story,
  place = '',
  happenedOn,
  kind,
  privacy,
  voiceSpeaker = null,
  voiceTranscript = null,
  personIds = [],
  file = null,
  durationSeconds = null,
}) {
  await requireOpenSubscription();
  const { user, archive } = await openArchive();
  const trimmedTitle = String(title || '').trim();
  const trimmedStory = String(story || '').trim();
  const trimmedPlace = String(place || '').trim();

  if (!trimmedTitle) throw new Error('Title is required');
  if (!isIsoDate(happenedOn)) throw new Error('Choose a date');
  if (!trimmedStory) throw new Error('The story is required');
  if (!kindLabels[kind]) throw new Error('Choose what kind of moment this is.');
  if (!privacyLabels[privacy]) throw new Error('Choose who can see this moment.');

  const voice = cleanVoice(voiceSpeaker, voiceTranscript);
  const people = uniqueIds(personIds, 'Choose people from this archive.');
  const asset = prepareFile(file, kind, trimmedTitle, durationSeconds);

  const { data: memory, error } = await supabase
    .from('memories')
    .insert({
      archive_id: archive.id,
      created_by: user.id,
      title: trimmedTitle,
      story: trimmedStory,
      place: trimmedPlace || null,
      happened_on: happenedOn,
      kind,
      privacy,
      voice_speaker: voice.voiceSpeaker,
      voice_transcript: voice.voiceTranscript,
    })
    .select('id')
    .single();
  fail(error, 'Could not keep that moment.');

  try {
    if (people.length > 0) {
      const { error: linkError } = await supabase.from('memory_people').insert(
        people.map((personId) => ({ memory_id: memory.id, person_id: personId })),
      );
      fail(linkError, 'Choose people from this archive.');
    }

    if (asset) {
      const { data: savedAsset, error: assetError } = await supabase
        .from('memory_assets')
        .insert({
          memory_id: memory.id,
          role: asset.role,
          mime_type: asset.mimeType,
          bytes: asset.bytes,
          alt: asset.alt,
          duration_seconds: asset.durationSeconds,
        })
        .select('id, storage_path')
        .single();
      fail(assetError, 'Could not keep that file.');

      // The database assigns storage_path. The bucket accepts the file only after that row exists.
      const { error: uploadError } = await supabase.storage
        .from(mediaBucket)
        .upload(savedAsset.storage_path, asset.body, {
          contentType: asset.mimeType,
          upsert: false,
        });
      fail(uploadError, 'Could not keep that file.');
    }
  } catch (cause) {
    const cleanupError = await removeMemory(memory.id);
    if (cleanupError) {
      throw new Error(`${cause.message} The moment could not be removed after that failed.`);
    }
    throw cause;
  }

  const { data, error: readError } = await supabase
    .from('memories')
    .select(memoryColumns)
    .eq('id', memory.id)
    .single();
  fail(readError, 'Could not open the moment that was just kept.');
  const [signed] = await signMemories([mapMemory(data)]);
  return signed;
}

export async function createCapsule({
  title,
  recipientId,
  opensOn,
  message,
  signature,
  memoryIds = [],
}) {
  await requireOpenSubscription();
  const { user, archive } = await openArchive();
  const trimmedTitle = String(title || '').trim();
  const trimmedMessage = String(message || '').trim();
  const trimmedSignature = String(signature || '').trim();
  const memories = uniqueIds(memoryIds, 'Choose memories from this archive.');

  if (!trimmedTitle) throw new Error('Title is required');
  if (!isUuid(recipientId)) throw new Error('Choose who this is for');
  if (!isIsoDate(opensOn)) throw new Error('Choose the day it opens');
  if (opensOn < isoDaysFromNow(1)) throw new Error('Choose a day in the future');
  if (!trimmedMessage) throw new Error('A note for that day is required');
  if (!trimmedSignature) throw new Error('A signature is required.');

  const { data: capsule, error } = await supabase
    .from('capsules')
    .insert({
      archive_id: archive.id,
      created_by: user.id,
      title: trimmedTitle,
      recipient_id: recipientId,
      opens_on: opensOn,
      message: trimmedMessage,
      signature: trimmedSignature,
    })
    .select('id')
    .single();
  fail(error, 'Could not seal that capsule.');

  try {
    if (memories.length > 0) {
      const { error: linkError } = await supabase.from('capsule_memories').insert(
        memories.map((memoryId, position) => ({
          capsule_id: capsule.id,
          memory_id: memoryId,
          position,
        })),
      );
      fail(linkError, 'Choose memories from this archive.');

      // Membership is fixed once sealed_at is set, so the links go in first.
      const { error: sealError } = await supabase
        .from('capsules')
        .update({ sealed_at: new Date().toISOString() })
        .eq('id', capsule.id);
      fail(sealError, 'Could not seal that capsule.');
    }
  } catch (cause) {
    await supabase.from('capsules').delete().eq('id', capsule.id);
    throw cause;
  }

  const { data, error: readError } = await supabase
    .from('capsules')
    .select(`
      id,
      created_by,
      created_at,
      title,
      recipient_id,
      opens_on,
      message,
      signature,
      sealed_at,
      capsule_memories (memory_id, position)
    `)
    .eq('id', capsule.id)
    .single();
  fail(readError, 'Could not open the capsule that was just kept.');
  return mapCapsule(data);
}
