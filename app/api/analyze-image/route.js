import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-1.5-flash';
const API_KEY = process.env.GEMINI_API_KEY;

async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg'; // Default to jpeg if not specified
    const base64Data = Buffer.from(buffer).toString('base64');
    return { base64Data, contentType };
  } catch (error) {
    console.error('Error fetching image as base64:', error);
    throw error;
  }
}

export async function POST(request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const { base64Data, contentType } = await fetchImageAsBase64(imageUrl);

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.4, // Adjust for creativity vs. factuality
      topK: 32,
      topP: 1,
      maxOutputTokens: 100, // Increased slightly, assuming a sentence might be longer
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const parts = [
      {
        inlineData: {
          mimeType: contentType,
          data: base64Data,
        },
      },
      { text: "Analyze this image, which is a user\'s social media explore page. Based on its content (e.g., themes, aesthetics, types of posts), provide a one-sentence analysis of their potential digital pheromone. The sentence should be written like esoteric internet art and science. Only output the sentence, no other text." },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    console.log("Full Gemini API Result:", JSON.stringify(result, null, 2));

    const analysis = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (analysis) {
      return NextResponse.json({ analysis: analysis });
    } else {
      // Log the full response if no candidates or parts are found as expected
      console.error("Gemini API did not return the expected response structure:", JSON.stringify(result, null, 2));
      let errorMessage = "Failed to get analysis from Gemini API.";
      if (result.response && result.response.promptFeedback) {
        errorMessage += ` Prompt feedback: ${JSON.stringify(result.response.promptFeedback)}`;
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in analyze-image route:', error);
    // Check if the error is from Gemini API directly (e.g., due to safety settings)
    if (error.response && error.response.promptFeedback) {
        return NextResponse.json({ error: `Gemini API Error: ${JSON.stringify(error.response.promptFeedback)}` }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 