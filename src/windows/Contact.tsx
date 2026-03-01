import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail } from "lucide-react";

// ── Social links ──────────────────────────────────────────────────
const socials = [
  { name: "GitHub", icon: "/icons/github.svg", url: "https://github.com/nhatthanh510" },
  { name: "LinkedIn", icon: "/icons/linkedin.svg", url: "https://www.linkedin.com/in/thanh-nguyen-14162911a/" },
  { name: "Discord", icon: "/icons/discord.svg", url: "https://discord.com/users/560680367896526848" },
];

// ── Contact Component ─────────────────────────────────────────────
const intro = `I'm a Full-Stack Developer with over 8 years of experience building modern web applications. I focus on React, TypeScript, Node.js, and cloud infrastructure, and care deeply about intuitive UX and maintainable code.

I'm always open to discussing how my skills and experience could support your team's goals. Reach out via email or connect on the platforms below—I'd love to hear from you.`;

const Contact = ({ titleBarRef }: WindowWrapperProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <WindowShell className="bg-[rgba(22,24,35,0.65)] backdrop-blur-[20px]">
        <WindowTitleBar target="contact" titleBarRef={titleBarRef}>
          <span className="text-[13px] font-semibold text-white/90">Contacts</span>
        </WindowTitleBar>

        <ScrollArea className="flex-1">
          <div className="flex flex-col md:flex-row gap-4 p-4 mt-5">
            {/* ── Profile Card ──────────────────────────────── */}
            <div className="flex flex-col items-center w-full md:w-[180px] shrink-0">
              <img
                src="/images/nathan.png"
                alt="Profile"
                className="size-24 rounded-full object-cover border-2 border-white/20 shadow-md"
              />
              <h3 className="mt-2 text-[15px] font-semibold text-white/90">
                Nathan
              </h3>
              <p className="text-[12px] text-white/50 text-center mt-0.5">
                Full-Stack Developer
              </p>

              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="size-3 text-white/40" />
                <span className="text-[11px] text-white/50">nhatthanh510@gmail.com</span>
              </div>

              <div className="flex gap-3 mt-3">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.15] transition-colors"
                    aria-label={s.name}
                  >
                    <img src={s.icon} alt={s.name} className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Introduction ──────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-semibold text-white/90 mb-1.5">About me</h4>
              <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-line">
                {intro}
              </p>
            </div>
          </div>
        </ScrollArea>
      </WindowShell>
    </TooltipProvider>
  );
};

const ContactWindow = WindowWrapper(Contact, "contact");
export { ContactWindow };
