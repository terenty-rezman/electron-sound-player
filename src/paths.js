const app = require('electron').remote.app
const path = require('path')

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

const paths = {getWorkingDir};

export default paths