// Copyright (c) 2014 The Software MacKiev Company. All rights reserved.
// For details, see us at www.hyperstudio.com

//if (Object.isUndefined(console)) {
//    var console = {};
//    var logPane;
//    window.addEventListener('load', function () {
//        $('contPane').insert("<div id='logpane' >&nbsp;</div>", "top");
//    });
//
//    console.log = function (mess) {
//        if ($('logpane')) {
//            $('logpane').innerHTML += "<p>" + mess.toString() + "</p>";
//        }
//    };
//
//}

global = {};
global.data = {};

AJAXLocalRequest = Class.create({
    initialize:function (url, options) {
        this.options = {
            onSuccess:Prototype.emptyFunction,
            onError:Prototype.emptyFunction,
            onFailure:Prototype.emptyFunction,
            onException:Prototype.emptyFunction
        };
        if (Object.isUndefined(url)) return;
        Object.extend(this.options, options || {});
        /**'Ship-killer', trying to owerride safari caches*/
        //this.url = url + '?' + (new Date().getTime());
        this.url = url;                        
        this.interval = {};
        this.onSuccess = this.options.onSuccess;
        this.run();
    },

    run:function () {
        try {
            var inlineScript = new Element("script", {src:this.url});
            var tempData = Object.toJSON(global.data);
            inlineScript.observe("load", function () {
                this.interval = setInterval(function () {
                    if (tempData != Object.toJSON(global.data)) {
                        clearInterval(this.interval);
                        this.onSuccess(global.data);
                        document.body.removeChild(inlineScript);
                        delete inlineScript;
                    }
                }.bind(this), 100);

            }.bind(this));

            inlineScript.observe("error", function (e) {
                this.options.onError();
                this.options.onFailure();
            }.bind(this));

            inlineScript.observe("abort", function (e) {
                this.options.onException();
            }.bind(this));

            document.body.insert(inlineScript);
        }
        catch (err) {
            console.log(err);
        }
    }
});

function getStack(data) {
    global.data = data;
}

var stackXmlParser = Class.create({

    getAllStacks:function (data) {
        var container = data.getElementsByTagName('stacks');
        var sC = $H(container);
        var stack = sC._object;
        var count = stack[0].childElementCount;
        return count;

    },

    getStack:function (data, stackNumber) {
        var stacksContainer = data.getElementsByTagName('stack');
        var stack = stacksContainer[stackNumber];
        return stack;
    },

    getInfo:function (stack) {

        var stInfo = ({
            name:this.getAttr(stack, 'name'),
            cardCount:stack.getAttribute('cardCount'),
            Cards:stack.getElementsByTagName('card')
        });

        return stInfo;
    },

    parseCards:function (cards) {

        i = 0;
        for (i = 0; i <= (parseInt(cards.length) - 1); i++) {
            var card_ = ({
                id:i,
                name:this.getValue(cards[i], 'name'),
                cursor:this.getValue(cards[i], 'cursor'),
                comments:this.getValue(cards[i], 'comments'),
                actions:({
                    load:this.getCardAction(cards[i], 'load', Array('goto', 'animation')),
                    unload:this.getCardAction(cards[i], 'unload', Array('goto', 'animation')),
                    click:this.getCardAction(cards[i], 'click', Array('goto', 'animation'))
                    /**TODO:
                     *X- make getActions to accept arrays;
                     *- make getActions arrays configurable from constructor;
                     */
                })

            });

            if (!card) {
                var card = Array(card_);
            }
            else card.push(card_);

        }

        return card;

    },

    getAttr:function (el, attr) {
        return el.getAttribute(attr);
    },
    getValue:function (obj, el) {

        return obj.getElementsByTagName(el)[0].textContent;
    },
    getCardAction:function (card, action, what) {

        try {
            var act = card.getElementsByTagName(action)[0];
            var ret = {};

            what.each(function (wh) {
                if (act.getElementsByTagName(wh)[0].textContent)ret[wh] = act.getElementsByTagName(wh)[0].textContent;
            });
            return ret;
        }
        catch (err) {
            return false;
        }
    }
});

