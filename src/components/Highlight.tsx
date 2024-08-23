import Link from 'next/link';
import React from 'react';
import { useSelector } from 'react-redux';

import type { Highlight as HighlightType } from '@/redux/slices/highlight.d';
import type { RootState } from '@/redux/store';

const Highlight: React.FC = () => {
  const highlights: HighlightType[] = useSelector((state: RootState) => state.highlight.highlights);

  return (
    <section className="px-24">
      <h2 className="mb-16 text-24 leading-32 text-white">Highlight</h2>
      <div className="flex w-full flex-col gap-12">
        {highlights.map((highlight, index) => (
          <Link href={highlight.post_url} key={index} className="shrink-0">
            <div className="w-full overflow-hidden rounded-lg bg-pantip-purple-dark">
              <img
                src={highlight.image_url[0] || ''}
                alt={highlight.name}
                width={312}
                height={176}
                className="h-176 w-full object-cover"
              />
              <div className="p-12">
                <h3 className="mb-4 text-16 leading-24 text-white">{highlight.name}</h3>
                <p className="text-12 leading-16 text-pantip-gray-light">{highlight.message}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Highlight;
