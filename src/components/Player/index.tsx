import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';
import Episdode from '../../pages/episodes/[slug]';
import Slider from 'rc-slider/'

import 'rc-slider/assets/index.css'

import styles from './style.module.scss'
import { convertDurationToTimeString } from '../../utils/convertDurantionToTimeString';

export function Player() {

    const audioRef = useRef<HTMLAudioElement>(null)

    const [progress, setProgress] = useState(0)

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        tooglePlay,
        toogleLoop,
        toogleShuffle,
        isLooping,
        isShuffling,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        clearPlayerState,
        hasPrevious
        } = usePlayer()

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();
        }else {
            audioRef.current.pause();
        }

    }, [isPlaying])

    function handleEpisodeEnded () {
        if(hasNext) {
            playNext()
        } else {
            clearPlayerState()
        }
    }


    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount
        setProgress(amount)

    }

    function setupProgressListener() {
        audioRef.current.currentTime = 0

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    const episode = episodeList[currentEpisodeIndex]


    return(
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando Agora</strong>
            </header>
          
            {episode ? (
            <div className={styles.currentEpisode}>
                <Image width={592} height={592} src={episode.thumbnail} objectFit='cover'/>
                <strong>{episode.title}</strong>
                <span>{episode.members}</span>

            </div>
            ) : (

                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
  
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{backgroundColor: '#04d361'}}
                                railStyle={{backgroundColor: '#9f75ff'}}
                                handleStyle={{borderColor: '#04d361', borderWidth: 4}}

                            />

                        ) : (
                        <div className={styles.emptySlider}></div>)}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio
                    src={episode.url}
                    ref={audioRef}
                    autoPlay
                    onEnded={handleEpisodeEnded}
                    loop={isLooping}
                    onPlay={() => setPlayingState(true)}
                    onPause={() => setPlayingState(false)}
                    onLoadedMetadata={setupProgressListener}
                    />
                )}

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={!episode || episodeList.length == 1}
                        onClick={toogleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                        
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                    </button>
                    <button type="button" className={styles.playButton} disabled={!episode} onClick={tooglePlay}>
                       {isPlaying ? <img src="/pause.svg" alt="Pause"/>
                       : <img src="/play.svg" alt="Tocar"/> }
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima"/>
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode}
                        onClick={toogleLoop}
                        className={isLooping ? styles.isActive : ''}
                        >
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}