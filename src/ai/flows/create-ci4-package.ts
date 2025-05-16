
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
      'A detailed description of the CodeIgniter 4 package or entire application to be created (e.g., authentication, user management, API endpoints, calendar system with specific tables and libraries). The generated project will be built around this specification.'
    ),
  projectName: z.string().describe('The name of the CodeIgniter 4 project.'),
});
export type CreateCi4PackageInput = z.infer<typeof CreateCi4PackageInputSchema>;

const CreateCi4PackageOutputSchema = z.object({
  applicationCode: z
    .string()
    .describe(
      'The complete code for the CodeIgniter 4 application, including folder structure, file contents, and a basic .env file. The application is scaffolded around the described package/application specification.'
    ),
});
export type CreateCi4PackageOutput = z.infer<typeof CreateCi4PackageOutputSchema>;

export async function createCi4Package(input: CreateCi4PackageInput): Promise<CreateCi4PackageOutput> {
  return createCi4PackageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createCi4PackagePrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: CreateCi4PackageInputSchema},
  output: {schema: CreateCi4PackageOutputSchema},
  prompt: `You are an expert CodeIgniter 4 developer. Your task is to generate a complete CodeIgniter 4 application scaffold.
The 'packageDescription' will contain a detailed specification for an entire application, potentially including multiple modules, database tables, UI components, and specific technology requirements.
Your goal is to generate a *complete and functional CodeIgniter 4 project scaffold* based on this entire specification.

Project Name: {{{projectName}}}
Package Description: {{{packageDescription}}}

The application should include all necessary files, folder structure, and basic CI4 configuration to be fully functional.
The output must be a single string under the "applicationCode" key in the JSON response. This string should contain the complete application code.
Each file's content must be preceded by a comment indicating its path, for example:
// File: app/Controllers/MyPackageController.php
or
/* File: app/Config/Routes.php */

Key requirements for the generated application:
1.  **Structure and Best Practices**: Ensure the generated code is well-structured, follows CodeIgniter 4 best practices, and includes comments for clarity.
2.  **Completeness**: The described package/application should be properly integrated and functional within the generated application. Address all major aspects of the 'packageDescription'.
3.  **.env File**: Include a basic '.env' file. For a fresh CI4 app, this usually means copying 'env' to '.env' and setting 'CI_ENVIRONMENT = development', and 'app.baseURL = http://localhost:8080' (or a relevant placeholder).
4.  **Database Migrations**: If the 'packageDescription' involves database interactions (e.g., models, data storage, specific table structures), you MUST include necessary CodeIgniter 4 database migration scripts (e.g., in 'app/Database/Migrations/'). These migrations must be functional, follow CodeIgniter conventions, and accurately reflect all specified tables, columns, types, and relationships.
5.  **Controllers, Models, Views**: Create basic controllers, models, and views for the core modules and functionalities described in the 'packageDescription'.
6.  **Third-Party Libraries**: If specific third-party libraries (PHP like Myth\Auth, DomPDF, PhpSpreadsheet; or JS like FullCalendar.js, Chart.js, jQuery UI, SweetAlert2) are mentioned in the 'packageDescription', attempt to include their basic setup or configuration. This might involve:
    *   For PHP libraries: Suggest 'composer require' commands in a README.md file or in comments within relevant PHP files (e.g., BaseController or specific controllers).
    *   For JS libraries: Suggest CDN links in views, or placeholder comments for asset pipeline integration.
    *   Include basic usage examples or integration points in controllers or views if feasible.
7.  **README.md**: Include a basic README.md file with the project name, a brief description based on the input, and setup instructions (e.g., composer install, running migrations, setting up .env).

Focus on generating a robust and comprehensive starting point that accurately reflects the user's detailed request.
If the 'packageDescription' outlines a feature like "Download Package" that should be part of the *generated CodeIgniter application itself* (e.g., using PHP's ZipArchive), then implement that feature within the CI4 code.
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
