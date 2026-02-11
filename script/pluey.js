function pluey() {
	// edit number of digits
	const numDigits = 6;
	// edit release date
	var releaseDate = new Date("2026-12-31T23:59:59Z");
    releaseDate = releaseDate.getTime();
	var day = new Date("1970-01-02T00:00:00Z");
	day = day.getTime();
	var currentDate = new Date(Date.now())
    currentDate = currentDate.getTime();
    var currentTime = releaseDate - currentDate;
    var days = Math.floor(currentTime/day)
    var percentage = 1/days*100;
    var integerPart = Math.floor(percentage);
    var decimalPart = Math.round(percentage*Math.pow(10,numDigits));
    document.getElementById("chance").innerText = integerPart.toString()+"."+decimalPart.toString().substring(0,numDigits+1)+"%";
    
    // fun value
    var fun = Math.ceil(Math.random()*100);
    document.getElementById("fun").innerText = fun.toString();
    var roll = Math.ceil(Math.random()*10);
    if (fun == 66) {
    	if (roll == 6) {
    		document.getElementById("image").src = "media/image/activawindows.jpeg";
    	}
    	else {
    			document.getElementById("funtext").innerText = "* But nobody came.";
    	}
    }
    else {
    	document.getElementById("image").src = "media/image/pluey.webp";
    }
}
