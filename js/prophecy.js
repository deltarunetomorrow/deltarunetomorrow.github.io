"use strict";

const Assets = new Map();
const Paths = [
    "spr/IMAGE_DEPTH_EXTEND_MONO_SEAMLESS.png",
    "spr/IMAGE_DEPTH_EXTEND_SEAMLESS.png",
    "spr/spr_dw_church_prophecy_final_icon.png",
    "spr/spr_pxwhite.png",
    "fnt/fnt_legend.ttf",
    "spr/spr_gradient20.png"
]
const Surfaces = new Map([["applicationSurface", {"name": "applicationSurface", "height": 240, "width": 320, "content": "", "maskId": 0}]]);
let currentSurface = "applicationSurface";
let currentBlend = "";
let previousSurface = "applicationSurface";



///////////////////////////////// INSERT DATA HERE /////////////////////////////////
let icon_sprite = "spr/spr_dw_church_prophecy_final_icon.png";
const releaseDate = new Date(2027, 11, 31, 23, 59, 59);
const announced = false;
let msg = " ";
///////////////////////////////// INSERT DATA HERE /////////////////////////////////




//////////////////// AUDIO SCRIPTS ////////////////////
let mus = new Audio();
mus.src = "snd/Underwater_Town.wav";
mus.loop = true;
function playMusic() {
    if (mus.paused) {
        document.getElementById("muslogo").src = "spr/spr_muslogo_ext.png";
        mus.play();
    } else {
        document.getElementById("muslogo").src = "spr/spr_muslogo.png";
        mus.pause();
    }
}


//////////////////// COLOR SCRIPTS ////////////////////
const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

function lerp(a, b, amt) {
    return a + (b - a) * amt;
}

function hexToDecimal(hex) {
    let res = 0;
    let pow = 0;
    for (let i = hex.length - 1; i > -1; i--) {
        res += digits.indexOf(hex[i]) * Math.pow(16, pow);
        pow += 1;
    }
    return res;
}

function decimalToHex(n) {
    n = Math.round(n);
    let res = "";
    let numdigits = 1;
    let temp_n = n;
    while (n >= Math.pow(16, numdigits)) {
        numdigits += 1;
    }
    while (numdigits > 0) {
        let p = 0;
        while (temp_n >= (p+1)*Math.pow(16, numdigits-1)) {
            p += 1;
        }
        res += digits[p];
        temp_n -= p*Math.pow(16, numdigits-1);
        numdigits -= 1;
    }
    return res;
}

function hexToRgb(col) {
    let r = col.substring(1,3);
    let g = col.substring(3,5);
    let b = col.substring(5,7);
    return {"red": hexToDecimal(r), "green": hexToDecimal(g), "blue": hexToDecimal(b)};
}

function rgbToHex(col) {
    let r = decimalToHex(col.red);
    let g = decimalToHex(col.green);
    let b = decimalToHex(col.blue);
    return "#" + (r.length===2?r:"0"+r) + (g.length===2?g:"0"+g) + (b.length===2?b:"0"+b);
}

function mergeColor(col1, col2, amount) {
    let col1_rgb = hexToRgb(col1);
    let col2_rgb = hexToRgb(col2);
    let mix_rgb = {"red": lerp(col1_rgb.red, col2_rgb.red, amount), "green": lerp(col1_rgb.green, col2_rgb.green, amount), "blue": lerp(col1_rgb.blue, col2_rgb.blue, amount)};
    return rgbToHex(mix_rgb);
}





//////////////////// DRAWING SCRIPTS ////////////////////
function surfaceExists(name) {
    return Surfaces.has(name);
}

function surfaceCreate(name, width, height) {
    if (surfaceExists(name)) {
        console.error(`Surface "${name}" already exists.`);
        return;
    }
    let data = {"name": name, "width": width, "height": height, "content": "", "spriteIndex": 0};
    Surfaces.set(name, data);
}

