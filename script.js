console.log("It's JavaScript");

let songs = []; // Global songs array
let currentSong = new Audio();

async function getsongs() {
    try {
        let response = await fetch("http://127.0.0.1:5500/SPOTIFY/Songs/");
        let text = await response.text();

        console.log("Fetched directory:", text);

        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");

        songs = []; // Reset global songs array
        for (let link of links) {
            if (link.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(link.href.split("/Songs/")[1]));
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const playMusic = async (track, pause = false) => {
    const baseUrl = "http://127.0.0.1:5500/SPOTIFY/Songs/";
    currentSong.src = baseUrl + encodeURIComponent(track);

    try {
        if (!pause) {
            await currentSong.play();
            console.log("Playing:", track);
            play.src = "SVGs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "SVGs/play-button.svg";
        }
    } catch (error) {
        console.error("Error playing track:", error);
    }

    document.querySelector(".songname").innerHTML = `Now Playing - ` + track;
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
};

async function main() {
    await getsongs(); // Update the global songs array
    console.log("Songs list:", songs);

    // Start with the first song paused
    playMusic(songs[0], true);

    let songUl = document.querySelector(".songslist ul");

    if (songUl) {
        for (const song of songs) {
            let [title, artist] = song.split(" - ");
            artist = artist?.replace(".mp3", "");

            songUl.innerHTML += `
                <li>
                    <img class="cd" src="JPGs/musicicon.jpg" alt=""> 
                    <div class="infocd">
                        <div class="info">
                            <div> Song - ${title || "Unknown Title"}</div>
                            <div>Ft - ${artist || "Unknown Artist"}</div>
                        </div>
                        <div><img class="libplay" src="SVGs/play.svg" alt="play"></div>
                    </div>
                </li>`;
        }

        document.querySelectorAll(".songslist li").forEach((li) => {
            li.addEventListener("click", () => {
                let fullTitle = li.querySelector(".info div:first-child").innerText.replace("Song - ", "").trim();
                let artist = li.querySelector(".info div:nth-child(2)").innerText.replace("Ft - ", "").trim();

                let track = `${fullTitle} - ${artist}.mp3`;
                console.log("Track selected:", track);

                playMusic(track);
            });
        });
    } else {
        console.error("Song list element not found!");
    }
}

// Fix missing variables
const play = document.querySelector("#play");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");

// Event listener: play/pause toggle
play.addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "SVGs/pause.svg";
    } else {
        currentSong.pause();
        play.src = "SVGs/play-button.svg";
    }
});

// Listen for time updates
currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

// Seekbar listener
document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
});

// Hamburger and close listeners
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
});
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
});

// Previous button functionality
previous.addEventListener("click", () => {
    let currentIndex = songs.findIndex(song => song === decodeURIComponent(currentSong.src.split("/").pop()));

    if (currentIndex > 0) {
        playMusic(songs[currentIndex - 1]);
    } else {
        console.log("This is the first song.");
    }
});

// Next button functionality
next.addEventListener("click", () => {
    let currentIndex = songs.findIndex(song => song === decodeURIComponent(currentSong.src.split("/").pop()));

    if (currentIndex < songs.length - 1) {
        playMusic(songs[currentIndex + 1]);
    } else {
        console.log("This is the last song.");
    }
});

// Add volume listener
document.addEventListener("DOMContentLoaded", () => {
    const rangeInput = document.querySelector(".volume input#volume"); // Select the volume range input
    const volumeIcon = document.querySelector(".volume img"); // Select the volume icon
    let previousVolume = 0.5; // Store the last non-zero volume level

    if (rangeInput && volumeIcon) {
        // Initialize the volume slider and current song volume
        rangeInput.value = previousVolume * 100; // Set the slider to match the initial volume
        currentSong.volume = previousVolume;

        // Update the volume when the slider changes
        rangeInput.addEventListener("input", (e) => {
            const volume = parseInt(e.target.value, 10) / 100; // Convert range value to a 0-1 scale
            currentSong.volume = volume;

            if (volume === 0) {
                volumeIcon.src = "SVGs/mute.svg"; // Change to mute icon
            } else {
                volumeIcon.src = "SVGs/volume.svg"; // Change to regular volume icon
                previousVolume = volume; // Save the current volume for toggling
            }
        });

        // Toggle mute when the volume icon is clicked
        volumeIcon.addEventListener("click", () => {
            if (currentSong.volume === 0) {
                // Restore the previous volume
                currentSong.volume = previousVolume;
                rangeInput.value = previousVolume * 100; // Update the slider to match the restored volume
                volumeIcon.src = "SVGs/volume.svg"; // Change to regular volume icon
            } else {
                // Mute the volume
                previousVolume = currentSong.volume; // Save the current volume
                currentSong.volume = 0;
                rangeInput.value = 0; // Update the slider to 0
                volumeIcon.src = "SVGs/mute.svg"; // Change to mute icon
            }
        });
    } else {
        if (!rangeInput) console.error("Volume input element not found.");
        if (!volumeIcon) console.error("Volume icon element not found.");
    }
});


// Call the main function
main();
