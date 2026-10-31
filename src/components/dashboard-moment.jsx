import { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from './arrow-icon.jsx';
import { DashboardIntro, FormAlert, paperCard } from './dashboard-shell.jsx';
import { WritePaused } from './write-paused.jsx';
import { fieldClass, primaryButton } from '../constants/class-names.js';
import { kindValues } from '../features/archive/api.js';
import {
  momentKinds,
  privacyChoices,
} from '../constants/dashboard.js';
import { UnderlineField } from './underline-field.jsx';
import { firstErrorId, useQueuedFocus } from '../lib/index.js';

const fields = [
  ['file', 'moment-file'],
  ['title', 'moment-title'],
  ['date', 'moment-date'],
  ['story', 'moment-story'],
];

const kindNotes = {
  Photo: 'The photograph and the story stay together.',
  Video: 'The video stays with this moment.',
  Voice: 'We’ll keep the words, and the recording if you add one.',
  Story: 'A few true sentences are enough.',
};

const uploadCopy = {
  Photo: {
    label: 'Photograph',
    accept: 'image/*',
    hint: 'Optional. Leave this blank to keep the story without a photograph.',
    error: 'Choose an image file.',
  },
  Video: {
    label: 'Video',
    accept: 'video/*',
    hint: 'Optional. Leave this blank to keep the story without a video.',
    error: 'Choose a video file.',
  },
  Voice: {
    label: 'Recording',
    accept: 'audio/*',
    hint: 'Optional. We’ll keep the words if you skip this.',
    error: 'Choose an audio file.',
  },
  Story: {
    label: 'Photograph',
    accept: 'image/*',
    hint: 'Optional. Add a picture if this story has one.',
    error: 'Choose an image file.',
  },
};

function mediaKindOf(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';

  const name = file.name.toLowerCase();
  if (/\.(avif|bmp|gif|heic|jpe?g|png|webp)$/.test(name)) return 'image';
  if (/\.(m4v|mov|mp4|webm)$/.test(name)) return 'video';
  if (/\.(aac|m4a|mp3|ogg|wav)$/.test(name)) return 'audio';
  return '';
}

function fileAllowed(kind, file) {
  const mediaKind = mediaKindOf(file);
  if (kind === 'Video') return mediaKind === 'video';
  if (kind === 'Voice') return mediaKind === 'audio';
  return mediaKind === 'image';
}

function choiceClass(selected) {
  return `flex min-h-11 cursor-pointer items-center gap-3 border px-4 ${
    selected ? 'border-forest bg-pale' : 'border-line bg-paper'
  }`;
}

export function DashboardMoment({ people, addedBy, onCreate, canWrite = true, onAccount }) {
  const [kind, setKind] = useState('Photo');
  const [privacy, setPrivacy] = useState('family');
  const [chosenPeople, setChosenPeople] = useState([]);
  const [values, setValues] = useState({ title: '', date: '', place: '', story: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const queueFocus = useQueuedFocus();
  const upload = uploadCopy[kind];
  const messages = [...new Set([formError, ...Object.values(errors)].filter(Boolean))];

  useEffect(() => {
    if (!file || mediaKindOf(file) !== 'image') {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  };

  const togglePerson = (id) => {
    setChosenPeople((current) => (
      current.includes(id) ? current.filter((personId) => personId !== id) : [...current, id]
    ));
  };

  const selectKind = (item) => {
    setKind(item);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors((current) => (current.file ? { ...current, file: '' } : current));
  };

  const handleFile = (event) => {
    const next = event.target.files?.[0] || null;
    setFile(next);
    if (!next || fileAllowed(kind, next)) {
      setErrors((current) => (current.file ? { ...current, file: '' } : current));
      return;
    }
    setErrors((current) => ({ ...current, file: upload.error }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || canWrite !== true) return;

    const nextErrors = {};
    if (file && !fileAllowed(kind, file)) nextErrors.file = upload.error;
    if (!values.title.trim()) nextErrors.title = 'Title is required';
    if (!values.date) nextErrors.date = 'Choose a date';
    if (!values.story.trim()) nextErrors.story = 'The story is required';
    setErrors(nextErrors);
    setFormError('');

    const invalidId = firstErrorId(nextErrors, fields);
    if (invalidId) {
      queueFocus(invalidId);
      return;
    }

    const story = values.story.trim();
    setSaving(true);
    try {
      await onCreate({
        title: values.title.trim(),
        story,
        place: values.place.trim(),
        happenedOn: values.date,
        kind: kindValues[kind],
        privacy,
        voiceSpeaker: kind === 'Voice' ? (addedBy || 'You') : null,
        voiceTranscript: kind === 'Voice' ? story : null,
        personIds: chosenPeople,
        file: file || null,
      });
    } catch (error) {
      setFormError(error?.message || 'Could not keep that moment.');
      setSaving(false);
    }
  };

  return (
    <div className="grid items-start gap-12 desk:grid-cols-[0.82fr_1.18fr]">
      <DashboardIntro
        kickerText="ADD A MOMENT"
        title={(
          <>
            Keep one <em className="font-normal text-peach">small thing.</em>
          </>
        )}
        lede="A photograph, a few words, a voice, or a video. Start with whatever you have. The story is the part only you can tell."
      >
        <dl className="mt-8 grid grid-cols-2 gap-5 border-y border-line py-6">
          <div>
            <dt className="text-[9px] tracking-[0.12em] text-peach uppercase">Keep</dt>
            <dd className="mt-2 font-serif text-[18px] leading-[1.3] font-normal">Photo, story, voice, or video</dd>
          </div>
          <div>
            <dt className="text-[9px] tracking-[0.12em] text-peach uppercase">Privacy</dt>
            <dd className="mt-2 font-serif text-[18px] leading-[1.3] font-normal">Private, until you share it</dd>
          </div>
        </dl>
      </DashboardIntro>

      {canWrite === false ? (
        <WritePaused onAccount={onAccount} />
      ) : (
      <form className={`${paperCard} flex flex-col gap-6`} onSubmit={handleSubmit} noValidate>
        <FormAlert id="moment-error" title="We couldn’t keep that yet." messages={messages} />
        <fieldset>
          <legend className="mb-3 text-[9px] tracking-[0.08em] uppercase">What are you keeping?</legend>
          <div className="grid grid-cols-2 gap-3">
            {momentKinds.map((item) => (
              <label key={item} className={choiceClass(kind === item)}>
                <input
                  type="radio"
                  name="moment-kind"
                  value={item}
                  checked={kind === item}
                  onChange={() => selectKind(item)}
                />
                {item}
              </label>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-[1.5] text-muted">{kindNotes[kind]}</p>
        </fieldset>
        <div>
          <label htmlFor="moment-file" className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
            {upload.label}
          </label>
          <input
            ref={fileInputRef}
            id="moment-file"
            name="file"
            type="file"
            accept={upload.accept}
            aria-invalid={errors.file ? 'true' : undefined}
            aria-describedby={errors.file ? 'moment-file-error' : 'moment-file-hint'}
            className={`${fieldClass} min-h-11 cursor-pointer file:mr-4 file:inline-flex file:min-h-11 file:cursor-pointer file:items-center file:border-0 file:bg-pale file:px-4 file:font-sans file:text-sm file:text-ink`}
            onChange={handleFile}
          />
          {errors.file ? (
            <p id="moment-file-error" className="mt-2 text-[13px] leading-[1.5] font-medium text-error">
              {errors.file}
            </p>
          ) : (
            <small id="moment-file-hint" className="mt-2 block text-[12px] leading-[1.5] text-muted">
              {upload.hint}
            </small>
          )}
          {previewUrl ? (
            <img
              alt="Preview of the chosen photograph"
              src={previewUrl}
              className="mt-4 h-40 w-full object-cover saturate-[0.8]"
            />
          ) : null}
        </div>
        <UnderlineField
          id="moment-title"
          name="title"
          label="Title"
          value={values.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Sunday at the window"
          required
        />
        <div className="grid gap-6 desk:grid-cols-2">
          <UnderlineField
            id="moment-date"
            name="date"
            label="Date"
            type="date"
            value={values.date}
            onChange={handleChange}
            error={errors.date}
            required
          />
          <UnderlineField
            id="moment-place"
            name="place"
            label="Place"
            value={values.place}
            onChange={handleChange}
            placeholder="Nana’s house"
          />
        </div>
        <div>
          <label htmlFor="moment-story" className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
            The story
          </label>
          <textarea
            id="moment-story"
            name="story"
            rows="5"
            required
            value={values.story}
            placeholder="What should this remember?"
            aria-invalid={errors.story ? 'true' : undefined}
            aria-describedby={errors.story ? 'moment-story-error' : undefined}
            className={`${fieldClass} placeholder:text-muted`}
            onChange={handleChange}
          />
          {errors.story ? (
            <p id="moment-story-error" className="mt-2 text-[13px] leading-[1.5] font-medium text-error">
              {errors.story}
            </p>
          ) : null}
        </div>
        <fieldset>
          <legend className="mb-1 text-[9px] tracking-[0.08em] uppercase">People in this memory</legend>
          <p className="mb-3 text-[12px] leading-[1.5] text-muted">Choose anyone who was there.</p>
          {people.length === 0 ? (
            <p className="text-[13px] text-muted">Invite someone from Family, then come back to name them here.</p>
          ) : (
            <div className="grid gap-2">
              {people.map((person) => (
                <label key={person.id} className={choiceClass(chosenPeople.includes(person.id))}>
                  <input
                    type="checkbox"
                    name="moment-people"
                    value={person.id}
                    checked={chosenPeople.includes(person.id)}
                    onChange={() => togglePerson(person.id)}
                  />
                  {person.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-[9px] tracking-[0.08em] uppercase">Who can see it?</legend>
          <div className="grid gap-3">
            {privacyChoices.map(([value, label, detail]) => (
              <label key={value} className={choiceClass(privacy === value)}>
                <input
                  type="radio"
                  name="moment-privacy"
                  value={value}
                  checked={privacy === value}
                  onChange={() => setPrivacy(value)}
                />
                <span>
                  <span className="block">{label}</span>
                  <span className={`block text-[12px] ${privacy === value ? 'text-ink/70' : 'text-muted'}`}>{detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col items-start gap-4 desk:flex-row desk:items-center desk:justify-between">
          <p className="max-w-[240px] text-[12px] leading-[1.5] text-muted">
            By keeping this moment, you add it to your archive.
          </p>
          <button type="submit" className={primaryButton} disabled={saving || canWrite !== true}>
            {saving ? 'Keeping this moment' : (canWrite === null ? 'Checking your subscription' : 'Keep this moment')}
            <ArrowIcon />
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
