import { GeneratedCardContent } from "../models/generatedCardContent";
import { ImageWithcontext } from "../models/imageWithContext";
import { ParsedMedia, ParsedSlide } from "pptx-content-extractor";
import { createNewAnkiDeck } from "./ankiCreator";
import { generateAnkiWithAI } from "./gptService";
import { parsePptxFileAsync } from "./pptxExtractor";
import { extractTextFromImage } from "./tesseractOcr";
import { extractTextPdfFile, PageResult } from "./pdfExtractor";


async function convertPdfToAnki(pdfPath: string, deckName: string, deckPath: string): Promise<void> {
    const data = await extractTextPdfFile(pdfPath);

    const processSlides = async (batch: string) => await generateAnkiWithAI(batch);

    const mergeSlidesToString = (pages: PageResult[]) => {
        return JSON.stringify(pages)
    };
    
    const rawCards: GeneratedCardContent[] = await processInBatches(data, mergeSlidesToString, 10, processSlides);

    await createNewAnkiDeck(deckName, rawCards, deckPath);
}

async function convertPptxToAnki(pptxPath: string, deckName: string, deckPath: string): Promise<void> {

    const data = await parsePptxFileAsync(pptxPath);
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'];

    const media: ImageWithcontext[] = [];
    for (const image of data.media) {
        const lowerCaseFileName = image.name.toLowerCase();

        if (!supportedExtensions.some(ext => lowerCaseFileName.endsWith(ext))) {
            continue;
        }

        const context = await extractTextFromImage(image.content, false);
        media.push({
            ...context,
            ...image
        });
    }
    const slides = mergeImagesIntoSlides(data.slides, media);

    const processSlides = async (batch: string) => await generateAnkiWithAI(batch);

    const mergeSlidesToString = (slides: (ParsedSlide & { media: (ParsedMedia | ImageWithcontext)[] })[]) => {
        return JSON.stringify(
            slides.map(slide => ({
                text: slide.content.map(c => c.text),
                media: slide.media.map(m => ({
                    extractedText: (m as any)?.data?.text ?? "could not read text",
                    imageReference: m?.name
                }))
            }))
        );
    };
    

    let rawCards: GeneratedCardContent[] = await processInBatches(slides, mergeSlidesToString, 10, processSlides);

    const getBuffer = (name: string, media: ImageWithcontext[]) => {
        console.log("getting buff", media.find(m => m.name.includes(name))?.buffer?.length ?? null)
        return media.find(m => m.name.includes(name)).buffer ?? null;
    }

    rawCards = rawCards.map(raw => {
        if (raw.imageReference?.length > 0) {
            const buffer = getBuffer(raw.imageReference, media);
            return { ...raw, imageReference: raw.imageReference.split("/").pop(), image: buffer };
        }
        return raw;
    });

    console.log(rawCards);
    await createNewAnkiDeck(deckName, rawCards, deckPath);
}

async function processInBatches<T, K>(
    toProcess: T[],
    mergeBatch: (batch: T[]) => K,
    batchSize: number,
    process: (batchCombined: K) => Promise<GeneratedCardContent[]>
): Promise<GeneratedCardContent[]> {
    const promises: Promise<GeneratedCardContent[]>[] = [];

    for (let i = 0; i < toProcess.length; i += batchSize) {
        const batch = toProcess.slice(i, i + batchSize);
        const mergedBatch = mergeBatch(batch);
        promises.push(process(mergedBatch));
    }

    return (await Promise.all(promises)).flat();
}

function mergeImagesIntoSlides(slides: ParsedSlide[], contextMedia: (ParsedMedia | ImageWithcontext)[]) {
    const getMedia = (name: string, media: (ParsedMedia | ImageWithcontext)[]) => {
        return media.find(rM => rM.name.includes(name));
    }
    return slides.map(slide => {
        const media = slide.mediaNames.map(name => getMedia(name, contextMedia));
        return { ...slide, media };
    });
}

export { convertPptxToAnki, convertPdfToAnki };