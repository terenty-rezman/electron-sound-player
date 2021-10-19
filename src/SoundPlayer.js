import { Howler, Howl } from 'howler'
import { func } from 'prop-types';

const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);

function blobToURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', e => {
            resolve(reader.result);
        });

        reader.addEventListener('error', e => {
            reject(e);
        })

        reader.readAsDataURL(blob);
    });
};

async function loadFileAsURL(src) {
    const buffer = await readFile(src);    // node fs returns buffer
    const blob = new Blob([buffer]);       // create blob from buffer
    return URL.createObjectURL(blob);
    // const dataURL = await blobToURL(blob); // get url to Blob via FileReader
    // return dataURL;
}

class Sound extends EventTarget {
    constructor(idx, main_howl, pre_howl, main_name, pre_name, priority) {
        super();

        this.idx = idx;
        this.main_howl = main_howl;
        this.pre_howl = pre_howl;
        this.main_name = main_name;
        this.pre_name = pre_name;
        this.priority = priority;
        this.current_howl = null;
        this.sound_id = null;
        this.playing = false;
        this.looped = false;
        this.volume = 0;
    }

    play(volume, looped) {
        if (this.main_howl.state() !== 'loaded')
            return;

        if (this.playing === false) {
            this.volume = volume;
            this.looped = looped;

            if (this.pre_howl) { // if there is a pre-sound       
                this._play_presound(); // play presound first    
                this._notify_play(this.pre_name, true); // notify gui
            }
            else { // if no pre-sound
                this._play_main_sound();
                this._notify_play(this.main_name, false); // notify gui
            }
        } // else when playing
        else if (this.looped != looped) {
            this._set_volume(volume);
            // if currently playing howl is main then change looped otherwise wait until main is current
            if (this.current_howl === this.main_howl) {
                this.main_howl.loop(looped, this.sound_id);
            }
            this.looped = looped;
            this._notify_loop(); // notify gui
        } // when playing and not looped
        else {
            this._set_volume(volume);
        }

        this.volume = volume;
    }

    stop() {
        if (this.playing === true) {
            this.current_howl.stop(this.sound_id);
        }
    }

    _play_presound() {
        // play presound first
        this.sound_id = this.pre_howl.play();
        this.pre_howl.volume(this.volume, this.sound_id);
        this.current_howl = this.pre_howl;
        this.playing = true;

        this.pre_howl.once('stop', () => {
            this.playing = false;
            this.pre_howl.off('end', this.sound_id); // remove event listener
            this._notify_stop();
        }, this.sound_id)

        // when presound finishes
        this.pre_howl.once('end', () => {
            this.pre_howl.off('stop', this.sound_id);

            // play main sound
            this._play_main_sound();
            this._notify_main_sound(); // notify gui
        }, this.sound_id);
    }

    _play_main_sound() {
        this.sound_id = this.main_howl.play();
        this.main_howl.loop(this.looped, this.sound_id);
        this.main_howl.volume(this.volume, this.sound_id);
        this.current_howl = this.main_howl;
        this.playing = true;

        this.main_howl.once('stop', () => {
            this.playing = false;
            this.main_howl.off('end', this.sound_id); // remove event listener
            this._notify_stop();
        }, this.sound_id)

        // when main finishes
        this.main_howl.on('end', () => {
            if (this.main_howl.loop(this.sound_id) === false) {
                this.playing = false;
                this.main_howl.off('end', this.sound_id);  // remove event listener
                this.main_howl.off('stop', this.sound_id); // remove event listener
                this._notify_stop();
            }

        }, this.sound_id);
    }

    _set_volume(volume) {
        if (this.volume !== volume) {
            this.current_howl.volume(volume);
            this.volume = volume;
            this._notify_volume();
        }
    }

    // started playback
    _notify_play(sound_name, is_presound) {
        this.dispatchEvent(new CustomEvent('play', { detail: { is_presound, sound: this } }));
    }

    // main sound started to play after pre sound finished
    _notify_main_sound() {
        this.dispatchEvent(new CustomEvent('main_sound', { detail: { sound: this } }));
    }

    // looped state changed
    _notify_loop() {
        this.dispatchEvent(new CustomEvent('loop', { detail: { sound: this } }));
    }

    _notify_volume() {
        this.dispatchEvent(new CustomEvent('volume', { detail: { sound: this } }));
    }

    _notify_stop() {
        this.dispatchEvent(new CustomEvent('stop', { detail: { sound: this } }));
    }
}

class SoundPlayer extends EventTarget {
    constructor() {
        super();
        this.howls = new Map();
        this.my_sounds = [];
        this.time = 0;
        this.max_sounds = 10;
    }

