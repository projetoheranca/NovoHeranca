'use server';

/**
 * @fileOverview A flow for double-checking memory delivery details with the user using an LLM.
 *
 * - doubleConfirmationWithLLM - A function that handles the double confirmation process.
 * - DoubleConfirmationWithLLMInput - The input type for the doubleConfirmationWithLLM function.
 * - DoubleConfirmationWithLLMOutput - The return type for the doubleConfirmationWithLLM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DoubleConfirmationWithLLMInputSchema = z.object({
  recipientName: z.string().describe('The name of the recipient.'),
  memoryTitle: z.string().describe('The title of the memory being delivered.'),
  memoryType: z.string().describe('The type of memory being delivered (e.g., video, audio, text, image).'),
  deliveryDate: z.string().describe('The date the memory is scheduled for delivery.'),
});
export type DoubleConfirmationWithLLMInput = z.infer<typeof DoubleConfirmationWithLLMInputSchema>;

const DoubleConfirmationWithLLMOutputSchema = z.object({
  confirmationMessage: z.string().describe('A message confirming the delivery details with the user.'),
});
export type DoubleConfirmationWithLLMOutput = z.infer<typeof DoubleConfirmationWithLLMOutputSchema>;

export async function doubleConfirmationWithLLM(input: DoubleConfirmationWithLLMInput): Promise<DoubleConfirmationWithLLMOutput> {
  return doubleConfirmationWithLLMFlow(input);
}

const prompt = ai.definePrompt({
  name: 'doubleConfirmationPrompt',
  input: {schema: DoubleConfirmationWithLLMInputSchema},
  output: {schema: DoubleConfirmationWithLLMOutputSchema},
  prompt: `You are assisting the user with confirming the delivery of a digital memory.

  Please generate a message that double-checks the following details with the user:

  Recipient Name: {{{recipientName}}}
  Memory Title: {{{memoryTitle}}}
  Memory Type: {{{memoryType}}}
  Delivery Date: {{{deliveryDate}}}

  The message should ask the user to confirm that these details are correct before proceeding with the delivery.
  The message should be friendly, helpful, and concise.
  `,
});

const doubleConfirmationWithLLMFlow = ai.defineFlow(
  {
    name: 'doubleConfirmationWithLLMFlow',
    inputSchema: DoubleConfirmationWithLLMInputSchema,
    outputSchema: DoubleConfirmationWithLLMOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
