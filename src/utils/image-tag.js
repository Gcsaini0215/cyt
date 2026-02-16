export default function ImageTag({ src, alt, style, class: className, ...rest }) {
  const imageSrc = src && typeof src === 'object' ? src.src : src;
  
  return (
    <img
      alt={alt}
      fetchpriority="high"
      loading="lazy"
      decoding="async"
      data-nimg="1"
      style={style}
      src={imageSrc}
      className={className ? className : ""}
      {...rest}
    />
  );
}
