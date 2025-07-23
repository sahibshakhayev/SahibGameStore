// orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
  gameStoreApi: {
    input: './api-def.json', // Path to your OpenAPI JSON file
    output: {
      mode: 'split',
      target: './src/lib/api/endpoints.ts', // Generated API services
      schemas: './src/types/api.ts', // Generated TypeScript types
      client: 'react-query', // Generate React Query hooks
      prettier: true, // Keep this, we'll fix the warning separately
      override: {
        mutator: {
          path: './src/lib/axiosInstance.ts', // Path to your custom Axios instance
          name: 'axiosInstance', // Name of the exported Axios instance
        },
      },
    },
    hooks: {
      // Wrap the command in double quotes for cross-platform compatibility
      afterAllFilesWrite: ' "eslint --fix ./src/lib/api && eslint --fix ./src/types" ',
    },
  },
});