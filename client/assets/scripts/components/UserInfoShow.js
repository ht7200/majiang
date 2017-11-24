cc.Class({
  extends: cc.Component,

  properties: {
    userinfo: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    this.userinfo = cc.find('Canvas/userinfo');
    this.userinfo.active = false;
    cc.vv.utils.addClickEvent(
      this.userinfo,
      this.node,
      'UserInfoShow',
      'onClicked'
    );

    cc.vv.userinfoShow = this;
  },

  show(name, userId, iconSprite, sex, ip) {
    if (userId != null && userId > 0) {
      this.userinfo.active = true;
      this.userinfo.getChildByName('icon').getComponent(cc.Sprite).spriteFrame =
        iconSprite.spriteFrame;
      this.userinfo.getChildByName('name').getComponent(cc.Label).string = name;
      this.userinfo
        .getChildByName('ip')
        .getComponent(cc.Label).string = `IP: ${ip.replace('::ffff:', '')}`;
      this.userinfo
        .getChildByName('id')
        .getComponent(cc.Label).string = `ID: ${userId}`;

      const sexFemale = this.userinfo.getChildByName('sex_female');
      sexFemale.active = false;

      const sexMale = this.userinfo.getChildByName('sex_male');
      sexMale.active = false;

      if (sex === 1) {
        sexMale.active = true;
      } else if (sex === 2) {
        sexFemale.active = true;
      }
    }
  },

  onClicked() {
    this.userinfo.active = false;
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
