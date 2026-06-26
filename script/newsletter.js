const oldNewsletter = "/newsletters/ch5-release-day/"

function parseHTML(str) {
    let tmp = document.implementation.createHTMLDocument();
    tmp.body.outerHTML = str;
    return tmp;
}

function newsletter() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let htmlString = xhttp.responseText;
            let htmlDoc = parseHTML(htmlString);
            let newsletterLink = htmlDoc.body.childNodes[1].childNodes[1].childNodes[5].childNodes[1].href
            let p = document.getElementById("newsletter")
            if (oldNewsletter === newsletterLink) {
                document.body.style.backgroundColor = "red";
                p.innerText = "NO";
            } else {
                document.body.style.backgroundColor = "green";
                p.innerHTML = `<a href="https://toby.fangamer.com${newsletterLink}" style="color:white">YES</a>`;
            }
        }
    };
    xhttp.open("GET", "https://toby.fangamer.com/newsletters/", true);
    xhttp.send();
}