import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import styledComponents from 'vite-plugin-styled-components';

export default defineConfig({
  plugins: [react(), styledComponents()],
});
