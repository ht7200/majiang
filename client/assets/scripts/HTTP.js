const URL = 'http://127.0.0.1:9000';
cc.VERSION = 20161227;
const HTTP = cc.Class({
  extends: cc.Component,
  statics: {
    sessionId: 0,
    userId: 0,
    master_url: URL,
    url: URL,
    sendRequest(path, data, handler, extraUrl) {
      const xhr = cc.loader.getXMLHttpRequest();
      xhr.timeout = 5000;
      let str = '?';
      for (const k in data) {
        if (str !== '?') {
          str += '&';
        }
        str += `${k}=${data[k]}`;
      }
      if (extraUrl == null) {
        extraUrl = HTTP.url;
      }
      const requestURL = extraUrl + path + encodeURI(str);
      xhr.open('GET', requestURL, true);
      if (cc.sys.isNative) {
        xhr.setRequestHeader(
          'Accept-Encoding',
          'gzip,deflate',
          'text/html;charset=UTF-8'
        );
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
          try {
            const ret = JSON.parse(xhr.responseText);
            if (handler !== null) {
              handler(ret);
            } /* code */
          } catch (e) {
            // handler(null);
          } finally {
            if (cc.vv && cc.vv.wc) {
              //       cc.vv.wc.hide();
            }
          }
        }
      };

      if (cc.vv && cc.vv.wc) {
        // cc.vv.wc.show();
      }
      xhr.send();
      return xhr;
    }
  }
});
