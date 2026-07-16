import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.yaml',
  output: {
    clean: true,
    path: './src/generated',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    {
      auth: true,
      name: '@hey-api/sdk',
      operations: {
        strategy: 'flat',
      },
      paramsStructure: 'flat',
    },
  ],
});
