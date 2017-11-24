cc.Class({
  extends: cc.Component,

  properties: {
    gameover: null,
    gameresult: null,
    seats: [],
    isGameEnd: false,
    pingju: null,
    win: null,
    lose: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }
    if (cc.vv.gameNetMgr.conf == null) {
      return;
    }
    if (cc.vv.gameNetMgr.conf.type === 'xzdd') {
      this.gameover = this.node.getChildByName('game_over');
    } else {
      this.gameover = this.node.getChildByName('game_over_xlch');
    }

    this.gameover.active = false;

    this.pingju = this.gameover.getChildByName('pingju');
    this.win = this.gameover.getChildByName('win');
    this.lose = this.gameover.getChildByName('lose');

    this.gameresult = this.node.getChildByName('game_result');

    const wanfa = this.gameover.getChildByName('wanfa').getComponent(cc.Label);
    wanfa.string = cc.vv.gameNetMgr.getWanfa();

    const listRoot = this.gameover.getChildByName('result_list');
    for (let i = 1; i <= 4; i++) {
      const s = `s${i}`;
      const sn = listRoot.getChildByName(s);
      const viewdata = {};
      viewdata.username = sn.getChildByName('username').getComponent(cc.Label);
      viewdata.reason = sn.getChildByName('reason').getComponent(cc.Label);

      const f = sn.getChildByName('fan');
      if (f != null) {
        viewdata.fan = f.getComponent(cc.Label);
      }

      viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
      viewdata.hu = sn.getChildByName('hu');
      viewdata.mahjongs = sn.getChildByName('pai');
      viewdata.zhuang = sn.getChildByName('zhuang');
      viewdata.hupai = sn.getChildByName('hupai');
      viewdata.pengandgang = [];
      this.seats.push(viewdata);
    }

    // 初始化网络事件监听器
    this.node.on('game_over', (data) => {
      this.onGameOver(data.detail);
    });

    this.node.on('game_end', () => {
      this.isGameEnd = true;
    });
  },

  onGameOver(data) {
    if (cc.vv.gameNetMgr.conf.type === 'xzdd') {
      this.onGameOver_XZDD(data);
    } else {
      this.onGameOver_XLCH(data);
    }
  },

  onGameOver_XZDD(data) {
    if (data.length === 0) {
      this.gameresult.active = true;
      return;
    }
    this.gameover.active = true;
    this.pingju.active = false;
    this.win.active = false;
    this.lose.active = false;

    const myscore = data[cc.vv.gameNetMgr.seatIndex].score;
    if (myscore > 0) {
      this.win.active = true;
    } else if (myscore < 0) {
      this.lose.active = true;
    } else {
      this.pingju.active = true;
    }

    // 显示玩家信息
    for (let i = 0; i < 4; i++) {
      const seatView = this.seats[i];
      const userData = data[i];
      let hued = false;
      // 胡牌的玩家才显示 是否清一色 根xn的字样
      const numOfGangs =
        userData.angangs.length +
        userData.wangangs.length +
        userData.diangangs.length;
      const numOfGen = userData.numofgen;
      const actionArr = [];
      // let is7pairs = false;
      let ischadajiao = false;
      for (let j = 0; j < userData.actions.length; j++) {
        const ac = userData.actions[j];
        if (
          ac.type === 'zimo' ||
          ac.type === 'ganghua' ||
          ac.type === 'dianganghua' ||
          ac.type === 'hu' ||
          ac.type === 'gangpaohu' ||
          ac.type === 'qiangganghu' ||
          ac.type === 'chadajiao'
        ) {
          if (userData.pattern === '7pairs') {
            actionArr.push('七对');
          } else if (userData.pattern === 'l7pairs') {
            actionArr.push('龙七对');
          } else if (userData.pattern === 'j7pairs') {
            actionArr.push('将七对');
          } else if (userData.pattern === 'duidui') {
            actionArr.push('碰碰胡');
          } else if (userData.pattern === 'jiangdui') {
            actionArr.push('将对');
          }

          if (ac.type === 'zimo') {
            actionArr.push('自摸');
          } else if (ac.type === 'ganghua') {
            actionArr.push('杠上花');
          } else if (ac.type === 'dianganghua') {
            actionArr.push('点杠花');
          } else if (ac.type === 'gangpaohu') {
            actionArr.push('杠炮胡');
          } else if (ac.type === 'qiangganghu') {
            actionArr.push('抢杠胡');
          } else if (ac.type === 'chadajiao') {
            ischadajiao = true;
          }
          hued = true;
        } else if (ac.type === 'fangpao') {
          actionArr.push('放炮');
        } else if (ac.type === 'angang') {
          actionArr.push('暗杠');
        } else if (ac.type === 'diangang') {
          actionArr.push('明杠');
        } else if (ac.type === 'wangang') {
          actionArr.push('弯杠');
        } else if (ac.type === 'fanggang') {
          actionArr.push('放杠');
        } else if (ac.type === 'zhuanshougang') {
          actionArr.push('转手杠');
        } else if (ac.type === 'beiqianggang') {
          actionArr.push('被抢杠');
        } else if (ac.type === 'beichadajiao') {
          actionArr.push('被查叫');
        }
      }

      if (hued) {
        if (userData.qingyise) {
          actionArr.push('清一色');
        }

        if (userData.menqing) {
          actionArr.push('门清');
        }

        if (userData.zhongzhang) {
          actionArr.push('中张');
        }

        if (userData.jingouhu) {
          actionArr.push('金钩胡');
        }

        if (userData.haidihu) {
          actionArr.push('海底胡');
        }

        if (userData.tianhu) {
          actionArr.push('天胡');
        }

        if (userData.dihu) {
          actionArr.push('地胡');
        }

        if (numOfGen > 0) {
          actionArr.push(`根x${numOfGen}`);
        }

        if (ischadajiao) {
          actionArr.push('查大叫');
        }
      }

      for (let o = 0; o < 3; o++) {
        seatView.hu.children[o].active = false;
      }
      if (userData.huorder >= 0) {
        seatView.hu.children[userData.huorder].active = true;
      }

      seatView.username.string = cc.vv.gameNetMgr.seats[i].name;
      seatView.zhuang.active = cc.vv.gameNetMgr.button === i;
      seatView.reason.string = actionArr.join('、');

      // 胡牌的玩家才有番
      let fan = 0;
      if (hued) {
        const { fan: sfan } = userData;
        fan = sfan;
      }
      seatView.fan.string = `${fan}番`;

      //
      if (userData.score > 0) {
        seatView.score.string = `+${userData.score}`;
      } else {
        seatView.score.string = userData.score;
      }

      let hupai = -1;
      if (hued) {
        hupai = userData.holds.pop();
      }

      cc.vv.mahjongmgr.sortMJ(userData.holds, userData.dingque);

      // 胡牌不参与排序
      if (hued) {
        userData.holds.push(hupai);
      }

      // 隐藏所有牌
      for (let k = 0; k < seatView.mahjongs.childrenCount; k++) {
        const n = seatView.mahjongs.children[k];
        n.active = false;
      }

      const lackingNum = (userData.pengs.length + numOfGangs) * 3;
      // 显示相关的牌
      for (let k = 0; k < userData.holds.length; k++) {
        const pai = userData.holds[k];
        const n = seatView.mahjongs.children[k + lackingNum];
        n.active = true;
        const sprite = n.getComponent(cc.Sprite);
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID('M_', pai);
      }

      for (let k = 0; k < seatView.pengandgang.length; k++) {
        seatView.pengandgang[k].active = false;
      }

      // 初始化杠牌
      let index = 0;
      const gangs = userData.angangs;
      for (let k = 0; k < gangs.length; k++) {
        const mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, 'angang');
        index++;
      }

      const { diangangs } = userData;
      for (let k = 0; k < diangangs.length; k++) {
        const mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, 'diangang');
        index++;
      }

      const { wangangs } = userData;
      for (let k = 0; k < wangangs.length; k++) {
        const mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, 'wangang');
        index++;
      }

      // 初始化碰牌
      const { pengs } = userData;
      if (pengs) {
        for (let k = 0; k < pengs.length; k++) {
          const mjid = pengs[k];
          this.initPengAndGangs(seatView, index, mjid, 'peng');
          index++;
        }
      }
    }
  },
  onGameOver_XLCH(data) {
    if (data.length === 0) {
      this.gameresult.active = true;
      return;
    }
    this.gameover.active = true;
    this.pingju.active = false;
    this.win.active = false;
    this.lose.active = false;

    const myscore = data[cc.vv.gameNetMgr.seatIndex].score;
    if (myscore > 0) {
      this.win.active = true;
    } else if (myscore < 0) {
      this.lose.active = true;
    } else {
      this.pingju.active = true;
    }

    // 显示玩家信息
    for (let i = 0; i < 4; i++) {
      const seatView = this.seats[i];
      const userData = data[i];
      let hued = false;
      const actionArr = [];
      const hupaiRoot = seatView.hupai;

      for (let j = 0; j < hupaiRoot.children.length; j++) {
        hupaiRoot.children[j].active = false;
      }

      let hi = 0;
      for (let j = 0; j < userData.huinfo.length; j++) {
        let info = userData.huinfo[j];
        hued = hued || info.ishupai;
        if (info.ishupai) {
          if (hi < hupaiRoot.children.length) {
            const hupaiView = hupaiRoot.children[hi];
            hupaiView.active = true;
            hupaiView.getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(
              'B_',
              info.pai
            );
            hi++;
          }
        }

        let str = '';
        let sep = '';

        let dataseat = userData;
        if (!info.ishupai) {
          if (info.action === 'fangpao') {
            str = '放炮';
          } else if (info.action === 'gangpao') {
            str = '杠上炮';
          } else if (info.action === 'beiqianggang') {
            str = '被抢杠';
          } else {
            str = '被查大叫';
          }

          dataseat = data[info.target];
          info = dataseat.huinfo[info.index];
        } else if (info.action === 'hu') {
          str = '接炮胡';
        } else if (info.action === 'zimo') {
          str = '自摸';
        } else if (info.action === 'ganghua') {
          str = '杠上花';
        } else if (info.action === 'dianganghua') {
          str = '点杠花';
        } else if (info.action === 'gangpaohu') {
          str = '杠炮胡';
        } else if (info.action === 'qiangganghu') {
          str = '抢杠胡';
        } else if (info.action === 'chadajiao') {
          str = '查大叫';
        }

        str += '(';

        if (info.pattern === '7pairs') {
          str += '七对';
          sep = '、';
        } else if (info.pattern === 'l7pairs') {
          str += '龙七对';
          sep = '、';
        } else if (info.pattern === 'j7pairs') {
          str += '将七对';
          sep = '、';
        } else if (info.pattern === 'duidui') {
          str += '碰碰胡';
          sep = '、';
        } else if (info.pattern === 'jiangdui') {
          str += '将对';
          sep = '、';
        }

        if (info.haidihu) {
          str += `${sep}海底胡`;
          sep = '、';
        }

        if (info.tianhu) {
          str += `${sep}天胡`;
          sep = '、';
        }

        if (info.dihu) {
          str += `${sep}地胡`;
          sep = '、';
        }

        if (dataseat.qingyise) {
          str += `${sep}清一色`;
          sep = '、';
        }

        if (dataseat.menqing) {
          str += `${sep}门清`;
          sep = '、';
        }

        if (dataseat.jingouhu) {
          str += `${sep}金钩胡`;
          sep = '、';
        }

        if (dataseat.zhongzhang) {
          str += `${sep}中张`;
          sep = '、';
        }

        if (info.numofgen > 0) {
          str += `${sep}根x${info.numofgen}`;
          sep = '、';
        }

        if (sep === '') {
          str += '平胡';
        }

        str += `、${info.fan}番`;

        str += ')';
        actionArr.push(str);
      }

      seatView.hu.active = hued;

      if (userData.angangs.length) {
        actionArr.push(`暗杠x${userData.angangs.length}`);
      }

      if (userData.diangangs.length) {
        actionArr.push(`明杠x${userData.diangangs.length}`);
      }

      if (userData.wangangs.length) {
        actionArr.push(`巴杠x${userData.wangangs.length}`);
      }

      seatView.username.string = cc.vv.gameNetMgr.seats[i].name;
      seatView.zhuang.active = cc.vv.gameNetMgr.button === i;
      seatView.reason.string = actionArr.join('、');

      //
      if (userData.score > 0) {
        seatView.score.string = `+${userData.score}`;
      } else {
        seatView.score.string = userData.score;
      }

      // 隐藏所有牌
      for (let k = 0; k < seatView.mahjongs.childrenCount; k++) {
        const n = seatView.mahjongs.children[k];
        n.active = false;
      }

      cc.vv.mahjongmgr.sortMJ(userData.holds, userData.dingque);

      const numOfGangs =
        userData.angangs.length +
        userData.wangangs.length +
        userData.diangangs.length;

      const lackingNum = (userData.pengs.length + numOfGangs) * 3;
      // 显示相关的牌
      for (let k = 0; k < userData.holds.length; k++) {
        const pai = userData.holds[k];
        const n = seatView.mahjongs.children[k + lackingNum];
        n.active = true;
        const sprite = n.getComponent(cc.Sprite);
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID('M_', pai);
      }

      for (let k = 0; k < seatView.pengandgang.length; k++) {
        seatView.pengandgang[k].active = false;
      }

      // 初始化杠牌
      let index = 0;
      const { angangs } = userData;
      for (let k = 0; k < angangs.length; k++) {
        const mjid = angangs[k];
        this.initPengAndGangs(seatView, index, mjid, 'angang');
        index++;
      }

      const { diangangs } = userData;
      for (let k = 0; k < diangangs.length; k++) {
        const mjid = diangangs[k];
        this.initPengAndGangs(seatView, index, mjid, 'diangang');
        index++;
      }

      const { wangangs } = userData;
      for (let k = 0; k < wangangs.length; k++) {
        const mjid = wangangs[k];
        this.initPengAndGangs(seatView, index, mjid, 'wangang');
        index++;
      }

      // 初始化碰牌
      const { pengs } = userData;
      if (pengs) {
        for (let k = 0; k < pengs.length; k++) {
          const mjid = pengs[k];
          this.initPengAndGangs(seatView, index, mjid, 'peng');
          index++;
        }
      }
    }
  },

  initPengAndGangs(seatView, index, mjid, flag) {
    let pgroot = null;
    if (seatView.pengandgang.length <= index) {
      pgroot = cc.instantiate(cc.vv.mahjongmgr.pengPrefabthis);
      seatView.pengandgang.push(pgroot);
      seatView.mahjongs.addChild(pgroot);
    } else {
      pgroot = seatView.pengandgang[index];
      pgroot.active = true;
    }

    const sprites = pgroot.getComponentsInChildren(cc.Sprite);
    for (let s = 0; s < sprites.length; s++) {
      const sprite = sprites[s];
      if (sprite.node.name === 'gang') {
        const isGang = flag !== 'peng';
        sprite.node.active = isGang;
        sprite.node.scaleX = 1.0;
        sprite.node.scaleY = 1.0;
        if (flag === 'angang') {
          sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame('myself');
          sprite.node.scaleX = 1.4;
          sprite.node.scaleY = 1.4;
        } else {
          sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(
            'B_',
            mjid
          );
        }
      } else {
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID('B_', mjid);
      }
    }
    pgroot.x = index * 55 * 3 + index * 10;
  },

  onBtnReadyClicked() {
    if (this.isGameEnd) {
      this.gameresult.active = true;
    } else {
      cc.vv.net.send('ready');
    }
    this.gameover.active = false;
  },

  onBtnShareClicked() {
    console.log('onBtnShareClicked');
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
