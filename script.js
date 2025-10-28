// Global State
const state = { 
    activeTrack: 0, 
    isPlaying: false 
};

// Select elements (Assumes corresponding IDs/Classes exist in Home.html)
const audio = document.getElementById("audio-player");
const ui = {
    seekBar: document.querySelector(".seek-bar"),
    volumeBar: document.querySelector(".volume-bar"),
    showPlayListBtn: document.querySelector(".show"),
    hidePlayListBtn: document.querySelector(".hide"),
    prevBtn: document.querySelector(".prev"),
    nextBtn: document.querySelector(".next"),
    playPauseBtn: document.querySelector(".play-pause"),
    playList: document.querySelector(".playlist"),
    playListContent: document.querySelector(".playlist-content"),
    artwork: document.querySelector(".artwork"),
    trackName: document.querySelector(".name"),
    artist: document.querySelector(".artist"),
    currentTime: document.querySelector(".current-time"),
    duration: document.querySelector(".duration")
};

// --- Player Initialization and Core Functions ---

// Initialize player
function initPlayer() {
    console.log("Initializing player...");

    // Basic check for tracks array (Assumes 'tracks' is defined in tracks.js)
    if (typeof tracks === 'undefined' || tracks.length === 0) {
        console.error("Error: 'tracks' array is not defined or is empty. Please check tracks.js.");
        return; 
    }

    loadTrack(state.activeTrack);
    setupEventListeners();
    
    // Set initial volume based on the volume bar's value
    audio.volume = ui.volumeBar.value / 100;
}

// Load track
function loadTrack(trackIndex) {
    console.log("Loading track:", trackIndex);
    
    const track = tracks[trackIndex];
    state.activeTrack = trackIndex;
    
    // Update UI with new track info
    ui.artwork.src = track.artwork;
    ui.trackName.textContent = track.name;
    ui.artist.textContent = track.artist;
    
    // Reset UI time and seek bar
    ui.seekBar.value = 0;
    // UPDATED: Set initial seek bar style to 0%
    updateSeekStyle(); 
    ui.currentTime.textContent = "0:00";
    ui.duration.textContent = "0:00";
    
    // Set audio source and load the new track
    audio.src = track.path;
    audio.load();
    
    console.log("Audio source set to:", track.path);
    
    // Re-render playlist to highlight the new active track
    renderPlaylist();
}

// Setup event listeners
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Play/Pause
    ui.playPauseBtn.addEventListener("click", togglePlayPause);
    
    // Previous/Next
    ui.prevBtn.addEventListener("click", playPrevious);
    ui.nextBtn.addEventListener("click", playNext);
    
    // Seek bar: 'input' for smooth dragging, 'change' for final value
    ui.seekBar.addEventListener("input", seekAudio);
    ui.seekBar.addEventListener("change", seekAudio);
    
    // Volume
    ui.volumeBar.addEventListener("input", updateVolume);
    
    // Playlist visibility
    ui.showPlayListBtn.addEventListener("click", showPlaylist);
    ui.hidePlayListBtn.addEventListener("click", hidePlaylist);
    
    // Audio events
    audio.addEventListener("loadedmetadata", () => {
        console.log("Audio metadata loaded, duration:", audio.duration);
        updateDuration();
    });
    
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", playNext); // Automatically play next track when current one ends
    
    audio.addEventListener("play", () => {
        state.isPlaying = true;
        updatePlayButton();
    });
    
    audio.addEventListener("pause", () => {
        state.isPlaying = false;
        updatePlayButton();
    });
    
    audio.addEventListener("waiting", () => {
        console.log("Audio buffering...");
    });
    
    audio.addEventListener("playing", () => {
        console.log("Audio resumed playing");
    });
    
    audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        console.error("Error details:", audio.error);
        alert("An error occurred loading the track. See console for details.");
    });
}

// --- Playback Controls ---

// Toggle play/pause
function togglePlayPause() {
    console.log("Toggle play/pause, currently playing:", state.isPlaying);
    
    if (state.isPlaying) {
        audio.pause();
    } else {
        // Use Promise to handle autoplay policy restrictions
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log("Audio started playing");
                })
                .catch(error => {
                    console.error("Error playing audio (Autoplay Blocked?):", error);
                    state.isPlaying = false; // Reset state if play fails
                    updatePlayButton();
                });
        }
    }
}

// Update play button appearance (and playlist button)
function updatePlayButton() {
    // Toggles a CSS class, which typically changes the play/pause icon
    if (state.isPlaying) {
        ui.playPauseBtn.classList.remove("paused");
    } else {
        ui.playPauseBtn.classList.add("paused");
    }
    // Re-render the playlist to update the play/pause icon next to the active track
    renderPlaylist(); 
}

// Play previous track
function playPrevious() {
    console.log("Previous track");
    // Calculates the previous track index, looping back to the end if at the start
    state.activeTrack = (state.activeTrack - 1 + tracks.length) % tracks.length;
    loadTrack(state.activeTrack);
    
    // Automatically play if it was playing before
    if (state.isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.error("Error playing previous track:", error));
        }
    }
}

