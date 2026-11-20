"use strict";

import { BoxDark } from "./box.js";
import { textCenter } from "./writer.js";

// Set paths to load sprites or music
const assets = new Map();
let paths = ["fnt/fnt_main.ttf", "spr/spr_textbox_left.png", "spr/spr_textbox_top.png", "spr/down.png", "spr/down_trig.png"];
for (let i = 0; i < 8; i++) {
    paths.push(`spr/spr_textbox_topleft_${i}.png`);
}

// Calculate application surface and measurements
const gameWidth = 640;
const gameHeight = 480;
const vWidth = visualViewport.width;
const vHeight = visualViewport.height;
const scale = (vWidth >= gameWidth && vHeight >= gameHeight) ? Math.min(~~(vWidth/gameWidth), ~~(vHeight/gameHeight)) : 0.5;
const appSurf = document.createElement("div");
appSurf.style.width = `${gameWidth}px`;
appSurf.style.height = `${gameHeight}px`;
appSurf.style.position = "absolute";
appSurf.style.top = `${~~((vHeight - gameHeight)/2)}px`;
appSurf.style.left = `${~~((vWidth - gameWidth)/2)}px`;
appSurf.style.scale = scale;
appSurf.style.imageRendering = "pixelated";
appSurf.style.margin = "0px";

const measures = {
    "topBoxPosition": {
        "top": 16,
        "left": 38
    },
    "bottomBoxPosition": {
        "top": 320,
        "left": 38
    },
    "facePosition": {
        "top": 24,
        "left": 36
    },
    "boxHeight": 139,
    "boxWidth": 565,
    "boxTextLeftMargin": 136,
    "boxTextTopMargin": 14,
    "textVerticalSpace": 36,
    "textFontHeight": 32,
    "textInterline": 4,
    "textHorizontalSpace": 16,
    "facelessBoxTextLeftMargin": 20,
    "textYOffset": 26,
    "borderSize": 6,
    "extraBorderSize": 8
};

const timeLeftURL = "/fountain";

// Main function
function main() {
    document.body.appendChild(appSurf);
    let div = document.createElement("div");
    div.id = "download";
    div.addEventListener("click", saveImage);
    div.style.position = "absolute";
    div.style.bottom = `${measures.topBoxPosition.top + measures.boxTextTopMargin}px`;
    div.style.right = `${2 + measures.extraBorderSize + measures.borderSize + measures.facelessBoxTextLeftMargin}px`;
    div.style.width = `${assets.get("spr/down.png").width}px`;
    div.style.height = `${assets.get("spr/down.png").height}px`;
    let style = `<style>#download{background:url(spr/down.png)}#download:hover{background:url(spr/down_trig.png);cursor:pointer}</style>`;
    appSurf.appendChild(div);
    document.head.innerHTML += style;

    let y1 = measures.topBoxPosition.top + measures.boxTextTopMargin;
    let y2 = y1 + measures.textFontHeight + 4*2;
    let y3 = y2 + measures.textFontHeight*2 + 4*2;
    let y4 = y3 + measures.textFontHeight*2 + 4*2 + measures.borderSize + measures.extraBorderSize + measures.boxTextTopMargin;
    let y5 = y4 + measures.textFontHeight + measures.borderSize + measures.extraBorderSize + measures.boxTextTopMargin;
    let y6 = y5 + measures.textFontHeight + 4*2;
    let y7 = y6 + measures.textFontHeight + 4*2;

    let prevTextes = null;
    let prevBoxes = null;
    let changeText = true;
    let changeBoxes = true;

    let renderedBoxes = null;

    setInterval(function () {
        let time = calcTime();

        let textes = [
            {"spans": [{"text": "There is a", "color": "#FFFFFF", "scale": 1}], "y": y1},
            {"spans": [{"text": time.chance, "color": "#FFFF00", "scale": 2}], "y": y2},
            {"spans": [{"text": "chance of ", "color": "#FFFFFF", "scale": 1}, {"text": "DELTARUNE Chapter 6", "color": "#FFFFFF", "scale": 1, "url": "https://deltarune.com", "hoverColor": "#0000FF"}, {"text": " being released tomorrow.", "color": "#FFFFFF", "scale": 1}], "y": y3},
            {"spans": [{"text": time.timeLeft, "color": "#FF0000", "scale": 1, "url": timeLeftURL, "hoverColor": "#00FFFF"}], "y": y4},
            {"spans": [{"text": `FURTHEST DATE: Dec. 31st, 2027`, "color": "#FF8800", "scale": 1}], "y": y5},
            {"spans": [{"text": "Source: ", "color": "#FFFFFF", "scale": 1}, {"text": "Summer 2026 Newsletter", "color": "#FFFFFF", "scale": 1, "url": time.redirect, "hoverColor": "#00FF00"}], "y": y6},
            {"spans": [{"text": "(Is there a new Newsletter?)", "color": "#FFFFFF", "scale": 1, "url": "/newsletter", "hoverColor": "#FF00FF"}], "y": y7}
        ];

        changeText = prevTextes === null;
        if (!changeText) {
            changeText = textes[3].spans[0].text !== prevTextes[3].spans[0].text;
        }

        // assuming the second box only contains one line of text
        let boxes = [
            {"x": 2 + measures.borderSize + measures.extraBorderSize, "y": 2 + measures.borderSize + measures.extraBorderSize, "width": gameWidth - 2*(2 + measures.borderSize + measures.extraBorderSize), "height": gameHeight - 2*(2 + measures.borderSize + measures.extraBorderSize)},
            {"x": ~~((gameWidth - (textes[3].spans[0].text.length * measures.textHorizontalSpace * textes[3].spans[0].scale))/2) - measures.facelessBoxTextLeftMargin, "y": y4 - measures.boxTextTopMargin, "width": (textes[3].spans[0].text.length * measures.textHorizontalSpace * textes[3].spans[0].scale) + measures.facelessBoxTextLeftMargin*2, "height": measures.textFontHeight * textes[3].spans[0].scale + measures.boxTextTopMargin*2}
        ];

        changeBoxes = prevBoxes === null;
        if (!changeBoxes) {
            changeBoxes = (boxes[1].x !== prevBoxes[1].x) || (boxes[1].y !== prevBoxes[1].y) || (boxes[1].width !== prevBoxes[1].width) || (boxes[1].height !== prevBoxes[1].height);
        }

        if (changeBoxes) {
            if (renderedBoxes !== null) {
                for (let box of renderedBoxes) {
                    BoxDark.destroy(box);
                }
            } else {
                renderedBoxes = [];
            }
            for (let i = 0; i < boxes.length; i++) {
                let box = boxes[i];
                renderedBoxes[i] = new BoxDark(box.x, box.y, box.width, box.height);
            }
            prevBoxes = boxes;
        }

        if (changeText) {
            for (let i = 0; i < textes.length; i++) {
                textCenter(textes[i].spans, 0, textes[i].y, gameWidth, i);
            }
            prevTextes = structuredClone(textes);
        }

        document.getElementById("step").reset();
    }, 1000/30);
}

