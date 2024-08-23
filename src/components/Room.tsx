import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import type { Room as RoomType } from '@/redux/slices/roomSlice.d';

const Room: React.FC<RoomType> = (props) => {
  return (
    <Link href={props.link_url} className="flex w-64 flex-col items-center text-center">
      <div className="relative mb-8 size-40">
        <Image
          src={props.room_icon_url}
          alt={props.name}
          layout="fill"
          objectFit="contain"
          className="text-pantip-gray-light"
        />
      </div>
      <h2 className="mb-2 text-12 leading-16 text-white">{props.name}</h2>
    </Link>
  );
};

export default Room;
