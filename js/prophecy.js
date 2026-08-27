const assets = new Map();
const paths = [
    "spr/IMAGE_DEPTH_EXTEND_MONO_SEAMLESS.png",
    "spr/IMAGE_DEPTH_EXTEND_SEAMLESS.png",
    "spr/spr_dw_church_prophecy_initial2_icon.png",
    "spr/spr_pxwhite.png",
    "spr/spr_gradient20.png",
    "fnt/fnt_legend.png"
];

const applicationSurface = document.createElement("canvas");
applicationSurface.width = 640;
applicationSurface.height = 480;

/////////////////////////////////////// INSERT DATA HERE ///////////////////////////////////////
let icon_sprite = "spr/spr_dw_church_prophecy_initial2_icon.png";
const releaseDate = new Date(2027, 11, 31, 23, 59, 59);
const announced = false;
let msg = " ";
/////////////////////////////////////// INSERT DATA HERE ///////////////////////////////////////



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


/////////////////////////////////////// COLOR SCRIPTS ///////////////////////////////////////
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


/////////////////////////////////////// DRAWING SCRIPTS ///////////////////////////////////////
const Surfaces = new Map([["applicationSurface", applicationSurface]]);
let currentBlend = "normal";
let currentSurface = applicationSurface;
let currentFont = "fnt_legend";
let currentColour = "#FFFFFF";
let currentAlpha = 1;
let currentHAlign = "left";
let currentVAlign = "top";
let currentTarget = "applicationSurface";

function surfaceExists(name) {
    return Surfaces.has(name);
}

function surfaceCreate(name, width, height) {
    let _surf = new OffscreenCanvas(width, height);
    Surfaces.set(name, _surf);
}

function surfaceClear(name) {
    if (!surfaceExists(name)) {
        console.error(`Unknown surface "${name}".`);
        return null;
    }
    let _surf = Surfaces.get(name);
    _surf.getContext("2d").clearRect(0, 0, _surf.width, _surf.height);
}

function surfaceSetTarget(name) {
    if (!surfaceExists(name)) {
        console.error(`Unknown surface "${name}".`);
        return null;
    }
    currentSurface = Surfaces.get(name);
    currentTarget = name;
}

function drawSetBlend(name) {
    switch(name) {
        case "normal": {
            currentBlend = "source-over";
            break;
        }
        case "add": {
            currentBlend = "lighter";
            break;
        }
        case "mask": {
            currentBlend = "destination-in";
            break;
        }
        case "multiply": {
            currentBlend = "multiply";
            break;
        }
        default: {
            console.error(`Unknown blend mode "${name}".`);
            break;
        }
    }
}

function rotate(point, rad) {
    let matrix = [[Math.cos(rad), Math.sin(rad)], [-Math.sin(rad), Math.cos(rad)]];
    let newPoint = [];
    for (let row of matrix) {
        newPoint.push(row[0]*point[0] + row[1]*point[1]);
    }
    return newPoint;
}

function calcRotationTranslation(width, height, rot) {
    let box = {"topLeft": [0, 0], "topRight": [width, 0], "bottomRight": [width, height], "bottomLeft": [0, height]};
    let rad = -(rot * Math.PI)/180;
    box.topRight = rotate(box.topRight, rad);
    box.bottomRight = rotate(box.bottomRight, rad);
    box.bottomLeft = rotate(box.bottomLeft, rad);
    return {"x": -Math.min(box.topLeft[0], box.topRight[0], box.bottomRight[0], box.bottomLeft[0]), "y": -Math.min(box.topLeft[1], box.topRight[1], box.bottomRight[1], box.bottomLeft[1]), "width": Math.max(box.topLeft[0], box.topRight[0], box.bottomRight[0], box.bottomLeft[0]) - Math.min(box.topLeft[0], box.topRight[0], box.bottomRight[0], box.bottomLeft[0]), "height": Math.max(box.topLeft[1], box.topRight[1], box.bottomRight[1], box.bottomLeft[1]) - Math.min(box.topLeft[1], box.topRight[1], box.bottomRight[1], box.bottomLeft[1])};
}

