// Copyright (c) 2014 The Software MacKiev Company. All rights reserved.
// For details, see us at www.hyperstudio.com

var speedTest = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                imgUrl:"./data/engine/templates/img/icon.png",
                size:18481,
                pageSize:10000,
                onFinish:function (size, speed) {
                }
            };
            Object.extend(this.options, options || { });
            this.runSpeedTest();
        }
        catch (err) {
            alert('speedTest: initialize error:' + console.log(err));
        }
    },

    runSpeedTest:function () {
        try {
            //var imgSrc = this.options.imgUrl + "?r=" + Math.random();
            var imgSrc = this.options.imgUrl;
            this.startTime = (new Date()).getTime();
            var image = new Image();
            image.observe("load", function (e) {

                this.endTime = (new Date()).getTime();
                this.runTime = this.endTime - this.startTime;
                return this.result();
            }.bind(this));

            image.src = imgSrc;
        }
        catch (err) {
            alert('speedTest: runSpeedTest error:' + console.log(err));
        }
    },

    result:function () {
        if (!this.runTime)
            var res = null;

        var res = {    runTime:this.runTime,
            Kbps:( this.options.size * 8 / 1024 / ( this.runTime / 1000 ) ),
            KBps:( this.options.size / 1024 / ( this.runTime / 1000 ) )
        };
        this.options.onFinish(res, this.options.pageSize);
        return res;
    }
    /*
     256 kbps            31.3 KBps
     384 kbps            46.9 KBps
     512 kbps            62.5 KBps
     768 kbps            93.8 KBps
     1 mbps ~ 1000kbps   122.1 KBps
     */
});

var timeToLoad = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                size:1000000,
                onFinish:function () {
                }
            };
            Object.extend(this.options, options || { });
            return this.calcTime();
        }
        catch (err) {
            alert('timeToLoad: initialize error:' + console.log(err));
        }
    },

    calcTime:function () {
        var speed = new speedTest({pageSize:this.options.size, onFinish:function (obj, size) {
            var time = (size / obj.Kbps);
            //new showProgress({elementToUpdate:'loadStatus',interval:50,duration:time});
            var blowTime = 0.7;
            //console.log();
            var eff = (typeof(Effect) != 'undefined');
            if (eff)Effect.Pulsate('loadNotice', { pulses:Math.round(Math.round(time / 1000)), duration:Math.round(time / 1000) });

            setTimeout(function () {
                if (eff) $('logo').puff({duration:blowTime});
                $('loadStatus').hide();
                this.options.onFinish();
            }.bind(this), +time);
        }.bind(this)});


    }
});

/**
 *
 */
var showProgress = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                elementToUpdate:'',
                interval:5000,
                duration:10000
            };
            Object.extend(this.options, options || { });

            this.showProgress();
        }
        catch (err) {
            alert('speedtracker.showProgress: initialize error:' + console.log(err));
        }
    },

    timePassed:false,

    showProgress:function () {
        this.interval = setInterval(function () {
            if (!this.timePassed)this.timePassed = 0;
            var percents = Math.round(this.timePassed / (this.options.duration / 100));
            if (Object.isElement($(this.options.elementToUpdate)))$(this.options.elementToUpdate).update(percents + "%");
            else clearInterval(this.interval);
            this.timePassed += this.options.interval;
            if (this.timePassed >= this.options.duration) clearInterval(this.interval);
        }.bind(this), this.options.interval);
    }

});

var imgPreloader = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                images:Array(),
                preloadDone:function () {
                    delete this;
                }
            };
            Object.extend(this.options, options || { });
            this.unloadedImages = {};
            this.preloadDone = this.options.preloadDone;
            this.options.images.each(function (el, i) {
                setTimeout(function () {
                    var id = Math.random() + i;
                    var img = new Image();
                    img.id = id;
                    this.unloadedImages[id] = 'loading';
                    $(img).observe("load", function (e) {
                        delete this.unloadedImages[e.element().id];
                    }.bind(this));
                    img.src = el;
                }.bind(this), 50);
            }.bind(this));

            this.observeImagesCount();
        }
        catch (err) {
            alert('speedtracker.showProgress: initialize error:' + console.log(err));
        }
    },

    imagesCountInterval:new Object(),

    observeImagesCount:function () {
        this.imagesCountInterval = setInterval(function () {
            for (var img in this.unloadedImages) {
                return;
            }
            clearInterval(this.imagesCountInterval);
            this.preloadDone();
        }.bind(this), 100);
    }
});

/***Example page preloader usage*/
/*document.observe("dom:ready",function(){
 time = new timeToLoad({size:'1000000'});// * 1000;
 });*/



