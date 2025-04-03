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

> [!NOTE]
> This project is still work in progress


This application serves as my *curriculum vitae*. I took heavy inspiration from above mentioned Kanye2049, which is a media player/visualizer made for [toasy digital](https://toastydigital.com/). I wanted to make something simillar, a very crude simulation of a operating system, where each directory would tell a different story from my life.

This application does not use any framework whatsoever, it's pure native JavaScript + HTML + CSS, just as God intended. The only external library used is called [Mousetrap](https://github.com/ccampbell/mousetrap) by [ccampbell](https://github.com/ccampbell) and it allows for easy handling of keyboard shortcuts. I don't even use any keyboard shortcuts at the moment so this could change in the future.

**OS_OS** has following features:

- a `MacOS.1`-esque design. 
- a broken filesystem - [`Yggdrasil`](scripts/yggdrasil.js) (array of objects!)
- terminal (also a bit broken at the moment)
- settings stored in the browser `localStorage`
- client side Floyd–Steinberg dithering for images
- WIP: audio player - play tracks made by the phenomenal **toasty digital** in crisp Base64 quality
- rusty window manager used by the *file explorer*, terminal and other *software*, see [`OsWindow`](scripts/classes/os_window.js)

## Yggdrasil

You can find the raw data of the files that are shown in the OS_OS [here](scripts/classes/yggdrasil/Yggdrasil.js). It contains the HTML code that is inserted inside `innerHTML` property of the rendered [`OsWindow`](scripts/classes/os/OsWindow.js) Is this a good solution? Probably not, but my God is it fun. 

Yggdrasil uses [`CDirectory`](scripts/classes/yggdrasil/CDirectory.js) and [`CFile`](scripts/classes/yggdrasil/CFile.js) instances to store data about folders and files inside that folders. <u>A directory inside a directory is not supported.</u> Im not creating a *true* file system from scratch right now.


## Usage

### Github Pages

Application is hosted on Github Pages, check it out [here](https://swagnar.github.io/card/) <br>


### Production

This application is also hosted on my personal domain [euklideosowo.pl](https://euklidesowo.pl)

### Running locally

Serve on your favourite HTTP server, no need to build. Use [http-server](https://www.npmjs.com/package/http-server) for node, or [Apache](https://apache.org/).

## Libraries

- [Mousetrap](https://github.com/ccampbell/mousetrap) by [ccampbell](https://github.com/ccampbell)

## Special thanks

- [Alec Lowens](https://aleclownes.com) for great flickering animation

- [Freepik](https://flaticon.com/free-icons/computer) for favicon 




