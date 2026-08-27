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

function calcTime() {
    let currentDate = (new Date()).getTime();
    let timeLeft = releaseDateTime - currentDate;
    let daysLeft = 0;
    let hoursLeft = 0;
    let minutesLeft = 0;
    let secondsLeft = 0;
    if (timeLeft > 0) {
        daysLeft = Math.floor(timeLeft / daysMs);
        hoursLeft = Math.floor((timeLeft-daysLeft*daysMs) / hoursMs)
        minutesLeft = Math.floor((timeLeft-daysLeft*daysMs-hoursLeft*hoursMs) / minutesMs);
        secondsLeft = Math.floor((timeLeft-daysLeft*daysMs-hoursLeft*hoursMs-minutesLeft*minutesMs) / secondsMs);
    }
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