function drawSpriteExtended(sprite, x, y, xscale, yscale, rot, colour, alpha) {
    let img = assets.get(sprite);
    let width = Math.abs(img.width * xscale);
    let height = Math.abs(img.height * yscale);
    let rotationTranslate = calcRotationTranslation(width, height, rot);
    let canvas_spr = new OffscreenCanvas(rotationTranslate.width, rotationTranslate.height);
    let spr_ctx = canvas_spr.getContext("2d");
    spr_ctx.imageSmoothingEnabled = false;
    spr_ctx.translate(rotationTranslate.x, rotationTranslate.y);
    spr_ctx.rotate(rot * Math.PI/180);
    spr_ctx.scale(xscale, yscale);
    spr_ctx.translate(xscale<0?(1/xscale*width):0, yscale<0?(1/yscale*height):0);
    if (colour !== "#FFFFFF") {
        spr_ctx.fillStyle = colour;
        spr_ctx.fillRect(0, 0, rotationTranslate.width, rotationTranslate.height);
        spr_ctx.globalCompositeOperation = "multiply";
        spr_ctx.drawImage(img, 0, 0);
        spr_ctx.globalCompositeOperation = "destination-in";
    }
    spr_ctx.drawImage(img, 0, 0);
    let _surf_ctx = currentSurface.getContext("2d");
    _surf_ctx.imageSmoothingEnabled = false;
    _surf_ctx.globalCompositeOperation = currentBlend;
    _surf_ctx.globalAlpha = alpha;
    _surf_ctx.drawImage(canvas_spr, x, y);
}

function drawSurfaceExtended(name, x, y, xscale, yscale, rot, colour, alpha) {
    let img = Surfaces.get(name);
    let width = Math.abs(img.width * xscale);
    let height = Math.abs(img.height * yscale);
    let rotationTranslate = calcRotationTranslation(width, height, rot);
    let canvas_spr = new OffscreenCanvas(rotationTranslate.width, rotationTranslate.height);
    let spr_ctx = canvas_spr.getContext("2d");
    spr_ctx.imageSmoothingEnabled = false;
    spr_ctx.translate(rotationTranslate.x, rotationTranslate.y);
    spr_ctx.rotate(rot * Math.PI/180);
    spr_ctx.scale(xscale, yscale);
    spr_ctx.translate(xscale<0?(xscale*width):0, yscale<0?(yscale*height):0);
    if (colour !== "#FFFFFF") {
        spr_ctx.fillStyle = colour;
        spr_ctx.fillRect(0, 0, rotationTranslate.width, rotationTranslate.height);
        spr_ctx.globalCompositeOperation = "multiply";
        spr_ctx.drawImage(img, 0, 0);
        spr_ctx.globalCompositeOperation = "destination-in";
    }
    spr_ctx.drawImage(img, 0, 0);
    let _surf_ctx = currentSurface.getContext("2d");
    _surf_ctx.imageSmoothingEnabled = false;
    _surf_ctx.globalCompositeOperation = currentBlend;
    if (alpha >= 1) {
        alpha = 1;
    }
    _surf_ctx.globalAlpha = alpha;
    _surf_ctx.drawImage(canvas_spr, x, y);
}

function drawSpriteTiledExtended(sprite, x, y, xscale, yscale, colour, alpha) {
    let spr = assets.get(sprite);
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
    while (yy < currentSurface.height) {
        while(xx < currentSurface.width) {
            drawSpriteExtended(sprite, xx, yy, xscale, yscale, 0, colour, alpha);
            xx += width;
        }
        yy += height;
        xx = xx_start;
    }
}

function drawClearAlpha(colour, alpha) {
    let _col = hexToRgb(colour);
    let _ctx = currentSurface.getContext("2d");
    _ctx.fillStyle = `rgb(${_col.red} ${_col.green} ${_col.blue} / ${alpha*100}%)`;
    _ctx.globalCompositeOperation = "copy";
    _ctx.fillRect(0, 0, currentSurface.width, currentSurface.height);
    _ctx.globalCompositeOperation = currentBlend;
}


