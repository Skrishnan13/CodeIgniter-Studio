
'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a CodeIgniter 4 application
 * scaffold centered around a user-described package (module).
 *
 * - createCi4Package - A function that takes a package description and generates a complete
 *   CodeIgniter 4 project, including the package, necessary configurations, and a .env file.
 * - CreateCi4PackageInput - The input type for the createCi4Package function.
 * - CreateCi4PackageOutput - The return type for the createCi4Package function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateCi4PackageInputSchema = z.object({
  packageDescription: z
    .string()
    .describe(
      'A description of the CodeIgniter 4 package (e.g., authentication, user management, API endpoints) to be created. The generated project will be built around this package.'
    ),
  projectName: z.string().describe('The name of the CodeIgniter 4 project.'),
});
export type CreateCi4PackageInput = z.infer<typeof CreateCi4PackageInputSchema>;

const CreateCi4PackageOutputSchema = z.object({
  applicationCode: z
    .string()
    .describe(
      'The complete code for the CodeIgniter 4 application, including folder structure, file contents, and a basic .env file. The application is scaffolded around the described package.'
    ),
});
export type CreateCi4PackageOutput = z.infer<typeof CreateCi4PackageOutputSchema>;

export async function createCi4Package(input: CreateCi4PackageInput): Promise<CreateCi4PackageOutput> {
  return createCi4PackageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createCi4PackagePrompt',
  input: {schema: CreateCi4PackageInputSchema},
  output: {schema: CreateCi4PackageOutputSchema},
  prompt: `You are a CodeIgniter 4 expert. You will generate a complete CodeIgniter 4 application scaffold that includes the requested package and a basic .env file (or .env.example if environment-specific secrets are typically involved).
The application should include all necessary files, folder structure, and basic CI4 configuration to be fully functional, centered around the package described.

Project Name: {{{projectName}}}
Package Description: {{{packageDescription}}}

The output must be a single string under the "applicationCode" key in the JSON response. This string should contain the complete application code.
Each file's content must be preceded by a comment indicating its path, for example:
// File: app/Controllers/MyPackageController.php
or
/* File: app/Config/Routes.php */

Ensure the generated code is well-structured, follows CI4 best practices, includes comments for clarity, and the described package is properly integrated and functional within the generated application.
Include a basic '.env' file. If it's a fresh CI4 app, this usually means copying 'env' to '.env' and setting 'CI_ENVIRONMENT = development', and 'app.baseURL'.
If the package involves database interactions (e.g., models, data storage), include necessary database migration scripts (e.g., in 'app/Database/Migrations/'). Make sure these migrations are functional and follow CodeIgniter conventions.
`,
});

const createCi4PackageFlow = ai.defineFlow(
  {
    name: 'createCi4PackageFlow',
    inputSchema: CreateCi4PackageInputSchema,
    outputSchema: CreateCi4PackageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

