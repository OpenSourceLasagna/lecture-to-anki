import { ParsedMedia } from "pptx-content-extractor";

export type ImageWithcontext = Tesseract.RecognizeResult & ParsedMedia & {buffer: Buffer}; 