const dgram = require('dgram');


function unpackMsg(msg) {
    // unpack time
    const float64view = new Float64Array(msg.buffer, 0, 1);
    const time = float64view[0];

    // unpack sounds
    const uint8view = new Uint8Array(msg.buffer, 8);
    const sounds = uint8view.map(volume => volume);

    return [time, sounds];
}

const server = dgram.createSocket('udp4');

server.on('error', err => {
    console.log(`server error: ${err}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    if(msg.byteLength <= 8) {
        console.log(`incorrect msg received from ${rinfo.address}:${rinfo.port}`);
        return;
    }

    // console.log(`msg from ${rinfo.address}:${rinfo.port}`);

    const [time, sound_array] = unpackMsg(msg);
    server.emit('play', time, sound_array);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`listening on ${address.address}:${address.port}`);
});

module.exports = server;