let album = {
    title: "",
    cover: "",
}

const albumUrl = 'https://striveschool-api.herokuapp.com/api/deezer/search?q='
const trackUrl = 'https://striveschool-api.herokuapp.com/api/deezer/album/'
let cardHtml = ''

let authorSection = document.getElementById('author')
let tracksModal = document.getElementById('tracksModal')

// funzione per recuperare l'html di una card già fatta, così è più semplice creare le altre. 
// Poi la cancello
let findFirstCard = function(){
    firstCard = document.getElementsByClassName('album-card')[0]
    cardHtml = firstCard.cloneNode(true)
    firstCard.remove()
}

findFirstCard()

// funzione per ricercare un autore specifico
let search = function(){
    let author = document.getElementById('searchField').value.replaceAll(' ', '-')
    document.getElementById('searchField').value = ''
    startSearchWithAuthor(author)
}

// funzione per trovare gli album di una utore tramite fetch, a partire da un url
let findAlbums = async function(url, authorId){
    const resp =  await fetch(url)
    let data = await resp.json()
    // console.log(data)
    let albums = []
    //mappo la response
    data.data.map((a) => {
        let album = {
            titolo: a.album.title,
            tracklist: a.album.id,
            cover: a.album.cover_big,
            artist: a.artist.name
        }
        // controllo che l'album non ci sia già nell'array
        !albums.some(element => element.titolo === album.titolo) ? albums.push(album) : null
    });
    return [albums, authorId]
}

// funzione che cicla su tutti gli album in un array e crea le relative cards
let cycleAlbums = function(albumArray){
    authorSection.querySelectorAll('h2')[0].innerHTML = "Risultati Ricerca"
    for (let a of albumArray){
        createAlbumCard(a)
    }
}

// funzione per creare la singola card di un album
let createAlbumCard = function(album){
    let cardImage = cardHtml.querySelectorAll('img')[0]
    cardImage.setAttribute('src', album.cover)
    
    let albumTitle = cardHtml.querySelectorAll('h5')[0]
    albumTitle.innerHTML = album.titolo

    let albumAuthor = cardHtml.querySelectorAll('p')[0]
    albumAuthor.innerHTML = album.artist

    cardHtml.setAttribute('onClick', `getAlbum("${album.tracklist}", "${album.titolo}")`)
    
    cardHtml.classList.remove('d-none')
    // console.log(cardHtml)
    
    authorSection.querySelectorAll('div')[0].appendChild(cardHtml.cloneNode(true))
    // console.log(authorSection)
}

// funzione che dato l'autore, cerca gli album e li inserisce nel dom (funzione iniziale)
let startSearchWithAuthor = async function(author){
    let completeUrl = albumUrl + author
    let [albumData, authorId] =  await  findAlbums(completeUrl, author)
    authorSection.querySelectorAll('div')[0].innerHTML = ''
    cycleAlbums(albumData)
}

// funzione per far apparire il modale con le tracce
let getAlbum = async function(trackList, titolo){
    let songsArray = await findTracks(trackUrl+trackList)
    // aggiorno il titolo
    tracksModal.querySelector('h3').innerHTML = titolo

    // pulisco il modale
    cleanTracks()

    // creo le righe per il modale
    songsArray.forEach((s,i) => {
        createTracksRow(s,i+1)
    })

    // apro il modale
    $("#tracksModal").modal()
}

// funzione per pulire le tracce dal modale
let cleanTracks = function(){
    let tab = tracksModal.querySelector('tbody')
    
    // individuo la prima row
    let childDaEliminare = tab.querySelectorAll('tr')[0]
    
    // finché ci sono row da eliminare le rimuovo
    while (childDaEliminare){
        tab.removeChild(childDaEliminare)
        childDaEliminare = tab.querySelectorAll('tr')[0]
    }
}

// funcione per creare una riga della tabella nel modale
let createTracksRow = function(song, i){
    let tab = tracksModal.querySelector('tbody')
    // creo una riga
    let row = document.createElement('tr')
    // creo il primo td con il numero della canzone
    let nr = document.createElement('td')
    nr.innerHTML = i
    row.appendChild(nr)
    
    // ciclo per ogni chiave dell'array e creo un elemento td per la row
    Object.keys(song).forEach(key => {
        let r = document.createElement('td')
        r.innerHTML = song[key]
        row.appendChild(r)
    });

    // creo il td per il pulsante Play
    let play = document.createElement('td')
    play.innerHTML = 'Play'
    row.appendChild(play)

    // appendo il tutto alla tabella
    tab.appendChild(row)

}

// funzione per individuare le tracce di un album
let findTracks = async function(url){
    const resp =  await fetch(url)
    let data = await resp.json()
    // console.log(data)
    let songs = []
    data.tracks.data.map((s) => {
        let song = {
            title: s.title_short,
            artist: s.artist.name,
            duration: new Date(s.duration * 1000).toISOString().substring(14, 19)
        }
        songs.push(song)
    });
    return songs
}



// fast load album
// onload = (e) => {
//     startSearchWithAuthor('static-x')
// }