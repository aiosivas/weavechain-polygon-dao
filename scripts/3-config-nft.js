import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0x90fb4f8DAAef60f8a273e733D7DF902b1c671eF8");

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "WChain Template",
        description: "This NFT will give you access to WDAO!",
        image: readFileSync("scripts/assets/Weave.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();