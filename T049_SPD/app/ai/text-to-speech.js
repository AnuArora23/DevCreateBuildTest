import { ai } from "./genkit.js";
import { googleAI } from "@genkit-ai/googleai";
import { z } from "genkit";
import wav from "wav";

export const TextToSpeechInputSchema = z.string();

export const TextToSpeechOutputSchema = z
  .string()
  .describe(
    "The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'"
  );

export async function textToSpeech(input) {
  return textToSpeechFlow(input);
}

async function toWav(pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [];
    writer.on("error", reject);
    writer.on("data", function (d) {
      bufs.push(d);
    });
    writer.on("end", function () {
      resolve(Buffer.concat(bufs).toString("base64"));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: "textToSpeechFlow",
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: googleAI.model("gemini-2.5-flash-preview-tts"),
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Algenib" },
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error("No media returned from TTS model.");
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(",") + 1),
      "base64"
    );
    const wavBase64 = await toWav(audioBuffer);
    return "data:audio/wav;base64," + wavBase64;
  }
);
