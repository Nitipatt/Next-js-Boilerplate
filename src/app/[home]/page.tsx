'use client';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Highlight from '@/components/Highlight'; // Adjust the import path as necessary
import { fetchHighlights } from '@/redux/slices/highlight';
import type { AppDispatch } from '@/redux/store';

const Page = () => {
  // Fetch data from Redux store
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchHighlights());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-12 py-12 font-sans">
      <main className="px-24">
        <Highlight />
      </main>
    </div>
  );
};

export default Page;
export const dynamic = 'force-dynamic';
