// Copyright (c) 2014 The Software MacKiev Company. All rights reserved.
// For details, see us at www.hyperstudio.com

/**
 * Transitions object is designed to handle
 * transitions on "goto" actions.
 * params:
 * -currentElement: element, currently displayed;
 * -next element: element that will be shown, replacing currentElement;
 * -effect: transition effect(fade,pushUp,etc);
 * -durr: duration of transition effect (seconds), may be ignored with some transitions
 */
var transitions = Class.create({

    initialize:function (options) {
        try {
            this.options = {
                currentElement:'currentElement',
                nextElement:'nextElement',
                effect:'HSFadeTransition',
                durr:'1',
                mode:'cardSwitch'
            };

            Object.extend(this.options, options || { });

            this.playEffectAnimation(this.options.currentElement, this.options.nextElement, this.options.effect, this.options.durr, this.options.mode);
        }
        catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    /*createOverlay: function(){
     this.screen = new Element("div",{style:"position:absolute;top:0px;left:0px;height:100%;width:100%;z-index:999999;cursor:default;"});
     this.screen.observe("click",function(e){e.stop();e.stopPropagation();e.preventDefault();});
     document.body.insert(this.screen);
     },

     removeOverlay: function(){
     setTimeout(function(){document.body.removeChild(this.screen);}.bind(this),250);
     },*/

    playEffectAnimation:function (animateFrom, animateTo, effect, durr, mode) {
        try {
            var effectSettings = {
                animateFrom:animateFrom,
                animateTo:animateTo,
                durr:durr,
                mode:mode
            };
            var supportedTransitions = ['Barn', 'Barn_Door', 'Clock_Face', 'CopyMachine', 'CubeMixer', 'Explode',
                'Fade', 'Flash', 'GaussianBlur', 'Implode', 'Implode_Circle', 'Iris_Circle', 'Iris_Heart',
                'Iris_Rectangle', 'Iris_Star', 'Jaws', 'Kaleidoscope', 'Lawnmower', 'Mod', 'No_Transition',
                'Open_Sesame', 'Page_Tear', 'Push', 'PushBottom', 'PushLeft', 'PushRight', 'Reverse_CubeMixer',
                'Ripple', 'Slide_Down', 'Slide_Left', 'Slide_Up', 'Slide_Right', 'Slide_Remove_Down',
                'Slide_Remove_Left', 'Slide_Remove_Right', 'Slide_Remove_Up', 'Spiral', 'Spotlight', 'Swipe',
                'Twirl', 'Waterfall', 'Windmill', 'Wipe_Diagonal', 'Wipe_Up', 'Wipe_Down', 'Wipe_Left',
                'Wipe_Right', 'Wiper', 'Zoom', 'SkyClouds', 'LiquidImage', 'Engulf'];
            if (supportedTransitions.indexOf(effect) == -1) {
                /*if (effect !='HSFadeTransition'){
                 alert('unknown transition: '+effect);
                 }*/
                effect = 'Fade';
            }
            else if (effect == 'Zoom' && mode != 'cardSwitch') {
                effect = 'Zoom_canva_version';
            }
            else if (effect == 'Fade' && mode != 'cardSwitch') {
                effect = 'Fade_canva_version';
            }
            else if (effect == 'CubeMixer' && mode == 'cardSwitch' && Prototype.Browser.WebKit) {
                effect = 'CubeMixer_WebKit';
            }
            else if (effect == 'Reverse_CubeMixer' && mode == 'cardSwitch' && Prototype.Browser.WebKit) {
                effect = 'Reverse_CubeMixer_WebKit';
            }


            return new transition[effect](effectSettings);
        }
        catch (err) {
            alert('player.js (transitions:playEffectAnimation) error: ' + console.log(err));
        }
    }
});

var transition = {};

transition.main = Class.create({
    frameInterval:30, // interval in ms between frames in animation
    duration:1500,
    resized:false, // this allow us to run faster version of animation
    initialize:function (options) {
        try {
            this.options = {
                animateFrom:'currentElement',
                animateTo:'nextElement',
                effect:'HSFadeTransition',
                durr:'1.5',
                mode:'cardSwitch'
            };
            Object.extend(this.options, options || { });
            this.animateFrom = this.options.animateFrom;
            this.animateTo = this.options.animateTo;
            this.dimX = this.animateTo.getWidth();
            this.dimY = this.animateTo.getHeight();
            this.duration = this.options.durr * 1000;
            //this.duration = 3000; // for testing purposes

            if (this.animateFrom.id && $('TransitionCanvas' + this.animateFrom.id)) {
                // choosen object already used in other animation
                return;
            }
            // booster for bulk No_Transition actions
            if (this.options.effect == 'No_Transition' && this.options.mode != 'cardSwitch') {
                switch (this.option.mode) {
                    case 'hide':
                        this.animateFrom.hide();
                        return;
                        break;
                    case 'show':
                        this.animateTo.show();
                        return;
                        break;
                }
            }

            this.benchmarkCanvas();
            var preloader = new Image();
            preloader.observe("load", this.runAnimation.bind(this));
            switch (this.options.mode) {
                case 'cardSwitch':
                    /**no transition appearance fix*/
                    if (parseInt(this.options.durr) == 0)this.animateFrom.style.zIndex = 99999;
                    /**EOF*/
                    this.image = this.findImage(this.animateFrom.firstDescendant());
                    this.image2 = this.findImage(this.animateTo.firstDescendant());
                    if (parseInt(this.options.durr) != 0)this.nullifyZIndex();
                    preloader.src = this.image2.src;
                    break;
                case 'hide':
                    this.image = this.findImage(this.animateFrom);
                    this.image2 = this.emptyImage();
                    //preloader.src = this.image.src; // not really needed to preload
                    break;
                case 'show':
                    this.image = this.emptyImage();
                    this.image2 = this.findImage(this.animateTo);
                    //preloader.src = this.image2.src;
                    break;
            }
            if (!preloader.src) {
                this.runAnimation();
            }
        }
        catch (err) {
            alert('transition: initialize error:' + console.log(err));
        }
    },

    resizeImages:function () {
        // resize this.image
        if (this.skipResizing) {
            delete this.skipResizing;
            return;
        }
        var oldDimension = this.animateFrom.getDimensions();
        if (oldDimension.height && oldDimension.width && (oldDimension.width != this.dimX || oldDimension.height != this.dimY)) {
            this.dimX = Math.max(this.dimX, oldDimension.width);
            this.dimY = Math.max(this.dimY, oldDimension.height);
            // animateFrom image
            var resizedImage = new Element('canvas', {width:this.dimX, height:this.dimY});
            var ctx = resizedImage.getContext('2d');
            ctx.drawImage(this.image,
                parseInt((this.dimX - this.animateFrom.getWidth()) / 2),
                parseInt((this.dimY - this.animateFrom.getHeight()) / 2));
            this.image = resizedImage;
            // animateTo image
            var resizedImage2 = new Element('canvas', {width:this.dimX, height:this.dimY});
            var ctx2 = resizedImage2.getContext('2d');
            ctx2.drawImage(this.image2,
                parseInt((this.dimX - this.animateTo.getWidth()) / 2),
                parseInt((this.dimY - this.animateTo.getHeight()) / 2));
            this.image2 = resizedImage2;
            this.animateFromTopTransparentBorder = (this.dimY - this.animateFrom.getHeight()) / 2; // some transition want to know this
            this.resized = true;
        }
    },

    runAnimation:function () {
        this.resizeImages();
        // moved here from windmill transition
        if (Prototype.Browser.MobileSafari) $$("video").invoke("pause");
        this.run();  // every transition define it's own run() method
        /**Hiding object of hide transition*/
        if (this.options.mode == "hide") this.animateFrom.hide();
        /**EOF*/
        if (this.drawFrame && !this.error) {
            var timeStart = new Date().getTime();
            var framesDrawen = 0;
            var showFPS = false;   // must be turned off in production
            if (this.options.mode == 'cardSwitch' && !this.resized && this.drawFastFrame) {
                //this.ctx.drawImage(this.image, 0, 0);
                // run faster version, that don't support opacity
                var drawFunction = function () {
                    var p = (new Date().getTime() - timeStart) / this.duration;
                    if (p > 1) {
                        if (this.ctx) {
                            this.ctx.drawImage(this.image2, 0, 0);
                        } else {
                            this.drawFastFrame(1);
                        }
                        setTimeout(this.stopAnimation.bind(this), this.frameInterval);
                        if (showFPS && framesDrawen > 1) alert((framesDrawen * 1000 / this.duration).toPrecision(4) + ' fps');
                    } else {
                        this.drawFastFrame(p);
                        framesDrawen++;
                        var p2 = (new Date().getTime() - timeStart) / this.duration;
                        if (p2 - p > this.frameInterval / this.duration) {
                            setTimeout(drawFunction, this.frameInterval / 5);
                        } else {
                            setTimeout(drawFunction, this.frameInterval);
                        }
                    }
                }.bind(this);
            } else {
                if (this.resized && this.ctx) {
                    // replace animateFrom by it's image
                    this.ctx.drawImage(this.image, 0, 0);
                    this.animateFrom.hide();
                }
                // slow version for switching between stacks with nonequal dimensions and hide/show objects
                var drawFunction = function () {
                    var p = (new Date().getTime() - timeStart) / this.duration;
                    if (p > 1) {
                        this.stopAnimation();

                        if (showFPS && framesDrawen > 1) alert((framesDrawen * 1000 / this.duration).toPrecision(4) + ' fps');
                    } else {
                        if (this.ctx) {
                            this.ctx.clearRect(0, 0, this.dimX, this.dimY);
                        }
                        this.drawFrame(p);
                        framesDrawen++;
                        setTimeout(drawFunction, this.frameInterval);
                    }
                }.bind(this);
            }
            drawFunction();  // show first frame without delay
        }
    },

    stopAnimation:function () {
        this.animateFrom.hide();
        switch (this.options.mode) {
            case 'cardSwitch':
                this.animateFrom.select('img').each(function (el) {
                    el.src = '';
                });
                //this.animateFrom.select('video').each(function(el){el.src = '';});
                this.animateFrom.select('canvas').each(function (el) {
                    el.height = '0px';
                    el.width = '0px';
                });
                this.animateFrom.parentNode.removeChild(this.animateFrom);
                this.animateTo.style.visibility = 'visible';
                this.image.parentNode && this.image.parentNode.removeChild(this.image);     // fix bug X2IBA-2434
                this.image2.parentNode && this.image2.parentNode.removeChild(this.image2);  // fix bug X2IBA-2434
                document.fire(this.animateTo.id + ':loaded');
                break;
            case 'show':
                if (this.animateTo.tagName == "video") {
                    this.animateTo.currentTime = "0.02"; // fix bug X2IBA-1494
                }
                this.animateTo.show();
                this.image2.show();
                break;
        }

        if (this.animateTo.tagName.toLowerCase() === 'video' && this.options.mode == 'show') {
            // disable blinking
            // can produce bug when transparent video will be implemented
            //if (this.animateTo.play) this.animateTo.play();

            this.animateTo.style.visibility = 'visible';
            if (this.canvas) this.canvas.setStyle({zIndex:0});
            setTimeout(this.removeCanvas.bind(this), 300);
        } else {
            this.removeCanvas();
        }
        // delete functions, that may have pointer to our lovely canva (X2IBA-321)
        delete this.run;
        delete this.drawFastFrame;
        delete this.drawFrame;
        delete this.animateFrom;
        delete this.animateTo;
        delete this.image;
        delete this.image2;
        delete this;
    },

    createOverlay:function () {
        this.screen = new Element("div", {style:"position:absolute;top:0px;left:0px;height:100%;width:100%;z-index:999999;cursor:default;", onclick:"return false;"});
        this.screen.observe("mousedown", function (e) {
            e.stop();
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
        document.body.insert(this.screen);
    },

    removeOverlay:function () {
        setTimeout(function () {
            if (this.screen) {
                document.body.removeChild(this.screen);
                delete this.screen;
            }
        }.bind(this), 250
        );
    },

    createCanvas:function () {
        this.canvas = new Element('canvas', {
            width:this.dimX,
            height:this.dimY,
            id:'TransitionCanvas',
            //style:'position:absolute;top:0px;left:0px;z-index:999;'
            style:'position:absolute;top:0px;left:0px;z-index:' + this.animateFrom.style['z-index'] + ';'
        });
        if (this.animateFrom.id) {
            this.canvas.id += this.animateFrom.id;
        }
        if ($(this.canvas.id)) {
            this.error = true;
            return;
        }
        if (this.options.mode == 'hide') {
            this.canvas.style.left = this.animateFrom.style.left;
            this.canvas.style.top = this.animateFrom.style.top;
        } else if (this.options.mode == 'show') {
            this.canvas.style.left = this.animateTo.style.left;
            this.canvas.style.top = this.animateTo.style.top;
        }
        // boosting from windmill transition
        this.canvas.setStyle("-webkit-image-rendering:optimizeSpeed !important; image-rendering: optimizeSpeed !important;");
        if (this.options.mode == 'cardSwitch') {
            this.canvas.setStyle("-webkit-transform:translate3d(0,0,0);-webkit-backface-visibility:hidden;-webkit-perspective:1000;");
        }
        //this.canvas.style.setProperty("image-rendering", "-webkit-optimize-contrast", "important");
        if (this.animateFrom.style && this.animateFrom.style.cursor) {
            //this.canvas.style.cursor = this.animateFrom.style.cursor;
        }
        this.animateFrom.parentNode.insert(this.canvas);
        //this.ctx = $(this.canvas.id).getContext('2d');
        // our canva can also do overlay task
        this.canvas = $(this.canvas.id);
        //this.canvas.observe("mousedown", function(e){e.stop();e.stopPropagation();e.preventDefault();return false;});
        // raw event attaching for fix memory leak on iPad1. (X2IBA-321)
        this.canvaClick = function (e) {
            e.stop();
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
        if (this.canvas.addEventListener) {
            this.canvas.addEventListener("mousedown", this.canvaClick, false);
        } else {
            this.canvas.attachEvent("onmousedown", this.canvaClick);
        }
        this.ctx = this.canvas.getContext('2d');
        // moved from cube transition
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        return this.ctx;
    },

    createSmoothCanvas:function (smoothLevel) {
        smoothLevel = smoothLevel - this.canvaRelativePerfomance;
        smoothLevel = Math.max(smoothLevel, 0);
        smoothLevel = Math.min(smoothLevel, 20);

        var sDimX = this.dimX;
        var sDimY = this.dimY;

        // exponential gradation
        var smoothLevels = [1, // lvl 0
            1.0717, // lvl 1
            1.1486, // lvl 2
            1.2311, // lvl 3
            1.3195, // lvl 4
            1.4142, // lvl 5
            1.5157, // lvl 6
            1.6245, // lvl 7
            1.7411, // lvl 8
            1.8660, // lvl 9
            2, // lvl 10
            2.1435, // lvl 11
            2.2973, // lvl 12
            2.4622, // lvl 13
            2.6390, // lvl 14
            2.8284, // lvl 15
            3.0314, // lvl 16
            3.2490, // lvl 17
            3.4822, // lvl 18
            3.7321, // lvl 19
            4];      // lvl 20
        var scaleFactor = smoothLevels[smoothLevel];
        this.dimX = Math.floor(this.dimX / scaleFactor);
        this.dimY = Math.floor(this.dimY / scaleFactor);

        var ctx = this.createCanvas();
        this.canvas.setStyle('width:' + (sDimX) + 'px;height:' + (sDimY) + 'px;');
        //this.image  = this.rescaleImage(this.image,  this.dimX, this.dimY);
        //this.image2 = this.rescaleImage(this.image2, this.dimX, this.dimY);

        this.image = this.smoothRescaleImage(this.image, this.dimX, this.dimY);
        this.image2 = this.smoothRescaleImage(this.image2, this.dimX, this.dimY);
        return ctx;
    },

    rescaleImage:function (image, dimX, dimY) {
        var resizedImage = new Element('canvas', {width:dimX, height:dimY});
        var ctx = resizedImage.getContext('2d');
        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.drawImage(image, 0, 0, dimX, dimY);
        return resizedImage;
    },

    smoothRescaleImage:function (image, dimX, dimY) {
        var resizedImage = new Element('canvas', {width:dimX, height:dimY});
        var resizedImage2 = new Element('canvas', {width:dimX * 2, height:dimY * 2});
        var ctx = resizedImage.getContext('2d');
        var ctx2 = resizedImage2.getContext('2d');
        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx2.mozImageSmoothingEnabled = true;
        ctx2.webkitImageSmoothingEnabled = true;
        ctx2.drawImage(image, 0, 0, dimX * 2, dimY * 2);
        ctx.drawImage(resizedImage2, 0, 0, dimX, dimY);
        // manual garbage collector
        ctx = null;
        cxt2 = null;
        resizedImage2.width = 0;
        resizedImage2.height = 0;
        resizedImage2 = null;
        image.width = 0;
        image.height = 0;
        return resizedImage;
    },

    removeCanvas:function () {
        if (this.canvas) {
            /* Raw event deataching. Not nececary as i see
             if (this.canvas.removeEventListener){
             this.canvas.removeEventListener("mousedown", this.canvaClick, false);
             } else {
             this.canvas.detachEvent("onmousedown", this.canvaClick);
             }*/
            this.canvas.parentNode.removeChild(this.canvas);
            delete this.canvaClick;
            delete this.canvas;
            delete this.ctx;
        }
    },

    nullifyZIndex:function () {
        this.animateFrom.childElements().each(function (el) {
            Try.these(
                function () {
                    el.style.zIndex = '0';
                }
            );
        });
        if (this.animateFrom.style.zIndex) {
            this.animateFrom.style.zIndex = 0;
        }

    },
    // find obj image according to obj type
    findImage:function (obj) {
        if (!Object.isElement(obj)) {
            return this.emptyImage();
        }
        // normal behavior
        if (obj.tagName.toLowerCase() == "img") {
            return obj;
        }
        // highlighted images and buttons
        if (obj.id) {
            var img = $(obj.id + '_image');
            if (Object.isElement(img) && img.tagName.toLowerCase() == "img") {
                return img;
            }
        }
        // png map video
        var background = obj.getStyle('background-image');
        if (background) {
            var reqExp = /url\(["'](.*?)["']\)/;
            if (reqExp.test(background)) {
                var url = reqExp.exec(background);
                return new Element('img', {width:this.dimX, height:this.dimY, src:url[1]});
            }
        }
        // video with controls
        if (obj.getScreenshot) {
            var screenshot = obj.getScreenshot();
            this.dimY = screenshot.height;
            this.skipResizing = true;
            return screenshot;
        }
        // html5 video
        if (obj.tagName.toLowerCase() == 'video') {
            var canva = this.emptyImage();
            var ctx = canva.getContext('2d');
            obj.play();
            ctx.drawImage(obj, 0, 0);
            obj.pause();
            return canva;
        }
        // text objects
        if (obj.firstChild && obj.firstChild.firstChild && obj.firstChild.firstChild.tagName.toLowerCase() == "img") {
            return obj.firstChild.firstChild;
        }

        // text objects no img
        if ( obj.firstChild && obj.tagName.toLowerCase() === "div" && obj.firstChild.firstChild && obj.firstChild.firstChild.tagName.toLowerCase() === "div") {
            try {
                var objToCnv = obj.clone();
                objToCnv.id = objToCnv.id + '_clone';
                objToCnv.innerHTML = obj.innerHTML;
                if(this.options.mode === 'show') obj.show();
                var scrollTop = obj.scrollTop;
                var scrollLeft = obj.scrollLeft;
                if(this.options.mode === 'show') obj.hide();

                if(scrollTop){
                    objToCnv.firstChild.style.marginTop ='-' + scrollTop +'px';
                }
                if(scrollLeft){
                    objToCnv.firstChild.style.marginLeft ='-' + scrollLeft +'px';
                }

                var canvas = this.emptyImage();
                var ctx = canvas.getContext("2d");
                var data = "data:image/svg+xml," +
                    "<svg xmlns='http://www.w3.org/2000/svg' width='"+ this.dimX +"px' height='"+ this.dimY +"px'>" +
                        "<foreignObject width='100%' height='100%'>" +
                            "<div xmlns='http://www.w3.org/1999/xhtml' style=''>" +
                                objToCnv.outerHTML.replace('position: absolute; ', '').replace('display: none; ', '').replace('-webkit-overflow-scrolling: touch !important;', '') +
                            '</div>' +
                        "</foreignObject>" +
                    "</svg>";

                var img = new Image();
                img.src = data;
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                }
                delete objToCnv;
                return img;
            } catch (err) {
                console.log(err);
            }
        }


        // object is non-supported
        return this.emptyImage();
    },
    emptyImage:function () {
        return new Element('canvas', {width:this.dimX, height:this.dimY});
    },
    /* This benchmarking in future will decrease smoth levels of canva, if we have powerfull machine */
    benchmarkCanvas:function () {
        if (!window.play) {
            this.canvaRelativePerfomance = 0;
            return;
        }
        if (play.canvaRelativePerfomance !== undefined) {
            this.canvaRelativePerfomance = play.canvaRelativePerfomance;
            return;
        }
        var canvas = new Element('canvas', {width:this.dimX, height:this.dimY});
        var ctx = canvas.getContext('2d');
        var timeStart = new Date().getTime();
        var cImg = ctx.createImageData(this.dimX, this.dimY);
        var i = this.dimX * this.dimY;
        while (i--) {
            cImg.data[i] = 200;
        }
        ctx.putImageData(cImg, 0, 0);
        var duration = (new Date().getTime() - timeStart);
        if (duration < 30) {
            this.canvaRelativePerfomance = 10;  // firefox on strong machine
        } else if (duration < 60) {
            this.canvaRelativePerfomance = 5;   // safari on strong machine
        } else if (duration < 120) {
            this.canvaRelativePerfomance = 3;   // normal machine or iPad3
        } else if (duration < 200) {
            this.canvaRelativePerfomance = 0;   // iPad1
        } else {
            this.canvaRelativePerfomance = -5;  // old machines
        }
        play.canvaRelativePerfomance = this.canvaRelativePerfomance;
    }
});

/**
 * Mod
 */
transition.Mod = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var zholud = function (x, y, h) {
            ctx.moveTo(x, y - 8 * h);
            ctx.bezierCurveTo(x + 2 * h, y - 8 * h, x + 14 * h, y - 6 * h, x + 14 * h, y);
            ctx.bezierCurveTo(x + 14 * h, y + 6 * h, x + 2 * h, y + 8 * h, x, y + 8 * h);
            ctx.bezierCurveTo(x - 4 * h, y + 8 * h, x - 7 * h, y + 3 * h, x - 7 * h, y);
            ctx.bezierCurveTo(x - 7 * h, y - 3 * h, x - 4 * h, y - 8 * h, x, y - 8 * h);
        };
        var turnPointX = this.dimX / 5;
        var turnPointY = this.dimY * 4 / 5;
        var maxRadius = Math.sqrt(dimX * dimX + dimY + dimY);
        var step = maxRadius / 4;

        this.drawFastFrame = function (p) {
            var frameStep = step / 100 + step / 15 * p;
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.save();
            ctx.beginPath();
            for (var x = -maxRadius; x < dimX + maxRadius; x += step) {
                for (var y = -maxRadius; y < dimY + maxRadius; y += step) {
                    var x1 = x - turnPointX;
                    var y1 = y - turnPointY;
                    var r = Math.sqrt(x1 * x1 + y1 * y1);
                    var angle = Math.atan(x1 / y1) + (0.6 * p - 0.3) * Math.PI;
                    if (y1 < 0) angle = angle + Math.PI;
                    x1 = r * Math.sin(angle);
                    y1 = r * Math.cos(angle);
                    // border checking
                    if (y1 + 8 * frameStep > -turnPointY
                        && y1 - 8 * frameStep < dimY - turnPointY
                        && x1 + 14 * frameStep > -turnPointX
                        && x1 - 7 * frameStep < dimX - turnPointX) {
                        zholud(x1 + turnPointX, y1 + turnPointY, frameStep);
                    }
                }
            }
            ctx.clip();
            ctx.clearRect(0, 0, dimX, dimY);
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };

        this.drawFrame = this.drawFastFrame;
    }
});

transition.No_Transition = Class.create(transition.main, {
    run:function (animateFrom, animateTo, durr) {
        this.duration = 0.01; // count in ms. it's better to not divide on zero
        this.drawFrame = Prototype.emptyFunction;
    }
});

/**
 * Engulf
 */
transition.Engulf = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = dimX / 2;
        this.drawFrame = function (p) {
            var h = (2 - p * 3) * dimY;
            if (h > dimY) {     // center above card
                var dy = h - dimY;
            } else if (h > 0) { // center on card
                var dy = 0;
            } else {           // center upper the top of card
                var dy = -2 * h;
            }
            var r = Math.sqrt(dimX2 * dimX2 + dy * dy);
            ctx.drawImage(this.image, 0, 0);
            ctx.save();
            ctx.beginPath();
            ctx.arc(dimX2, h, r, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            ctx.drawImage(this.image, 0, 0);
            ctx.save();
            ctx.beginPath();
            var h = (2 - p * 3) * dimY;
            if (h > dimY) {     // center above card
                var dy = h - dimY;
                var r = Math.sqrt(dimX2 * dimX2 + dy * dy);
                var angle = Math.atan2(dimX2, dy);
                ctx.moveTo(0, dimY);
                ctx.arc(dimX2, h, r, -Math.PI / 2 - angle, -Math.PI / 2 + angle);
                ctx.lineTo(0, dimY);
            } else if (h > 0) { // center on card
                var dy = 0;
                var r = Math.sqrt(dimX2 * dimX2 + dy * dy);
                ctx.arc(dimX2, h, r, 0, Math.PI * 2, true);
            } else {           // center upper the top of card
                var dy = -2 * h;
                var r = Math.sqrt(dimX2 * dimX2 + dy * dy);
                var angle = Math.atan2(dimX2, dy);
                ctx.moveTo(0, 0);
                ctx.arc(dimX2, h, r, Math.PI / 2 + angle, Math.PI / 2 - angle, true);
                ctx.lineTo(dimX, 0);
            }
            //ctx.arc(dimX2,h,r,0,Math.PI*2,true);
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
    }
});

/**
 * Explode
 */
transition.Explode = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(11);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var startX = parseInt(dimX / 2);
        var startY = parseInt(dimY / 2);
        var radius = Math.sqrt(dimX * dimX + dimY * dimY) / 2;
        this.drawFrame = function (p) {
            var maxScale = 7;
            var scale = maxScale - (1 - p) * (maxScale - 1);
            ctx.drawImage(this.image, (dimX - dimX * scale) / 2, (dimY - dimY * scale) / 2, dimX * scale, dimY * scale);
            ctx.save();
            ctx.beginPath();
            ctx.arc(startX, startY, radius * p, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.restore();
        };
    }
});

