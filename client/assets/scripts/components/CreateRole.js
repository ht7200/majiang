cc.Class({
  extends: cc.Component,

  properties: {
    inputName: cc.EditBox
  },

  onRandomBtnClicked() {
    const names = [
      '上官',
      '欧阳',
      '东方',
      '端木',
      '独孤',
      '司马',
      '南宫',
      '夏侯',
      '诸葛',
      '皇甫',
      '长孙',
      '宇文',
      '轩辕',
      '东郭',
      '子车',
      '东阳',
      '子言'
    ];

    const names2 = ['雀圣', '赌侠', '赌圣', '稳赢', '不输', '好运', '自摸', '有钱', '土豪'];
    const idx = Math.floor(Math.random() * (names.length - 1));
    const idx2 = Math.floor(Math.random() * (names2.length - 1));
    this.inputName.string = names[idx] + names2[idx2];
  },

  // use this for initialization
  onLoad() {
    if (!cc.sys.isNative && cc.sys.isMobile) {
      const cvs = this.node.getComponent(cc.Canvas);
      cvs.fitHeight = true;
      cvs.fitWidth = true;
    }
    this.onRandomBtnClicked();
  },

  onBtnConfirmClicked() {
    const name = this.inputName.string;
    if (name === '') {
      return;
    }
    cc.vv.userMgr.create(name);
  }
  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