/////////////////////////////////////// TEXT SCRIPTS ///////////////////////////////////////
function drawSetFont(font) {
    if (Fonts[font] === undefined) {
        console.error(`Unknown font "${font}".`);
        return null;
    }
    currentFont = font;
}

function stringWidth(str) {
    let _strw_lines = str.split("\n");
    let _strw_res = 0;
    for (let _strw_line of _strw_lines) {
        let _strw_temp = 0;
        let _chars = Fonts[currentFont];
        for (let _strw_char of _strw_line) {
            _strw_temp += _chars[_strw_char].shift;
        }
        if (_strw_temp > _strw_res) {
            _strw_res = _strw_temp;
        }
    }
    return _strw_res;
}

function getChar(ch) {
    let _fnt_char = Fonts[currentFont][ch];
    let _fnt_canvas = assets.get(`fnt/${currentFont}.png`);
    let _fnt_char_canvas = new OffscreenCanvas(_fnt_char.width, _fnt_char.height);
    let _char_data = _fnt_canvas.getImageData(_fnt_char.left, _fnt_char.top, _fnt_char.width, _fnt_char.height);
    _fnt_char_canvas.getContext("2d").putImageData(_char_data, 0, 0);
    return _fnt_char_canvas;
}












/////////////////////////////////////// MAIN SCRIPT ///////////////////////////////////////
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
        msg = `${daysLeft} left.`;
    }
    msg = msg.toUpperCase();
}

let textwidth = 320;
let width = 150;
let height = 90;
let siner = 0;
let image_alpha = 0;

function drawTextLegend(msg) {
    let text_surf = new OffscreenCanvas(currentSurface.width, currentSurface.height);
    let text_ctx = text_surf.getContext("2d");
    let msg_split = msg.split("#");
    for (let i = 0; i < msg_split.length; i++) {
        let _text_x_offset = Math.floor((textwidth - stringWidth(msg_split[i]))/2) - Math.floor(msg_split[i].length/2);
        let y_offset = (16 / msg_split.length) - 1;
        let tx = _text_x_offset;
        let ty = y_offset + (i * 16);
        let txt = msg_split[i];
        let kern = 1;
        let tox = tx;
        for (let char of txt) {
            if (["\n", "#"].includes(char)) {
                ty += 16;
                tx = tox;
            } else {
                let x_offset = 0;
                if (char === "L") {
                    x_offset = 1;
                }
                let char_spr = getChar(char);
                text_ctx.drawImage(char_spr, tx + x_offset, ty);
                tx += Fonts["fnt_legend"][char].shift;
                tx += kern;
            }
        }
    }
    let _ctx = currentSurface.getContext("2d");
    _ctx.globalCompositeOperation = "destination-in";
    _ctx.drawImage(text_surf, 0, 0);
    _ctx.globalCompositeOperation = currentBlend;
}

