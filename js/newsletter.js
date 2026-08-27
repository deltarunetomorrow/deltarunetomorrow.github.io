"use strict";

// INSERT DATA
const oldNewsletter = "/newsletters/summer26/";
// INSERT DATA

const originalWidth = 640;
const originalHeight = 480;
const margin = 8;
const extraBorder = 8;
const border = 6;
const textMarginTop = 14;
const textMarginLeft = 20;
const textMarginBottom = 22;
const textInterline = 4;
const charWidth = 16;
const charHeight = 32;
const svgTextY = 26;

let dw_animation = 0;
let darkzone = 1;
let files = new Map();
let prevMsg = null;
let prevViewport = null;
let changed = true;
let dark_boxes = [];

let backgroundColor = "black";
let isThere = false;
let redirects = [oldNewsletter];

function parseHTML(str) {
    let tmp = document.implementation.createHTMLDocument();
    tmp.body.outerHTML = str;
    return tmp;
}

function calcViewport() {
    let vWidth = window.visualViewport.width;
    let vHeight = window.visualViewport.height;
    let scale = 1;
    while (originalWidth * scale <= vWidth && originalHeight * scale <= vHeight) {
        scale += 1;
    }
    scale = scale>1 ? scale-1 : scale;
    let trueWidth = originalWidth * scale;
    let trueHeight = originalHeight * scale;
    let leftPosition = Math.floor((vWidth-trueWidth) / 2);
    let topPosition = Math.floor((vHeight-trueHeight) / 2);
    return {"scale": scale, "width": trueWidth, "height": trueHeight, "left": leftPosition, "top": topPosition};
}

async function newsletter() {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let htmlString = xhttp.responseText;
                let htmlDoc = parseHTML(htmlString);
                let newsletterLink = htmlDoc.body.childNodes[1].childNodes[1].childNodes[5].childNodes[1].href;
                if (oldNewsletter === newsletterLink) {
                    backgroundColor = "red";
                } else {
                    isThere = true;
                    backgroundColor = "green";
                    redirects[0] = `https://toby.fangamer.com${newsletterLink}`;
                }
                document.body.style.backgroundColor = backgroundColor;
                resolve([backgroundColor, isThere, redirects]);
            }
        };
        xhttp.open("GET", "https://toby.fangamer.com/newsletters/", true);
        xhttp.send();
    })
        .then((value) => {return value;})
        .catch(`Error while fetching latest newsletter data.`);
}

function displayInfo(viewport, msg) {
    let x = margin;
    let y = originalHeight/2 + charHeight*2 - svgTextY*2;
    let defs = "";
    let addedDefs = [];
    let info = "";
    let style = "";
    let redno = 0;
    for (let i=0; i < msg.length; i++) {
        let mystring = msg[i].text;
        switch(msg[i].type) {
            case "big": {
                x = Math.floor((originalWidth-(mystring.length*charWidth*2)) / 2);
                if (darkzone === 1) {
                    if (!addedDefs.includes(msg[i].color)) {
                        defs += `<linearGradient id="${msg[i].color.substring(1)}" x1="0%" x2="0%" y1="100%" y2="0%">
                                    <stop offset="0%" stop-color="${msg[i].color}"></stop>
                                    <stop offset="100%" stop-color="#FFFFFF"></stop>
                                </linearGradient>`;
                        addedDefs.push(msg[i].color);
                    }
                    info += `<text fill="url(#shadow)" style="font-size: ${charHeight*2 * viewport.scale}px;" x="${(x + 1) * viewport.scale}" y="${(y + 1) * viewport.scale}">${mystring}</text><text fill="url(${msg[i].color})" style="font-size: ${charHeight*2 * viewport.scale}px;" x="${x * viewport.scale}" y="${y * viewport.scale}">${mystring}</text>`;
                } else {
                    info += `<text fill="${msg[i].color}" style="font-size: ${charHeight*2 * viewport.scale}px;" x="${x * viewport.scale}" y="${y * viewport.scale}">${mystring}</text>`;
                }
                break;
            }
            case "sourcebig": {
                x = Math.floor((originalWidth-(mystring.length*charWidth*2)) / 2);
                info += `<a href="${redirects[redno]}" target="_blank">`;
                if (darkzone === 1) {
                    if (!addedDefs.includes(msg[i].color)) {
                        defs += `<linearGradient id="${msg[i].color.substring(1)}" x1="0%" x2="0%" y1="100%" y2="0%">
                                    <stop offset="0%" stop-color="${msg[i].color}"></stop>
                                    <stop offset="100%" stop-color="#FFFFFF"></stop>
                                </linearGradient>`;
                        addedDefs.push(msg[i].color);
                    }
                    if (!addedDefs.includes(msg[i].hoverColor)) {
                        defs += `<linearGradient id="${msg[i].hoverColor.substring(1)}" x1="0%" x2="0%" y1="100%" y2="0%">
                                    <stop offset="0%" stop-color="${msg[i].hoverColor}"></stop>
                                    <stop offset="100%" stop-color="#FFFFFF"></stop>
                                </linearGradient>`;
                        addedDefs.push(msg[i].hoverColor);
                    }
                    style += `<style>#source${i}{fill:url("${msg[i].color}")}#source${i}:hover{fill:url("${msg[i].hoverColor}")}</style>`;
                    info += `<text fill="url(#shadow)" style="font-size: ${charHeight*2 * viewport.scale}px;" x="${(x + 1) * viewport.scale}" y="${(y + 1) * viewport.scale}">${mystring}</text><text id="source${i}" style="font-size: ${charHeight*2 * viewport.scale}px;" x="${x * viewport.scale}" y="${y * viewport.scale}">${mystring}</text>`;
                } else {
                    style += `<style>#source${i}{fill:${msg[i].color}}#source${i}:hover{fill:${msg[i].hoverColor}}</style>`;
                    info += `<text id="source${i}" style="font-size: ${charHeight*2 * viewport.scale}px;" x="${x * viewport.scale}" y="${y * viewport.scale}">${mystring}</text>`;
                }
                info += "</a>";
                break;
            }
            default: break;
        }
    }
    defs += "</defs>";
    return defs + style + info;
}