function surfaceResetTarget() {
    currentSurface = previousSurface;
}

function surfaceSetTarget(name) {
    if (!surfaceExists(name)) {
        console.error(`Undefined surface "${name}".`);
        return;
    }
    previousSurface = currentSurface;
    currentSurface = name;
}

function surfaceClear(name) {
    if (!surfaceExists(name)) {
        console.error(`Undefined surface "${name}".`);
        return;
    }
    Surfaces.get(name).content = "";
    Surfaces.get(name).maskId = 0;
}

function rotate(point, rad) {
    let matrix = [[Math.cos(rad), Math.sin(rad)], [-Math.sin(rad), Math.cos(rad)]];
    let newPoint = [];
    for (let row of matrix) {
        newPoint.push(row[0]*point[0] + row[1]*point[1]);
    }
    return newPoint;
}

function surfaceDrawExtended(name, x, y, xscale, yscale, rot, colour, alpha) {
    // doesn't work well if the scales are not 1 and the function drawSpriteTiledExtended has been used
    if (!Surfaces.has(name)) {
        console.error(`Undefined surface "${name}".`);
        return;
    }
    if (name === currentSurface) {
        console.error(`Drawing a surface on itself is not allowed.`);
        return;
    }
    if (name === "applicationSurface") {
        console.error(`Use the function drawApplicationSurfaceExtended to draw the application surface.`);
        return;
    }
    let _surf = Surfaces.get(name);
    let width = Math.abs(_surf.width * xscale);
    let height = Math.abs(_surf.height * yscale);
    let color_rgb = hexToRgb(colour);
    let rotationTranslate = calcRotationTranslation(width, height, rot);
    let content = `<g style="mix-blend-mode:${currentBlend};opacity:${alpha};"><defs><filter id="mult_${colour.substring(1)}"><feColorMatrix in="SourceGraphic" type="matrix" values="${color_rgb.red/255} 0 0 0 0 0 ${color_rgb.green/255} 0 0 0 0 0 ${color_rgb.blue/255} 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><svg preserveAspectRatio="none" filter="url(#mult_${colour.substring(1)})" width="${width}" height="${height}" x="0" y="0" viewbox="0 0 ${_surf.width} ${_surf.height}" transform="scale(${Math.sign(xscale)} ${Math.sign(yscale)}) translate(${xscale<0?(-width):0} ${yscale<0?(-height):0}) translate(${rotationTranslate.x} ${rotationTranslate.y}) translate(${x} ${y}) rotate(${rot} 0 0)">${_surf.content}</svg></g>`;
    Surfaces.get(currentSurface).content += content;
}

function drawApplicationSurfaceExtended(x, y, xscale, yscale) {
    let _surf = Surfaces.get("applicationSurface");
    let width = Math.abs(_surf.width*xscale);
    let height = Math.abs(_surf.height*yscale);
    let svgHeader = `<svg id="applicationSurface" width="${width}" height="${height}" viewbox="0 0 ${_surf.width} ${_surf.height}" transform="scale(${Math.sign(xscale)} ${Math.sign(yscale)}) translate(${xscale<0?(-width-x):0} ${yscale<0?(-height-y):0})" style="position:absolute;top:${y}px;left:${x}px">`;
    let svg = svgHeader + _surf.content + "</svg>";
    document.getElementById("applicationSurface").outerHTML = svg;
}

function calcRotationTranslation(width, height, rot) {
    let box = {"topLeft": [0, 0], "topRight": [width, 0], "bottomRight": [width, height], "bottomLeft": [0, height]};
    let rad = -(rot * Math.PI)/180;
    box.topRight = rotate(box.topRight, rad);
    box.bottomRight = rotate(box.bottomRight, rad);
    box.bottomLeft = rotate(box.bottomLeft, rad);
    return {"x": -Math.min(box.topLeft[0], box.topRight[0], box.bottomRight[0], box.bottomLeft[0]), "y": -Math.min(box.topLeft[1], box.topRight[1], box.bottomRight[1], box.bottomLeft[1])};
}

