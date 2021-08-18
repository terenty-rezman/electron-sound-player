// TODO: this module not complete, dont use it
const { spawnSync } = require('child_process');

function linux_getDeviceName() {
    const df = spawnSync('df', ['/']);
    const result = df.stdout.toString();
    const deviceName = result.match(/(?<=\n)\S+/);
    
    return deviceName[0];
}

function linux_getDriveSN(deviceName) {
    const udevadm = spawnSync('udevadm', ['info', '--query=all', `--name=${deviceName}`]);
    const result = udevadm.stdout.toString();
    const sn = result.match(/(?<=ID_SERIAL=).*/);

    return sn[0];
}

function linux_getCurrentDriveSN() {
    const device_name = linux_getDeviceName();
    const sn = linux_getDriveSN(device_name);

    return sn;
}

module.exports = { linux_getCurrentDriveSN }
