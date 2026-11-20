"use strict";

import { assets, appSurf, measures } from "./index.js";

// BoxDark class
class BoxDark {
    constructor(x, y, width, height) {
        let index = BoxDark.getLowestUnusedDarkBox();
        let box = document.createElement("canvas");
        box.id = `box-dark-${index}`;
        let boxWidth = width + (measures.borderSize + measures.extraBorderSize)*2;
        let boxHeight = height + (measures.borderSize + measures.extraBorderSize)*2;
        box.width = boxWidth;
        box.height = boxHeight;
        BoxDark.usedDarkBoxes.push(index);
        BoxDark.usedDarkBoxes.sort((a, b) => a - b);
        box.style.position = `absolute`;
        box.style.zIndex = "-1";
        box.style.top = `${y - (measures.borderSize + measures.extraBorderSize)}px`;
        box.style.left = `${x - (measures.borderSize + measures.extraBorderSize)}px`;
        box.style.imageRendering = "pixelated";
        appSurf.appendChild(box);
        let draw = function () {
            BoxDark.drawEvent(instance);
        }
        let instance = {"draw": draw, "index": index, "box": box, "x": x, "y": y, "boxFrame": 0, "width": width, "height": height, "hasChanged": false};
        this.instance = instance;
        document.getElementById("step").addEventListener("reset", instance.draw);
    }

    static destroy(obj) {
        let ind = BoxDark.usedDarkBoxes.indexOf(obj.instance.index);
        if (ind !== -1) {
            document.getElementById(`box-dark-${obj.instance.index}`).remove();
            BoxDark.usedDarkBoxes.splice(ind, 1);
        }
        document.getElementById("step").removeEventListener("reset", obj.instance.draw);
    }

    static usedDarkBoxes = [];

    static getLowestUnusedDarkBox() {
        if (BoxDark.usedDarkBoxes.length === 0) return 0;
        for (let i = 0; i < BoxDark.usedDarkBoxes.length; i++) {
            if (i !== BoxDark.usedDarkBoxes[i]) return i;
        }
        return BoxDark.usedDarkBoxes.length;
    }

    static drawEvent(inst) {
        inst.box.style.top = `${inst.y - (measures.borderSize + measures.extraBorderSize)}px`;
        inst.box.style.left = `${inst.x - (measures.borderSize + measures.extraBorderSize)}px`;
        let ctx = inst.box.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "black";
        ctx.fillRect(measures.borderSize + measures.extraBorderSize + 2, measures.borderSize + measures.extraBorderSize + 2, inst.width - 4, inst.height - 4);
        if (inst.hasChanged)
            ctx.clearRect(0, 0, inst.box.width, inst.box.height);
        let sprTextboxTopleft = assets.get(`spr/spr_textbox_topleft_${~~(inst.boxFrame/10)}.png`);
        let sprTextboxTop = assets.get(`spr/spr_textbox_top.png`);
        let sprTextboxLeft = assets.get(`spr/spr_textbox_left.png`);
        // scale: (1, 1) -> (-1, 1) -> (-1, -1) -> (1, -1)
        let topLeft = [
            {"x": 0, "y": 0, "width": sprTextboxTopleft.width*2, "height": sprTextboxTopleft.height*2},
            {"x": -inst.box.width, "y": 0, "width": sprTextboxTopleft.width*2, "height": sprTextboxTopleft.height*2},
            {"x": -inst.box.width, "y": -inst.box.height, "width": sprTextboxTopleft.width*2, "height": sprTextboxTopleft.height*2},
            {"x": 0, "y": -inst.box.height, "width": sprTextboxTopleft.width*2, "height": sprTextboxTopleft.height*2}
        ];
        let sides = [
            {"x": measures.borderSize*4 + measures.extraBorderSize, "y": 0, "width": inst.width - measures.borderSize*6, "height": sprTextboxTop.height*2}, // top
            {"x": -inst.box.width, "y": measures.borderSize*4 + measures.extraBorderSize, "width": sprTextboxLeft.width*2, "height": inst.height - measures.borderSize*6}, // left
            {"x": -(inst.box.width - measures.borderSize*4 - measures.extraBorderSize), "y": -inst.box.height, "width": inst.width - measures.borderSize*6, "height": sprTextboxTop.height*2}, // top
            {"x": 0, "y": -(inst.box.height - measures.borderSize*4 - measures.extraBorderSize), "width": sprTextboxLeft.width*2, "height": inst.height - measures.borderSize*6}, // left
        ]
        for (let i = 0; i < 4; i++) {
            let tl = topLeft[i];
            let s = sides[i];
            ctx.drawImage(sprTextboxTopleft, tl.x, tl.y, tl.width, tl.height);
            ctx.drawImage(i%2===0?sprTextboxTop:sprTextboxLeft, s.x, s.y, s.width, s.height);
            ctx.scale(Math.pow(-1, i+1), Math.pow(-1, i));
        };
        inst.boxFrame += 1;
        if (inst.boxFrame >= 80) {
            inst.boxFrame = 0;
        }
    }
}

export { BoxDark };