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
    const htmlFilePath = './dist/index.html';

    console.log("Validating json files")

    let html = '';

    const htmlItems = await Promise.all(
        data.map(async (item) => {
            if (await validateJson(item)) {
                generateHTMLFile(item);
                return `<li><a href="./${item.title}.html">${item.title}</a></li>\n`;
            }
            return '';
        })
    );

    html = htmlItems.join('');

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

    await fs.writeFile(htmlFilePath, htmlContent, 'utf-8');
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


async function generateHTMLFile(data) {
    console.log("generateHTMLFile data:", data)

    const newFile = await fs.readFile(path.resolve(`./data/${data.file}`), 'utf-8')
    const jsonData = JSON.parse(newFile);
    
    //console.log("jsonData read and parsed:", jsonData);

    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.title} Quiz</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .question { margin-bottom: 20px; }
                .answers { list-style-type: none; padding: 0; }
                .answers li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>${data.title} Quiz</h1>
            <div id="quiz">`;

            jsonData.questions.forEach((q, index) => {
                if (!Array.isArray(q.answers)) {
                    console.warn(`Skipping question ${index + 1}: answers is not an array`, q);
                    return; // Skip invalid questions
                }

            htmlContent += `<div class='question' id="question-${index}">
            <h2>Q${index + 1}: ${q.question}</h2>
            <ul class='answers'>`;

            q.answers.forEach((answer, ansIndex) => {
                htmlContent += `<li>
                    <label>
                        <input type="radio" name="question-${index}" value="${ansIndex}" data-correct="${answer.correct}">
                        ${answer.answer}
                    </label>
                </li>`;
            });

            htmlContent += `</ul>
                <button onclick="checkAnswer(${index})">Submit</button>
                <p class="feedback" id="feedback-${index}"></p>
            </div>`;
        });

        htmlContent += `</div>

            <script>
                function checkAnswer(questionIndex) {
                    const selectedOption = document.querySelector(\`input[name="question-\${questionIndex}"]:checked\`);
                    const feedbackElement = document.getElementById(\`feedback-\${questionIndex}\`);
                    
                    if (!selectedOption) {
                        feedbackElement.textContent = "Please select an answer!";
                        feedbackElement.className = "feedback incorrect";
                        return;
                    }
                    
                    const isCorrect = selectedOption.getAttribute("data-correct") === "true";
                    
                    if (isCorrect) {
                        feedbackElement.textContent = "✅ Correct!";
                        feedbackElement.className = "feedback correct";
                    } else {
                        feedbackElement.textContent = "❌ Incorrect!";
                        feedbackElement.className = "feedback incorrect";
                    }
                }
            </script>

            <a href="./dist/index.html">Back to main page</a>

        </body>
        </html>`;
    // Write to an HTML file
    await fs.writeFile(`./dist/${data.title}.html`, htmlContent) 
    console.log(`${data.title}.html has been created successfully`);
}
    /*
    const html = '';
    for (const i of data.questions) {
        html += ``
    }
    const htmlContent = `
    <!doctype html>
    <html>
        <head>
            <title>${item.title}</title>
        </head>
        <body>
            <ul>
                ${html}
            </ul>
        </body>
    </html>
    `;
    
    //const newHtmlFile = fs.writeFile(`${item.title}.html`, item.questions, 'utf-8');
}
*/


/**
 * Skoðar hvort Json skrá er á réttu formi
 * @param {any} data JSON skrá sem á að skoða
 * @returns {Promise<boolean>} Er skráin í lagi að nota
 */
async function validateJson(data) {
    console.log("Getting JSON file for validation", data);
    const filePath = `./data/${data.file}`;
    try {
        const fileData = await readJson(filePath);
        console.log(fileData != null);
        if (fileData != null) {
        console.log(data, "seems okay");
        console.log("Are the questions null?", fileData.questions == null);
        if (fileData.questions != null) return true;
    }
    }
    catch (error)
    {
        console.log(data, "is a problem");
    }
    
    return false;


}

/**
 * Keyrir forritið okkar:
 * 1. Sækir gögn
 * 2. Staðfestir gögn (validation)
 * 3. Skrifar út HTML
 */
async function main() {
    //Generate dummy site
    //await fs.writeFile('./dist/index.html', '', 'utf-8')
    
    const indexJson = await readJson(INDEX_PATH);
    const indexData = parseIndexJson(indexJson);

    writeHtml(indexData)

    //console.log(indexData);

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