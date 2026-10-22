import { useEffect, useMemo, useState } from 'react';
import { ArrowIcon } from './arrow-icon.jsx';
import { MemoryMedia } from './memory-media.jsx';
import { PlusIcon } from './plus-icon.jsx';
import { DashboardIntro, FormStatus } from './dashboard-shell.jsx';
import { editorial, fieldClass, kicker, primaryButton } from '../constants/class-names.js';
import { privacyLabel } from '../constants/dashboard.js';

function matchesFilter(memory, filter) {
  if (filter === 'All memories') return true;
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
}) {
  const [filter, setFilter] = useState('All memories');
  const [query, setQuery] = useState('');
  const [playingId, setPlayingId] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
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
    setPlayingId('');
    setVoiceMessage('');
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

  const toggleVoice = (memory) => {
    const nextPlaying = playingId !== memory.id;
    setPlayingId(nextPlaying ? memory.id : '');
    setVoiceMessage(nextPlaying
      ? `Playing ${memory.voice.speaker}’s voice.`
      : `${memory.voice.speaker}’s voice paused.`);
  };

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
          {selected.src ? (
            <MemoryMedia
              memory={selected}
              controls
              className="h-[320px] w-full object-cover saturate-[0.8] desk:h-full desk:min-h-[420px]"
            />
          ) : (
            <div className="flex min-h-[280px] items-end bg-beige p-6">
              <p className="font-serif text-[32px] leading-[1.2] italic">{selected.story}</p>
            </div>
          )}
          <div className="flex flex-col px-1 py-2 desk:px-4">
            <div className="flex items-start justify-between gap-4">
              <span className={kicker}>{selected.kind} · {privacyLabel(selected.privacy)}</span>
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
              {(selected.people.filter((person) => person !== 'Family').length
                ? selected.people.filter((person) => person !== 'Family')
                : ['Family']
              ).map((person) => (
                <li key={person} className="inline-flex min-h-11 items-center rounded-full bg-pale px-4 text-sm">
                  {person}
                </li>
              ))}
            </ul>
            {selected.voice ? (
              <div className="mt-6 border-t border-line pt-5">
                {selected.audioSrc ? (
                  <audio className="w-full min-h-11" controls preload="metadata" src={selected.audioSrc}>
                    This recording can’t play in the browser.
                  </audio>
                ) : (
                  <button
                    type="button"
                    className={primaryButton}
                    aria-pressed={playingId === selected.id}
                    onClick={() => toggleVoice(selected)}
                  >
                    {playingId === selected.id ? 'Pause' : 'Play'} {selected.voice.speaker}’s voice
                    <span className="text-white/70">{selected.voice.duration}</span>
                  </button>
                )}
                <p className="sr-only" aria-live="polite">{voiceMessage}</p>
                <blockquote className="mt-4 border-l border-peach pl-4 font-serif text-[20px] leading-[1.4] italic">
                  “{selected.voice.transcript}”
                </blockquote>
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
            <PlusIcon />
            Add a moment
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 desk:grid-cols-3">
          {visible.map((memory) => (
            <li key={memory.id}>
              <article className="flex h-full flex-col bg-paper shadow-[0_20px_50px_#1e2e2814]">
                {memory.src ? (
                  <MemoryMedia
                    memory={memory}
                    className="h-[220px] w-full object-cover saturate-[0.8]"
                  />
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
                    onClick={() => {
                      setPlayingId('');
                      onOpen(memory.id);
                    }}
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
              <strong className="font-serif text-[22px] font-normal">Add a moment</strong>
              <small className="mt-2 text-[12px] text-muted">Photo, story, voice, or video</small>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
