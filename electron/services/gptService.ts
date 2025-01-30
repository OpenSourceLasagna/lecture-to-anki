  import { GeneratedCardContent } from "models/generatedCardContent";
  import OpenAI from "openai";

  require('dotenv').config();

  const openai = new OpenAI({
    apiKey: process.env['OPENAI_LECTURE_TO_ANKI_API_KEY'] ?? process.env['OPENAI_API_KEY']
  });

  const systemPrompts = [
    `Evaluate the provided raw text from PowerPoint slides to create high-quality, test-ready index cards in the specified format. Focus on extracting, summarizing relevant content, and optionally include an image reference for enhanced context.

  Ensure each index card represents important concepts, definitions, or details from the text while avoiding redundancy or unnecessary card creation. Exclude non-essential information such as copyright notices or author names.

  # Steps

  1. **Content Evaluation**: Analyze the parsed raw text to identify key concepts, definitions, and important information pertinent to understanding the main subjects covered.

  2. **Relevance Filtering**: Exclude irrelevant information such as copyright details, author names, or other non-content elements that do not contribute to the understanding or testing of the material.

  3. **Card Creation**: Convert the relevant information into a concise question-answer format suitable for an index card. Ensure clarity and precision.

  4. **Card Enhancement**: Optionally include the associated image reference if it directly supports the understanding of the card's content.

  5. **Formatting**: Structure each card's content clearly with "front" for questions, "back" for answers, "tags" for categorization, and "imageReference" for optional image inclusion.

  # Output Format

  The output should be a JSON-like array of objects, where each object represents an index card with the following structure:

  [
    {
      "front": "[Question related to key concept]",
      "back": "[Answer explaining the key concept]",
      "tags": ["[Relevant tag1]", "[Relevant tag2]"],
      "imageReference": "givenRef" // Optional field
    }
    // Add additional card objects as needed
  ]

  # Notes

  - Focus on creating cards that are useful for learning the material efficiently, rather than simply maximizing the number of cards.
  - Ensure the output remains strictly within the JSON-like format without additional commentary or styling adjustments.`
  ]


  async function generateAnkiWithAI(userContent: string): Promise<GeneratedCardContent[]> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      // model: "gpt-4o",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": systemPrompts[0]
              //"text": 'Generate ANKI cards for the given content. do not add content. the content is custom parsed power point to text, and image-references and their text extracted with ocr (might be falsy). the cards should be perfect to study for an exam. please do not add anything else but the cards in exactly that format: [ { "front": "Write a short question or heading here", "back": "Provide the concise answer or definition here" }, { "front": "Another relevant question", "back": "Answer or explanation", "imageRef": "/image/filename.png" } // ...additional cards as needed...]',
              // "text": 'Your goal is to create high-quality Anki cards for exam preparation based on the content provided. This content may cover any topic (e.g., biology, computer networking, or otherwise) and is typically presented as stringified JSON objects representing slides with text and/or images. Examine the content thoroughly to determine the essential points for exam success. Ignore irrelevant or nonsensical parts if they do not contribute to the material. Do not hallucinate or invent additional details beyond what is present in the slides. For each important piece of information, create a concise Anki card, capturing the key facts or concepts as a question-answer pair. If an image reference is truly relevant to understanding the material, include "imageRef": "/path/to/image.png" in the card. Otherwise, omit it. When you output the final set of Anki cards, present them exclusively in a JSON-like array format. Each card must be an object with the properties "front" and "back", and optionally "imageRef". No additional commentary, code fences, or formatting should appear outside the array. Here is an example: [ { "front": "Write a short question or heading here", "back": "Provide the concise answer or definition here" }, { "front": "Another relevant question", "back": "Answer or explanation", "imageRef": "/image/filename.png" } // ...additional cards as needed...]'
              //"text": 'Your goal is to create high-quality anki cards for exam preparation. Every human student given those cards should be abled to pass any test about the content provided to you. The content that is provided to you consists of stringified JSON objects which represent powerpoint slides, with a text property and data about tesseract extracted text from the images inside the slides. So you must evaluate the given content and create high quality (NOT QUANTITY) index cards in the needed format. Assure that everything that you use could be import for an exam about the provided content, but do not hallucinate further content. based on the provided information about an image you can use the provided image reference as an answer as well, but only if really usefull. Please provide the cards in the following JSON-like format, without adding ANYTHING ELSE! here is the format with a few placeholders for question types (front and back can of course vary depending on needs): [{ "front": "question to answer", "back": "answer to this question or definition or ..." }, { "front": "heading of the model", "back": "some describing text or empty string", "imageRef": "/image/image10.png"}, //other exam relevant anki cards ]'
              //"text": "Evaluate the provided raw text from PowerPoint slides to create high-quality, test-ready index cards in the specified format. Focus on extracting and summarizing relevant content that aids in understanding and preparing for tests on the given material. Exclude non-essential information such as copyright notices or author names.\n\nEnsure each index card represents important concepts, definitions, or details from the text while avoiding redundancy or unnecessary card creation.\n\n# Steps\n\n1. **Content Evaluation**: Analyze the parsed raw text to identify key concepts, definitions, and important information pertinent to understanding the main subjects covered.\n   \n2. **Relevance Filtering**: Exclude irrelevant information such as copyright details, author names, or other non-content elements that do not contribute to the understanding or testing of the material.\n\n3. **Card Creation**: Convert the relevant information into a concise question-answer format suitable for an index card. Ensure clarity and precision.\n\n4. **Formatting**: Structure each card's content clearly into a \"front\" for questions, a \"back\" for answers, and \"tags\" for categorization.\n\n# Output Format\n\nThe output should be a JSON-like array of objects where each object represents an index card with the following structure:\n\n\n[\n  {\n    \"front\": \"[Question related to key concept]\",\n    \"back\": \"[Answer explaining the key concept]\",\n    \"tags\": [\"[Relevant tag1]\", \"[Relevant tag2]\"]\n  }\n  // Add additional card objects as needed\n]\n\n\ // # Notes\n\n- The focus should be on creating cards that are useful for learning the material efficiently, not simply maximizing the number of cards.\n- Ensure the output remains strictly within the JSON-like format without additional commentary or styling adjustments."
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": userContent
            }
          ]
        }
      ],
      response_format: {
        "type": "text"
      },
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    console.log(completion.choices[0].message.content)
    return parseResults(completion.choices[0].message.content);
  }

  function parseResults(result: string): GeneratedCardContent[] {
    const parsed = JSON.parse(result) as any[];
    const validParsedCards = [];
    if (!Array.isArray(parsed)) {
      console.error("could not parse gpt result into cards: ", result);
    }
    parsed.forEach((potentialCard, index) => {
      if (
        typeof potentialCard.front === "string" &&
        typeof potentialCard.back === "string" &&
        Array.isArray(potentialCard.tags) &&
        potentialCard.tags.every((tag: any) => typeof tag === "string")
      ) {
        validParsedCards.push(potentialCard as GeneratedCardContent);
      } else {
        console.error(`Invalid card format at index ${index}:`, potentialCard);
      }
    });
    return validParsedCards;
  }


  export { generateAnkiWithAI };

  // PROMPTS
  // Your goal is to create high-quality learning anki cards. Every human student given those cards should be abled to pass any test about the content provided to you. The content that is provided to you consists of stringified JSON objects which represent powerpoint slides, with a text property and data about tesseract extracted text from the images inside the slides. So you must evaluate the given content and create high quality (NOT QUANTITY) index cards in the needed format. Assure that everything that you use could be import for an exam about the provided content, but do not hallucinate further content. based on the provided information about an image you can use the provided image reference as an answer as well, but only if really usefull. Please provide the cards in the following JSON-like format, without adding ANYTHING ELSE! here is the format with a few placeholders for question types (front and back can of course vary depending on needs): [{ "front": "question to answer", "back": "answer to this question or definition or ..." }, { "front": "heading of the model", "back": "some describing text or empty string", "imageRef": "/image/image10.png"}, //other exam relevant anki cards ] 
  // Create Anki cards strictly based on the information in the provided text. The text may come from simple PowerPoint slides or from an image. Do not include any additional knowledge or assumptions—use only the text exactly as given. The goal is to produce precise, test-ready flashcards containing all necessary details. Your final output must be in the following JSON-like format, without any additional commentary or explanation:
  // role: "system", content: `Create Anki cards from the given text. The text may come from a simple PowerPoint slide or information extracted from an image. The Anki cards should be useful, precise, and contain all the necessary information for a student to pass a test on the provided content. Use only the provided data and content to crea Output should be NOTHING but JSON-like format of the created cards in this schema: [