/**
 * Fade
 * probably some of this code may be copypasted to work version
 */
transition.Fade = Class.create(transition.main, {
    run:function () {
        this.createOverlay();
        var animateFrom = this.animateFrom;
        var animateTo = this.animateTo;
        animateTo.style.visibility = 'visible';
        animateFrom.setStyle("position:absolute;z-index:9999;top:0px;left:0px;");
        animateTo.setStyle("position:absolute;z-index:0;top:0px;left:0px;");
        animateTo.setStyle("display:none;");
        setTimeout(function () {
            new Effect.Opacity(animateFrom.id, {duration:this.duration / 1000, from:1, to:0, transition:Effect.Transitions.sinoidal,
                afterUpdate:function () {
                    if (animateTo.style.zIndex > 0) {
                        animateTo.hide();
                    }
                    else if (animateTo.style.display == "none") {
                        animateTo.show();
                    }
                }.bind(this),
                afterFinish:function () {
                    animateFrom.parentNode.removeChild(animateFrom);
                    setTimeout(function () {
                        this.removeOverlay();
                        document.fire(animateTo.id + ':loaded');
                    }.bind(this), 1000);
                }.bind(this)});
        }.bind(this), 10);
    }
});

/**
 * Fade
 */
transition.Fade_canva_version = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        this.drawFrame = function (p) {
            var opacity = Effect.Transitions.sinoidal(p);// from 0 to 1
            //ctx.drawImage(this.image2,0,0,this.dimX,this.dimY); // fix bug X2IBA-1229 (target blinks while Fade effect)
            ctx.globalAlpha = 1 - opacity;
            ctx.drawImage(this.image, 0, 0);
            ctx.globalAlpha = opacity;
            ctx.drawImage(this.image2, 0, 0);
        };
        /*  drawImage version. Slower, but have same behavior with other transitions
         var curOpacity = 0;
         this.drawFastFrame = function (p){
         var neededOpacity = Effect.Transitions.sinoidal(p);
         curOpacity = (neededOpacity - curOpacity)/ (1 - curOpacity);
         ctx.globalAlpha = curOpacity;
         ctx.drawImage(this.image2, 0, 0);
         };*/
        var imageDrawed = false;
        this.drawFastFrame = function (p) {
            if (!imageDrawed) {
                ctx.clearRect(0, 0, this.dimX, this.dimY);
                ctx.drawImage(this.image2, 0, 0);
                imageDrawed = true;
            }
            var neededOpacity = Effect.Transitions.sinoidal(p);
            this.canvas.setOpacity(neededOpacity);
        };
    }
});

/**
 * Flash
 */
transition.Flash = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var shortBeams = 35;
        var longBeams = 53;
        ctx.fillStyle = '#fff';
        var radius = Math.sqrt(dimX * dimX + dimY * dimY) * 2;
        this.drawFrame = function (p) {
            ctx.save();
            ctx.drawImage(this.image, 0, 0);
            var k2 = Math.pow(p, 5);
            var l = dimX * 2 * k2; // length, that wave traveled
            // arc
            ctx.translate(0, dimY);
            ctx.globalAlpha = 0.2;
            for (var i = 2; i < 12; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, radius * k2 * i / 12, -Math.PI / 2, 0, false);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
            }
            // beams
            ctx.strokeStyle = '#ffa';
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < shortBeams; i++) {
                ctx.lineTo(radius * k2 * 0.6, 0);
                ctx.rotate(-Math.PI / shortBeams / 4);
                ctx.lineTo(radius * k2 * 0.25, 0);
                ctx.rotate(-Math.PI / shortBeams / 4);
            }
            ctx.stroke();
            ctx.restore();
            // long beams
            ctx.strokeStyle = '#ff7';
            ctx.beginPath();
            ctx.moveTo(0, radius);
            for (var i = 0; i < longBeams; i++) {
                ctx.lineTo(radius * k2 * 1.3, 0);
                ctx.rotate(-Math.PI / longBeams / 4);
                ctx.lineTo(radius * k2 * 0.7, 0);
                ctx.rotate(-Math.PI / longBeams / 4);
            }
            ctx.stroke();
            ctx.restore();
        };
    }
});

/**
 * PageTear
 */
transition.Page_Tear = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(14);
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            var x = parseInt((Math.sin(p * Math.PI) / 2 - p) * dimX);
            var imageY = parseInt(p * dimY);
            if (this.animateFromTopTransparentBorder) {
                var y = imageY + this.animateFromTopTransparentBorder;
            } else {
                var y = imageY;
            }
            var oscilationX = dimX * (0.2 + 0.5 * p);
            var oscilationY = 3 + 60 * p;

            ctx.save();
            ctx.moveTo(x, y);
            ctx.beginPath();
            ctx.lineTo(x, y + oscilationY);
            for (var curX = x - dimX + oscilationX * p; curX < x + dimX * 2; curX += oscilationX) {
                var middleX = curX + oscilationX / 2;
                ctx.bezierCurveTo(curX, y + oscilationY / 3, curX + oscilationX / 4, y + oscilationY, middleX, y + oscilationY / 3);
                ctx.bezierCurveTo(middleX, y + oscilationY / 3, middleX + oscilationX / 4, y, curX + oscilationX, y + oscilationY / 3);
            }
            ctx.lineTo(x + dimX, y);
            ctx.lineTo(x + dimX, y + dimY);
            ctx.lineTo(x, y + dimY);
            ctx.lineTo(x, y);
            ctx.clip();
            ctx.clearRect(x, imageY, this.dimX, this.dimY);
            ctx.drawImage(this.image, x, imageY);
            ctx.restore();
        };
    }
});

/**
 * PushUp
 */
