window.onload = 
    fetch('https://www.cheapshark.com/api/1.0/stores')
    .then((response) => response.json())
    .then((data) => console.log(data));