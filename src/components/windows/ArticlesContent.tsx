export const ArticlesContent = () => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5">
      <div className="flex-1 rounded-md bg-white/10 px-3 py-1 text-xs text-white/50">
        articles.dev
      </div>
    </div>
    <div className="p-6 text-white/80 flex-1">
      <h2 className="text-lg font-semibold text-white mb-4">Articles</h2>
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <p className="text-sm font-medium">Article Title {i}</p>
          <p className="text-xs text-white/50 mt-1">Content coming soon...</p>
        </div>
      ))}
    </div>
  </div>
);
