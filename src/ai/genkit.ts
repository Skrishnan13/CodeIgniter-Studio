import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      defaultModel: 'gemini-2.0-flash', // Correctly set default model for the plugin
    }),
  ],
  // The top-level 'model' property is not standard for Genkit v1.x core configuration.
  // Models are typically configured per-plugin or specified in generate/prompt calls.
});
