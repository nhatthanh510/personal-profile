export const TerminalContent = () => (
  <div className="p-4 font-roboto text-sm text-green-400 h-full bg-black/80">
    <p className="text-white/50 mb-2">Last login: Mon Feb 27 09:00:00 on ttys001</p>
    <p><span className="text-blue-400">~</span> $ cat skills.txt</p>
    <div className="mt-2 ml-2 space-y-1 text-white/80">
      <p>Frontend: React, TypeScript, Tailwind CSS</p>
      <p>Backend: Node.js, Python, Go</p>
      <p>Tools: Docker, Git, CI/CD</p>
      <p>Cloud: AWS, Vercel, Supabase</p>
    </div>
    <p className="mt-3"><span className="text-blue-400">~</span> $ <span className="animate-pulse">_</span></p>
  </div>
);