/*and fo JSON*/

var stackJsonParser = Class.create({
    /* initialize: function(var) {

     },*/
    getStackCount:function (data) {
        var container = data.stacks;
        var count = container.length;
        //console.log(container.length);
        return count;

    },

    getStack:function (data, stackNumber) {
        var stacksContainer = data.stacks;
        var stack = stacksContainer[stackNumber];
        return stack;
    },


    parseCards:function (cards) {
        //	console.log(cards);
        i = 0;
        for (i = 0; i <= (parseInt(cards.length) - 1); i++) {
            var card_ = ({
                id:i,
                name:this.getValue(cards[i], 'name'),
                cursor:this.getValue(cards[i], 'cursor'),
                comments:this.getValue(cards[i], 'comments'),
                actions:({
                    load:this.getCardAction(cards[i], 'load', Array('goto', 'animation')),
                    unload:this.getCardAction(cards[i], 'unload', Array('goto', 'animation')),
                    click:this.getCardAction(cards[i], 'click', Array('goto', 'animation'))
                    /**TODO:
                     *X- make getActions to accept arrays;
                     *- make getActions arrays configurable from constructor;
                     */
                })

            });

            if (!card) {
                var card = Array(card_);
            }
            else card.push(card_);

        }
        //console.log(card);
        return card;

    },

    getCardAction:function (card, action, what) {

        try {
            var act = card.getElementsByTagName(action)[0];
            var ret = {};

            what.each(function (wh) {
                if (act.getElementsByTagName(wh)[0].textContent)ret[wh] = act.getElementsByTagName(wh)[0].textContent;
            });
            return ret;
        }
        catch (err) {
            return false;
        }
    }
});
/**EOF**/









