"use strict";

// INSERT DATA HERE
const releaseDate = new Date(2027, 11, 31, 23, 59, 59);
const redirects = ["https://toby.fangamer.com/newsletters/summer26/#:~:text=I%20believe%20we%20will%20be%20able%20to%20release%20Chapter%206%20in%202027", "newsletter.html"];
const announced = false;
const nextChapter = 6;
// INSERT DATA HERE

const releaseDateTime = releaseDate.getTime();
const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
const secondsMs = 1000;
const minutesMs = secondsMs * 60;
const hoursMs = minutesMs * 60;
const daysMs = hoursMs * 24;

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

let tooSmall = true;
let dw_animation = 0;
let darkzone = 0;
let files = new Map();
let prevMsg = null;
let prevViewport = null;
let prevDarkzone = 0;
let changed = true;
let dark_boxes = [];

let prevXPos = 0;
let prevYPos = 0;
let a = {"u": 0, "d": 0, "l": 0, "r": 0};
let xpos = 0;
let ypos = 0;
let sxpos = 32;
let sypos = -64;
let activated = false;

function parseHTML(str) {
    const template = document.createElement('template');
    template.innerHTML = str.trim();
    return template.content.firstChild;
}

function calcViewport() {
    let vWidth = window.visualViewport.width;
    let vHeight = window.visualViewport.height;
    let scale = 0.5;
    darkzone = 0;
    if (vWidth >= originalWidth && vHeight >= originalHeight) {
        scale = 1;
        darkzone = 1;
        tooSmall = false;
        while (originalWidth * scale <= vWidth && originalHeight * scale <= vHeight) {
            scale += 1;
        }
        scale = scale>1 ? scale-1 : scale;
    }
    let trueWidth = originalWidth * scale;
    let trueHeight = originalHeight * scale;
    let leftPosition = Math.floor((vWidth-trueWidth) / 2);
    let topPosition = Math.floor((vHeight-trueHeight) / 2);
    return {"scale": scale, "width": trueWidth, "height": trueHeight, "left": leftPosition, "top": topPosition};
}

let viewport = calcViewport();

function calcTime() {
    let currentDate = (new Date()).getTime();
    let timeLeft = releaseDateTime - currentDate;
    let daysLeft = Math.floor(timeLeft / daysMs);
    let hoursLeft = Math.floor((timeLeft-daysLeft*daysMs) / hoursMs)
    let minutesLeft = Math.floor((timeLeft-daysLeft*daysMs-hoursLeft*hoursMs) / minutesMs);
    let secondsLeft = Math.floor((timeLeft-daysLeft*daysMs-hoursLeft*hoursMs-minutesLeft*minutesMs) / secondsMs);
    if (announced) {
        return {
            "chance": daysLeft===1.0?"100.000000%":"0.000000%",
            "timeLeft": `${daysLeft}:${(hoursLeft+100).toString().substring(1)}:${(minutesLeft+100).toString().substring(1)}:${(secondsLeft+100).toString().substring(1)}`
        };
    } else {
        let percentage = `${Math.round((100/daysLeft)*Math.pow(10,6))/Math.pow(10,6)}`;
        let integerPart = percentage.split(".")[0];
        let decimalPart = percentage.split(".")[1] !== undefined ? percentage.split(".")[1] : "";
        while (decimalPart.length < 6) {
            decimalPart += "0";
        }
        return {
            "chance": `${integerPart}.${decimalPart}%`,
            "timeLeft": `${daysLeft} left.`
        };
    }
}

function getOrdinal(number) {
    if (number.toString().endsWith("1") && !(number.toString().endsWith("11"))) {
        return `${number}st`;
    } else if (number.toString().endsWith("2") && !(number.toString().endsWith("12"))) {
        return `${number}nd`;
    } else if (number.toString().endsWith("3") && !(number.toString().endsWith("13"))) {
        return `${number}rd`;
    } else {
        return `${number}th`;
    }
}

