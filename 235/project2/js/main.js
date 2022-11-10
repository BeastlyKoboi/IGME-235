const stores = ["Steam", "GamersGate", "GreenManGaming", "Amazon", "GameStop", "Direct2Drive", "GoG",
    "Origin", "Get Games", "Shiny Loot", "Humble Store", "Desura", "Uplay", "IndieGameStand", "Fanatical",
    "Gamesrocket", "Games Republic", "SilaGames", "Playfield", "ImperialGames", "WinGameStore",
    "FunStockDigital", "GameBillet", "Voidu", "Epic Games Store"];

// Creates the URL
const searchButtonClicked = () => {
    console.log("searchButtonClicked() called");

    const CHEAPSHARK_URL = "https://www.cheapshark.com/api/1.0/deals?";

    let url = CHEAPSHARK_URL;

    // Add sort type
    url += "sortBy=" + document.querySelector("#sort-select").value;

    // Add search terms
    let searchText = document.querySelector("#searchterm").value;
    if (searchText.length != 0) {
        url += "&title=" + searchText;
    }

    // Add number of items per page
    let numItems = document.querySelector("#pagelim").value;
    if (numItems.length != 0) {
        url += "&pageSize=" + numItems;
    }
    

    // Add max price 
    let maxPr = document.querySelector("#maxprice").value;
    if (maxPr.length != 0) {
        url += "&upperPrice=" + maxPr;
    }

    // Add min steam reviews percentage
    let minRev = document.querySelector("#minrating").value;
    if (minRev.length != 0) {
        url += "&steamRating=" + minRev;
    }

    url = url.trim().replace(/ /g, "%20");

    console.log(url);
    getData(url);
};

// Fetches the data and decides what happens
const getData = (url) => {
    fetch(url)
        .then((response) => response.json())
        .then((data) => dataLoaded(data));
}

// Formats and inserts data
const dataLoaded = (e) => {

    let data = e;
    document.querySelector("#results").innerHTML = data[0];
    console.log(data[0]);

    let gameResults = "";

    for (let i = 0; i < data.length; i++) {
        let element = data[i];
        let game = "";

        game += `<div>`;
        game += `<h2>${element.title}</h2>`;
        game += `<p>`;
        game += `Steam Rating: ${element.steamRatingPercent}% ${element.steamRatingText}<br>`;
        game += `Metacritic Score: ${element.metacriticScore}<br>`;
        game += `${stores[element.storeID - 1]}<br>`;
        game += `Deal Rating: ${element.dealRating}<br>`;
        game += `$${element.normalPrice} -> $${element.salePrice}<br>`;
        game += `${Math.round(element.savings)}% off!<br>`;
        game += `<br>`;
        game += `<br>`;
        game += `<br>`;
        game += `</p>`;
        game += `</div>`;


        gameResults += game;
    }


    document.querySelector("#results").innerHTML = gameResults;
}

// Handle errors
const dataError = () => {
    console.log("An error occurred")
}


window.onload = () => {
    // fetch('https://www.cheapshark.com/api/1.0/deals?')
    // .then((response) => response.json())
    // .then((data) => {console.log(data); document.querySelector("#results").innerHTML = data;} )
    searchButtonClicked();
    document.querySelector("#search").onclick = searchButtonClicked
}




