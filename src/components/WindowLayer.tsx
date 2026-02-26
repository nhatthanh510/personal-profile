import type { WindowId } from '@/types/window';
import type { FC } from 'react';
import { AppWindow } from './AppWindow';
import { PortfolioContent } from './windows/PortfolioContent';
import { ArticlesContent } from './windows/ArticlesContent';
import { GalleryContent } from './windows/GalleryContent';
import { ContactContent } from './windows/ContactContent';
import { TerminalContent } from './windows/TerminalContent';

const WINDOW_CONTENT: Record<WindowId, { component: FC; title: string }> = {
  finder:   { component: PortfolioContent, title: 'Portfolio' },
  safari:   { component: ArticlesContent,  title: 'Articles' },
  photos:   { component: GalleryContent,   title: 'Gallery' },
  contact:  { component: ContactContent,   title: 'Contact' },
  terminal: { component: TerminalContent,  title: 'Skills' },
};

const WINDOW_IDS = Object.keys(WINDOW_CONTENT) as WindowId[];

export const WindowLayer = () => (
  <div className="window-layer">
    {WINDOW_IDS.map((id) => {
      const { component: Content, title } = WINDOW_CONTENT[id];
      return (
        <AppWindow key={id} id={id} title={title}>
          <Content />
        </AppWindow>
      );
    })}
  </div>
);
