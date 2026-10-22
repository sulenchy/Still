import { useState } from 'react';
import { ArrowIcon } from './arrow-icon.jsx';
import { DashboardIntro, FormAlert, paperCard } from './dashboard-shell.jsx';
import { fieldClass, primaryButton } from '../constants/class-names.js';
import {
  formatMemoryDate,
  momentKinds,
  privacyChoices,
} from '../constants/dashboard.js';
import { UnderlineField } from './underline-field.jsx';
import { firstErrorId, useQueuedFocus } from '../lib/index.js';

const fields = [
  ['title', 'moment-title'],
  ['date', 'moment-date'],
  ['story', 'moment-story'],
];

const kindNotes = {
  Photo: 'A sample photograph stands in until uploads are connected.',
  Video: 'We’ll keep the story now. Playback comes later.',
  Voice: 'We’ll keep the words until recording is connected.',
  Story: 'A few true sentences are enough.',
};

function choiceClass(selected) {
  return `flex min-h-11 cursor-pointer items-center gap-3 border px-4 ${
    selected ? 'border-forest bg-pale' : 'border-line bg-paper'
  }`;
}

export function DashboardMoment({ people, memories, addedBy, onCreate }) {
  const [kind, setKind] = useState('Photo');
  const [privacy, setPrivacy] = useState('family');
  const [chosenPeople, setChosenPeople] = useState([]);
  const [values, setValues] = useState({ title: '', date: '', place: '', story: '' });
  const [errors, setErrors] = useState({});
  const queueFocus = useQueuedFocus();
  const messages = [...new Set(Object.values(errors).filter(Boolean))];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  };

  const togglePerson = (name) => {
    setChosenPeople((current) => (
      current.includes(name) ? current.filter((person) => person !== name) : [...current, name]
    ));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required';
    if (!values.date) nextErrors.date = 'Choose a date';
    if (!values.story.trim()) nextErrors.story = 'The story is required';
    setErrors(nextErrors);

    const invalidId = firstErrorId(nextErrors, fields);
    if (invalidId) {
      queueFocus(invalidId);
      return;
    }

    const taggedPeople = [...chosenPeople];
    if (privacy === 'family' && !taggedPeople.includes('Family')) taggedPeople.unshift('Family');
    const samples = memories.filter((memory) => memory.src);
    const sample = samples.length ? samples[memories.length % samples.length] : null;
    const useSample = kind === 'Photo' || kind === 'Video';

    onCreate({
      id: `memory-${Date.now()}`,
      layout: '',
      alt: useSample && sample
        ? `Sample photograph standing in for ${values.title.trim()}`
        : '',
      src: useSample && sample ? sample.src : '',
      date: formatMemoryDate(values.date),
      title: values.title.trim(),
      people: taggedPeople,
      place: values.place.trim(),
      story: values.story.trim(),
      voice: kind === 'Voice'
        ? {
          speaker: addedBy || 'You',
          duration: 'New',
          transcript: values.story.trim(),
        }
        : null,
      addedBy: addedBy || 'You',
      kind,
      privacy,
    });
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
                  onChange={() => setKind(item)}
                />
                {item}
              </label>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-[1.5] text-muted">{kindNotes[kind]}</p>
        </fieldset>
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
                <label key={person.id} className={choiceClass(chosenPeople.includes(person.name))}>
                  <input
                    type="checkbox"
                    name="moment-people"
                    value={person.name}
                    checked={chosenPeople.includes(person.name)}
                    onChange={() => togglePerson(person.name)}
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
          <button type="submit" className={primaryButton}>
            Keep this moment
            <ArrowIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
