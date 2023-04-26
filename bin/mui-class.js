const path = require('path');
const fs = require('fs-extra');
const { generateRandom } = require('@portalnesia/utils');

async function newBuildId() {
    const pathname = path.resolve("./src/build-id.ts");
    const rand = generateRandom(5);
    const rand2 = generateRandom(5);
    console.log(`Build ID: ${rand}`);
    console.log(`Build ID Postfix: ${rand2}`);
    let text = `// Generated automatically\nexport const buildId = "${rand}";\nexport const buildIdPostfix = "${rand2}";\n`;

    await fs.writeFile(pathname, text)
}
newBuildId();