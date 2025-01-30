# Lecture to Anki

This Electron application converts PDF and PPTX lecture files into Anki flashcard decks. It extracts text from PDF and PPTX files, while images within PPTX files are further processed using Tesseract OCR to capture context for integration into the flashcards. The app uses AI services, such as openai GPT api, to enhance the deck generation process.

---

## Features

- Convert PDF and PPTX files into Anki decks.
- Extract images from PPTX and use Tesseract for OCR on these images.
- Organize extracted data and images into structured flashcards.

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Paul0908/lecture-to-anki.git
cd lecture-to-anki
```

### Install dependencies

Install dependencies for both the main Electron process and the renderer (Svelte frontend).

```bash
npm install            # Install Electron dependencies (root folder)
cd renderer && npm install  # Install Svelte frontend dependencies
```

### Create environment variables

Either set them globally or create a .env file at the root of the project containing `OPENAI_LECTURE_TO_ANKI_API_KEY` or `OPENAI_API_KEY` with your OpenAI API key.

### Commands

- ```bash
  npm run dev
  ```

  will begin watching the renderer folder for changes and run the
  electron app in development mode. The electron folder will also be watched for hotreloading changes using the **electron-reload** package.

- ```bash
  npm run package
  ```

  will package the application according to the **build**
  section in the package.json file. This uses **electron-builder** for packaging
  the application for all major platforms.

---

## Folder structure

- readme.md
- package.json
- **electron**
  - **services**
    - ankiCreator.ts
    - gptService.ts
    - orchestrator.ts
    - pdfExtractor.ts
    - pptxExtractor.ts
    - tesseractOcr.ts
  - app.ts
  - preload.ts
  - tsconfig.json `(Electron specific tsconfig file.)`
- **renderer**
  `(Svelte Frontend)`
  - **src**
    - App.svelte
  - vite.config.json
  - package.json

---

## Development Notes

- The project is built with the electron-svelte template: <https://github.com/tlaceby/electron-svelte>
- Hot reloading is enabled for both the Svelte frontend and the Electron backend.

---

## Contributing

Feel free to submit issues or pull requests to improve the app.
