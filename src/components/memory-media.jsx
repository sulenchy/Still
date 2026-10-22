export function MemoryMedia({ memory, className, controls = false }) {
  if (memory.mediaType === 'video' && memory.src) {
    return (
      <video
        className={className}
        src={memory.src}
        controls={controls}
        playsInline
        preload="metadata"
        aria-label={memory.title}
      />
    );
  }

  return (
    <img
      alt={memory.alt}
      src={memory.src}
      className={className}
    />
  );
}
