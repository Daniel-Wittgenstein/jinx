$_PLUGIN.add({
  isPlugin: true,
  appName: "jinx",
  name: `Howler.js Core`,
  id: "howler",
  compatiblewithVersions: ["0.1"],
  author: `James Simpson and GoldFire Studios, Inc.`,
  copyrightInfo: `Copyright (c) 2013-2020 James Simpson and GoldFire Studios, Inc.`,
  version: `2.2.3`,
  licenseShort: `MIT`,
  links: [
    {text: "Official Website", target: `https://howlerjs.com/`},
    {text: "GitHub", target: `https://github.com/goldfire/howler.js`},
  ],
  licenseText: `
    Copyright (c) 2013-2020 James Simpson and GoldFire Studios, Inc.
    <br>
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    <br>
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    <br>
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  `,
  shortInfo: `Advanced audio`,
  documentation: `Provides advanced audio capabilities. Note that this is the core version
  of howler.js. This means it does NOT include the howler spatial plugin. Spatial sound
  is pretty rare in text-based games and the spatial plugin is pretty big in size,
  so it was intentionally omitted. All other functions of howler.js should work.`,
  //only built-in extensions can set these:
  builtIn: true,
  enabledByDefault: false,
  //********* optional properties:
  logo: `🎵`,
  licenseTextMustBeIncludedInFinalGame: true,
  //********* custom properties (no special meaning;
  //    they are just displayed in the "view plugin" view):
  disclaimer: `The authors of this JavaScript library are not
    affiliated with the Jinx project in any way.`,
  bundledBy: `Jinx Core Team`,




  implementation: {

    //DO NOT INDENT INSIDE STRING.
js: "!function(){\"use strict\";var e=function(){this.init()};e.prototype={init:function(){var e=this||n;return e._counter=1e3,e._html5AudioPool=[],e.html5PoolSize=10,e._codecs={},e._howls=[],e._muted=!1,e._volume=1,e._canPlayEvent=\"canplaythrough\",e._navigator=\"undefined\"!=typeof window\u0026\u0026window.navigator?window.navigator:null,e.masterGain=null,e.noAudio=!1,e.usingWebAudio=!0,e.autoSuspend=!0,e.ctx=null,e.autoUnlock=!0,e._setup(),e},volume:function(e){var o=this||n;if(e=parseFloat(e),o.ctx||_(),void 0!==e\u0026\u0026e\u003e=0\u0026\u0026e\u003c=1){if(o._volume=e,o._muted)return o;o.usingWebAudio\u0026\u0026o.masterGain.gain.setValueAtTime(e,n.ctx.currentTime);for(var t=0;t\u003co._howls.length;t++)if(!o._howls[t]._webAudio)for(var r=o._howls[t]._getSoundIds(),a=0;a\u003cr.length;a++){var u=o._howls[t]._soundById(r[a]);u\u0026\u0026u._node\u0026\u0026(u._node.volume=u._volume*e)}return o}return o._volume},mute:function(e){var o=this||n;o.ctx||_(),o._muted=e,o.usingWebAudio\u0026\u0026o.masterGain.gain.setValueAtTime(e?0:o._volume,n.ctx.currentTime);for(var t=0;t\u003co._howls.length;t++)if(!o._howls[t]._webAudio)for(var r=o._howls[t]._getSoundIds(),a=0;a\u003cr.length;a++){var u=o._howls[t]._soundById(r[a]);u\u0026\u0026u._node\u0026\u0026(u._node.muted=!!e||u._muted)}return o},stop:function(){for(var e=this||n,o=0;o\u003ce._howls.length;o++)e._howls[o].stop();return e},unload:function(){for(var e=this||n,o=e._howls.length-1;o\u003e=0;o--)e._howls[o].unload();return e.usingWebAudio\u0026\u0026e.ctx\u0026\u0026void 0!==e.ctx.close\u0026\u0026(e.ctx.close(),e.ctx=null,_()),e},codecs:function(e){return(this||n)._codecs[e.replace(/^x-/,\"\")]},_setup:function(){var e=this||n;if(e.state=e.ctx?e.ctx.state||\"suspended\":\"suspended\",e._autoSuspend(),!e.usingWebAudio)if(\"undefined\"!=typeof Audio)try{var o=new Audio;void 0===o.oncanplaythrough\u0026\u0026(e._canPlayEvent=\"canplay\")}catch(n){e.noAudio=!0}else e.noAudio=!0;try{var o=new Audio;o.muted\u0026\u0026(e.noAudio=!0)}catch(e){}return e.noAudio||e._setupCodecs(),e},_setupCodecs:function(){var e=this||n,o=null;try{o=\"undefined\"!=typeof Audio?new Audio:null}catch(n){return e}if(!o||\"function\"!=typeof o.canPlayType)return e;var t=o.canPlayType(\"audio/mpeg;\").replace(/^no$/,\"\"),r=e._navigator?e._navigator.userAgent:\"\",a=r.match(/OPR\\/([0-6].)/g),u=a\u0026\u0026parseInt(a[0].split(\"/\")[1],10)\u003c33,d=-1!==r.indexOf(\"Safari\")\u0026\u0026-1===r.indexOf(\"Chrome\"),i=r.match(/Version\\/(.*?) /),_=d\u0026\u0026i\u0026\u0026parseInt(i[1],10)\u003c15;return e._codecs={mp3:!(u||!t\u0026\u0026!o.canPlayType(\"audio/mp3;\").replace(/^no$/,\"\")),mpeg:!!t,opus:!!o.canPlayType('audio/ogg; codecs=\"opus\"').replace(/^no$/,\"\"),ogg:!!o.canPlayType('audio/ogg; codecs=\"vorbis\"').replace(/^no$/,\"\"),oga:!!o.canPlayType('audio/ogg; codecs=\"vorbis\"').replace(/^no$/,\"\"),wav:!!(o.canPlayType('audio/wav; codecs=\"1\"')||o.canPlayType(\"audio/wav\")).replace(/^no$/,\"\"),aac:!!o.canPlayType(\"audio/aac;\").replace(/^no$/,\"\"),caf:!!o.canPlayType(\"audio/x-caf;\").replace(/^no$/,\"\"),m4a:!!(o.canPlayType(\"audio/x-m4a;\")||o.canPlayType(\"audio/m4a;\")||o.canPlayType(\"audio/aac;\")).replace(/^no$/,\"\"),m4b:!!(o.canPlayType(\"audio/x-m4b;\")||o.canPlayType(\"audio/m4b;\")||o.canPlayType(\"audio/aac;\")).replace(/^no$/,\"\"),mp4:!!(o.canPlayType(\"audio/x-mp4;\")||o.canPlayType(\"audio/mp4;\")||o.canPlayType(\"audio/aac;\")).replace(/^no$/,\"\"),weba:!(_||!o.canPlayType('audio/webm; codecs=\"vorbis\"').replace(/^no$/,\"\")),webm:!(_||!o.canPlayType('audio/webm; codecs=\"vorbis\"').replace(/^no$/,\"\")),dolby:!!o.canPlayType('audio/mp4; codecs=\"ec-3\"').replace(/^no$/,\"\"),flac:!!(o.canPlayType(\"audio/x-flac;\")||o.canPlayType(\"audio/flac;\")).replace(/^no$/,\"\")},e},_unlockAudio:function(){var e=this||n;if(!e._audioUnlocked\u0026\u0026e.ctx){e._audioUnlocked=!1,e.autoUnlock=!1,e._mobileUnloaded||44100===e.ctx.sampleRate||(e._mobileUnloaded=!0,e.unload()),e._scratchBuffer=e.ctx.createBuffer(1,1,22050);var o=function(n){for(;e._html5AudioPool.length\u003ce.html5PoolSize;)try{var t=new Audio;t._unlocked=!0,e._releaseHtml5Audio(t)}catch(n){e.noAudio=!0;break}for(var r=0;r\u003ce._howls.length;r++)if(!e._howls[r]._webAudio)for(var a=e._howls[r]._getSoundIds(),u=0;u\u003ca.length;u++){var d=e._howls[r]._soundById(a[u]);d\u0026\u0026d._node\u0026\u0026!d._node._unlocked\u0026\u0026(d._node._unlocked=!0,d._node.load())}e._autoResume();var i=e.ctx.createBufferSource();i.buffer=e._scratchBuffer,i.connect(e.ctx.destination),void 0===i.start?i.noteOn(0):i.start(0),\"function\"==typeof e.ctx.resume\u0026\u0026e.ctx.resume(),i.onended=function(){i.disconnect(0),e._audioUnlocked=!0,document.removeEventListener(\"touchstart\",o,!0),document.removeEventListener(\"touchend\",o,!0),document.removeEventListener(\"click\",o,!0),document.removeEventListener(\"keydown\",o,!0);for(var n=0;n\u003ce._howls.length;n++)e._howls[n]._emit(\"unlock\")}};return document.addEventListener(\"touchstart\",o,!0),document.addEventListener(\"touchend\",o,!0),document.addEventListener(\"click\",o,!0),document.addEventListener(\"keydown\",o,!0),e}},_obtainHtml5Audio:function(){var e=this||n;if(e._html5AudioPool.length)return e._html5AudioPool.pop();var o=(new Audio).play();return o\u0026\u0026\"undefined\"!=typeof Promise\u0026\u0026(o instanceof Promise||\"function\"==typeof o.then)\u0026\u0026o.catch(function(){console.warn(\"HTML5 Audio pool exhausted, returning potentially locked audio object.\")}),new Audio},_releaseHtml5Audio:function(e){var o=this||n;return e._unlocked\u0026\u0026o._html5AudioPool.push(e),o},_autoSuspend:function(){var e=this;if(e.autoSuspend\u0026\u0026e.ctx\u0026\u0026void 0!==e.ctx.suspend\u0026\u0026n.usingWebAudio){for(var o=0;o\u003ce._howls.length;o++)if(e._howls[o]._webAudio)for(var t=0;t\u003ce._howls[o]._sounds.length;t++)if(!e._howls[o]._sounds[t]._paused)return e;return e._suspendTimer\u0026\u0026clearTimeout(e._suspendTimer),e._suspendTimer=setTimeout(function(){if(e.autoSuspend){e._suspendTimer=null,e.state=\"suspending\";var n=function(){e.state=\"suspended\",e._resumeAfterSuspend\u0026\u0026(delete e._resumeAfterSuspend,e._autoResume())};e.ctx.suspend().then(n,n)}},3e4),e}},_autoResume:function(){var e=this;if(e.ctx\u0026\u0026void 0!==e.ctx.resume\u0026\u0026n.usingWebAudio)return\"running\"===e.state\u0026\u0026\"interrupted\"!==e.ctx.state\u0026\u0026e._suspendTimer?(clearTimeout(e._suspendTimer),e._suspendTimer=null):\"suspended\"===e.state||\"running\"===e.state\u0026\u0026\"interrupted\"===e.ctx.state?(e.ctx.resume().then(function(){e.state=\"running\";for(var n=0;n\u003ce._howls.length;n++)e._howls[n]._emit(\"resume\")}),e._suspendTimer\u0026\u0026(clearTimeout(e._suspendTimer),e._suspendTimer=null)):\"suspending\"===e.state\u0026\u0026(e._resumeAfterSuspend=!0),e}};var n=new e,o=function(e){var n=this;if(!e.src||0===e.src.length)return void console.error(\"An array of source files must be passed with any new Howl.\");n.init(e)};o.prototype={init:function(e){var o=this;return n.ctx||_(),o._autoplay=e.autoplay||!1,o._format=\"string\"!=typeof e.format?e.format:[e.format],o._html5=e.html5||!1,o._muted=e.mute||!1,o._loop=e.loop||!1,o._pool=e.pool||5,o._preload=\"boolean\"!=typeof e.preload\u0026\u0026\"metadata\"!==e.preload||e.preload,o._rate=e.rate||1,o._sprite=e.sprite||{},o._src=\"string\"!=typeof e.src?e.src:[e.src],o._volume=void 0!==e.volume?e.volume:1,o._xhr={method:e.xhr\u0026\u0026e.xhr.method?e.xhr.method:\"GET\",headers:e.xhr\u0026\u0026e.xhr.headers?e.xhr.headers:null,withCredentials:!(!e.xhr||!e.xhr.withCredentials)\u0026\u0026e.xhr.withCredentials},o._duration=0,o._state=\"unloaded\",o._sounds=[],o._endTimers={},o._queue=[],o._playLock=!1,o._onend=e.onend?[{fn:e.onend}]:[],o._onfade=e.onfade?[{fn:e.onfade}]:[],o._onload=e.onload?[{fn:e.onload}]:[],o._onloaderror=e.onloaderror?[{fn:e.onloaderror}]:[],o._onplayerror=e.onplayerror?[{fn:e.onplayerror}]:[],o._onpause=e.onpause?[{fn:e.onpause}]:[],o._onplay=e.onplay?[{fn:e.onplay}]:[],o._onstop=e.onstop?[{fn:e.onstop}]:[],o._onmute=e.onmute?[{fn:e.onmute}]:[],o._onvolume=e.onvolume?[{fn:e.onvolume}]:[],o._onrate=e.onrate?[{fn:e.onrate}]:[],o._onseek=e.onseek?[{fn:e.onseek}]:[],o._onunlock=e.onunlock?[{fn:e.onunlock}]:[],o._onresume=[],o._webAudio=n.usingWebAudio\u0026\u0026!o._html5,void 0!==n.ctx\u0026\u0026n.ctx\u0026\u0026n.autoUnlock\u0026\u0026n._unlockAudio(),n._howls.push(o),o._autoplay\u0026\u0026o._queue.push({event:\"play\",action:function(){o.play()}}),o._preload\u0026\u0026\"none\"!==o._preload\u0026\u0026o.load(),o},load:function(){var e=this,o=null;if(n.noAudio)return void e._emit(\"loaderror\",null,\"No audio support.\");\"string\"==typeof e._src\u0026\u0026(e._src=[e._src]);for(var r=0;r\u003ce._src.length;r++){var u,d;if(e._format\u0026\u0026e._format[r])u=e._format[r];else{if(\"string\"!=typeof(d=e._src[r])){e._emit(\"loaderror\",null,\"Non-string found in selected audio sources - ignoring.\");continue}u=/^data:audio\\/([^;,]+);/i.exec(d),u||(u=/\\.([^.]+)$/.exec(d.split(\"?\",1)[0])),u\u0026\u0026(u=u[1].toLowerCase())}if(u||console.warn('No file extension was found. Consider using the \"format\" property or specify an extension.'),u\u0026\u0026n.codecs(u)){o=e._src[r];break}}return o?(e._src=o,e._state=\"loading\",\"https:\"===window.location.protocol\u0026\u0026\"http:\"===o.slice(0,5)\u0026\u0026(e._html5=!0,e._webAudio=!1),new t(e),e._webAudio\u0026\u0026a(e),e):void e._emit(\"loaderror\",null,\"No codec support for selected audio sources.\")},play:function(e,o){var t=this,r=null;if(\"number\"==typeof e)r=e,e=null;else{if(\"string\"==typeof e\u0026\u0026\"loaded\"===t._state\u0026\u0026!t._sprite[e])return null;if(void 0===e\u0026\u0026(e=\"__default\",!t._playLock)){for(var a=0,u=0;u\u003ct._sounds.length;u++)t._sounds[u]._paused\u0026\u0026!t._sounds[u]._ended\u0026\u0026(a++,r=t._sounds[u]._id);1===a?e=null:r=null}}var d=r?t._soundById(r):t._inactiveSound();if(!d)return null;if(r\u0026\u0026!e\u0026\u0026(e=d._sprite||\"__default\"),\"loaded\"!==t._state){d._sprite=e,d._ended=!1;var i=d._id;return t._queue.push({event:\"play\",action:function(){t.play(i)}}),i}if(r\u0026\u0026!d._paused)return o||t._loadQueue(\"play\"),d._id;t._webAudio\u0026\u0026n._autoResume();var _=Math.max(0,d._seek\u003e0?d._seek:t._sprite[e][0]/1e3),s=Math.max(0,(t._sprite[e][0]+t._sprite[e][1])/1e3-_),l=1e3*s/Math.abs(d._rate),c=t._sprite[e][0]/1e3,f=(t._sprite[e][0]+t._sprite[e][1])/1e3;d._sprite=e,d._ended=!1;var p=function(){d._paused=!1,d._seek=_,d._start=c,d._stop=f,d._loop=!(!d._loop\u0026\u0026!t._sprite[e][2])};if(_\u003e=f)return void t._ended(d);var m=d._node;if(t._webAudio){var v=function(){t._playLock=!1,p(),t._refreshBuffer(d);var e=d._muted||t._muted?0:d._volume;m.gain.setValueAtTime(e,n.ctx.currentTime),d._playStart=n.ctx.currentTime,void 0===m.bufferSource.start?d._loop?m.bufferSource.noteGrainOn(0,_,86400):m.bufferSource.noteGrainOn(0,_,s):d._loop?m.bufferSource.start(0,_,86400):m.bufferSource.start(0,_,s),l!==1/0\u0026\u0026(t._endTimers[d._id]=setTimeout(t._ended.bind(t,d),l)),o||setTimeout(function(){t._emit(\"play\",d._id),t._loadQueue()},0)};\"running\"===n.state\u0026\u0026\"interrupted\"!==n.ctx.state?v():(t._playLock=!0,t.once(\"resume\",v),t._clearTimer(d._id))}else{var h=function(){m.currentTime=_,m.muted=d._muted||t._muted||n._muted||m.muted,m.volume=d._volume*n.volume(),m.playbackRate=d._rate;try{var r=m.play();if(r\u0026\u0026\"undefined\"!=typeof Promise\u0026\u0026(r instanceof Promise||\"function\"==typeof r.then)?(t._playLock=!0,p(),r.then(function(){t._playLock=!1,m._unlocked=!0,o?t._loadQueue():t._emit(\"play\",d._id)}).catch(function(){t._playLock=!1,t._emit(\"playerror\",d._id,\"Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.\"),d._ended=!0,d._paused=!0})):o||(t._playLock=!1,p(),t._emit(\"play\",d._id)),m.playbackRate=d._rate,m.paused)return void t._emit(\"playerror\",d._id,\"Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.\");\"__default\"!==e||d._loop?t._endTimers[d._id]=setTimeout(t._ended.bind(t,d),l):(t._endTimers[d._id]=function(){t._ended(d),m.removeEventListener(\"ended\",t._endTimers[d._id],!1)},m.addEventListener(\"ended\",t._endTimers[d._id],!1))}catch(e){t._emit(\"playerror\",d._id,e)}};\"data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA\"===m.src\u0026\u0026(m.src=t._src,m.load());var y=window\u0026\u0026window.ejecta||!m.readyState\u0026\u0026n._navigator.isCocoonJS;if(m.readyState\u003e=3||y)h();else{t._playLock=!0,t._state=\"loading\";var g=function(){t._state=\"loaded\",h(),m.removeEventListener(n._canPlayEvent,g,!1)};m.addEventListener(n._canPlayEvent,g,!1),t._clearTimer(d._id)}}return d._id},pause:function(e){var n=this;if(\"loaded\"!==n._state||n._playLock)return n._queue.push({event:\"pause\",action:function(){n.pause(e)}}),n;for(var o=n._getSoundIds(e),t=0;t\u003co.length;t++){n._clearTimer(o[t]);var r=n._soundById(o[t]);if(r\u0026\u0026!r._paused\u0026\u0026(r._seek=n.seek(o[t]),r._rateSeek=0,r._paused=!0,n._stopFade(o[t]),r._node))if(n._webAudio){if(!r._node.bufferSource)continue;void 0===r._node.bufferSource.stop?r._node.bufferSource.noteOff(0):r._node.bufferSource.stop(0),n._cleanBuffer(r._node)}else isNaN(r._node.duration)\u0026\u0026r._node.duration!==1/0||r._node.pause();arguments[1]||n._emit(\"pause\",r?r._id:null)}return n},stop:function(e,n){var o=this;if(\"loaded\"!==o._state||o._playLock)return o._queue.push({event:\"stop\",action:function(){o.stop(e)}}),o;for(var t=o._getSoundIds(e),r=0;r\u003ct.length;r++){o._clearTimer(t[r]);var a=o._soundById(t[r]);a\u0026\u0026(a._seek=a._start||0,a._rateSeek=0,a._paused=!0,a._ended=!0,o._stopFade(t[r]),a._node\u0026\u0026(o._webAudio?a._node.bufferSource\u0026\u0026(void 0===a._node.bufferSource.stop?a._node.bufferSource.noteOff(0):a._node.bufferSource.stop(0),o._cleanBuffer(a._node)):isNaN(a._node.duration)\u0026\u0026a._node.duration!==1/0||(a._node.currentTime=a._start||0,a._node.pause(),a._node.duration===1/0\u0026\u0026o._clearSound(a._node))),n||o._emit(\"stop\",a._id))}return o},mute:function(e,o){var t=this;if(\"loaded\"!==t._state||t._playLock)return t._queue.push({event:\"mute\",action:function(){t.mute(e,o)}}),t;if(void 0===o){if(\"boolean\"!=typeof e)return t._muted;t._muted=e}for(var r=t._getSoundIds(o),a=0;a\u003cr.length;a++){var u=t._soundById(r[a]);u\u0026\u0026(u._muted=e,u._interval\u0026\u0026t._stopFade(u._id),t._webAudio\u0026\u0026u._node?u._node.gain.setValueAtTime(e?0:u._volume,n.ctx.currentTime):u._node\u0026\u0026(u._node.muted=!!n._muted||e),t._emit(\"mute\",u._id))}return t},volume:function(){var e,o,t=this,r=arguments;if(0===r.length)return t._volume;if(1===r.length||2===r.length\u0026\u0026void 0===r[1]){t._getSoundIds().indexOf(r[0])\u003e=0?o=parseInt(r[0],10):e=parseFloat(r[0])}else r.length\u003e=2\u0026\u0026(e=parseFloat(r[0]),o=parseInt(r[1],10));var a;if(!(void 0!==e\u0026\u0026e\u003e=0\u0026\u0026e\u003c=1))return a=o?t._soundById(o):t._sounds[0],a?a._volume:0;if(\"loaded\"!==t._state||t._playLock)return t._queue.push({event:\"volume\",action:function(){t.volume.apply(t,r)}}),t;void 0===o\u0026\u0026(t._volume=e),o=t._getSoundIds(o);for(var u=0;u\u003co.length;u++)(a=t._soundById(o[u]))\u0026\u0026(a._volume=e,r[2]||t._stopFade(o[u]),t._webAudio\u0026\u0026a._node\u0026\u0026!a._muted?a._node.gain.setValueAtTime(e,n.ctx.currentTime):a._node\u0026\u0026!a._muted\u0026\u0026(a._node.volume=e*n.volume()),t._emit(\"volume\",a._id));return t},fade:function(e,o,t,r){var a=this;if(\"loaded\"!==a._state||a._playLock)return a._queue.push({event:\"fade\",action:function(){a.fade(e,o,t,r)}}),a;e=Math.min(Math.max(0,parseFloat(e)),1),o=Math.min(Math.max(0,parseFloat(o)),1),t=parseFloat(t),a.volume(e,r);for(var u=a._getSoundIds(r),d=0;d\u003cu.length;d++){var i=a._soundById(u[d]);if(i){if(r||a._stopFade(u[d]),a._webAudio\u0026\u0026!i._muted){var _=n.ctx.currentTime,s=_+t/1e3;i._volume=e,i._node.gain.setValueAtTime(e,_),i._node.gain.linearRampToValueAtTime(o,s)}a._startFadeInterval(i,e,o,t,u[d],void 0===r)}}return a},_startFadeInterval:function(e,n,o,t,r,a){var u=this,d=n,i=o-n,_=Math.abs(i/.01),s=Math.max(4,_\u003e0?t/_:t),l=Date.now();e._fadeTo=o,e._interval=setInterval(function(){var r=(Date.now()-l)/t;l=Date.now(),d+=i*r,d=Math.round(100*d)/100,d=i\u003c0?Math.max(o,d):Math.min(o,d),u._webAudio?e._volume=d:u.volume(d,e._id,!0),a\u0026\u0026(u._volume=d),(o\u003cn\u0026\u0026d\u003c=o||o\u003en\u0026\u0026d\u003e=o)\u0026\u0026(clearInterval(e._interval),e._interval=null,e._fadeTo=null,u.volume(o,e._id),u._emit(\"fade\",e._id))},s)},_stopFade:function(e){var o=this,t=o._soundById(e);return t\u0026\u0026t._interval\u0026\u0026(o._webAudio\u0026\u0026t._node.gain.cancelScheduledValues(n.ctx.currentTime),clearInterval(t._interval),t._interval=null,o.volume(t._fadeTo,e),t._fadeTo=null,o._emit(\"fade\",e)),o},loop:function(){var e,n,o,t=this,r=arguments;if(0===r.length)return t._loop;if(1===r.length){if(\"boolean\"!=typeof r[0])return!!(o=t._soundById(parseInt(r[0],10)))\u0026\u0026o._loop;e=r[0],t._loop=e}else 2===r.length\u0026\u0026(e=r[0],n=parseInt(r[1],10));for(var a=t._getSoundIds(n),u=0;u\u003ca.length;u++)(o=t._soundById(a[u]))\u0026\u0026(o._loop=e,t._webAudio\u0026\u0026o._node\u0026\u0026o._node.bufferSource\u0026\u0026(o._node.bufferSource.loop=e,e\u0026\u0026(o._node.bufferSource.loopStart=o._start||0,o._node.bufferSource.loopEnd=o._stop,t.playing(a[u])\u0026\u0026(t.pause(a[u],!0),t.play(a[u],!0)))));return t},rate:function(){var e,o,t=this,r=arguments;if(0===r.length)o=t._sounds[0]._id;else if(1===r.length){var a=t._getSoundIds(),u=a.indexOf(r[0]);u\u003e=0?o=parseInt(r[0],10):e=parseFloat(r[0])}else 2===r.length\u0026\u0026(e=parseFloat(r[0]),o=parseInt(r[1],10));var d;if(\"number\"!=typeof e)return d=t._soundById(o),d?d._rate:t._rate;if(\"loaded\"!==t._state||t._playLock)return t._queue.push({event:\"rate\",action:function(){t.rate.apply(t,r)}}),t;void 0===o\u0026\u0026(t._rate=e),o=t._getSoundIds(o);for(var i=0;i\u003co.length;i++)if(d=t._soundById(o[i])){t.playing(o[i])\u0026\u0026(d._rateSeek=t.seek(o[i]),d._playStart=t._webAudio?n.ctx.currentTime:d._playStart),d._rate=e,t._webAudio\u0026\u0026d._node\u0026\u0026d._node.bufferSource?d._node.bufferSource.playbackRate.setValueAtTime(e,n.ctx.currentTime):d._node\u0026\u0026(d._node.playbackRate=e);var _=t.seek(o[i]),s=(t._sprite[d._sprite][0]+t._sprite[d._sprite][1])/1e3-_,l=1e3*s/Math.abs(d._rate);!t._endTimers[o[i]]\u0026\u0026d._paused||(t._clearTimer(o[i]),t._endTimers[o[i]]=setTimeout(t._ended.bind(t,d),l)),t._emit(\"rate\",d._id)}return t},seek:function(){var e,o,t=this,r=arguments;if(0===r.length)t._sounds.length\u0026\u0026(o=t._sounds[0]._id);else if(1===r.length){var a=t._getSoundIds(),u=a.indexOf(r[0]);u\u003e=0?o=parseInt(r[0],10):t._sounds.length\u0026\u0026(o=t._sounds[0]._id,e=parseFloat(r[0]))}else 2===r.length\u0026\u0026(e=parseFloat(r[0]),o=parseInt(r[1],10));if(void 0===o)return 0;if(\"number\"==typeof e\u0026\u0026(\"loaded\"!==t._state||t._playLock))return t._queue.push({event:\"seek\",action:function(){t.seek.apply(t,r)}}),t;var d=t._soundById(o);if(d){if(!(\"number\"==typeof e\u0026\u0026e\u003e=0)){if(t._webAudio){var i=t.playing(o)?n.ctx.currentTime-d._playStart:0,_=d._rateSeek?d._rateSeek-d._seek:0;return d._seek+(_+i*Math.abs(d._rate))}return d._node.currentTime}var s=t.playing(o);s\u0026\u0026t.pause(o,!0),d._seek=e,d._ended=!1,t._clearTimer(o),t._webAudio||!d._node||isNaN(d._node.duration)||(d._node.currentTime=e);var l=function(){s\u0026\u0026t.play(o,!0),t._emit(\"seek\",o)};if(s\u0026\u0026!t._webAudio){var c=function(){t._playLock?setTimeout(c,0):l()};setTimeout(c,0)}else l()}return t},playing:function(e){var n=this;if(\"number\"==typeof e){var o=n._soundById(e);return!!o\u0026\u0026!o._paused}for(var t=0;t\u003cn._sounds.length;t++)if(!n._sounds[t]._paused)return!0;return!1},duration:function(e){var n=this,o=n._duration,t=n._soundById(e);return t\u0026\u0026(o=n._sprite[t._sprite][1]/1e3),o},state:function(){return this._state},unload:function(){for(var e=this,o=e._sounds,t=0;t\u003co.length;t++)o[t]._paused||e.stop(o[t]._id),e._webAudio||(e._clearSound(o[t]._node),o[t]._node.removeEventListener(\"error\",o[t]._errorFn,!1),o[t]._node.removeEventListener(n._canPlayEvent,o[t]._loadFn,!1),o[t]._node.removeEventListener(\"ended\",o[t]._endFn,!1),n._releaseHtml5Audio(o[t]._node)),delete o[t]._node,e._clearTimer(o[t]._id);var a=n._howls.indexOf(e);a\u003e=0\u0026\u0026n._howls.splice(a,1);var u=!0;for(t=0;t\u003cn._howls.length;t++)if(n._howls[t]._src===e._src||e._src.indexOf(n._howls[t]._src)\u003e=0){u=!1;break}return r\u0026\u0026u\u0026\u0026delete r[e._src],n.noAudio=!1,e._state=\"unloaded\",e._sounds=[],e=null,null},on:function(e,n,o,t){var r=this,a=r[\"_on\"+e];return\"function\"==typeof n\u0026\u0026a.push(t?{id:o,fn:n,once:t}:{id:o,fn:n}),r},off:function(e,n,o){var t=this,r=t[\"_on\"+e],a=0;if(\"number\"==typeof n\u0026\u0026(o=n,n=null),n||o)for(a=0;a\u003cr.length;a++){var u=o===r[a].id;if(n===r[a].fn\u0026\u0026u||!n\u0026\u0026u){r.splice(a,1);break}}else if(e)t[\"_on\"+e]=[];else{var d=Object.keys(t);for(a=0;a\u003cd.length;a++)0===d[a].indexOf(\"_on\")\u0026\u0026Array.isArray(t[d[a]])\u0026\u0026(t[d[a]]=[])}return t},once:function(e,n,o){var t=this;return t.on(e,n,o,1),t},_emit:function(e,n,o){for(var t=this,r=t[\"_on\"+e],a=r.length-1;a\u003e=0;a--)r[a].id\u0026\u0026r[a].id!==n\u0026\u0026\"load\"!==e||(setTimeout(function(e){e.call(this,n,o)}.bind(t,r[a].fn),0),r[a].once\u0026\u0026t.off(e,r[a].fn,r[a].id));return t._loadQueue(e),t},_loadQueue:function(e){var n=this;if(n._queue.length\u003e0){var o=n._queue[0];o.event===e\u0026\u0026(n._queue.shift(),n._loadQueue()),e||o.action()}return n},_ended:function(e){var o=this,t=e._sprite;if(!o._webAudio\u0026\u0026e._node\u0026\u0026!e._node.paused\u0026\u0026!e._node.ended\u0026\u0026e._node.currentTime\u003ce._stop)return setTimeout(o._ended.bind(o,e),100),o;var r=!(!e._loop\u0026\u0026!o._sprite[t][2]);if(o._emit(\"end\",e._id),!o._webAudio\u0026\u0026r\u0026\u0026o.stop(e._id,!0).play(e._id),o._webAudio\u0026\u0026r){o._emit(\"play\",e._id),e._seek=e._start||0,e._rateSeek=0,e._playStart=n.ctx.currentTime;var a=1e3*(e._stop-e._start)/Math.abs(e._rate);o._endTimers[e._id]=setTimeout(o._ended.bind(o,e),a)}return o._webAudio\u0026\u0026!r\u0026\u0026(e._paused=!0,e._ended=!0,e._seek=e._start||0,e._rateSeek=0,o._clearTimer(e._id),o._cleanBuffer(e._node),n._autoSuspend()),o._webAudio||r||o.stop(e._id,!0),o},_clearTimer:function(e){var n=this;if(n._endTimers[e]){if(\"function\"!=typeof n._endTimers[e])clearTimeout(n._endTimers[e]);else{var o=n._soundById(e);o\u0026\u0026o._node\u0026\u0026o._node.removeEventListener(\"ended\",n._endTimers[e],!1)}delete n._endTimers[e]}return n},_soundById:function(e){for(var n=this,o=0;o\u003cn._sounds.length;o++)if(e===n._sounds[o]._id)return n._sounds[o];return null},_inactiveSound:function(){var e=this;e._drain();for(var n=0;n\u003ce._sounds.length;n++)if(e._sounds[n]._ended)return e._sounds[n].reset();return new t(e)},_drain:function(){var e=this,n=e._pool,o=0,t=0;if(!(e._sounds.length\u003cn)){for(t=0;t\u003ce._sounds.length;t++)e._sounds[t]._ended\u0026\u0026o++;for(t=e._sounds.length-1;t\u003e=0;t--){if(o\u003c=n)return;e._sounds[t]._ended\u0026\u0026(e._webAudio\u0026\u0026e._sounds[t]._node\u0026\u0026e._sounds[t]._node.disconnect(0),e._sounds.splice(t,1),o--)}}},_getSoundIds:function(e){var n=this;if(void 0===e){for(var o=[],t=0;t\u003cn._sounds.length;t++)o.push(n._sounds[t]._id);return o}return[e]},_refreshBuffer:function(e){var o=this;return e._node.bufferSource=n.ctx.createBufferSource(),e._node.bufferSource.buffer=r[o._src],e._panner?e._node.bufferSource.connect(e._panner):e._node.bufferSource.connect(e._node),e._node.bufferSource.loop=e._loop,e._loop\u0026\u0026(e._node.bufferSource.loopStart=e._start||0,e._node.bufferSource.loopEnd=e._stop||0),e._node.bufferSource.playbackRate.setValueAtTime(e._rate,n.ctx.currentTime),o},_cleanBuffer:function(e){var o=this,t=n._navigator\u0026\u0026n._navigator.vendor.indexOf(\"Apple\")\u003e=0;if(n._scratchBuffer\u0026\u0026e.bufferSource\u0026\u0026(e.bufferSource.onended=null,e.bufferSource.disconnect(0),t))try{e.bufferSource.buffer=n._scratchBuffer}catch(e){}return e.bufferSource=null,o},_clearSound:function(e){/MSIE |Trident\\//.test(n._navigator\u0026\u0026n._navigator.userAgent)||(e.src=\"data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA\")}};var t=function(e){this._parent=e,this.init()};t.prototype={init:function(){var e=this,o=e._parent;return e._muted=o._muted,e._loop=o._loop,e._volume=o._volume,e._rate=o._rate,e._seek=0,e._paused=!0,e._ended=!0,e._sprite=\"__default\",e._id=++n._counter,o._sounds.push(e),e.create(),e},create:function(){var e=this,o=e._parent,t=n._muted||e._muted||e._parent._muted?0:e._volume;return o._webAudio?(e._node=void 0===n.ctx.createGain?n.ctx.createGainNode():n.ctx.createGain(),e._node.gain.setValueAtTime(t,n.ctx.currentTime),e._node.paused=!0,e._node.connect(n.masterGain)):n.noAudio||(e._node=n._obtainHtml5Audio(),e._errorFn=e._errorListener.bind(e),e._node.addEventListener(\"error\",e._errorFn,!1),e._loadFn=e._loadListener.bind(e),e._node.addEventListener(n._canPlayEvent,e._loadFn,!1),e._endFn=e._endListener.bind(e),e._node.addEventListener(\"ended\",e._endFn,!1),e._node.src=o._src,e._node.preload=!0===o._preload?\"auto\":o._preload,e._node.volume=t*n.volume(),e._node.load()),e},reset:function(){var e=this,o=e._parent;return e._muted=o._muted,e._loop=o._loop,e._volume=o._volume,e._rate=o._rate,e._seek=0,e._rateSeek=0,e._paused=!0,e._ended=!0,e._sprite=\"__default\",e._id=++n._counter,e},_errorListener:function(){var e=this;e._parent._emit(\"loaderror\",e._id,e._node.error?e._node.error.code:0),e._node.removeEventListener(\"error\",e._errorFn,!1)},_loadListener:function(){var e=this,o=e._parent;o._duration=Math.ceil(10*e._node.duration)/10,0===Object.keys(o._sprite).length\u0026\u0026(o._sprite={__default:[0,1e3*o._duration]}),\"loaded\"!==o._state\u0026\u0026(o._state=\"loaded\",o._emit(\"load\"),o._loadQueue()),e._node.removeEventListener(n._canPlayEvent,e._loadFn,!1)},_endListener:function(){var e=this,n=e._parent;n._duration===1/0\u0026\u0026(n._duration=Math.ceil(10*e._node.duration)/10,n._sprite.__default[1]===1/0\u0026\u0026(n._sprite.__default[1]=1e3*n._duration),n._ended(e)),e._node.removeEventListener(\"ended\",e._endFn,!1)}};var r={},a=function(e){var n=e._src;if(r[n])return e._duration=r[n].duration,void i(e);if(/^data:[^;]+;base64,/.test(n)){for(var o=atob(n.split(\",\")[1]),t=new Uint8Array(o.length),a=0;a\u003co.length;++a)t[a]=o.charCodeAt(a);d(t.buffer,e)}else{var _=new XMLHttpRequest;_.open(e._xhr.method,n,!0),_.withCredentials=e._xhr.withCredentials,_.responseType=\"arraybuffer\",e._xhr.headers\u0026\u0026Object.keys(e._xhr.headers).forEach(function(n){_.setRequestHeader(n,e._xhr.headers[n])}),_.onload=function(){var n=(_.status+\"\")[0];if(\"0\"!==n\u0026\u0026\"2\"!==n\u0026\u0026\"3\"!==n)return void e._emit(\"loaderror\",null,\"Failed loading audio file with status: \"+_.status+\".\");d(_.response,e)},_.onerror=function(){e._webAudio\u0026\u0026(e._html5=!0,e._webAudio=!1,e._sounds=[],delete r[n],e.load())},u(_)}},u=function(e){try{e.send()}catch(n){e.onerror()}},d=function(e,o){var t=function(){o._emit(\"loaderror\",null,\"Decoding audio data failed.\")},a=function(e){e\u0026\u0026o._sounds.length\u003e0?(r[o._src]=e,i(o,e)):t()};\"undefined\"!=typeof Promise\u0026\u00261===n.ctx.decodeAudioData.length?n.ctx.decodeAudioData(e).then(a).catch(t):n.ctx.decodeAudioData(e,a,t)},i=function(e,n){n\u0026\u0026!e._duration\u0026\u0026(e._duration=n.duration),0===Object.keys(e._sprite).length\u0026\u0026(e._sprite={__default:[0,1e3*e._duration]}),\"loaded\"!==e._state\u0026\u0026(e._state=\"loaded\",e._emit(\"load\"),e._loadQueue())},_=function(){if(n.usingWebAudio){try{\"undefined\"!=typeof AudioContext?n.ctx=new AudioContext:\"undefined\"!=typeof webkitAudioContext?n.ctx=new webkitAudioContext:n.usingWebAudio=!1}catch(e){n.usingWebAudio=!1}n.ctx||(n.usingWebAudio=!1);var e=/iP(hone|od|ad)/.test(n._navigator\u0026\u0026n._navigator.platform),o=n._navigator\u0026\u0026n._navigator.appVersion.match(/OS (\\d+)_(\\d+)_?(\\d+)?/),t=o?parseInt(o[1],10):null;if(e\u0026\u0026t\u0026\u0026t\u003c9){var r=/safari/.test(n._navigator\u0026\u0026n._navigator.userAgent.toLowerCase());n._navigator\u0026\u0026!r\u0026\u0026(n.usingWebAudio=!1)}n.usingWebAudio\u0026\u0026(n.masterGain=void 0===n.ctx.createGain?n.ctx.createGainNode():n.ctx.createGain(),n.masterGain.gain.setValueAtTime(n._muted?0:n._volume,n.ctx.currentTime),n.masterGain.connect(n.ctx.destination)),n._setup()}};\"function\"==typeof define\u0026\u0026define.amd\u0026\u0026define([],function(){return{Howler:n,Howl:o}}),\"undefined\"!=typeof exports\u0026\u0026(exports.Howler=n,exports.Howl=o),\"undefined\"!=typeof global?(global.HowlerGlobal=e,global.Howler=n,global.Howl=o,global.Sound=t):\"undefined\"!=typeof window\u0026\u0026(window.HowlerGlobal=e,window.Howler=n,window.Howl=o,window.Sound=t)}();" 

  },



})

