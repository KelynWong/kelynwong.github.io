// Ensure the audio element is properly referenced and the play method is triggered correctly
mounted() {
    this.audio = this.$refs.audioEl;
},
methods: {
    togglePlay() {
        if (this.audio.paused) {
            this.audio.play().catch(error => {
                console.error('Playback error:', error);
            });
        } else {
            this.audio.pause();
        }
    },
    selectTrack(track) {
        this.audio.src = track.src;
        this.audio.play().catch(error => {
            console.error('Playback error:', error);
        });
    }
}