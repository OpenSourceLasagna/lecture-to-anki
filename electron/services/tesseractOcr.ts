import Tesseract, { createWorker, type Worker } from 'tesseract.js';

type Language = Parameters<typeof createWorker>[0];
let worker: Worker = null;

async function initWorker(language?: Language): Promise<void> {
    if (!worker) {
        worker = await (language ? createWorker(language) : createWorker());
    }
}

async function extractTextFromImages(
    base64Data: string[],
    language?: Language
): Promise<(Tesseract.RecognizeResult & { buffer: Buffer })[]> {
    try {
        await initWorker(language);
        return Promise.all(base64Data.map(base64 => extractTextFromImage(base64, false)));
    } catch (error) {
        console.error('Error recognizing images:', error);
        return null;
    } finally {
        if (worker) {
            console.info('Terminating worker...');
            await worker.terminate();
            worker = null;
        }
    }
}

async function extractTextFromImage(
    base64: string,
    closeWorker: boolean = true,
    language?: Language
): Promise<Tesseract.RecognizeResult & { buffer: Buffer }> {
    try {
        await initWorker(language);
        const buffer = await createBufferFromBase64(base64);
        const result = await worker.recognize(buffer);
        return { ...result, buffer };
    } catch (error) {
        console.error('Error recognizing image:', error);
        return null;
    } finally {
        if (closeWorker && worker) {
            console.info('Terminating worker...');
            await worker.terminate();
            worker = null;
        }
    }
}

async function createBufferFromBase64(encodedImage: string): Promise<Buffer> {
    if (!encodedImage.startsWith('data:image/')) {
        console.error('Invalid base64 data: Missing image MIME type');
        return null;
    }

    const base64Data = encodedImage.split(',')[1];
    if (!base64Data) {
        console.error('Invalid base64 data: No image content found');
        return null;
    }

    return Buffer.from(base64Data, 'base64');
}

export { extractTextFromImage, extractTextFromImages };