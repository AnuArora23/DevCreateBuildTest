import { z } from "genkit";
import { ai } from "./genkit.js";

const CropAdviceChatbotInputSchema = z.object({
  query: z
    .string()
    .describe(
      "The farmer's question about crop selection, planting, or storage."
    ),
  language: z
    .string()
    .optional()
    .describe(
      "The language for the response. Should be a language spoken in India."
    ),
});

const CropAdviceChatbotOutputSchema = z.object({
  answer: z.string().describe("The chatbot's answer to the farmer's question."),
});

async function cropAdviceChatbot(input) {
  return cropAdviceChatbotFlow(input);
}

const GetWeatherConditionsInputSchema = z.object({
  location: z.string().describe("The location to get weather conditions for."),
});

const GetWeatherConditionsOutputSchema = z.object({
  temperature: z.number().describe("The current temperature in Celsius."),
  humidity: z.number().describe("The current humidity percentage."),
  description: z
    .string()
    .describe("A brief description of the weather conditions."),
});

const getWeatherConditions = ai.defineTool(
  {
    name: "getWeatherConditions",
    description: "Returns the current weather conditions for a given location.",
    inputSchema: GetWeatherConditionsInputSchema,
    outputSchema: GetWeatherConditionsOutputSchema,
  },
  async (input) => {
    // TODO: Implement fetching weather data from OpenWeatherMap API or Agro APIs
    // For now, return dummy data
    return {
      temperature: 25,
      humidity: 70,
      description: "Sunny with a gentle breeze.",
    };
  }
);

const prompt = ai.definePrompt({
  name: "cropAdviceChatbotPrompt",
  model: "googleai/gemini-2.5-flash",
  tools: [getWeatherConditions],
  input: { schema: CropAdviceChatbotInputSchema },
  output: { schema: CropAdviceChatbotOutputSchema },
  system: `You are a helpful AI chatbot assisting farmers with their agricultural questions. Answer the user's question to the best of your ability.
  If the user asks about what crops to grow, planting advice, or general farming practices, consider using the getWeatherConditions tool to provide more relevant and helpful information.`,
  prompt: `
  {{#if language}}
  Please provide the answer in the following language: {{{language}}}.
  {{else}}
  Please provide the answer in English.
  {{/if}}

  Question: {{{query}}}
  `,
});

const cropAdviceChatbotFlow = ai.defineFlow(
  {
    name: "cropAdviceChatbotFlow",
    inputSchema: CropAdviceChatbotInputSchema,
    outputSchema: CropAdviceChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);
export {
  cropAdviceChatbot,
  CropAdviceChatbotInputSchema,
  CropAdviceChatbotOutputSchema,
};