transition.Push = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(9);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, this.dimY * p);
            ctx.drawImage(this.image2, 0, this.dimY * (p - 1));
        };
        this.drawFastFrame = function (p) {
            var offsetY = this.dimY * (1 - p) >> 0;
            var height = this.dimY - offsetY;
            if (offsetY > 0)
                ctx.drawImage(this.image,
                    0, 0, this.dimX, offsetY,
                    0, height, this.dimX, offsetY);
            if (height > 0)
                ctx.drawImage(this.image2,
                    0, offsetY, this.dimX, height,
                    0, 0, this.dimX, height);
        };
    }
});


/**
 * PushLeft
 */
transition.PushLeft = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(9);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, this.dimX * (-p), 0);
            ctx.drawImage(this.image2, this.dimX * (1 - p), 0);
        };
        this.drawFastFrame = function (p) {
            var offsetX = this.dimX * (1 - p) >> 0;
            var width = this.dimX - offsetX;
            if (offsetX > 0)
                ctx.drawImage(this.image,
                    width, 0, offsetX, this.dimY,
                    0, 0, offsetX, this.dimY);
            if (width > 0)
                ctx.drawImage(this.image2,
                    0, 0, width, this.dimY,
                    offsetX, 0, width, this.dimY);
        };
    }
});

/**
 * PushRight
 */
transition.PushRight = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(9);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, this.dimX * (p), 0);
            ctx.drawImage(this.image2, this.dimX * (-1 + p), 0);
        };
        this.drawFastFrame = function (p) {
            var offsetX = this.dimX * (1 - p) >> 0;
            var width = this.dimX - offsetX;
            if (offsetX > 0)
                ctx.drawImage(this.image,
                    0, 0, offsetX, this.dimY,
                    width, 0, offsetX, this.dimY);
            if (width > 0)
                ctx.drawImage(this.image2,
                    offsetX, 0, width, this.dimY,
                    0, 0, width, this.dimY);
        };
    }
});

/**
 * PushDown
 */
transition.PushBottom = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(9);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, this.dimY * (-p));
            ctx.drawImage(this.image2, 0, this.dimY * (1 - p));
        };
        this.drawFastFrame = function (p) {
            var offsetY = this.dimY * (1 - p) >> 0;
            var height = this.dimY - offsetY;
            if (offsetY > 0)
                ctx.drawImage(this.image,
                    0, height, this.dimX, offsetY,
                    0, 0, this.dimX, offsetY);
            if (height > 0)
                ctx.drawImage(this.image2,
                    0, 0, this.dimX, height,
                    0, offsetY, this.dimX, height);
        };
    }
});

/**
 * SlideDown
 */
transition.Slide_Down = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(14);
        this.drawFrame = function (p) {
            var i = parseInt(this.dimY * p);
            ctx.drawImage(this.image, 0, 0);
            ctx.clearRect(0, 0, this.dimX, i);
            ctx.drawImage(this.image2, 0, -this.dimY + i);
        };
        this.drawFastFrame = function (p) {
            var i = parseInt(this.dimY * (1 - p));
            if (this.dimY - i > 0) {
                ctx.drawImage(this.image2,
                    0, i, this.dimX, this.dimY - i,
                    0, 0, this.dimX, this.dimY - i);
            }
        };
    }
});

/**
 * SlideUp
 */
transition.Slide_Up = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(14);
        this.drawFrame = function (p) {
            var i = parseInt(this.dimY * p);
            ctx.drawImage(this.image, 0, 0);
            ctx.clearRect(0, this.dimY - i, this.dimX, i);
            ctx.drawImage(this.image2, 0, this.dimY - i);
        };
        this.drawFastFrame = function (p) {
            var i = parseInt(this.dimY * p);
            if (i > 0) {
                ctx.drawImage(this.image2,
                    0, 0, this.dimX, i,
                    0, this.dimY - i, this.dimX, i);
            }
        };
    }
});

/**
 * SlideLeft
 */
transition.Slide_Left = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(14);
        this.drawFrame = function (p) {
            var i = parseInt(this.dimX * p);
            ctx.drawImage(this.image, 0, 0);
            ctx.clearRect(this.dimX - i, 0, i, this.dimY);
            ctx.drawImage(this.image2, this.dimX - i, 0);
        };
        this.drawFastFrame = function (p) {
            var i = parseInt(this.dimX * p);
            if (i > 0) {
                ctx.drawImage(this.image2,
                    0, 0, i, this.dimY,
                    this.dimX - i, 0, i, this.dimY);
            }
        };
    }
});

/**
 * SlideRight
 */
transition.Slide_Right = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(14);
        this.drawFrame = function (p) {
            var i = parseInt(this.dimX * p);
            ctx.drawImage(this.image, 0, 0);
            ctx.clearRect(0, 0, i, this.dimY);
            ctx.drawImage(this.image2, -this.dimX + i, 0);
        };
        this.drawFastFrame = function (p) {
            var i = parseInt(this.dimX * p);
            if (i > 0) {
                ctx.drawImage(this.image2,
                    this.dimX - i, 0, i, this.dimY,
                    0, 0, i, this.dimY);
            }
        };
    }
});


/**
 * SlideRemoveRight
 */
transition.Slide_Remove_Right = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(8);
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var i = parseInt(this.dimX * p);
            ctx.drawImage(this.image2, 0, 0);
            ctx.clearRect(i, 0, this.dimX - i, this.dimY);
            ctx.drawImage(this.image, i, 0);
        };
        var lastX = dimX;
        this.drawFastFrame = function (p) {
            var curX = parseInt(this.dimX * p);
            var curWidth = this.dimX - curX;
            if (curX - lastX > 0) {
                ctx.drawImage(this.image2,
                    lastX, 0, curX - lastX, this.dimY,
                    lastX, 0, curX - lastX, this.dimY);
            }
            if (curWidth > 0) {
                ctx.drawImage(this.image,
                    0, 0, curWidth, this.dimY,
                    curX, 0, curWidth, this.dimY);
            }
            lastX = curX;
            if (lastX > 0) lastX--; // ugly ipad safari zooming bring us to use overlapping
        };
    }
});


/**
 * SlideRemoveLeft
 */
transition.Slide_Remove_Left = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(8);
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var i = parseInt(this.dimX * p);
            ctx.drawImage(this.image2, 0, 0);
            ctx.clearRect(0, 0, this.dimX - i, this.dimY);
            ctx.drawImage(this.image, -i, 0);
        };
        var lastX = dimX;
        this.drawFastFrame = function (p) {
            var curX = parseInt(this.dimX * (1 - p));
            var curWidth = this.dimX - curX;
            if (curX > 0) {
                ctx.drawImage(this.image,
                    curWidth, 0, curX, dimY,
                    0, 0, curX, dimY);
            }
            if (lastX - curX > 0) {
                ctx.drawImage(this.image2,
                    curX, 0, lastX - curX, dimY,
                    curX, 0, lastX - curX, dimY);
            }
            lastX = curX;
            if (lastX < dimX) lastX++; // ugly ipad safari zooming bring us to use overlapping
        };
        /*this.drawFastFrame = function(p){
         var i = parseInt(this.dimX * p);
         ctx.drawImage(this.image2, 0, 0);
         ctx.drawImage(this.image, -i, 0);
         };*/
    }
});


/**
 * SlideRemoveUp
 */
transition.Slide_Remove_Up = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(6);
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var i = parseInt(this.dimY * p);
            ctx.drawImage(this.image2, 0, 0);
            ctx.clearRect(0, 0, this.dimX, this.dimY - i);
            ctx.drawImage(this.image, 0, -i);
        };
        var lastY = dimY;
        this.drawFastFrame = function (p) {
            var curY = parseInt(this.dimY * (1 - p));
            var curHeight = this.dimY - curY;
            if (curY > 0) {
                ctx.drawImage(this.image,
                    0, curHeight, dimX, curY,
                    0, 0, dimX, curY);
            }
            if (lastY - curY > 0) {
                ctx.drawImage(this.image2,
                    0, curY, dimX, lastY - curY,
                    0, curY, dimX, lastY - curY);
            }
            lastY = curY;
            if (lastY < dimY) lastY++; // ugly ipad safari zooming bring us to use overlapping
        };
    }
});

/**
 * SlideRemoveDown
 */
transition.Slide_Remove_Down = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(6);
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var i = parseInt(this.dimY * p);
            ctx.drawImage(this.image2, 0, 0);
            ctx.clearRect(0, i, this.dimX, this.dimY - i);
            ctx.drawImage(this.image, 0, i);
        };
        var lastY = 0;
        this.drawFastFrame = function (p) {
            var curY = parseInt(this.dimY * p);
            var curHeight = this.dimY - curY;
            if (curHeight > 0) {
                ctx.drawImage(this.image,
                    0, 0, dimX, curHeight,
                    0, curY, dimX, curHeight);
            }
            if (curY - lastY > 0) {
                ctx.drawImage(this.image2,
                    0, lastY, dimX, curY - lastY,
                    0, lastY, dimX, curY - lastY);
            }
            lastY = curY;
            if (lastY > 0) lastY--; // ugly ipad safari zooming bring us to use overlapping
        };
    }
});


/**
 * LawnMower
 */
transition.Lawnmower = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        //var lines = 10; //win style of LawnMower
        var lines = parseInt(this.dimY / 16);  // mac style of LawnMower
        var lineHeight = parseInt(this.dimY / lines);
        var lines = parseInt(this.dimY / lineHeight);
        this.drawFrame = function (p) {
            var fullLines = parseInt(lines * p);
            var curLine = lines * p - parseInt(lines * p);
            if (fullLines % 2) {
                var curLineFromX = this.dimX * (1 - curLine);
            } else {
                var curLineFromX = 0;
            }
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, this.dimX, lineHeight * fullLines);
            ctx.rect(curLineFromX, 0, this.dimX * curLine, lineHeight * Math.ceil(lines * p));
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            var fullLines = parseInt(lines * p);
            var curLine = lines * p - parseInt(lines * p);
            if (fullLines % 2) {
                var curLineFromX = this.dimX * (1 - curLine);
            } else {
                var curLineFromX = 0;
            }
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, this.dimX, lineHeight * fullLines);
            ctx.rect(curLineFromX, 0, this.dimX * curLine, lineHeight * Math.ceil(lines * p));
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
    }
});

/**
 * LiquidImage
 */
transition.LiquidImage = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(15);
        var imgSize = this.dimX * this.dimY * 4;
        var brightnessBorder = 765;  // used in pixel RGB comparsion. Allow to skip first and last frames. Max value 255*3 = 765

        // preload animateTo and animateFrom
        ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
        var dImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
        var sImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        var ctxData = ctx.getImageData(0, 0, this.dimX, this.dimY);
        var cData = ctxData.data;
        var sImgFirstPixel = sImg[0] + sImg[1] + sImg[2];
        var dImgFirstPixel = dImg[0] + dImg[1] + dImg[2];

        this.drawFrame = function (p) {
            var border = brightnessBorder * (1 - p);
            var border2 = -border;
            for (var i = 0; i < imgSize; i += 4) {
                // compare cur pixel with the top-left one
                var sPixel = sImgFirstPixel - (sImg[i] + sImg[i + 1] + sImg[i + 2]);
                var dPixel = dImgFirstPixel - (dImg[i] + dImg[i + 1] + dImg[i + 2]);
                if (sPixel > border2 && sPixel < border && dPixel > border2 && dPixel < border) {
                    cData[i] = sImg[i];
                    cData[i + 1] = sImg[i + 1];
                    cData[i + 2] = sImg[i + 2];
                    cData[i + 3] = sImg[i + 3];
                } else {
                    cData[i] = dImg[i];
                    cData[i + 1] = dImg[i + 1];
                    cData[i + 2] = dImg[i + 2];
                    cData[i + 3] = dImg[i + 3];
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
        /* fast version without preloading
         this.drawFastFrame = function(p){
         var border = brightnessBorder*(1-p);
         var border2 = -border;
         for (var i = 0; i<imgSize; i+=4){
         // compare cur pixel with the top-left one
         var sPixel = sImgFirstPixel-(sImg[i]+sImg[i+1]+sImg[i+2]);
         var dPixel = dImgFirstPixel-(dImg[i]+dImg[i+1]+dImg[i+2]);
         if (sPixel < border2 || dPixel < border2 || sPixel > border  || dPixel > border){
         cData[i]  = dImg[i];
         cData[i+1] = dImg[i+1];
         cData[i+2] = dImg[i+2];
         }
         }
         ctx.putImageData(ctxData, 0, 0);
         };*/
        var frames = 100;
        var framePixels = [];
        for (var i = 0; i <= frames; i++) {
            framePixels[i] = [];
        }
        for (var i = 0; i < imgSize; i += 4) {
            var sPixel = Math.abs(sImgFirstPixel - (sImg[i] + sImg[i + 1] + sImg[i + 2]));
            var dPixel = Math.abs(dImgFirstPixel - (dImg[i] + dImg[i + 1] + dImg[i + 2]));
            var border = Math.max(sPixel, dPixel);
            var frame = (border / brightnessBorder * frames) >> 0;
            framePixels[frame].push(i);
        }
        var lastK = 0;
        // good preloading make this function extreme fast!
        this.drawFastFrame = function (p) {
            var curK = Math.floor(frames * p);
            for (var k = lastK; k < curK; k++) {
                var pixels = framePixels[k];
                for (var j = 0; j < pixels.length; j++) {
                    var i = pixels[j];
                    cData[i] = dImg[i];
                    cData[i + 1] = dImg[i + 1];
                    cData[i + 2] = dImg[i + 2];
                }
            }
            ctx.putImageData(ctxData, 0, 0);
            lastK = curK;
        };
    }
});

/**
 * BarnDoor
 */
transition.Barn = Class.create(transition.main, {
    run:function () {
        var dimX = this.dimX;
        var dimY = this.dimY;
        var ctx = this.createCanvas();
        this.drawFrame = function (p) {
            ctx.save();
            ctx.drawImage(this.image, 0, 0);
            ctx.beginPath();
            ctx.rect(0, 0, dimX * p / 2, dimY);
            ctx.rect(dimX * (1 - p / 2), 0, dimX * p / 2, dimY);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
        var lastX = 0;
        this.drawFastFrame = function (p) {
            var curX = dimX * p / 2 >> 0;
            var curWidth = curX - lastX;
            ctx.save();
            ctx.beginPath();
            ctx.rect(lastX, 0, curWidth, dimY);
            ctx.rect(dimX - curX, 0, curWidth, dimY);
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
            lastX = curX;
        };
    }
});


/**
 * Barn
 */
transition.Barn_Door = Class.create(transition.main, {
    run:function () {
        var dimX = this.dimX;
        var dimY = this.dimY;
        var ctx = this.createCanvas();
        this.drawFrame = function (p) {
            ctx.save();
            ctx.drawImage(this.image, 0, 0);
            ctx.beginPath();
            ctx.rect(dimX * ((1 - p) / 2), 0, dimX * p, dimY);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
        var lastX = dimX / 2 >> 0;
        this.drawFastFrame = function (p) {
            var curX = dimX * (1 - p) / 2 >> 0;
            var curWidth = lastX - curX;
            ctx.save();
            ctx.beginPath();
            ctx.rect(curX, 0, curWidth, dimY);
            ctx.rect(dimX - lastX, 0, curWidth, dimY);
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
            lastX = curX;
        };
    }
});


/**
 * Pixel version of Cube. No preload, no inaccuracy. Currently have only quater fps, in comparsion with DrawImage version of Cube.
 */
transition.CubeMixer_pixel = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = Math.round(dimX / 2) - 5;
        var dimY2 = Math.round(dimY / 2);
        var imgSize = dimX * 4 * dimY;

        // preload animateTo and animateFrom
        ctx.drawImage(this.image2, 0, 0);
        var dImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        ctx.clearRect(0, 0, dimX, dimY); // usefull if this.image have transparency
        ctx.drawImage(this.image, 0, 0);
        var sImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        var ctxData, cData;

        // this provide some boost to safari
        this.animateFrom.hide();

        var seeDistance = dimX * 1; // some constant
        this.drawFrame = function (p) {
            ctxData = ctx.createImageData(this.dimX, this.dimY);
            cData = ctxData.data;
            var angle = 90 * p;
            processFrame(180 + angle, sImg);
            processFrame(90 + angle, dImg);
            ctx.putImageData(ctxData, 0, 0);
        }.bind(this);

        // /* a bit faster, but it's still not enough for smooth drawing */
        //drawScaledRect_new = function(img,x,y,w,h1,h2){
        //	var id,is,px,py,sx,sy,curHeight,dxw;
        //	var dimX4 = dimX << 2;
        //	for (var dx=0; dx<w; dx++){
        //		dxw = dx/w;
        //		curHeight = h1 + (h2-h1)*dxw;
        //		sx = dx+x;
        //		px4 = dxw*dimX << 2;
        //		sy = dimY2 - curHeight/2 >>0;
        //		id = sy*dimX + sx << 2;
        //		var ddy = dimY/curHeight;
        //		py = 0;
        //		for (var dy=0; dy<curHeight; dy++){
        //			py += ddy;
        //			is = (py>>0)*dimX4 + px4;
        //			cData[id]   = img[is];
        //			cData[id^1] = img[is^1];
        //			cData[id^2] = img[is^2];
        //			cData[id^3] = 255;
        //			sy++;
        //			id+=dimX4;
        //		}
        //	}
        //};

        drawScaledRect = function (img, x, y, w, h1, h2) {
            var id, is, px, py, sx, sy, curHeight, dxw;
            for (var dx = 0; dx < w; dx++) {
                dxw = dx / w;
                curHeight = h1 + (h2 - h1) * dxw;
                sx = dx + x;
                px = dxw * dimX >> 0;
                for (var dy = 0; dy < curHeight; dy++) {
                    sy = dy + dimY2 - curHeight / 2 >> 0;
                    py = dy / curHeight * dimY >> 0;
                    id = sy * dimX + sx << 2;
                    is = py * dimX + px << 2;
                    cData[id] = img[is];
                    cData[id + 1] = img[is + 1];
                    cData[id + 2] = img[is + 2];
                    cData[id + 3] = 255;
                }
            }
        };

        var processFrame = function (k, img) {
            var x, h, h2, h3, scale, scale2, height;
            var rotAngle = k / 180 * Math.PI;
            var rotAngle2 = (k % 90 - 45) / 180 * Math.PI;
            /* radial coordinates from center of cube*/
            var r = dimX2 * Math.SQRT2;
            var angle = Math.asin(dimX2 / r);
            /* dekart coordinates */
            x = dimX2 + r * Math.sin(rotAngle + angle);
            x2 = dimX2 + r * Math.sin(rotAngle - angle);
            h = dimX2 + r * Math.cos(rotAngle + angle);
            h2 = dimX2 + r * Math.cos(rotAngle - angle);
            h += dimX2 * Math.SQRT2 * Math.cos(rotAngle2) - dimX2;
            h2 += dimX2 * Math.SQRT2 * Math.cos(rotAngle2) - dimX2;
            /* scaling */
            scale = seeDistance / (seeDistance + h);
            scale2 = seeDistance / (seeDistance + h2);
            height = dimY * scale;
            var _x = dimX2 + (x - dimX2) * scale >> 0;
            var _x2 = dimX2 + (x2 - dimX2) * scale2 >> 0;
            var _y = dimY2 - height / 2 >> 0;
            h3 = Math.round(dimY * scale2);
            if (_x2 - _x > 0) {
                drawScaledRect(img, _x, _y, _x2 - _x, height, h3);
            }
        };

    }
});


