import { useState, useCallback, useRef, useEffect } from "react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Send } from "lucide-react";

// ── Social links ──────────────────────────────────────────────────
const socials = [
  { name: "GitHub", icon: "/icons/github.svg", url: "https://github.com/nhatthanh510" },
  { name: "LinkedIn", icon: "/icons/linkedin.svg", url: "https://linkedin.com/in/nhatthanh" },
  { name: "Twitter", icon: "/icons/twitter.svg", url: "https://twitter.com/nhatthanh510" },
];

// ── Contact Component ─────────────────────────────────────────────
const Contact = ({ titleBarRef }: WindowWrapperProps) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSent(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSent(false), 3000);
      setForm({ name: "", email: "", message: "" });
    },
    []
  );

  return (
    <TooltipProvider delayDuration={300}>
      <WindowShell className="bg-[rgba(22,24,35,0.65)] backdrop-blur-[20px]">
        <WindowTitleBar target="contact" titleBarRef={titleBarRef}>
          <span className="text-[13px] font-semibold text-white/90">Contacts</span>
        </WindowTitleBar>

        <ScrollArea className="flex-1">
          <div className="flex flex-col md:flex-row gap-6 p-6">
            {/* ── Profile Card ──────────────────────────────── */}
            <div className="flex flex-col items-center w-full md:w-[200px] shrink-0">
              <img
                src="/images/adrian.jpg"
                alt="Profile"
                className="size-28 rounded-full object-cover border-2 border-white/20 shadow-md"
              />
              <h3 className="mt-3 text-[15px] font-semibold text-white/90">
                Nhat Thanh
              </h3>
              <p className="text-[12px] text-white/50 text-center mt-0.5">
                Full-Stack Developer
              </p>

              <div className="flex items-center gap-1.5 mt-1.5">
                <Mail className="size-3 text-white/40" />
                <span className="text-[11px] text-white/50">hello@example.com</span>
              </div>

              <div className="flex gap-3 mt-4">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.15] transition-colors"
                    aria-label={s.name}
                  >
                    <img src={s.icon} alt={s.name} className="size-4 invert" />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Contact Form ──────────────────────────────── */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3 min-w-0">
              <div className="flex flex-col gap-1">
                <label htmlFor="contact-name" className="text-[12px] font-medium text-white/60">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="h-9 px-3 rounded-lg border border-white/[0.1] bg-white/[0.06] text-[13px] text-white/90 placeholder:text-white/30 outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="contact-email" className="text-[12px] font-medium text-white/60">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="h-9 px-3 rounded-lg border border-white/[0.1] bg-white/[0.06] text-[13px] text-white/90 placeholder:text-white/30 outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="contact-message" className="text-[12px] font-medium text-white/60">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  required
                  rows={4}
                  className="flex-1 min-h-[100px] px-3 py-2 rounded-lg border border-white/[0.1] bg-white/[0.06] text-[13px] text-white/90 placeholder:text-white/30 outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-[#06b6d4] text-white text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-[#22d3ee] active:bg-[#0891b2] transition-colors self-end"
              >
                {sent ? (
                  "Sent!"
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </ScrollArea>
      </WindowShell>
    </TooltipProvider>
  );
};

const ContactWindow = WindowWrapper(Contact, "contact");
export { ContactWindow };
