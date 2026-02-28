import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { navLinks, navIcons } from '@/constants';
export const Navbar = () => {
  const [time, setTime] = useState(() => dayjs().format('ddd D MMM h:mm A'));

  useEffect(() => {
    const id = setInterval(() => setTime(dayjs().format('ddd D MMM h:mm A')), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav>
      <div>
        <img src={"/images/logo.svg"} alt="logo" className="invert" />
        <p className="font-bold text-white">Nathan's Portfolio</p>
       
       <ul>
        {navLinks.map(({id, name}) => (
          <li key={id}>
            <p>{name}</p>
          </li>
        ))}
        </ul>
      </div>
     
     <div>
      <ul>
        {navIcons.map(({id, image}) => (
          <li key={id} className="icon-hover">
            <img src={image} alt={image} className="invert" />
          </li>
        ))}
      </ul>
      <time className="text-sm font-medium text-white/80">
        {time}
      </time>

     </div>

    </nav>
  );
};
