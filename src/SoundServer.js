const dgram = require('dgram');
const polka = require('polka');
const body_parser = require('body-parser');


const app = polka();
app.use(body_parser.json());

const send = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

// Routes
app.get('/', (req, res) => {
    res.end('Hello world!');
});

app.post('/api/play_sound', (req, res) => {
  // req.body available because of body-parser
    console.log(req.body)
    let body = req.body;
    udp_server.emit('play_by_name', body.name, body.volume || 100, body.looped || false);
    send(res, 201, {status: "ok"});
});

app.post('/api/stop_sound', (req, res) => {
  // req.body available because of body-parser
    console.log(req.body)
    let body = req.body;
    udp_server.emit('stop_by_name', body.name);
    send(res, 201, {status: "ok"});
});

app.post('/api/stop_all_sounds', (req, res) => {
  // req.body available because of body-parser
    udp_server.emit('stop_all_sounds');
    send(res, 201, {status: "ok"});
});

// Start the server and listen for incoming requests

function unpackMsg(msg) {
    // unpack time
    const float64view = new Float64Array(msg.buffer, 0, 1);
    const time = float64view[0];

    // unpack sounds
    const uint8view = new Uint8Array(msg.buffer, 8);
    const sounds = uint8view.map(volume => volume);

    return [time, sounds];
}

const udp_server = dgram.createSocket('udp4');

udp_server.on('error', err => {
    console.log(`server error: ${err}`);
    udp_server.close();
});

udp_server.on('message', (msg, rinfo) => {
    if(msg.byteLength <= 8) {
        console.log(`incorrect msg received from ${rinfo.address}:${rinfo.port}`);
        return;
    }

    // console.log(`msg from ${rinfo.address}:${rinfo.port}`);

    const [time, sound_array] = unpackMsg(msg);
    udp_server.emit('play', time, sound_array);
});

udp_server.on('listening', () => {
    const address = udp_server.address();
    console.log(`listening on ${address.address}:${address.port}`);
});

udp_server.start_listen = (port, address) => {
    udp_server.bind(port, address);

    app.listen(port, address, err => {
        if (err) throw err;
        console.log(`http app listening at http://localhost:${port}`);
    });
}

module.exports = udp_server