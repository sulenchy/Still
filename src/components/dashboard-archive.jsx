import { ArrowIcon } from './arrow-icon.jsx';
import { MemoryMedia } from './memory-media.jsx';
import { PlusIcon } from './plus-icon.jsx';
import { DashboardIntro } from './dashboard-shell.jsx';
import { editorial, kicker, primaryButton } from '../constants/class-names.js';
import { formatLongDate, initialFromName, privacyLabel } from '../constants/dashboard.js';
import { roles } from '../constants/data.js';

function roleBadge(roleName) {
  return roles.find((role) => role[2] === roleName)?.[4] || 'bg-pale';
}

function FeaturedMemory({ memory, onOpen }) {
  return (
    <article className="bg-paper p-3 shadow-[0_24px_60px_#1e2e2826]" aria-labelledby="featured-title">
      {memory.src ? (
        <MemoryMedia
          memory={memory}
          controls
          className="h-[300px] w-full object-cover saturate-[0.8] desk:h-[440px]"
        />
      ) : (
        <div className="flex h-[300px] items-end bg-beige p-6 desk:h-[440px]">
          <p className="max-w-[16ch] font-serif text-[36px] leading-[1.05] italic">{memory.story}</p>
        </div>
      )}
      <div className="grid gap-6 px-3 pt-5 pb-4 desk:grid-cols-[1.1fr_0.9fr] desk:px-5 desk:pt-6">
        <div>
          <span className={kicker}>CONTINUE</span>
          <h2 id="featured-title" className={`${editorial} mt-3 text-[clamp(32px,4vw,48px)]`}>
            {memory.title}
          </h2>
          <p className="mt-4 font-serif text-[14px] text-muted italic">
            {memory.place ? `${memory.place} · ` : ''}{memory.date}
          </p>
        </div>
        <div className="flex flex-col">
          <p className="text-[14px] leading-[1.7] text-muted">{memory.story}</p>
          <p className="mt-4 text-[12px] tracking-[0.08em] text-peach uppercase">
            {memory.kind} · {privacyLabel(memory.privacy)}
            {memory.voice ? ` · ${memory.voice.speaker}’s voice` : ''}
          </p>
          <button
            type="button"
            className={`${primaryButton} mt-5 self-start`}
            onClick={() => onOpen(memory.id)}
          >
            Open this memory
            <ArrowIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export function DashboardArchive({
  name,
  memories,
  people,
  capsules,
  onOpenMemory,
  onView,
  canWrite = true,
}) {
  const voices = memories.filter((memory) => memory.voice).length;
  const featured = memories[0];
  const collection = memories.slice(0, 3);
  const nextCapsule = capsules[0];
  const faces = [
    { id: 'you', name: name || 'You', role: 'Owner' },
    ...people,
  ];

  return (
    <div className="flex flex-col gap-14">
      <DashboardIntro
        kickerText="YOUR ARCHIVE"
        title={(
          <>
            {name ? `Good to see you, ${name}.` : 'Good to see you.'}
            <br />
            <em className="font-normal text-peach">The little things are still here.</em>
          </>
        )}
        lede="A quiet place for the photos, voices, and notes your family is still gathering."
      >
        <dl className="mt-8 grid grid-cols-2 gap-5 border-y border-line py-6 desk:grid-cols-4">
          {[
            ['Memories', memories.length],
            ['Voices', voices],
            ['People', faces.length],
            ['Capsules', capsules.length],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[9px] tracking-[0.12em] text-peach uppercase">{label}</dt>
              <dd className="mt-1 font-serif text-[32px] leading-none font-normal">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col gap-3 desk:flex-row desk:items-center">
          <button type="button" className={primaryButton} onClick={() => onView(canWrite === false ? 'account' : 'add')}>
            {canWrite === false ? 'Start a subscription' : (
              <>
                <PlusIcon />
                Add a moment
              </>
            )}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-3 border-b border-line px-1 text-[13px]"
            onClick={() => onView('memories')}
          >
            Browse the archive
            <ArrowIcon />
          </button>
        </div>
      </DashboardIntro>

      {featured ? (
        <FeaturedMemory memory={featured} onOpen={onOpenMemory} />
      ) : (
        <div className="border border-dashed border-sage bg-cream px-6 py-16 text-center">
          <h2 className={`${editorial} text-[40px]`}>Nothing here yet.</h2>
          <p className="mx-auto mt-4 max-w-[360px] text-[13px] leading-[1.7] text-muted">
            Start with one photo, a few words, or a voice you don’t want to lose.
          </p>
          <button type="button" className={`${primaryButton} mt-6`} onClick={() => onView(canWrite === false ? 'account' : 'add')}>
            {canWrite === false ? 'Start a subscription' : (
              <>
                <PlusIcon />
                Add your first memory
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid items-start gap-6 desk:grid-cols-[1.15fr_0.85fr]">
        {collection.length === 0 ? null : (
        <section aria-labelledby="collection-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="collection-title" className={`${editorial} text-[clamp(32px,4vw,44px)]`}>
              From the collection
            </h2>
            <button
              type="button"
              className="inline-flex min-h-11 items-center text-sm hover:underline"
              onClick={() => onView('memories')}
            >
              See all
            </button>
          </div>
          <ul className="grid gap-4">
            {collection.map((memory) => (
              <li key={memory.id}>
                <article className="grid grid-cols-[112px_1fr] gap-4 border border-line bg-paper p-3">
                  {memory.src ? (
                    <MemoryMedia
                      memory={memory}
                      className="h-[112px] w-[112px] object-cover saturate-[0.8]"
                    />
                  ) : (
                    <div className="h-[112px] bg-beige" />
                  )}
                  <div className="flex min-w-0 flex-col">
                    <p className="text-[10px] tracking-[0.1em] text-peach uppercase">{memory.date}</p>
                    <h3 className="mt-1 font-serif text-[24px] leading-[1.1] font-normal">{memory.title}</h3>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-muted">{memory.story}</p>
                    <button
                      type="button"
                      className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm"
                      aria-label={`Open ${memory.title}`}
                      onClick={() => onOpenMemory(memory.id)}
                    >
                      Open
                      <ArrowIcon />
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
        )}

        <div className="flex flex-col gap-4">
          {nextCapsule ? (
            <section className="bg-beige p-6" aria-labelledby="next-capsule-title">
              <span className={kicker}>TIME CAPSULE</span>
              <h2 id="next-capsule-title" className={`${editorial} mt-3 text-[36px]`}>
                {nextCapsule.title}
              </h2>
              <p className="mt-3 text-[12px] tracking-[0.08em] text-ink/70 uppercase">
                {nextCapsule.status} · For {nextCapsule.recipient} · {formatLongDate(nextCapsule.opens)}
              </p>
              <blockquote className="mt-5 border-l border-peach pl-4 font-serif text-[20px] leading-[1.4] italic">
                {nextCapsule.message}
              </blockquote>
              <button
                type="button"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm"
                onClick={() => onView('capsules')}
              >
                Open capsules
                <ArrowIcon />
              </button>
            </section>
          ) : null}

          <section className="border border-line bg-paper p-6" aria-labelledby="people-title">
            <span className={kicker}>YOUR PEOPLE</span>
            <h2 id="people-title" className={`${editorial} mt-3 text-[36px]`}>
              It takes a family.
            </h2>
            <ul className="mt-5 flex flex-wrap items-center" aria-label="People in this archive">
              {faces.map((person) => (
                <li key={person.id}>
                  <span
                    className={`-mr-2 grid size-11 place-items-center rounded-full border-2 border-paper font-serif text-[16px] ${roleBadge(person.role)}`}
                    title={person.name}
                  >
                    <span className="sr-only">{person.name}</span>
                    <span aria-hidden="true">{initialFromName(person.name)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] leading-[1.65] text-muted">
              You keep the archive. Invite the people who hold a piece of the story when you want them beside you.
            </p>
            <button
              type="button"
              className={`${primaryButton} mt-5`}
              onClick={() => onView('family')}
            >
              Invite family
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