function drawSpriteExtended(sprite, x, y, xscale, yscale, rot, colour, alpha) {
    let img = Assets.get(sprite).img;
    let width = Math.abs(img.width*xscale);
    let height = Math.abs(img.height*yscale);
    let color_rgb = hexToRgb(colour);
    let rotationTranslate = calcRotationTranslation(width, height, rot);
    let content = `<g style="mix-blend-mode:${currentBlend};opacity:${alpha};"><defs><filter id="mult_${colour.substring(1)}"><feColorMatrix in="SourceGraphic" type="matrix" values="${color_rgb.red/255} 0 0 0 0 0 ${color_rgb.green/255} 0 0 0 0 0 ${color_rgb.blue/255} 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><image filter="url(#mult_${colour.substring(1)})" style="image-rendering:pixelated;" preserveAspectRatio="none" href="${sprite}" height="${height}" width="${width}" x="0" y="0" transform="scale(${Math.sign(xscale)} ${Math.sign(yscale)}) translate(${xscale<0?(-width):0} ${yscale<0?(-height):0}) translate(${rotationTranslate.x} ${rotationTranslate.y}) translate(${x} ${y}) rotate(${rot} 0 0)"></image></g>`;
    Surfaces.get(currentSurface).content += content;
}

function addMaskExtended(sprite, x, y, xscale, yscale, rot) {
    let img = Assets.get(sprite).img;
    let width = Math.abs(img.width*xscale);
    let height = Math.abs(img.height*yscale);
    let content = `<mask id="mask${Surfaces.get(currentSurface).maskId}" mask-type="alpha"><image style="image-rendering:pixelated;rotate:${rot}deg;" preserveAspectRatio="none" href="${sprite}" height="${height}" width="${width}" x="${x}" y="${y}" transform="scale(${Math.sign(xscale)} ${Math.sign(yscale)}) translate(${xscale<0?(-width-x):0} ${yscale<0?(-height-y):0})"></image></mask><g mask="url(#mask${Surfaces.get(currentSurface).maskId})">${Surfaces.get(currentSurface).content}</g>`;
    Surfaces.get(currentSurface).content = content;
    Surfaces.get(currentSurface).maskId += 1;
}

function drawSpriteTiledExtended(sprite, x, y, xscale, yscale, colour, alpha) {
    let _surf = Surfaces.get(currentSurface);
    let spr = Assets.get(sprite).img;
    let width = Math.abs(spr.width * xscale);
    let height = Math.abs(spr.height * yscale);
    let xx_start = x;
    let yy_start = y;
    while (xx_start < -width) {
        xx_start += width;
    }
    while (yy_start < -height) {
        yy_start += height;
    }
    while (xx_start > 0) {
        xx_start -= width;
    }
    while (yy_start > 0) {
        yy_start -= height;
    }
    let xx = xx_start;
    let yy = yy_start;
    while (yy < _surf.height) {
        while(xx < _surf.width) {
            drawSpriteExtended(sprite, xx, yy, xscale, yscale, 0, colour, alpha);
            xx += width;
        }
        yy += height;
        xx = xx_start;
    }
}

function gpuSetBlend(blendmode) {
    currentBlend = blendmode;
}

function drawClearAlpha(colour, alpha) {
    let _surf = Surfaces.get(currentSurface);
    let width = _surf.width;
    let height = _surf.height;
    if (alpha >= 1) {
        Surfaces.get(currentSurface).content = `<rect x="0" y="0" width="${width}" height="${height}" fill="${colour}"></rect>`;
    } else {
        Surfaces.get(currentSurface).content = `<rect style="opacity:${alpha}" x="0" y="0" width="${width}" height="${height}" fill="${colour}"></rect>` + Surfaces.get(currentSurface).content;
    }
}

