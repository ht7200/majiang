cc.Class({
  extends: cc.Component,

  properties: {
    alert: null,
    btnOK: null,
    btnCancel: null,
    title: null,
    content: null,
    onok: null,
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }
    this.alert = cc.find('Canvas/alert');
    this.title = cc.find('Canvas/alert/title').getComponent(cc.Label);
    this.content = cc.find('Canvas/alert/content').getComponent(cc.Label);

    this.btnOK = cc.find('Canvas/alert/btn_ok');
    this.btnCancel = cc.find('Canvas/alert/btn_cancel');

    cc.vv.utils.addClickEvent(this.btnOK, this.node, 'Alert', 'onBtnClicked');
    cc.vv.utils.addClickEvent(
      this.btnCancel,
      this.node,
      'Alert',
      'onBtnClicked',
    );

    this.alert.active = false;
    cc.vv.alert = this;
  },

  onBtnClicked(event) {
    if (event.target.name === 'btn_ok') {
      if (this.onok) {
        this.onok();
      }
    }
    this.alert.active = false;
    this.onok = null;
  },

  show(title, content, onok, needcancel) {
    this.alert.active = true;
    this.onok = onok;
    this.title.string = title;
    this.content.string = content;
    if (needcancel) {
      this.btnCancel.active = true;
      this.btnOK.x = -150;
      this.btnCancel.x = 150;
    } else {
      this.btnCancel.active = false;
      this.btnOK.x = 0;
    }
  },

  onDestory() {
    if (cc.vv) {
      cc.vv.alert = null;
    }
  },

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