function draw() {
    surfaceClear("applicationSurface");
    let propblue = "#42D0FF";
    let tilespr = "spr/IMAGE_DEPTH_EXTEND_MONO_SEAMLESS.png";
    let tiletex = "spr/IMAGE_DEPTH_EXTEND_SEAMLESS.png";
    let spr_gradient20 = "spr/spr_gradient20.png";
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
    surfaceSetTarget("surf0");
    drawSetBlend("normal");
    drawSpriteTiledExtended(tilespr, Math.ceil(siner/2), Math.ceil(siner/2), 1, 1, propblue, 1);
    drawSetBlend("mask");
    let img_icon_sprite = assets.get(icon_sprite);
    drawSpriteExtended(icon_sprite, Math.floor((width - img_icon_sprite.width) / 2), 28, 1, 1, 0, "#FFFFFF", 1);
    drawSetBlend("normal");
    let linecol = mergeColor("#8BE9EF", "#17EDFF", 0.5 + (Math.sin(siner/120) * 0.5));
    surfaceSetTarget("surf2");
    drawSpriteTiledExtended(tiletex, Math.ceil(-siner/2), Math.ceil(siner/2), 1, 1, linecol, 1);
    drawSetBlend("multiply");
    let img_grad = assets.get(spr_gradient20);
    drawSpriteExtended(spr_gradient20, 0, 0, width / 20, -3, 0, "#000000", 1);
    drawSpriteExtended(spr_gradient20, 0, 0 + height - img_grad.height*3, width / 20, 3, 0, "#000000", 1);
    drawSpriteExtended(spr_gradient20, 0, 0, height / 20, 3, 90, "#000000", 1);
    drawSpriteExtended(spr_gradient20, width - img_grad.height*3, 0, height / 20, 3, -90, "#000000", 1);
    surfaceSetTarget("surf1");
    drawSetBlend("add");
    drawSurfaceExtended("surf0", 0, 0, 1, 1, 0, "#FFFFFF", 1);
    drawSurfaceExtended("surf0", 0, 0, 1, 1, 0, "#FFFFFF", 1);
    drawSurfaceExtended("surf0", 0, 0, 1, 1, 0, "#FFFFFF", 1);
    drawSetBlend("normal");
    surfaceSetTarget("surf0"),
    drawClearAlpha("#00FFFF", 1);
    drawSpriteTiledExtended(tiletex, Math.ceil(siner/2), Math.ceil(siner/2), 1, 1, "#FFFFFF", 0.6);
    drawTextLegend(msg);
    let textYOffset = 16 * msg.split("#").length;
    surfaceSetTarget("applicationSurface");
    for (let  i=1; i<3; i++) {
        drawSurfaceExtended("surf1", (applicationSurface.width - width*2)/2 + (ysin * i*2), (applicationSurface.height - height)/2 + (ysin * i*2) -textYOffset*2, 2, 2, 0, "#FFFFFF", image_alpha / 4);
    }
    drawSurfaceExtended("surf1", (applicationSurface.width - width*2)/2, (applicationSurface.height - height)/2 + ysin -textYOffset*2, 2, 2, 0, "#FFFFFF", image_alpha);
    drawSetBlend("add");
    drawSurfaceExtended("surf2", (applicationSurface.width - width*2)/2, (applicationSurface.height - height)/2 + ysin -textYOffset*2, 2, 2, 0, "#FFFFFF", image_alpha);
    drawSurfaceExtended("surf0", 0, (applicationSurface.height - height)/2 + ysin - textYOffset*2 -28, 2, 2, 0, "#FFFFFF", image_alpha);
    drawSurfaceExtended("surf0", 0, (applicationSurface.height - height)/2 + ysin - textYOffset*2 -28, 2, 2, 0, "#FFFFFF", image_alpha);
    surfaceClear("surf0");
    surfaceClear("surf1");
    siner += 1;
}

function main() {
    let interval = setInterval(function() {
        // let _start = (new Date()).getTime();
        calcTime();
        draw();
        /*
        let duration = (new Date()).getTime() - _start
        if (duration >= 1000/33) {
            console.log("/////////////////////////// YO ///////////////////////////");
        } else {
            console.log(duration);
        }
        */
    }, 1000/30);
}













/////////////////////////////////////// LOADER SCRIPTS ///////////////////////////////////////
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

async function loadImages() {
    for (let path of paths) {
        let img = await loadImage(path);
        if (path.startsWith("fnt")) {
            let _fnt_canvas = new OffscreenCanvas(img.width, img.height);
            let _fnt_ctx = _fnt_canvas.getContext("2d");
            _fnt_ctx.drawImage(img, 0, 0);
            img = _fnt_canvas.getContext("2d");
        }
        assets.set(path, img);
    }
    main();
}

document.addEventListener("DOMContentLoaded", function() {
    document.body.appendChild(applicationSurface);
    loadImages();
});