const charHeight = 16;
const svgTextYDiff = 6;
const chars = {
        ' ': {'width': 5, 'shift': 5, 'offset': 0},
        '!': {'width': 1, 'shift': 3, 'offset': 1},
        '"': {'width': 3, 'shift': 4, 'offset': 0},
        '#': {'width': 8, 'shift': 8, 'offset': -1},
        '$': {'width': 5, 'shift': 7, 'offset': 1},
        '%': {'width': 8, 'shift': 10, 'offset': 1},
        '&': {'width': 5, 'shift': 7, 'offset': 1},
        '\'': {'width': 1, 'shift': 3, 'offset': 1},
        '(': {'width': 3, 'shift': 5, 'offset': 1},
        ')': {'width': 3, 'shift': 5, 'offset': 1},
        '*': {'width': 3, 'shift': 5, 'offset': 1},
        '+': {'width': 5, 'shift': 7, 'offset': 1},
        ',': {'width': 2, 'shift': 4, 'offset': 1},
        '-': {'width': 4, 'shift': 5, 'offset': 0},
        '.': {'width': 1, 'shift': 3, 'offset': 1},
        '/': {'width': 5, 'shift': 6, 'offset': 0},
        '0': {'width': 4, 'shift': 6, 'offset': 1},
        '1': {'width': 3, 'shift': 6, 'offset': 2},
        '2': {'width': 5, 'shift': 7, 'offset': 1},
        '3': {'width': 4, 'shift': 6, 'offset': 1},
        '4': {'width': 5, 'shift': 7, 'offset': 1},
        '5': {'width': 4, 'shift': 6, 'offset': 1},
        '6': {'width': 4, 'shift': 6, 'offset': 1},
        '7': {'width': 5, 'shift': 7, 'offset': 1},
        '8': {'width': 4, 'shift': 6, 'offset': 1},
        '9': {'width': 4, 'shift': 6, 'offset': 1},
        ':': {'width': 1, 'shift': 3, 'offset': 1},
        ';': {'width': 2, 'shift': 3, 'offset': 0},
        '<': {'width': 5, 'shift': 7, 'offset': 1},
        '=': {'width': 6, 'shift': 8, 'offset': 1},
        '>': {'width': 5, 'shift': 7, 'offset': 1},
        '?': {'width': 4, 'shift': 6, 'offset': 1},
        '@': {'width': 11, 'shift': 13, 'offset': 1},
        'A': {'width': 5, 'shift': 5, 'offset': -1},
        'B': {'width': 5, 'shift': 6, 'offset': 0},
        'C': {'width': 4, 'shift': 5, 'offset': 0},
        'D': {'width': 5, 'shift': 6, 'offset': 0},
        'E': {'width': 5, 'shift': 6, 'offset': 0},
        'F': {'width': 5, 'shift': 5, 'offset': -1},
        'G': {'width': 4, 'shift': 5, 'offset': 0},
        'H': {'width': 5, 'shift': 5, 'offset': -1},
        'I': {'width': 3, 'shift': 4, 'offset': 0},
        'J': {'width': 5, 'shift': 6, 'offset': 0},
        'K': {'width': 5, 'shift': 5, 'offset': -1},
        'L': {'width': 5, 'shift': 5, 'offset': -1},
        'M': {'width': 8, 'shift': 9, 'offset': 0},
        'N': {'width': 6, 'shift': 6, 'offset': -1},
        'O': {'width': 4, 'shift': 5, 'offset': 0},
        'P': {'width': 5, 'shift': 5, 'offset': -1},
        'Q': {'width': 4, 'shift': 5, 'offset': 0},
        'R': {'width': 5, 'shift': 5, 'offset': -1},
        'S': {'width': 4, 'shift': 5, 'offset': 0},
        'T': {'width': 5, 'shift': 6, 'offset': 0},
        'U': {'width': 5, 'shift': 5, 'offset': -1},
        'V': {'width': 7, 'shift': 7, 'offset': -1},
        'W': {'width': 10, 'shift': 10, 'offset': -1},
        'X': {'width': 7, 'shift': 7, 'offset': -1},
        'Y': {'width': 6, 'shift': 6, 'offset': -1},
        'Z': {'width': 5, 'shift': 6, 'offset': 0},
        '[': {'width': 3, 'shift': 4, 'offset': 0},
        '\\': {'width': 5, 'shift': 6, 'offset': 0},
        ']': {'width': 3, 'shift': 4, 'offset': 0},
        '^': {'width': 5, 'shift': 7, 'offset': 1},
        '_': {'width': 7, 'shift': 8, 'offset': 0},
        '`': {'width': 2, 'shift': 4, 'offset': 1},
        'a': {'width': 5, 'shift': 7, 'offset': 1},
        'b': {'width': 5, 'shift': 6, 'offset': 0},
        'c': {'width': 4, 'shift': 6, 'offset': 1},
        'd': {'width': 4, 'shift': 6, 'offset': 1},
        'e': {'width': 4, 'shift': 6, 'offset': 1},
        'f': {'width': 5, 'shift': 6, 'offset': 0},
        'g': {'width': 5, 'shift': 7, 'offset': 1},
        'h': {'width': 5, 'shift': 5, 'offset': -1},
        'i': {'width': 3, 'shift': 4, 'offset': 0},
        'j': {'width': 3, 'shift': 3, 'offset': -1},
        'k': {'width': 4, 'shift': 5, 'offset': 0},
        'l': {'width': 3, 'shift': 4, 'offset': 0},
        'm': {'width': 8, 'shift': 9, 'offset': 0},
        'n': {'width': 5, 'shift': 6, 'offset': 0},
        'o': {'width': 4, 'shift': 5, 'offset': 0},
        'p': {'width': 5, 'shift': 6, 'offset': 0},
        'q': {'width': 5, 'shift': 7, 'offset': 1},
        'r': {'width': 4, 'shift': 5, 'offset': 0},
        's': {'width': 4, 'shift': 5, 'offset': 0},
        't': {'width': 2, 'shift': 4, 'offset': 1},
        'u': {'width': 6, 'shift': 7, 'offset': 0},
        'v': {'width': 6, 'shift': 7, 'offset': 0},
        'w': {'width': 8, 'shift': 9, 'offset': 0},
        'x': {'width': 4, 'shift': 5, 'offset': 0},
        'y': {'width': 5, 'shift': 6, 'offset': 0},
        'z': {'width': 4, 'shift': 6, 'offset': 1},
        '{': {'width': 3, 'shift': 5, 'offset': 1},
        '|': {'width': 1, 'shift': 3, 'offset': 1},
        '}': {'width': 3, 'shift': 4, 'offset': 0},
        '~': {'width': 6, 'shift': 7, 'offset': 0}
};

