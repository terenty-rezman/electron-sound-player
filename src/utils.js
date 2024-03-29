const app = require('electron').remote.app
const path = require('path')
const fs = require('fs')

function getWorkingDir() {
    if (process.env.WEBPACK_MODE === 'production') {
        const exe_path = app.getPath('exe');
        const pwd = path.dirname(exe_path);

        return pwd;
    }
    else {
        return app.getAppPath();
    }
}

function readSettingsFile(src) {
    try {
        const settings = JSON.parse(fs.readFileSync(src, 'utf8'));
        return settings;
    }
    catch(e) {
        console.log(e);
        return null;
    }
}

const utils = {getWorkingDir, readSettingsFile};

export default utils