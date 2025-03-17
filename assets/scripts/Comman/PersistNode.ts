import {
  _decorator,
  AudioSource,
  Component,
  director,
  Label,
  Node,
  ProgressBar,
} from "cc";

import { GameManager } from "../Managers/GameManager";
import { SoundManager } from "../Managers/SoundManager";
import { ResourcesManager } from "../Managers/ResourcesManager";
import {
  ASSET_CACHE_MODE,
  CUSTOM_EVENT,
  MAX_PLAYERS_DATA,
  SOUNDS_NAME,
} from "../Constants/Constant";
const { ccclass, property } = _decorator;

@ccclass("PersistNode")
export class PersistNode extends Component {

  @property({ type: AudioSource })
  musicAudioSource: AudioSource = null;
  @property({ type: AudioSource })
  soundAudioSource: AudioSource = null;

  @property({ type: ProgressBar })
  loadingProgress: ProgressBar = null!;
  @property({ type: Node })
  gameName: Node = null!;

  start() {
    director.addPersistRootNode(this.node);
    GameManager.Instance.PersistNodeRef = this;
    this.initAudioSource();
    this.loadAudios();
  }

  initAudioSource() {
    SoundManager.getInstance().init(
      this.musicAudioSource.getComponent(AudioSource)!
    );
    SoundManager.getInstance().initSoundEffectAS(
      this.soundAudioSource.getComponent(AudioSource)!
    );
  }

  playAudio(clip, isloopOn: boolean) {
    SoundManager.getInstance().playMusicClip(clip, isloopOn);
  }
  playEffect(clip) {
    SoundManager.getInstance().playSoundEffect(clip, false);
  }
  stopAudio() {
    SoundManager.getInstance().stopMusic();
  }
  resumeAudio() {
    SoundManager.getInstance().playMusic(true);
  }

  async loadAudios() {
    let audioResources = [
      { BackgroundMusic: "Sounds/BackgroundMusic" },
      { Attack: "Sounds/Attack" },
      { Dead: "Sounds/Dead" },
      { Shield: "Sounds/Shield" },
      { Heal: "Sounds/Heal" },
      { GameEnd: "Sounds/GameEnd" },
    ];
    let playerReources = [];
    for (let index = 1; index <= MAX_PLAYERS_DATA; index++) {
      playerReources.push({ index: `PlayersData/PlayersData${index}` });
    }
    let resouresToBeLoaded = [...playerReources, ...audioResources];
    await ResourcesManager.loadArrayOfResource(
      resouresToBeLoaded,
      ASSET_CACHE_MODE.Normal,
      this.loading
    );

    SoundManager.getInstance().setMusicVolume(0.5);
    SoundManager.getInstance().setEffectsVolume(1);

    this.playAudio(
      ResourcesManager.Instance.getResourceFromCache(
        SOUNDS_NAME.BACKGROUND_MUSIC
      ),
      true
    );
  }

  loading = (progress: number) => {
    this.loadingProgress.progress = progress;
    if (progress >= 1) {
      this.loadingProgress.node.active = false;
      this.gameName.active = false;
      director.emit(CUSTOM_EVENT.LOADING_DONE);
    }
  };
}