function loadxml(config) {
    if (!checkBrowser()) return;

    var xml = false;
    showRefreshButton = false;

    if (xml) {
        var req = new AJAXLocalRequest('index.xml',
            {     onSuccess:function (responce) {
                //$('scrollThumbs').fade({duration:0.2});
                var data = responce.responseXML;

                //responce.responseXML.createTreeWalker(function(el){console.log(el);});
                var xmlData = new stackXmlParser();
                var stackCount = xmlData.getAllStacks(data);
                var stack = xmlData.getStack(data, 0);

                var info = xmlData.getInfo(stack);
                cards = xmlData.parseCards(info.Cards);

                /*begin dom actions*/
                if ($('dataId')) var prefix = '/userdata/' + $('dataId').value + '/';
                else var prefix = '';
                document.title = info.name;
                thumbs = {};
                for (var i = 0; i < cards.length; i++) {
                    card = cards[i];
                    //console.log(i);
                    thumbs[i] = {};
                    thumbs[i].imgContainer = new Element('div', {id:'imgContainer' + (i + 1)});
                    /**TODO:
                     * -rewrite this to something dynamic
                     */
                    thumbs[i].img = new Element('img', {src:prefix + 'hstudio1.files/thumbs/hstudio000' + (i + 1) + '.png',
                        width:80,
                        style:'margin-left:10px;margin-top:10px;',
                        alt:card.name});
                    /*setting events*/
                    thumbs[i].img.observe('click', function (el) {
                        updateContPane(el, card, cards);
                    });

                    /**/

                    thumbs[i].cardName = new Element('div', {id:'cardName' + (i + 1)});
                    thumbs[i].cardName.update(card.name);


                    thumbs[i].imgContainer.insert(thumbs[i].img).insert(thumbs[i].cardName);
                    $('scrollThumbs').insert(thumbs[i].imgContainer);

                }

            }


            });
    }

    else {


        prefix = "data/stackData/" + config.homeStackName + "/";
        var req = new AJAXLocalRequest(prefix + 'stack.json',
            //var req = new Ajax.Request(prefix + 'makejson.php',
            {onSuccess:function (responce) {
                try {
                    //var data = responce.responseText.evalJSON(false);
                    var data = responce;
                }
                catch (err) {
                    console.log(err);
                }
                //var data = responce.responseJSON;
                //	console.log(data);
                var jsonData = new stackJsonParser();
                var stackCount = jsonData.getStackCount(data);
                var stack = jsonData.getStack(data, 0);
                var cards = stack.cards;
                /**
                 * begin dom actions
                 **/

                document.title = stack.name;
                thumbs = {};
                cardsCollection = new stackObj({comments:stack.comments});
                /**Hypertext links*/
                linksCollection = stack.links || [];
                linksObjects = stack.linksActionObjects || [];
                /**EOF*/
                for (var i = 0; i < cards.length; i++) {
                    try {
                        var card = cards[i];
                        cardsCollection.push(card);
                        thumbs[i] = {};
                        /*thumbs[i].imgContainer = new Element('div',{id:	'imgContainer'+(i+1)});

                         thumbs[i].img = new Element('img',{src:	prefix + 'Previews/' + card.images.thumb,
                         width: 80,
                         style: 'margin-left:10px;margin-top:10px;',
                         alt: card.name});


                         thumbs[i].img.tempId = i;
                         thumbs[i].img.observe('click',function(el){
                         play.animateGoto('anotherCard',this.tempId,$('tranSelect').value);
                         });


                         /**
                         thumbs[i].cardName = new Element('div',{id:'cardName' + (i),
                         style: 'font-size:14px;text-align:center;width:80px;margin-left:10px;margin-top:5px;'});
                         thumbs[i].cardName.update(card.name);


                         thumbs[i].imgContainer.insert(thumbs[i].img).insert(thumbs[i].cardName);
                         //$('scrollThumbs').insert(thumbs[i].imgContainer);
                         */
                        /**setting events*/
                        /**<div id="imgContainer'+(i+1)+'">
                         * <img src="hstudio1.files/thumbs/hstudio000'+(i+1)+'.png" width="80" style="margin-left:10px;margin-top:10px;" alt="" onclick="updateContPane(this)"/>
                         * <div id="cardName">'+ card.name +'</div></div>');
                         */
                        $('scrollThumbs').hide();
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
                //console.log(cardsCollection);
                var hide = new Element('img', {src:'./data/engine/templates/img/hideThumbs.png',
                    width:20,
                    style:'margin-left:10px;margin-top:10px;',
                    alt:'hide panel'});
                hide.observe('click', function () {
                    $('scrollThumbs').fade();
                });

                /**Debug
                 *Transitions list
                 */
                var select = new Element("select", {
                    id:"tranSelect",
                    style:"width:105px;"
                });

                select.insert(
                    "<option value='barnClose' selected>Barn Close</option>" +
                        "<option value='barnDoor'>Barn Door</option>" +
                        "<option value='fade'>fade</option>" +
                        "<option value='irisCircle'>iris Circle</option>" +
                        "<option value='irisRectangle'>iris Rectangle</option>" +
                        "<option value='pushDown'>push down</option>" +
                        "<option value='pushLeft'>pushLeft</option>" +
                        "<option value='pushRight'>pushRight</option>" +
                        "<option value='pushUp'>pushUp</option>" +
                        "<option value='slideDown'>slideDown</option>" +
                        "<option value='slideLeft'>slideLeft</option>" +
                        "<option value='slideRemoveDown'>slideRemoveDown</option>" +
                        "<option value='slideRemoveLeft'>slideRemoveLeft</option>" +
                        "<option value='slideRemoveRight'>slideRemoveRight</option>" +
                        "<option value='slideRemoveUp'>slideRemoveUp</option>" +
                        "<option value='slideRight'>slideRigh</option>" +
                        "<option value='slideUp'>slideUp</option>" +
                        "<option value='wipeDown'>wipeDown</option>" +
                        "<option value='wipeLeft'>wipeLeft</option>" +
                        "<option value='wipeRight'>wipeRight</option>" +
                        "<option value='wipeUp'>wipeUp</option>" +
                        "<option value='zoom'>zoom</option>" +
                        "<option value='copyMachine'>copyMachine</option>" +
                        "<option value='swipe'>swipe</option>" +
                        "<option value='spotlight'>spotlight</option>" +
                        "<option value='wiper'>wiper</option>" +
                        "<option value='wipeDiagonal'>wipeDiagonal</option>" +
                        "<option value='cube'>cube</option>" +
                        "<option value='cubeReverse'>cubeReverse</option>");


                //$('scrollThumbs').insert(hide);
                //$('scrollThumbs').insert(select);
                /**
                 * eof transitions list
                 */

                if (showRefreshButton) {
                    var reload = new Element("img", {src:"./data/engine/templates/img/refresh.png", style:"position:absolute;z-index:29;top:640px;left:50%;margin-left:360px;cursor:pointer;"});
                    document.body.insert(reload);
                    reload.observe("click", function (e) {
                        document.location = document.location;
                    });
                }

                cardsCollection.setPointer(0);
                //var context = new cMenu({element:document.body.lastChild,items:[{text:"About Hyper Studio web player",func:function(){new messageCreate({image:"./data/engine/templates/img/info.png",text:"mackiev.com",caption:"OK"});}}]});
                /**BOF actions,
                 * Run preloader, initializing player obpject
                 * and goto 1st slide
                 */
                try {
                    //console.log('config');
                    //console.log(config);
                    time = new timeToLoad({size:'1000000', onFinish:function () {
                        play = new playerObj({globalData:data,
                            isResizeWindow:config.isResizeWindow,
                            isWidget:config.isWidget,
                            isFrameEnabled:config.isFrameEnabled});
                    }.bind(this)});// * 1000;
                    /**preloading next card images*/
                    var preloadEls = Array();
                    var firstCard = cardsCollection.currentElement();
                    if (firstCard) {
                        preloadEls.push(prefix + "Previews/" + firstCard.images.background);
                        firstCard.objects.each(function (el) {
                            if (el.type == "image") {
                                preloadEls.push(prefix + el.src);
                            } else if (el.type == "text" && !Object.isUndefined(el.textImage)) {
                                preloadEls.push(prefix + el.textImage);
                            } else if (el.type == "button" && !Object.isUndefined(el.src)) {
                                preloadEls.push(prefix + el.src);
                            }
                        }.bind(this));
                    }

                    /* This preload all images on whole stack. We need only to preload first card */
                    /*cardsCollection.elements().each(function(e){
                     preloadEls.push(prefix + "Previews/" + e.images.background);
                     e.objects.each(function(el){

                     if(el.type=="image")preloadEls.push(prefix + el.src);

                     else if(el.type=="text" && !Object.isUndefined(el.textImage))preloadEls.push(prefix + el.textImage);
                     else if(el.type=="button" && !Object.isUndefined(el.src))preloadEls.push(prefix + el.src);
                     //else if(el.type=="video" && !Object.isUndefined(el.src))preloadEls.push(prefix + el.src);

                     }.bind(this));
                     }.bind(this));*/
                    new imgPreloader({images:preloadEls});
                    /**eof preloading*/
                }
                catch (err) {
                    alert(err);
                }
            }
            });
    }
}

var browserDetect = Object(
    browserDetect = function () {
        this.nVer = navigator.appVersion;
        this.nAgt = navigator.userAgent;
        this.browserName = navigator.appName;
        this.fullVersion = '' + parseFloat(navigator.appVersion);
        this.majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        if ((verOffset = this.nAgt.indexOf("Opera")) != -1) {
            this.browserName = "Opera";
            this.fullVersion = this.nAgt.substring(verOffset + 6);
            if ((verOffset = this.nAgt.indexOf("Version")) != -1)
                this.fullVersion = this.nAgt.substring(verOffset + 8);
        }

        else if ((verOffset = this.nAgt.indexOf("MSIE")) != -1) {
            this.browserName = "MSIE";
            this.fullVersion = this.nAgt.substring(verOffset + 5);
        }

        else if ((verOffset = this.nAgt.indexOf("Chrome")) != -1) {
            this.browserName = "Chrome";
            this.fullVersion = this.nAgt.substring(verOffset + 7);
        }
        else if ((verOffset = this.nAgt.indexOf("Safari")) != -1) {
            this.browserName = "Safari";
            this.fullVersion = this.nAgt.substring(verOffset + 7);
            if ((verOffset = this.nAgt.indexOf("Version")) != -1)
                this.fullVersion = this.nAgt.substring(verOffset + 8);
        }

        else if ((verOffset = this.nAgt.indexOf("Firefox")) != -1) {
            this.browserName = "Firefox";
            this.fullVersion = this.nAgt.substring(verOffset + 8);
        }

        else if ((nameOffset = this.nAgt.lastIndexOf(' ') + 1) < (verOffset = this.nAgt.lastIndexOf('/'))) {
            this.browserName = this.nAgt.substring(nameOffset, verOffset);
            this.fullVersion = this.nAgt.substring(verOffset + 1);
            if (this.browserName.toLowerCase() == this.browserName.toUpperCase()) {
                this.browserName = navigator.appName;
            }
        }

        if ((ix = this.fullVersion.indexOf(";")) != -1) this.fullVersion = this.fullVersion.substring(0, ix);
        if ((ix = this.fullVersion.indexOf(" ")) != -1) this.fullVersion = this.fullVersion.substring(0, ix);

        this.majorVersion = parseInt('' + this.fullVersion, 10);
        if (isNaN(this.majorVersion)) {
            this.fullVersion = '' + parseFloat(navigator.appVersion);
            this.majorVersion = parseInt(navigator.appVersion, 10);
        }
    }
);
function checkBrowser() {
    var browser = new browserDetect();
    //alert(Object.isFunction(document.createElement('canvas').getContext));
    if (browser.browserName == "MSIE" && document.compatMode == 'BackCompat'/*||(browser.browserName=="MSIE"&&!Object.isFunction(document.createElement('canvas').getContext))*/) {
        alert('Embedded code cannot be displayed correctly \n' +
            'Make sure your Web page contains the <meta http-equiv="X-UA-Compatible" content="IE=9" >  metatag. If it does not, copy and paste this metatag between the <head> and </head> tags of your Web page.');
        return false;
    }

    if (/*(!Prototype.Browser.MobileSafari&&(Prototype.Browser.MSIE&&(!!document.createElement('video').canPlayType == false))&&browser.browserName!='Safari')||*/Prototype.Browser.Opera/*||Prototype.Browser.Gecko||browser.browserName=="Chrome"*/ || (browser.browserName == "MSIE" && parseInt(browser.fullVersion) < 9)) {
        alert('Your current Web browser is not fully supported. \n' +
            'You might experience compatibility issues if you continue using your current Web browser. For the best possible compatibility and performance of exported HyperStudio Author stacks, Safari 5 and later, Internet Explorer 9 and later or Google Chrome 12.0 and later are recommended.');
    }

    try {
        document.createElement('video').canPlayType('');

    } catch (err) {
        if (/plemented/.test(err)) {
            alert('Cannot launch Windows Media Player \n' +
                'Windows Media Player has been damaged or deleted. Reinstall Windows Media Player or contact your system administrator and try again.');
            return false;
        }
    }


    return true;

}

function checkConfig(config) {
    var bar = $('mainbar');
    var load = $('loadStatus');
    var loadBack = $('logo');
    var loader = $('showedImg');
    var wrapper = $('wrapperTable');
    var b = $(document.body);
    if (!config.isWidget) {
        var center = window.innerWidth / 2;
        var verticalCenter = window.innerHeight / 2;
        var bodyBackground = b.style.background;

        //loader.parentNode.removeChild(loader);
        //wrapper.parentNode.insert(loader);
        load.setStyle("top:" + (verticalCenter - (load.getHeight() / 2)) + "px;left:" + (center - (load.getWidth() / 2)) + "px;");
        loadBack.setStyle("top:" + (verticalCenter - (loadBack.getHeight() / 2)) + "px;left:" + (center - (loadBack.getWidth() / 2)) + "px;");
        wrapper.hide();

        b.setStyle("background:#fff;");
        setTimeout(function () {
            if (config.isFrameEnabled) b.setStyle("background:" + bodyBackground);
        }.bind(this), 500);
    }
    if (config.isWidget) {
        $(document.body).setStyle("background:#fff;-webkit-overflow-scrolling: touch;");
        $('showedImg').hide();
        $('loadStatus').hide();
        $('logo').hide();
        var widgetImg = new Element("img", {id:"widgetFrame", style:"position:absolute;z-index:998;top:0px;bottom:0px;left:0px;right:0px;margin:auto;"});
        widgetImg.observe("load", function () {
            $(document.body).insert(widgetImg);
        }.bind(this));
        widgetImg.src = "./Default.png";
    }

    if (!config.isFrameEnabled) {
        $(document.body).setStyle("background-image:none;background:#fff;");
        var container = $('wrapperTable');
        container.setStyle("background:#fff;" +
            "border:none 0;" +
            "-moz-border-radius:0;" +
            "-webkit-border-radius:0;" +
            "-o-border-radius:0;" +
            "border-radius:0;" +
            "-moz-box-shadow:none;" +
            "-webkit-box-shadow:none;" +
            "-o-box-shadow:none;" +
            "box-shadow:none;" +
            "padding:0;" +
            "margin:0 auto;");
        $('contPane').setStyle("top:0;");
        bar.hide();
    }
}

function loadStatusCache(e){

    var browser = new browserDetect();
    if(browser.browserName == "MSIE" && parseInt(browser.fullVersion) < 10){
        return;
    }

    var loadStatusCache = $('loadStatusCache');
    var progress = $('progressStatusCache');
    var progressWidth = Math.ceil(window.innerWidth / 4);

    var handleCacheEvent = function(e){
        switch(e.type){
            case "updateready":
                break;
            case "checking":
                break;
            case "downloading":
                break;
            case "progress":
                if(e.loaded == 1){
                    loadStatusCache.show();
                }
                progress.setStyle("width:" + Math.ceil(e.loaded / e.total * progressWidth) + "px;");
                if(e.loaded == e.total){
                    progress.setStyle("border-radius: 3px;-moz-border-radius: 3px;-webkit-border-radius: 3px;-khtm-border-radius: 3px;");
                    loadStatusCache.hide();
                }
                break;
            case "cached":
                break;
            case "noupdate":
                loadStatusCache.hide();
                break;
        }
    };

    var handleCacheError = function(e){
    };

    var appCache= window.applicationCache;
    if(appCache){
        appCache.addEventListener('checking', handleCacheEvent, false);
        appCache.addEventListener('downloading', handleCacheEvent, false);
        appCache.addEventListener('progress', handleCacheEvent, false);
        appCache.addEventListener('cached', handleCacheEvent, false);
        appCache.addEventListener('noupdate', handleCacheEvent, false);
        appCache.addEventListener('error', handleCacheError, false);
        appCache.addEventListener('obsolete', handleCacheEvent, false);
        appCache.addEventListener('updateready', handleCacheEvent, false);
    }

    loadStatusCache.setStyle("width:" + progressWidth + "px;");
    loadStatusCache.setStyle("margin-left:-" + (progressWidth / 2) + "px;" );
    loadStatusCache.hide();

}