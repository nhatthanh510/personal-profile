export const PortfolioContent = () => (
  <div className="p-6 text-white/80">
    <h2 className="text-lg font-semibold text-white mb-4">Projects</h2>
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg bg-white/5 p-4 hover:bg-white/10 transition-colors">
          <img src={`/images/project-${i}.png`} alt={`Project ${i}`} className="rounded-md mb-3 w-full object-cover h-32" />
          <p className="text-sm font-medium">Project {i}</p>
          <p className="text-xs text-white/50 mt-1">Description coming soon</p>
        </div>
      ))}
    </div>
  </div>
);
