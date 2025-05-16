
'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a CodeIgniter 4 application
 * scaffold centered around a user-described module.
 *
 * - createCi4Module - A function that takes a module description and generates a complete
 *   CodeIgniter 4 project, including the module, necessary configurations, and a .env file.
 * - CreateCi4ModuleInput - The input type for the createCi4Module function.
 * - CreateCi4ModuleOutput - The return type for the createCi4Module function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateCi4ModuleInputSchema = z.object({
  moduleDescription: z
    .string()
    .describe(
      'A description of the CodeIgniter 4 module to be created (e.g., authentication, user management, API endpoints). The generated project will be built around this module.'
    ),
  projectName: z.string().describe('The name of the CodeIgniter 4 project.'),
});
export type CreateCi4ModuleInput = z.infer<typeof CreateCi4ModuleInputSchema>;

const CreateCi4ModuleOutputSchema = z.object({
  applicationCode: z
    .string()
    .describe(
      'The complete code for the CodeIgniter 4 application, including folder structure, file contents, and a basic .env file. The application is scaffolded around the described module.'
    ),
});
export type CreateCi4ModuleOutput = z.infer<typeof CreateCi4ModuleOutputSchema>;

export async function createCi4Module(input: CreateCi4ModuleInput): Promise<CreateCi4ModuleOutput> {
  return createCi4ModuleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createCi4ModulePrompt',
  input: {schema: CreateCi4ModuleInputSchema},
  output: {schema: CreateCi4ModuleOutputSchema},
  prompt: `You are a CodeIgniter 4 expert. You will generate a complete CodeIgniter 4 application scaffold that includes the requested module and a basic .env file (or .env.example if environment-specific secrets are typically involved).
The application should include all necessary files, folder structure, and basic CI4 configuration to be fully functional, centered around the module described.

Project Name: {{{projectName}}}
Module Description: {{{moduleDescription}}}

The output must be a single string under the "applicationCode" key in the JSON response. This string should contain the complete application code.
Each file's content must be preceded by a comment indicating its path, for example:
// File: app/Controllers/MyModuleController.php
or
/* File: app/Config/Routes.php */

Ensure the generated code is well-structured, follows CI4 best practices, includes comments for clarity, and the described module is properly integrated and functional within the generated application.
Include a basic '.env' file. If it's a fresh CI4 app, this usually means copying 'env' to '.env' and setting 'CI_ENVIRONMENT = development', and 'app.baseURL'.
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
