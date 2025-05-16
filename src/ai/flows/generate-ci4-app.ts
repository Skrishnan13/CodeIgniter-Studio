'use server';
/**
 * @fileOverview A CodeIgniter 4 application generator from a prompt.
 *
 * - generateCi4App - A function that handles the CI4 app generation process.
 * - GenerateCi4AppInput - The input type for the generateCi4App function.
 * - GenerateCi4AppOutput - The return type for the generateCi4App function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCi4AppInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the CodeIgniter 4 application to generate.')
});
export type GenerateCi4AppInput = z.infer<typeof GenerateCi4AppInputSchema>;

const GenerateCi4AppOutputSchema = z.object({
  applicationCode: z.string().describe('The complete code for the CodeIgniter 4 application, including folder structure and file contents.')
});
export type GenerateCi4AppOutput = z.infer<typeof GenerateCi4AppOutputSchema>;

export async function generateCi4App(input: GenerateCi4AppInput): Promise<GenerateCi4AppOutput> {
  return generateCi4AppFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCi4AppPrompt',
  input: {schema: GenerateCi4AppInputSchema},
  output: {schema: GenerateCi4AppOutputSchema},
  prompt: `You are an expert CodeIgniter 4 developer.

You will generate a complete CodeIgniter 4 application based on the user's description.
The application should include all necessary files and folder structure to be fully functional.

Description: {{{prompt}}}

Ensure the generated code is well-structured, follows CI4 best practices, and includes comments for clarity.
`
});

const generateCi4AppFlow = ai.defineFlow(
  {
    name: 'generateCi4AppFlow',
    inputSchema: GenerateCi4AppInputSchema,
    outputSchema: GenerateCi4AppOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
