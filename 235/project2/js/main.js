
const storesMap = {
    "1": "Steam", "2": "GamersGate", "3": "GreenManGaming", "6": "Direct2Drive", "7": "GoG", "8": "Origin",
    "11": "Humble Store", "13": "Uplay", "15": "Fanatical", "21": "WinGameStore", "23": "GameBillet", "24": "Voidu",
    "25": "Epic Games Store", "27": "Gamesplanet", "28": "Gamesload", "29": "2Game", "30": "IndieGala", "31": "Blizzard Shop",
    "32": "AllYouPlay", "33": "DLGamer", "34": "Noctre"
}

// localStorage Keys
const prefix = "arf7094-";
const searchKey = prefix + "searchTerm";
const numItemsKey = prefix + "numItems";
const sortSelectKey = prefix + "sortSelect";
const storesSelectKey = prefix + "storeSelect";
const maxPriceKey = prefix + "maxPrice";
const minReviewKey = prefix + "minReview";
const pageNumKey = prefix + "pageNum";

// common div and input query selectors
let searchTermInput;
let numItemsInput;
let sortSelect;
let storesNodeList;
let maxPrInput;
let minRevInput;
let pageNumInput;
let resultsDiv;


// Creates the URL
const searchButtonClicked = () => {

    // Save current inputs to local storage first
    saveToLocalStorage();

    console.log("searchButtonClicked() called");

    // Add progress bar
    resultsDiv.innerHTML = `<div class="progress-bar"><div class="progress-bar-value"></div></div>`;

    // Start URL building
    const CHEAPSHARK_URL = "https://www.cheapshark.com/api/1.0/deals?";

    let url = CHEAPSHARK_URL;

    // Add sort type
    url += "sortBy=" + sortSelect.value;

    // Add search terms
    let searchText = searchTermInput.value;
    if (searchText.length != 0) {
        url += "&title=" + searchText;
    }

    // Add the stores you are searching by
    let storeCount = 0;
    for (let i = 0; i < storesNodeList.length; i++) {
        if (storesNodeList[i].checked) {
            if (storeCount == 0) {
                url += `&storeID=${storesNodeList[i].value}`;
            }
            else {
                url += `,${storesNodeList[i].value}`;
            }
            storeCount++;
        }
    }

    // Add number of items per page
    if (numItemsInput.value.length != 0) {
        url += "&pageSize=" + numItemsInput.value;
    }

    // Add the page number (zero indexed)
    url += "&pageNumber=" + (pageNumInput.value - 1);

    // Add max price 
    if (maxPrInput.value.length != 0) {
        url += "&upperPrice=" + maxPrInput.value;
    }

    // Add min steam reviews percentage
    if (minRevInput.value.length != 0) {
        url += "&steamRating=" + minRevInput.value;
    }

    // Remove spaces on either end and replace remaining spaces with %20
    url = url.trim().replace(/ /g, "%20");

    console.log(url);

    if (storeCount == 0) {
        resultsDiv.innerHTML = "Please select at least one store!";
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

    resultsDiv.innerHTML = data[0];
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


    resultsDiv.innerHTML = gameResults;
}

// Handle errors
const dataError = () => {
    console.log("An error occurred")
}

// Methods to select and deselect all stores in store select
const selectAllStores = () => {
    for (let store of storesNodeList) {
        store.checked = true;
    }
}
const deselectAllStores = () => {
    for (let store of storesNodeList) {
        store.checked = false;
    }
}

// Does not work
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

// Methods for back a page and next page
const pageBack = () => {
    if (pageNumInput.value == 1) {
        return;
    }

    pageNumInput.value--;
    searchButtonClicked();
}
const pageNext = () => {
    pageNumInput.value++;
    searchButtonClicked();
}

//
const saveToLocalStorage = () => {
    localStorage.setItem(searchKey, searchTermInput.value);
    localStorage.setItem(numItemsKey, numItemsInput.value);
    localStorage.setItem(sortSelectKey, sortSelect.value);

    let storeIDs = [];
    for (let i = 0; i < storesNodeList.length; i++) {
        if (storesNodeList[i].checked) {
            storeIDs.push(storesNodeList[i].value);
        }
    }
    localStorage.setItem(storesSelectKey, JSON.stringify(storeIDs));

    localStorage.setItem(maxPriceKey, maxPrInput.value);
    localStorage.setItem(minReviewKey, minRevInput.value);
    localStorage.setItem(pageNumKey, pageNumInput.value);

}
const loadFromLocalStorage = () => {
    searchTermInput.value = localStorage.getItem(searchKey);

    if (localStorage.getItem(numItemsKey) != null)
        numItemsInput.value = localStorage.getItem(numItemsKey);

    if (localStorage.getItem(sortSelectKey) != null)
        sortSelect.value = localStorage.getItem(sortSelectKey);

    let storeIDs = JSON.parse(localStorage.getItem(storesSelectKey));
    if (storeIDs != null) {
        for (let i = 0; i < storesNodeList.length; i++) {
            if (storesNodeList[i].value == storeIDs[0]) {
                storesNodeList[i].checked = true;
                storeIDs.shift();
            }
            else
                storesNodeList[i].checked = false;
        }
    }

    if (localStorage.getItem(maxPriceKey) != null)
        maxPrInput.value = localStorage.getItem(maxPriceKey);
    if (localStorage.getItem(minReviewKey) != null)
        minRevInput.value = localStorage.getItem(minReviewKey);
    if (localStorage.getItem(pageNumKey) != null)
        pageNumInput.value = localStorage.getItem(pageNumKey);

}

window.onload = () => {
    // fetch('https://www.cheapshark.com/api/1.0/deals?')
    // .then((response) => response.json())
    // .then((data) => {console.log(data); document.querySelector("#results").innerHTML = data;} )

    loadLogos();

    // save common divs
    searchTermInput = document.querySelector("#searchterm");
    numItemsInput = document.querySelector("#pagelim");
    sortSelect = document.querySelector("#sort-select");
    storesNodeList = document.getElementsByName("store");
    maxPrInput = document.querySelector("#maxprice");
    minRevInput = document.querySelector("#minrating");
    pageNumInput = document.querySelector("#pagenum");
    resultsDiv = document.querySelector("#results");

    loadFromLocalStorage();

    searchButtonClicked();
    document.querySelector("#search").onclick = searchButtonClicked;
    document.querySelector("#select-all").onclick = selectAllStores;
    document.querySelector("#select-none").onclick = deselectAllStores;
    document.querySelector("#back").onclick = pageBack;
    document.querySelector("#next").onclick = pageNext;

}