    static async createHowl(soundName, soundDir) {
        let dataUrl = null;

        try {
            dataUrl = await loadFileAsURL(soundDir + soundName);
            console.log(`loaded ${soundName}`);
        }
        catch (e) {
            console.log(`Error: failed to load ${soundDir + soundName}`);
        }

        return (
            new Howl({
                src: dataUrl,
                format: soundName.split('.').pop().toLowerCase(),
                onload: function () {
                    URL.revokeObjectURL(dataUrl);
                },
                onloaderror: function (id, msg) {
                    console.log(msg);
                }
            })
        );
    }

    setMaxSounds(number) {
        this.max_sounds = number;
    }

    getMasterVolume() {
        return Math.trunc(Howler.volume() * 100);
    }

    setMasterVolume(volume) {
        Howler.volume(volume / 100);
    }

    setMasterMuted(muted) {
        Howler.mute(muted);
    }

    async loadSoundFiles(soundlistFileName, soundDir) {
        try {
            const config = JSON.parse(fs.readFileSync(soundlistFileName, 'utf8'));

            // parse config file
            await Promise.all(config.sound_list.map(async (description, index) => {
                const { main_sound, pre_sound, priority } = description;
                let main_howl = null;
                let pre_howl = null;

                // create howl for main sound
                if (this.howls.has(main_sound) === false) {
                    // create howl
                    main_howl = await SoundPlayer.createHowl(main_sound, soundDir);

                    // store in map
                    this.howls.set(main_sound, main_howl);
                }
                else {
                    console.log(`sound ${main_sound} already exists in ${soundlistFileName} !`);
                    main_howl = this.howls.get(main_sound);
                }

                // if presound exists create howl for pre sound
                if (pre_sound) {
                    if (this.howls.has(pre_sound) === false) {
                        pre_howl = await SoundPlayer.createHowl(pre_sound, soundDir);
                        this.howls.set(pre_sound, pre_howl);
                    }
                    else {
                        pre_howl = this.howls.get(pre_sound);
                    }
                }

                const my_sound = new Sound(index, main_howl, pre_howl, main_sound, pre_sound, priority);
                this.my_sounds.push(my_sound);
            }));

            // restore original order from .json config file
            // as after async load above sounds arrive out of order into my_sounds
            this.my_sounds.sort((a, b) => a.idx - b.idx)

            // print sound list 
            console.log("\n Sound List\n")
            this.my_sounds.forEach(sound => {
                console.log(`[${sound.idx}] ${sound.main_name}`);
            })

            this._subscribe_to_sound_events();
        }
        catch (e) {
            console.log(e);
        }
    }

    play_sounds(time, sounds) {
        this.time = time;
        this._notify_time();

        const priority_list = [];

        // first form priority list of sounds to play
        for (let i = 0; i < sounds.length; i++) {
            if (i >= this.my_sounds.length) {
                console.log(`index (${i}) exceeds sound list size (${this.my_sounds.length})`);
                break;
            }

            priority_list.push({ index: i, priority: this.my_sounds[i].priority });
        }

        // sort list by priority
        priority_list.sort((a, b) => b.priority - a.priority);

        // now play sounds from prioritized list up to max sounds
        let playing_count = 0
        for (let i = 0; i < priority_list.length; i++) {
            const index = priority_list[i].index;
            const volume = sounds[index];

            if (volume === 255) {
                this.m_sounds[index].stop();
            }
            else if (playing_count < this.max_sounds) {
                if (0 < volume && volume <= 100) {
                    const floatVolume = volume / 100;
                    this.my_sounds[index].play(floatVolume, false); // play normal
                }
                else if (150 <= volume && volume <= 250) {
                    const floatVolume = (volume - 150) / 100;
                    this.my_sounds[index].play(floatVolume, true); // play looped
                }
                else
                    continue;

                playing_count++;
            }
        }
    }

    _subscribe_to_sound_events() {
        this.my_sounds.forEach(my_sound => {
            my_sound.addEventListener('play', this._onPlay);
            my_sound.addEventListener('main_sound', this._onMainSound);
            my_sound.addEventListener('loop', this._onLoop);
            my_sound.addEventListener('volume', this._onVolume);
            my_sound.addEventListener('stop', this._onStop);
        })
    }

    _onPlay = (e) => {
        // console.log('onplay');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    _onMainSound = (e) => {
        // console.log('onmainsound');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    _onLoop = (e) => {
        // console.log('onloop');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    _onVolume = (e) => {
        // console.log('onvolume');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    _onStop = (e) => {
        // console.log('onstop');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    _notify_time() {
        this.dispatchEvent(new CustomEvent('time', { detail: { time: this.time } }));
    }
}

const soundPlayer = new SoundPlayer();

export default soundPlayer;
