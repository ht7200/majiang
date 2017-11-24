const radix = 12;
const base = 128 - radix;

function crypto(value) {
  value -= base;
  const h = Math.floor(value / radix) + base;
  const l = value % radix + base;
  return String.fromCharCode(h) + String.fromCharCode(l);
}

const encodermap = {};
const decodermap = {};
for (let i = 0; i < 256; i++) {
  let code = null;
  const v = i + 1;
  if (v >= base) {
    code = crypto(v);
  } else {
    code = String.fromCharCode(v);
  }

  encodermap[i] = code;
  decodermap[code] = i;
}

function encode(data) {
  let content = '';
  const len = data.length;
  const a = (len >> 24) & 0xff;
  const b = (len >> 16) & 0xff;
  const c = (len >> 8) & 0xff;
  const d = len & 0xff;
  content += encodermap[a];
  content += encodermap[b];
  content += encodermap[c];
  content += encodermap[d];
  for (let i = 0; i < data.length; i++) {
    content += encodermap[data[i]];
  }
  return content;
}

function getCode(content, index) {
  let c = content.charCodeAt(index);
  if (c >= base) {
    c = content.charAt(index) + content.charAt(index + 1);
  } else {
    c = content.charAt(index);
  }
  return c;
}

function decode(content) {
  let index = 0;
  let len = 0;
  for (let i = 0; i < 4; i++) {
    const c = getCode(content, index);
    index += c.length;
    const v = decodermap[c];
    len |= v << ((3 - i) * 8);
  }

  const newData = new Uint8Array(len);
  let cnt = 0;
  while (index < content.length) {
    const c = getCode(content, index);
    index += c.length;
    newData[cnt] = decodermap[c];
    cnt++;
  }
  return newData;
}

cc.Class({
  extends: cc.Component,

  properties: {
    onPlayCallback: null,
    voiceMediaPath: null,
  },

  // use this for initialization
  init() {
    /*
        const url = cc.url.raw("resources/test.amr");
        const fileData = jsb.fileUtils.getDataFromFile(url);
        const content = "";
        const sep = "";
        for(const i = 0; i < fileData.length; ++i){
            content += sep + fileData[i];
            sep = ",";
        }

        const url = cc.url.raw("resources/test.txt");
        jsb.fileUtils.writeStringToFile(content,url);

        const url = cc.url.raw("resources/test2.amrs");
        const content = encode(fileData);
        jsb.fileUtils.writeStringToFile(content,url);

        const url = cc.url.raw("resources/test2.amr");
        jsb.fileUtils.writeDataToFile(decode(content),url);
        */

    if (cc.sys.isNative) {
      this.voiceMediaPath = `${jsb.fileUtils.getWritablePath()}/voicemsgs/`;
      this.setStorageDir(this.voiceMediaPath);
    }
  },

  prepare(filename) {
    if (!cc.sys.isNative) {
      return;
    }
    cc.vv.audioMgr.pauseAll();
    this.clearCache(filename);
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(
        'com/vivigames/voicesdk/VoiceRecorder',
        'prepare',
        '(Ljava/lang/String;)V',
        filename,
      );
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod('VoiceSDK', 'prepareRecord:', filename);
    }
  },

  release() {
    if (!cc.sys.isNative) {
      return;
    }
    cc.vv.audioMgr.resumeAll();
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(
        'com/vivigames/voicesdk/VoiceRecorder',
        'release',
        '()V',
      );
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod('VoiceSDK', 'finishRecord');
    }
  },

  cancel() {
    if (!cc.sys.isNative) {
      return;
    }
    cc.vv.audioMgr.resumeAll();
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(
        'com/vivigames/voicesdk/VoiceRecorder',
        'cancel',
        '()V',
      );
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod('VoiceSDK', 'cancelRecord');
    }
  },

  writeVoice(filename, voiceData) {
    if (!cc.sys.isNative) {
      return;
    }
    if (voiceData && voiceData.length > 0) {
      const fileData = decode(voiceData);
      const url = this.voiceMediaPath + filename;
      this.clearCache(filename);
      jsb.fileUtils.writeDataToFile(fileData, url);
    }
  },

  clearCache(filename) {
    if (cc.sys.isNative) {
      const url = this.voiceMediaPath + filename;
      if (jsb.fileUtils.isFileExist(url)) {
        jsb.fileUtils.removeFile(url);
      }
      if (jsb.fileUtils.isFileExist(`${url}.wav`)) {
        jsb.fileUtils.removeFile(`${url}.wav`);
      }
    }
  },

  play(filename) {
    if (!cc.sys.isNative) {
      return;
    }
    cc.vv.audioMgr.pauseAll();
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(
        'com/vivigames/voicesdk/VoicePlayer',
        'play',
        '(Ljava/lang/String;)V',
        filename,
      );
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod('VoiceSDK', 'play:', filename);
    }
  },

  stop() {
    if (!cc.sys.isNative) {
      return;
    }
    cc.vv.audioMgr.resumeAll();
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(
        'com/vivigames/voicesdk/VoicePlayer',
        'stop',
        '()V',
      );
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod('VoiceSDK', 'stopPlay');
    }
  },

  getVoiceLevel(maxLevel) {
    // return Math.floor((Math.random() * maxLevel) + 1);
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      return jsb.reflection.callStaticMethod(
        'com/vivigames/voicesdk/VoiceRecorder',
        'getVoiceLevel',
        '(I)I',
        maxLevel,
      );
    }
    return Math.floor(Math.random() * maxLevel + 1);
  },

  getVoiceData(filename) {
    if (cc.sys.isNative) {
      const url = this.voiceMediaPath + filename;
      console.log(`getVoiceData:${url}`);
      const fileData = jsb.fileUtils.getDataFromFile(url);
      if (fileData) {
        const content = encode(fileData);
        return content;
      }
    }
    return '';
  },

  setStorageDir(dir) {
    if (!cc.sys.isNative) {
      return;
    }
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(
        'com/vivigames/voicesdk/VoiceRecorder',
        'setStorageDir',
        '(Ljava/lang/String;)V',
        dir,
      );
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod('VoiceSDK', 'setStorageDir:', dir);
      if (!jsb.fileUtils.isDirectoryExist(dir)) {
        jsb.fileUtils.createDirectory(dir);
      }
    }
  },
});
