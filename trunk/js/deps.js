
var HClass=function(){if(arguments.length){var H4X=arguments[0];if(this==window){HClass.prototype.extend.call(H4X,arguments.callee.prototype);}else{this.extend(H4X);}}};HClass.prototype={extend:function(H1p,H3){var H25=HClass.prototype.extend;if(arguments.length==2){var H0V=this[H1p];if((H0V instanceof Function)&&(H3 instanceof Function)&&H0V.valueOf()!=H3.valueOf()&&/\bbase\b/.test(H3)){var H3D=H3;H3=function(){var H0m=this.base;this.base=H0V;var H6v=H3D.apply(this,arguments);this.base=H0m;return H6v;};H3.valueOf=function(){return H3D;};H3.toString=function(){return String(H3D);};}
return this[H1p]=H3;}else if(H1p){var H0M={toSource:null};var H4Y=["toString","valueOf"];if(HClass.H3E){H4Y.push("constructor");}
for(var i=0;(Hd=H4Y[i]);i++){if(H1p[Hd]!=H0M[Hd]){H25.call(this,Hd,H1p[Hd]);}}
for(var Hd in H1p){if(!H0M[Hd]){H25.call(this,Hd,H1p[Hd]);}}}
return this;},base:function(){}};HClass.extend=function(H0L,H3F){var H25=HClass.prototype.extend;if(!H0L){H0L={};}
HClass.H3E=true;var H0M=new this;H25.call(H0M,H0L);var H2F=H0M.constructor;H0M.constructor=this;delete HClass.H3E;var H1o=function(){if(!HClass.H3E){H2F.apply(this,arguments);}
this.constructor=H1o;};H1o.prototype=H0M;H1o.extend=this.extend;H1o.implement=this.implement;H1o.toString=function(){return String(H2F);}
H25.call(H1o,H3F);var H00=H2F?H1o:H0M;if(H00.init instanceof Function){H00.init();}
return H00;};HClass.implement=function(H26){if(H26 instanceof Function){H26=H26.prototype;}
this.prototype.extend(H26);}
var Base=HClass;ie_htc_path=null;function ie_early_fixes(){var b=navigator.appName;var ua=navigator.userAgent.toLowerCase();var _opera=ua.indexOf("opera")>-1;if(!_opera&&b=="Microsoft Internet Explorer"){var _script=document.scripts[document.scripts.length-1];var _src=_script.src;ie_htc_path=_src.substring(0,_src.lastIndexOf("/")+1);}}
ie_early_fixes();is_safari=navigator.userAgent.toLowerCase().indexOf("safari")>-1;is_ie=!(navigator.userAgent.toLowerCase().indexOf("opera")>-1)&&navigator.appName=="Microsoft Internet Explorer";Event=HClass.extend({constructor:null,element:function(e){return e.target||e.srcElement;},pointerX:function(e){return e.pageX||e.clientX+document.documentElement.scrollLeft;},pointerY:function(e){return e.pageY||e.clientY+document.documentElement.scrollTop;},stop:function(e){if(e.preventDefault){e.preventDefault();e.stopPropagation();}else{e.returnValue=false;e.cancelBubble=true;}},isLeftClick:function(e){if(is_ie||is_safari){return(e.button==1);}else{return(e.button==0);}},observers:false,_observeAndCache:function(Hc,Hd,_function,_useCapture){if(!Event.observers){Event.observers=[];}
if(Hc.addEventListener){this.observers.push([Hc,Hd,_function,_useCapture]);Hc.addEventListener(Hd,_function,_useCapture);}else if(Hc.attachEvent){this.observers.push([Hc,Hd,_function,_useCapture]);Hc.attachEvent("on"+Hd,_function);}},unloadCache:function(){if(!Event.observers){return;}
var i,l=Event.observers.length;for(i=0;i<l;i++){Event.stopObserving.apply(this,Event.observers[0]);}
Event.observers=false;},observe:function(Hc,Hd,_function,_useCapture){if(typeof Hc=="string"){Hc=document.getElementById(Hc);}
_useCapture=_useCapture||false;Event._observeAndCache(Hc,Hd,_function,_useCapture);},stopObserving:function(Hc,Hd,_function,_useCapture){if(typeof Hc=="string"){Hc=document.getElementById(Hc);}
_useCapture=_useCapture||false;if(Hc.removeEventListener){Hc.removeEventListener(Hd,_function,_useCapture);}else if(detachEvent){try{element.detachEvent("on"+name,_function);}catch(e){}}
var i=0;while(i<Event.observers.length){var eo=Event.observers[i];if(eo&&eo[0]==Hc&&eo[1]==Hd&&eo[2]==_function&&eo[3]==_useCapture){Event.observers[i]=null;Event.observers.splice(i,1);}else{i++;}}},KEY_BACKSPACE:8,KEY_TAB:9,KEY_RETURN:13,KEY_ESC:27,KEY_LEFT:37,KEY_UP:38,KEY_RIGHT:39,KEY_DOWN:40,KEY_DELETE:46,KEY_HOME:36,KEY_END:35,KEY_PAGEUP:33,KEY_PAGEDOWN:34});if(is_ie){Event.observe(window,"unload",Event.unloadCache,false);}
is_ie=!(navigator.userAgent.toLowerCase().indexOf("opera")>-1)&&navigator.appName=="Microsoft Internet Explorer";Array.prototype.toQueryString=function(){var i,l=this.length;var _array=[];for(i=0;i<l;i++){_array.push(encodeURIComponent(this[i].key)+"="+
encodeURIComponent(this[i].value));}
return _array.join("&");}
Ajax=HClass.extend({constructor:null,getTransport:function(){if(window.XMLHttpRequest){return new XMLHttpRequest();}else if(is_ie){if(ScriptEngineMajorVersion()>=5){return new ActiveXObject("Msxml2.XMLHTTP");}else{return new ActiveXObject("Microsoft.XMLHTTP");}}else{return false;}}});Ajax.Request=HClass.extend({constructor:function(HC,H1){this.transport=Ajax.getTransport();if(!H1){H1={};}
var HJ=HClass.extend({method:"post",asynchronous:true,contentType:"application/x-www-form-urlencoded",encoding:"UTF-8",parameters:""});HJ=HJ.extend(H1);this.options=new HJ();this.request(HC);},request:function(HC){this.url=HC;if(this.options.method=="get"&&this.options.parameters.length){this.url+=(this.url.indexOf("?")>=0?"&":"?")+this.options.parameters.toQueryString();}
this.transport.open(this.options.method.toUpperCase(),this.url,this.options.asynchronous,this.options.username,this.options.password);var Hg=this;this.transport.onreadystatechange=function(){Hg.onStateChange()};this.setRequestHeaders();var _body=this.options.method=="post"?(this.options.postBody||this.options.parameters.toQueryString()):null;this.transport.send(_body);if(!this.options.asynchronous&&this.transport.overrideMimeType){this.onStateChange();}},setRequestHeaders:function(){var headers={};if(this.options.method=="post"){headers["Content-type"]=this.options.contentType+
(this.options.encoding?"; charset="+this.options.encoding:"");if(this.transport.overrideMimeType&&(navigator.userAgent.match(/Gecko\/(\d{4})/)||[0,2005])[1]<2005){headers["Connection"]="close";}}
var o;for(o in headers){this.transport.setRequestHeader(o,headers[o]);}},onStateChange:function(){var _readyState=this.transport.readyState;if(_readyState>1){this.respondToReadyState(_readyState);}},respondToReadyState:function(_readyState){if(_readyState==4){try{(this.options["on"+(this.success()?"Success":"Failure")]||(function(){}))(this.transport);}catch(e){}}
if(_readyState==4){this.transport.onreadystatechange=function(){};}},success:function(){return!this.transport.status||(this.transport.status>=200&&this.transport.status<300);}});