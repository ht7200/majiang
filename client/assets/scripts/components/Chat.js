cc.Class({
  extends: cc.Component,

  properties: {
    chatRoot: null,
    tabQuick: null,
    tabEmoji: null,
    iptChat: null,
    quickChatInfo: null,
    btnChat: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    cc.vv.chat = this;

    this.btnChat = this.node.getChildByName('btn_chat');
    this.btnChat.active = cc.vv.replayMgr.isReplay() === false;

    this.chatRoot = this.node.getChildByName('chat');
    this.chatRoot.active = false;

    this.tabQuick = this.chatRoot.getChildByName('quickchatlist');
    this.tabEmoji = this.chatRoot.getChildByName('emojis');

    this.iptChat = this.chatRoot
      .getChildByName('iptChat')
      .getComponent(cc.EditBox);

    this.quickChatInfo = {};
    this.quickChatInfo.item0 = {
      index: 0,
      content: '快点啊，都等到我花儿都谢谢了！',
      sound: 'fix_msg_1.mp3'
    };
    this.quickChatInfo.item1 = {
      index: 1,
      content: '怎么又断线了，网络怎么这么差啊！',
      sound: 'fix_msg_2.mp3'
    };
    this.quickChatInfo.item2 = {
      index: 2,
      content: '不要走，决战到天亮！',
      sound: 'fix_msg_3.mp3'
    };
    this.quickChatInfo.item3 = {
      index: 3,
      content: '你的牌打得也太好了！',
      sound: 'fix_msg_4.mp3'
    };
    this.quickChatInfo.item4 = {
      index: 4,
      content: '你是妹妹还是哥哥啊？',
      sound: 'fix_msg_5.mp3'
    };
    this.quickChatInfo.item5 = {
      index: 5,
      content: '和你合作真是太愉快了！',
      sound: 'fix_msg_6.mp3'
    };
    this.quickChatInfo.item6 = {
      index: 6,
      content: '大家好，很高兴见到各位！',
      sound: 'fix_msg_7.mp3'
    };
    this.quickChatInfo.item7 = {
      index: 7,
      content: '各位，真是不好意思，我得离开一会儿。',
      sound: 'fix_msg_8.mp3'
    };
    this.quickChatInfo.item8 = {
      index: 8,
      content: '不要吵了，专心玩游戏吧！',
      sound: 'fix_msg_9.mp3'
    };
  },

  getQuickChatInfo(index) {
    const key = `item${index}`;
    return this.quickChatInfo[key];
  },

  onBtnChatClicked() {
    this.chatRoot.active = true;
  },

  onBgClicked() {
    this.chatRoot.active = false;
  },

  onTabClicked(event) {
    if (event.target.name === 'tabQuick') {
      this.tabQuick.active = true;
      this.tabEmoji.active = false;
    } else if (event.target.name === 'tabEmoji') {
      this.tabQuick.active = false;
      this.tabEmoji.active = true;
    }
  },

  onQuickChatItemClicked(event) {
    this.chatRoot.active = false;
    const info = this.quickChatInfo[event.target.name];
    cc.vv.net.send('quick_chat', info.index);
  },

  onEmojiItemClicked(event) {
    this.chatRoot.active = false;
    cc.vv.net.send('emoji', event.target.name);
  },

  onBtnSendChatClicked() {
    this.chatRoot.active = false;
    if (this.iptChat.string === '') {
      return;
    }
    cc.vv.net.send('chat', this.iptChat.string);
    this.iptChat.string = '';
  }

  // called every frame, uncomment this function to activate update callback

  // update: function (dt) {

  // },
});
