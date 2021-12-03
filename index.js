var ul1 = "https://www.finnkino.fi/xml/Schedule/";
var ul2 = ul1 + "?area=";
const d = new Date();
var date = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
var end = "&dt=" + date;
const theaters = 'https://www.finnkino.fi/xml/TheatreAreas/';
const idList = {};

window.onload = function(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        getLocations(this);
    }
    xhttp.open("GET", theaters);
    xhttp.send();
}
function getLocations(data) {
    var data = data.responseXML;
    const listData = data.getElementsByTagName("Name")
    var lista = [];
    Array.from(listData).forEach(location => {
        var text = location.innerHTML
        if (text.includes(":")) {
            var a = text.split(":");
            text = a[0];
        }
        if (!(text.includes("kaupunki"))) {
            if (!(lista.includes(text))) {
                lista.push(text);
                var list = document.getElementById("locations");
                var child = document.createElement("option");
                child.setAttribute("value", text);
                child.innerHTML = text;
                list.appendChild(child);
            }
        }
    });
}
document.getElementById("locations").addEventListener("change", function(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        createData2(this);
    }
    xhttp.open("GET", theaters);
    xhttp.send();
});
function createData2(xml) {
    var e = document.getElementById("locations");
    var value = e.options[e.selectedIndex].value;
    const data = xml.responseXML;
    const listData = data.getElementsByTagName("Name");
    const ll = data.getElementsByTagName("TheatreArea");
    createIdList(ll);
    document.getElementById("theaters").innerHTML = "";
    Array.from(listData).forEach(location => {
        var text = location.innerHTML;
        if (text.includes(":")) {
            var parts = text.split(":");
            if (parts[0] === value) {
                var list = document.getElementById("theaters");
                var child = document.createElement("option");
                child.setAttribute("value", text);
                child.innerHTML = modifyTheatreName(parts[1]);
                list.appendChild(child);
            }
        }
    });
}
function modifyTheatreName(name){
    console.log(name)
    name = name.slice(1);
    if (name.includes(" ")){
        var parts = name.split(" ");
        for (var i = 0; i<parts.length; i++){
            parts[i] = parts[i].charAt(0) + (parts[i].slice(1)).toLowerCase();
        }
        return parts.join(" ")
    } else {
        name = name.charAt(0) + (name.slice(1)).toLowerCase();
    }
    return name;
}
function createIdList(list) {
    for (var i = 0; i < list.length; i++) {
        if (!(idList.hasOwnProperty(list[i].childNodes[1]))) {
            idList[list[i].childNodes[1].innerHTML] = list[i].childNodes[3].innerHTML
        }
    }
}
document.getElementById("form").addEventListener("submit", (e) => {
    document.getElementById("main").innerHTML = "";
    var textid = document.getElementById("theaters").value;
    var id = "";
    for (var key in idList) {
        if (idList[key] === textid) {
            id = key;
        }
    }
    var ulLink = ul2 + id + end;
    e.preventDefault();
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        displayMovies(this)
    }
    xhttp.open("GET", ulLink);
    xhttp.send();
})
function displayMovies(data) {
    data = data.responseXML.getElementsByTagName("Show");
    Array.from(data).forEach(show => {
        createTitle(show)
    });
}
document.getElementById("searchButton").addEventListener("click", function () {
    var input = document.getElementById("textSearch");
    if (input.style.display = "none") {
        input.style.display = "block";
        this.style.display = "none";
    }
})
document.getElementById("textSearch").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            searchInput(this, document.getElementById("textSearch").value)
        }
        xhttp.open("GET", ul1);
        xhttp.send();
    }
})
function searchInput(data, value) {
    document.getElementById("main").innerHTML = "";
    data = data.responseXML.getElementsByTagName("Show");
    Array.from(data).forEach(show => {
        var title = show.getElementsByTagName("Title")[0].innerHTML;
        title = title.toLowerCase();
        var place = show.getElementsByTagName("TheatreAndAuditorium")[0].innerHTML;
        place = place.toLowerCase();
        if (title.includes(value.toLowerCase()) || place.includes(value.toLowerCase())){
            createTitle(show)
        }
    });
}
function createTitle(show) {
    var disp = document.getElementById("main");
    var title = show.getElementsByTagName("Title")[0].innerHTML;
    var image = show.getElementsByTagName("Images")[0].childNodes[3].innerHTML;
    var place = show.getElementsByTagName("TheatreAndAuditorium")[0].innerHTML;
    var showStart = getTime(show.getElementsByTagName("dttmShowStart")[0].innerHTML);
    var saleEnd = getTime(show.getElementsByTagName("ShowSalesEndTime")[0].innerHTML);
    var rating = show.getElementsByTagName("Rating")[0].innerHTML;
    var div1 = document.createElement("div");
    div1.classList.add("movie");
    div1.innerHTML = '<img src="' +
        image + '"><div class="movie-info"><h3>' +
        title + '</h3><span class="dot">' +
        testRating(rating) + '</span></div><div class="overview">Paikka ja sali: ' +
        place + '<br>Lipunmyynti loppuu: ' +
        saleEnd + '<br>Näytös alkaa: ' +
        showStart + '</div>';
    disp.appendChild(div1);
}
function testRating(rating) {
    if (rating.includes("Anniskelu")) {
        return "18"
    } else {
        return rating
    }
}
function getTime(time) {
    var time = time.split("T");
    time = time[1].split(":");
    time = time[0] + ":" + time[1];
    return time
}