import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
export const Welcome = () => {
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
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    const subtitleCleanup = setupTextHover(subtitleRef.current, 'subtitle');
    const titleCleanup = setupTextHover(titleRef.current, 'title');

    return () => {
      subtitleCleanup();
      titleCleanup();
    }
  }, []);

  return <section id="welcome">
    <p className="text-white" ref={subtitleRef}>{renderText("Hey, I'm Nathan! Welcome to my", "text-3xl font-georama", 100)}</p>
    <h1 className="text-white mt-7" ref={titleRef}>{renderText("portfolio", "text-9xl italic font-georama")}</h1>
 
    <div className="small-screen">
      <p>this porfolio is designed for desktop/tablet only</p>
    </div>

  </section>
}