function stringWidth(str) {
    let res = -chars[str[0]].offset + chars[str[str.length-1]].offset;
    for (let char of str) {
        res += chars[char].shift;
    }
    return res;
}

function drawTextMask(msg) {
    // setup text
    let textTags = "";
    let msg_split = msg.split("#");
    for (let i = 0; i < msg_split.length; i++) {
        let _text_x_offset = Math.floor(160 - stringWidth(msg_split[i])/2) - Math.floor(msg_split[i].length/2);
        let y_offset = (16 / msg_split.length) - 1;
        let tx = _text_x_offset;
        let ty = y_offset + (i * 16);
        let txt = msg_split[i];
        let kern = 1;
        let tox = tx;
        for (let char of txt) {
            if (["\n", "#"].includes(char)) {
                ty += charHeight;
                tx = tox;
            } else {
                let x_offset = 0;
                if (char === "L") {
                    x_offset = 1;
                }
                textTags += `<text x="${tx + x_offset}" y="${ty + svgTextYDiff}" fill="white">${char}</text>`;
                tx += chars[char].shift;
                tx += kern;
            }
        }
    }
    let content = `<mask id="textMask" mask-type="alpha"><style>@font-face{font-family:"fnt_legend";src:url("fnt/fnt_legend.ttf");}text{font-family:"fnt_legend";font-size: ${charHeight}px;}</style>${textTags}</mask><g mask="url(#textMask)">${Surfaces.get(currentSurface).content}</g>`;
    Surfaces.get(currentSurface).content = content;
    Surfaces.get(currentSurface).maskId += 1;
}



