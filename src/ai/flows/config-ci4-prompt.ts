'use server';

/**
 * @fileOverview Guides the user in configuring a CodeIgniter 4 application through prompts.
 *
 * - configCi4ThroughPrompts - A function that initiates the configuration process.
 * - ConfigCi4ThroughPromptsInput - The input type for the configCi4ThroughPrompts function.
 * - ConfigCi4ThroughPromptsOutput - The return type for the configCi4ThroughPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfigCi4ThroughPromptsInputSchema = z.object({
  prompt: z.string().describe('The prompt to configure the CodeIgniter 4 application.'),
  currentCode: z.string().optional().describe('The current code to be modified.'),
});
export type ConfigCi4ThroughPromptsInput = z.infer<typeof ConfigCi4ThroughPromptsInputSchema>;

const ConfigCi4ThroughPromptsOutputSchema = z.object({
  updatedCode: z.string().describe('The updated code based on the prompt.'),
  nextPrompt: z.string().optional().describe('The next prompt to continue the configuration, if any.'),
});
export type ConfigCi4ThroughPromptsOutput = z.infer<typeof ConfigCi4ThroughPromptsOutputSchema>;

export async function configCi4ThroughPrompts(input: ConfigCi4ThroughPromptsInput): Promise<ConfigCi4ThroughPromptsOutput> {
  return configCi4ThroughPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configCi4ThroughPromptsPrompt',
  input: {schema: ConfigCi4ThroughPromptsInputSchema},
  output: {schema: ConfigCi4ThroughPromptsOutputSchema},
  prompt: `You are an expert CodeIgniter 4 developer. I will provide a prompt to configure or modify the CodeIgniter 4 application. 

Given the following prompt: {{{prompt}}}
and the current code (if any): {{{currentCode}}}

Generate the updated code and the next prompt (if any) to continue the configuration. If the configuration is complete, the nextPrompt should be empty. 

Ensure that the updatedCode is complete, correct and follows the best practices of CodeIgniter 4.
`,
});

const configCi4ThroughPromptsFlow = ai.defineFlow(
  {
    name: 'configCi4ThroughPromptsFlow',
    inputSchema: ConfigCi4ThroughPromptsInputSchema,
    outputSchema: ConfigCi4ThroughPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
