cc.Class({
  extends: cc.Component,

  properties: {
    groups: null
  },

  // use this for initialization
  init() {
    this.groups = {};
  },

  add(radioButton) {
    const { groupId } = radioButton;
    let buttons = this.groups[groupId];
    if (buttons == null) {
      buttons = [];
      this.groups[groupId] = buttons;
    }
    buttons.push(radioButton);
  },

  del(radioButton) {
    const { groupId } = radioButton;
    const buttons = this.groups[groupId];
    if (buttons == null) {
      return;
    }
    const idx = buttons.indexOf(radioButton);
    if (idx !== -1) {
      buttons.splice(idx, 1);
    }
    if (buttons.length === 0) {
      delete this.groups[groupId];
    }
  },

  check(radioButton) {
    const { groupId } = radioButton;
    const buttons = this.groups[groupId];
    if (buttons == null) {
      return;
    }
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      if (btn === radioButton) {
        btn.check(true);
      } else {
        btn.check(false);
      }
    }
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