function create_msgbox_light(x1, y1, x2, y2, scale, makeInnerbox) {
    if (makeInnerbox === undefined || makeInnerbox === null || makeInnerbox) {
        return `<rect fill="white" height="${y2-y1 + border*2*scale}" width="${x2-x1 + border*2*scale}" y="${y1 - border*scale}" x="${x1 - border*scale}"/><rect fill="black" height="${y2 - y1}" width="${x2 - x1}" y="${y1}" x="${x1}"/>`;
    } else {
        return `<rect fill="white" height="${y2-y1 + border*2*scale}" width="${x2-x1 + border*2*scale}" y="${y1 - border*scale}" x="${x1 - border*scale}"/>`;
    }
}

function create_msgbox_dark(x1, y1, x2, y2, scale, box_id, makeInnerbox) {
    let spr_textbox_topleft_obj = files.get(`spr/spr_textbox_topleft_${Math.floor(dw_animation)}.png`);
    let spr_textbox_top_obj = files.get("spr/spr_textbox_top.png");
    let spr_textbox_left_obj = files.get("spr/spr_textbox_left.png");
    let spr_textbox_topleft = spr_textbox_topleft_obj.image;
    let spr_textbox_top = spr_textbox_top_obj.image;
    let spr_textbox_left = spr_textbox_left_obj.image;
    let spr_textbox_topleft_base64 = spr_textbox_topleft_obj.base64;
    let spr_textbox_top_base64 = spr_textbox_top_obj.base64;
    let spr_textbox_left_base64 = spr_textbox_left_obj.base64;
    let innerbox = "";
    if (makeInnerbox === undefined || makeInnerbox === null || makeInnerbox) {
        innerbox = `<rect fill="black" height="${y2 - y1 - 4*scale}" width="${x2 - x1}" y="${y1 + 2*scale}" x="${x1}"/>`;
    }
    let topleft_left_position = x1 - 7*2*scale;
    let topleft_top_position = y1 - 7*2*scale;
    let topright_left_position = x2 - 9*2*scale;
    let topright_top_position = y1 - 7*2*scale;
    let bottomright_top_position = y2 - 9*2*scale;
    let bottomright_left_position = x2 - 9*2*scale;
    let bottomleft_top_position = y2 - 9*2*scale;
    let bottomleft_left_position = x1 - 7*2*scale;
    let corner_width = spr_textbox_topleft.width*2*scale;
    let corner_height = spr_textbox_topleft.height*2*scale;
    let corners = `<image href="${spr_textbox_topleft_base64}" width="${corner_width}px" height="${corner_height}px" x="${topleft_left_position}" y="${topleft_top_position}" style="image-rendering: pixelated;" transform="scale(1,1) translate(0,0)"/><image href="${spr_textbox_topleft_base64}" width="${corner_width}px" height="${corner_height}px" x="${topright_left_position}" y="${topright_top_position}" style="image-rendering: pixelated;" transform="scale(-1,1) translate(-${topright_left_position*2+corner_width},0)"/><image href="${spr_textbox_topleft_base64}" width="${corner_width}px" height="${corner_height}px" x="${bottomright_left_position}" y="${bottomright_top_position}" style="image-rendering: pixelated;" transform="scale(-1,-1) translate(-${bottomright_left_position*2+corner_width},-${bottomright_top_position*2+corner_height})"/><image href="${spr_textbox_topleft_base64}" width="${corner_width}px" height="${corner_height}px" x="${bottomleft_left_position}" y="${bottomleft_top_position}" style="image-rendering: pixelated;" transform="scale(1,-1) translate(0,-${bottomleft_top_position*2+corner_height})"/>`;
    let top_top_position = y1 - 7*2*scale;
    let top_left_position = x1 + 9*2*scale;
    let left_top_position = y1 + 9*2*scale;
    let left_left_position = x1 - 7*2*scale;
    let right_top_position = y1 + 9*2*scale;
    let right_left_position = x2 - 9*2*scale;
    let bottom_top_position = y2 - 9*2*scale;
    let bottom_left_position = x1 + 9*2*scale;
    let horizontal_border_width = x2-x1 - 9*2*2*scale;
    let horizontal_border_height = spr_textbox_top.height *2*scale;
    let vertical_border_height = y2-y1 - 9*2*2*scale;
    let vertical_border_width = spr_textbox_left.width*2*scale;
    let sides = `<image href="${spr_textbox_top_base64}" width="${horizontal_border_width}" height="${horizontal_border_height}" x="${top_left_position}" y="${top_top_position}" style="image-rendering: pixelated;" transform="scale(1,1) translate(0,0)" preserveAspectRatio="none"/><image href="${spr_textbox_top_base64}" width="${horizontal_border_width}" height="${horizontal_border_height}" x="${bottom_left_position}" y="${bottom_top_position}" preserveAspectRatio="none" style="image-rendering: pixelated;" transform="scale(1,-1) translate(0,-${bottom_top_position*2+horizontal_border_height})"/><image href="${spr_textbox_left_base64}" preserveAspectRatio="none" width="${vertical_border_width}" height="${vertical_border_height}" x="${left_left_position}" y="${left_top_position}" style="image-rendering: pixelated;" transform="scale(1,1) translate(0,0)"/><image href="${spr_textbox_left_base64}" preserveAspectRatio="none" width="${vertical_border_width}" height="${vertical_border_height}" x="${right_left_position}" y="${right_top_position}" style="image-rendering: pixelated;" transform="scale(-1,1) translate(-${right_left_position*2+vertical_border_width},0)"/>`;
    return `<g id="darkbox${box_id}">` + innerbox + corners + sides + "</g>";
}

