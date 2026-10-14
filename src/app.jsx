import './styles.css';
import {
  bar,
  editorial,
  eyebrow,
  fieldClass,
  kicker,
  primaryButton,
  strokeIcon,
} from './constants/class-names.js';
import { filters, memories, roles, steps } from './constants/data.js';
import { SkipLink } from './components/skip-link.jsx';
import { Header } from './components/header.jsx';
import { BrandIcon } from './components/brand-icon.jsx';



function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={strokeIcon}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={strokeIcon}>
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

const App = () => {
  return (
    <>
      <SkipLink />
      <Header />

      <main id="main-content">
        <section
          className="grid min-h-[820px] grid-cols-1 items-center gap-10 px-[clamp(24px,7vw,108px)] pt-10 pb-[90px] desk:grid-cols-[0.88fr_1.12fr] desk:gap-[6vw]"
          aria-labelledby="hero-title"
        >
          <div className="flex max-w-[700px] flex-col items-center gap-6 desk:max-w-[600px] desk:items-stretch">
            <span className={eyebrow}>For all the days worth remembering</span>
            <h1
              id="hero-title"
              className="max-w-[560px] font-serif text-[clamp(52px,6vw,88px)] leading-[0.95] font-normal tracking-[-0.04em]"
            >
              Hold on to<br /><em className="font-normal text-peach">the little things.</em>
            </h1>
            <p className="max-w-[490px] text-[15px] leading-[1.75] text-muted">
              A beautiful, living archive for the stories your family is still writing. Turn everyday photos into memories that grow more meaningful with time.
            </p>
            <div className="flex flex-col items-center gap-3 desk:flex-row desk:gap-6">
              <button type="button" className={primaryButton} aria-label="Add your first memory">
                <PlusIcon />
                Add your first memory
              </button>
              <a className="inline-flex items-center gap-3.5 border-b border-line py-2 text-[12px]">
                Explore the archive
                <ArrowIcon />
              </a>
            </div>
          </div>

          <div
            className="relative mx-auto h-[590px] w-[min(100%,700px)] min-w-0 desk:mx-0 desk:w-auto"
            aria-label="A collection of family memories"
          >
            <figure className="absolute top-5 left-[8%] z-[2] h-[500px] w-[65%] rotate-[2.5deg] bg-paper p-[11px] shadow-[0_24px_60px_#1e2e2826]">
              <img
                src="/images/collage-big-photo.avif"
                alt="Family spending time together outdoors"
                className="h-[calc(100%-40px)] object-cover saturate-[0.8]"
              />
              <figcaption className="flex h-10 items-center justify-between font-serif text-[12px] leading-[normal] text-muted italic">
                <span>Lake District</span><span>Summer ’24</span>
              </figcaption>
            </figure>

            <figure className="absolute -right-[4%] bottom-[25px] z-[3] h-[265px] w-[36%] -rotate-[5deg] bg-paper p-2.5 shadow-[0_20px_40px_rgb(0_0_0/12%)]">
              <img
                src="/images/collage-small-photo.avif"
                alt="Child smiling during a family moment"
                className="h-full object-cover saturate-[0.8]"
              />
            </figure>

            <div className="absolute bottom-5 -left-[5%] z-[4] w-[180px] -rotate-[7deg] bg-beige p-5">
              <small className="text-[8px] tracking-[0.1em]">JUNE 18, 2024</small>
              <strong className="mt-3 mb-[5px] block font-serif text-[23px] leading-[normal] font-normal">
                A very good day
              </strong>
              <p className="text-[12px] leading-[1.5]">
                We forgot the picnic blanket. Nobody minded.
              </p>
            </div>

            <div className="absolute top-[55px] right-0 z-[5] flex items-center gap-2 rounded-[5px] bg-paper py-2.5 pr-3.5 pl-2.5 font-serif text-[12px] leading-[normal] italic shadow-[0_10px_30px_#1e2e2829]">
              <b className="grid size-[30px] place-items-center rounded-full bg-pale not-italic">M</b>
              <span>
                <small className="block font-sans text-[7px] leading-[normal] font-normal tracking-[0.1em] text-muted uppercase not-italic">
                  Added by Mara
                </small>
                “The one with the strawberries.”
              </span>
            </div>
          </div>
        </section>

        <section
          className="bg-paper px-5 py-20 desk:px-[clamp(24px,7vw,108px)] desk:py-[110px]"
          id="gallery"
        >
          <div className="flex flex-col items-start gap-5 desk:flex-row desk:items-end desk:justify-between desk:gap-[50px]">
            <div>
              <span className={kicker}>THE FAMILY ARCHIVE</span>
              <h2 className={`${editorial} mt-[13px] text-[54px]`}>
                A life, gathered together.
              </h2>
            </div>
            <p className="max-w-[390px] text-[13px] leading-[1.65] text-muted">
              Not a camera roll. A considered collection of the people, places,
              and tiny details that make a family yours.
            </p>
          </div>
          <div className="mt-[45px] mb-6 flex gap-2.5 border-b border-line pb-3.5">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`shrink-0 rounded-[30px] px-[13px] py-2 text-[10px] ${
                  filter === "All memories" ? "bg-forest text-white" : "text-muted"
                }`}
              >
                {filter}
              </button>
            ))}
            <span className="ml-auto hidden font-serif text-[11px] leading-[normal] text-muted italic desk:block">
              128 memories
            </span>
          </div>
          <div className="grid auto-rows-[200px] grid-flow-dense grid-cols-2 gap-3 desk:auto-rows-[245px] desk:grid-cols-4">
            {memories.map((memory) => (
              <article
                key={memory.title}
                className={`group relative overflow-hidden bg-pale ${memory.layout}`}
              >
                <img
                  alt={memory.alt}
                  src={memory.src}
                  className="h-full object-cover saturate-[0.78] transition-transform duration-500 ease-[ease] group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(#0000,#091913c7)] px-[17px] pt-[45px] pb-4 text-white">
                  <small className="text-[8px] tracking-[0.1em]">{memory.date}</small>
                  <h3 className="mt-1 mr-10 font-serif text-[21px] leading-[normal] font-normal">
                    {memory.title}
                  </h3>
                  <button
                    type="button"
                    aria-label={`Open ${memory.title}`}
                    className="absolute right-[15px] bottom-[15px] grid size-8 place-items-center rounded-full border border-white/50 text-white"
                  >
                    <ArrowIcon />
                  </button>
                </div>
              </article>
            ))}
            <button
              type="button"
              className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-sage bg-cream"
            >
              <b className="mb-3 grid size-[42px] place-items-center rounded-full bg-pale">
                <PlusIcon />
              </b>
              <strong className="font-serif text-[19px] leading-[normal] font-normal">
                Add a moment
              </strong>
              <small className="mt-1 text-[8px] text-muted">
                Photo, story, voice, or video
              </small>
            </button>
          </div>
        </section>

        <section
          id="how-it-works"
          className="grid grid-cols-1 items-center gap-[60px] px-5 py-20 desk:grid-cols-[0.85fr_1.15fr] desk:gap-[9vw] desk:px-[clamp(24px,9vw,140px)] desk:py-[120px]"
          aria-labelledby="story-title"
        >
          <div>
            <span className={kicker}>MORE THAN A PHOTO</span>
            <h2 id="story-title" className={`${editorial} mt-[17px] mb-6 text-[54px]`}>
              Every picture has a story. <em className="font-normal text-peach">Help it remember.</em>
            </h2>
            <p className="text-[13px] leading-[1.75] text-muted">
              Add the things a photograph can’t hold: the way she laughed, what he
              always said, the song playing in the kitchen.
            </p>
            <ol className="mt-[35px]">
              {steps.map(([number, title, detail]) => (
                <li key={number} className="flex gap-[18px] border-t border-line py-[17px]">
                  <b className="font-serif text-[14px] leading-[normal] font-normal text-peach italic">
                    {number}
                  </b>
                  <span>
                    <strong className="block font-serif text-[20px] leading-[normal] font-normal">
                      {title}
                    </strong>
                    <small className="block text-[10px] text-muted">{detail}</small>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative pr-[45px] pb-[45px] before:absolute before:inset-[45px_0_0_45px] before:bg-pale before:content-['']">
            <article className="relative bg-paper shadow-[0_25px_70px_#1e2e2829]">
              <img
                alt="Grandmother sharing a moment with her granddaughter"
                src="https://images.unsplash.com/photo-1505075288090-14733a88df88?auto=format&fit=crop&w=1200&q=90"
                className="h-[325px] object-cover saturate-75"
              />
              <div className="px-[30px] py-[25px]">
                <small className="text-[8px] tracking-[0.1em] text-peach">
                  OCTOBER 12, 2021 · AT NANA’S HOUSE
                </small>
                <h3 className="my-2 font-serif text-[28px] leading-[normal] font-normal">
                  The stories she told us
                </h3>
                <p className="font-serif text-[14px] leading-[1.55] text-muted italic">
                  “Every Sunday, she’d pull the blue chair closer to the window.
                  This was the afternoon she told Mara about the dance hall...”
                </p>
                <span className="flex items-center">
                  <b className="mr-[-5px] grid size-[27px] place-items-center rounded-full border-2 border-paper bg-pale text-[8px]">N</b>
                  <b className="mr-[-5px] grid size-[27px] place-items-center rounded-full border-2 border-paper bg-pale text-[8px]">M</b>
                  <small className="ml-[13px] text-[8px] tracking-[0.1em] text-muted">
                    Remembered by Nana &amp; Mara
                  </small>
                </span>
              </div>
            </article>
            <div className="absolute top-[40%] -right-2 flex w-[235px] items-center gap-[9px] bg-forest p-3 text-white shadow-[0_15px_30px_#14302838]">
              <button
                type="button"
                aria-label="Play voice memory"
                className="size-[27px] shrink-0 rounded-full text-[8px]"
              >
                ▶
              </button>
              <span className="text-[8px] opacity-60">||||||||||||||||</span>
              <small className="text-[7px] text-white opacity-65">0:42 · Nana’s voice</small>
            </div>
          </div>
        </section>

        <section
          className="grid min-h-[670px] grid-cols-1 bg-deep text-white desk:grid-cols-[1.05fr_0.95fr]"
          aria-labelledby="future-title"
        >
          <div className="relative overflow-hidden after:absolute after:inset-0 after:bg-[linear-gradient(90deg,transparent_60%,var(--color-deep))] after:content-['']">
            <img
              alt="A father holding his young daughter"
              src="https://images.unsplash.com/photo-1717883300138-f1fadd7d04cc?auto=format&fit=crop&w=1200&q=90"
              className="h-full object-cover saturate-[0.55]"
            />
            <span className="absolute bottom-[25px] left-[25px] z-[2] bg-paper px-2.5 py-2 text-[8px] tracking-[0.1em] text-forest">
              FOR HER · 2040
            </span>
          </div>
          <div className="max-w-[540px] pt-[95px] pr-[clamp(30px,7vw,100px)] pb-20 pl-[5vw]">
            <span className={kicker}>A GIFT FOR LATER</span>
            <h2 id="future-title" className={`${editorial} mt-[17px] mb-6 text-[54px]`}>
              Keep memories for who they’re becoming.
            </h2>
            <p className="text-[13px] leading-[1.75] text-white/63">
              Create a private collection for someone too young to remember today.
              On the date you choose, they’ll receive a world of stories made just
              for them.
            </p>
            <blockquote className="mt-[38px] mb-7 border-l border-peach pl-[23px] font-serif text-[22px] leading-[1.4] italic">
              “For when you wonder how deeply you were loved from the very
              beginning.”
              <small className="mt-3 block font-sans text-[8px] leading-[normal] font-normal tracking-[0.08em] text-white/50 uppercase not-italic">
                — Dad, on your fourth birthday
              </small>
            </blockquote>
            <button
              type="button"
              className="inline-flex items-center gap-3.5 border-b border-white/30 py-2 text-[12px] text-white"
            >
              Create a time capsule
              <ArrowIcon />
            </button>
          </div>
        </section>

        <section
          className="bg-paper px-5 py-20 desk:px-[clamp(24px,7vw,108px)] desk:py-[110px]"
          id="family"
          aria-labelledby="roles-title"
        >
          <div className="mx-auto mb-[55px] max-w-[680px] text-center">
            <span className={kicker}>YOUR PEOPLE, YOUR WAY</span>
            <h2 id="roles-title" className={`${editorial} mt-[13px] text-[54px]`}>
              It takes a family to tell a life.
            </h2>
            <p className="mx-auto mt-[18px] max-w-[480px] text-[13px] leading-[1.75] text-muted">
              Invite the people who hold a piece of the story. Everyone has a
              place, and you’re always in control.
            </p>
          </div>
          <div className="grid grid-cols-1 border border-b-0 border-line desk:grid-cols-4 desk:border-b">
            {roles.map(([initial, number, title, detail, badge]) => (
              <article
                key={title}
                className="relative min-h-[250px] border-b border-line p-[27px] desk:border-r desk:border-b-0"
              >
                <b className={`grid size-[50px] place-items-center rounded-full font-serif text-[21px] leading-[normal] font-normal ${badge}`}>
                  {initial}
                </b>
                <small className="absolute top-7 right-[27px] font-serif text-[12px] leading-[normal] text-sage italic">
                  {number}
                </small>
                <h3 className="mt-[45px] mb-2 font-serif text-[22px] leading-[normal] font-normal">
                  {title}
                </h3>
                <p className="text-[10px] leading-[1.65] text-muted">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="grid grid-cols-1 items-center gap-[9vw] px-5 py-20 desk:grid-cols-[0.82fr_1.18fr] desk:px-[clamp(24px,8vw,125px)] desk:py-[120px]"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div>
            <span className={kicker}>WE’RE HERE TO HELP</span>
            <h2 id="contact-title" className={`${editorial} mt-[17px] mb-6 text-[54px]`}>
              Have a question?<br /><em className="font-normal text-peach">Let’s talk.</em>
            </h2>
            <p className="max-w-[480px] text-[13px] leading-[1.75] text-muted">
              Whether you’re thinking about starting an archive, bringing your
              family in, or preserving something especially meaningful, we’d love
              to hear from you.
            </p>
            <div className="my-[35px] grid grid-cols-2 gap-5 border-y border-line py-[22px]">
              <span>
                <small className="mb-1.5 block text-[7px] tracking-[0.12em] text-peach">EMAIL US</small>
                <strong className="block font-serif text-[15px] leading-[normal] font-normal">
                  hello@stillarchive.com
                </strong>
              </span>
              <span>
                <small className="mb-1.5 block text-[7px] tracking-[0.12em] text-peach">RESPONSE TIME</small>
                <strong className="block font-serif text-[15px] leading-[normal] font-normal">
                  Usually within two working days
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-[13px] text-muted">
              <BrandIcon />
              <p className="max-w-[330px] text-[9px] leading-[1.5]">
                Your stories stay yours. We’ll only use your details to reply to
                this message.
              </p>
            </div>
          </div>
          <div className="flex min-h-[525px] bg-paper p-[clamp(25px,4vw,50px)] shadow-[0_20px_60px_#1e2e2817]">
            <form className="flex w-full flex-col gap-6">
              <div className="grid grid-cols-2 gap-5">
                <label>
                  <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">Your name</span>
                  <input
                    className={fieldClass}
                    placeholder="Anna Miller"
                    required
                    type="text"
                    name="name"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">Email address</span>
                  <input
                    className={fieldClass}
                    placeholder="anna@example.com"
                    required
                    type="email"
                    name="email"
                  />
                </label>
              </div>
              <label>
                <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
                  What can we help with?
                </span>
                <select className={fieldClass} name="topic" required defaultValue="">
                  <option value="" disabled>Choose a topic</option>
                  <option>Starting an archive</option>
                  <option>Inviting my family</option>
                  <option>Privacy and preservation</option>
                  <option>Something else</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">Your message</span>
                <textarea
                  className={fieldClass}
                  name="message"
                  rows="6"
                  placeholder="Tell us what’s on your mind..."
                  required
                />
              </label>
              <div className="mt-auto flex flex-col items-start gap-5 desk:flex-row desk:items-center desk:justify-between">
                <small className="max-w-[220px] text-[8px] leading-[1.5] text-muted">
                  By sending this form, you agree to our privacy policy.
                </small>
                <button type="submit" className={primaryButton}>
                  Send message
                  <ArrowIcon />
                </button>
              </div>
            </form>
          </div>
        </section>

        <section
          className="flex min-h-[510px] flex-col items-center justify-center bg-forest px-6 py-20 text-center text-white"
          aria-labelledby="closing-title"
        >
          <BrandIcon className="mb-[22px]" />
          <span className={kicker}>YOUR STORY STARTS HERE</span>
          <h2 id="closing-title" className={`${editorial} my-[18px] text-[45px] desk:text-[59px]`}>
            Some day, these will be<br /><em className="font-normal text-peach">the good old days.</em>
          </h2>
          <p className="text-[12px] text-white/65">
            Start with one photo. Add the story only you can tell.
          </p>
          <button
            type="button"
            className="mt-4 mb-3 inline-flex items-center gap-2 rounded-[40px] bg-cream px-[21px] py-3.5 text-[11px] text-forest"
          >
            <PlusIcon />
            Add your first memory
          </button>
          <small className="text-[8px] text-white/45">
            Private by default · Invite family when you’re ready
          </small>
        </section>
      </main>

      <footer
        className="grid grid-cols-1 items-center justify-items-center gap-[35px] bg-deep px-[clamp(24px,7vw,108px)] py-7 text-center text-white/55 desk:grid-cols-[1fr_1fr_auto_auto] desk:justify-items-stretch desk:text-left"
        aria-labelledby="footer-title"
      >
        <div className="inline-flex items-center gap-2.5 text-white">
          <BrandIcon />
        </div>
        <p className="text-[8px]">For the stories that make us who we are.</p>
        <nav className="flex gap-[18px]">
          <button type="button" className="text-[12px]">Privacy</button>
          <button type="button" className="text-[12px]">Terms</button>
          <button type="button" className="text-[12px]">Contact</button>
        </nav>
        <span className="text-[8px]">© 2026 Still Archive</span>
      </footer>
    </>
  );
};

export default App;
