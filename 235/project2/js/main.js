
const storesMap = { "1": "Steam", "2": "GamersGate", "3": "GreenManGaming", "6": "Direct2Drive", "7": "GoG", "8": "Origin",  
"11": "Humble Store",  "13": "Uplay", "15": "Fanatical", "21": "WinGameStore", "23": "GameBillet", "24": "Voidu", 
"25": "Epic Games Store", "27": "Gamesplanet", "28": "Gamesload", "29": "2Game", "30": "IndieGala", "31": "Blizzard Shop", 
"32": "AllYouPlay", "33": "DLGamer", "34": "Noctre"}

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

    //
    let stores = document.getElementsByName("store");
    let storeCount = 0;
    for (let i = 0; i < stores.length; i++) {
        if (stores[i].checked) {
            if (storeCount == 0) {
                url += `&storeID=${stores[i].value}`;
            }
            else {
                url += `,${stores[i].value}`;
            }
            storeCount++;
        }
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

    if (storeCount == 0) {
        document.querySelector("#results").innerHTML = "Please select at least one store!";
    }
    else
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
    const data = e;
    const dealURL = "https://www.cheapshark.com/redirect?dealID=";

    document.querySelector("#results").innerHTML = data[0];
    console.log(data[0]);

    let gameResults = "";

    for (let i = 0; i < data.length; i++) {
        let element = data[i];
        let game = "";

        game += `<div class="game">`;
        
        game += `<img src="${element.thumb}" alt="thumbnail">`;
        game += `<div class="description">`;
        game += `<a href="${dealURL + element.dealID}">`;
        game += `<h3>${element.title}</h3>`;
        game += `</a>`;
        game += `<p>${storesMap[element.storeID]}</p>`;

        if (element.steamRatingText != null)
            game += `<p>${element.steamRatingText} ${element.steamRatingPercent}%</p>`;
        
        if (element.metacriticScore != 0)
            game += `<p>Metacritic: ${element.metacriticScore}</p>`;
        
        game += `<p>Deal Rating: ${element.dealRating}</p>`;
        game += `<p>$${element.normalPrice} -> $${element.salePrice}</p>`;
        game += `<p class="discount">${Math.round(element.savings)}% off!</p>`;
        game += `</div>`;
        
        game += `</div>`;


        gameResults += game;
    }


    document.querySelector("#results").innerHTML = gameResults;
}

// Handle errors
const dataError = () => {
    console.log("An error occurred")
}

const selectAllStores = () => {
    let stores = document.getElementsByName("store");

    for (let store of stores) {
        store.checked = true;
    }
}
const deselectAllStores = () => {
    let stores = document.getElementsByName("store");

    for (let store of stores) {
        store.checked = false;
    }
}

const loadLogos = () => {
    // const baseLogoURL = "https://www.cheapshark.com/api/1.0/stores";

    // const storeIDs = Object.keys(storesMap);

    // const stores = document.getElementsByName("store");

    // fetch(baseLogoURL)
    //     .then((response) => response.json())
    //     .then((data) => {
    //         for (let i = 0; i < storeIDs.length; i++) {
    //             console.log(data);
    //             stores[i].innerHTML = data[parseInt(storeIDs[i])-1].images.logo;
    //         }
    //     });


    

    // const baseLogoURL = "https://www.cheapshark.com/img/stores/banners/";

    // const storeIDs = Object.keys(storesMap);

    // const stores = document.getElementsByName("store");

    // for (let i = 0; i < storeIDs.length; i++) {

    //     fetch(baseLogoURL + storeIDs[i] + ".png")
    //     .then((response) => response.json())
    //     .then((data) => {
    //         for (let i = 0; i < storeIDs.length; i++) {
    //             console.log(data);
    //             stores[i].innerHTML = data;
    //         }
    //     });
    // }
    
}



window.onload = () => {
    // fetch('https://www.cheapshark.com/api/1.0/deals?')
    // .then((response) => response.json())
    // .then((data) => {console.log(data); document.querySelector("#results").innerHTML = data;} )
    loadLogos();
    searchButtonClicked();
    document.querySelector("#search").onclick = searchButtonClicked;
    document.querySelector("#select-all").onclick = selectAllStores;
    document.querySelector("#select-none").onclick = deselectAllStores;

    let stores = document.getElementsByName("store");

}




