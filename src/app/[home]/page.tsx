'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Highlight from '@/components/Highlight'; // Adjust the import path as necessary
import { fetchHighlights } from '@/redux/slices/highlight';
import type { AppDispatch, RootState } from '@/redux/store';

const Page = () => {
  // Fetch data from Redux store
  const dispatch = useDispatch<AppDispatch>();
  const highlights = useSelector((state: RootState) => state.highlight.highlights);

  useEffect(() => {
    dispatch(fetchHighlights());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-12 py-12 font-sans">
      <main className="px-24">
        {highlights && highlights.length > 0
          ? (
              highlights.map(item => <Highlight key={item.post_url} {...item} />)
            )
          : (
              <div>No highlight available</div>
            )}
      </main>
    </div>
  );
};

export default Page;
