export default function Carousel({ items, onOpen }) {
  return (
    <div className="carousel" role="listbox" aria-label="Video list">
      {items.map((item) => (
        <button
          key={item.id}
          className="thumb"
          onClick={() => onOpen(item)}
          aria-label={`Open ${item.title}`}
        >
          {item.poster ? (
            <img src={item.poster} alt="" loading="lazy" />
          ) : (
            <span>{item.title}</span>
          )}
        </button>
      ))}
    </div>
  )
}


