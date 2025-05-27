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

### Creating your own app

### 1. JavaScript class 🍵

To create a new app, you can create a new folder to hold all of its JavaScript files inside `classes/` directory. There, create its main file with export class like so:
```js
import CApp from "../yggdrasil/CApp.js";

export default class MyApp extends CApp {
    constructor() {
        super('MyApp', 'showMyApp')
    }
}
```

### 2. Create app instance 👥

Go to `Yggdrasil.js` and create your app instance like this:
```js
// built-in apps
export const CHOIR = new Choir()
export const OS_TERMINAL = new OsTerminal()

// register your apps here
export const MYAPP = new MyApp()
```

### 3. Add event listener 👂🏻

Still inside `Yggdrasil.js` create global event listener for running your app. If you've created your custom window functionality, here is where you invoke that special method:
```js
document.addEventListener('showMyApp', () => {
  MYAPP.window.showWindow()
  // or
  MYAPP.showMyApp()
})
```
You can modify how the window looks and its contents by using the `window` property of the `CApp` parent of your application

### 4. Add your app instance to Yggdrasil 🌳

At the end of the `Yggdrasil.js` file, there is an array called `osFiles`. It contains all direcotires, apps and archives stored in the system. Add your app instance to this array like this:

```js
// Just for looks
//
// Directories
// Archives
// Apps

export const osFiles = [
  DND, WORK, 
  ASTRONOMY,
  CHOIR, COMPOSER, SNAKE, OS_TERMINAL, MYAPP
];
```



And for the basics, that's it! (kinda)

### Icon

Of course, you'd like to add some kind of icon to you app, so that the user can run it by double clicking on the desktop icon (right now you should see your app as a lonely label on the desktop)

Every app has its unique HTML `id` - for OsWindow and OsDesktopIcon, so that you can easly write a CSS selector to change how they look.

> [!IMPORTANT]
> The HTML `id` of your app is the lowercased app name, so for our example - `"MyApp"` the `id` would be `"myapp"`

To add an desktop icon to your app, upload your icon file to the `static/` directory. Then, inside the `apps.css` file inside `styles/` directory, add the following CSS rules:

```css
.file-icon.myapp-icon {
    background: transparent url('../static/myicon.png');
}
```

> [!IMPORTANT]
> If your app icon is not equal to 32x32 pixels, you also need to add `background-size: 32px` 


## Running

### Github Pages

Application is hosted on Github Pages, check it out [here](https://swagnar.github.io/card/) <br>


### Production

This application is also hosted on my personal domain [euklideosowo.pl](https://euklidesowo.pl)

### Locally

Serve on your favourite HTTP server, no need to build. Use [http-server](https://www.npmjs.com/package/http-server) for node, or [Apache](https://apache.org/).

## Libraries

- [Mousetrap](https://github.com/ccampbell/mousetrap) by [ccampbell](https://github.com/ccampbell)

## Special thanks

- [Alec Lowens](https://aleclownes.com) for great flickering animation

- [Freepik](https://flaticon.com/free-icons/computer) for favicon 




