const path = require('path');
const fs = require('fs');

async function reload() {
    let allPublic = await fs.promises.readdir(path.resolve('./public'));
    allPublic = allPublic.filter(f => /(worker-(.+)|fallback-(.+))\.js$/.test(f));
    if (allPublic.length) {
        await Promise.all(allPublic.map(async (f) => {
            await fs.promises.unlink(path.resolve('./public', f));
        }))
    }
    console.log("DONE");
}

reload();