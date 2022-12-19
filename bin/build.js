const path = require('path');
const fs = require('fs-extra');
const zl = require("zip-lib");

async function postbuild() {
    const zip = new zl.Zip();
    const standalone_path = path.resolve("./.next/standalone");

    // copy static to standalone
    await fs.copy(path.resolve('./.next/static'),standalone_path+'/.next/static');

    // copy public to standalone
    await fs.copy(path.resolve('./public'),standalone_path+'/public');

    // copy server_standalone.js
    await fs.copy(path.resolve('./server_standalone.js'),standalone_path+'/server_standalone.js');

    // Add all standalone folder to zip
    await zl.archiveFolder(standalone_path,path.resolve('./tmp/portalnesia.zip'));

    console.log("DONE");
}
postbuild();
