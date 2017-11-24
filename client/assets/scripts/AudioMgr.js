cc.Class({
  extends: cc.Component,

  properties: {
    bgmVolume: 1.0,
    sfxVolume: 1.0,
    bgmAudioID: -1
  },

  init() {
    const t = cc.sys.localStorage.getItem('bgmVolume');
    if (t != null) {
      this.bgmVolume = parseFloat(t);
    }

    const ts = cc.sys.localStorage.getItem('sfxVolume');
    if (ts != null) {
      this.sfxVolume = parseFloat(t);
    }

    cc.game.on(cc.game.EVENT_HIDE, () => {
      cc.audioEngine.pauseAll();
    });
    cc.game.on(cc.game.EVENT_SHOW, () => {
      cc.audioEngine.resumeAll();
    });
  },

  getUrl(url) {
    return cc.url.raw(`resources/sounds/${url}`);
  },

  playBGM(url) {
    const audioUrl = this.getUrl(url);
    if (this.bgmAudioID >= 0) {
      cc.audioEngine.stop(this.bgmAudioID);
    }
    this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
  },

  playSFX(url) {
    const audioUrl = this.getUrl(url);
    if (this.sfxVolume > 0) {
      cc.audioEngine.play(audioUrl, false, this.sfxVolume);
    }
  },

  setSFXVolume(v) {
    if (this.sfxVolume !== v) {
      cc.sys.localStorage.setItem('sfxVolume', v);
      this.sfxVolume = v;
    }
  },

  setBGMVolume(v, force) {
    if (this.bgmAudioID >= 0) {
      if (v > 0) {
        cc.audioEngine.resume(this.bgmAudioID);
      } else {
        cc.audioEngine.pause(this.bgmAudioID);
      }
      // cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
    }
    if (this.bgmVolume !== v || force) {
      cc.sys.localStorage.setItem('bgmVolume', v);
      this.bgmVolume = v;
      cc.audioEngine.setVolume(this.bgmAudioID, v);
    }
  },

  pauseAll() {
    cc.audioEngine.pauseAll();
  },

  resumeAll() {
    cc.audioEngine.resumeAll();
  }
});
