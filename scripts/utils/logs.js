import { OS_CONSTANS } from "../constans.js";

export default function logWithColors(message, ...args) {
    if(OS_CONSTANS.DEBUG) {
        return
    }
    const colors = [
        'color: skyblue; font-weight: bold;',
        'color: green; font-weight: bold;',
        'color: red; font-weight: bold;',
        'color: orange; font-weight: bold;',
        'color: purple; font-weight: bold;'
    ];

    // Extract caller info (file name + line number)
    const stack = new Error().stack.split("\n")[2]; // Get the caller line
    const match = stack.match(/(.*):(\d+):\d+\)?$/); // Extract file name and line number
    const fileInfo = match ? `${match[1]}:${match[2]}` : "unknown location";

    let styledParts = message.split('{}');
    let finalMessage = '';
    let styles = [];

    styledParts.forEach((part, index) => {
        finalMessage += part;
        if (index < args.length) {
            finalMessage += `%c${args[index]}%c`;
            styles.push(colors[index % colors.length], ''); // Reset after each colored argument
        }
    });

    // Append file & line number info in gray
    finalMessage += ` %c(${fileInfo})`;
    styles.push('color: gray; font-style: italic;');

    console.log(finalMessage, ...styles);
}
