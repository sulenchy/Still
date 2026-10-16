import { eyebrow, primaryButton } from "../constants/class-names";
import { PlusIcon } from "./plus-icon";
import { ArrowIcon } from "./arrow-icon";

export const Hero = () => {

  const handleExploreArchiveClick = () => {
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="grid min-h-[820px] grid-cols-1 items-center gap-10 px-[clamp(24px,7vw,108px)] pt-10 pb-[90px] desk:grid-cols-[0.88fr_1.12fr] desk:gap-[6vw]"
      aria-controls="hero-title"
    >
      <div className="flex max-w-[700px] flex-col items-center gap-6 desk:max-w-[600px] desk:items-stretch">
        <span className={eyebrow}>For all the days worth remembering</span>
        <h1
          id="hero-title"
          className="max-w-[560px] font-serif text-[clamp(52px,6vw,88px)] leading-[0.95] font-normal tracking-[-0.04em]"
        >
          Hold on to
          <br />
          <em className="font-normal text-peach">the little things.</em>
        </h1>
        <p className="max-w-[490px] text-[15px] leading-[1.75] text-muted">
          A beautiful, living archive for the stories your family is still
          writing. Turn everyday photos into memories that grow more meaningful
          with time.
        </p>
        <div className="flex flex-col items-center gap-3 desk:flex-row desk:gap-6">
          <button
            type="button"
            className={primaryButton}
            aria-label="Add your first memory"
          >
            <PlusIcon />
            Add your first memory
          </button>
          <button
            className="inline-flex items-center gap-3.5 border-b border-line py-2 text-[12px]"
            onClick={handleExploreArchiveClick}
          >
            Explore the archive
            <ArrowIcon />
          </button>
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
            <span>Lake District</span>
            <span>Summer ’24</span>
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
          <b className="grid size-[30px] place-items-center rounded-full bg-pale not-italic">
            M
          </b>
          <span>
            <small className="block font-sans text-[7px] leading-[normal] font-normal tracking-[0.1em] text-muted uppercase not-italic">
              Added by Mara
            </small>
            “The one with the strawberries.”
          </span>
        </div>
      </div>
    </section>
  );
};
