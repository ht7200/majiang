const io = require('./3rdparty/socket-io');

if (window.io == null) {
  window.io = io;
}

cc.Class({
  extends: cc.Component,
  statics: {
    ip: '',
    sio: null,
    isPinging: false,
    fnDisconnect: null,
    handlers: {},
    addHandler(event, fn) {
      if (this.handlers[event]) {
        return;
      }
      const handler = (data) => {
        if (event !== 'disconnect' && typeof data === 'string') {
          data = JSON.parse(data);
        }
        fn(data);
      };
      this.handlers[event] = handler;
      if (this.sio) {
        this.sio.on(event, handler);
      }
    },
    connect(fnConnect) {
      const opts = {
        reconnection: false,
        'force new connection': true,
        transports: ['websocket', 'polling']
      };
      this.sio = window.io.connect(this.ip, opts);
      this.sio.on('reconnect', () => {});
      this.sio.on('connect', (data) => {
        this.sio.connected = true;
        fnConnect(data);
      });

      this.sio.on('disconnect', () => {
        this.sio.connected = false;
        this.close();
      });

      this.sio.on('connect_failed', () => {});

      for (const key in this.handlers) {
        const value = this.handlers[key];
        if (typeof value === 'function') {
          if (key === 'disconnect') {
            this.fnDisconnect = value;
          } else {
            this.sio.on(key, value);
          }
        }
      }

      this.startHearbeat();
    },

    startHearbeat() {
      this.sio.on('game_pong', () => {
        this.lastRecieveTime = Date.now();
      });
      this.lastRecieveTime = Date.now();
      if (!this.isPinging) {
        this.isPinging = true;
        setInterval(() => {
          if (this.sio) {
            if (Date.now() - this.lastRecieveTime > 10000) {
              this.close();
            } else {
              this.ping();
            }
          }
        }, 5000);
      }
    },
    send(event, data) {
      if (this.sio.connected) {
        if (data != null && typeof data === 'object') {
          data = JSON.stringify(data);
        }
        this.sio.emit(event, data);
      }
    },

    ping() {
      this.send('game_ping');
    },

    close() {
      if (this.sio && this.sio.connected) {
        this.sio.connected = false;
        this.sio.disconnect();
        this.sio = null;
      }
      if (this.fnDisconnect) {
        this.fnDisconnect();
        this.fnDisconnect = null;
      }
    },

    test(fnResult) {
      let xhr = null;
      const fn = (ret) => {
        fnResult(ret.isonline);
        xhr = null;
      };

      const arr = this.ip.split(':');
      const data = {
        account: cc.vv.userMgr.account,
        sign: cc.vv.userMgr.sign,
        ip: arr[0],
        port: arr[1]
      };
      xhr = cc.vv.http.sendRequest('/is_server_online', data, fn);
      setTimeout(() => {
        if (xhr) {
          xhr.abort();
          fnResult(false);
        }
      }, 1500);
      /*
          const opts = {
              'reconnection':false,
              'force new connection': true,
              'transports':['websocket', 'polling']
          }
          const self = this;
          this.testsio = window.io.connect(this.ip,opts);
          this.testsio.on('connect',function(){
              console.log('connect');
              self.testsio.close();
              self.testsio = null;
              fnResult(true);
          });
          this.testsio.on('connect_error',function(){
              console.log('connect_failed');
              self.testsio = null;
              fnResult(false);
          });
          */
    }
  }
});
