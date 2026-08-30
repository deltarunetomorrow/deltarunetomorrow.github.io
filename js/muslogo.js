const tildeChars = ["Á", "É", "Í", "Ó", "Ú", "á", "é", "í", "ó", "ú"]; 
const reverseTildeChars = ["À", "È", "Ì", "Ò", "Ù", "à", "è", "ì", "ò", "ù"];
const hatChars = ["Â", "Ê", "Î", "Ô", "Û", "â", "ê", "î", "ô", "û"];
const dieresisChars = ["Ä", "Ë", "Ï", "Ö", "Ü", "ä", "ë", "ï", "ö", "ü"];
const virgulillaChars = ["Ã", null, null, "Õ", null, "ã", null, null, "õ", null, "Ñ", "ñ"];
const normalChars = ["A", "E", "I", "O", "U", "a", "e", "i", "o", "u", "N", "n"];
const lowercaseLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "á", "à", "â", "ä", "ã", "é", "è", "ê", "ë", "í", "ì", "î", "ï", "ó", "ò", "ô", "ö", "õ", "ú", "ù", "û", "ü", "ñ"];

function getSpecialChar(curChar) {
    let specialChar = null;
    let spXOffset = 0;
    let spYOffset = 0;
    if (tildeChars.includes(curChar)) {
        curChar = normalChars[tildeChars.indexOf(curChar)];
        specialChar = "´";
        spYOffset = 1;
        spXOffset = 1;
        if (curChar === "i") {
            spXOffset = 0;
            spYOffset += 2;
        }
        return {"curChar": curChar, "specialChar": specialChar, "spXOffset": spXOffset, "spYOffset": spYOffset};
    }
    if (reverseTildeChars.includes(curChar)) {
        curChar = normalChars[reverseTildeChars.indexOf(curChar)];
        specialChar = "`";
        spYOffset = 1;
        spXOffset = -1;
        if (curChar === "i") {
            spXOffset = -3;
            spYOffset += 2;
        }
        return {"curChar": curChar, "specialChar": specialChar, "spXOffset": spXOffset, "spYOffset": spYOffset};
    }
    if (hatChars.includes(curChar)) {
        curChar = normalChars[hatChars.indexOf(curChar)];
        specialChar = "^";
        spYOffset = 0;
        spXOffset = 0;
        if (curChar === "i") {
            spXOffset = -2;
            spYOffset += 3;
        }
        return {"curChar": curChar, "specialChar": specialChar, "spXOffset": spXOffset, "spYOffset": spYOffset};
    }
    if (dieresisChars.includes(curChar)) {
        curChar = normalChars[dieresisChars.indexOf(curChar)];
        specialChar = "¨";
        spYOffset = 2;
        spXOffset = 1;
        if (curChar === "i") {
            spXOffset = -1;
            spYOffset += 2;
        }
        return {"curChar": curChar, "specialChar": specialChar, "spXOffset": spXOffset, "spYOffset": spYOffset};
    }
    if (virgulillaChars.includes(curChar)) {
        curChar = normalChars[virgulillaChars.indexOf(curChar)];
        specialChar = "~";
        spXOffset = 0;
        spYOffset = -3;
        return {"curChar": curChar, "specialChar": specialChar, "spXOffset": spXOffset, "spYOffset": spYOffset};
    }
    if (!glpyhs.has(curChar)) {
        curChar = "null";
    }
    return {"curChar": curChar, "specialChar": specialChar, "spXOffset": spXOffset, "spYOffset": spYOffset};
}

function getKern(curChar, specialChar, nextChar) {
    let kern = 0;
    if (nextChar !== null) {
            if (curChar === "i" && specialChar === "´") {
                kern += 2;
            }
            if (curChar === "i" && specialChar === "^") {
                kern += 2;
            }
            if (nextChar === "ì") {
                kern += 2;
            }
            if (nextChar === "î") {
                kern += 2;
            }
            if (["F", "J", "T", "P"].includes(curChar)) {
                if (lowercaseLetters.includes(nextChar) && !["b", "h", "k", "l", "t", "f"].includes(nextChar)) {
                    if (!["i", "í", "ì", "ï", "î"].includes(nextChar)) {
                        kern += -1;
                    }
                    kern += -1;
                }
            }
            if (nextChar === "j") {
                if (!["g", "j", "y", "q", ".", ",", ";", ":", "'", '"'].includes(curChar)) {
                    kern += -2;
                }
            }
        }
    return kern;
}

