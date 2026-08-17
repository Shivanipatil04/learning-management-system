import { createSlice } from '@reduxjs/toolkit';

const courseSlice = createSlice({
  name: 'courses',
  initialState: { items: [], selected: null, loading: false, error: null },
  reducers: {
    coursesRequested: (state) => { state.loading = true; state.error = null; },
    coursesLoaded: (state, action) => { state.loading = false; state.items = action.payload; },
    courseSelected: (state, action) => { state.selected = action.payload; },
    coursesFailed: (state, action) => { state.loading = false; state.error = action.payload; },
  },
});

export const { coursesRequested, coursesLoaded, courseSelected, coursesFailed } = courseSlice.actions;
export default courseSlice.reducer;
