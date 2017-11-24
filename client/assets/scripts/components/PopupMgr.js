cc.Class({
  extends: cc.Component,

  properties: {
    popuproot: null,
    settings: null,
    dissolveNotice: null,

    endTime: -1,
    extraInfo: null,
    noticeLabel: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    cc.vv.popupMgr = this;

    this.popuproot = cc.find('Canvas/popups');
    this.settings = cc.find('Canvas/popups/settings');
    this.dissolveNotice = cc.find('Canvas/popups/dissolve_notice');
    this.noticeLabel = this.dissolveNotice
      .getChildByName('info')
      .getComponent(cc.Label);

    this.closeAll();

    this.addBtnHandler('settings/btn_close');
    this.addBtnHandler('settings/btn_sqjsfj');
    this.addBtnHandler('dissolve_notice/btn_agree');
    this.addBtnHandler('dissolve_notice/btn_reject');
    this.addBtnHandler('dissolve_notice/btn_ok');

    this.node.on('dissolve_notice', (event) => {
      const data = event.detail;
      this.showDissolveNotice(data);
    });

    this.node.on('dissolve_cancel', () => {
      this.closeAll();
    });
  },

  start() {
    if (cc.vv.gameNetMgr.dissoveData) {
      this.showDissolveNotice(cc.vv.gameNetMgr.dissoveData);
    }
  },

  addBtnHandler(btnName) {
    const btn = cc.find(`Canvas/popups/${btnName}`);
    this.addClickEvent(btn, this.node, 'PopupMgr', 'onBtnClicked');
  },

  addClickEvent(node, target, component, handler) {
    const eventHandler = new cc.Component.EventHandler();
    eventHandler.target = target;
    eventHandler.component = component;
    eventHandler.handler = handler;

    const { clickEvents } = node.getComponent(cc.Button);
    clickEvents.push(eventHandler);
  },

  onBtnClicked(event) {
    this.closeAll();
    const btnName = event.target.name;
    if (btnName === 'btn_agree') {
      cc.vv.net.send('dissolve_agree');
    } else if (btnName === 'btn_reject') {
      cc.vv.net.send('dissolve_reject');
    } else if (btnName === 'btn_sqjsfj') {
      cc.vv.net.send('dissolve_request');
    }
  },

  closeAll() {
    this.popuproot.active = false;
    this.settings.active = false;
    this.dissolveNotice.active = false;
  },

  showSettings() {
    this.closeAll();
    this.popuproot.active = true;
    this.settings.active = true;
  },

  showDissolveRequest() {
    this.closeAll();
    this.popuproot.active = true;
  },

  showDissolveNotice(data) {
    this.endTime = Date.now() / 1000 + data.time;
    this.extraInfo = '';
    for (let i = 0; i < data.states.length; i++) {
      const b = data.states[i];
      const { name } = cc.vv.gameNetMgr.seats[i];
      if (b) {
        this.extraInfo += `\n[已同意] ${name}`;
      } else {
        this.extraInfo += `\n[待确认] ${name}`;
      }
    }
    this.closeAll();
    this.popuproot.active = true;
    this.dissolveNotice.active = true;
  },

  // called every frame, uncomment this function to activate update callback
  update() {
    if (this.endTime > 0) {
      const lastTime = this.endTime - Date.now() / 1000;
      if (lastTime < 0) {
        this.endTime = -1;
      }

      const m = Math.floor(lastTime / 60);
      const s = Math.ceil(lastTime - m * 60);

      let str = '';
      if (m > 0) {
        str += `${m}分`;
      }

      this.noticeLabel.string = `${str + s}秒后房间将自动解散${this.extraInfo}`;
    }
  }
});