function drawWord(word, x, y, maxWidth) {
    let curChar;
    let nextChar;
    let specialChar;
    let spXOffset;
    let spYOffset;
    let args = [];
    let remSpace = maxWidth - x;
    let long = null;
    let veryLong = null;
    let wordWidth = 0;
    let kern = 0;
    let xx = x;
    let yy = y;
    for (let i = 0; i < word.length; i++) {
        let setup = getSpecialChar(word[i]);
        curChar = setup.curChar;
        specialChar = setup.specialChar;
        spXOffset = setup.spXOffset;
        spYOffset = setup.spYOffset;
        nextChar = word[i+1];
        wordWidth += glpyhs.get(curChar).width + kern;
        let ch = glpyhs.get(curChar);
        if (wordWidth > remSpace && long === null) {
            long = i;
        }
        if (wordWidth > maxWidth && veryLong === null) {
            veryLong = long;
        }
        if (specialChar !== null) {
            if (lowercaseLetters.includes(curChar)) {
                let sp = glpyhs.get(specialChar);
                if (curChar === "i") {
                    args.push([[kern, sp.left, sp.top, sp.width, sp.height, xx + kern + spXOffset, yy + spYOffset, sp.width, sp.height],[kern, ch.left, ch.top + 10, ch.width, ch.height - 10, xx + kern, yy + 10, ch.width, ch.height - 10]]);
                } else {
                    args.push([[kern, sp.left, sp.top, sp.width, sp.height, xx + kern + spXOffset, yy + spYOffset, sp.width, sp.height],[kern, ch.left, ch.top, ch.width, ch.height, xx + kern, yy, ch.width, ch.height]]);
                }
            } else {
                spYOffset += -5;
                args.push([[kern, sp.left, sp.top, sp.width, sp.height, xx + kern + spXOffset, yy + spYOffset, sp.width, sp.height],[kern, ch.left, ch.top, ch.width, ch.height, xx + kern, yy, ch.width, ch.height]]);
            }
        } else {
            args.push([[kern, ch.left, ch.top, ch.width, ch.height, xx + kern, yy, ch.width, ch.height]]);
        }
        xx += glpyhs.get(curChar).width + kern;
        kern = getKern(curChar, specialChar, nextChar);
    }
    if (long === null && veryLong === null) {
        return {"args": args, "x": xx, "y": yy};
    }
    if (long !== null && veryLong === null) {
        let xOff = x + args[0][0][0];
        args.forEach((a) => {a.forEach(c => {c[5] -= xOff; c[6] += glpyhs.get("|").height})});
        xx = wordWidth;
        yy += glpyhs.get("|").height;
    }
    if (long !== null && veryLong !== null) {
        let xOff = args[veryLong][args[veryLong].length-1][5];
        let yShift = glpyhs.get("|").height;
        for (let i = veryLong; i < word.length; i++) {
            for (let j = 0; j < args[i].length; j++) {
                if (args[i][args[i].length-1][5] - xOff + args[i][args[i].length-1][7] > maxWidth) {
                    xOff = args[i][args[i].length-1][5];
                    yShift += glpyhs.get("|").height;
                }
                args[i][j][5] -= xOff;
                args[i][j][6] += yShift;
            }
        }
        xx = args[args.length-1][args[args.length-1].length-1][5] + args[args.length-1][args[args.length-1].length-1][7];
        yy = args[args.length-1][args[args.length-1].length-1][6];
    }
    return {"args": args, "x": xx, "y": yy};
}

