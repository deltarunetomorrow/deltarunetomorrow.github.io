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
let currentBlend = "source-over";
let currentSurface = applicationSurface;
let currentFont = "fnt_legend"

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


/////////////////////////////////////// TEXT SCRIPTS ///////////////////////////////////////
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

const preRendered = new Map();
let textwidth = 320;
let width = 150;
let height = 90;
let siner = 0;
let image_alpha = 0;

function drawIconTexture() {
    let tilespr = assets.get("spr/IMAGE_DEPTH_EXTEND_MONO_SEAMLESS.png");
    let tilespr_canvas = new OffscreenCanvas(tilespr.width, tilespr.height);
    let tilespr_ctx = tilespr_canvas.getContext("2d");
    tilespr_ctx.fillStyle = "#42D0FF";
    tilespr_ctx.fillRect(0, 0, tilespr.width, tilespr.height);
    tilespr_ctx.globalCompositeOperation = "multiply";
    tilespr_ctx.drawImage(tilespr, 0, 0);
    let res = new OffscreenCanvas(tilespr.width, tilespr.height);
    let ctx = res.getContext("2d");
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(tilespr_canvas, 0, 0);
    ctx.drawImage(tilespr_canvas, 0, 0);
    ctx.drawImage(tilespr_canvas, 0, 0);
    return res;
}

function drawTextTexture() {
    let tiletex = assets.get("spr/IMAGE_DEPTH_EXTEND_SEAMLESS.png");
    let tiletex_canvas = new OffscreenCanvas(tiletex.width, tiletex.height);
    let tiletex_ctx = tiletex_canvas.getContext("2d");
    tiletex_ctx.fillStyle = "#00FFFF";
    tiletex_ctx.fillRect(0, 0, tiletex.width, tiletex.height);
    tiletex_ctx.globalAlpha = 0.6;
    tiletex_ctx.drawImage(tiletex, 0, 0);
    let res = new OffscreenCanvas(tiletex.width, tiletex.height);
    let ctx = res.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(tiletex_canvas, 0, 0);
    ctx.drawImage(tiletex_canvas, 0, 0);
    return res;
}

function drawGradient() {
    let spr_gradient20 = "spr/spr_gradient20.png";
    let img_grad = assets.get(spr_gradient20);
    currentSurface = new OffscreenCanvas(width, height);
    drawSpriteExtended(spr_gradient20, 0, 0, width / 20, -3, 0, "#000000", 1);
    drawSpriteExtended(spr_gradient20, 0, 0 + height - img_grad.height*3, width / 20, 3, 0, "#000000", 1);
    drawSpriteExtended(spr_gradient20, 0, 0, height / 20, 3, 90, "#000000", 1);
    drawSpriteExtended(spr_gradient20, width - img_grad.height*3, 0, height / 20, 3, -90, "#000000", 1);
    res = currentSurface;
    currentSurface = applicationSurface;
    return res;
}

function drawPattern(img, x, y, rectWidth, rectHeight) {
    let res = new OffscreenCanvas(rectWidth, rectHeight);
    let ctx = res.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    let width = img.width;
    let height = img.height;
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
    while (yy < rectHeight) {
        xx = xx_start;
        while (xx < rectWidth) {
            ctx.drawImage(img, xx, yy);
            xx += width;
        }
        yy += height;
    }
    return res;
}

function renderTextures() {
    let iconTexture = drawIconTexture();
    let textTexture = drawTextTexture();
    let gradient = drawGradient();
    preRendered.set("iconTexture", iconTexture);
    preRendered.set("textTexture", textTexture);
    preRendered.set("gradient", gradient);
}

function drawIcon() {
    let iconTexture = preRendered.get("iconTexture");
    let icon = assets.get(icon_sprite);
    let res = drawPattern(iconTexture, Math.ceil(siner/2), Math.ceil(siner/2), width, height);
    let ctx = res.getContext("2d");
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(icon, Math.floor((width - icon.width)/2), Math.floor((width - icon.width)/2));
    return res;
}

