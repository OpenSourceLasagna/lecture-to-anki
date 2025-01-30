import { app, BrowserWindow, ipcMain } from "electron";
import electronReload from "electron-reload";
import { join } from "path";
import { convertPdfToAnki, convertPptxToAnki } from "./services/orchestrator";

let mainWindow: BrowserWindow;

app.once("ready", main);

async function main() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 1000,
    resizable: true,
    show: true,
    webPreferences: {
      devTools: !app.isPackaged,
      preload: join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    electronReload(join(__dirname), {
      forceHardReset: true,
      hardResetMethod: "quit",
      electron: app.getPath("exe"),
    });

    await mainWindow.loadURL(`http://localhost:5173/`);
  }

  mainWindow.once("ready-to-show", mainWindow.show);
}

ipcMain.handle("pptx-to-new-anki", async (_event, path: string, deckName: string, savePath: string) => {
  //TODO get path from config.json
  return await convertPptxToAnki(path, deckName, '/home/paul/Desktop');
});

ipcMain.handle("pdf-to-new-anki", async (_event, path: string, deckName: string, savePath: string) => {
  //TODO get path from config.json
  return await convertPdfToAnki(path, deckName, '/home/paul/Desktop');
});