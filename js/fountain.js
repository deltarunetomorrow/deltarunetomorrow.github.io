let animSiner = 0;
let bgSiner = 0;
const waveHeight = 240;
const waveWidth = 320;
let bgAlpha = 0;
const scale = window.visualViewport.height / waveHeight;
const bgMagnitude = 6;
let images = new Map();
let canvas = document.createElement("canvas");
canvas.width = waveWidth * scale;
canvas.height = waveHeight * scale;
canvas.style.display.imageRendering = "pixelated";
canvas.style.position = "absolute";
canvas.style.top = "0px";
canvas.style.left = `${(window.visualViewport.width - canvas.width)/2}px`;
canvas.style.zIndex = 1;
let ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.imageSmoothingEnabled = false;
let canvasBg = document.createElement("canvas");
canvasBg.width = (window.visualViewport.width - canvas.width)/2;
canvasBg.height = visualViewport.height;
canvasBg.style.position = "absolute";
canvasBg.style.top = "0px";
canvasBg.style.left = "0px";
canvasBg.style.zIndex = -1;
let ctxBg = canvasBg.getContext("2d");
ctxBg.fillStyle = "black";
ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);
ctxBg.imageSmoothingEnabled = false;
let canvasBg2 = document.createElement("canvas");
canvasBg2.width = (window.visualViewport.width - canvas.width)/2;
canvasBg2.height = visualViewport.height;
canvasBg2.style.position = "absolute";
canvasBg2.style.top = "0px";
canvasBg2.style.left = `${visualViewport.width - canvasBg2.width}px`;
canvasBg2.style.zIndex = -1;
let ctxBg2 = canvasBg2.getContext("2d");
ctxBg2.fillStyle = "black";
ctxBg2.clearRect(0, 0, canvasBg.width, canvasBg.height);
ctxBg2.imageSmoothingEnabled = false;
let p = document.createElement("p");
let fontSize = 16 * scale;
let fountainCol = "#004fdf";
let fountainCol2 = "#00c5fe"
p.style.fontFamily = "fnt_main";
p.style.fontSize = `${fontSize}px`;
p.style.position = "absolute";
p.style.width = `${visualViewport.width}px`;
p.style.textAlign = "center";
p.style.left = "0px";
p.style.zIndex = 4;
p.style.color = fountainCol;
let p2 = document.createElement("p");
p2.style.fontFamily = "fnt_main";
p2.style.fontSize = `${fontSize}px`;
p2.style.position = "absolute";
p2.style.width = `${visualViewport.width}px`;
p2.style.textAlign = "center";
p2.style.left = "0px";
p2.style.zIndex = 3;
p2.style.color = fountainCol2;
let prevTime = null;
const vHeight = visualViewport.height;

function loopStepAnim() {
    let timeNow = calcTime().timeLeft;
    if (timeNow !== prevTime) {
        prevTime = timeNow;
        p.innerText = timeNow;
        p2.innerText = timeNow;
    }
    if (bgAlpha < 0.5) {
        bgAlpha += (0.04 - (bgAlpha/14));
    }
    if (bgAlpha > 0.5) {
        bgAlpha = 0.5;
    }
    for (let i = 0; i < waveHeight - 50; i++) {
        let waveMag = 0;
        let waveMinus = bgMagnitude * (i / waveHeight) * 1.3;
        if (waveMinus <= bgMagnitude) {
            waveMag = bgMagnitude - waveMinus;
        }
        let x = Math.sin((i/8) + (bgSiner/30)) * waveMag;
        let y = -10 + i - bgAlpha * 20;
        drawSpritePart("spr/IMAGE_MENU.png", 0, i, waveWidth, 1, x, y, bgAlpha * 0.8);
        drawSpritePart("spr/IMAGE_MENU.png", 0, i, waveWidth, 1, -x, y, bgAlpha * 0.8);
    }
    let subImg1 = parseInt(Math.floor((animSiner / 12) % 5));
    let subImg2 = parseInt(Math.floor((animSiner / 12 + 0.4) % 5));
    let subImg3 = parseInt(Math.floor((animSiner / 12 + 0.8) % 5));
    drawSprite(`spr/IMAGE_MENU_ANIMATION_${subImg1}.png`, 0, 10 - bgAlpha*20 + waveHeight - 70, bgAlpha * 0.46);
    drawSprite(`spr/IMAGE_MENU_ANIMATION_${subImg2}.png`, 0, 10 - bgAlpha*20 + waveHeight - 70, bgAlpha * 0.56);
    drawSprite(`spr/IMAGE_MENU_ANIMATION_${subImg3}.png`, 0, 10 - bgAlpha*20 + waveHeight - 70, bgAlpha * 0.7);
    drawSpriteBg("spr/IMAGE_MENU_bg.png", 0, 10 - bgAlpha*20 + waveHeight - 70, bgAlpha * 0.46);
    drawSpriteBg("spr/IMAGE_MENU_bg.png", 0, 10 - bgAlpha*20 + waveHeight - 70, bgAlpha * 0.56);
    drawSpriteBg("spr/IMAGE_MENU_bg.png", 0, 10 - bgAlpha*20 + waveHeight - 70, bgAlpha * 0.7);
    p.style.top = `${(vHeight - fontSize*2)/2 + (10 - bgAlpha*20 + Math.sin(bgSiner / 12)) * scale}px`;
    p2.style.top = `${(vHeight - fontSize*2)/2 + (10 - bgAlpha*20 + Math.sin(bgSiner / 12) + 1) * scale}px`;
    animSiner += 1;
    bgSiner += 1;
}

function drawSpritePart(spr, left, top, width, height, x, y, alpha) {
    let image = images.get(spr);
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, left, top, width, height, x * scale, y * scale, width * scale, height * scale);
}

function drawSprite(spr, x, y, alpha) {
    let image = images.get(spr);
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x * scale, y * scale, image.width * scale, image.height * scale);
}

function drawSpriteBg(spr, x, y, alpha) {
    let image = images.get(spr);
    ctxBg.globalAlpha = alpha;
    ctxBg.drawImage(image, x, y * scale, canvasBg.width, image.height * scale);
    ctxBg2.globalAlpha = alpha;
    ctxBg2.drawImage(image, x, y * scale, canvasBg2.width, image.height * scale);
}

let paths = ["spr/IMAGE_MENU.png", "spr/IMAGE_MENU_bg.png"];
for (let i = 0; i < 5; i++) {
    paths.push(`spr/IMAGE_MENU_ANIMATION_${i}.png`);
}

function main() {
    document.body.appendChild(canvasBg);
    document.body.appendChild(canvasBg2);
    document.body.appendChild(canvas);
    document.body.appendChild(p2);
    document.body.appendChild(p);
    new Promise((resolve, reject) => {
        let loaded = 0;
        let goal = paths.length;
        for (let path of paths) {
            let img = new Image();
            img.src = path;
            img.onload = function () {
                images.set(path, img);
                loaded += 1;
                if (loaded >= goal) {
                    resolve();
                }
            }
            img.onerror = function () {
                reject();
            }
        }
    })
        .then(() => {setInterval(loopStepAnim, 1000/30);})
        .catch((err) => {console.error(err);});
}

document.addEventListener("DOMContentLoaded", main);
