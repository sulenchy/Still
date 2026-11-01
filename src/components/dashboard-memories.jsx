import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowIcon } from './arrow-icon.jsx';
import { MemoryMedia, SingleMedia } from './memory-media.jsx';
import { PlusIcon } from './plus-icon.jsx';
import { DashboardIntro, FormStatus } from './dashboard-shell.jsx';
import { editorial, fieldClass, kicker, primaryButton } from '../constants/class-names.js';
import { privacyLabel } from '../constants/dashboard.js';

function matchesFilter(memory, filter) {
  if (filter === 'All memories') return true;
  if (filter === 'Family') return memory.privacy === 'family';
  return memory.people.includes(filter);
}

function matchesQuery(memory, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    memory.title,
    memory.story,
    memory.place,
    memory.date,
    memory.addedBy,
    memory.kind,
    ...memory.people,
  ].join(' ').toLowerCase();
  return haystack.includes(needle);
}

export function DashboardMemories({
  memories,
  people,
  selectedId,
  justAddedId,
  onOpen,
  onClose,
  onAdd,
  onAddMedia,
  onRemoveMedia,
  canWrite = true,
}) {
  const [filter, setFilter] = useState('All memories');
  const [query, setQuery] = useState('');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [removingId, setRemovingId] = useState('');
  const [removeError, setRemoveError] = useState('');
  const addFileInputRef = useRef(null);

  const filters = [
    { id: 'all', label: 'All memories' },
    { id: 'family', label: 'Family' },
    ...people.map((person) => ({ id: person.id, label: person.name })),
  ];
  const visible = useMemo(
    () => memories.filter((memory) => matchesFilter(memory, filter) && matchesQuery(memory, query)),
    [memories, filter, query],
  );
  const selected = memories.find((memory) => memory.id === selectedId) || null;

  useEffect(() => {
    setActiveMediaIndex(0);
    setUploadError('');
    setRemoveError('');
  }, [selectedId]);

  useEffect(() => {
    if (!selected) return undefined;
    document.getElementById('memory-detail')?.focus();
    return undefined;
  }, [selected]);

  useEffect(() => {
    if (!selectedId) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      onClose();
      document.getElementById(`memory-open-${selectedId}`)?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedId, onClose]);

  const closeDetail = () => {
    const openerId = `memory-open-${selectedId}`;
    onClose();
    window.requestAnimationFrame(() => {
      document.getElementById(openerId)?.focus();
    });
  };

  const handleAttachFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !selected || !onAddMedia) return;
    setUploadError('');
    for (const f of files) {
      if (f.size > 52428800) {
        setUploadError(`"${f.name}" is larger than 50 MB.`);
        if (addFileInputRef.current) addFileInputRef.current.value = '';
        return;
      }
    }
    setUploading(true);
    try {
      await onAddMedia(selected.id, files);
      if (addFileInputRef.current) addFileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err?.message || 'Could not attach media.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (mediaId) => {
    if (!selected || !onRemoveMedia || removingId) return;
    if (!window.confirm('Remove this attachment from this moment?')) return;
    setRemoveError('');
    setRemovingId(mediaId);
    try {
      await onRemoveMedia(selected.id, mediaId);
      setActiveMediaIndex(0);
    } catch (err) {
      setRemoveError(err?.message || 'Could not remove attachment.');
    } finally {
      setRemovingId('');
    }
  };

  const visualMedia = (selected?.media || []).filter((m) => m.role === 'image' || m.role === 'video');
  const audioMedia = (selected?.media || []).filter((m) => m.role === 'audio');
  const activeItem = visualMedia[activeMediaIndex] || visualMedia[0] || null;

  return (
    <div className="flex flex-col gap-10">
      <DashboardIntro
        kickerText="THE FAMILY ARCHIVE"
        title={(
          <>
            A life, <em className="font-normal text-peach">gathered together.</em>
          </>
        )}
        lede="Not a camera roll. The people, places, and tiny details you chose to keep."
      />

      {selected ? (
        <article
          id="memory-detail"
          tabIndex={-1}
          aria-labelledby="memory-detail-title"
          className="grid gap-6 bg-paper p-4 shadow-[0_20px_60px_#1e2e2817] outline-none desk:grid-cols-[1.05fr_0.95fr] desk:p-6"
        >
          <div className="flex flex-col gap-3">
            {activeItem ? (
              <div className="relative">
                <SingleMedia
                  item={activeItem}
                  controls
                  className="h-[320px] w-full object-cover saturate-[0.8] desk:min-h-[420px]"
                />
                {canWrite ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(activeItem.id)}
                    disabled={Boolean(removingId)}
                    className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-forest/80 text-white hover:bg-error disabled:opacity-50"
                    title="Remove this attachment"
                    aria-label="Remove this attachment"
                  >
                    {removingId === activeItem.id ? '…' : '×'}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="flex min-h-[280px] items-end bg-beige p-6">
                <p className="font-serif text-[32px] leading-[1.2] italic">{selected.story}</p>
              </div>
            )}

            {visualMedia.length > 1 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Attached visual media">
                {visualMedia.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeMediaIndex}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative size-16 shrink-0 overflow-hidden border-2 transition-opacity ${
                      idx === activeMediaIndex ? 'border-forest' : 'border-line opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.role === 'video' ? (
                      <div className="grid size-full place-items-center bg-pale font-serif text-[10px] uppercase">
                        Video
                      </div>
                    ) : (
                      <img src={item.url} alt="" className="size-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col px-1 py-2 desk:px-4">
            <div className="flex items-start justify-between gap-4">
              <span className={kicker}>
                {selected.kind} · {privacyLabel(selected.privacy)}
                {selected.media?.length ? ` · ${selected.media.length} ${selected.media.length === 1 ? 'file' : 'files'}` : ''}
              </span>
              <button type="button" className="inline-flex min-h-11 items-center px-2 text-sm hover:underline" onClick={closeDetail}>
                Close
              </button>
            </div>
            <h2 id="memory-detail-title" className={`${editorial} mt-4 text-[clamp(36px,4vw,52px)]`}>
              {selected.title}
            </h2>
            <p className="mt-3 font-serif text-[15px] text-muted italic">
              {selected.place ? `${selected.place} · ` : ''}{selected.date}
            </p>
            {selected.id === justAddedId ? (
              <div className="mt-5">
                <FormStatus>Kept with your archive.</FormStatus>
              </div>
            ) : null}
            <p className="mt-5 text-[15px] leading-[1.75] text-ink">{selected.story}</p>
            <p className="mt-4 text-[12px] tracking-[0.08em] text-muted uppercase">
              Remembered by {selected.addedBy}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="People in this memory">
              {(selected.people.length
                ? selected.people
                : (selected.privacy === 'family' ? ['Family'] : [])
              ).map((person) => (
                <li key={person} className="inline-flex min-h-11 items-center rounded-full bg-pale px-4 text-sm">
                  {person}
                </li>
              ))}
            </ul>

            {audioMedia.length > 0 ? (
              <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
                <p className="text-[10px] tracking-[0.1em] text-peach uppercase">
                  Audio Recordings ({audioMedia.length})
                </p>
                {audioMedia.map((audio) => (
                  <div key={audio.id} className="flex flex-col gap-2 border border-line bg-cream p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-ink">
                        {audio.alt || 'Recording'} {audio.duration ? `(${audio.duration})` : ''}
                      </span>
                      {canWrite ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(audio.id)}
                          disabled={Boolean(removingId)}
                          className="text-[12px] text-muted hover:text-error"
                        >
                          {removingId === audio.id ? 'Removing…' : 'Remove'}
                        </button>
                      ) : null}
                    </div>
                    <audio className="w-full min-h-11" controls preload="metadata" src={audio.url}>
                      This recording can’t play in the browser.
                    </audio>
                  </div>
                ))}
              </div>
            ) : (
              selected.voice?.transcript ? (
                <div className="mt-6 border-t border-line pt-5">
                  <blockquote className="border-l border-peach pl-4 font-serif text-[20px] leading-[1.4] italic">
                    “{selected.voice.transcript}”
                  </blockquote>
                </div>
              ) : null
            )}

            {canWrite ? (
              <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor={`add-media-${selected.id}`}
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-paper px-4 text-xs font-medium text-ink hover:bg-pale disabled:opacity-50"
                  >
                    <PlusIcon />
                    {uploading ? 'Attaching media…' : 'Add media to this moment'}
                  </label>
                  <input
                    ref={addFileInputRef}
                    id={`add-media-${selected.id}`}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleAttachFiles}
                  />
                  <span className="text-[11px] text-muted">
                    {selected.media?.length || 0} attached
                  </span>
                </div>
                {uploadError ? (
                  <p role="alert" className="text-[12px] font-medium text-error">{uploadError}</p>
                ) : null}
                {removeError ? (
                  <p role="alert" className="text-[12px] font-medium text-error">{removeError}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      ) : null}

      <div className="flex flex-col gap-5">
        <label className="block max-w-md">
          <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">Search</span>
          <input
            className={`${fieldClass} placeholder:text-muted`}
            type="search"
            value={query}
            placeholder="Titles, places, people"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4" role="group" aria-label="Filter memories">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm ${
                item.label === filter ? 'bg-forest text-white' : 'text-muted'
              }`}
              aria-pressed={item.label === filter}
              onClick={() => setFilter(item.label)}
            >
              {item.label}
            </button>
          ))}
          <p className="ml-auto font-serif text-[14px] text-muted italic" aria-live="polite">
            {visible.length} {visible.length === 1 ? 'memory' : 'memories'}
          </p>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="border border-dashed border-sage bg-cream px-6 py-16 text-center">
          <h2 className={`${editorial} text-[40px]`}>Nothing kept under that name.</h2>
          <p className="mx-auto mt-4 max-w-[380px] text-[13px] leading-[1.7] text-muted">
            Try another person or a few different words, or add the moment yourself.
          </p>
          <button type="button" className={`${primaryButton} mt-6`} onClick={onAdd}>
            {canWrite === false ? 'Start a subscription' : (
              <>
                <PlusIcon />
                Add a moment
              </>
            )}
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 desk:grid-cols-3">
          {visible.map((memory) => (
            <li key={memory.id}>
              <article className="flex h-full flex-col bg-paper shadow-[0_20px_50px_#1e2e2814]">
                {memory.src ? (
                  <div className="relative">
                    <MemoryMedia
                      memory={memory}
                      className="h-[220px] w-full object-cover saturate-[0.8]"
                    />
                    {memory.media?.length > 1 ? (
                      <span className="absolute top-2 right-2 rounded-full bg-forest/85 px-2.5 py-0.5 text-[11px] text-white backdrop-blur-sm">
                        {memory.media.length} items
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex h-[220px] items-end bg-beige p-5">
                    <p className="line-clamp-4 font-serif text-[22px] leading-[1.25] italic">{memory.story || memory.title}</p>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] tracking-[0.1em] text-peach uppercase">
                    {memory.date}{memory.place ? ` · ${memory.place}` : ''}
                  </p>
                  <h3 className="mt-2 font-serif text-[26px] leading-[1.1] font-normal">{memory.title}</h3>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-[1.6] text-muted">{memory.story}</p>
                  <p className="mt-3 text-[11px] tracking-[0.08em] text-muted uppercase">
                    {memory.kind} · {privacyLabel(memory.privacy)}
                  </p>
                  <button
                    id={`memory-open-${memory.id}`}
                    type="button"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm"
                    aria-label={`Open ${memory.title}`}
                    onClick={() => onOpen(memory.id)}
                  >
                    Open
                    <ArrowIcon />
                  </button>
                </div>
              </article>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="flex h-full min-h-[280px] w-full flex-col items-center justify-center border border-dashed border-sage bg-cream px-6"
              onClick={onAdd}
            >
              <b className="mb-3 grid size-11 place-items-center rounded-full bg-pale">
                <PlusIcon />
              </b>
              <strong className="font-serif text-[22px] font-normal">
                {canWrite === false ? 'Start a subscription' : 'Add a moment'}
              </strong>
              <small className="mt-2 text-[12px] text-muted">
                {canWrite === false ? 'A subscription lets you add a moment' : 'Photo, story, voice, or video'}
              </small>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
