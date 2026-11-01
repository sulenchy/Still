export function SingleMedia({ item, className, controls = false }) {
  if (item.role === 'video') {
    return (
      <video
        className={className}
        src={item.url}
        controls={controls}
        playsInline
        preload="metadata"
        aria-label={item.alt || 'Video'}
      />
    );
  }

  return (
    <img
      alt={item.alt || ''}
      src={item.url}
      className={className}
    />
  );
}

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
