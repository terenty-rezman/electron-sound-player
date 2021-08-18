# Electron Sound Player
![image](https://user-images.githubusercontent.com/58115884/129878342-042ce579-2cdf-4451-8dea-1a7eada9ed7a.png)

> Simplistic primitive udp sound player based on web technologies (__Electron__, __React__)

The main purpose of this project was to implement nice ui for existing remote sound player

And also to try out __Electron__ and __React__

Basically soundplayer acts as a __UDP__ server and plays different sounds requested by clients via __UDP__ protocol

__Electron__ app includes the __UDP__ server inside itself and provides UI to display current playback info

## Installation
to install dependencies use
```
npm i
``` 
from the project folder

## Building the app
use 
```
npm run-script dist
```
to create Electron app distribution in `dist` folder
