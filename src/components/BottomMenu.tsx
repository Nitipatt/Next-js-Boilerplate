'use client';
import React, { useState } from 'react';
import { RiCompassLine, RiHome5Line, RiRssFill, RiStarLine, RiThumbUpLine } from 'react-icons/ri';

const MenuItem: React.FC<{ icon: React.ElementType; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active }) => (
  <div
    className={`flex cursor-pointer flex-col items-center ${active ? 'text-pantip-indigo' : 'text-pantip-gray-light'}`}
  >
    <Icon className={`mb-1 size-24 ${active ? 'text-pantip-indigo' : 'text-pantip-gray-light'}`} />
    <span className="text-base leading-12">{label}</span>
  </div>
);

const BottomMenu: React.FC = () => {
  const [activeItem, setActiveItem] = useState('หน้าแรก');

  const menuItems = [
    { icon: RiHome5Line, label: 'หน้าแรก' },
    { icon: RiRssFill, label: 'My Feed' },
    { icon: RiThumbUpLine, label: 'Pantip Pick' },
    { icon: RiStarLine, label: 'Pantip Hitz' },
    { icon: RiCompassLine, label: 'Explore' },
  ];

  return (
    <div className="fixed bottom-0 left-0 flex h-50 w-full justify-center bg-pantip-purple-dark align-middle">
      <nav className="w-full self-center">
        <ul className="flex justify-around">
          {menuItems.map(item => (
            <li key={item.label}>
              <MenuItem
                icon={item.icon}
                label={item.label}
                active={activeItem === item.label}
                onClick={() => setActiveItem(item.label)}
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default BottomMenu;
