# Thirdweb DAO

### **To clone**
Clone this repo and follow these commands:
Must have nodejs and npm
1. Run `npm install` at the root of your directory

#### To run scripts
Edit .env file

use ```node scripts/<script.js>```

### To test (w/ Vite)
npm run dev - preview

npm run build - compile for production preview

npm run serve - production preview

### My build process from the ground up (make sure to read through scripts for fields unique to you, mostly addresses)
Obtain metamask wallet info

Create .env as seen above with desired network API key from alchemy

Choose network iin index.jsx

Deploy nft-drop script

Batch upload numbered IDs from thirdweb dashboard, set claim conditions (unlimited wait time between mints)

Deploy token script

Print money script

Deploy vote script

Setup vote script





