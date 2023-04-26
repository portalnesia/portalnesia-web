const path = require('path');
const fs = require('fs-extra');
const zl = require("zip-lib");

async function postbuild() {
    const standalone_path = path.resolve("./.next/standalone");

    let allPublic = await fs.promises.readdir(path.resolve('./public'));
    allPublic = allPublic.filter(f => /.+\.LICENSE\.txt$/.test(f));
    if (allPublic.length) {
        await Promise.all(allPublic.map(async (f) => {
            await fs.promises.unlink(path.resolve('./public', f));
        }))
    }

    // copy static to standalone
    await fs.copy(path.resolve('./.next/static'), standalone_path + '/.next/static');

    // copy public to standalone
    await fs.copy(path.resolve('./public'), standalone_path + '/public');

    // copy server_standalone.js
    await fs.copy(path.resolve('./server_standalone.js'), standalone_path + '/server_standalone.js');

    // Add all standalone folder to zip
    await zl.archiveFolder(standalone_path, path.resolve('./tmp/portalnesia.zip'));

    console.log("DONE");
}
postbuild();
