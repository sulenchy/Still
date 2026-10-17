import { useEffect, useState } from "react";

import { filters, memories } from "../constants/data";
import { kicker, editorial } from "../constants/class-names";
import { ArrowIcon } from "./arrow-icon";
import { PlusIcon } from "./plus-icon";

export const Gallery = () => {

  const [selectedFilter, setSelectedFilter] = useState("All memories");
  const [filteredMemories, setFilteredMemories] = useState(memories);

  useEffect(() => {
    if (selectedFilter === "All memories") {
      setFilteredMemories(memories);
    } else {
      const filtered = memories.filter((memory) =>
        memory.people.includes(selectedFilter)
      );
      setFilteredMemories(filtered);
    }
  }, [selectedFilter]);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
  };

  return (
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
            className={`shrink-0 rounded-[30px] px-[13px] py-2 text-[10px] ${filter === selectedFilter ? "bg-forest text-white" : "text-muted"
              }`}
            onClick={() => handleFilterClick(filter)}
          >
            {filter}
          </button>
        ))}
        <span className="ml-auto hidden font-serif text-[11px] leading-[normal] text-muted italic desk:block">
          128 memories
        </span>
      </div>
      <div className="grid auto-rows-[200px] grid-flow-dense grid-cols-2 gap-3 desk:auto-rows-[245px] desk:grid-cols-4">
        {filteredMemories.map((memory) => (
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

  )
}