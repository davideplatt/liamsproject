(function(k){if(k.CFInstall){return}var m=function(o,n){return(typeof o=="string")?(n||document).getElementById(o):o};var d=function(){if(k.CFInstall._force){return k.CFInstall._forceValue}var n=navigator.userAgent.toLowerCase();if(n.indexOf("chromeframe")>=0){return true}if(typeof window.ActiveXObject!="undefined"){try{var p=new ActiveXObject("ChromeTab.ChromeFrame");if(p){p.registerBhoIfNeeded();return true}}catch(o){}}return false};var g=function(r){try{var n=document.createElement("style");n.setAttribute("type","text/css");if(n.styleSheet){n.styleSheet.cssText=r}else{n.appendChild(document.createTextNode(r))}var o=document.getElementsByTagName("head")[0];var q=o.firstChild;o.insertBefore(n,q)}catch(p){}};var j=false;var c=false;var b=function(){if(j){return}var n='.chromeFrameInstallDefaultStyle {width: 800px;height: 600px;position: absolute;left: 50%;top: 50%;margin-left: -400px;margin-top: -300px;}.chromeFrameOverlayContent {position: absolute;margin-left: -400px;margin-top: -300px;left: 50%;top: 50%;border: 1px solid #93B4D9;background-color: white;z-index: 999999;}.chromeFrameOverlayContent iframe {width: 800px;height: 600px;border: none;}.chromeFrameOverlayCloseBar {height: 1em;text-align: right;background-color: #CADEF4;}.chromeFrameOverlayUnderlay {position: absolute;width: 100%;height: 100%;background-color: white;opacity: 0.5;-moz-opacity: 0.5;-webkit-opacity: 0.5;-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";filter: alpha(opacity=50);z-index: 999998;}';g(n);j=true};var h=function(){if(c){return}var o=".chromeFrameOverlayContent { display: none; }.chromeFrameOverlayUnderlay { display: none; }";g(o);var n=365*24*60*60*1000;document.cookie="disableGCFCheck=1;path=/;max-age="+n;c=true};var e=function(q,o){var r=m(o.node);q.id=o.id||(r?r.id||getUid(r):"");var p=o.cssText||"";q.style.cssText=" "+p;var n=o.className||"";q.className=n;var s=o.src||"about:blank";q.src=s;if(r){r.parentNode.replaceChild(q,r)}};var i=function(n){var o=document.createElement("iframe");o.setAttribute("frameborder","0");o.setAttribute("border","0");e(o,n);return o};var l=function(n){n.className="chromeFrameInstallDefaultStyle "+(n.className||"");var p=i(n);if(!p.parentNode){var o=document.body.firstChild;document.body.insertBefore(p,o)}};var a=function(p){if(m("chromeFrameOverlayContent")){return}var r=document.createElement("span");r.innerHTML='<div class="chromeFrameOverlayUnderlay"></div><table class="chromeFrameOverlayContent"id="chromeFrameOverlayContent"cellpadding="0" cellspacing="0"><tr class="chromeFrameOverlayCloseBar"><td><button id="chromeFrameCloseButton">close</button></td></tr><tr><td id="chromeFrameIframeHolder"></td></tr></table>';var o=document.body;while(r.firstChild){o.insertBefore(r.lastChild,o.firstChild)}var q=i(p);m("chromeFrameIframeHolder").appendChild(q);m("chromeFrameCloseButton").onclick=h};var f={};f.check=function(r){r=r||{};var n=navigator.userAgent;var s=/MSIE (\S+); Windows NT/;var o=false;if(s.test(n)){if(parseFloat(s.exec(n)[1])<6&&n.indexOf("SV1")<0){o=true}}else{o=true}if(o||document.createElement("canvas").getContext("2d")){return}b();if(document.cookie.indexOf("disableGCFCheck=1")>=0){h()}var v=document.location.protocol;var w=(v=="https:")?"https:":"http:";var p="/data/engine/chromeframe.html";if(!d()){if(r.onmissing){r.onmissing()}if(document.location.indexOf("index.html")>=0){document.location=document.location.substr((document.location.strlen-10),10)+p}else{document.location=document.location+p}r.src=r.url||p;var q=r.mode||"inline";var u=r.preventPrompt||false;if(!u){if(q=="inline"){l(r)}else{if(q=="overlay"){a(r)}else{window.open(r.src)}}}if(r.preventInstallDetection){return}var t=setInterval(function(){if(d()){if(r.oninstall){r.oninstall()}clearInterval(t);window.location=r.destination||window.location}},2000)}};f._force=false;f._forceValue=false;f.isAvailable=d;k.CFInstall=f})(this["ChromeFrameInstallScope"]||this);CFInstall.check({mode:"inline"});