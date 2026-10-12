"use strict";

import { measures, appSurf, timeLeftURL } from "./index.js";

/**
 * Creates an SVGElement containing center-aligned text.
 * @param {{"text": string, "color": string, "scale": number, "url"?: string, "hoverColor"?: string}[]} spans
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} id
 */
function textCenter(spans, x, y, width, id) {
    let svg = appSurf.querySelector(`svg#svgText${id}`);
    let isNull = svg === null;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = `svgText${id}`;
    svg.setAttribute("width", `${width}`);
    let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    for (let colors of spans.map((s) => [s.color, "white"]).concat(spans.filter((s) => s.hoverColor !== undefined).map((s) => [s.hoverColor, "white"])).concat([["#000080", "#404040"]])) {
        let linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        linearGradient.id = `color${colors[0].substring(1)}`;
        linearGradient.setAttribute("x1", "0%");
        linearGradient.setAttribute("y1", "100%");
        linearGradient.setAttribute("x2", "0%");
        linearGradient.setAttribute("y2", "0%");
        let stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.classList.add("lgStart");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", colors[0]);
        let stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.classList.add("lgFinish");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", colors[1]);
        linearGradient.appendChild(stop1);
        linearGradient.appendChild(stop2);
        defs.appendChild(linearGradient);
    }
    svg.appendChild(defs);
    let style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    let yy = measures.textYOffset * spans[0].scale;
    let lines = [];
    let currentLine = [];
    let lineWidth = 0;
    for (let i = 0; i < spans.length; i++) {
        let span = spans[i];
        let spanWidth = span.text.length * measures.textHorizontalSpace * span.scale;
        while (lineWidth + spanWidth <= width) {
            lineWidth += spanWidth;
            currentLine.push(span);
            i+=1;
            if (i >= spans.length) {
                lines.push({"spans": currentLine});
                break;
            }
            span = spans[i];
            spanWidth = span.text.length * measures.textHorizontalSpace * span.scale;
        }
        if (i >= spans.length) {
            break;
        }
        let words = span.text.split(" ");
        let cutSpan = {"text": "", "color": span.color, "scale": span.scale, "url": span.url, "hoverColor": span.hoverColor};
        for (let j = 0; j < words.length; j++) {
            // assuming no word will be longer than width
            let word = words[j];
            let wordWidth = word.length + measures.textHorizontalSpace * span.scale;
            while (lineWidth + wordWidth <= width) {
                lineWidth += wordWidth + measures.textHorizontalSpace * span.scale;
                cutSpan.text += `${word} `;
                j += 1;
                if (j >= words.length) {
                    break;
                }
                word = words[j];
                wordWidth = word.length * measures.textHorizontalSpace * span.scale;
            }
            cutSpan.text = cutSpan.text.substring(0, cutSpan.text.length - 1);
            currentLine.push(structuredClone(cutSpan));
            cutSpan = {"text": "", "color": span.color, "scale": span.scale, "url": span.url, "hoverColor": span.hoverColor};
            lines.push({"spans": currentLine});
            currentLine = [];
            lineWidth = 0;
            j -= 1;
        }
    }
    let curId = 0;
    for (let line of lines) {
        let xx = ~~((width - line.spans.map((s) => s.text.length * measures.textHorizontalSpace * s.scale).reduce((a, b) => a + b))/2);
        for (let span of line.spans) {
            let shadow = document.createElementNS("http://www.w3.org/2000/svg", "text");
            shadow.id = `${svg.id}text${curId}shadow`;
            shadow.style.font = `${measures.textFontHeight * span.scale}px fnt_main`;
            shadow.setAttribute("fill", `url(#color000080)`);
            shadow.setAttribute("x", xx+1);
            shadow.setAttribute("y", yy+1);
            shadow.style.userSelect = "none";
            shadow.innerHTML = span.text.replaceAll(" ", "&nbsp;");
            svg.appendChild(shadow);
            if (span.url !== undefined) {
                let a = document.createElementNS("http://www.w3.org/2000/svg", "a");
                a.setAttribute("href", span.url);
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.id = `${svg.id}text${curId}`;
                text.style.font = `${measures.textFontHeight * span.scale}px fnt_main`;
                text.setAttribute("fill", `url(#color${span.color.substring(1)})`);
                text.setAttribute("x", xx);
                text.setAttribute("y", yy);
                a.innerHTML = span.text.replaceAll(" ", "&nbsp;");
                text.appendChild(a);
                svg.appendChild(text);
                style.innerHTML += `text#${text.id}:hover{fill:url(#color${span.hoverColor.substring(1)});cursor:pointer;}`;
            } else {
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.id = `${svg.id}text${curId}`;
                text.setAttribute("fill", `url(#color${span.color.substring(1)})`);
                text.setAttribute("x", xx);
                text.setAttribute("y", yy);
                text.style.font = `${measures.textFontHeight * span.scale}px fnt_main`;
                text.innerHTML = span.text.replaceAll(" ", "&nbsp;");
                svg.appendChild(text);
            }
            curId += 1;
            xx += span.text.length * measures.textHorizontalSpace * span.scale;
        }
        yy += measures.textFontHeight * line.spans[0].scale + 4;
    }
    svg.prepend(style);
    svg.setAttribute("height", `${measures.textFontHeight * spans[0].scale * lines.length + 4 * (lines.length - 1) + 1}`);
    svg.style.position = "absolute";
    svg.style.top = `${y}px`;
    svg.style.left = `${x}px`;
    if (!isNull) {
        let oldSvg = appSurf.querySelector(`svg#${svg.id}`);
        for (let text of oldSvg.querySelectorAll("text")) {
            // assuming that the format stays the same
            let link = text.querySelector("a");
            let cond1 = link !== null;
            if (link !== null) {
                cond1 = link.getAttribute("href") === timeLeftURL;
            }
            if ((cond1 || text.innerHTML.includes("%")) && !(text.id.includes("shadow"))) {
                text.setAttribute("fill", svg.querySelector(`#${text.id}`).getAttribute("fill"));
                text.setAttribute("x", svg.querySelector(`#${text.id}`).getAttribute("x"));
                text.setAttribute("y", svg.querySelector(`#${text.id}`).getAttribute("y"));
                text.innerHTML = svg.querySelector(`#${text.id}`).innerHTML;
                oldSvg.querySelector(`#${text.id}shadow`).setAttribute("fill", svg.querySelector(`#${text.id}shadow`).getAttribute("fill"));
                oldSvg.querySelector(`#${text.id}shadow`).setAttribute("x", svg.querySelector(`#${text.id}shadow`).getAttribute("x"));
                oldSvg.querySelector(`#${text.id}shadow`).setAttribute("y", svg.querySelector(`#${text.id}shadow`).getAttribute("y"));
                oldSvg.querySelector(`#${text.id}shadow`).innerHTML = svg.querySelector(`#${text.id}shadow`).innerHTML;
            }
        }
        return;
    }
    appSurf.appendChild(svg);
}

export { textCenter }