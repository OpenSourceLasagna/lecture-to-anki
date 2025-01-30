<script lang="ts">
  import ipc from "./ipc";

  let pathToLecture = "";
  let deckName = "";
  let savePath = "";

  let currentStatus = "";
  let statusColor = "";

  async function generate() {
    try {
      currentStatus = "loading...";
      statusColor = "yellow";
      if (deckName.length == 0 || pathToLecture.length == 0 || savePath.length == 0) {
        currentStatus = "All inputs are required!";
        statusColor = "red";
        return;
      } else if (/\s/.test(deckName) || /\s/.test(pathToLecture) || /\s/.test(savePath)) {
        currentStatus = "No whitespaces allowed!";
        statusColor = "red";
        return;
      }
      if (pathToLecture.endsWith(".pdf")) {
        await ipc.pdfToNewAnki(pathToLecture, deckName, savePath);
      } else if (pathToLecture.endsWith(".pptx")) {
        await ipc.pptxToNewAnki(pathToLecture, deckName, savePath);
      } else {
        currentStatus = "invalid file ending!";
        statusColor = "red";
        return;
      }
      currentStatus = "finished generating " + deckName;
      statusColor = "green";
    } catch (e) {
      console.error(e);
      currentStatus = "Error occured: " + e;
      statusColor = "red";
    }
  }
</script>

<main>
  <h1>Lecture to Anki</h1>

  <p style="color: {statusColor}">{currentStatus}</p>

  <div style="width: 80vw; margin: 1rem;">
    <input
      style="width: 80vw; height: 2rem;"
      type="text"
      id="pathToLecture"
      bind:value={pathToLecture}
      placeholder="Absolute path to .pdf/.pptx"
    />
  </div>
  <div style="width: 80vw; margin: 1rem;">
    <input
      style="width: 80vw; height: 2rem;"
      type="text"
      id="nameAnkiDeck"
      bind:value={deckName}
      placeholder="Name for the new anki deck"
    />
  </div>
  <div style="width: 80vw; margin: 1rem;">
    <input
      style="width: 80vw; height: 2rem;"
      type="text"
      id="savePath"
      bind:value={savePath}
      placeholder="path to save the anki deck"
    />
  </div>

  <div class="buttons">
    <button class="btn" on:click={() => generate()}>Generate Deck</button>
  </div>
</main>
