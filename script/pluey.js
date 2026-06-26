// TIME UNITS
const day = (new Date("1970-01-02T00:00:00Z")).getTime();
const hour = (new Date("1970-01-01T01:00:00Z")).getTime();
const minute = (new Date("1970-01-01T00:01:00Z")).getTime();
const second = (new Date("1970-01-01T00:00:01Z")).getTime();

// RELEASE DATES
const releaseDateTime = (new Date("2027-12-31T23:59:59Z")).getTime();   // Modify hour here when the release date gets announced
const releaseDate = (new Date("2027-12-31T23:59:59Z")).getTime();
const announced = false;                                                // Set true if the release date has been announced.

// ROUNDING
const numDigits = 6;

// CHANCES
async function chance() {
    let currentDate = (new Date(Date.now())).getTime();
    let timeRemaining = releaseDate - currentDate;

    let days = Math.floor(timeRemaining/day);
    let percentage = 1/days*100;
    let integerPart = Math.floor(percentage);
    let decimalPart = Math.pow(10,numDigits)+Math.round((percentage - integerPart)*Math.pow(10,numDigits));

    if (announced) {
        document.getElementById("chance").innerText = days===1?"100.00%":"0.00%";
    } else {
        document.getElementById("chance").innerText = integerPart.toString()+"."+decimalPart.toString().substring(1,numDigits+1)+"%";
    }
}

// FUN
function pluey() {
    let fun = Math.ceil(Math.random()*100);
    document.getElementById("fun").innerText = fun.toString();
    if (fun == 66) {
    	document.body.style.fontFamily = "Wingdings";
    }
}

function num2str(n) {
    return (n+100).toString().substring(1);
}

async function countdown() {
    let currentDate = (new Date(Date.now())).getTime();
    let timeRemaining = releaseDateTime - currentDate;
    let timer;
    if (timeRemaining < 0) {
        timer = `0:00:00:00`;
    } else {
        let days = Math.floor(timeRemaining/day);
        let hours = Math.floor((timeRemaining - days*day)/hour);
        let minutes = Math.floor((timeRemaining - days*day - hours*hour)/minute);
        let seconds = Math.floor((timeRemaining - days*day - hours*hour - minutes*minute)/second);
        timer = `${days}:${num2str(hours)}:${num2str(minutes)}:${num2str(seconds)}`;
    }
    document.getElementById("countdown").innerText = timer;
}

// TIMER UPDATE
let intervalID;

function frameKeyCheck() {
    intervalID = setInterval(countdown, 100/6);
    intervalID = setInterval(chance, 100/6);
}

// INITIALIZATION
async function main() {
    frameKeyCheck();
    pluey();
}

document.addEventListener("DOMContentLoaded", main);
