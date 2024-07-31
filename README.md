# card

>‏
>‏
>‏
>‏
>‏
>‏
>‏
>‏
> Pet project

Inspired by [Kanye2049](https://kanye2049.com/) <br>

![](static/demo.gif)

## About

This application serves as my *curriculum vitae*. I took heavy inspiration from above mentioned Kanye2049, which is a media player/visualizer made for [toasy digital](https://toastydigital.com/). I wanted to make something simillar, a very crude simulation of a operating system, where each directory would tell a different story from my life.

**OS_OS** has following features:

- a `Windows 3.x`-esque design. 
- a broken filesystem - [YGGDRASIL](scripts/yggdrasil.js) (array of objects!)
- terminal (also a bit broken at the moment)
- settings stored in the browser `localStorage`
- client side Floyd–Steinberg dithering for images
- WIP: audio player - play tracks made by the phenomenal **toasty digital** in crisp Base64 quality
- rusty window manager used by the *file explorer*, terminal and other *software*, see [OsWindow](scripts/classes/os_window.js)


## Usage

### Github Pages

Application is hosted on Github Pages, check it out [here](https://swagnar.github.io/card/) <br>

### Running locally

Serve on your favourite HTTP server, no need to build. Use [http-server](https://www.npmjs.com/package/http-server) for node, or [Apache](https://apache.org/).

## Libraries

- [Mousetrap](https://github.com/ccampbell/mousetrap) by [ccampbell](https://github.com/ccampbell)

## Special thanks

- [Alec Lowens](https://aleclownes.com) for great flickering animation

- [Freepik](https://flaticon.com/free-icons/computer) for favicon 




