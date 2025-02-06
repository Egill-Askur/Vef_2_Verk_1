import fs from "node:fs/promises"
import path from "node:path"

const INDEX_PATH = './data/index.json';

async function readJson(filePath) {
    console.log('Starting to read', filePath);
    try {
        const data = await fs.readFile(path.resolve(filePath), 'utf-8');
        const json = JSON.parse(data);
        return json;
    }
    catch (error) {
        console.error('Error reading file', filePath, error.message);
        return null;
    }
    

    
}

async function main() {
    console.log('Hello World');

    const indexData = await readJson(INDEX_PATH);

    //console.log(data);
    const allData = await Promise.all(
        indexData.map(async (item) => {
            const filePath = `./data/${item.file}`;
            const fileData = await readJson(filePath);
            return fileData ? {...item, content: fileData}
            : null;
        }),
    );
}

main();