/**
 * CSS3 verwion of Cube.
 */
transition.CubeMixer_WebKit = Class.create(transition.main, {
    run:function () {
        var dimX = this.dimX;
        var dimY = this.dimY;
        var ctx = this.createSmoothCanvas(10);
        delete this.ctx;
        this.canvas.hide();
        this.animateFrom.hide();
        this.image.setStyle(
            '-webkit-backface-visibility: hidden; '
                + '-webkit-transform: rotateY(0deg);'
                + '-webkit-transform-origin: 100% 50%;'
                + 'position:absolute;z-index:998;top:0px;left:0px;width:' + dimX + 'px;height:' + dimY + 'px;'
        );
        this.image2.setStyle(
            '-webkit-backface-visibility: hidden; '
                + '-webkit-transform: rotateY(90deg);'
                + '-webkit-transform-origin: 0% 50%;'
                + 'position:absolute;z-index:998;top:0px;left:0px;width:' + dimX + 'px;height:' + dimY + 'px;'
        );
        this.animateFrom.parentNode.insert(this.image);
        this.animateFrom.parentNode.insert(this.image2);
        this.animateFrom.parentNode.setStyle('-webkit-transform-style: preserve-3d;-webkit-perspective: ' + dimX + ';');
        var browser = new browserDetect();
        var isMacOSChrome = browser.browserName === 'Chrome' && /^Mac/.test(navigator.platform) && !isTouchDevice();
        this.drawFrame = function (p) {
            var angle = -90 * p;
            if(isMacOSChrome){
                this.image2.style.zIndex = angle < -45 ? 999 : 997;
            }
            this.image.setStyle(' -webkit-transform: rotateY(' + angle + 'deg);   left:-' + (dimX * p) + 'px;');
            this.image2.setStyle('-webkit-transform: rotateY(' + (90 + angle) + 'deg);left:' + (dimX * (1 - p)) + 'px;');
            if (p == 1) {
                this.animateTo.style.visibility = 'visible';
                this.image.remove();
                this.image2.remove();
                this.animateFrom.parentNode.setStyle('-webkit-transform-style: flat;');
            }
        };
        this.drawFastFrame = this.drawFrame;
    }
});

transition.Reverse_CubeMixer_WebKit = Class.create(transition.main, {
    run:function () {
        var dimX = this.dimX;
        var dimY = this.dimY;
        var ctx = this.createSmoothCanvas(10);
        delete this.ctx;
        this.canvas.hide();
        this.animateFrom.hide();
        this.image.setStyle(
            '-webkit-backface-visibility: hidden; '
                + '-webkit-transform: rotateY(0deg);'
                + '-webkit-transform-origin: 0% 50%;'
                + 'position:absolute;z-index:998;top:0px;left:0px;width:' + dimX + 'px;height:' + dimY + 'px;'
        );
        this.image2.setStyle(
            '-webkit-backface-visibility: hidden; '
                + '-webkit-transform: rotateY(90deg);'
                + '-webkit-transform-origin: 100% 50%;'
                + 'position:absolute;z-index:998;top:0px;left:0px;width:' + dimX + 'px;height:' + dimY + 'px;'
        );
        this.animateFrom.parentNode.insert(this.image);
        this.animateFrom.parentNode.insert(this.image2);
        this.animateFrom.parentNode.setStyle('-webkit-transform-style: preserve-3d;-webkit-perspective: ' + dimX + ';');
        var browser = new browserDetect();
        var isMacOSChrome = browser.browserName === 'Chrome' && /^Mac/.test(navigator.platform) && !isTouchDevice();
        this.drawFrame = function (p) {
            var angle = 90 * p;
            if(isMacOSChrome){
                this.image.style.zIndex = angle < 45 ? 999 : 997;
            }
            this.image.setStyle(' -webkit-transform: rotateY(' + angle + 'deg);   left:' + (dimX * p) + 'px;');
            this.image2.setStyle('-webkit-transform: rotateY(' + (-90 + angle) + 'deg);left:-' + (dimX * (1 - p)) + 'px;');
            if (p == 1) {
                this.animateTo.style.visibility = 'visible';
                this.image.remove();
                this.image2.remove();
                this.animateFrom.parentNode.setStyle('-webkit-transform-style: flat;');
            }
        };
        this.drawFastFrame = this.drawFrame;
    }
});

/* 
 * Simplier, but don't support quality customizing
 * */
transition.CubeMixer_webkit_slow = Class.create(transition.main, {
    run:function () {
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.animateFrom.setStyle(
            '-webkit-backface-visibility: hidden; '
                + '-webkit-transform: rotateY(0deg);'
                + '-webkit-transform-origin: 100% 50%;'
        );
        this.animateTo.setStyle(
            '-webkit-backface-visibility: hidden; '
                + '-webkit-transform: rotateY(90deg);'
                + '-webkit-transform-origin: 0% 50%;'
                + 'visibility: visible'
        );
        this.animateFrom.parentNode.setStyle('-webkit-transform-style: preserve-3d;-webkit-perspective: ' + dimX + ';');
        this.drawFrame = function (p) {
            var angle = -90 * p;
            this.animateFrom.setStyle('-webkit-transform: rotateY(' + angle + 'deg);   left:-' + (dimX * p) + 'px;');
            this.animateTo.setStyle('-webkit-transform: rotateY(' + (90 + angle) + 'deg);left:' + (dimX * (1 - p)) + 'px;');
        };
        this.drawFastFrame = this.drawFrame;
    }
});

/**
 * DrawImage verwion of Cube.
 */
transition.CubeMixer = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = Math.round(dimX / 2) - 5;
        var dimY2 = Math.round(dimY / 2);
        this.animateFrom.hide();  // this transition want to see stack background under transparent pixels

        /* We preload images with height scaled to 50%. It's look not much worse,
         * but increase perfomance of main bottleneck - image drawing (with height scaling).  
         */
        imageArray = {};
        image2Array = {};
        for (var i = 0; i <= dimX - 4; i += 4) {
            imageArray[i] = new Element("canvas", {width:4, height:dimY2});
            var imgctx = imageArray[i].getContext("2d");
            imgctx.drawImage(this.image2, i, 0, 4, dimY, 0, 0, 4, dimY2);
            image2Array[i] = new Element("canvas", {width:4, height:dimY2});
            var img2ctx = image2Array[i].getContext("2d");
            img2ctx.drawImage(this.image, i, 0, 4, dimY, 0, 0, 4, dimY2);
        }

        var seeDistance = dimX * 1; // some constant
        this.drawFrame = function (p) {
            var angle = 90 * p;
            if (angle < 45) {
                processFrame(angle - 90, imageArray);
                processFrame(angle, image2Array);
            } else {
                processFrame(angle, image2Array);
                processFrame(angle - 90, imageArray);
            }
            if (p == 1) { // last frame of animation
                delete imageArray;
                delete image2Array;
            }
        };
        var processFrame = function (k, images) {
            k += 180;
            var rotAngle = (k % 360) / 180 * Math.PI;
            var rotAngle2 = (k % 90) / 180 * Math.PI;
            var lastX = 0;
            for (var i = 0; i <= dimX - 4; i += 4) {
                /* radial coordinates from center of cube*/
                var r = Math.sqrt(dimX2 * dimX2 + (dimX2 - i) * (dimX2 - i));
                var angle = Math.asin((dimX2 - i) / r);
                /* dekart coordinates */
                var x = dimX2 + r * Math.sin(angle + rotAngle);
                var h = dimX2 + r * Math.cos(angle + rotAngle);
                /* additional distance from cube move back */
                h += dimX2 * Math.SQRT2 * Math.cos(rotAngle2 - Math.PI / 4) - dimX2;
                /* scaling */
                var scale = seeDistance / (seeDistance + h);
                var halfHeight = Math.round(dimY * scale / 2);
                var _x = dimX2 + Math.round((x - dimX2) * scale);
                var _y = dimY2 - halfHeight;
                /* sometimes math inaccuracy produce 5px distance between 4px's rows, so we need draw them twice */
                if (i != 0 && _x - lastX > 4) {
                    ctx.drawImage(images[i], lastX + 4, _y, 4, halfHeight * 2);
                }
                /* if we draw all our lines without overlaping - total width be 2*dimX. So we can skip
                 * up to 50% of rows (current realization draw nearly 54% of rows)
                 */
                if (_x - lastX >= 3) {
                    ctx.drawImage(images[i], _x, _y, 4, halfHeight * 2);
                    lastX = _x;
                }
            }
        };
    }
});


/**
 * Cube Reverse
 */
transition.Reverse_CubeMixer = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = Math.round(dimX / 2) - 5;
        var dimY2 = Math.round(dimY / 2);
        this.animateFrom.hide();  // this transition want to see stack background under transparent pixels

        /* We preload images with height scaled to 50%. It's look not much worse,
         * but increase perfomance of main bottleneck - image drawing (with height scaling).  
         */
        imageArray = {};
        image2Array = {};
        for (var i = 0; i <= dimX - 4; i += 4) {
            imageArray[i] = new Element("canvas", {width:4, height:dimY2});
            var imgctx = imageArray[i].getContext("2d");
            imgctx.drawImage(this.image, i, 0, 4, dimY, 0, 0, 4, dimY2);
            image2Array[i] = new Element("canvas", {width:4, height:dimY2});
            var img2ctx = image2Array[i].getContext("2d");
            img2ctx.drawImage(this.image2, i, 0, 4, dimY, 0, 0, 4, dimY2);
        }

        var seeDistance = dimX * 1; // some constant
        this.drawFrame = function (p) {
            var angle = 90 * (1 - p);
            if (angle < 45) {
                processFrame(angle - 90, imageArray);
                processFrame(angle, image2Array);
            } else {
                processFrame(angle, image2Array);
                processFrame(angle - 90, imageArray);
            }
            if (p == 1) { // last frame of animation
                delete imageArray;
                delete image2Array;
            }
        };

        var processFrame = function (k, images) {
            k += 180;
            var rotAngle = (k % 360) / 180 * Math.PI;
            var rotAngle2 = (k % 90) / 180 * Math.PI;
            var lastX = 0;
            for (var i = 0; i <= dimX - 4; i += 4) {
                /* radial coordinates from center of cube*/
                var r = Math.sqrt(dimX2 * dimX2 + (dimX2 - i) * (dimX2 - i));
                var angle = Math.asin((dimX2 - i) / r);
                /* dekart coordinates */
                var x = dimX2 + r * Math.sin(angle + rotAngle);
                var h = dimX2 + r * Math.cos(angle + rotAngle);
                /* additional distance from cube move back */
                h += dimX2 * Math.SQRT2 * Math.cos(rotAngle2 - Math.PI / 4) - dimX2;
                /* scaling */
                var scale = seeDistance / (seeDistance + h);
                var halfHeight = Math.round(dimY * scale / 2);
                var _x = dimX2 + Math.round((x - dimX2) * scale);
                var _y = dimY2 - halfHeight;
                /* sometimes math inaccuracy produce 5px distance between 4px's rows, so we need draw them twice */
                if (i != 0 && _x - lastX > 4) {
                    ctx.drawImage(images[i], lastX + 4, _y, 4, halfHeight * 2);
                }
                /* if we draw all our lines without overlaping - total width be 2*dimX. So we can skip
                 * up to 50% of rows (current realization draw nearly 54% of rows)
                 */
                if (_x - lastX >= 3) {
                    ctx.drawImage(images[i], _x, _y, 4, halfHeight * 2);
                    lastX = _x;
                }
            }
        };
    }
});

/**
 * Iris Heart
 */
transition.Iris_Heart = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var shiftX = parseInt(dimX / 2);
        var shiftY = parseInt(dimY / 2);
        var maxZoom = Math.max(dimX, dimY) / 320;
        this.heartPoints = [
            [0, -120],
            [57, -234],
            [133, -325],
            [208, -310],
            [552, -192],
            [13, 287],
            [0, 311]
        ];
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, dimX, dimY);
            var m = maxZoom * p;
            var points = this.heartPoints;
            ctx.save();
            ctx.translate(shiftX, shiftY);
            ctx.beginPath();
            ctx.moveTo(points[0][0] * m, points[0][1] * m);
            ctx.bezierCurveTo(points[1][0] * m, points[1][1] * m,
                points[2][0] * m, points[2][1] * m,
                points[3][0] * m, points[3][1] * m);
            ctx.bezierCurveTo(points[4][0] * m, points[4][1] * m,
                points[5][0] * m, points[5][1] * m,
                points[6][0] * m, points[6][1] * m);
            ctx.bezierCurveTo(-points[5][0] * m, points[5][1] * m,
                -points[4][0] * m, points[4][1] * m,
                -points[3][0] * m, points[3][1] * m);
            ctx.bezierCurveTo(-points[2][0] * m, points[2][1] * m,
                -points[1][0] * m, points[1][1] * m,
                -points[0][0] * m, points[0][1] * m);
            ctx.clip();
            ctx.clearRect(-shiftX, -shiftY, dimX, dimY);
            ctx.drawImage(this.image2, -shiftX, -shiftY, dimX, dimY);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            var m = maxZoom * p;
            var points = this.heartPoints;
            ctx.save();
            ctx.translate(shiftX, shiftY);
            ctx.beginPath();
            ctx.moveTo(points[0][0] * m, points[0][1] * m);
            ctx.bezierCurveTo(points[1][0] * m, points[1][1] * m,
                points[2][0] * m, points[2][1] * m,
                points[3][0] * m, points[3][1] * m);
            ctx.bezierCurveTo(points[4][0] * m, points[4][1] * m,
                points[5][0] * m, points[5][1] * m,
                points[6][0] * m, points[6][1] * m);
            ctx.bezierCurveTo(-points[5][0] * m, points[5][1] * m,
                -points[4][0] * m, points[4][1] * m,
                -points[3][0] * m, points[3][1] * m);
            ctx.bezierCurveTo(-points[2][0] * m, points[2][1] * m,
                -points[1][0] * m, points[1][1] * m,
                -points[0][0] * m, points[0][1] * m);
            ctx.clip();
            ctx.drawImage(this.image2, -shiftX, -shiftY, dimX, dimY);
            ctx.restore();
        };
    }
});

