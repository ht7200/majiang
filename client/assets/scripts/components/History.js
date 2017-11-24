cc.Class({
  extends: cc.Component,

  properties: {
    HistoryItemPrefab: {
      default: null,
      type: cc.Prefab
    },
    history: null,
    viewlist: null,
    content: null,
    viewitemTemp: null,
    historyData: null,
    curRoomInfo: null,
    emptyTip: null
  },

  // use this for initialization
  onLoad() {
    this.history = this.node.getChildByName('history');
    this.history.active = false;

    this.emptyTip = this.history.getChildByName('emptyTip');
    this.emptyTip.active = true;

    this.viewlist = this.history.getChildByName('viewlist');
    this.content = cc.find('view/content', this.viewlist);

    [this.viewitemTemp] = this.content.children;
    this.content.removeChild(this.viewitemTemp);

    const node = cc.find('Canvas/btn_zhanji');
    this.addClickEvent(node, this.node, 'History', 'onBtnHistoryClicked');

    const bNode = cc.find('Canvas/history/btn_back');
    this.addClickEvent(bNode, this.node, 'History', 'onBtnBackClicked');
  },

  addClickEvent(node, target, component, handler) {
    const eventHandler = new cc.Component.EventHandler();
    eventHandler.target = target;
    eventHandler.component = component;
    eventHandler.handler = handler;

    const { clickEvents } = node.getComponent(cc.Button);
    clickEvents.push(eventHandler);
  },

  onBtnBackClicked() {
    if (this.curRoomInfo == null) {
      this.historyData = null;
      this.history.active = false;
    } else {
      this.initRoomHistoryList(this.historyData);
    }
  },

  onBtnHistoryClicked() {
    this.history.active = true;
    cc.vv.userMgr.getHistoryList((data) => {
      data.sort((a, b) => a.time < b.time);
      this.historyData = data;
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < 4; j++) {
          const s = data[i].seats[j];
          s.name = Buffer.from(s.name, 'base64').toString();
        }
      }
      this.initRoomHistoryList(data);
    });
  },

  dateFormat(time) {
    const date = new Date(time);
    let datetime = '{0}-{1}-{2} {3}:{4}:{5}';
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month >= 10 ? month : `0${month}`;
    let day = date.getDate();
    day = day >= 10 ? day : `0${day}`;
    let h = date.getHours();
    h = h >= 10 ? h : `0${h}`;
    let m = date.getMinutes();
    m = m >= 10 ? m : `0${m}`;
    let s = date.getSeconds();
    s = s >= 10 ? s : `0${s}`;
    datetime = datetime.format(year, month, day, h, m, s);
    return datetime;
  },

  initRoomHistoryList(data) {
    for (let i = 0; i < data.length; i++) {
      const node = this.getViewItem(i);
      node.idx = i;
      const titleId = `${i + 1}`;
      node.getChildByName('title').getComponent(cc.Label).string = titleId;
      node
        .getChildByName('roomNo')
        .getComponent(cc.Label).string = `房间ID:${data[i].id}`;
      const datetime = this.dateFormat(data[i].time * 1000);
      node.getChildByName('time').getComponent(cc.Label).string = datetime;

      const btnOp = node.getChildByName('btnOp');
      btnOp.idx = i;
      btnOp.getChildByName('Label').getComponent(cc.Label).string = '详情';

      for (let j = 0; j < 4; j++) {
        const s = data[i].seats[j];
        const info = `${s.name}:${s.score}`;
        node.getChildByName(`info${j}`).getComponent(cc.Label).string = info;
      }
    }
    this.emptyTip.active = data.length === 0;
    this.shrinkContent(data.length);
    this.curRoomInfo = null;
  },

  initGameHistoryList(roomInfo, data) {
    data.sort((a, b) => a.create_time < b.create_time);
    for (let i = 0; i < data.length; i++) {
      const node = this.getViewItem(i);
      const idx = data.length - i - 1;
      node.idx = idx;
      const titleId = `${idx + 1}`;
      node.getChildByName('title').getComponent(cc.Label).string = titleId;
      node
        .getChildByName('roomNo')
        .getComponent(cc.Label).string = `房间ID:${roomInfo.id}`;
      const datetime = this.dateFormat(data[i].create_time * 1000);
      node.getChildByName('time').getComponent(cc.Label).string = datetime;

      const btnOp = node.getChildByName('btnOp');
      btnOp.idx = idx;
      btnOp.getChildByName('Label').getComponent(cc.Label).string = '回放';

      const result = JSON.parse(data[i].result);
      for (let j = 0; j < 4; j++) {
        const s = roomInfo.seats[j];
        const info = `${s.name}:${result[j]}`;
        // console.log(info);
        node.getChildByName(`info${j}`).getComponent(cc.Label).string = info;
      }
    }
    this.shrinkContent(data.length);
    this.curRoomInfo = roomInfo;
  },

  getViewItem(index) {
    const { content } = this;
    if (content.childrenCount > index) {
      return content.children[index];
    }
    const node = cc.instantiate(this.viewitemTemp);
    content.addChild(node);
    return node;
  },
  shrinkContent(num) {
    while (this.content.childrenCount > num) {
      const lastOne = this.content.children[this.content.childrenCount - 1];
      this.content.removeChild(lastOne, true);
    }
  },

  getGameListOfRoom(idx) {
    const roomInfo = this.historyData[idx];
    cc.vv.userMgr.getGamesOfRoom(roomInfo.uuid, (data) => {
      if (data != null && data.length > 0) {
        this.initGameHistoryList(roomInfo, data);
      }
    });
  },

  getDetailOfGame(idx) {
    const roomUUID = this.curRoomInfo.uuid;
    cc.vv.userMgr.getDetailOfGame(roomUUID, idx, (data) => {
      data.base_info = JSON.parse(data.base_info);
      data.action_records = JSON.parse(data.action_records);
      cc.vv.gameNetMgr.prepareReplay(this.curRoomInfo, data);
      cc.vv.replayMgr.init(data);
      cc.director.loadScene('mjgame');
    });
  },

  onViewItemClicked(event) {
    const { idx } = event.target;
    if (this.curRoomInfo == null) {
      this.getGameListOfRoom(idx);
    } else {
      this.getDetailOfGame(idx);
    }
  },

  onBtnOpClicked(event) {
    const { idx } = event.target.parent;
    if (this.curRoomInfo == null) {
      this.getGameListOfRoom(idx);
    } else {
      this.getDetailOfGame(idx);
    }
  }
});