function drawFog() {
    let linecol = mergeColor("#8BE9EF", "#17EDFF", 0.5 + (Math.sin(siner/120) * 0.5));
    let tiletex = assets.get("spr/IMAGE_DEPTH_EXTEND_SEAMLESS.png");
    let tiletex_canvas = new OffscreenCanvas(tiletex.width, tiletex.height);
    let tiletex_ctx = tiletex_canvas.getContext("2d");
    tiletex_ctx.fillStyle = linecol;
    tiletex_ctx.fillRect(0, 0, tiletex.width, tiletex.height);
    tiletex_ctx.globalCompositeOperation = "multiply";
    tiletex_ctx.drawImage(tiletex, 0, 0);
    let res = drawPattern(tiletex_canvas, Math.ceil(-siner/2), Math.ceil(-siner/2), width, height);
    let grad = preRendered.get("gradient");
    let ctx = res.getContext("2d");
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(grad, 0, 0);
    return res;
}

function drawText() {
    let text_surf = new OffscreenCanvas(currentSurface.width, currentSurface.height);
    let fontGlyphs = Fonts["fnt_legend"];
    let fontLegend = assets.get("fnt/fnt_legend.png");
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
                let charSpr = fontGlyphs[char];
                text_ctx.drawImage(fontLegend, charSpr.left, charSpr.top, charSpr.width,  charSpr.height, tx + x_offset, ty, charSpr.width, charSpr.height);
                tx += charSpr.shift;
                tx += kern;
            }
        }
    }
    let textTexture = preRendered.get("textTexture");
    let res = drawPattern(textTexture, 0, 0, textwidth, height);
    let ctx = res.getContext("2d");
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(text_surf, 0, 0);
    return res;
}

let ctx = applicationSurface.getContext("2d");

function drawFrame() {
    ctx.clearRect(0, 0, applicationSurface.width, applicationSurface.height);
    let ysin = Math.cos(siner/12)*4;
    image_alpha = lerp(image_alpha, 1.2, 0.1);
    let icon = drawIcon();
    let fog = drawFog();
    let text = drawText();
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = image_alpha / 4;
    let textYOffset = 16 * msg.split("#").length;
    for (let  i=1; i<3; i++) {
        ctx.drawImage(icon, (applicationSurface.width - width*2)/2 + (ysin * i*2), (applicationSurface.height - height)/2 + +ysin + (ysin * i*2) -textYOffset*2, width*2, height*2);
    }
    ctx.globalAlpha = image_alpha >= 1? 1 : image_alpha;
    ctx.drawImage(icon, (applicationSurface.width - width*2)/2, (applicationSurface.height - height)/2 + ysin -textYOffset*2, width*2, height*2);
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(fog, (applicationSurface.width - width*2)/2, (applicationSurface.height - height)/2 + ysin -textYOffset*2, width*2, height*2);
    ctx.drawImage(text, 0, (applicationSurface.height - height)/2 + ysin - textYOffset*2 -28, applicationSurface.width, height*2);
    siner += 1;
}

function main() {
    renderTextures();
    let interval = setInterval(function() {
        let _start = (new Date()).getTime();
        calcTime();
        drawFrame();
        let duration = (new Date()).getTime() - _start
        if (duration >= 1000/33) {
            console.log("/////////////////////////// YO ///////////////////////////");
        } else {
            console.log(duration);
        }
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
        assets.set(path, img);
    }
    main();
}

document.addEventListener("DOMContentLoaded", function() {
    applicationSurface.style.position = "absolute";
    applicationSurface.style.top = `${(window.visualViewport.height - applicationSurface.height)/2}px`;
    applicationSurface.style.left = `${(window.visualViewport.width - applicationSurface.width)/2}px`;
    document.body.appendChild(applicationSurface);
    loadImages();
});