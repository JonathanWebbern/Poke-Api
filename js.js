const apiUrlBase = "https://pokeapi.co/api/v2/";
const ImageUrlBase = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/";
let pokemon = [];
let allPokemonInfo = [];

window.onload = function(){
    getPokemonRange(0, 50, null);
}

function toggleLoadingWindow(){
    document.getElementById('loading-overlay').classList.toggle('display-none');
    document.getElementById('card-container').classList.toggle('display-none');
    document.getElementById('back-to-top').classList.toggle('display-none');
}

function getPokemonRange(startNo, endNo, page){  
    allPokemonInfo = [];
    toggleLoadingWindow();
    /* Get range of pokemon */
    fetch(apiUrlBase + 'pokemon?limit=' + endNo + '&offset=' + startNo)
    .then(result => result.json())
    .then(function(range){  
        /* Get pokemon info for each pokemon in list */
        let results = range.results.map(pokemon => fetch(pokemon.url).then(result => result.json()));      
        Promise.all(results).then((values) => { 
            pokemon = values;
            /* Get species info */
            let results = values.map(pokemon => fetch(pokemon.species.url).then(result => result.json())); 
            Promise.all(results).then((values) => {
                /* Get evolution chain info */
                let results = values.map(pokemon => fetch(pokemon.evolution_chain.url).then(results => results.json()));
                Promise.all(results).then((values) => {
                    for(var i = 0; i < pokemon.length; i++){
                        let evo = buildEvolutionChain(values[i]);
                        allPokemonInfo.push([ pokemon[i], evo ] );
                    }
                })
                .then(function(){
                    displayPokemon();
                    toggleLoadingWindow();
                    if(page != null){
                        changePageHighlight(page);
                    }
                })
            })
            
        });
    })
}

function buildEvolutionChain(evolutionChain){
    let chain = [];
    !evolutionChain.chain.is_baby ? chain.push(getIdFromUrl(evolutionChain.chain.species.url)) : null;    
    if(evolutionChain.chain.evolves_to[0] != null){
        chain.push(getIdFromUrl(evolutionChain.chain.evolves_to[0].species.url)); 
        evolutionChain.chain.evolves_to[0].evolves_to[0] != null ? chain.push(getIdFromUrl(evolutionChain.chain.evolves_to[0].evolves_to[0].species.url)) : null;
    } 
    console.log(chain);
    return chain;
}

function getIdFromUrl(string){
    let newString = string.split("").reverse().join("");       
    var r = /\d+/;
    let news = newString.match(r);     
    let rightString = news[0].split("").reverse().join("");
    return rightString;
} 

function displayPokemon(){
    document.getElementById('card-container').innerHTML = null;
    for(var i = 0; i < allPokemonInfo.length; i++){
        let card = createCard(allPokemonInfo[i]);
        document.getElementById('card-container').innerHTML += card;
    }
}

function createCard(pokemonData){
    let imagesString = "";
    let pokemonInfo = pokemonData[0];
    let evolutionInfo = pokemonData[1];
    let colors = cardColor(pokemonInfo.types);
    for(var i = 0; i < evolutionInfo.length; i++){
        if(evolutionInfo[i] > 151){ continue; }
        if(i % 1 === 0 && i != 0){
           imagesString += '<span class="glyphicon glyphicon-menu-right"></span>';
        }
        imagesString += '<img class="chain-image" src="' + ImageUrlBase + evolutionInfo[i] + '.svg' + '" />';       
    }
    return '<div id="' + pokemonInfo.id + '" class="pokemon-card" style="background-color:' + colors[0] +'" onclick="cardClick(' + pokemonInfo.id + ');">' + 
                    '<div class="card-front">' +
                            '<div class="card-image-container flex-box" style="background-color:' + colors[1] +'" >' +
                                '<img src="' + ImageUrlBase + pokemonInfo.id + '.svg' + '" class="card-image" alt="pokemon image" />' +
                            '</div>' +
                            '<div class="card-info flex-box">' +
                                '<p>#' + pokemonInfo.id + '</p>' +
                                '<p class="capitalize">' + pokemonInfo.name + '</p>' +
                                '<p class="capitalize">' + typeName(pokemonInfo.types) + '</p>' +
                            '</div>' +
                    '</div>' +

                    '<div class="card-back">' +
                            '<div class="back-card-info flex-box">' +
                                '<div class="info flex-box">' +
                                    '<h1>General</h1>' +
                                    '<p>Generation: One</p>' +
                                    '<p>Region: Kanto</p>' +   
                                '</div>' +
                                '<div class="info flex-box">' +
                                    '<h1>Base Stats</h1>' +
                                    '<p>Attack: ' + pokemonInfo.stats[1].base_stat + '</p>' +
                                    '<p>Defence: ' + pokemonInfo.stats[2].base_stat + '</p>' +
                                    '<p>Hp: ' + pokemonInfo.stats[0].base_stat + '</p>' +
                                    '<p>Speed: ' + pokemonInfo.stats[5].base_stat + '</p>' +
                                    '<p>Special Attack: ' + pokemonInfo.stats[3].base_stat + '</p>' +
                                    '<p>Special Defence: ' + pokemonInfo.stats[4].base_stat + '</p>' +
                                '</div>' +
                                '<div>' +
                                '<div id="chain-container" class="flex-box">' +
                                    imagesString +
                                '</div>' +
                                '</div>' +
                            '</div>' +
                    '</div>' +
                  '</div>';
}

function cardColor(types){
    switch(types[0]['type']['name']){
        case "fire":
            return [ "#F5AC78", "#F08030" ];
        case "grass":
            return [ "#A7DB8D" , "#7AC74C" ];
        case "water":
            return [ "#9DB7F5", "#6890F0" ];
        case "bug":
            return [ "#C6D16E", "#A8B820" ];
        case "electric":
            return [ "#FAE078", "#F8D030" ];
        case "ground":
            return [ "#EBD69D", "#E0C068" ];
        case "rock":
            return [ "#D1C17D", "#B8A038" ];
        case "normal":
            if(types.length > 1 && types[1]['type']['name'] == "flying"){
                return [ "#C6B7F5", "#A890F0" ];
            }
            return [ "#C6C6A7", "#A8A878" ];
        case "poison":
            return [ "#C183C1", "#A040A0" ];
        case "psychic":
            return [ "#FA92B2", "#F85888" ];
        case "fairy":
            return [ "#F4BDC9", "#EE99AC" ];
        case "dragon":
            return [ "#A27DFA", "#7038F8" ];
        case "fighting":
            return [ "#D67873", "#C03028" ];
        case "ghost":
            return [ "#A292BC", "#705898" ];
        case "ice":
            return [ "#BCE6E6", "#98D8D8" ];
        default:
            return "#FF0000";
    }
}

function typeName(types){
    if(types.length > 1){
        return (types[0]['type']['name'] + " / " + types[1]['type']['name']);
    }else{
        return types[0]['type']['name'];
    }
}

function cardClick(cardId){
    let card = document.getElementById(cardId);
    card.classList.toggle('rotate-card');
}

function changePageHighlight(pageClicked){
    console.log(pageClicked);
    let link = document.getElementById('pagination-ul').querySelectorAll('.selected-page');
    //console.log(link);
    link[0].classList.remove('selected-page');
    
    console.log(pageClicked.childNodes[0]);
    pageClicked.childNodes[0].classList.add('selected-page'); 
    
}