function drawTextMus(msg, maxWidth) {
    if (maxWidth === undefined || maxWidth === null || parseFloat(maxWidth) === NaN) {
        maxWidth = visualViewport.width;
    }
    let args = [];
    let canvas = new OffscreenCanvas(maxWidth, visualViewport.height);
    let ctx = canvas.getContext("2d");
    let xx = 0;
    let yy = 0;
    let res;
    for (let line of msg.split("\n")) {
        for (let word of line.split(" ")) {
            res = drawWord(word, xx, yy, maxWidth);
            args = res.args;
            xx = res.x;
            yy = res.y;
            for (let i = 0; i < args.length; i++) {
                for (let j = 0; j < args[i].length; j++) {
                    let c = args[i][j];
                    ctx.drawImage(fnt_muslogo,c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8]);
                }
            }
            xx += glpyhs.get(" ").width;
        }
        yy += glpyhs.get("|").height;
    }
    return {"canvas": canvas, "width": maxWidth, "height": yy};
}

let imgscale = 1;
let originalWidth = 640;
let originalHeight = 480;
while (originalWidth * imgscale < visualViewport.width || originalHeight * imgscale < visualViewport.height) {
    imgscale += 1;
}
if (imgscale > 1) {
    imgscale -= 1;
}

let playing = false;

function drawTextPlaying(msg) {
    let img = document.getElementById("muslogo");
    let imgWidth = img.getAttribute("width");
    img.src = "spr/spr_muslogo_playing.png";
    let message = drawTextMus(msg, visualViewport.width - parseInt(imgWidth.replace("px",""))*2);
    let canvas = document.getElementById("textPlaying");
    canvas.width = message.width;
    canvas.height = message.height*imgscale;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(message.canvas.transferToImageBitmap(), 0, 0, message.canvas.width*imgscale, message.canvas.height*imgscale);
}

let audio = new Audio();
audio.loop = true;
audio.src = "snd/Underwater_Town.wav"

function mainMuslogo() {
    let img = document.getElementById("muslogo");
    let imgWidth = img.getAttribute("width");
    imgWidth = `${parseInt(imgWidth.replace("px",""))*imgscale}px`;
    img.setAttribute("width", imgWidth);
    img.style.display = "block";
    let canvas = document.getElementById("textPlaying");
    canvas.style.left = imgWidth;
    canvas.style.top = `${parseInt(canvas.style.top.replace("px",""))*imgscale}px`;
    canvas.style.display = "block";
}

function playMusic() {
    playing = !playing;
    if (playing) {
        audio.play();
        drawTextPlaying("Underwater Town");
    } else {
        audio.pause();
        document.getElementById("muslogo").src = "spr/spr_muslogo.png";
        let canvas = document.getElementById("textPlaying");
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }
}

async function loadMuslogo() {
    let path = "fnt/fnt_muslogo.png";
    new Promise((resolve, reject) => {
        let img = new Image();
        img.src = path;
        img.onload = function() {
            fnt_muslogo = img;
            resolve();
        }
    })
        .then(() => {mainMuslogo();})
        .catch(() => {`Error reading "${path}".`});
}

document.addEventListener("DOMContentLoaded", loadMuslogo);

