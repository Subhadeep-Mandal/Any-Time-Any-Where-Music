console.log('It\'s JavaScript');

async function getsongs() {
    try {
        let response = await fetch("http://127.0.0.1:5500/SPOTIFY/Songs/");
        let text = await response.text();
        console.log(text);

        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");

        let songs = [];
        for (let element of as) {
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split("/Songs/")[1]));
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

async function main() {
    let songs = await getsongs();
    console.log(songs);
    let songUl = document.querySelector(".songslist ul");

    if (songUl) {
        for (const song of songs) {
            // Split the song string into title and artist
            let [title, artist] = song.split(" - ");
            artist = artist?.replace(".mp3", ""); // Remove the file extension

            // Append the song to the list
            songUl.innerHTML += `
                <li>
                    <img class="cd" src="musicicon.png" alt=""> 
                    <div class="infocd">
                        <div class="info">
                            <div> Song - ${title || "Unknown Title"}</div>
                            <div>Ft - ${artist || "Unknown Artist"}</div>
                        </div>
                        <div><img class="libplay" src="play.svg" alt="play"></div>
                    </div>
                </li>`;
        }
    } else {
        console.error("Song list element not found!");
    }
}

// Call the main function to execute the code
main();
