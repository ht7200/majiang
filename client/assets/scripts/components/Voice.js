cc.Class({
  extends: cc.Component,

  properties: {
    lastTouchTime: null,
    voice: null,
    volume: null,
    voice_failed: null,
    lastCheckTime: -1,
    timeBar: null,
    MAX_TIME: 15000
  },

  // use this for initialization
  onLoad() {
    this.voice = cc.find('Canvas/voice');
    this.voice.active = false;

    this.voice_failed = cc.find('Canvas/voice/voice_failed');
    this.voice_failed.active = false;

    this.timeBar = cc.find('Canvas/voice/time');
    this.timeBar.scaleX = 0.0;

    this.volume = cc.find('Canvas/voice/volume');
    for (let i = 1; i < this.volume.children.length; i++) {
      this.volume.children[i].active = false;
    }

    const btnVoice = cc.find('Canvas/voice/voice_failed/btn_ok');
    if (btnVoice) {
      cc.vv.utils.addClickEvent(btnVoice, this.node, 'Voice', 'onBtnOKClicked');
    }

    // const btnVoice = cc.find('Canvas/btn_voice');
    if (btnVoice) {
      btnVoice.on(cc.Node.EventType.TOUCH_START, () => {
        cc.vv.voiceMgr.prepare('record.amr');
        this.lastTouchTime = Date.now();
        this.voice.active = true;
        this.voice_failed.active = false;
      });

      btnVoice.on(cc.Node.EventType.TOUCH_MOVE, () => {
      });

      btnVoice.on(cc.Node.EventType.TOUCH_END, () => {
        if (Date.now() - this.lastTouchTime < 1000) {
          this.voice_failed.active = true;
          cc.vv.voiceMgr.cancel();
        } else {
          this.onVoiceOK();
        }
        this.lastTouchTime = null;
      });

      btnVoice.on(cc.Node.EventType.TOUCH_CANCEL, () => {
        cc.vv.voiceMgr.cancel();
        this.lastTouchTime = null;
        this.voice.active = false;
      });
    }
  },

  onVoiceOK() {
    if (this.lastTouchTime != null) {
      cc.vv.voiceMgr.release();
      const time = Date.now() - this.lastTouchTime;
      const msg = cc.vv.voiceMgr.getVoiceData('record.amr');
      cc.vv.net.send('voice_msg', { msg, time });
    }
    this.voice.active = false;
  },

  onBtnOKClicked() {
    this.voice.active = false;
  },

  // called every frame, uncomment this function to activate update callback
  update() {
    if (this.voice.active && this.voice_failed.active) {
      if (Date.now() - this.lastCheckTime > 300) {
        for (let i = 0; i < this.volume.children.length; i++) {
          this.volume.children[i].active = false;
        }
        const v = cc.vv.voiceMgr.getVoiceLevel(7);
        if (v >= 1 && v <= 7) {
          this.volume.children[v - 1].active = true;
        }
        this.lastCheckTime = Date.now();
      }
    }

    if (this.lastTouchTime) {
      const time = Date.now() - this.lastTouchTime;
      if (time >= this.MAX_TIME) {
        this.onVoiceOK();
        this.lastTouchTime = null;
      } else {
        const percent = time / this.MAX_TIME;
        this.timeBar.scaleX = 1 - percent;
      }
    }
  }
});