/**
 * Implode
 */
transition.Implode = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(8);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var maxHole = 1 / 20;
        this.drawFrame = function (p) {
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.save();
            ctx.beginPath();
            var scale2 = 1 - p;
            var x1 = (dimX - dimX * scale2) / 2;
            var x2 = x1 + dimX * scale2;
            var x3 = (x1 + x2) / 2;
            var y1 = (dimY - dimY * scale2) / 2;
            var y2 = y1 + dimY * scale2;
            var y3 = (y1 + y2) / 2;

            var holeX = Math.min(dimX * maxHole, dimX * scale2 / 2.1);
            var holeY = Math.min(dimY * maxHole, dimY * scale2 / 2.1);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x3, y1 + holeY);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2 - holeX, y3);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y2 - holeY);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x1 + holeX, y3);
            ctx.lineTo(x1, y1);

            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image, (dimX - dimX * scale2) / 2, (dimY - dimY * scale2) / 2, dimX * scale2, dimY * scale2);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.save();
            ctx.beginPath();
            var scale2 = 1 - p;
            var x1 = (dimX - dimX * scale2) / 2;
            var x2 = x1 + dimX * scale2;
            var x3 = (x1 + x2) / 2;
            var y1 = (dimY - dimY * scale2) / 2;
            var y2 = y1 + dimY * scale2;
            var y3 = (y1 + y2) / 2;

            var holeX = Math.min(dimX * maxHole, dimX * scale2 / 2.1);
            var holeY = Math.min(dimY * maxHole, dimY * scale2 / 2.1);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x3, y1 + holeY);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2 - holeX, y3);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y2 - holeY);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x1 + holeX, y3);
            ctx.lineTo(x1, y1);

            ctx.clip();
            ctx.drawImage(this.image, (dimX - dimX * scale2) / 2, (dimY - dimY * scale2) / 2, dimX * scale2, dimY * scale2);
            ctx.restore();
        };
    }
});

/**
 * ImplodeCircle
 */
transition.Implode_Circle = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(20);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = dimX / 2 << 0;
        var dimY2 = dimY / 2 << 0;
        var centerI = (dimX2 + dimY2 * dimX) * 4;
        var radius = Math.sqrt(dimX * dimX + dimY * dimY) / 2;

        // preload animateTo and animateFrom
        ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
        var dImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        ctx.clearRect(0, 0, this.dimX, this.dimY);
        ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
        var sImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        var ctxData = ctx.getImageData(0, 0, this.dimX, this.dimY);
        var cData = ctxData.data;

        var diagonal = [];
        for (var y = -dimY2; y <= dimY2; y++) {
            diagonal[y + dimY2] = [];
            for (var x = -dimX2; x <= dimX2; x++) {
                diagonal[y + dimY2][x + dimX2] = Math.sqrt(x * x + y * y);
            }
        }
        this.drawFrame = function (p) {
            var maxScale = 7;
            var scale = maxScale - (p) * (maxScale - 1);
            var r = radius * (1 - p);
            for (var dy = -dimY2; dy <= dimY2; dy++) {
                for (var dx = -dimX2; dx <= dimX2; dx++) {
                    var pCurR = diagonal[dy + dimY2][dx + dimX2];
                    if (pCurR > r) {
                        var t1 = 1 + (scale - 1) * (pCurR - radius) / (r - radius);
                        var i = centerI + ((dy * dimX + dx) << 2);
                        var j = centerI + ((dy / t1 >> 0) * dimX + (dx / t1 >> 0) << 2);
                        cData[i] = dImg[j];
                        cData[i + 1] = dImg[j + 1];
                        cData[i + 2] = dImg[j + 2];
                        cData[i + 3] = dImg[j + 3];
                    }
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
        this.drawFastFrame = function (p) {
            var maxScale = 7;
            var scale = maxScale - (p) * (maxScale - 1);
            var r = radius * (1 - p);
            for (var dy = -dimY2; dy <= dimY2; dy++) {
                for (var dx = -dimX2; dx <= dimX2; dx++) {
                    var pCurR = diagonal[dy + dimY2][dx + dimX2];
                    if (pCurR > r) {
                        var t1 = 1 + (scale - 1) * (pCurR - radius) / (r - radius);
                        var i = centerI + ((dy * dimX + dx) << 2);
                        var j = centerI + ((dy / t1 >> 0) * dimX + (dx / t1 >> 0) << 2);
                        cData[i] = dImg[j];
                        cData[i + 1] = dImg[j + 1];
                        cData[i + 2] = dImg[j + 2];
                    }
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
    }

});

/**
 * Iris Circle
 */
transition.Iris_Circle = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(9);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var startX = parseInt(dimX / 2);
        var startY = parseInt(dimY / 2);
        var radius = Math.sqrt(dimX * dimX + dimY * dimY) >> 1;
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, dimX, dimY);
            ctx.save();
            ctx.beginPath();
            ctx.arc(startX, startY, radius * p, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.restore();
        };
        var dimX2 = dimX >> 1;
        var dimY2 = dimY >> 1;
        this.drawFastFrame = function (p) {
            var r = radius * Effect.Transitions.sinoidal(p) >> 0;
            var x = Math.max(dimX2 - r, 0);
            var y = Math.max(dimY2 - r, 0);
            var width = Math.min(2 * r, dimX);
            var height = Math.min(2 * r, dimY);
            ctx.save();
            ctx.beginPath();
            ctx.arc(startX, startY, r, 0, Math.PI * 2, true);
            ctx.clip();
            if (r >= 1) {
                ctx.drawImage(this.image2,
                    x, y, width, height,
                    x, y, width, height);
            }
            ctx.restore();

        };
    }
});


/**
 * Iris Star
 */
transition.Iris_Star = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX2 = parseInt(this.dimX / 2);
        var dimY2 = parseInt(this.dimY / 2);
        var maxR1 = this.dimX / Math.sin(Math.PI * 1 / 5);
        var maxR2 = this.dimY / Math.cos(Math.PI * 2 / 5);
        var maxR = Math.max(maxR1, maxR2) / 2;
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            var r = maxR * p;
            ctx.save();
            ctx.save();
            ctx.translate(dimX2, dimY2);
            ctx.beginPath();
            ctx.rotate(-Math.PI / 2);
            ctx.moveTo(r, 0);
            for (var i = 0; i < 5; i++) {
                ctx.lineTo(r, 0);
                ctx.rotate(Math.PI / 5);
                ctx.lineTo(r / 2, 0);
                ctx.rotate(Math.PI / 5);
            }
            ctx.lineTo(r, 0);
            ctx.closePath();
            ctx.restore();
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            var r = maxR * p;
            ctx.save();
            ctx.save();
            ctx.translate(dimX2, dimY2);
            ctx.beginPath();
            ctx.rotate(-Math.PI / 2);
            ctx.moveTo(r, 0);
            for (var i = 0; i < 5; i++) {
                ctx.lineTo(r, 0);
                ctx.rotate(Math.PI / 5);
                ctx.lineTo(r / 2, 0);
                ctx.rotate(Math.PI / 5);
            }
            ctx.lineTo(r, 0);
            ctx.closePath();
            ctx.restore();
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
    }
});

/**
 * Gaussian Blur
 */
transition.GaussianBlur = Class.create(transition.main, {
    run:function () {
        this.animateFrom.hide();  // this transition want to see stack background under transparent pixels
        var ctx = this.createSmoothCanvas(9);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = parseInt(this.dimX / 2);
        var dimY2 = parseInt(this.dimY / 2);
        var radius = Math.sqrt(this.dimX * this.dimX + this.dimY + this.dimY);
        var maxBlurDistance = Math.max(radius / 40, 4);
        var circleImages = 9;  // 9*2 = 18 drawImage's per frame. Safari work slow with bigger values
        var circleImagesOpacity = 0.15;
        //var circleImages = 17;
        //var circleImagesOpacity = 0.05;
        var rotAngle = Math.PI * 2 / circleImages;

        var mergedImg = new Element('canvas', {
            width:dimX,
            height:dimY
        });
        var mImgCtx = mergedImg.getContext('2d');

        this.drawFrame = function (p) {
            var blur = ((1 - Math.abs(1 - p * 2)) * maxBlurDistance) >> 0;
            var zoom = 0.6 + 0.4 * Math.abs(1 - p * 2);
            var w = zoom * dimX >> 0;
            var h = zoom * dimY >> 0;

            // create merged image
            mImgCtx.clearRect(0, 0, dimX, dimY);
            mImgCtx.globalAlpha = circleImagesOpacity * (1 - p);
            mImgCtx.drawImage(this.image, 0, 0, w, h);
            mImgCtx.globalAlpha = circleImagesOpacity * p;
            mImgCtx.drawImage(this.image2, 0, 0, w, h);

            var startAngle = Math.PI * Math.random();
            var stopAngle = Math.PI * 2 + startAngle;
            for (var angle = startAngle; angle < stopAngle; angle += rotAngle) {
                var r = blur * (0.5 + 0.5 * Math.random());
                var x = (1 - zoom) * dimX2 + r * Math.cos(angle) >> 0;
                var y = (1 - zoom) * dimY2 + r * Math.sin(angle) >> 0;
                ctx.drawImage(mergedImg, x, y);
            }
        };
    }
});


/* 
 *  More accuracy realization, but have extreme slow preload. 75-750ms for every blur level!
 *  75ms in Firefox 10 (win)
 *  500ms in Explorer 9 (win)
 *  750ms in Safari 5.1 (win)
 *  
 *  >>0 do same as parseInt(), but work faster
 */
transition.GaussianBlur2 = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = parseInt(this.dimX / 2);
        var dimY2 = parseInt(this.dimY / 2);
        var dimXx4 = dimX * 4;
        var maxBlurDistance = 8;
        var imgSize = dimXx4 * dimY;
        var i = 0;

        // empty image array
        var zeroFilledArray = [];
        for (var i = 0; i < imgSize; i++) {
            zeroFilledArray[i] = 255;
        }


        // preload animateTo and animateFrom
        var dArray = [
            []
        ];
        var sArray = [
            []
        ];
        var dImg = dArray[0];
        var sImg = sArray[0];
        ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
        var ctxData2 = ctx.getImageData(0, 0, dimX, dimY);
        ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
        var ctxData = ctx.getImageData(0, 0, dimX, dimY);
        var cData = ctxData.data;
        var cData2 = ctxData2.data;
        for (var i = 0; i < imgSize; i++) {
            sImg[i] = cData[i];
            dImg[i] = cData2[i];
        }
        ;

        // preload blured animateFrom & animateTo
        for (var curBlur = 1; curBlur <= maxBlurDistance; curBlur++) {
            var curBlur4 = curBlur * 4;
            var fImg1 = sArray[curBlur - 1];
            var fImg2 = dArray[curBlur - 1];
            var tImg1 = zeroFilledArray.slice(0);
            var tImg2 = zeroFilledArray.slice(0);
            var maxY = (dimY - curBlur) * dimXx4;
            var stopX = dimXx4 - curBlur4;
            for (var y = curBlur * dimXx4; y < maxY; y += dimXx4) {
                for (var x = curBlur4; x < stopX; x += 4) {
                    i = y + x;
                    tImg1[i] = ((fImg1[i] + fImg1[i - 4] + fImg1[i + 4] + fImg1[i - dimXx4] + fImg1[i + dimXx4]) / 5) >> 0;
                    tImg1[i + 1] = ((fImg1[i + 1] + fImg1[i - 3] + fImg1[i + 5] + fImg1[i + 1 - dimXx4] + fImg1[i + 1 + dimXx4]) / 5) >> 0;
                    tImg1[i + 2] = ((fImg1[i + 2] + fImg1[i - 2] + fImg1[i + 6] + fImg1[i + 2 - dimXx4] + fImg1[i + 2 + dimXx4]) / 5) >> 0;
                    tImg2[i] = ((fImg2[i] + fImg2[i - 4] + fImg2[i + 4] + fImg2[i - dimXx4] + fImg2[i + dimXx4]) / 5) >> 0;
                    tImg2[i + 1] = ((fImg2[i + 1] + fImg2[i - 3] + fImg2[i + 5] + fImg2[i + 1 - dimXx4] + fImg2[i + 1 + dimXx4]) / 5) >> 0;
                    tImg2[i + 2] = ((fImg2[i + 2] + fImg2[i - 2] + fImg2[i + 6] + fImg2[i + 2 - dimXx4] + fImg2[i + 2 + dimXx4]) / 5) >> 0;
                }
            }
            sArray[curBlur] = tImg1;
            dArray[curBlur] = tImg2;
        }

        // second canvas
        var canvas2 = new Element('canvas', {
            width:this.dimX,
            height:this.dimY
        });
        var ctx2 = canvas2.getContext('2d');
        ctx2.mozImageSmoothingEnabled = false;
        ctx2.webkitImageSmoothingEnabled = false;
        var ctxData3 = ctx2.getImageData(0, 0, dimX, dimY);
        var cData3 = ctxData3.data;

        this.drawFrame = function (p) {
            var zoom = 0.6 + 0.4 * Math.abs(1 - p * 2);
            var opacity = p;
            var blur = 1 - Math.abs(0.5 - p);
            var blurIndex = ((1 - Math.abs(1 - p * 2)) * maxBlurDistance) >> 0;
            var sImg = sArray[blurIndex];
            var dImg = dArray[blurIndex];
            for (var i = 0; i < imgSize; i += 8) {
                cData[i] = (dImg[i] * opacity + sImg[i] * (1 - opacity)) >> 0;
                cData[i + 1] = (dImg[i + 1] * opacity + sImg[i + 1] * (1 - opacity)) >> 0;
                cData[i + 2] = (dImg[i + 2] * opacity + sImg[i + 2] * (1 - opacity)) >> 0;
                cData[i + 4] = (dImg[i + 4] * opacity + sImg[i + 4] * (1 - opacity)) >> 0;
                cData[i + 5] = (dImg[i + 5] * opacity + sImg[i + 5] * (1 - opacity)) >> 0;
                cData[i + 6] = (dImg[i + 6] * opacity + sImg[i + 6] * (1 - opacity)) >> 0;
            }
            ctx2.putImageData(ctxData, 0, 0);
            ctx.drawImage(canvas2, (1 - zoom) * dimX2, (1 - zoom) * dimY2, zoom * dimX, zoom * dimY);
        };
    }
});

/**
 * IrisRectangle
 */
transition.Iris_Rectangle = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            var width = parseInt(this.dimX * p);
            var height = parseInt(this.dimY * p);
            if (width == 0 || height == 0) return; //safari cant get 0px subimage
            var x = parseInt((this.dimX - width) / 2);
            var y = parseInt((this.dimY - height) / 2);
            ctx.clearRect(x, y, width, height);
            ctx.drawImage(this.image2, x, y, width, height, x, y, width, height);
        };
        this.drawFastFrame = function (p) {
            var width = parseInt(this.dimX * p);
            var height = parseInt(this.dimY * p);
            var x = parseInt((this.dimX - width) / 2);
            var y = parseInt((this.dimY - height) / 2);
            if (width > 0 && height > 0) {
                ctx.drawImage(this.image2, x, y, width, height, x, y, width, height);
            }
        };
    }
});

/**
 * Spiral
 */