function displayInfo(viewport, msg) {
    let x = margin;
    let y = margin;
    let defs = "";
    let addedDefs = [];
    let info = "";
    let style = "";
    let redno = 0;
    for (let i=0; i < msg.length; i++) {
        let mystring = msg[i].text;
        switch(msg[i].type) {
            case "normal": {
                y += margin + svgTextY;
                x = Math.floor((originalWidth-(mystring.length*charWidth)) / 2);
                let mystringSliced = null;
                let prevChar = null;
                let prevString = null;
                let prevX = null;
                let xx = [];
                let mystrings = [];
                if (x < 0) {
                    let curChar = 0;
                    while(mystring.indexOf(" ", curChar) !== -1) {
                        prevChar = curChar;
                        prevString = mystring.substring(0,prevChar);
                        curChar = mystring.indexOf(" ", curChar)+1;
                        mystringSliced = mystring.substring(0,curChar);
                        prevX = x;
                        x = Math.floor((originalWidth-(mystringSliced.length*charWidth)) / 2);
                        if (x < 0) {
                            xx.push(prevX + charWidth/2);
                            mystrings.push(prevString);
                            mystring = mystring.slice(prevChar);
                        }
                    }
                    x = Math.floor((originalWidth-(mystring.length*charWidth)) / 2);
                }
                xx.push(x);
                mystrings.push(mystring);
                if (darkzone === 1) {
                    if (!addedDefs.includes(msg[i].color)) {
                        defs += `<linearGradient id="${msg[i].color.substring(1)}" x1="0%" x2="0%" y1="100%" y2="0%">
                                    <stop offset="0%" stop-color="${msg[i].color}"></stop>
                                    <stop offset="100%" stop-color="#FFFFFF"></stop>
                                </linearGradient>`;
                        addedDefs.push(msg[i].color);
                    }
                    for (let j=0; j<xx.length; j++) {
                        info += `<text fill="url(#shadow)" style="font-size: ${charHeight * viewport.scale}px;" x="${(xx[j] + 1) * viewport.scale}" y="${(y + 1) * viewport.scale}">${mystrings[j]}</text><text fill="url(${msg[i].color})" style="font-size: ${charHeight * viewport.scale}px;" x="${xx[j] * viewport.scale}" y="${y * viewport.scale}">${mystrings[j].replace(`DELTARUNE Chapter ${nextChapter}`, `<a href="https://deltarune.com" target="_blank"><tspan id="deltaruneRedirectDark">DELTARUNE Chapter ${nextChapter}</tspan></a>`)}</text>`;
                        y += textInterline + charHeight;
                    }
                    y -= textInterline + charHeight;
                } else {
                    for (let j=0; j<xx.length; j++) {
                        info += `<text fill="${msg[i].color}" style="font-size: ${charHeight * viewport.scale}px;" x="${xx[j] * viewport.scale}" y="${y * viewport.scale}">${mystrings[j].replace(`DELTARUNE Chapter ${nextChapter}`, `<a href="https://deltarune.com" target="_blank"><tspan id="deltaruneRedirectLight">DELTARUNE Chapter ${nextChapter}</tspan></a>`)}</text>`;
                        y += textInterline + charHeight;
                    }
                    y -= textInterline + charHeight;
                }
                y += - svgTextY + charHeight + margin;
                x = margin;
                break;
            }
            case "redirect": {
                y += margin + svgTextY;
                x = Math.floor((originalWidth-(mystring.length*charWidth)) / 2);
                let mystringSliced = null;
                let prevChar = null;
                let prevString = null;
                let prevX = null;
                let xx = [];
                let mystrings = [];
                if (x < 0) {
                    let curChar = 0;
                    while(mystring.indexOf(" ", curChar) !== -1) {
                        prevChar = curChar;
                        prevString = mystring.substring(0,prevChar);
                        curChar = mystring.indexOf(" ", curChar)+1;
                        mystringSliced = mystring.substring(0,curChar);
                        prevX = x;
                        x = Math.floor((originalWidth-(mystringSliced.length*charWidth)) / 2);
                        if (x < 0) {
                            xx.push(prevX + charWidth/2);
                            mystrings.push(prevString);
                            mystring = mystring.slice(prevChar);
                        }
                    }
                    x = Math.floor((originalWidth-(mystring.length*charWidth)) / 2);
                }
                xx.push(x);
                mystrings.push(mystring);
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
                    for (let j=0; j<xx.length; j++) {
                        info += `<text fill="url(#shadow)" style="font-size: ${charHeight * viewport.scale}px;" x="${(xx[j] + 1) * viewport.scale}" y="${(y + 1) * viewport.scale}">${mystrings[j]}</text><text id="source${i}" style="font-size: ${charHeight * viewport.scale}px;" x="${xx[j] * viewport.scale}" y="${y * viewport.scale}">${mystrings[j]}</text>`;
                        y += textInterline + charHeight;
                    }
                    y -= textInterline + charHeight;
                } else {
                    style += `<style>#source${i}{fill:${msg[i].color}}#source${i}:hover{fill:${msg[i].hoverColor}}</style>`;
                    for (let j=0; j<xx.length; j++) {
                        info += `<text id="source${i}" style="font-size: ${charHeight * viewport.scale}px;" x="${xx[j] * viewport.scale}" y="${y * viewport.scale}">${mystrings[j]}</text>`;
                        y += textInterline + charHeight;
                    }
                    y -= textInterline + charHeight;
                }
                y += - svgTextY + charHeight + margin;
                x = margin;
                info += "</a>";
                redno += 1;
                break;
            }
            case "big": {
                y += margin + svgTextY*2;
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
                y += - svgTextY*2 + charHeight*2 + margin;
                x = margin;
                break;
            }
            case "boxed": {
                y += extraBorder + border + textMarginTop + svgTextY;
                x = Math.floor((originalWidth - (extraBorder*2 + border*2 + textMarginLeft*2 + mystring.length*charWidth)) / 2) + extraBorder + border + textMarginLeft;
                let box;
                if (darkzone === 1) {
                    let location = {"x1": (x-textMarginLeft)*viewport.scale, "y1": (y-svgTextY-textMarginTop)*viewport.scale, "x2": (x+mystring.length*charWidth+textMarginLeft)*viewport.scale, "y2": (y-svgTextY+charHeight+textMarginBottom)*viewport.scale, "scale": viewport.scale};
                    dark_boxes.push(location);
                    box = create_msgbox_dark(location.x1, location.y1, location.x2, location.y2, location.scale, dark_boxes.length);
                    if (!addedDefs.includes(msg[i].color)) {
                        defs += `<linearGradient id="${msg[i].color.substring(1)}" x1="0%" x2="0%" y1="100%" y2="0%">
                                    <stop offset="0%" stop-color="${msg[i].color}"></stop>
                                    <stop offset="100%" stop-color="#FFFFFF"></stop>
                                </linearGradient>`;
                        addedDefs.push(msg[i].color);
                    }
                    info += box + `<text fill="url(#shadow)" style="font-size: ${charHeight * viewport.scale}px;" x="${(x + 1) * viewport.scale}" y="${(y + 1) * viewport.scale}">${mystring}</text><text fill="url(${msg[i].color})" style="font-size: ${charHeight * viewport.scale}px;" x="${x * viewport.scale}" y="${y * viewport.scale}">${mystring}</text>`;
                } else {
                    box = create_msgbox_light((x-textMarginLeft)*viewport.scale, (y-textMarginTop-svgTextY)*viewport.scale, (x+mystring.length*charWidth+textMarginLeft)*viewport.scale, (y-svgTextY+charHeight+textMarginBottom)*viewport.scale, viewport.scale);
                    info += box + `<text fill="${msg[i].color}" style="font-size: ${charHeight * viewport.scale}px;" x="${x * viewport.scale}" y="${y * viewport.scale}">${mystring}</text>`;
                }
                y += - svgTextY + charHeight + textMarginBottom + border + extraBorder;
                x = margin;
                break;
            }
            default: break;
        }
    }
    defs += "</defs>";
    return defs + style + info;
}