// Play next track
function playNext() {
    console.log("Next track");
    // Calculates the next track index, looping back to the start if at the end
    state.activeTrack = (state.activeTrack + 1) % tracks.length;
    loadTrack(state.activeTrack);
    
    // Automatically play if it was playing before
    if (state.isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.error("Error playing next track:", error));
        }
    }
}

// --- Seek and Volume ---

/**
 * NEW FUNCTION: Updates the CSS custom property on the seek bar
 * to enable dynamic coloring of the track based on progress.
 */
function updateSeekStyle() {
    // The value of the range input (0-100) is used to set the width percentage
    const progress = ui.seekBar.value; 
    ui.seekBar.style.setProperty('--seek-progress', `${progress}%`);
}


// Seek audio
function seekAudio() {
    if (!audio.duration || isNaN(audio.duration)) {
        return;
    }
    
    try {
        // Calculate the seek time based on the seek bar's percentage value (0-100)
        const seekTime = (ui.seekBar.value / 100) * audio.duration;
        if (!isNaN(seekTime) && isFinite(seekTime)) {
            audio.currentTime = seekTime;
            // Instantly update the displayed time for a responsive feel
            ui.currentTime.textContent = formatTime(seekTime); 
            console.log("Seeking to:", seekTime);
            
            // UPDATED: Update the CSS style while seeking
            updateSeekStyle();
        }
    } catch (error) {
        console.error("Error seeking audio:", error);
    }
}

// Update volume
function updateVolume() {
    // Volume is a value between 0 and 1
    audio.volume = ui.volumeBar.value / 100;
    console.log("Volume updated to:", audio.volume);
}

// Update progress (called on 'timeupdate' event)
function updateProgress() {
    if (!audio.duration || isNaN(audio.duration)) {
        return;
    }
    
    try {
        const progress = (audio.currentTime / audio.duration) * 100;
        // Updates the seek bar position
        ui.seekBar.value = isNaN(progress) ? 0 : progress; 
        // Updates the current time display
        ui.currentTime.textContent = formatTime(audio.currentTime); 

        // UPDATED: Update the CSS style with current progress
        updateSeekStyle();
        
        // Failsafe: Update duration if it somehow wasn't set earlier
        if (ui.duration.textContent === "0:00") {
            updateDuration();
        }
        
        // Safeguard for player state
        if (audio.currentTime >= audio.duration) {
            state.isPlaying = false; 
            updatePlayButton();
        }
    } catch (error) {
        console.error("Error updating progress:", error);
    }
}

// Update duration display
function updateDuration() {
    if (audio.duration && !isNaN(audio.duration)) {
        ui.duration.textContent = formatTime(audio.duration);
        console.log("Duration updated to:", formatTime(audio.duration));
    }
}

// Format time (e.g., 65 seconds -> 1:05)
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    // padStart ensures seconds is always two digits (e.g., '05' instead of '5')
    return `${min}:${sec.toString().padStart(2, '0')}`; 
}

// --- Playlist Management ---

// Show playlist by adding a class
function showPlaylist() {
    ui.playList.classList.add("show");
}

// Hide playlist by removing a class
function hidePlaylist() {
    ui.playList.classList.remove("show");
}

// Render the entire playlist structure
function renderPlaylist() {
    ui.playListContent.innerHTML = ''; // Clear previous list
    
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        // Add 'active' class to the currently playing track
        item.className = `item ${index === state.activeTrack ? 'active' : ''}`; 
        
        // Dynamically set the button icon for the active track
        const buttonHTML = index === state.activeTrack ? 
            `<button><i class="bi ${state.isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}"></i></button>` : 
            '';

        item.innerHTML = `
            <img src="${track.artwork}" alt="${track.name}">
            <div class="item-detail">
                <h4>${track.name}</h4>
                <p>${track.artist}</p>
            </div>
            ${buttonHTML}
        `;
        
        // Handle playlist item click
        item.addEventListener('click', () => {
            if (index !== state.activeTrack) {
                // If a new track is selected, load it
                state.activeTrack = index;
                loadTrack(index);
                // If the player was playing, start the new track immediately
                if (state.isPlaying) {
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => console.error("Error playing track from playlist:", error));
                    }
                }
            } else {
                // If the active track is clicked, simply toggle play/pause
                togglePlayPause();
            }
        });
        
        ui.playListContent.appendChild(item);
    });
}

// --- Debugging ---

// Debug state function for console inspection
function debugState() {
    console.log("Current state:", {
        activeTrack: state.activeTrack,
        isPlaying: state.isPlaying,
        audio: {
            currentTime: audio.currentTime,
            duration: audio.duration,
            paused: audio.paused,
            readyState: audio.readyState,
            error: audio.error
        },
        ui: {
            seekBarValue: ui.seekBar.value,
            currentTimeText: ui.currentTime.textContent,
            durationText: ui.duration.textContent
        }
    });
}

// --- Initialization Trigger ---

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initPlayer);

// Add debug function to window for testing (optional but useful)
window.debugPlayer = debugState;