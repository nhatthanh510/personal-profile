import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/use-mobile';

const FONT_WEIGHTS: Record<string, { min: number; max: number; default: number }> = {
  subtitle: {
    min: 100,
    max: 400,
    default: 100,
  },
  title: {
    min: 400,
    max: 900,
    default: 400,
  },
}
const setupTextHover = (container: HTMLElement | null, type: keyof typeof FONT_WEIGHTS) => {
  if (!container) return () => {};
  const letters: NodeListOf<HTMLSpanElement> = container.querySelectorAll('span');
  const {min, max, default: base} = FONT_WEIGHTS[type];

  const animateLetters = (letter: HTMLSpanElement, weight: number, duration = 0.25) => {
    gsap.to(letter, {
      fontVariationSettings: `'wght' ${weight}`,
      duration,
      ease: "power2.out",
    });
  }

  const handleMouseMove = (e: MouseEvent) => {
    const {left} = container.getBoundingClientRect();
    const mouseX = e.clientX - left;

    letters.forEach(letter => {
      const {left: l, width: w} = letter.getBoundingClientRect();
      const distance = Math.abs(mouseX - (l - left + w/2))
      const intensity = Math.exp(-(distance ** 2) / 2000)

      animateLetters(letter, min + (max - min) * intensity);
    });
  }

  const handleMouseLeave = () => {
    letters.forEach(letter => {
      animateLetters(letter, base, 0.3);
    });
  }
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    container.removeEventListener('mousemove', handleMouseMove);
    container.removeEventListener('mouseleave', handleMouseLeave);
  }
}
const renderText = (text: string, className: string, baseWeight = 400) => {
  return [...text].map((char, index) => {
    return (
      <span key={index} className={className} style={{
        fontVariationSettings: `'wght' ${baseWeight}`,
       }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    )
  })
}

export const Welcome = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const isMobile = useIsMobile();
  const [time, setTime] = useState(() => dayjs().format('HH:mm'));

  useEffect(() => {
    if (!isMobile) return;
    const id = setInterval(() => setTime(dayjs().format('HH:mm')), 1000);
    return () => clearInterval(id);
  }, [isMobile]);

  useGSAP(() => {
    const subtitleCleanup = setupTextHover(subtitleRef.current, 'subtitle');
    const titleCleanup = setupTextHover(titleRef.current, 'title');

    return () => {
      subtitleCleanup();
      titleCleanup();
    }
  }, []);

  return <section id="welcome">
    {isMobile && (
      <time className="block text-white/90 text-5xl sm:text-6xl font-semibold tabular-nums mb-6" dateTime={`${dayjs().format('YYYY-MM-DD')}T${time}:00`}>
        {time}
      </time>
    )}
    <p className="text-white px-4 text-center" ref={subtitleRef}>{renderText("Hey, I'm Nathan! Welcome to my", "text-lg sm:text-2xl lg:text-3xl font-georama", 100)}</p>
    <h1 className="text-white mt-3 sm:mt-7 max-lg:mt-2" ref={titleRef} style={{ textShadow: "0 0 40px rgba(6,182,212,0.3), 0 0 80px rgba(6,182,212,0.15)" }}>{renderText("portfolio", "text-5xl sm:text-7xl lg:text-9xl italic font-georama")}</h1>
  </section>
}