//////////////////// MAIN SCRIPT ////////////////////
const releaseDateTime = releaseDate.getTime();
const secondsMs = 1000;
const minutesMs = secondsMs * 60;
const hoursMs = minutesMs * 60;
const daysMs = hoursMs * 24;

function calcTime() {
    let currentDate = (new Date()).getTime();
    let timeLeft = releaseDateTime - currentDate;
    let daysLeft = Math.floor(timeLeft / daysMs);
    let hoursLeft = Math.floor((timeLeft-daysLeft*daysMs) / hoursMs)
    let minutesLeft = Math.floor((timeLeft-daysLeft*daysMs-hoursLeft*hoursMs) / minutesMs);
    let secondsLeft = Math.floor((timeLeft-daysLeft*daysMs-hoursLeft*hoursMs-minutesLeft*minutesMs) / secondsMs);
    if (announced) {
        msg = `${daysLeft}:${(hoursLeft+100).toString().substring(1)}:${(minutesLeft+100).toString().substring(1)}:${(secondsLeft+100).toString().substring(1)}`;
    } else {
        let percentage = `${Math.round((100/daysLeft)*Math.pow(10,6))/Math.pow(10,6)}`;
        let integerPart = percentage.split(".")[0];
        let decimalPart = percentage.split(".")[1] !== undefined ? percentage.split(".")[1] : "";
        while (decimalPart.length < 6) {
            decimalPart += "0";
        }
        msg = `${daysLeft} left.`;
    }
    msg = msg.toUpperCase();
}

let siner = 0;
let image_alpha = 0;

