cc.Class({
  extends: cc.Component,

  properties: {
    updatePanel: {
      default: null,
      type: cc.Node
    },
    manifestUrl: {
      default: null,
      url: cc.RawAsset
    },
    percent: {
      default: null,
      type: cc.Label
    },
    lblErr: {
      default: null,
      type: cc.Label
    }
  },

  checkCb(event) {
    cc.log(`Code: ${event.getEventCode()}`);
    switch (event.getEventCode()) {
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        cc.eventManager.removeListener(this.checkListener);
        break;
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
        cc.eventManager.removeListener(this.checkListener);
        break;
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
        cc.eventManager.removeListener(this.checkListener);
        this.lblErr.string += '游戏不需要更新\n';
        cc.director.loadScene('loading');
        break;
      case jsb.EventAssetsManager.NEW_VERSION_FOUND:
        this.needUpdate = true;
        this.updatePanel.active = true;
        this.percent.string = '00.00%';
        cc.eventManager.removeListener(this.checkListener);
        break;
      default:
        break;
    }
    this.hotUpdate();
  },

  updateCb(event) {
    let needRestart = false;
    let failed = false;
    switch (event.getEventCode()) {
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        failed = true;
        break;
      case jsb.EventAssetsManager.UPDATE_PROGRESSION:
        {
          const percent = event.getPercent();
          // const percentByFile = event.getPercentByFile();

          const msg = event.getMessage();
          if (msg) {
            cc.log(msg);
          }
          cc.log(`${percent.toFixed(2)}%`);
          this.percent.string = `${percent}%`;
        }
        break;
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
        cc.log('Fail to download manifest file, hot update skipped.');
        failed = true;
        break;
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
        cc.log('Already up to date with the latest remote version.');
        failed = true;
        break;
      case jsb.EventAssetsManager.UPDATE_FINISHED:
        cc.log(`Update finished. ${event.getMessage()}`);

        needRestart = true;
        break;
      case jsb.EventAssetsManager.UPDATE_FAILED:
        cc.log(`Update failed. ${event.getMessage()}`);

        this.failCount++;
        if (this.failCount < 5) {
          this.am.downloadFailedAssets();
        } else {
          cc.log('Reach maximum fail count, exit update process');
          this.failCount = 0;
          failed = true;
        }
        break;
      case jsb.EventAssetsManager.ERROR_UPDATING:
        cc.log(`Asset update error: ${event.getAssetId()}, ${event.getMessage()}`);
        break;
      case jsb.EventAssetsManager.ERROR_DECOMPRESS:
        cc.log(event.getMessage());
        break;
      default:
        break;
    }

    if (failed) {
      cc.eventManager.removeListener(this.updateListener);
      this.updatePanel.active = false;
    }

    if (needRestart) {
      cc.eventManager.removeListener(this.updateListener);
      // Prepend the manifest's search path
      const searchPaths = jsb.fileUtils.getSearchPaths();
      const newPaths = this.am.getLocalManifest().getSearchPaths();
      Array.prototype.unshift(searchPaths, newPaths);
      // This value will be retrieved and appended to the default search path during game startup,
      // please refer to samples/js-tests/main.js for detailed usage.
      // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
      cc.sys.localStorage.setItem(
        'HotUpdateSearchPaths',
        JSON.stringify(searchPaths)
      );

      jsb.fileUtils.setSearchPaths(searchPaths);
      this.lblErr.string += '游戏资源更新完毕\n';
      cc.game.restart();
    }
  },

  hotUpdate() {
    if (this.am && this.needUpdate) {
      this.lblErr.string += '开始更新游戏资源...\n';
      this.updateListener = new jsb.EventListenerAssetsManager(
        this.am,
        this.updateCb.bind(this)
      );
      cc.eventManager.addListener(this.updateListener, 1);

      this.failCount = 0;
      this.am.update();
    }
  },

  // use this for initialization
  onLoad() {
    // Hot update is only available in Native build
    if (!cc.sys.isNative) {
      return;
    }
    this.lblErr.string += '检查游戏资源...\n';
    const storagePath = `${jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/'}tiantianqipai-asset`;
    cc.log(`Storage path for remote asset : ${storagePath}`);
    this.lblErr.string += `${storagePath}\n`;
    cc.log(`Local manifest URL : ${this.manifestUrl}`);
    this.am = new jsb.AssetsManager(this.manifestUrl, storagePath);
    this.am.retain();

    this.needUpdate = false;
    if (this.am.getLocalManifest().isLoaded()) {
      this.checkListener = new jsb.EventListenerAssetsManager(
        this.am,
        this.checkCb.bind(this)
      );
      cc.eventManager.addListener(this.checkListener, 1);

      this.am.checkUpdate();
    }
  },

  onDestroy() {
    this.am && this.am.release();
  }
});
