'use client';
import React, { useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import Room from '@/components/Room';
import { fetchRooms } from '@/redux/slices/roomSlice';
import type { AppDispatch, RootState } from '@/redux/store';

const SearchBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rooms = useSelector((state: RootState) => state.room);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);
  return (
    <section className="flex flex-col gap-12">
      <div className="px-24">

        <div className="flex items-center rounded-full bg-white p-12 shadow-md">
          <FaSearch className="mr-12 size-24 text-pantip-dark" />
          <input type="text" placeholder="ค้นหาบน Pantip" className="grow border-none font-bold text-pantip-dark outline-none placeholder:text-pantip-dark" />

        </div>
      </div>
      <div className="flex gap-12 overflow-x-auto border-b border-pantip-gray-light px-24">
        {rooms && rooms.length > 0
          ? (
              rooms.map(room => <Room key={room.id} {...room} />)
            )
          : (
              <div>No rooms available</div>
            )}
      </div>
    </section>

  );
};

export default SearchBar;
