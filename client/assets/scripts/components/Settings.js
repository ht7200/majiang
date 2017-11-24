cc.Class({
  extends: cc.Component,

  properties: {
    btnYXOpen: null,
    btnYXClose: null,
    btnYYOpen: null,
    btnYYClose: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    this.btnYXOpen = this.node
      .getChildByName('yinxiao')
      .getChildByName('btn_yx_open');
    this.btnYXClose = this.node
      .getChildByName('yinxiao')
      .getChildByName('btn_yx_close');

    this.btnYYOpen = this.node
      .getChildByName('yinyue')
      .getChildByName('btn_yy_open');
    this.btnYYClose = this.node
      .getChildByName('yinyue')
      .getChildByName('btn_yy_close');

    this.initButtonHandler(this.node.getChildByName('btn_close'));
    this.initButtonHandler(this.node.getChildByName('btn_exit'));

    this.initButtonHandler(this.btnYXOpen);
    this.initButtonHandler(this.btnYXClose);
    this.initButtonHandler(this.btnYYOpen);
    this.initButtonHandler(this.btnYYClose);

    const slider = this.node.getChildByName('yinxiao').getChildByName('progress');
    cc.vv.utils.addSlideEvent(slider, this.node, 'Settings', 'onSlided');

    const pslider = this.node.getChildByName('yinyue').getChildByName('progress');
    cc.vv.utils.addSlideEvent(pslider, this.node, 'Settings', 'onSlided');

    this.refreshVolume();
  },

  onSlided(slider) {
    if (slider.node.parent.name === 'yinxiao') {
      cc.vv.audioMgr.setSFXVolume(slider.progress);
    } else if (slider.node.parent.name === 'yinyue') {
      cc.vv.audioMgr.setBGMVolume(slider.progress);
    }
    this.refreshVolume();
  },

  initButtonHandler(btn) {
    cc.vv.utils.addClickEvent(btn, this.node, 'Settings', 'onBtnClicked');
  },

  refreshVolume() {
    this.btnYXClose.active = cc.vv.audioMgr.sfxVolume > 0;
    this.btnYXOpen.active = !this.btnYXClose.active;

    const yx = this.node.getChildByName('yinxiao');
    const width = 430 * cc.vv.audioMgr.sfxVolume;
    const progress = yx.getChildByName('progress');
    progress.getComponent(cc.Slider).progress = cc.vv.audioMgr.sfxVolume;
    progress.getChildByName('progress').width = width;
    // yx.getChildByName("btn_progress").x = progress.x + width;

    this.btnYYClose.active = cc.vv.audioMgr.bgmVolume > 0;
    this.btnYYOpen.active = !this.btnYYClose.active;
    // const yy = this.node.getChildByName('yinyue');
    const bWidth = 430 * cc.vv.audioMgr.bgmVolume;
    // const bProgress = yy.getChildByName('progress');
    progress.getComponent(cc.Slider).progress = cc.vv.audioMgr.bgmVolume;

    progress.getChildByName('progress').width = bWidth;
    // yy.getChildByName("btn_progress").x = progress.x + width;
  },

  onBtnClicked(event) {
    if (event.target.name === 'btn_close') {
      this.node.active = false;
    } else if (event.target.name === 'btn_exit') {
      cc.sys.localStorage.removeItem('wx_account');
      cc.sys.localStorage.removeItem('wx_sign');
      cc.director.loadScene('login');
    } else if (event.target.name === 'btn_yx_open') {
      cc.vv.audioMgr.setSFXVolume(1.0);
      this.refreshVolume();
    } else if (event.target.name === 'btn_yx_close') {
      cc.vv.audioMgr.setSFXVolume(0);
      this.refreshVolume();
    } else if (event.target.name === 'btn_yy_open') {
      cc.vv.audioMgr.setBGMVolume(1);
      this.refreshVolume();
    } else if (event.target.name === 'btn_yy_close') {
      cc.vv.audioMgr.setBGMVolume(0);
      this.refreshVolume();
    }
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
