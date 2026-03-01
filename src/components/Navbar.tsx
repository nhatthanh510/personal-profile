import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { navLinks, navIcons } from '@/constants';
import { useIsMobile, useIsCompact } from '@/hooks/use-mobile';
import useWindowStore from '@/store/window';

export const Navbar = () => {
  const isMobile = useIsMobile();
  const isCompact = useIsCompact();
  const openWindow = useWindowStore((s) => s.openWindow);
  const openNewFinder = useWindowStore((s) => s.openNewFinder);

  const handleNavClick = useCallback(
    (action: (typeof navLinks)[number]['action']) => {
      if (action === 'finder') openNewFinder();
      else if (action === 'contact') openWindow('contact');
      else if (action === 'resume') openWindow('pdfFile', { title: 'Resume.pdf', src: '/resume.pdf' });
    },
    [openWindow, openNewFinder]
  );

  const [date, setDate] = useState(() => dayjs().format('ddd D MMM'));
  const [dateIso, setDateIso] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [time, setTime] = useState(() =>
    dayjs().format(isMobile || isCompact ? 'HH:mm' : 'ddd D MMM h:mm A')
  );

  useEffect(() => {
    if (isMobile || isCompact) {
      setDate(dayjs().format('ddd D MMM'));
      setDateIso(dayjs().format('YYYY-MM-DD'));
    }
  }, [isMobile, isCompact]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isMobile || isCompact) {
        setDate(dayjs().format('ddd D MMM'));
        setDateIso(dayjs().format('YYYY-MM-DD'));
        setTime(dayjs().format('HH:mm'));
      } else {
        setTime(dayjs().format('ddd D MMM h:mm A'));
      }
    }, isMobile || isCompact ? 60_000 : 60_000);
    return () => clearInterval(id);
  }, [isMobile, isCompact]);

  return (
    <nav
      className={
        isCompact
          ? 'relative flex justify-between items-center min-h-[56px] py-2 px-4 pt-[max(8px,env(safe-area-inset-top))] [&>div:last-child]:flex!'
          : ''
      }
    >
      {isCompact ? (
        <>
          <div className="flex items-center justify-start">
            <time className="text-[15px] font-semibold text-white/90" dateTime={dateIso}>{date}</time>
          </div>
          <div className="flex items-center gap-3">
            <img src="/icons/wifi.svg" alt="" className="invert size-4 opacity-85" />
            <img src="/icons/mode.svg" alt="" className="invert size-4 opacity-85" />
          </div>
        </>
      ) : (
        <>
          {isMobile ? (
            <>
              <div>
                <time className="text-xs font-semibold text-white/90">{time}</time>
              </div>
              <div className="flex items-center gap-3">
                <img src="/icons/wifi.svg" alt="wifi" className="invert size-3.5 opacity-80" />
                <img src="/icons/mode.svg" alt="battery" className="invert size-3.5 opacity-80" />
              </div>
            </>
          ) : (
            <>
              <div>
                <img src="/images/logo.svg" alt="logo" className="invert" />
                <p className="font-bold text-white">Nathan</p>

                <ul>
                  {navLinks.map(({ id, name, action }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNavClick(action);
                        }}
                        className="text-sm text-white/80 cursor-pointer hover:underline transition-all bg-transparent border-none p-0 font-inherit"
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <ul>
                  {navIcons.map(({ id, image }) => (
                    <li key={id} className="icon-hover">
                      <img src={image} alt={image} className="invert" />
                    </li>
                  ))}
                </ul>
                <time className="text-sm font-medium text-white/80">{time}</time>
              </div>
            </>
          )}
        </>
      )}
    </nav>
  );
};
