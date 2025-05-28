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
- a broken filesystem - [`Yggdrasil`](scripts/classes/yggdrasil/Yggdrasil.js) (array of objects!)
- terminal (also a bit broken at the moment)
- settings stored in the browser `localStorage`
- client side Floyd–Steinberg dithering for images
- audio player - play tracks made by the phenomenal **toasty digital** in crisp Base64 quality
- WIP: text editor, that allows for creating own files stored in `localStorage`
- rusty window manager used by the *file explorer*, terminal and other *software*, see [`OsWindow`](scripts/classes/os/OsWindow.js)

## Yggdrasil 🌳

You can find the raw data of the files that are shown in the OS_OS [here](scripts/classes/yggdrasil/Yggdrasil.js). It contains the HTML code that is inserted inside `innerHTML` property of the rendered [`OsWindow`](scripts/classes/os/OsWindow.js). Is this a good solution? Probably not, but my God is it fun. 

Yggdrasil uses [`CDirectory`](scripts/classes/yggdrasil/CDirectory.js) and [`CFile`](scripts/classes/yggdrasil/CFile.js) instances to store data about folders and files inside that folders. <u>A directory inside a directory is not supported.</u> Im not creating a *true* file system from scratch right now.

## Choir 🐦‍⬛

Choir is the OS_OS audio player, that allows to play tracks made by [toasy digital](https://toastydigital.com/). The author allowed to use his songs in this project, but I didn't want to upload `.mp3` files to an open repo, so instead I'm using audio files converted to base64 text value, and then play them like so:
```js
this.#currentTrackAudio = new Audio("data:audio/mpeg;base64," + track.data)
```

Unfortunately, with just 2 songs the whole file containing this data weights almost 20 MB, so most of the songs are not playable and have only metadata.

Choir also has a very crude audio visualizer that I'm planning to expand upon.

If you're interested on how it works, [here](scripts/classes/Choir/Choir.js) is the source.

Choir uses [`CMusicTrack`](scripts/classes/Choir/CMusicTrack.js) instances for containing the audio file data - its track number, track name and the base64 data. Then, a collection of CMusicTrack is put inside [`CMusicAlbum`](scripts/classes/Choir/CMusicAlbum.js) that then is used by the app. 

The main file containing all music albums and music class instances is [`MusicAlbums.js`](scripts/resources/MusicAlbums.js) inside `scripts/resources/` directory.

I'm planning to upload a version of this app with all songs playable, that would be avaiable on my site - [euklidesowo.pl](https://euklidesowo.pl)

## Composer 🪶📜

Composer is the OS_OS text editor, that allows for creating and editing user files. When saved, files are stored in the `localStorage` in an array called `userFiles`. Each file is saved as an Object containing two values - file name and its content. 

Composer also uses [`OsPrompt`](scripts/OsPrompt.js) and [`OsAlert`](scripts/OsAlert.js), these are 2 functions that overwrite built-in `window.prompt()` and `window.alert()` methods for esthetic reasons.

## Terminal 🐚

Every OS needs to have a shell, so OS_OS also have a Terminal app. It can be launched via the desktop icon or the context menu. 

This terminal needs to be re-writen to more profoundly use CApp, since the Terminal is the first app that was made for the OS_OS.

By typing `help` you can get the list of all avaiable commands. Commands are stored as an OsTerminal static property called `commands`. It's an Object containing functions that are ran when called. For example, command `clear` for cleaning the Terminal window looks like this:
```js
// OsTerminal.js
static commands = {
    // ...

    /**
     * Clears the terminal output
    * @returns {string} - empty string
    */
    clear: function() {
        document.getElementById(`terminal-output`).innerHTML = ""
        return ``
    },

    // ...
}
```

Terminal supports running your commands with positional arguments and flags by using `parseArgs` function, that splits command string into the command name and its arguments. Here is an example of a command that uses positional arguments:
```js
// OsTerminal.js
static commands = {
    // ...

    /**
    * Displays an alert window with a message and an optional style based on flags.
    *
    * Recognized flags:
    * - `-d` or `--danger`: Shows the alert as a danger message.
    * - `-w` or `--warning`: Shows the alert as a warning message.
    *
    * If no flags are provided, a default alert is shown.
    *
    * @param {Object} param0 - Parsed command arguments.
    * @param {Object<string, boolean>} param0.flags - Flags parsed from the command line (e.g., -d, --danger).
    * @param {string[]} param0.positional - Positional arguments used as the alert message.
    */
    alert: function({ flags, positional }) {
        const msg = positional.join(" ") || "No message"
        let type = "default"
  
        if (flags.d || flags.danger) {
          type = "danger"
        } else if (flags.w || flags.warning) {
          type = "warning"
        }
  
        window.alert(msg, type)
    }

    // ...
}
```

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

Every app main class should be a child of `CApp` class, it handles all things related to `OsWindow` and creates a desktop icon with `OsDesktopIcon` class. Using `super()`, you pass to CApp two very important data related to your app - its name and its event name. 

The event with the same name is dispatched every time you want to open your app, below you'll find how do we react to such an event. 

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

At the end of the `Yggdrasil.js` file, there is an array called `osFiles`. It contains all directories, apps and archives stored in the system. Add your app instance to this array like this:

```js
// Just for looks
//
// Directories
// Archives
// Apps

export const osFiles = [
  DND, WORK, 
  ASTRONOMY,
  CHOIR, COMPOSER, SNAKE, OS_TERMINAL, MYAPP // <- here
];
```



And for the basics, that's it! (kinda)

### Icon

Of course, you'd like to add some kind of icon to you app, so that the user can run it by double clicking on the desktop icon (right now you should see your app as a lonely label on the desktop)

Every app has its unique HTML `id` and `class` - for `OsWindow` and `OsDesktopIcon`, so that you can easly write a CSS selector to change how it looks.

> [!IMPORTANT]
> The HTML `id` and `class` of your app is the lowercased app name, so for our example - `"MyApp"` the `id` suffix and class prefix would be `"myapp"`. So for an app called `"MyApp"` the OsWindow id would be `window-myapp`  and the OsDesktopIcon class would be `myapp-icon`

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

## Known bugs

- desktop icons don't render correctly on 800x600 desktop resolution
- opening an empty directory will result in OsWindow that has no body height
- z-index on context menu is not correct, sometimes menu can appear under the window

## Libraries

- [Mousetrap](https://github.com/ccampbell/mousetrap) by [ccampbell](https://github.com/ccampbell)

## Special thanks

- [Alec Lowens](https://aleclownes.com) for great flickering animation

- [Freepik](https://flaticon.com/free-icons/computer) for favicon 




