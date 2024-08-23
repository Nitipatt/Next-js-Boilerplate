import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { Highlight, HighlightState } from './highlight.d';

// Define async thunk for fetching highlights
export const fetchHighlights = createAsyncThunk('highlights/fetchHighlights', async () => {
  const headers = {
    'authority': 'pantip.com',
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9,th;q=0.8',
    'cache-control': 'no-cache',
    'cookie': 'pantip_sessions=n3uFBMnwIeCY3rkD9rucB%2BM6qtGvhXrJ6jxcekQ1lKKiEfhBcnTcfvd4n5wcdCW7KYCEmhl6tSY%2FprJIeysjisl7Wv6xuWOGgfonHYNqDCDaHlaOO5S9YHQZu8ueihLGrXRfP%2BxG9XJ0rBnCPG1B4Rbw%2FlI2VR6JDgakyXWP9tS2YDGXsSbHGHZetDIA%2FTjQOGCjJb%2Bgn2RHqj2eWGzizozs%2BfMw87YJGDIW5dxaS6%2Fs0Zee42cYkAJktRStZATYD4BqZHWQuG0vFu3F0bPeXxRtQ2hJnQp0%2FgFXJOtmIxPxxqMJDoZgU1Vg2ZsI1WxvxMUcunzG2Fq6m%2BKfENw2Ug%3D%3D; PHPSESSID=1v5dl6ue23spjcmtquti0mqlk5; pantip_visitc=sgo5dj1833zExjWaHczth; ka_iid=LL3WvSTvirAxDJtSdf8y2g; iUUID=440b3d8cd5599a9a0d950f7f47825299; _ga=GA1.1.425212452.1721053507; freq.5f73e63e47e7040e00000000=1; innity.dmp.cks.innity=1; ka_sid=MLEZPXWSWx22C3iDywvLZT; innity.dmp.254.sess.id=35980581.254.1724427153989; innity.dmp.254.sess=4.1724427153989.1724427169186.1724427454610; ptpolicy=1; _ga_ZMC2WGXL4Z=GS1.1.1724427153.3.1.1724428466.60.0.0',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'ptauthorize': 'Basic dGVzdGVyOnRlc3Rlcg==',
    'referer': 'https://pantip.com/',
    'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  };

  const response = await fetch('https://pantip.com/api/forum-service/home/get_highlight', {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
});

const initialState: HighlightState = {
  highlights: [],
};

const highlightSlice = createSlice({
  name: 'highlight',
  initialState,
  reducers: {
    addHighlight: (state, action: PayloadAction<Highlight>) => {
      state.highlights.push(action.payload);
    },
    removeHighlight: (state, action: PayloadAction<Highlight>) => {
      state.highlights = state.highlights.filter(highlight => highlight !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchHighlights.fulfilled, (state, action) => {
      state.highlights = action.payload;
    });
  },
});

export const { addHighlight, removeHighlight } = highlightSlice.actions;
export default highlightSlice.reducer;
