cc.Class({
  extends: cc.Component,

  properties: {
    nums: {
      default: [],
      type: [cc.Label]
    },
    inputIndex: 0
  },

  // use this for initialization
  onLoad() {},

  onEnable() {
    this.onResetClicked();
  },

  onInputFinished(roomId) {
    cc.vv.userMgr.enterRoom(roomId, (ret) => {
      if (ret.errcode === 0) {
        this.node.active = false;
      } else {
        let content = `房间[${roomId}]不存在，请重新输入!`;
        if (ret.errcode === 4) {
          content = `房间[${roomId}]已满!`;
        }
        cc.vv.alert.show('提示', content);
        this.onResetClicked();
      }
    });
  },

  onInput(num) {
    if (this.inputIndex >= this.nums.length) {
      return;
    }
    this.nums[this.inputIndex].string = num;
    this.sinputIndex += 1;

    if (this.inputIndex === this.nums.length) {
      const roomId = this.parseRoomID();
      this.onInputFinished(roomId);
    }
  },

  onN0Clicked() {
    this.onInput(0);
  },
  onN1Clicked() {
    this.onInput(1);
  },
  onN2Clicked() {
    this.onInput(2);
  },
  onN3Clicked() {
    this.onInput(3);
  },
  onN4Clicked() {
    this.onInput(4);
  },
  onN5Clicked() {
    this.onInput(5);
  },
  onN6Clicked() {
    this.onInput(6);
  },
  onN7Clicked() {
    this.onInput(7);
  },
  onN8Clicked() {
    this.onInput(8);
  },
  onN9Clicked() {
    this.onInput(9);
  },
  onResetClicked() {
    for (let i = 0; i < this.nums.length; i++) {
      this.nums[i].string = '';
    }
    this.inputIndex = 0;
  },
  onDelClicked() {
    if (this.inputIndex > 0) {
      this.inputIndex -= 1;
      this.nums[this.inputIndex].string = '';
    }
  },
  onCloseClicked() {
    this.node.active = false;
  },

  parseRoomID() {
    let str = '';
    for (let i = 0; i < this.nums.length; i++) {
      str += this.nums[i].string;
    }
    return str;
  }

  // called every frame, uncomment this function to activate update callback

  // update: function (dt) {

  // },
});
