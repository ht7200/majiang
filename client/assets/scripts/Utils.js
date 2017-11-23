cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    addClickEvent: function (node, target, component, handler) {
        console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    addSlideEvent: function (node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    urlParse: function () {
        const params = {};
        if (window.location == null) {
            return params;
        }
        const url = window.location.href;
        const search = url.substring(url.indexOf('?') + 1);
        const arr = search.split('&');
        for (let i = 0; i < arr.length; i++) {
            const subArr = arr[i].split('=');
            if (subArr.length > 1) {
                params[subArr[0]] = params[subArr[1]];
            }
        }
        return params;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});