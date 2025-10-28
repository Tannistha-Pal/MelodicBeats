const state = { 
    activeTrack: 0, 
    isPlaying: false 
};

// Select elements
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

// Initialize player
function initPlayer() {
    console.log("Initializing player...");
    loadTrack(state.activeTrack);
    setupEventListeners();
    
    // Set initial volume
    audio.volume = ui.volumeBar.value / 100;
}

// Load track
function loadTrack(trackIndex) {
    console.log("Loading track:", trackIndex);
    
    const track = tracks[trackIndex];
    state.activeTrack = trackIndex;
    
    // Update UI
    ui.artwork.src = track.artwork;
    ui.trackName.textContent = track.name;
    ui.artist.textContent = track.artist;
    
    // Reset UI
    ui.seekBar.value = 0;
    ui.currentTime.textContent = "0:00";
    ui.duration.textContent = "0:00";
    
    // Set audio source and load
    audio.src = track.path;
    audio.load();
    
    console.log("Audio source set to:", track.path);
    
    // Render playlist
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
    
    // Seek bar
    ui.seekBar.addEventListener("input", seekAudio);
    ui.seekBar.addEventListener("change", seekAudio);
    
    // Volume
    ui.volumeBar.addEventListener("input", updateVolume);
    
    // Playlist
    ui.showPlayListBtn.addEventListener("click", showPlaylist);
    ui.hidePlayListBtn.addEventListener("click", hidePlaylist);
    
    // Audio events
    audio.addEventListener("loadedmetadata", function() {
        console.log("Audio metadata loaded, duration:", audio.duration);
        updateDuration();
    });
    
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", playNext);
    audio.addEventListener("canplay", function() {
        console.log("Audio can play");
    });
    
    audio.addEventListener("error", function(e) {
        console.error("Audio error:", e);
        console.error("Error details:", audio.error);
    });
}

// Toggle play/pause
function togglePlayPause() {
    console.log("Toggle play/pause, currently playing:", state.isPlaying);
    
    if (state.isPlaying) {
        audio.pause();
        state.isPlaying = false;
    } else {
        audio.play().then(() => {
            state.isPlaying = true;
            console.log("Audio started playing");
        }).catch(error => {
            console.error("Error playing audio:", error);
            state.isPlaying = false;
        });
    }
    updatePlayButton();
}

// Update play button appearance
function updatePlayButton() {
    if (state.isPlaying) {
        ui.playPauseBtn.classList.remove("paused");
    } else {
        ui.playPauseBtn.classList.add("paused");
    }
    renderPlaylist();
}

// Play previous track
function playPrevious() {
    console.log("Previous track");
    state.activeTrack = (state.activeTrack - 1 + tracks.length) % tracks.length;
    loadTrack(state.activeTrack);
    if (state.isPlaying) {
        setTimeout(() => audio.play(), 100);
    }
}

// Play next track
function playNext() {
    console.log("Next track");
    state.activeTrack = (state.activeTrack + 1) % tracks.length;
    loadTrack(state.activeTrack);
    if (state.isPlaying) {
        setTimeout(() => audio.play(), 100);
    }
}

// Seek audio
function seekAudio() {
    if (audio.duration) {
        const seekTime = (ui.seekBar.value / 100) * audio.duration;
        audio.currentTime = seekTime;
        console.log("Seeking to:", seekTime);
    }
}

// Update volume
function updateVolume() {
    audio.volume = ui.volumeBar.value / 100;
    console.log("Volume updated to:", audio.volume);
}

// Update progress
function updateProgress() {
    if (audio.duration && !isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        ui.seekBar.value = progress;
        ui.currentTime.textContent = formatTime(audio.currentTime);
        
        // Update duration in case it wasn't set properly initially
        if (ui.duration.textContent === "0:00") {
            ui.duration.textContent = formatTime(audio.duration);
        }
    }
}

// Update duration
function updateDuration() {
    if (audio.duration && !isNaN(audio.duration)) {
        ui.duration.textContent = formatTime(audio.duration);
        console.log("Duration updated to:", formatTime(audio.duration));
    }
}

// Format time
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Show playlist
function showPlaylist() {
    ui.playList.classList.add("show");
}

// Hide playlist
function hidePlaylist() {
    ui.playList.classList.remove("show");
}

// Render playlist
function renderPlaylist() {
    ui.playListContent.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = `item ${index === state.activeTrack ? 'active' : ''}`;
        item.innerHTML = `
            <img src="${track.artwork}" alt="${track.name}">
            <div class="item-detail">
                <h4>${track.name}</h4>
                <p>${track.artist}</p>
            </div>
            ${index === state.activeTrack ? 
                `<button><i class="bi ${state.isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}"></i></button>` : 
                ''}
        `;
        
        item.addEventListener('click', () => {
            if (index !== state.activeTrack) {
                state.activeTrack = index;
                loadTrack(index);
                if (state.isPlaying) {
                    setTimeout(() => audio.play(), 100);
                }
            } else {
                togglePlayPause();
            }
        });
        
        ui.playListContent.appendChild(item);
    });
}

// Add a function to debug the current state
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initPlayer);

// Add debug function to window for testing
window.debugPlayer = debugState;