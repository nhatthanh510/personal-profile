export const GalleryContent = () => (
  <div className="p-4">
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg overflow-hidden aspect-square">
          <img
            src={`/images/gal${i}.png`}
            alt={`Gallery ${i}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  </div>
);