let fnt_muslogo;
const glpyhs = new Map([
        ['T', {'left': 0, 'top': 0, 'width': 9, 'height': 20}],
        ['h', {'left': 9, 'top': 0, 'width': 7, 'height': 20}],
        ['e', {'left': 16, 'top': 0, 'width': 7, 'height': 20}],
        [' ', {'left': 23, 'top': 0, 'width': 6, 'height': 20}],
        ['G', {'left': 29, 'top': 0, 'width': 8, 'height': 20}],
        ['a', {'left': 37, 'top': 0, 'width': 7, 'height': 20}],
        ['r', {'left': 44, 'top': 0, 'width': 7, 'height': 20}],
        ['d', {'left': 51, 'top': 0, 'width': 7, 'height': 20}],
        ['n', {'left': 58, 'top': 0, 'width': 7, 'height': 20}],
        ['o', {'left': 65, 'top': 0, 'width': 7, 'height': 20}],
        ['f', {'left': 72, 'top': 0, 'width': 7, 'height': 20}],
        ['H', {'left': 79, 'top': 0, 'width': 8, 'height': 20}],
        ['p', {'left': 87, 'top': 0, 'width': 7, 'height': 20}],
        ['s', {'left': 94, 'top': 0, 'width': 7, 'height': 20}],
        ['D', {'left': 101, 'top': 0, 'width': 8, 'height': 20}],
        ['m', {'left': 109, 'top': 0, 'width': 8, 'height': 20}],
        ['i', {'left': 117, 'top': 0, 'width': 3, 'height': 20}],
        ['F', {'left': 120, 'top': 0, 'width': 8, 'height': 20}],
        ['l', {'left': 128, 'top': 0, 'width': 3, 'height': 20}],
        ['b', {'left': 131, 'top': 0, 'width': 7, 'height': 20}],
        ['c', {'left': 138, 'top': 0, 'width': 7, 'height': 20}],
        ['g', {'left': 145, 'top': 0, 'width': 7, 'height': 20}],
        ['j', {'left': 152, 'top': 0, 'width': 5, 'height': 20}],
        ['k', {'left': 157, 'top': 0, 'width': 7, 'height': 20}],
        ['q', {'left': 164, 'top': 0, 'width': 7, 'height': 20}],
        ['t', {'left': 171, 'top': 0, 'width': 7, 'height': 20}],
        ['u', {'left': 178, 'top': 0, 'width': 7, 'height': 20}],
        ['v', {'left': 185, 'top': 0, 'width': 7, 'height': 20}],
        ['w', {'left': 192, 'top': 0, 'width': 8, 'height': 20}],
        ['x', {'left': 200, 'top': 0, 'width': 7, 'height': 20}],
        ['y', {'left': 207, 'top': 0, 'width': 7, 'height': 20}],
        ['z', {'left': 214, 'top': 0, 'width': 7, 'height': 20}],
        ['A', {'left': 221, 'top': 0, 'width': 8, 'height': 20}],
        ['B', {'left': 229, 'top': 0, 'width': 8, 'height': 20}],
        ['C', {'left': 237, 'top': 0, 'width': 8, 'height': 20}],
        ['E', {'left': 245, 'top': 0, 'width': 8, 'height': 20}],
        ['I', {'left': 0, 'top': 20, 'width': 9, 'height': 20}],
        ['J', {'left': 9, 'top': 20, 'width': 8, 'height': 20}],
        ['K', {'left': 17, 'top': 20, 'width': 8, 'height': 20}],
        ['L', {'left': 25, 'top': 20, 'width': 8, 'height': 20}],
        ['M', {'left': 33, 'top': 20, 'width': 9, 'height': 20}],
        ['N', {'left': 42, 'top': 20, 'width': 8, 'height': 20}],
        ['O', {'left': 50, 'top': 20, 'width': 8, 'height': 20}],
        ['P', {'left': 58, 'top': 20, 'width': 8, 'height': 20}],
        ['Q', {'left': 66, 'top': 20, 'width': 8, 'height': 20}],
        ['R', {'left': 74, 'top': 20, 'width': 8, 'height': 20}],
        ['S', {'left': 82, 'top': 20, 'width': 8, 'height': 20}],
        ['U', {'left': 90, 'top': 20, 'width': 8, 'height': 20}],
        ['V', {'left': 98, 'top': 20, 'width': 8, 'height': 20}],
        ['W', {'left': 106, 'top': 20, 'width': 9, 'height': 20}],
        ['X', {'left': 115, 'top': 20, 'width': 8, 'height': 20}],
        ['Y', {'left': 123, 'top': 20, 'width': 7, 'height': 20}],
        ['Z', {'left': 130, 'top': 20, 'width': 8, 'height': 20}],
        ['$', {'left': 138, 'top': 20, 'width': 8, 'height': 20}],
        ['.', {'left': 146, 'top': 20, 'width': 4, 'height': 20}],
        [',', {'left': 150, 'top': 20, 'width': 4, 'height': 20}],
        [';', {'left': 154, 'top': 20, 'width': 4, 'height': 20}],
        [':', {'left': 158, 'top': 20, 'width': 4, 'height': 20}],
        ['#', {'left': 162, 'top': 20, 'width': 8, 'height': 20}],
        ["'", {'left': 170, 'top': 20, 'width': 3, 'height': 20}],
        ['"', {'left': 173, 'top': 20, 'width': 5, 'height': 20}],
        ['!', {'left': 178, 'top': 20, 'width': 3, 'height': 20}],
        ['/', {'left': 181, 'top': 20, 'width': 7, 'height': 20}],
        ['?', {'left': 188, 'top': 20, 'width': 8, 'height': 20}],
        ['%', {'left': 196, 'top': 20, 'width': 7, 'height': 20}],
        ['&', {'left': 203, 'top': 20, 'width': 8, 'height': 20}],
        ['(', {'left': 211, 'top': 20, 'width': 6, 'height': 20}],
        [')', {'left': 217, 'top': 20, 'width': 6, 'height': 20}],
        ['@', {'left': 223, 'top': 20, 'width': 8, 'height': 20}],
        ['[', {'left': 231, 'top': 20, 'width': 5, 'height': 20}],
        [']', {'left': 236, 'top': 20, 'width': 5, 'height': 20}],
        ['~', {'left': 241, 'top': 20, 'width': 8, 'height': 20}],
        ['-', {'left': 0, 'top': 40, 'width': 8, 'height': 20}],
        ['+', {'left': 8, 'top': 40, 'width': 7, 'height': 20}],
        ['*', {'left': 15, 'top': 40, 'width': 8, 'height': 20}],
        ['\\', {'left': 23, 'top': 40, 'width': 7, 'height': 20}],
        ['_', {'left': 30, 'top': 40, 'width': 8, 'height': 20}],
        ['<', {'left': 38, 'top': 40, 'width': 6, 'height': 20}],
        ['>', {'left': 44, 'top': 40, 'width': 6, 'height': 20}],
        ['{', {'left': 50, 'top': 40, 'width': 6, 'height': 20}],
        ['}', {'left': 56, 'top': 40, 'width': 6, 'height': 20}],
        ['|', {'left': 62, 'top': 40, 'width': 3, 'height': 20}],
        ['´', {'left': 65, 'top': 40, 'width': 6, 'height': 20}],
        ['`', {'left': 71, 'top': 40, 'width': 6, 'height': 20}],
        ['^', {'left': 77, 'top': 40, 'width': 7, 'height': 20}],
        ['¨', {'left': 84, 'top': 40, 'width': 5, 'height': 20}],
        ['¿', {'left': 89, 'top': 40, 'width': 8, 'height': 20}],
        ['¡', {'left': 97, 'top': 40, 'width': 3, 'height': 20}],
        ['ç', {'left': 100, 'top': 40, 'width': 7, 'height': 20}],
        ['=', {'left': 107, 'top': 40, 'width': 8, 'height': 20}],
        ['€', {'left': 115, 'top': 40, 'width': 8, 'height': 20}],
        ['¬', {'left': 123, 'top': 40, 'width': 8, 'height': 20}],
        ['·', {'left': 131, 'top': 40, 'width': 3, 'height': 20}],
        ['º', {'left': 134, 'top': 40, 'width': 5, 'height': 20}],
        ['ª', {'left': 139, 'top': 40, 'width': 5, 'height': 20}],
        ['0', {'left': 144, 'top': 40, 'width': 8, 'height': 20}],
        ['1', {'left': 152, 'top': 40, 'width': 7, 'height': 20}],
        ['2', {'left': 159, 'top': 40, 'width': 8, 'height': 20}],
        ['3', {'left': 167, 'top': 40, 'width': 8, 'height': 20}],
        ['4', {'left': 175, 'top': 40, 'width': 8, 'height': 20}],
        ['5', {'left': 183, 'top': 40, 'width': 8, 'height': 20}],
        ['6', {'left': 191, 'top': 40, 'width': 8, 'height': 20}],
        ['7', {'left': 199, 'top': 40, 'width': 8, 'height': 20}],
        ['8', {'left': 207, 'top': 40, 'width': 8, 'height': 20}],
        ['9', {'left': 215, 'top': 40, 'width': 8, 'height': 20}],
        ['null', {'left': 223, 'top': 40, 'width': 8, 'height': 20}],
]);