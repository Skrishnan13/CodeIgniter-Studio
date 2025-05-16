'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a CodeIgniter 4 module from a description.
 *
 * - createCi4Module - A function that takes a module description and generates the necessary files, code, and configurations for that module.
 * - CreateCi4ModuleInput - The input type for the createCi4Module function.
 * - CreateCi4ModuleOutput - The return type for the createCi4Module function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateCi4ModuleInputSchema = z.object({
  moduleDescription: z
    .string()
    .describe(
      'A description of the CodeIgniter 4 module to be created (e.g., authentication, user management, API endpoints).'
    ),
  projectName: z.string().describe('The name of the CodeIgniter 4 project.'),
});
export type CreateCi4ModuleInput = z.infer<typeof CreateCi4ModuleInputSchema>;

const CreateCi4ModuleOutputSchema = z.object({
  moduleFiles: z
    .array(z.object({
      path: z.string().describe('The path to the file within the CodeIgniter 4 project.'),
      content: z.string().describe('The content of the file.'),
    }))
    .describe('An array of files representing the generated CodeIgniter 4 module.'),
});
export type CreateCi4ModuleOutput = z.infer<typeof CreateCi4ModuleOutputSchema>;

export async function createCi4Module(input: CreateCi4ModuleInput): Promise<CreateCi4ModuleOutput> {
  return createCi4ModuleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createCi4ModulePrompt',
  input: {schema: CreateCi4ModuleInputSchema},
  output: {schema: CreateCi4ModuleOutputSchema},
  prompt: `You are a CodeIgniter 4 expert. You will generate the files and code for a CodeIgniter 4 module based on the provided description.

  Project Name: {{{projectName}}}
  Module Description: {{{moduleDescription}}}

  The response should be a JSON object with a "moduleFiles" property. This property should be an array of objects, where each object represents a file in the module.
  Each file object should have a "path" property representing the file path relative to the CodeIgniter 4 project root, and a "content" property representing the file content.
  Example of moduleFiles structure:
  [
    {
      "path": "app/Controllers/AuthController.php",
      "content": "<?php\n...contents of the auth controller..."
    },
    {
      "path": "app/Models/UserModel.php",
      "content": "<?php\n...contents of the user model..."
    }
  ]
  Ensure that the generated code is complete, well-formatted, and follows CodeIgniter 4 best practices.
`,
});

const createCi4ModuleFlow = ai.defineFlow(
  {
    name: 'createCi4ModuleFlow',
    inputSchema: CreateCi4ModuleInputSchema,
    outputSchema: CreateCi4ModuleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