transition.Spiral = Class.create(transition.main, {
    run:function () {
        var dimX = this.dimX;
        var dimY = this.dimY;
        var lineWidth = 20;
        var fullLength = this.calcSpiralLenth(lineWidth);
        var ctx = this.createCanvas();
        var spiral = {
            direction:0, // 0.right, 1.down, 2.left, 3.up
            offsetX:0,
            offsetY:0,
            x:dimX,
            y:dimY,
            getBorderLength:function () {
                switch (this.direction) {
                    case 0:
                    case 2:
                        return this.x;
                    case 1:
                    case 3:
                        return this.y;
                }
            },
            cutBorder:function () {
                switch (this.direction) {
                    case 0:
                        this.y -= lineWidth;
                        this.offsetY += lineWidth;
                        break;
                    case 1:
                        this.x -= lineWidth;
                        break;
                    case 2:
                        this.y -= lineWidth;
                        break;
                    case 3:
                        this.x -= lineWidth;
                        this.offsetX += lineWidth;
                        break;
                }
                ;
                this.changeDirection();
            },
            changeDirection:function () {
                this.direction = (++this.direction) % 4;
            }
        };
        this.drawFrame = function (p) {
            ctx.drawImage(this.image2, 0, 0);
            spiral.x = this.dimX;
            spiral.y = this.dimY;
            spiral.offsetX = 0;
            spiral.offsetY = 0;
            spiral.direction = 0;
            var curLength = fullLength * p;
            while (curLength > spiral.getBorderLength() && spiral.getBorderLength() > 10) {
                curLength -= spiral.getBorderLength();
                spiral.cutBorder();
            }
            ;
            ctx.clearRect(spiral.offsetX, spiral.offsetY, spiral.x, spiral.y);
            ctx.drawImage(this.image,
                spiral.offsetX, spiral.offsetY, spiral.x, spiral.y,
                spiral.offsetX, spiral.offsetY, spiral.x, spiral.y);
            ctx.save();
            ctx.beginPath();
            switch (spiral.direction) {
                case 0:
                    ctx.rect(spiral.offsetX, spiral.offsetY, curLength, lineWidth);
                    break;
                case 1:
                    ctx.rect(spiral.offsetX + spiral.x - lineWidth, spiral.offsetY, lineWidth, curLength);
                    break;
                case 2:
                    ctx.rect(spiral.offsetX + spiral.x - curLength, spiral.offsetY + spiral.y - lineWidth, curLength, lineWidth);
                    break;
                case 3:
                    ctx.rect(spiral.offsetX, spiral.offsetY + spiral.y - curLength, lineWidth, curLength);
                    break;
            }
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            ctx.drawImage(this.image2, 0, 0);
            spiral.x = this.dimX;
            spiral.y = this.dimY;
            spiral.offsetX = 0;
            spiral.offsetY = 0;
            spiral.direction = 0;
            var curLength = fullLength * p;
            while (curLength > spiral.getBorderLength() && spiral.getBorderLength() > 10) {
                curLength -= spiral.getBorderLength();
                spiral.cutBorder();
            }
            ;
            ctx.drawImage(this.image,
                spiral.offsetX, spiral.offsetY, spiral.x, spiral.y,
                spiral.offsetX, spiral.offsetY, spiral.x, spiral.y);
            ctx.save();
            ctx.beginPath();
            switch (spiral.direction) {
                case 0:
                    ctx.rect(spiral.offsetX, spiral.offsetY, curLength, lineWidth);
                    break;
                case 1:
                    ctx.rect(spiral.offsetX + spiral.x - lineWidth, spiral.offsetY, lineWidth, curLength);
                    break;
                case 2:
                    ctx.rect(spiral.offsetX + spiral.x - curLength, spiral.offsetY + spiral.y - lineWidth, curLength, lineWidth);
                    break;
                case 3:
                    ctx.rect(spiral.offsetX, spiral.offsetY + spiral.y - curLength, lineWidth, curLength);
                    break;
            }
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
    },
    calcSpiralLenth:function (lineWidth) {
        var longer = Math.max(this.dimX, this.dimY);
        var shorter = Math.min(this.dimX, this.dimY);
        var nonFullLineLength = longer - Math.floor(shorter / lineWidth) * lineWidth;
        var nonFullLineHeight = (shorter - Math.floor(shorter / lineWidth) * lineWidth);
        var nonFullLineSquare = nonFullLineLength * (lineWidth - nonFullLineHeight);
        var fullLength = (longer * shorter + nonFullLineSquare) / lineWidth >> 0;
        return fullLength;
    }
});

/**
 * Spotlight
 */
transition.Spotlight = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = parseInt(dimX / 2);
        var radius = Math.sqrt(dimX * dimX / 4 + dimY * dimY);
        var critAngle1 = Math.atan(dimX / 2 / dimY);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(dimX2, 0);
            ctx.arc(dimX2, 0, radius, Math.PI * (1 - p) / 2, Math.PI * (1 + p) / 2);
            ctx.lineTo(dimX2, 0);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.restore();
        };
        var lastTopY = dimY;
        this.drawFastFrame = function (p) {
            var angle = Math.PI * p / 2;
            if (angle <= critAngle1) {
                var width = dimY * Math.tan(angle);
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(dimX2, 0);
                ctx.lineTo(dimX2 - width, dimY);
                ctx.lineTo(dimX2 + width, dimY);
                ctx.lineTo(dimX2, 0);
                ctx.clip();
                if (width >= 0.5) {
                    ctx.drawImage(this.image2,
                        dimX2 - width, 0, width * 2, dimY,
                        dimX2 - width, 0, width * 2, dimY);
                }
                ctx.restore();
            } else {
                var height = dimX2 / Math.tan(angle);
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(dimX2, 0);
                ctx.lineTo(0, height);
                ctx.lineTo(0, lastTopY);
                ctx.lineTo(dimX, lastTopY);
                ctx.lineTo(dimX, height);
                ctx.lineTo(dimX2, 0);
                ctx.clip();
                ctx.drawImage(this.image2,
                    0, 0, dimX, lastTopY,
                    0, 0, dimX, lastTopY);
                ctx.restore();
                lastTopY = height;
            }

        };
    }
});

/**
 * Jaws
 */
transition.Jaws = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var jawCount = 10;
        var jawY = parseInt(dimY / jawCount / 2);
        var lineToJawPoint = function (jawNum, dy) {
            var x = dimX / jawCount * jawNum;
            var y = dimY / 2 + dy;
            y += (jawNum % 2) ? -jawY : jawY;
            ctx.lineTo(x, y);
        };
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0);
            ctx.save();
            ctx.beginPath();
            var dy = (dimY / 2 + jawY) * p >> 0;
            for (var i = 0; i <= jawCount; i++) {
                lineToJawPoint(i, -dy);
            } // top
            for (var i = jawCount; i >= 0; i--) {
                lineToJawPoint(i, dy);
            }  // bottom
            ctx.closePath();
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            ctx.save();
            ctx.beginPath();
            var dy = (dimY / 2 + jawY) * p >> 0;
            for (var i = 0; i <= jawCount; i++) {
                lineToJawPoint(i, -dy);
            } // top
            for (var i = jawCount; i >= 0; i--) {
                lineToJawPoint(i, dy);
            }  // bottom
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
    }
});


/**
 * Clock Face
 */
transition.Clock_Face = Class.create(transition.main, {
    run:function () {
        var dimX2 = this.dimX / 2;
        var dimY2 = this.dimY / 2;
        var ctx = this.createCanvas();
        var radius = Math.sqrt(dimX2 * dimX2 + dimY2 * dimY2);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(dimX2, dimY2);
            ctx.arc(dimX2, dimY2, radius, Math.PI * (-0.5), Math.PI * (-0.5 + 2 * p));
            ctx.lineTo(dimX2, dimY2);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
        var lastP = 0;
        this.drawFastFrame = function (p) {
            var startAngle = Math.PI * (-0.5 + Math.floor(lastP * 4) / 2);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(dimX2, dimY2);
            ctx.arc(dimX2, dimY2, radius, startAngle, Math.PI * (-0.5 + 2 * p));
            ctx.lineTo(dimX2, dimY2);
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
            lastP = p;
        };
    }
});

/**
 * Windmill
 */
transition.Windmill = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(8);
        var dimX2 = parseInt(this.dimX / 2);
        var dimY2 = parseInt(this.dimY / 2);
        var radius = Math.sqrt(dimX2 * dimX2 + dimY2 * dimY2);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.save();
            ctx.beginPath();
            for (var j = 0; j < 4; j++) {
                ctx.moveTo(dimX2, dimY2);
                ctx.arc(dimX2, dimY2, radius, j * Math.PI / 2, (j + p) * Math.PI / 2);
                ctx.lineTo(dimX2, dimY2);
            }
            ctx.closePath();
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            ctx.save();
            ctx.beginPath();
            for (var j = 0; j < 4; j++) {
                ctx.moveTo(dimX2, dimY2);
                ctx.arc(dimX2, dimY2, radius, j * Math.PI / 2, (j + p) * Math.PI / 2);
                ctx.lineTo(dimX2, dimY2);
            }
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
    }
});


/**
 * Waterfall
 */
transition.Waterfall = Class.create(transition.main, {
    run:function () {
        var gridX = 75;
        var gridY = 24;
        var gridTotal = gridX + gridY - 1;
        var stepX = Math.ceil(this.dimX / gridX);
        var stepY = Math.ceil(this.dimY / gridY);
        var ctx = this.createCanvas();
        this.drawFrame = function (p) {
            k = parseInt(p * gridTotal);
            ctx.drawImage(this.image, 0, 0);
            ctx.save();
            ctx.beginPath();
            for (var i = k; (i >= 0 && k - i < gridY); i--) {
                ctx.rect(0, stepY * (k - i), stepX * (i + 1), stepY);
            }
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            k = parseInt(p * gridTotal);
            ctx.save();
            ctx.beginPath();
            for (var i = k; (i >= 0 && k - i < gridY); i--) {
                ctx.rect(0, stepY * (k - i), stepX * (i + 1), stepY);
            }
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
    }
});

// pixel based ripple
transition.Ripple = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(20);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = parseInt(this.dimX / 2);
        var dimY2 = parseInt(this.dimY / 2);
        var centerI = (dimX2 + dimY2 * dimX) * 4;

        //var waveWidth = 40;
        var waveWidth = Math.max(dimX, dimY) / 20;
        var waveHeight = 15;
        var maxR = Math.sqrt(dimX * dimX + dimY * dimY) / 2 + waveWidth;

        // preload animateTo and animateFrom
        ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
        var dImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        ctx.clearRect(0, 0, this.dimX, this.dimY);
        ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
        var sImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        var ctxData = ctx.getImageData(0, 0, this.dimX, this.dimY);
        var cData = ctxData.data;
        this.animateFrom.hide();  // this transition want to see stack background under transparent pixels
        this.drawFrame = function (p) {
            var frontR = maxR * p;
            for (var dy = -dimY2; dy < dimY2; ++dy) {
                for (var dx = -dimX2; dx < dimX2; ++dx) {
                    // distance from center to cur pixel (dx,dy)
                    var pCurR = diagonal[dy + dimY2][dx + dimX2];
                    var dCurR = (pCurR - frontR) / waveWidth;
                    if (dCurR > 3) {
                        // draw nothing
                    } else if (dCurR > -1) {
                        var i = centerI + ((dy * dimX + dx) << 2);
                        if (dCurR < 0) {
                            t1 = pCurR / (pCurR + ((1 + dCurR / 2) * waveHeight));
                        } else if (dCurR < 1) {
                            t1 = pCurR / (pCurR + ((1 - dCurR / 2) * waveHeight));
                        } else if (dCurR < 2) {
                            t1 = pCurR / (pCurR - (dCurR * waveHeight / 8));
                        } else {
                            t1 = pCurR / (pCurR - ((4 - dCurR) * (waveHeight / 8)));
                        }
                        // distance from center may be multiplied by t1
                        var y = dy / t1 >> 0;
                        var x = dx / t1 >> 0;
                        if (x > -dimX2 && x < dimX2 && y > -dimY2 && y < dimY2) {
                            var j = centerI + (x + y * dimX) * 4;
                            cData[i] = sImg[j];
                            cData[++i] = sImg[++j];
                            cData[++i] = sImg[++j];
                            cData[++i] = sImg[++j];
                        } else {
                            cData[i + 3] = 0;
                        }
                    } else if (dCurR > -2) {
                        var i = centerI + ((dy * dimX + dx) << 2);
                        var opacity2 = (dCurR + 2);
                        var opacity = 1 - opacity2;
                        cData[i] = (dImg[i] * opacity + sImg[i] * opacity2) >> 0;
                        cData[++i] = (dImg[i] * opacity + sImg[i] * opacity2) >> 0;
                        cData[++i] = (dImg[i] * opacity + sImg[i] * opacity2) >> 0;
                        cData[++i] = (dImg[i] * opacity + sImg[i] * opacity2) >> 0;
                    } else {
                        var i = centerI + ((dy * dimX + dx) << 2);
                        cData[i] = dImg[i];
                        cData[++i] = dImg[i];
                        cData[++i] = dImg[i];
                        cData[++i] = dImg[i];
                    }
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
        var diagonal = [];
        for (var y = -dimY2; y < dimY2; y++) {
            diagonal[y + dimY2] = [];
            for (var x = -dimX2; x < dimX2; x++) {
                diagonal[y + dimY2][x + dimX2] = Math.sqrt(x * x + y * y);
            }
        }
        this.drawFastFrame = function (p) {
            var frontR = maxR * p;
            for (var dy = -dimY2; dy < dimY2; dy++) {
                for (var dx = -dimX2; dx < dimX2; dx++) {
                    // distance from center to cur pixel (dx,dy)
                    var pCurR = diagonal[dy + dimY2][dx + dimX2];
                    var dCurR = (pCurR - frontR) / waveWidth;
                    if (dCurR > 3) {
                        // draw nothing
                    } else if (dCurR > -1) {
                        var i = centerI + ((dy * dimX + dx) << 2);
                        if (dCurR < 0) {
                            t1 = pCurR / (pCurR + ((1 + dCurR / 2) * waveHeight));
                        } else if (dCurR < 1) {
                            t1 = pCurR / (pCurR + ((1 - dCurR / 2) * waveHeight));
                        } else if (dCurR < 2) {
                            t1 = pCurR / (pCurR - (dCurR * waveHeight / 8));
                        } else {
                            t1 = pCurR / (pCurR - ((4 - dCurR) * (waveHeight / 8)));
                        }
                        // distance from center may be multiplied by t1
                        var y = dy / t1 >> 0;
                        var x = dx / t1 >> 0;
                        if (x > -dimX2 && x < dimX2 && y > -dimY2 && y < dimY2) {
                            var j = centerI + (x + y * dimX) * 4;
                            cData[i] = sImg[j];
                            cData[i + 1] = sImg[j + 1];
                            cData[i + 2] = sImg[j + 2];
                            cData[i + 3] = 255;
                        } else {
                            cData[i + 3] = 0;
                        }
                    } else if (dCurR > -2) {
                        var i = centerI + ((dy * dimX + dx) << 2);
                        var opacity = 1 - (dCurR + 2);
                        cData[i] = (dImg[i] * opacity + sImg[i] * (1 - opacity)) >> 0;
                        cData[i + 1] = (dImg[i + 1] * opacity + sImg[i + 1] * (1 - opacity)) >> 0;
                        cData[i + 2] = (dImg[i + 2] * opacity + sImg[i + 2] * (1 - opacity)) >> 0;
                        cData[i + 3] = 255;
                    } else {
                        var i = centerI + ((dy * dimX + dx) << 2);
                        cData[i] = dImg[i];
                        cData[i + 1] = dImg[i + 1];
                        cData[i + 2] = dImg[i + 2];
                        cData[i + 3] = 255;
                    }
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
    }
});

/**
 * SkyClouds
 */
transition.SkyClouds = Class.create(transition.main, {
    run:function () {
        var gridSize = 12;     // on big cards we probably grow this
        var interference = 10; // look like this constant have no dependencies
        var ctx = this.createSmoothCanvas(13);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var clouds = [];
        var cloudData = [
            {x:[-57, -20, -30, 17, 40, 18, 8, -19, -27], y:[-1, -15, -11, -10, -1, 16, 10, 11, 6]},
            {x:[-54, -37, -22, -1, 42, 66, 78, 26, -14, -40], y:[-17, -31, -31, -36, -20, 1, 20, 35, 36, 23]}
            // add here your best clouds :)
        ];
        for (var x = 0; x <= gridSize; x++) {
            for (var y = 0; y <= gridSize; y++) {
                var n = Math.floor(cloudData.length * Math.random());
                clouds.push({
                    x:dimX * x / gridSize,
                    y:dimY * y / gridSize,
                    startSize:-parseInt(interference * Math.random()),
                    dots:cloudData[n]
                });
            }
        }
        var drawCloud = function (ctx, cloud) {
            ctx.moveTo(
                cloud.x + cloud.size * cloud.dots.x[0],
                cloud.y + cloud.size * cloud.dots.y[0]);
            for (var i = 0; i < cloud.dots.x.length; i++) {
                ctx.lineTo(
                    cloud.x + cloud.size * cloud.dots.x[i],
                    cloud.y + cloud.size * cloud.dots.y[i]);
            }
            ctx.lineTo(
                cloud.x + cloud.size * cloud.dots.x[0],
                cloud.y + cloud.size * cloud.dots.y[0]);
        }.bind(this);
        var maxR = Math.sqrt(dimX * dimX + dimY * dimY);
        var additionalSize = maxR / gridSize / 10;
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.save();
            ctx.beginPath();
            clouds.each(function (cloud) {
                if (cloud.size > 0) {
                    drawCloud(ctx, cloud);
                }
                ;
                cloud.size = cloud.startSize + additionalSize * p;
            });
            ctx.closePath();
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.restore();
        };
    }
});

/**
 * Kaleidoscope
 */
transition.Kaleidoscope = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(8);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var maxSquare = Math.sqrt(dimX * dimX + dimY * dimY) / 3;
        this.drawFrame = function (p) {
            var sq = maxSquare * p;
            ctx.clearRect(0, 0, dimX, dimY);
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.save();
            ctx.beginPath();
            for (var x = 1; x <= 5; x += 2) {   //  give us 1, 3 and 5
                for (var y = 1; y <= 5; y += 2) {
                    var dx = x * dimX / 6;
                    var dy = y * dimY / 6;
                    ctx.moveTo(dx - sq, dy);
                    ctx.lineTo(dx, dy - sq);
                    ctx.lineTo(dx + sq, dy);
                    ctx.lineTo(dx, dy + sq);
                    ctx.lineTo(dx - sq, dy);
                }
            }
            ctx.clip();
            ctx.clearRect(0, 0, dimX, dimY);
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            var sq = maxSquare * p;
            ctx.save();
            ctx.beginPath();
            for (var x = 1; x <= 5; x += 2) {   //  give us 1, 3 and 5
                for (var y = 1; y <= 5; y += 2) {
                    var dx = x * dimX / 6;
                    var dy = y * dimY / 6;
                    ctx.moveTo(dx - sq, dy);
                    ctx.lineTo(dx, dy - sq);
                    ctx.lineTo(dx + sq, dy);
                    ctx.lineTo(dx, dy + sq);
                    ctx.lineTo(dx - sq, dy);
                }
            }
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0);
            ctx.restore();
        };
    }
});


