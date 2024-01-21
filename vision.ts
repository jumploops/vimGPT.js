import dotenv from 'dotenv';
import OpenAI from 'openai';
import sharp from 'sharp';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const IMG_RES = 1080;


/**
 * - Fenced code block delimiters (```) will be removed
 * - Anything in a code block is left alone
 * - Anything out of a code block will be made into a comment
 */
export const removeTicks = (
  value: string | undefined | null,
): string => {
  if (!value) {
    return '';
  }
  const lines = value.split('\n');

  let result = '';
  lines.forEach((line, index) => {
    if (line.includes('```')) {
      return;
    }
    result += line;

    if (index < lines.length - 1) {
      result += '\n';
    }
  });

  return result;
};

export interface ActionDetails {
  action: string;
  character_string: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  type_input?: string;
  url?: string;
  done?: null;
}

// Function to encode and resize the image
async function encodeAndResize(imageBuffer: Buffer): Promise<string> {
  const metadata = await sharp(imageBuffer).metadata();
  const resizeHeight = Math.round((IMG_RES * metadata.height!) / metadata.width!);
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize(IMG_RES, resizeHeight)
    .png()
    .toBuffer();
  return resizedImageBuffer.toString('base64');
}

export async function getActions(screenshotBuffer: Buffer, objective: string, previousAction: string): Promise<ActionDetails> {
  const encodedScreenshot = await encodeAndResize(screenshotBuffer);

  console.log('screenshotbuffer');
  console.log(screenshotBuffer.length);

  console.log("\n\nobjective");
  console.log(objective);

  const exampleJson = `
    {
        "action": "character sequence",
        "character_string": string
        "type_input": string
        "url": string # optional
        "done": None #optional
    }
  `

  // Form the payload to match the API call structure in the Python example
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a JSON-speaking web navigator who needs to choose which action to take to achieve objective: {objective}. Your last action was: {previous_action}.
                  Considering your overall objective, the current state of the browser page, select your next step.
                  Your action options are navigate, type, click, and done.
                  If you select navigatge, you must specify a URL.
                  If you select type or string, you must specify the yellow character sequence you want to click on, and to type you must specify the input to type.
                  For clicks, please only specify with the 1-2 letter sequence in the yellow box, and if there are multiple valid options choose the one you think a user would select.
                  For typing, please specify a click to click on the box along with a type with the message to write.
                  When the page seems satisfactory, return done as a key with no value.
                  You must specify a level of confidence that your decision will further the objective. Please think closely about this, as there are alternatives if you are not confident.
                  The value of the confidence key must be one of LOW, MEDIUM, HIGH scoring of your confidence that your action is correct.

                          The outputted JSON MUST look like:
                          ${exampleJson}

Only output JSON. Don't output anything other than valid JSON. No wrapping text, no warnings, just a JSON response.
                  `,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${encodedScreenshot}`,
            }
          }
        ],
      },
      {
        role: "user",
        content: objective,
      },
      {
        role: "system",
        content: previousAction,
      },
    ],
    max_tokens: 200,
    //    response_format: { type: "json_object" } // Not available in gpt-4-vision-preview
  });

  console.log(response);

  if (response.choices && response.choices.length > 0) {
    const choice = response.choices[0];
    if (choice.message?.content) {
      // Assuming the API returns the response in the expected ActionDetails format
      console.log(removeTicks(choice.message?.content));
      return JSON.parse(removeTicks(choice.message?.content)) as ActionDetails;
    }
  }

  throw new Error('No valid response from OpenAI API');
}
