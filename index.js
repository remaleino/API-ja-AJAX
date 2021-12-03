//Tiedosto sisältää kaikki päivän esitykset
var ul1 = "https://www.finnkino.fi/xml/Schedule/";
var ul2 = ul1 + "?area=";
const d = new Date();
var date = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
var end = "&dt=" + date;
//Tiedosto sisältää pelkistetyn tiedon teattereista
const theaters = 'https://www.finnkino.fi/xml/TheatreAreas/';
const idList = {};
// Kun dokumentti on latautunut, se lataa teattereiden-listan
window.onload = function(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        getLocations(this);
    }
    xhttp.open("GET", theaters);
    xhttp.send();
}
//Listänään ensimmäiseen pudotusvalikkoon paikkakunnat
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
/*Jos valitaan 1. pudotusvalikosta teatteri, niin ladataan uudestaan
yleistä tietoa sisältävän tiedoston*/
document.getElementById("locations").addEventListener("change", function(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        createData2(this);
    }
    xhttp.open("GET", theaters);
    xhttp.send();
});
//Lisätään 2. pudotusvalikkoon paikkakunnan teattereiden nimet
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
/*Muutetaan teattereiden nimien osien aina alkavan isosta
alkukirjaimesta, mutta muiden kirjainten on oltava pieniä*/
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
//Lisätään teattereiden id:t listaan
function createIdList(list) {
    for (var i = 0; i < list.length; i++) {
        if (!(idList.hasOwnProperty(list[i].childNodes[1]))) {
            idList[list[i].childNodes[1].innerHTML] = list[i].childNodes[3].innerHTML
        }
    }
}
//Käsitellään valittuja valintoja
document.getElementById("form").addEventListener("submit", (e) => {
    document.getElementById("main").innerHTML = "";
    //Saadaan valitun teatterin id
    var textid = document.getElementById("theaters").value;
    var id = "";
    for (var key in idList) {
        if (idList[key] === textid) {
            id = key;
        }
    }
    /*Muodostetaan linkki tiedostoon, josta löytyy
    kaikki teatterin esitykset*/
    var ulLink = ul2 + id + end;
    e.preventDefault();
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        displayMovies(this)
    }
    xhttp.open("GET", ulLink);
    xhttp.send();
})
//Lähetetään käsky tuloksien tulostamiseen
function displayMovies(data) {
    data = data.responseXML.getElementsByTagName("Show");
    Array.from(data).forEach(show => {
        createTitle(show)
    });
}
//Piilotetaan kysymysmerkki ja näytetään tekstikenttä
document.getElementById("searchButton").addEventListener("click", function () {
    var input = document.getElementById("textSearch");
    if (input.style.display = "none") {
        input.style.display = "block";
        this.style.display = "none";
    }
})
/*Jos tekstikentässä painetaan enter-näppäintä,
ohjelma nappaa tiedoston, joka sisältää kaikki tiedot*/
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
/*Funktio etsii arvo tiedoston paikkakuntien, teattereiden
ja elokuvien nimistä. Mikäli osuma löytyy, lähetetään rivet
tulostettavaksi*/
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
//Tulostetaan elokuvan ikoni
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
/*Mikäli ikäraja-teksti sisältää "Anniskelu"-osan,
funktio palauttaa tekstin "18"*/
function testRating(rating) {
    if (rating.includes("Anniskelu")) {
        return "18"
    } else {
        return rating
    }
}
//Funktio muokkaa aikan näkyvyyttä
function getTime(time) {
    var time = time.split("T");
    time = time[1].split(":");
    time = time[0] + ":" + time[1];
    return time
}
