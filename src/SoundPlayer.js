import { Howler, Howl } from 'howler'

const fs = require('fs');

class Sound extends EventTarget {
    constructor(idx, main_howl, pre_howl, main_name, pre_name) {
        super();

        this.idx = idx;
        this.main_howl = main_howl;
        this.pre_howl = pre_howl;
        this.main_name = main_name;
        this.pre_name = pre_name;
        this.current_howl = null;
        this.sound_id = null;
        this.playing = false;
        this.looped = false;
        this.volume = 0;
    }

    play(volume, looped) {

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
        if(this.playing === true) {
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
            if(this.main_howl.loop(this.sound_id) === false) {
                this.playing = false;
                this.main_howl.off('end', this.sound_id);  // remove event listener
                this.main_howl.off('stop', this.sound_id); // remove event listener
                this._notify_stop();
            }
            
        }, this.sound_id);
    }

    _set_volume(volume) {
        if(this.volume !== volume) {
            this.current_howl.volume(volume);
            this.volume = volume;      
            this._notify_volume();
        }
    }

    // started playback
    _notify_play(sound_name, is_presound) { 
        this.dispatchEvent(new CustomEvent('play', {detail: {is_presound, sound: this}}));
    }

    // main sound started to play after pre sound finished
    _notify_main_sound() { 
        this.dispatchEvent(new CustomEvent('main_sound', {detail: {sound: this}}));
    }

    // looped state changed
    _notify_loop() {
        this.dispatchEvent(new CustomEvent('loop', {detail: {sound: this}}));
    }

    _notify_volume() {
        this.dispatchEvent(new CustomEvent('volume', {detail: {sound: this}}));
    }

    _notify_stop() {
        this.dispatchEvent(new CustomEvent('stop', {detail: {sound: this}}));
    }
}

class SoundPlayer extends EventTarget {
    constructor() {
        super();
        this.howls = new Map(); 
        this.my_sounds = [];
    }

    static createHowl(soundName, soundDir) {
        return (
            new Howl({
                src: [soundDir + soundName],
                onloaderror: (e) => {
                    console.log(e);
                },
                onload: (e) => {
                    console.log(soundName + ' loaded');
                }
            })
        )
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

    readConfig(configFileName, soundDir) {
        const config = JSON.parse(fs.readFileSync(configFileName, 'utf8'));

        // parse config file
        config.sound_list.forEach((description, index) => {
            const { main_sound, pre_sound } = description;
            let main_howl = null;
            let pre_howl = null;

            // create howl for main sound
            if (this.howls.has(main_sound) === false) {
                // create howl
                main_howl = SoundPlayer.createHowl(main_sound, soundDir);

                // store in map
                this.howls.set(main_sound, main_howl);
            }
            else {
                console.log(`sound ${main_sound} already exists in ${configFileName} !`);
                main_howl = this.howls.get(main_sound);
            }

            // if presound exists create howl for pre sound
            if (pre_sound) {
                if (this.howls.has(pre_sound) === false) {
                    pre_howl = SoundPlayer.createHowl(pre_sound, soundDir);
                    this.howls.set(pre_sound, pre_howl);
                }
                else {
                    pre_howl = this.howls.get(pre_sound);
                }
            }

            const my_sound = new Sound(index, main_howl, pre_howl, main_sound, pre_sound);
            this.my_sounds.push(my_sound);
        });

        this._subscribe_to_sound_events();
    }

    play_sounds(sounds) {
        sounds.forEach((volume, index) => {
            if(index < this.my_sounds.length) {
                if(volume === 255) {
                    this.my_sounds[index].stop();
                }
                else if(0 < volume && volume <= 100) {
                    const floatVolume = volume / 100;
                    this.my_sounds[index].play(floatVolume, false); // play normal
                }
                else if(150 <= volume && volume <= 250) {
                    const floatVolume = (volume - 150) / 100;
                    this.my_sounds[index].play(floatVolume, true); // play looped
                }
            }
            else {
                console.log(`index (${index}) exceeds sound list size (${this.my_sounds.length})`);
            }
        })
    }

    _subscribe_to_sound_events() {
        this.my_sounds.forEach(my_sound => {
            my_sound.addEventListener('play', this.onPlay);
            my_sound.addEventListener('main_sound', this.onMainSound);
            my_sound.addEventListener('loop', this.onLoop);
            my_sound.addEventListener('volume', this.onVolume);
            my_sound.addEventListener('stop', this.onStop);
        })
    }

    onPlay = (e) => {
        console.log('onplay');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    onMainSound = (e) => {
        console.log('onmainsound');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    onLoop = (e) => {
        console.log('onloop');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    onVolume = (e) => {
        console.log('onvolume');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }

    onStop = (e) => {
        console.log('onstop');
        this.dispatchEvent(new CustomEvent(e.type, e));
    }
}

const soundPlayer = new SoundPlayer();

export default soundPlayer;