// Save image as canvas
function saveImage() {
    let canvas = document.createElement("canvas");
    canvas.height = gameHeight;
    canvas.width = gameWidth;
    let ctx = canvas.getContext("2d");
    for (let cnv of appSurf.querySelectorAll("canvas")) {
        ctx.drawImage(cnv, parseInt(cnv.style.left.replace("px", "")), parseInt(cnv.style.top.replace("px", "")));
    }
    for (let svg of appSurf.querySelectorAll("svg")) {
        let y = parseInt(svg.style.top.replace("px", ""));
        for (let text of svg.querySelectorAll("text")) {
            let x = parseInt(text.getAttribute("x"))
            let off = parseInt(text.getAttribute("y"));
            ctx.font = text.style.font;
            let svgLG = appSurf.querySelector(text.getAttribute("fill").substring("4", text.getAttribute("fill").length - 1));
            let fontSize = parseInt(text.style.font.substring(0, text.style.font.indexOf("px")))
            let lg = ctx.createLinearGradient(0, y + off - measures.textYOffset*(fontSize/32) + fontSize, 0, y + off - measures.textYOffset*(fontSize/32));
            for (let stop of svgLG.querySelectorAll("stop")) {
                lg.addColorStop(parseFloat(stop.getAttribute("offset").replace("%", ""))/100, stop.getAttribute("stop-color"));
            }
            ctx.fillStyle = lg;
            let msg = (text.querySelector("a") !== null ? text.querySelector("a").innerHTML : text.innerHTML).replaceAll("&nbsp;", " ");
            ctx.fillText(msg, x, y + off);
        }
    }
    let canvas2 = document.createElement("canvas");
    canvas2.height = gameHeight * 2;
    canvas2.width = gameWidth * 2;
    let ctx2 = canvas2.getContext("2d");
    ctx2.imageSmoothingEnabled = false;
    ctx2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
    let a = document.createElement("a");
    a.href = canvas2.toDataURL();
    a.download = `image.png`
    a.click();
}

// Load assets
async function load() {
    return new Promise((resolve, reject) => {
        let count = 0;
        let goal = paths.length;
        for (let path of paths) {
            let __tmp = path.indexOf("/")
            switch (path.substring(0, __tmp)) {
                case "spr": {
                    let img = new Image();
                    img.src = path;
                    img.onload = function () {
                        assets.set(path, img);
                        count += 1;
                        if (count >= goal) {
                            resolve();
                        }
                    }
                    break;
                }
                case "fnt": {
                    let name = path.substring(__tmp + 1).replace(".ttf", "");
                    let fnt = new FontFace(name, `url(${path})`);
                    fnt.load().then(() => {
                        let fontFace = `<style>@font-face{font-family:"${name}";src:url("${path}");}</style>`;
                        document.head.innerHTML += fontFace;
                        count += 1;
                        if (count >= goal) {
                            resolve();
                        }
                    });
                    break;
                }
                default: break;
            }
        }
    })
        .then(main)
        .catch((err) => { console.error(err); });
}

document.addEventListener("DOMContentLoaded", load);

export { assets, appSurf, measures, scale, gameHeight, gameWidth, timeLeftURL };