import fs from 'fs';
import { GeneratedCardContent } from 'models/generatedCardContent';
const AnkiExport = require('anki-apkg-export').default;

async function createNewAnkiDeck(name: string, content: GeneratedCardContent[], path: string) {
    try {
        const newDeck = new AnkiExport(name);

        content.forEach(cardContent => createNewCard(newDeck, cardContent));

        const zip = await newDeck.save();

        const saveZipPath = `${path.endsWith('/') ? path : path + '/'}${name.endsWith('.apkg') ? name : name + '.apkg'}`;

        fs.writeFileSync(saveZipPath, zip, 'binary');
    } catch (error) {
        console.error('Error creating Anki deck:', error?.stack ?? error);
    }
}

function createNewCard(deck: any, content: GeneratedCardContent) {
    if (content.image && content.imageReference) {
        deck.addMedia(content.imageReference, content.image);
        content.back += ` <img src="${content.imageReference}" />`;
    }

    deck.addCard(content.front, content.back, { tags: content.tags ?? [] });
}

export { createNewAnkiDeck };