function display() {
    if(!activated) {
        viewport = calcViewport();
    }
    let time = calcTime();
    let msg = [
        {"text": "There is a", "type": "normal", "color": "#FFFFFF"},
        {"text": time.chance, "type": "big", "color": "#FFFF00"},
        {"text": `chance of DELTARUNE Chapter ${nextChapter} being released tomorrow.`, "type": "normal", "color": "#FFFFFF"},
        {"text": time.timeLeft, "type": "boxed", "color": "#FF0000"},
        {"text": announced ? `${months[releaseDate.getMonth()]} ${getOrdinal(releaseDate.getDate())}, ${releaseDate.getFullYear()} ${(releaseDate.getHours()+100).toString().substring(1)}:${(releaseDate.getMinutes()+100).toString().substring(1)}:${(releaseDate.getSeconds()+100).toString().substring(1)}` : `FURTHEST DATE: ${months[releaseDate.getMonth()]} ${getOrdinal(releaseDate.getDate())}, ${releaseDate.getFullYear()}`, "type": "normal", "color": "#FFA040"},
        {"text": "Source: Summer 2026 Newsletter", "type": "redirect", "color": "#FFFFFF", "hoverColor": "#00FFFF"},
        {"text": "(Is there a new Newsletter?)", "type": "redirect", "color": "#FFFFFF", "hoverColor": "#FF00FF"}
    ];
    if (prevMsg !== null || prevViewport !== null) {
        changed = false;
    }
    if (prevDarkzone !== darkzone) {
        changed = true;
    }
    if (prevXPos !== xpos || prevYPos !== ypos) {
        changed = true;
    }
    if (prevMsg !== null) {
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
    if (darkzone === 1) {
        document.getElementById("box").innerHTML = `<svg width="${window.visualViewport.width}" height="${window.visualViewport.height}" style="position: absolute; top: 0px; left: 0px">`+create_msgbox_dark(viewport.left - border*viewport.scale + xpos, viewport.top - border*viewport.scale + ypos, viewport.left + viewport.width + border*viewport.scale + xpos, viewport.top + viewport.height + border*viewport.scale + ypos, viewport.scale, 0, false)+`</svg>`;
    } else {
        document.getElementById("box").innerHTML = `<svg width="${window.visualViewport.width}" height="${window.visualViewport.height}" style="position: absolute; top: 0px; left: 0px">`+create_msgbox_light(viewport.left - border*viewport.scale + xpos, viewport.top - border*viewport.scale + ypos, viewport.left + viewport.width + border*viewport.scale + xpos, viewport.top + viewport.height + border*viewport.scale + ypos, viewport.scale, true)+`</svg>`;
    }
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
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" id="content" width="${viewport.width}" height="${viewport.height}" style="position: absolute; top: ${viewport.top + ypos}px; left: ${viewport.left + xpos}px;">
        <style>@font-face {font-family: "fnt_main"; src: url("${files.get("fnt/fnt_main.ttf").base64}");} text {font-family: "fnt_main";}#deltaruneRedirectDark:hover{fill: url(#deltaRedirect)}#deltaruneRedirectLight:hover{fill:#0000FF}</style>
        <rect x="0" y="0" width="${viewport.width}" height="${viewport.height}" fill="black"></rect>
        <defs>
            <linearGradient id="shadow" x1="0%" x2="0%" y1="100%" y2="0%">
                <stop offset="0%" stop-color="#000080"></stop>
                <stop offset="100%" stop-color="#404040"></stop>
            </linearGradient>
            <linearGradient id="deltaRedirect" x1="0%" x2="0%" y1="100%" y2="0%">
                <stop offset="0%" stop-color="#0000FF"></stop>
                <stop offset="100%" stop-color="#FFFFFF"></stop>
            </linearGradient>`;
        svg += displayInfo(viewport, msg);
        svg += "</svg>";
        document.getElementById("screen").innerHTML = svg;
        prevMsg = msg;
        prevViewport = viewport;
    }
    prevXPos = xpos;
    prevYPos = ypos;
    prevDarkzone = darkzone;
}

function saveImage() {
    let svgNode = parseHTML(document.getElementById("content").outerHTML);
    svgNode.style = "";
    let svgString = (new XMLSerializer()).serializeToString(svgNode);
    let svg64 = btoa(svgString);
    let b64Start = "data:image/svg+xml;charset=utf-8;base64,";
    let image64 = b64Start + svg64;
    let image = new Image();
    image.width = svgNode.width.baseVal.value;
    image.height = svgNode.height.baseVal.value;
    image.src = image64;
    image.onload = function() {
        console.log("xd");
        let canvas = document.getElementById("screenshot");
        canvas.width = image.width;
        canvas.height = image.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        let imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let a = document.createElement("a");
        a.download = "screenshot.png";
        a.target = "_blank";
        a.href = imgURI;
        a.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: false,
            cancelable: true
        }));
    }
}

let phase = 0;
let w = false;
let r = false;

function movement() {
    if (!activated) {
        document.getElementById("icon").href = `favicon/favicon_${Math.floor(phase)}.ico`;
        if (a.d > 0 && phase < 31) {
            phase += 0.25;
        }
        if (a.u > 0 && phase > 0) {
            phase -= 0.25;
        }
        activated = phase === 31;
        viewport = calcViewport();
    } else {
        document.getElementById("icon").href = `favicon/favicon_${phase}.ico`;
        let spr_heart = files.get("spr/spr_heart.png").image;
        let spr_heart_height = spr_heart.height * viewport.scale;
        let spr_heart_width = spr_heart.width * viewport.scale;
        sxpos += (a.r - a.l) * viewport.scale;
        sypos += (a.d - a.u) * viewport.scale;
        document.getElementById("h").innerHTML = `<img src="spr/spr_heart.png" width="${spr_heart_width}" height="${spr_heart_height}" style="position: absolute; top: ${sypos}px; left: ${sxpos}px"/>`;
        let top = viewport.top - border*2*viewport.scale + ypos;
        let bottom = viewport.top + viewport.height + border*2*viewport.scale + ypos;
        let left = viewport.left - border*2*viewport.scale + xpos;
        let right = viewport.left + viewport.width + border*2*viewport.scale + xpos;
        let h_top = sypos;
        let h_bottom = sypos + spr_heart_height;
        let h_left = sxpos;
        let h_right = sxpos + spr_heart_width;
        if (h_right > left && h_left < left && h_bottom > top && h_top < bottom) {
            darkzone = 0;
            xpos = h_right - left + xpos;
            w = true;
        }
        else if (h_top < bottom && h_bottom > bottom && h_right > left && h_left < right)  {
            darkzone = 0;
            ypos = h_top - bottom + ypos;
            w = true;
        }
        else if (h_bottom > top && h_top < top && h_right > left && h_left < right) {
            darkzone = 0;
            ypos = h_bottom - top + ypos;
            w = true;
        }
        else if (h_right > right && h_left < right && h_bottom > top && h_top < bottom) {
            darkzone = 0;
            xpos = h_left - right + xpos;
            w = true;
        } else {
            darkzone = tooSmall? 0 : 1;
        }
        if (w && !r) {
            document.getElementById("title").innerText = "*";
            document.getElementById("saveImage").style.display = "none";
            r = true;
        }
        if (bottom + extraBorder*viewport.scale < 0 || right + extraBorder*viewport.scale < 0 || left - extraBorder*viewport.scale > window.visualViewport.width || top - extraBorder*viewport.scale > window.visualViewport.height) {
            createFade();
        }
    }
}

let fade_created = false;

function createFade() {
    if (!fade_created) {
        let fade = document.createElement('div');
        fade.id = "fade";
        fade.style.position = "absolute";
        fade.style.top = "0px";
        fade.style.left = "0px";
        fade.style.width = "100%";
        fade.style.height = "100%";
        fade.style.backgroundColor = "white";
        fade.style.opacity = 0.0;
        fade_created = true;
        document.body.appendChild(fade);
        let opacity = 0.0;
        let int = setInterval(function () { window.open("7b.html","_self"); }, 6666);
        int = setInterval(function () { opacity += 0.005; document.getElementById("fade").style.opacity = opacity; }, 1000/30);
    }
}

function main() {
    document.getElementById("saveImage").onclick = saveImage;
    let interval = setInterval(display, 1000/30);
    interval = setInterval(movement, 1000/30);
    document.onkeydown = function (event) {
        let c = event.code;
        if (c === "ArrowUp") {
            a.u = 3;
        }
        if (c === "ArrowDown") {
            a.d = 3;
        }
        if (c === "ArrowLeft") {
            a.l = 3;
        }
        if (c === "ArrowRight") {
            a.r = 3;
        }
    }
    document.onkeyup = function (event) {
        let c = event.code;
        if (c === "ArrowUp") {
            a.u = 0;
        }
        if (c === "ArrowDown") {
            a.d = 0;
        }
        if (c === "ArrowLeft") {
            a.l = 0;
        }
        if (c === "ArrowRight") {
            a.r = 0;
        }
    }
}

function load() {
    let resetForm = document.getElementById("reset");
    resetForm.addEventListener("reset", main);
    // setting up paths
    let paths = ["spr/spr_textbox_left.png", "spr/spr_textbox_top.png", "spr/spr_heart.png"];
    for (let i = 0; i < 8; i++) {
        paths.push(`spr/spr_textbox_topleft_${i}.png`);
    }
    paths.push("fnt/fnt_main.ttf");
    // loading the files and base64 encoding
    let spritesNumber = paths.filter((p) => p.endsWith(".png")).length;
    let spritesLoaded = 0;
    let othersNumber = paths.length - spritesNumber;
    let othersLoaded = 0;
    for (let path of paths) {
        if (path.endsWith(".png")) {
            let spr = new Image();
            spr.src = path;
            spr.onload = async function(event) {
                let sprLoaded = event.target;
                let xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    let reader = new FileReader();
                    reader.onloadend = function () {
                        files.set(path, {"image": sprLoaded, "base64": reader.result});
                        spritesLoaded += 1;
                        if (spritesLoaded === spritesNumber && othersLoaded === othersNumber) {
                            resetForm.reset();
                        }
                    };
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open("GET", path);
                xhr.responseType = "blob";
                xhr.send();
            }
        } else {
            let xhr = new XMLHttpRequest();
            xhr.onload = function () {
                let reader = new FileReader();
                reader.onloadend = function () {
                    files.set(path, {"base64": reader.result});
                    othersLoaded += 1;
                    if (spritesLoaded === spritesNumber && othersLoaded === othersNumber) {
                        resetForm.reset();
                    }
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open("GET", path);
            xhr.responseType = "blob";
            xhr.send();
        }
    }
}

document.addEventListener("DOMContentLoaded", load);