function step() {
    let propblue = "#42D0FF";
    let tilespr = "spr/IMAGE_DEPTH_EXTEND_MONO_SEAMLESS.png";
    let tiletex = "spr/IMAGE_DEPTH_EXTEND_SEAMLESS.png";
    let spr_pxwhite = "spr/spr_pxwhite.png";
    let spr_gradient20 = "spr/spr_gradient20.png"
    let textwidth = 320;
    let width = 150;
    let height = 90;
    let ysin = Math.cos(siner / 12) * 4;
    image_alpha = lerp(image_alpha, 1.2, 0.1);
    if (!surfaceExists("surf0")) {
        surfaceCreate("surf0", textwidth, height);
    }
    if (!surfaceExists("surf1")) {
        surfaceCreate("surf1", width, height);
    }
    if (!surfaceExists("surf2")) {
        surfaceCreate("surf2", width, height);
    }

    // draw the icon centered in the surface
    let img_icon_sprite = Assets.get(icon_sprite).img;
    surfaceSetTarget("surf0");
    gpuSetBlend("normal");
    drawSpriteTiledExtended(tilespr, Math.ceil(siner / 2), Math.ceil(siner / 2), 1, 1, propblue, 1);
    addMaskExtended(icon_sprite, Math.floor((width - img_icon_sprite.width) / 2), 28, 1, 1, 0);

    // draw the background with the fading edges
    let linecol = mergeColor("#8BE9EF", "#17EDFF", 0.5 + (Math.sin(siner / 120) * 0.5));
    let gradalpha = 1;
    surfaceSetTarget("surf1");
    drawSpriteTiledExtended(tiletex, Math.ceil(-siner / 2), Math.ceil(-siner / 2), 1, 1, linecol, gradalpha);
    var gradcol = "#000000";
    let img_grad = Assets.get(spr_gradient20).img;
    gpuSetBlend("multiply");
    drawSpriteExtended(spr_gradient20, 0, 0, width / 20, -3, 0, gradcol, gradalpha);
    drawSpriteExtended(spr_gradient20, 0, height - img_grad.height*3, width / 20, 3, 0, gradcol, gradalpha);
    drawSpriteExtended(spr_gradient20, 0, 0, height / 20, 3, 90, gradcol, gradalpha);
    drawSpriteExtended(spr_gradient20, width - img_grad.height*3, 0, height / 20, 3, -90, gradcol, gradalpha);

    // place the icons
    surfaceSetTarget("surf2");
    gpuSetBlend("screen");
    surfaceDrawExtended("surf0", 0, 0, 1, 1, 0, "#FFFFFF", 1);
    surfaceDrawExtended("surf0", 0, 0, 1, 1, 0, "#FFFFFF", 1);
    surfaceDrawExtended("surf0", 0, 0, 1, 1, 0, "#FFFFFF", 1);

    // draw text
    gpuSetBlend("normal");
    surfaceSetTarget("surf0");
    drawClearAlpha("#00FFFF", 1);
    drawSpriteTiledExtended(tiletex, Math.ceil(siner / 2), Math.ceil(siner / 2), 1, 1, "#FFFFFF", 0.6);
    drawTextMask(msg);

    // put the shi on the application surface
    let textYOffset = -8 * msg.split("#").length;
    surfaceSetTarget("applicationSurface");
    surfaceDrawExtended("surf1", (textwidth - width)/2, (240 - height)/2 + ysin, 1, 1, 0, "#FFFFFF", image_alpha);
    for (let  i=1; i<3; i++) {
        surfaceDrawExtended("surf2", (textwidth - width)/2 + (ysin * i), (240 - height)/2 + (ysin * i), 1, 1, 0, "#FFFFFF", image_alpha / 4);
    }
    surfaceDrawExtended("surf2", (textwidth - width)/2, (240 - height)/2 + ysin, 1, 1, 0, "#FFFFFF", image_alpha);
    gpuSetBlend("screen");
    surfaceDrawExtended("surf0", 0, (240 - height)/2 + ysin + textYOffset, 1, 1, 0, "#FFFFFF", image_alpha);
    surfaceDrawExtended("surf0", 0, (240 - height)/2 + ysin + textYOffset, 1, 1, 0, "#FFFFFF", image_alpha);

    // draw the application surface
    drawApplicationSurfaceExtended(Math.floor((window.visualViewport.width - 640)/2), Math.floor((window.visualViewport.height - 480)/2), 2, 2);

    // clean all the shi
    surfaceClear("surf0");
    surfaceClear("surf1");
    surfaceClear("surf2");
    surfaceClear("applicationSurface");

    // update the shi
    siner += 1;
}

function main() {
    let interval = setInterval(step, 1000/30);
    interval = setInterval(calcTime, 1000/30);
}






//////////////////// LOADING SCRIPTS ////////////////////
async function getBase64(path) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path);
        xhr.responseType = "blob";
        xhr.onload = function () {
            const reader = new FileReader();
            reader.readAsDataURL(xhr.response);
            reader.onloadend = function () {
                resolve(reader.result);
            }
        }
        xhr.send();
    })
        .then((value) => {return value;})
        .catch(() => {console.error(`Error reading file "${path}".`)});
}

async function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = function(event) {
            resolve(event.target);
        }
    })
        .then((value) => {return value;})
        .catch(() => {console.error(`Error reading image "${path}".`)});
}

async function load() {
    for (let path of Paths) {
        let data;
        switch (path.split("/")[0]) {
            case "spr": {
                let img = await loadImage(path);
                let base64 = await getBase64(path);
                data = {"img": img, "base64": base64};
                break;
            }
            default: {
                let base64 = await getBase64(path);
                data = {"base64": base64};
                break;
            }
        }
        Assets.set(path, data);
    }
    main();
}

document.addEventListener("DOMContentLoaded", load);