console.log("It's JavaScript");

let currentSong = new Audio();

async function getsongs() {
    try {
        // Fetch the list of songs from the server
        let response = await fetch("http://127.0.0.1:5500/SPOTIFY/Songs/");
        let text = await response.text();
        console.log("Fetched directory:", text);

        // Parse the response to extract song filenames
        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");

        let songs = [];
        for (let link of links) {
            if (link.href.endsWith(".mp3")) {
                // Decode the file name and push it to the songs array
                songs.push(decodeURIComponent(link.href.split("/Songs/")[1])); 
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track) => {
    // Construct the full URL for the audio file
    const baseUrl = "http://127.0.0.1:5500/SPOTIFY/Songs/";
    currentSong.src = baseUrl + encodeURIComponent(track);
    currentSong.play()
        .then(() => {
            console.log("Playing:", track);
        })
        .catch((error) => {
            console.error("Error playing track:", error);
        });
};

async function main() {
    let songs = await getsongs();
    console.log("Songs list:", songs);

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

        // Attach event listeners to each song
        document.querySelectorAll(".songslist li").forEach((li) => {
            li.addEventListener("click", () => {
                let fullTitle = li.querySelector(".info div:first-child").innerText.replace("Song - ", "").trim();
                let artist = li.querySelector(".info div:nth-child(2)").innerText.replace("Ft - ", "").trim();

                // Construct the full file name
                let track = `${fullTitle} - ${artist}.mp3`;
                console.log("Track selected:", track);

                // Play the selected song
                playMusic(track);
            });
        });
    } else {
        console.error("Song list element not found!");
    }
}

//Attach an event listner to plan next and preious

play.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src="pause.svg"
    }
    else{
        currentSong.pause()
        pause.src="play-button.svg"
    }
})

// Call the main function to execute the code
main();
