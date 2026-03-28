import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

test('renders home without crashing', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => {
    root.render(<App />);
  });
  expect(container.textContent).toMatch(/Shree Maheshwari Yuva Mandal, Chennai/i);
  act(() => {
    root.unmount();
  });
});
