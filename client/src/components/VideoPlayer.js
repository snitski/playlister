import {
    IconButton,
    Typography
} from '@mui/material'
import {
    FastForward,
    FastRewind,
    PlayArrow,
    Pause
} from '@mui/icons-material'
import YouTube from 'react-youtube';
import { useContext, useEffect, useState } from 'react';
import GlobalStoreContext from '../store';

export default function VideoPlayer( ) {
    const { store } = useContext(GlobalStoreContext);
    const [ playerReference, setPlayerReference ] = useState(null);
    const [ currentSong, setCurrentSong ] = useState(0);
    const [ playing, setPlaying ] = useState(false);
    // let currentSong = 0;

    useEffect(() => {
        try {
            // currentSong = 0;
            setCurrentSong(0);
            setPlaying(false);
            if(playerReference && store.openedPlaylist) {
                loadSong(playerReference);
            }
        }
        catch(error) {
            console.log(error);
        }
    }, [store])

    if(!store.openedPlaylist) return '';

    let playlist = []
    try {
        playlist = store.openedPlaylist.songs.map((song) => {return song.youTubeId});
    }
    catch(error) {
        return '';
    }

    const playerOptions = {
        height: '240',
        width: '426',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 0,
            controls: 0
        }
    };

    const loadSong = (player) => {
        console.log("LOADING SONG HERE")
        let song = playlist[currentSong];
        player.cueVideoById(song);
    }

    const loadAndPlaySong = (player) => {
        let song = playlist[currentSong];
        player.loadVideoById(song);
    }

    const incSong = () => {
        // currentSong++;
        // currentSong = currentSong % playlist.length;
        setCurrentSong((currentSong + 1) % playlist.length);
    }

    const decSong = () => {
        if(currentSong == 0) {
            // currentSong = playlist.length-1;
            setCurrentSong(playlist.length-1)
        }
        else {
            // currentSong--;
            setCurrentSong(currentSong-1);
        }
    }

    const onPlayerReady = (event) => {
        setPlayerReference(event.target);
        loadSong(event.target);
    }

    const onPlayerStateChange = (event) => {
        let playerStatus = event.data;
        setPlayerReference(event.target);
        if (playerStatus === -1) {
            console.log("-1 Video not started yet")
        } 
        else if (playerStatus === 0) {
            incSong();
            console.log("0 Video Ended")
            loadAndPlaySong(event.target);
        } 
        else if (playerStatus === 1) {
            console.log("1 Video played");
            if(!playing) {
                setPlaying(true);
            }
        } 
        else if (playerStatus === 2) {
            console.log("2 Video paused");
            if(playing) {
                setPlaying(false);
            }
        } 
        else if (playerStatus === 3) {
            console.log("3 Video buffering");
        } 
        else if (playerStatus === 5) {
            console.log("5 Video cued");
            if(playing) {
                event.target.playVideo();
            }
        }
    }

    const handlePlayButton = () => {
        setPlaying(true);
        playerReference.playVideo();
    }

    const handleStopButton = () => {
        setPlaying(false);
        playerReference.pauseVideo();
    }

    const handleFastForwardButton = () => {
        incSong();
        loadAndPlaySong(playerReference);
    }

    const handleFastRewindButton = () => {
        decSong();
        loadAndPlaySong(playerReference);
    }

    return (
        <div className='center-children' style={{flexDirection: 'column'}}>
            <div id='youtube-player-area' className='center-children'>
                <YouTube 
                    videoId={playlist[currentSong]}
                    opts={playerOptions}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange} 
                />
            </div>
            <div id='youtube-player-area' >
                <Typography sx={{fontWeight: 'bold'}}>{store.openedPlaylist.name}</Typography>
                <Typography>Song #{currentSong + 1}:</Typography>
                <Typography sx={{fontWeight: 'bold'}}>{store.openedPlaylist.songs[currentSong].title} by {store.openedPlaylist.songs[currentSong].artist}</Typography>
            </div>
            <div className='center-children' id='youtube-player-area' >
                <IconButton onClick={handleFastRewindButton}><FastRewind /></IconButton>
                {playing ? <IconButton onClick={handleStopButton}><Pause /></IconButton> :
                <IconButton onClick={handlePlayButton}><PlayArrow /></IconButton>}
                <IconButton onClick={handleFastForwardButton}><FastForward /></IconButton>
            </div>
        </div>
    );
}