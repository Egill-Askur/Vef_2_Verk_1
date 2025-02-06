import fs from "node:fs/promises"
import path from "node:path"

const INDEX_PATH = './data/index.json';


/**
 * Les skrá og skilar gögnum eða null.
 * @param {string} filePath Skráin sem á að lesa 
 * @returns {Promise<unknown | null>} Les skrá úr filepath og skilar innihaldi. Skilar 'null' ef villa kom upp.
 */
async function readJson(filePath) {
    console.log('Starting to read', filePath);
    let data;
    try {
        data = await fs.readFile(path.resolve(filePath), 'utf-8');
    }
    catch (error) {
        console.error('Error reading file', filePath, error.message);
        return null;
    }
    
    try {
        const json = JSON.parse(data);
        return json;
    }
    catch (error) {
        console.error('Error parsing data as JSON', filePath, error.message);
        return null;
    }
    
}

/**
 * Skrifa HTML fyrir yfirlit í index.html
 * @param {any} data Gögn til að skrifa
 * @returns {Promise<void>}
 */
async function writeHtml(data) {
    const htmlFilePath = 'dist/index.html';

    let html = '';

    for (const item of data) {
        html += `<li>${item.title}</li>\n`
    }

    const htmlContent = `
    <!doctype html>
    <html>
        <head>
            <title>v1</title>
        </head>
        <body>
            <ul>
                ${html}
            </ul>
        </body>
    </html>
    `;

    //const htmlContent = '<html><h1>halló heimur!!!</h1></html>';

    fs.writeFile(htmlFilePath, htmlContent, 'utf-8');
}

/**
 * 
 * @param {unknown} data 
 * @returns {any}
 */
function parseIndexJson(data) {
    //if (typeof data === 'string') {
    //    return data;
    //}

    //return null;
    return data;
}


/**
 * Keyrir forritið okkar:
 * 1. Sækir gögn
 * 2. Staðfestir gögn (validation)
 * 3. Skrifar út HTML
 */
async function main() {
    const indexJson = await readJson(INDEX_PATH);
    const indexData = parseIndexJson(indexJson);

    writeHtml(indexData)

    console.log(indexData);

    /*
    const allData = await Promise.all(
        indexData.map(async (item) => {
            const filePath = `./data/${item.file}`;
            const fileData = await readJson(filePath);
            return fileData ? {...item, content: fileData}
            : null;
        }),
    );
    */
}

main();