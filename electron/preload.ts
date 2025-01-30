import { contextBridge, ipcRenderer } from "electron";
import { ParsedPptx } from "pptx-content-extractor";

export const CONTEXT_BRIDGE = {
  pptxToNewAnki: async (path: string, deckName: string, savePath: string): Promise<void> => {
    return await ipcRenderer.invoke('pptx-to-new-anki', path, deckName, savePath);
  },

  pdfToNewAnki: async (path: string, deckName: string, savePath: string): Promise<void> => {
    return await ipcRenderer.invoke('pdf-to-new-anki', path, deckName, savePath);
  }
};

contextBridge.exposeInMainWorld("bridge", CONTEXT_BRIDGE);