/**
 * Open Sesame
 */
transition.Open_Sesame = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(10);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = Math.round(dimX / 2);
        var dimY2 = Math.round(dimY / 2);

        var walkSesamePoints = function (p) {
            var shiftX = Math.round(dimX2 * p);
            var shiftY = Math.round(dimY2 * p);
            ctx.moveTo(0, 0);
            // top line
            ctx.lineTo(shiftX, 0);
            ctx.lineTo(dimX2, dimY2 - shiftY);
            ctx.lineTo(dimX - shiftX, 0);
            ctx.lineTo(dimX, 0);
            // right line
            ctx.lineTo(dimX, shiftY);
            ctx.lineTo(dimX2 + shiftX, dimY2);
            ctx.lineTo(dimX, dimY - shiftY);
            ctx.lineTo(dimX, dimY);
            // bottom line
            ctx.lineTo(dimX - shiftX, dimY);
            ctx.lineTo(dimX2, dimY2 + shiftY);
            ctx.lineTo(shiftX, dimY);
            ctx.lineTo(0, dimY);
            // left line
            ctx.lineTo(0, dimY - shiftY);
            ctx.lineTo(dimX2 - shiftX, dimY2);
            ctx.lineTo(0, shiftY);
            ctx.lineTo(0, 0);
        };

        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.save();
            ctx.beginPath();
            walkSesamePoints(p);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            ctx.save();
            ctx.beginPath();
            walkSesamePoints(p);
            ctx.clip();
            ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
            ctx.restore();
        };
    }
});


/**
 * WipeDown
 */
transition.Wipe_Down = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var curY = parseInt(dimY * p);
            ctx.drawImage(this.image, 0, 0);
            if (curY == 0) return;
            ctx.clearRect(0, 0, dimX, curY);
            ctx.drawImage(this.image2,
                0, 0, dimX, curY,
                0, 0, dimX, curY);
        };
        var lastY = 0;
        this.drawFastFrame = function (p) {
            var curY = parseInt(dimY * p);
            var curHeight = curY - lastY;
            if (curHeight == 0) return;
            ctx.drawImage(this.image2,
                0, lastY, dimX, curHeight,
                0, lastY, dimX, curHeight);
            lastY = curY;
            if (lastY > 0) lastY--; // ugly ipad safari zooming bring us to use overlapping
        };
    }
});

/**
 * Wipe_Up
 */
transition.Wipe_Up = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var curY = parseInt(dimY * (1 - p));
            ctx.drawImage(this.image, 0, 0);
            if (dimY - curY == 0) return;
            ctx.clearRect(0, curY, dimX, dimY - curY);
            ctx.drawImage(this.image2,
                0, curY, dimX, dimY - curY,
                0, curY, dimX, dimY - curY);
        };
        var lastY = dimY;
        this.drawFastFrame = function (p) {
            var curY = parseInt(dimY * (1 - p));
            var curHeight = lastY - curY;
            if (curHeight == 0) return;
            ctx.drawImage(this.image2,
                0, curY, dimX, curHeight,
                0, curY, dimX, curHeight);
            lastY = curY;
            if (lastY < dimY) lastY++; // ugly ipad safari zooming bring us to use overlapping
        };
        /*this.drawFastFrame = function(p){
         ctx.drawImage(this.image2,
         0,dimY*(1-p),dimX,dimY*p,
         0,dimY*(1-p),dimX,dimY*p);
         };*/
    }
});


/**
 * Wipe_Right <- wipe right in win HS
 */
transition.Wipe_Right = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var curX = parseInt(dimX * p);
            ctx.drawImage(this.image, 0, 0);
            if (curX == 0) return;
            ctx.clearRect(0, 0, curX, dimY);
            ctx.drawImage(this.image2,
                0, 0, curX, dimY,
                0, 0, curX, dimY);
        };
        var lastX = 0;
        this.drawFastFrame = function (p) {
            var curX = parseInt(dimX * p);
            var curWidth = curX - lastX;
            if (curWidth == 0) return;
            ctx.drawImage(this.image2,
                lastX, 0, curWidth, dimY,
                lastX, 0, curWidth, dimY);
            lastX = curX;
            if (lastX > 0) lastX--; // ugly ipad safari zooming bring us to use overlapping
        };
        /*this.drawFastFrame = function(p){
         ctx.drawImage(this.image2,
         0,0,dimX*p,dimY,
         0,0,dimX*p,dimY);
         };*/
    }
});


/**
 * Wipe_Left
 */
transition.Wipe_Left = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            var curX = parseInt(dimX * (1 - p));
            ctx.drawImage(this.image, 0, 0);
            if (dimX - curX == 0) return;
            ctx.clearRect(curX, 0, dimX - curX, dimY);
            ctx.drawImage(this.image2,
                curX, 0, dimX - curX, dimY,
                curX, 0, dimX - curX, dimY);
        };
        var lastX = dimX;
        this.drawFastFrame = function (p) {
            var curX = parseInt(dimX * (1 - p));
            var curWidth = lastX - curX;
            if (curWidth == 0) return;
            ctx.drawImage(this.image2,
                curX, 0, curWidth, dimY,
                curX, 0, curWidth, dimY);
            lastX = curX;
            if (lastX < dimX) lastX++; // ugly ipad safari zooming bring us to use overlapping
        };
        /*this.drawFastFrame = function(p){
         ctx.drawImage(this.image2,
         dimX*(1-p),0,dimX*p,dimY,
         dimX*(1-p),0,dimX*p,dimY);
         };*/
    }
});


/**
 * Wiper
 */
transition.Wiper = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(8);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = parseInt(dimX / 2);
        var dimY2 = parseInt(dimY / 2);
        var radius = Math.sqrt(dimX * dimX / 4 + dimY * dimY);
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, dimX, dimY);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(dimX2, dimY);
            ctx.lineTo(dimX2 - radius, dimY);
            ctx.arc(dimX2, dimY, radius, -Math.PI, -Math.PI * (1 - p), false);
            ctx.lineTo(dimX2, dimY);
            ctx.clip();
            ctx.clearRect(0, 0, this.dimX, this.dimY);
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.restore();
        };
        var lastP = 0;
        this.drawFastFrame = function (p) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(dimX2, dimY);
            ctx.lineTo(dimX2 - radius, dimY);
            ctx.arc(dimX2, dimY, radius, -Math.PI, -Math.PI * (1 - p), false);
            ctx.lineTo(dimX2, dimY);
            ctx.clip();
            if (lastP < 0.5 && p < 0.5) {
                // left part of image
                ctx.drawImage(this.image2,
                    0, 0, dimX2, dimY,
                    0, 0, dimX2, dimY);
            } else if (lastP > 0.5 && p > 0.5) {
                // right part of image
                ctx.drawImage(this.image2,
                    dimX2, 0, dimX2, dimY,
                    dimX2, 0, dimX2, dimY);
            } else {
                ctx.drawImage(this.image2, 0, 0);
            }
            ctx.restore();
            lastP = p;
        };
    }
});


/**
 * Wipe Diagonal
 */
transition.Wipe_Diagonal = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(14);
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, dimX, dimY);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(dimX * p * 2, 0);
            ctx.lineTo(0, dimY * p * 2);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.clip();
            ctx.clearRect(0, 0, dimX, dimY);
            ctx.drawImage(this.image2, 0, 0, dimX, dimY);
            ctx.restore();
        };
        var lastP = 0;
        this.drawFastFrame = function (p) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(dimX * p * 2, 0);
            ctx.lineTo(0, dimY * p * 2);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.clip();
            // simple variant
            //ctx.drawImage(this.image2,0,0);
            // hard variant
            if (p < 0.5) {
                var width = dimX * p * 2 >> 0;
                var height = dimY * p * 2 >> 0;
                if (width > 0 && height > 0) {
                    ctx.drawImage(this.image2,
                        0, 0, width, height,
                        0, 0, width, height);
                }
            } else {
                if (lastP < 0.5) lastP = 0.5;
                var p2 = 2 - lastP * 2; // 1<->0
                var width = dimX * p2 >> 0;
                var height = dimY * p2 >> 0;
                if (width > 0 && height > 0) {
                    ctx.drawImage(this.image2,
                        dimX - width, dimY - height, width, height,
                        dimX - width, dimY - height, width, height);
                }
            }
            ctx.restore();
            lastP = p;
        };
    }
});


/**
 * Zoom
 */
transition.Zoom = Class.create(transition.main, {
    run:function () {
        var animateFrom = this.animateFrom;
        var animateTo = this.animateTo;
        animateTo.style.visibility = 'visible';
        animateFrom.childElements().each(function (el) {
            Try.these(
                function () {
                    el.style.zIndex = '0';
                }
            );
        });
        animateTo.hide();
        var dimX = animateFrom.firstDescendant().getWidth();
        var dimY = animateFrom.firstDescendant().getHeight();
        var canvas = new Element("img", {src:animateTo.firstDescendant().src, style:"position:absolute;width:0px;height:0px;z-index:999;"});
        animateFrom.parentNode.insert(canvas);
        var i = 1;
        var j = 1;
        var k = 0;
        var sumX = parseInt(dimX / 40);
        var sumY = parseInt(dimY / 40);
        var image = animateTo.firstDescendant();
        canvas.observe('load', function () {
            var animInterval = setInterval(function () {
                try {
                    canvas.setStyle("left:" + parseInt((dimX - i) / 2) + "px;top:" + parseInt((dimY - j) / 2) + "px;width:" + i + "px;height:" + j + "px;");
                }
                catch (err) {
                    console.log(err);
                }
                i += sumX;
                j += sumY;
                k++;
                if (k >= 43) {
                    clearInterval(animInterval);
                    animateTo.show();
                    animateTo.relativize();
                    animateFrom.parentNode.removeChild(canvas);
                    animateFrom.parentNode.removeChild(animateFrom);
                    document.fire(animateTo.id + ':loaded');
                }
            }, 33);
        });
    }
});

/**
 * Zoom
 */
transition.Zoom_canva_version = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        var dimX = this.dimX;
        var dimY = this.dimY;
        this.drawFrame = function (p) {
            ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
            ctx.clearRect(dimX / 2 * (1 - p), dimY / 2 * (1 - p), dimX * p, dimY * p);
            ctx.drawImage(this.image2, dimX / 2 * (1 - p), dimY / 2 * (1 - p), dimX * p, dimY * p);
        };
        this.drawFastFrame = function (p) {
            var width = dimX * p >> 0;
            var height = dimY * p >> 0;
            var offsetX = dimX / 2 * (1 - p) >> 0;
            var offsetY = dimY / 2 * (1 - p) >> 0;
            ctx.drawImage(this.image2, offsetX, offsetY, width, height);
        };
    }
});


/**
 * Copy Machine
 */
transition.CopyMachine = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(12);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var lineWidth = 186; // width of white copymachine line
        // generate whitelines
        var whiteLineL = this.generateWhiteLine(lineWidth, 'left');
        var whiteLineR = this.generateWhiteLine(lineWidth, 'right');
        this.drawFrame = function (p) {
            // need to be rewrited - drawFastFrame use other alghorythm
            var i = parseInt(-lineWidth + (dimX + lineWidth) * (1 - Math.abs((p * 2) - 1))); // left border of line
            var width = lineWidth;   // on current frame, line may be thinly
            if (i < 0) {
                width += i;
                i = 0;
                if (width == 0) return;
            }
            if (p < 0.5) {
                var x1 = parseInt(i + lineWidth / 2);  // center of line
                x1 = Math.max(x1, 0);
                x1 = Math.min(x1, dimX);
                ctx.drawImage(this.image2, 0, 0, x1, dimY, 0, 0, x1, dimY);
                if (x1 < dimX) {
                    ctx.drawImage(this.image, x1, 0, dimX - x1, dimY, x1, 0, dimX - x1, dimY);
                }
                var whiteLine = whiteLineL;
            } else {
                ctx.drawImage(this.image2, 0, 0);
                var whiteLine = whiteLineR;
            }
            ;
            if (i >= dimX - lineWidth / 2) {
                ctx.drawImage(whiteLine, 0, 0, width, dimY, i, 0, width, dimY);
            } else if (i == 0) {
                ctx.drawImage(whiteLine, lineWidth - width, 0, width, dimY, 0, 0, width, dimY);
            } else {
                ctx.drawImage(whiteLine, i, 0, width, dimY);
            }
        };
        var background;
        var lastX = 0;
        var whiteLineX, whiteLineWidth, whiteLineOffset;
        var isRightBorderDrawed = false;
        this.drawFastFrame = function (p) {
            var i = parseInt(-lineWidth + (dimX + lineWidth) * (1 - Math.abs((p * 2) - 1))); // left border of line
            if (i == -lineWidth) return;
            // erase white line from last frame
            if (whiteLineWidth) {
                ctx.putImageData(background, whiteLineX, 0);
            }
            if (i < 0) {
                // left border touching
                whiteLineX = 0;
                whiteLineWidth = lineWidth + i;
                whiteLineOffset = -i;
            } else {
                whiteLineX = i;
                whiteLineWidth = Math.min(lineWidth, dimX - i);
                whiteLineOffset = 0;
            }
            // draw animateTo image
            if (p < 0.5 && whiteLineX > lastX) {
                ctx.drawImage(this.image2,
                    lastX, 0, whiteLineX - lastX, dimY,
                    lastX, 0, whiteLineX - lastX, dimY);
                lastX = whiteLineX;
            } else if (p >= 0.5 && !isRightBorderDrawed) {
                // sometimes slow PC skip all frames, where white line touch right border
                if (lastX != dimX) {
                    ctx.drawImage(this.image2,
                        lastX, 0, dimX - lastX, dimY,
                        lastX, 0, dimX - lastX, dimY);
                }
                isRightBorderDrawed = true;
            }
            // save background and draw whiteline over saved place
            background = ctx.getImageData(whiteLineX, 0, whiteLineWidth, dimY);
            if (p < 0.5) {
                // draw sub opacity part of destination image under white line
                var p1 = lineWidth * 0.1 << 0; // 18px of 10% opacity
                var p2 = lineWidth * 0.15 << 0; // 27px of 15% opacity
                var p3 = lineWidth * 0.25 << 0; // 45px of 25% opacity
                if (whiteLineWidth < p1) {
                    p1 = whiteLineWidth;
                    p2 = 0;
                    p3 = 0;
                } else if (whiteLineWidth < p1 + p2) {
                    p2 = whiteLineWidth - p1;
                    p3 = 0;
                } else if (whiteLineWidth < p1 + p2 + p3) {
                    p3 = whiteLineWidth - p1 - p2;
                }
                if (p1) {
                    ctx.globalAlpha = 0.9;
                    ctx.drawImage(this.image2,
                        whiteLineX, 0, p1, dimY,
                        whiteLineX, 0, p1, dimY);
                }
                if (p2) {
                    ctx.globalAlpha = 0.75;
                    ctx.drawImage(this.image2,
                        whiteLineX + p1, 0, p2, dimY,
                        whiteLineX + p1, 0, p2, dimY);
                }
                if (p3) {
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(this.image2,
                        whiteLineX + p1 + p2, 0, p3, dimY,
                        whiteLineX + p1 + p2, 0, p3, dimY);
                }
            }
            // draw white line
            ctx.globalAlpha = 1;
            ctx.drawImage((p < 0.5 ? whiteLineL : whiteLineR),
                whiteLineOffset, 0, whiteLineWidth, dimY,
                whiteLineX, 0, whiteLineWidth, dimY);
        };

    },
    generateWhiteLine:function (lineWidth, direction) {
        var ans = new Element('canvas', {width:lineWidth, height:this.dimY});
        var maskCtxL = ans.getContext('2d');
        var lingradL = maskCtxL.createLinearGradient(0, 0, lineWidth, 0);
        var stopPoints = (direction == 'left') ? [0.5, 0.6, 0.92, 0.94] : [0.06, 0.08, 0.4, 0.5];
        lingradL.addColorStop(0, 'rgba(255,255,255,0)');
        lingradL.addColorStop(stopPoints[0], 'rgba(227,255,239,195)');
        lingradL.addColorStop(stopPoints[1], 'rgba(255,255,255,255)');
        lingradL.addColorStop(stopPoints[2], 'rgba(255,255,255,255)');
        lingradL.addColorStop(stopPoints[3], 'rgba(227,255,239,195)');
        lingradL.addColorStop(1, 'rgba(255,255,255,0)');
        maskCtxL.fillStyle = lingradL;
        maskCtxL.fillRect(0, 0, lineWidth, this.dimY);
        return ans;
    }
});