async function display() {
    let value = await newsletter();
    backgroundColor = value[0];
    isThere = value[1];
    redirects = value[2];
    let viewport = calcViewport();
    let msg = [
        {"text": "NO", "type": "big", "color": "#FFFFFF"}
    ];
    if (isThere) {
        msg = [
            {"text": "YES", "type": "sourcebig", "color": "#FFFFFF", "hoverColor": "#FFFF00"}
        ];
    }
    if (prevMsg !== null) {
        changed = false;
        for (let i = 0; i < prevMsg.length; i++) {
            if (prevMsg[i].text !== msg[i].text) {
                changed = true;
                break;
            }
        }
    }
    if (prevViewport !== null) {
        let keys = ["scale", "width", "height", "left", "top"];
        for (let i = 0; i < keys.length; i++) {
            if (prevViewport[keys[i]] !== viewport[keys[i]]) {
                changed = true;
                break;
            }
        }
    }
    let currentSvg = document.getElementById("content");
    if (currentSvg !== null) {
        if (darkzone === 1) {
            for (let i = 0; i < dark_boxes.length; i++) {
                let db = dark_boxes[i];
                document.getElementById(`darkbox${i+1}`).outerHTML = create_msgbox_dark(db.x1, db.y1, db.x2, db.y2, db.scale, i+1);
            }
            dw_animation += 0.1;
            if (dw_animation >= 8.0) {
                dw_animation = 0;
            }
        } else {
            dw_animation = 0;
        }
    }
    if (changed) {
        dark_boxes = [];
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" id="content" width="${viewport.width}" height="${viewport.height}" style="position: absolute; top: ${viewport.top}px; left: ${viewport.left}px;">
        <style>@font-face {font-family: "fnt_main"; src: url("${files.get("fnt/fnt_main.ttf").base64}");} text {font-family: "fnt_main";}</style>
        <rect x="0" y="0" width="${viewport.width}" height="${viewport.height}" fill="${backgroundColor}"></rect>
        <defs>
            <linearGradient id="shadow" x1="0%" x2="0%" y1="100%" y2="0%">
                <stop offset="0%" stop-color="#000080"></stop>
                <stop offset="100%" stop-color="#404040"></stop>
            </linearGradient>`;
        svg += displayInfo(viewport, msg);
        svg += "</svg>";
        document.getElementById("screen").innerHTML = svg;
        prevMsg = msg;
        prevViewport = viewport;
    }
}

function main() {
    let interval = setInterval(display, 1000/30);
}

let paths = ["fnt/fnt_main.ttf"];

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
    for (let path of paths) {
        let data = {};
        if (path.startsWith("spr")) {
            let img = await loadImage(path);
            data["image"] = img;
        }
        let base64 = await getBase64(path);
        data["base64"] = base64;
        files.set(path, data)
    }
    main();
}

document.addEventListener("DOMContentLoaded", load);