/**
 * Swipe. DrawImage version. FF: 93fps, Safari: 57fps
 */
transition.Swipe = Class.create(transition.main, {
    run:function () {
        try {
            var dimX = this.dimX;
            var dimY = this.dimY;
            var ctx = this.createCanvas();
            var opacityWidth = 1.5 * this.dimX;
            var fillImage = function (img, fromX, width) {
                if (fromX + width > dimX) {
                    width = dimX - fromX;
                }
                ctx.drawImage(img, fromX, 0, width, dimY, fromX, 0, width, dimY);
            };
            this.drawFrame = function (p) {
                var stepX = Math.max(parseInt(dimX / 100), 3);
                var opacityLineX = (dimX + opacityWidth) * p - opacityWidth >> 0;
                for (var x = 0; x < dimX; x += stepX) {
                    var lineOpacity = this.calcOpacity(x, opacityLineX);
                    ctx.globalAlpha = 1 - lineOpacity;
                    fillImage(this.image, x, stepX);
                    ctx.globalAlpha = lineOpacity;
                    fillImage(this.image2, x, stepX);
                }
            };
            var lastOpacityLineX = -opacityWidth;
            this.drawFastFrame = function (p) {
                var stepX = Math.max(parseInt(dimX / 100), 3);
                var opacityLineX = (dimX + opacityWidth) * p - opacityWidth >> 0;
                for (var x = 0; x < dimX; x += stepX) {
                    var neededOpacity = this.calcOpacity(x, opacityLineX);
                    var curOpacity = this.calcOpacity(x, lastOpacityLineX);
                    var lineOpacity = (neededOpacity - curOpacity) / (1 - curOpacity);
                    if (curOpacity != 1) {
                        ctx.globalAlpha = lineOpacity;
                        fillImage(this.image2, x, stepX);
                    }
                }
                lastOpacityLineX = opacityLineX;
            };
            this.calcOpacity = function (x, opacityLineX) {
                var opacityWidth = 1.5 * this.dimX;
                var lineOpacity = 1 - (x - opacityLineX) / opacityWidth;
                lineOpacity = Math.max(lineOpacity, 0);
                lineOpacity = Math.min(lineOpacity, 1);
                return lineOpacity;
            };
        }
        catch (err) {
            console.log(err);
        }
    }
});

/**
 * Swipe. Pixel version. FF: 40fps, Safari: 10fps
 */
transition.Swipe2 = Class.create(transition.main, {
    run:function () {
        var ctx = this.createCanvas();
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX4 = dimX * 4;
        var imgSize = dimX * dimY * 4;
        var opacityWidth = 1.5 * dimX;

        // preload animateTo and animateFrom
        ctx.drawImage(this.image2, 0, 0, this.dimX, this.dimY);
        var dImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        ctx.drawImage(this.image, 0, 0, this.dimX, this.dimY);
        var sImg = ctx.getImageData(0, 0, this.dimX, this.dimY).data;
        var ctxData = ctx.getImageData(0, 0, this.dimX, this.dimY);
        var cData = ctxData.data;

        this.drawFrame = function (p) {
            var opacityLineX = (dimX + opacityWidth) * p - opacityWidth >> 0;
            var lineOpacity, backLineOpacity;
            for (var x = 0; x < dimX; x++) {
                lineOpacity = (x - opacityLineX) / opacityWidth;
                if (lineOpacity < 0) {
                    for (var i = x * 4; i < imgSize; i += dimX4) {
                        cData[i] = dImg[i];
                        cData[i + 1] = dImg[i + 1];
                        cData[i + 2] = dImg[i + 2];
                        cData[i + 3] = dImg[i + 3];
                    }
                } else if (lineOpacity > 1) {
                    for (var i = x * 4; i < imgSize; i += dimX4) {
                        cData[i] = sImg[i];
                        cData[i + 1] = sImg[i + 1];
                        cData[i + 2] = sImg[i + 2];
                        cData[i + 3] = sImg[i + 3];
                    }
                } else {
                    backLineOpacity = 1 - lineOpacity;
                    for (var i = x * 4; i < imgSize; i += dimX4) {
                        cData[i] = sImg[i] * lineOpacity + dImg[i] * backLineOpacity >> 0;
                        cData[i + 1] = sImg[i + 1] * lineOpacity + dImg[i + 1] * backLineOpacity >> 0;
                        cData[i + 2] = sImg[i + 2] * lineOpacity + dImg[i + 2] * backLineOpacity >> 0;
                        cData[i + 3] = sImg[i + 3] * lineOpacity + dImg[i + 3] * backLineOpacity >> 0;
                    }
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
    }
});

/**
 * Twirl. DrawImage version
 */
transition.Twirl_drawImage = Class.create(transition.main, {
    run:function () {
        var dimX = this.dimX;
        var dimY = this.dimY;
        var ctx = this.createCanvas();
        this.animateFrom.hide();  // this transition want to see stack background under transparent pixels
        var radius = Math.sqrt(dimX * dimX + dimY * dimY) / 2;
        var w = Math.ceil(radius / 100);
        w = Math.min(w, 10);
        w = Math.max(w, 2);
        drawCircle = function (r, scale, w, o) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, r + w + 1, 0, Math.PI * 2);
            ctx.arc(0, 0, r, Math.PI * 2, 0, true);
            ctx.clip();
            ctx.globalAlpha = o;
            ctx.drawImage(this.image2, parseInt((-dimX * scale) / 2), parseInt((-dimY * scale) / 2), parseInt(dimX * scale), parseInt(dimY * scale));
            ctx.globalAlpha = 1 - o;
            ctx.drawImage(this.image, parseInt((-dimX * scale) / 2), parseInt((-dimY * scale) / 2), parseInt(dimX * scale), parseInt(dimY * scale));
            ctx.restore();
        }.bind(this);
        this.drawFrame = function (p) {
            ctx.save();
            ctx.translate(dimX / 2, dimY / 2);
            for (var i = 0; i < radius; i += w) {
                var angle2 = (radius - i) / radius * 3 * (1 - Math.abs(1 - 2 * p));
                var scale = 1 - 0.3 * Math.sin(p * Math.PI);
                ctx.save();
                ctx.rotate(-angle2);
                drawCircle(i, scale, w + 4, p);
                ctx.restore();
            }
            ctx.restore();
        };
        this.drawFastFrame = function (p) {
            ctx.clearRect(0, 0, dimX, dimY);
            for (var i = 0; i < radius; i += w) {
                var angle2 = (radius - i) / radius * 3 * (1 - Math.abs(1 - 2 * p));
                var scale = 1 - 0.3 * Math.sin(p * Math.PI);
                ctx.save();
                ctx.translate(dimX / 2, dimY / 2);
                ctx.rotate(-angle2);
                drawCircle(i, scale, w + 4, p);
                ctx.restore();
            }
        };
    }
});

/**
 * Twirl. Pixel version
 */
transition.Twirl = Class.create(transition.main, {
    run:function () {
        var ctx = this.createSmoothCanvas(20);
        var dimX = this.dimX;
        var dimY = this.dimY;
        var dimX2 = parseInt(this.dimX / 2);
        var dimY2 = parseInt(this.dimY / 2);
        var dimXLimRight = dimX << 1;
        var dimXLimLeft = -dimXLimRight;
        var dimYLimUp = dimY * dimX << 1;
        var dimYLimDown = -dimYLimUp;
        var centerI = (dimX2 + dimY2 * dimX) << 2;
        this.animateFrom.hide();  // this transition want to see stack background under transparent pixels
        var radius = Math.sqrt(dimX * dimX + dimY * dimY) / 2;
        var ctxData = ctx.getImageData(0, 0, this.dimX, this.dimY);
        var cData = ctxData.data;

        var mergedImg = new Element('canvas', {
            width:dimX,
            height:dimY
        });
        var mImgCtx = mergedImg.getContext('2d');
        var mImg;

        this.drawFrame = function (p) {
            ctxData = ctx.createImageData(dimX, dimY);
            cData = ctxData.data;
            // create merged image
            mImgCtx.clearRect(0, 0, dimX, dimY);
            mImgCtx.globalAlpha = (1 - p);
            mImgCtx.drawImage(this.image, 0, 0);
            mImgCtx.globalAlpha = p;
            mImgCtx.drawImage(this.image2, 0, 0);
            var mImg = mImgCtx.getImageData(0, 0, dimX, dimY).data;
            var scale = 1 / (1 - 0.3 * Math.sin(p * Math.PI));
            var preR = 3 * (1 - Math.abs(1 - 2 * p)) / radius;
            var dy = dimY2;
            while (dy--) {
                var iy = dy * dimX << 2;
                var dx = dimX2;
                while (dx--) {
                    var ix = dx << 2;
                    var r = Math.sqrt(dx * dx + dy * dy);
                    var angle = (radius - r) * preR;
                    var cos = Math.cos(angle) * scale;
                    var sin = Math.sin(angle) * scale;  //var sin = Math.sqrt(scale*scale - cos*cos);  // no boosting :(
                    var dxc = dx * cos << 2;
                    var dxs = dx * sin << 2;
                    var dyc = dy * cos << 2;
                    var dys = dy * sin << 2;
                    var x = dxc - dys;
                    var y = (dyc + dxs) * dimX >> 0;
                    var x1 = dxc + dys;
                    var y1 = (dyc - dxs) * dimX >> 0;
                    if (y > dimYLimDown && y < dimYLimUp && x > dimXLimLeft && x < dimXLimRight) {
                        cData[centerI + ix + iy] = mImg[centerI + x + y];
                        cData[centerI + ix + iy + 1] = mImg[centerI + x + y + 1];
                        cData[centerI + ix + iy + 2] = mImg[centerI + x + y + 2];
                        cData[centerI + ix + iy + 3] = mImg[centerI + x + y + 3];
                        cData[centerI - ix - iy] = mImg[centerI - x - y];
                        cData[centerI - ix - iy + 1] = mImg[centerI - x - y + 1];
                        cData[centerI - ix - iy + 2] = mImg[centerI - x - y + 2];
                        cData[centerI - ix - iy + 3] = mImg[centerI - x - y + 3];
                    }
                    if (y1 > dimYLimDown && y1 < dimYLimUp && x1 > dimXLimLeft && x1 < dimXLimRight) {
                        cData[centerI - ix + iy] = mImg[centerI - x1 + y1];
                        cData[centerI - ix + iy + 1] = mImg[centerI - x1 + y1 + 1];
                        cData[centerI - ix + iy + 2] = mImg[centerI - x1 + y1 + 2];
                        cData[centerI - ix + iy + 3] = mImg[centerI - x1 + y1 + 3];
                        cData[centerI + ix - iy] = mImg[centerI + x1 - y1];
                        cData[centerI + ix - iy + 1] = mImg[centerI + x1 - y1 + 1];
                        cData[centerI + ix - iy + 2] = mImg[centerI + x1 - y1 + 2];
                        cData[centerI + ix - iy + 3] = mImg[centerI + x1 - y1 + 3];
                    }
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
        this.drawFastFrame = function (p) {
            ctxData = ctx.createImageData(dimX, dimY);
            cData = ctxData.data;
            // create merged image
            mImgCtx.clearRect(0, 0, dimX, dimY);
            mImgCtx.globalAlpha = (1 - p);
            mImgCtx.drawImage(this.image, 0, 0);
            mImgCtx.globalAlpha = p;
            mImgCtx.drawImage(this.image2, 0, 0);
            var mImg = mImgCtx.getImageData(0, 0, dimX, dimY).data;
            var scale = 1 / (1 - 0.3 * Math.sin(p * Math.PI));
            var preR = 3 * (1 - Math.abs(1 - 2 * p)) / radius;
            var dy = dimY2;
            while (dy--) {
                var iy = dy * dimX << 2;
                var dx = dimX2;
                while (dx--) {
                    var ix = dx << 2;
                    var r = Math.sqrt(dx * dx + dy * dy);
                    var angle = (radius - r) * preR;
                    var cos = Math.cos(angle) * scale;
                    var sin = Math.sin(angle) * scale;  //var sin = Math.sqrt(scale*scale - cos*cos);  // no boosting :(
                    var dxc = dx * cos << 2;
                    var dxs = dx * sin << 2;
                    var dyc = dy * cos << 2;
                    var dys = dy * sin << 2;
                    var x = dxc - dys;
                    var y = (dyc + dxs) * dimX >> 0;
                    var x1 = dxc + dys;
                    var y1 = (dyc - dxs) * dimX >> 0;
                    if (y > dimYLimDown && y < dimYLimUp && x > dimXLimLeft && x < dimXLimRight) {
                        cData[centerI + ix + iy] = mImg[centerI + x + y];
                        cData[centerI + ix + iy + 1] = mImg[centerI + x + y + 1];
                        cData[centerI + ix + iy + 2] = mImg[centerI + x + y + 2];
                        cData[centerI + ix + iy + 3] = 255;
                        cData[centerI - ix - iy] = mImg[centerI - x - y];
                        cData[centerI - ix - iy + 1] = mImg[centerI - x - y + 1];
                        cData[centerI - ix - iy + 2] = mImg[centerI - x - y + 2];
                        cData[centerI - ix - iy + 3] = 255;
                    }
                    if (y1 > dimYLimDown && y1 < dimYLimUp && x1 > dimXLimLeft && x1 < dimXLimRight) {
                        cData[centerI - ix + iy] = mImg[centerI - x1 + y1];
                        cData[centerI - ix + iy + 1] = mImg[centerI - x1 + y1 + 1];
                        cData[centerI - ix + iy + 2] = mImg[centerI - x1 + y1 + 2];
                        cData[centerI - ix + iy + 3] = 255;
                        cData[centerI + ix - iy] = mImg[centerI + x1 - y1];
                        cData[centerI + ix - iy + 1] = mImg[centerI + x1 - y1 + 1];
                        cData[centerI + ix - iy + 2] = mImg[centerI + x1 - y1 + 2];
                        cData[centerI + ix - iy + 3] = 255;
                    }
                }
            }
            ctx.putImageData(ctxData, 0, 0);
        };
    }
});

