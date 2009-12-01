
HClass=function(){if(arguments.length){if(this===window){HClass.prototype.extend.call(arguments[0],arguments.callee.prototype);}
else{this.extend(arguments[0]);}}};HClass.prototype={extend:function(_r0,_1){var _c0=HClass.prototype.extend;if(arguments.length===2){var _s3=this[_r0];if((_s3 instanceof Function)&&(_1 instanceof Function)&&_s3.valueOf()!==_1.valueOf()&&(/\bbase\b/).test(_1)){var _f0=_1;_1=function(){var _s6=this.base;this.base=_s3;var _t6=_f0.apply(this,arguments);this.base=_s6;return _t6;};_1.valueOf=function(){return _f0;};_1.toString=function(){return String(_f0);};}
return this[_r0]=_1;}else if(_r0){var _g0={toSource:null};var _i4=["toString","valueOf"];if(HClass._c3){_i4.push("constructor");}
for(var i=0;(_i=_i4[i]);i++){if(_r0[_i]!==_g0[_i]){_c0.call(this,_i,_r0[_i]);}}
for(var _i in _r0){if(!_g0[_i]){_c0.call(this,_i,_r0[_i]);}}}
this.nu=function(){return new(this.extend({constructor:function(args){this.base.apply(this,args);}}))(arguments);};return this;},base:function(){}};HClass.extend=function(_Q,_b3){var _c0=HClass.prototype.extend;if(!_Q){_Q={};}
HClass._c3=true;var _g0=new this;_c0.call(_g0,_Q);var _j1=_g0.constructor;_g0.constructor=this;delete HClass._c3;var _O0=function(){if(!HClass._c3){_j1.apply(this,arguments);}
this.constructor=_O0;};_O0.prototype=_g0;_O0.extend=this.extend;_O0.implement=this.implement;_O0.toString=function(){return String(_j1);};_c0.call(_O0,_b3);var _93=(_j1!==null)?_O0:_g0;if(_93.init instanceof Function){_93.init();}
return _93;};HClass.implement=function(_q1){if(_q1 instanceof Function){_q1=_q1.prototype;}
this.prototype.extend(_q1);};var Base=HClass;if([]['indexOf']===undefined){Object.extend=function(destination,source){for(property in source){destination[property]=source[property];}
return destination;};Object.extend(Array.prototype,{indexOf:function(_u6){var i=0,l=this.length;for(;i<l;i++){if(this[i]===_u6){return i;}}
return-1;}});}
try{if(window['console']===undefined){console={log:function(){}};}}catch(e){}
ELEMTickerInterval=10;BROWSER_TYPE={ie:false,ie6:false,ie7:false,ie8:false,opera:false,safari:false,symbian:false,chrome:false,firefox:false,firefox2:false,firefox3:false};ELEM={_j1:function(){var _0=ELEM;_0._P1=false;_0._92=[];_0._Q2=null;_0._I3=false;_0._I6=false;_0._o9=0;_0._g9=0;_0._f9=0;_0._J6=0;_0._K6=0;_0._S3=0;_0._hb=0;_0._L6=0;_0._25=0;_0._M6=0;_0._D3=500;_0._T1=null;_0._h1=ELEMTickerInterval;_0._Q1=false;_0._x3=false;_0._L2=1;_0._u=[];if(_0._P1){_0._W={_e9:[]};}else{_0._M5=[];}
_0._O1={};_0._h0={};_0._e0={};_0._A0={};_0._N0=[];_0._X0={};_0._d9=",ADDRESS,BLOCKQUOTE,CENTER,DIR,DIV,DL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,ISINDEX,MENU,NOFRAMES,NOSCRIPT,OL,P,PRE,TABLE,UL,";},_Va:function(_N6,_E){if(!ELEM._P1){return;}
var _0=ELEM,i=0,_O6=[],_W=_0._P6(_E),_L0=_W._L0;for(;i!==_N6;i++){_O6.push(_0.make(_L0,_E));}
for(i=0;i!==_N6;i++){_0.del(_O6[i]);}},_C5:function(_5){var _2,_0=ELEM,_u=_0._u,_c9=(_0._M5.length!==0);if(_c9){_2=_0._M5.pop();_u[_2]=_5;}
else{_u.push(_5);_2=_u.length-1;}
return _2;},_22:function(_2){var _0=ELEM;_0._h0[_2]=[];_0._O1[_2]={};_0._e0[_2]=[];_0._A0[_2]={};_0._X0[_2]=false;},bindId:function(_Q6){var _0=ELEM,_5=document.getElementById(_Q6),_6=_0._C5(_5);_0._22(_6);return _6;},bind:function(_5){var _0=ELEM,_2=_0._C5(_5);_0._22(_2);return _2;},_Ra:function(_2,_5){var _0=ELEM;_0._u[_2]=_5;},get:function(_2){return ELEM._u[_2];},setHTML:function(_2,_02){try{var _0=ELEM;if(!_0._u[_2]){return;}
if(!((typeof _02==='string')||(typeof _02==='number'))){return;}
_0._u[_2].innerHTML=_02;}catch(e){}},getHTML:function(_2){try{var _0=ELEM;if(_0._u[_2]){return _0._u[_2].innerHTML;}}catch(e){}
return'';},_P6:function(_E){if(!ELEM._P1){return null;}
var _0=ELEM,_W=_0._W;if(!_W[_E]){_W._e9.push(_E);_W[_E]=[];_W[_E]._b9=1;_W[_E]._a9=0;_W[_E]._L0=_0.make(_0._L0,'div');}
return _W[_E]._L0;},del:function(_2){var _0=ELEM,_5=_0._u[_2];if(_0._Q1){_0.del(_2);}
_0._Q1=true;if(_0._P1){var _E=_5.tagName,_L0=_0._P6(_E),_W=_0._W[_E];_0.append(_2,_L0);}
var _R6=_0._N0.indexOf(_2);if(_R6!==-1){_0._N0.splice(_R6,1);}
_0._22(_2);if(_0._P1){_W._b9++;_W.push(_2);}else{_0._M5.push(_2);var _S6=_5.parentNode;if(_S6!==null){_S6.removeChild(_5);}
_5=null;_0._u[_2]=null;}
_0._Q1=false;},append:function(_T6,_y1){var _0=ELEM,_r0=_0._u[_T6],_89=_0._u[_y1];_89.appendChild(_r0);},setCSS:function(_2,_C0){ELEM._u[_2].style.cssText=_C0;},getCSS:function(_2){return ELEM._u[_2].style.cssText;},getVisibleSize:function(_2){var _z2,_0=ELEM,_5=_0._u[_2],w=_5.offsetWidth,h=_5.offsetHeight,_h=_5.parentNode;while(_h&&_h.nodeName.toLowerCase()!=='body'){if(!_0._I0){_z2=document.defaultView.getComputedStyle(_h,null).getPropertyValue('overflow');}
else{_z2=_h.currentStyle.getAttribute('overflow');}
_z2=_z2!=='visible';if(w>_h.clientWidth&&_z2){w=_h.clientWidth-_5.offsetLeft;}
if(h>_h.clientHeight&&_z2){h=_h.clientHeight-_5.offsetTop;}
_5=_5.parentNode;_h=_5.parentNode;}
return[w,h];},getSize:function(_2){var _0=ELEM,_5=_0._u[_2],w=_5.offsetWidth,h=_5.offsetHeight;return[w,h];},getScrollSize:function(_2){var _0=ELEM,_5=_0._u[_2],w=_5.scrollWidth,h=_5.scrollHeight;return[w,h];},getVisiblePosition:function(_2){var _0=ELEM,x=0,y=0,_5=_0._u[_2];while(_5!==document){x+=_5.offsetLeft;y+=_5.offsetTop;x-=_5.scrollLeft;y-=_5.scrollTop;_5=_5.parentNode;if(!_5){break;}}
return[x,y];},getOpacity:function(_2){var _30,_v5,_0=ELEM,_t5=_0.getStyle;if(_30===_t5(_2,'-khtml-opacity')){return parseFloat(_30);}
if(_30===_t5(_2,'-moz-opacity')){return parseFloat(_30);}
_v5=_t5(_2,'opacity',true);if(_30===_v5||(_v5===0)){return parseFloat(_30);}
if(_30===(_0._u[_2].currentStyle['filter']||'').match(/alpha(opacity=(.*))/)){if(_30[1]){return parseFloat(_30[1])/100;}}
return 1.0;},setOpacity:function(_2,_30){var _0=ELEM;if(_30===1&&_0._t1){_0._u[_2].style.setAttribute('filter',_0.getStyle(_2,'filter',true).replace(/alpha([^)]*)/gi,''));}
else{if(_30<0.01){_30=0;}
if(_0._t1){_0._u[_2].style.setAttribute('filter',_0.getStyle(_2,'filter',true).replace(/alpha([^)]*)/gi,'')+'alpha(opacity='+_30*100+')');}
else if(_0._I0){(_0._u[_2].style.setAttribute('opacity',_30));}
else{_0._u[_2].style.setProperty('opacity',_30,'');}}},getIntStyle:function(_2,_7){var _1=ELEM.getStyle(_2,_7);return parseInt(_1,10);},setBoxCoords:function(_2,_t0){ELEM.setStyle(_2,'left',_t0[0]+'px');ELEM.setStyle(_2,'top',_t0[1]+'px');ELEM.setStyle(_2,'width',_t0[2]+'px');ELEM.setStyle(_2,'height',_t0[3]+'px');},getExtraWidth:function(_2){var _i1=ELEM.getIntStyle;return _i1(_2,'padding-left')+_i1(_2,'padding-right')+_i1(_2,'border-left-width')+_i1(_2,'border-right-width');},getExtraHeight:function(_2){var _i1=ELEM.getIntStyle;return _i1(_2,'padding-top')+_i1(_2,'padding-bottom')+_i1(_2,'border-top-width')+_i1(_2,'border-bottom-width');},setFPS:function(_V0){var _0=ELEM;_0._h1=1000/_V0;if(_0._h1<ELEMTickerInterval){_0._h1=ELEMTickerInterval;}},setSlowness:function(_L2){ELEM._L2=_L2;},setIdleDelay:function(_D3){ELEM._D3=_D3;},_B2:false,flushLoop:function(_P0){var _0=ELEM;_0._S3++;if(_0._t1&&(_0._S3%5===0)&&_0._B2){iefix._F3();_0._B2=false;}
clearTimeout(_0._T1);if(_0._Q1){_P0*=2;_0._T1=setTimeout(function(){ELEM.flushLoop(_P0);},_P0);return;}else{if(!_0._x3){if(_0._t1&&_0._B2){iefix._F3();_0._B2=false;}
_0._T1=setTimeout(function(){ELEM.flushLoop(_P0);},_0._D3);return;}
_P0=parseInt(_0._L2*(_0._25/_0._M6),ELEMTickerInterval);if(_P0<_0._h1||!_P0){_P0=_0._h1;}
_0._Q1=true;_0._T1=setTimeout(function(){ELEM.flushLoop(_P0);},_P0);}
_0._25-=new Date().getTime();var i,_2,_N0=_0._N0,_U6=_N0.length,_m1=_N0.splice(0,_U6),_eb=new Date().getTime();for(i=0;i<_U6;i++){_0._cb++;_2=_m1.pop();_0._X0[_2]=false;_0._q5(_2);_0._79(_2);}
_0._M6++;_0._25+=new Date().getTime();if(_0._N0.length===0&&_0._x3){_0._x3=false;}
_0._Q1=false;},_79:function(_2){var _0=ELEM,_e0=_0._e0[_2],_A0=_0._A0[_2],_5=_0._u[_2],_7,_U1,i,_V6=_e0.length,_m1=_e0.splice(0,_V6);for(i=0;i!==_V6;i++){_7=_m1.pop();_U1=_A0[_7];_5.setAttribute(_7,_U1);}},getAttr:function(_2,_7,_T){var _0=ELEM,_W6=_0._A0[_2][_7],_U1;if(_W6!==undefined&&!_T){return _W6;}
var _5=_0._u[_2];if(_5.getAttribute(_7)===null){_5[_7]='';}
_U1=_5.getAttribute(_7);_0._A0[_2][_7]=_U1;return _U1;},setAttr:function(_2,_7,_1,_T){var _0=ELEM,_e0=_0._e0[_2],_A0=_0._A0[_2],_52=_1!==_0.getAttr(_2,_7);if(_52){_A0[_7]=_1;if(_T){_0._u[_2].setAttribute(_7,_1);}
else{if(_e0.indexOf(_7)===-1){_e0.push(_7);}
if(!_0._X0[_2]){_0._N0.push(_2);_0._X0[_2]=true;_0._m5();}}}},delAttr:function(_2,_7){var _52,_0=ELEM,_e0=_0._e0[_2],_A0=_0._A0[_2];delete _A0[_7];_0._u[_2].removeAttribute(_7);if(_e0.indexOf(_7)!==-1){_e0.splice(_e0.indexOf(_7,1));}
if(_0._X0[_2]){_0._N0.splice(_0._N0.indexOf(_2,1));_0._X0[_2]=false;_0._m5();}},hasClassName:function(_6,_G){var _d=ELEM.get(_6);if(!_d){return null;}
var _71=_d.className.split(' ');return(_71.indexOf(_G)!==-1);},addClassName:function(_6,_G){var _0=ELEM,_d=_0.get(_6);if(!_d){return;}
if(_d.className===''||_d.className===' '){_d.className=_G;}
else{var _71=_d.className.split(' '),_x=_71.indexOf(_G);if(_x===-1){_71.push(_G);_d.className=_71.join(' ');}}},removeClassName:function(_6,_G){var _0=ELEM,_d=_0.get(_6);if(!_d){return;}
if(!_0.hasClassName(_6,_G)){return;}
var _71=_d.className.split(' '),_x=_71.indexOf(_G);if(_x!==-1){_71.splice(_x,1);_d.className=_71.join(' ');}},_m5:function(){var _0=ELEM;if(!_0._x3){_0._x3=true;if(!_0._Q1){clearTimeout(_0._T1);_0._T1=setTimeout(function(){ELEM.flushLoop(ELEM._h1);},_0._h1);}}},setStyle:function(_2,_7,_1,_T){var _0=ELEM,_I=_0._O1[_2],_X6=_0._u,_52,_h0;_0._g9++;if(_I===undefined){_0._22(_2);_I=_0._O1[_2];}
_52=_1!==_I[_7];if(_52){_0._f9++;_I[_7]=_1;if(_T){if(_7==='opacity'){_0.setOpacity(_2,_1);}
else{if(_0._I0){var _R3=_7.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;});_X6[_2].style[_R3]=_I[_7];}
else{_X6[_2].style.setProperty(_7,_I[_7],'');}}
if(_0._t1){if(iefix._Z5.indexOf(_7)!==-1){_0._B2=true;}}}
else{_X0=_0._X0;_h0=_0._h0[_2];if(_h0.indexOf(_7)===-1){_h0.push(_7);}
if(!_X0[_2]){_0._N0.push(_2);_X0[_2]=true;_0._m5();}}}},make:function(_y1,_E){if(_y1===undefined){_y1=0;}
if(_E===undefined){_E='DIV';}else{_E=_E.toUpperCase();}
var _0=ELEM,_5,_2;_0._o9++;if(_0._P1){if(_0._W[_E]){if(_0._W[_E].length!==0){_2=_0._W[_E].pop();_0._W[_E]._a9++;_5=_0._u[_2];if(_0._d9.indexOf(','+_E+',')!==-1){_0.setCSS(_2,'display:block;');}else{_0.setCSS(_2,'display:inline;');}
_0.append(_2,_y1);return _2;}}}
_5=document.createElement(_E);_0._u[_y1].appendChild(_5);_2=_0._C5(_5);_0._22(_2);return _2;},windowSize:function(){return[(window.innerWidth)?window.innerWidth:document.documentElement.clientWidth,(window.innerHeight)?window.innerHeight:document.documentElement.clientHeight];},getStyle:function(_2,_7,_T){var _0=ELEM,_I=_0._O1[_2],_I1;_0._J6++;if((_I[_7]===undefined)||_T){if(!_T){_0._K6++;}
if((_7==='opacity')&&_T){_I1=_0.getOpacity(_2);}
else{_I1=document.defaultView.getComputedStyle(_0._u[_2],null).getPropertyValue(_7);}
_I[_7]=_I1;}
return _I[_7];},_19:function(_2,_7,_T){var _0=ELEM,_I=_0._O1[_2],_I1;_0._J6++;if((_I[_7]===undefined)||_T){if(!_T){_0._K6++;}
if((_7==='opacity')&&_T){_I1=_0.getOpacity(_2);}
else{_09=_7.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;});_0._u[_2].currentStyle[_09];}
_I[_7]=_I1;}
return _I[_7];},_q5:function(_2){var _0=ELEM,_h0=_0._h0[_2],_I=_0._O1[_2],_5=_0._u[_2],_d3,_H2,_f5,_7,_m1,_I1;if(!_5){return;}
_d3=_5.style;_H2=_h0.length;_m1=_h0.splice(0,_H2);for(_f5=0;_f5!==_H2;_f5++){_7=_m1.pop();_0._L6++;if(_7==='opacity'){_I1=_0.setOpacity(_2,_I[_7]);}
else{_d3.setProperty(_7,_I[_7],'');}}},_Z8:function(_2){var _0=ELEM,_h0=_0._h0[_2],_I=_0._O1[_2],_5=_0._u[_2];if(!_5){return;}
var _d3=_5.style,_H2=_h0.length,i=0,_7,_m1=_h0.splice(0,_H2);for(;i!==_H2;i++){_7=_m1.pop();_0._L6++;if(_7==='opacity'){_0.setOpacity(_2,_I[_7]);}
else{if(_0._t1){if(iefix._Z5.indexOf(_7)!==-1){_0._B2=true;}}
try{var _R3=_7.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;});_d3.setAttribute(_R3,_I[_7]);}
catch(e){console.log(e);}}}},_Y6:function(){var _0=ELEM,_g1,_40,_85;if(_0._I0){ELEM.getStyle=_0._19;}
if(_0._I0){ELEM._q5=_0._Z8;}
_0.bind(document.body);if(_0._P1){_0._L0=_0.make(0,'div');_0.setCSS(_0._L0,"display:none;visibility:hidden;");_0.setAttr(_0._L0,'id','trashcan_'+_0._L0);}
_0._T1=setTimeout(function(){ELEM.flushLoop(ELEM._h1);},_0._h1);if(!_0._92){return;}
while(_0._92.length!==0){_g1=_0._92.shift();_40=(typeof _g1);if(_40==='function'){_g1.call();}
else if(_40==='string'){_85=eval(_g1);if(typeof _85==='string'){_0._92.push(_85);}}}
_0._I6=true;},_X8:function(){var _0=ELEM,_Q0=navigator.userAgent,_T3=(document.all&&_Q0.indexOf("Opera")===-1),_U3=[['opera','_5b',_Q0.indexOf("Opera")!==-1],['safari','_W8',_Q0.indexOf("KHTML")!==-1],['symbian','_2b',_Q0.indexOf("SymbianOS")!==-1],['chrome','_1b',_Q0.indexOf("Chrome")!==-1],['ie','_I0',_T3],['ie6','_t1',_T3&&_Q0.indexOf("MSIE 6")!==-1],['ie7','_0b',_T3&&_Q0.indexOf("MSIE 7")!==-1],['ie8','_fb',_T3&&_Q0.indexOf("MSIE 8")!==-1],['firefox','_9b',_Q0.indexOf("Firefox")!==-1],['firefox2','_8b',_Q0.indexOf("Firefox/2.")!==-1],['firefox3','_kb',_Q0.indexOf("Firefox/3.")!==-1]],i=0,_Z6,_07,_L5;for(;i<_U3.length;i++){_Z6=_U3[i][0];_07=_U3[i][1];_L5=_U3[i][2];BROWSER_TYPE[_Z6]=_L5;_0[_07]=_L5;}
_0._17();},_Ca:function(_g1){var _0=ELEM,_40=(typeof _g1);if(_0._I6===true){if(_40==='string'){eval(_g1);}
else if(_40==='function'){_g1.call();}}else{_0._92.push(_g1);}},_17:function(){var _gb=false,_0=ELEM;if(_0._I0){var _27="javascript:void(0)";if(location.protocol==="https:"){_27="src=//0";}
document.write("<scr"+"ipt id=_za defer src="+_27+"></scr"+"ipt>");var _ua=document.getElementById("_za");_ua.onreadystatechange=function(){if(this.readyState==="complete"){ELEM._I3=true;ELEM._Y6();delete ELEM._92;clearTimeout(ELEM._Q2);delete ELEM._Q2;}};return;}
else if((/KHTML|WebKit/i.test(navigator.userAgent))&&(/loaded|complete/.test(document.readyState))){_0._I3=true;}
else if(document.body){_0._I3=true;}
if(!_0._I3){_0._Q2=setTimeout('ELEM._17()',ELEMTickerInterval*10);}else{_0._Y6();delete _0._92;clearTimeout(_0._Q2);delete _0._Q2;}}};ELEM._j1();LOAD=ELEM._Ca;ELEM._X8();Event={element:function(e){return e.target||e.srcElement;},pointerX:function(e){return e.pageX||e.clientX+document.documentElement.scrollLeft;},pointerY:function(e){return e.pageY||e.clientY+document.documentElement.scrollTop;},stop:function(e){if(e.preventDefault){e.preventDefault();e.stopPropagation();}
else{e.returnValue=false;e.cancelBubble=true;}},isLeftClick:function(e){if(ELEM._I0||ELEM._W8){return(e.button===1);}
else{return(e.button===0);}},observers:false,_qa:function(_5,_i,_C,_z0){if(!Event.observers){Event.observers=[];}
if(_5.addEventListener){this.observers.push([_5,_i,_C,_z0]);_5.addEventListener(_i,_C,_z0);}
else if(_5.attachEvent){this.observers.push([_5,_i,_C,_z0]);_5.attachEvent("on"+_i,_C);}},unloadCache:function(){if(!Event.observers){return;}
var i,l=Event.observers.length;for(i=0;i<l;i++){Event.stopObserving.apply(this,Event.observers[0]);}
Event.observers=false;},observe:function(_5,_i,_C,_z0){_z0=_z0||false;Event._qa(_5,_i,_C,_z0);},stopObserving:function(_5,_i,_C,_z0){if(_5===undefined){console.log('Warning Event.stopObserving of event name: "'+_i+'" called with an undefined elem!');return;}
_z0=_z0||false;if(_5['removeEventListener']){_5.removeEventListener(_i,_C,_z0);}
else if(detachEvent){_5.detachEvent("on"+_i,_C);}
var i=0;while(i<Event.observers.length){var eo=Event.observers[i];if(eo&&eo[0]===_5&&eo[1]===_i&&eo[2]===_C&&eo[3]===_z0){Event.observers[i]=null;Event.observers.splice(i,1);}
else{i++;}}},KEY_BACKSPACE:8,KEY_TAB:9,KEY_RETURN:13,KEY_ESC:27,KEY_LEFT:37,KEY_UP:38,KEY_RIGHT:39,KEY_DOWN:40,KEY_DELETE:46,KEY_HOME:36,KEY_END:35,KEY_PAGEUP:33,KEY_PAGEDOWN:34};if(ELEM._I0){Event.observe(window,"unload",Event.unloadCache,false);}
_37={mouseMove:false,mouseDown:false,click:false,mouseUp:false,draggable:false,droppable:false,keyDown:false,keyUp:false,mouseWheel:false,textEnter:false};EVENT={status:[false,false,0,0,[],false,false,false],button1:0,button2:1,crsrX:2,crsrY:3,keysDown:4,altKeyDown:5,ctrlKeyDown:6,shiftKeyDown:7,enableDroppableChecks:true,startDroppable:function(){var _0=EVENT;_0.hovered=[];_0.hoverInterval=50;_0.hoverTimer=new Date().getTime();},start:function(){var _pa=ELEM._I0?document:window,_0=EVENT,_T5=[['mousemove',_0.mouseMove],['mouseup',_0.mouseUp],['mousedown',_0.mouseDown],['click',_0.click],['keyup',_0.keyUp],['keydown',_0.keyDown],['keypress',_0.keyPress],['contextmenu',_0.contextMenu],['resize',_0.resize],['mousewheel',_0.mouseWheel]],i=0;for(;i!==_T5.length;i++){Event.observe(_pa,_T5[i][0],_T5[i][1]);}
if(window.addEventListener){window.addEventListener('DOMMouseScroll',EVENT.mouseWheel,false);window.addEventListener('resize',EVENT.resize,false);}
_0.listeners=[];_0.focused=[];_0.resizeListeners=[];_0.coordListeners=[];_0.focusOptions={};_0.dragItems=[];if(_0.enableDroppableChecks){_0.startDroppable();}
_0.topmostDroppable=null;_0.textEnterCtrls=[];_0._s2=[];_0._oa=true;_0._47=null;_0.activeControl=null;_0._W5=null;},coordCacheFlush:function(_6){if(_6){EVENT._s2[_6]=null;}
else{EVENT._s2=[];}},reg:function(_a,_b1){var _6,_5,_0=EVENT,_04;_6=_a.elemId;_5=ELEM.get(_6);if(ELEM._I0){_5.setAttribute('ctrl',_a);}
else{_5.ctrl=_a;}
_0.listeners[_6]=true;_0.focused[_6]=false;for(_04 in _37){if(_b1[_04]===undefined){_b1[_04]=_37[_04];}}
_0.focusOptions[_6]=_b1;var _H5=_0.coordListeners.indexOf(_6);if(_b1.mouseMove){if(_H5===-1){_0.coordListeners.push(_6);}}
else if(_H5!==-1){_0.coordListeners.splice(_H5,1);}
if(_b1.textEnter){if(_0.textEnterCtrls.indexOf(_a.viewId)===-1){_0.textEnterCtrls.push(_a.viewId);}}
if(_b1.resize){if(_0.resizeListeners.indexOf(_a.viewId)===-1){_0.resizeListeners.push(_a.viewId);}}
Event.observe(_5,'mouseover',_0._r2);},unreg:function(_a){var _0=EVENT,_6,_5;if(_a===this.activeControl){_0.changeActiveControl(null);}
_6=_a.elemId;_5=ELEM.get(_6);this.listeners[_6]=false;this.focused[_6]=false;this._s2[_6]=null;var _57=_0.textEnterCtrls.indexOf(_a.viewId);if(_57!==-1){_0.textEnterCtrls.splice(_57,1);}
var _67=_0.resizeListeners.indexOf(_a.viewId);if(_67!==-1){_0.resizeListeners.splice(_67,1);}
if(_5!==undefined){Event.stopObserving(_5,'mouseover',_0._r2);}},resize:function(e){var i=0,_0=EVENT,_77,_a;for(;i<_0.resizeListeners.length;i++){_77=_0.resizeListeners[i];_a=HSystem.views[_77];if(_a['onResize']){_a.onResize();}}},_r2:function(e){if(!Event.element){return;}
var _t=Event.element(e);while(_t&&_t.ctrl===undefined){_t=_t.parentNode;}
if(!_t){return;}
var _0=_t.ctrl;EVENT.focus(_0);Event.stop(e);},_14:function(e){if(!Event.element){return;}
var _t=Event.element(e);while(_t&&_t.ctrl===undefined){_t=_t.parentNode;}
if(!_t){return;}
var _0=_t.ctrl;EVENT.blur(_0);Event.stop(e);},focus:function(_a){var _0=EVENT,_6=_a.elemId,_5=ELEM.get(_6);if(_0.focused[_6]===false&&_0.dragItems.indexOf(_6)===-1){Event.stopObserving(_5,'mouseover',_0._r2);Event.observe(_5,'mouseout',_0._14);_0.focused[_6]=true;if(_a['focus']){_a.focus();}}},blur:function(_a){var _0=EVENT,_6=_a.elemId,_5=ELEM.get(_6);if(_0.focused[_6]===true&&_0.dragItems.indexOf(_6)===-1){Event.stopObserving(_5,'mouseout',_0._14);Event.observe(_5,'mouseover',_0._r2);_0.focused[_6]=false;if(_a['blur']){_a.blur();}}},mouseMove:function(e){var _0=EVENT,x=Event.pointerX(e),y=Event.pointerY(e),_24=_0.flushMouseMove(x,y);_0.status[_0.crsrX]=x;_0.status[_0.crsrY]=y;_0._p2(e);if(_24){Event.stop(e);}},flushMouseMove:function(x,y){var _0=EVENT,_24=false,i=0,j,_6,_a;clearTimeout(_0._47);for(;i!==_0.dragItems.length;i++){_6=_0.dragItems[i];_0.focusOptions[_6].ctrl.drag(x,y);_0.coordCacheFlush(_6);_24=true;}
if(_0.enableDroppableChecks){if(new Date().getTime()>_0.hoverTimer+_0.hoverInterval){for(i=0;i!==_0.coordListeners.length;i++){_6=_0.coordListeners[i];_a=_0.focusOptions[_6].ctrl;_a.mouseMove(x,y);}
if(_0.enableDroppableChecks){_0._87();}
var _34;for(i=0;i!==_0.dragItems.length;i++){_34=_0.topmostDroppable;_0.topmostDroppable=null;_6=_0.dragItems[i];_a=_0.focusOptions[_6].ctrl;var _44,_o3;for(j=0;j!==_0.hovered.length;j++){_44=_0.hovered[j];if(_44!==_6&&_0.focusOptions[_44].ctrl){_o3=_0.focusOptions[_44].ctrl;if(!_0.topmostDroppable||_o3.zIndex()>_0.topmostDroppable.zIndex()||_o3.supr===_0.topmostDroppable){if(_0.focusOptions[_o3.elemId].droppable){_0.topmostDroppable=_o3;}}}}
if(_34!==_0.topmostDroppable){if(_34){_34.endHover(_a);}
if(_0.topmostDroppable){_0.topmostDroppable.startHover(_a);}}}
_0.hoverTimer=new Date().getTime();}
else{_0._47=setTimeout(function(){EVENT.flushMouseMove(x,y);},_0.hoverInterval);}}
return _24;},_87:function(){var _0=EVENT,x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],i=0,_a,_5,_K1,_o0,_t0;_0.hovered=[];for(;i!==_0.listeners.length;i++){if(!_0.listeners[i]||!_0.focusOptions[i].ctrl){continue;}
_a=_0.focusOptions[i].ctrl;_5=ELEM.get(i);if(!_0._oa||!_0._s2[i]){_K1=ELEM.getVisiblePosition(_a.elemId);_o0=ELEM.getVisibleSize(_a.elemId);_0._s2[i]=[_K1[0],_K1[1],_o0[0],_o0[1]];}
_t0=_0._s2[i];if(x>=_t0[0]&&x<=_t0[0]+_t0[2]&&y>=_t0[1]&&y<=_t0[1]+_t0[3]){_0.hovered.push(i);}}},startDragging:function(_a){var _0=EVENT;_0.dragItems.push(_a.elemId);_0.changeActiveControl(_a);_a.startDrag(_0.status[_0.crsrX],_0.status[_0.crsrY]);},mouseDown:function(e,_K0){var _0=EVENT,_97=false,x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],i=0,_a0=null,_64=[],_74=[];_0._p2(e);if(_K0===undefined){_K0=Event.isLeftClick(e);}
if(_K0){_0.status[_0.button1]=true;}
else{_0.status[_0.button2]=true;}
for(;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].ctrl.enabled){_a0=_0.focusOptions[i].ctrl;}
if((_0.focusOptions[i].draggable===true)&&_0.dragItems.indexOf(i)===-1){_64.push(i);}
else if(_0.focusOptions[i].mouseDown===true){_74.push(i);}}}
if(_a0){_0.changeActiveControl(_a0);}
for(i=0;i!==_64.length;i++){_0.dragItems.push(_64[i]);_0.focusOptions[_64[i]].ctrl.startDrag(x,y);_97=true;}
var _S2=_74.length;for(i=0;i!==_74.length;i++){if(_0.focusOptions[_74[i]].ctrl.mouseDown(x,y,_K0)){_S2--;}}
if(_97){document.body.focus();_0._na=document.onselectstart;document.onselectstart=function(){return false;};Event.stop(e);}
if(this.enableDroppableChecks){if((_S2===0)&&(_0.hovered.length!==0)&&(_a0&&(_a0.textElemId===false))){Event.stop(e);}}
return true;},click:function(e,_K0){var _0=EVENT,x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],i=0,_a0=null,_84=[];_0._p2(e);if(_K0===undefined){_K0=Event.isLeftClick(e);}
if(_K0){_0.status[_0.button1]=true;}
else{_0.status[_0.button2]=true;}
for(;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].ctrl.enabled){_a0=_0.focusOptions[i].ctrl;}
if(_0.focusOptions[i].click===true){_84.push(i);}}}
if(_a0){_0.changeActiveControl(_a0);}
var _S2=_84.length;for(i=0;i!==_84.length;i++){if(_0.focusOptions[_84[i]].ctrl.click(x,y,_K0)){_S2--;}}
if(_0.enableDroppableChecks){if((_S2===0)&&(_0.hovered.length!==0)&&(_a0&&(_a0.textElemId===false))){Event.stop(e);}}
return true;},changeActiveControl:function(_a){var _0=EVENT,_a3=_0.activeControl;if(_a!==_a3){if(_a3){_a3.active=false;_a3._a7(_a);}
_0.activeControl=null;if(_a){_a.active=true;_0.activeControl=_a;_a._b7(_a3);}}},mouseUp:function(e){var _0=EVENT,_c7=false,_K0=Event.isLeftClick(e),x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],_6,_a,i=0;_0._p2(e);_0.status[_0.button1]=false;_0.status[_0.button2]=false;for(;i!==_0.dragItems.length;i++){_6=_0.dragItems[i];_a=_0.focusOptions[_6].ctrl;_a.endDrag(x,y);_c7=true;if(_0.enableDroppableChecks){_0._87();if(_0.hovered.indexOf(_6)===-1){_0.blur(_a);}}
if(_0.topmostDroppable){_0.topmostDroppable.endHover(_a);_0.topmostDroppable.drop(_a);_0.topmostDroppable=null;}}
_0.dragItems=[];if(_c7){document.onselectstart=_0._na;}
for(i=0;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].mouseUp===true){_0.focusOptions[i].ctrl.mouseUp(x,y,_K0);}}}
return true;},keyDown:function(e){var _0=EVENT,_v1=e.keyCode;_0._p2(e);if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyDown===true){Event.stop(e);if(_0._W5!==_v1){_0.activeControl.keyDown(_v1);}}
if(_0.status[_0.keysDown].indexOf(_v1)===-1){_0.status[_0.keysDown].push(_v1);}
_0._W5=_v1;},keyUp:function(e){var _0=EVENT,_v1=e.keyCode,_c5,i=0,_V2,_a;_0._p2(e);_0._W5=null;if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyUp===true){_0.activeControl.keyUp(_v1);}
_c5=_0.status[_0.keysDown].indexOf(_v1);if(_c5!==-1){_0.status[_0.keysDown].splice(_c5,1);}
for(;i<_0.textEnterCtrls.length;i++){_V2=_0.textEnterCtrls[i];_a=HSystem.views[_V2];if(_a.textEnter){_a.textEnter();}}},keyPress:function(e){var _0=EVENT;if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyDown===true){Event.stop(e);}},mouseWheel:function(e){var _0=EVENT,_V=0,i=0;if(!e){e=window.event;}
if(e.wheelDelta){_V=0-(e.wheelDelta/120);}
else if(e.detail){_V=0-(e.detail/3);}
if(BROWSER_TYPE.opera){_V=0-_V;}
for(;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].mouseWheel===true){Event.stop(e);_0.focusOptions[i].ctrl.mouseWheel(_V);}}}},contextMenu:function(e){EVENT.mouseDown(e,false);Event.stop(e);},_p2:function(e){var _0=EVENT;_0.status[_0.altKeyDown]=e.altKey;_0.status[_0.ctrlKeyDown]=e.ctrlKey;_0.status[_0.shiftKeyDown]=e.shiftKey;}};LOAD(function(){EVENT.start();});SHAClass=HClass.extend({constructor:function(_X){_X&&this.setChrsz(_X);},_e5:0,hexCase:function(){return this._e5;},setHexCase:function(_d7){this._e5=_d7;},_g5:"=",base64Pad:function(){return this._g5;},setBase64Pad:function(_e7){this._g5=_e7;},_X:8,chrsz:function(){return this._X;},setChrsz:function(_f7){this._X=_f7;},hexSHA1:function(_H0){var _0=this;return _0._g7(_0._F2(_0._E2(_H0),_H0.length*_0._X));},b64SHA1:function(_H0){var _0=this;return _0._l5(_0._F2(_0._E2(_H0),_H0.length*_0._X));},strSHA1:function(_H0){var _0=this;return _0._h7(_0._F2(_0._E2(_H0),_H0.length*_0._X));},hexHmacSHA1:function(_7,_s){var _0=this;return _0._g7(_0._n5(_7,_s));},b64HmacSHA1:function(_7,_s){var _0=this;return _0._l5(_0._n5(_7,_s));},strHmacSHA1:function(_7,_s){var _0=this;return _0._h7(_0._n5(_7,_s));},str2Base64:function(_p){var _0=this;return _0._l5(_0._E2(_p));},test:function(){return this.hexSHA1("abc")==="a9993e364706816aba3e25717850c26c9cd0d89d";},_F2:function(_n,_j0){var _0=this;_n[_j0>>5]|=0x80<<(24-_j0%32);_n[((_j0+64>>9)<<4)+15]=_j0;var _12=new Array(80),_42=1732584193,_d0=-271733879,_p0=-1732584194,_s0=271733878,_C2=-1009589776,i,_i7,_j7,_k7,_l7,_m7,j,_U0;for(i=0;i<_n.length;i+=16){_i7=_42;_j7=_d0;_k7=_p0;_l7=_s0;_m7=_C2;for(j=0;j<80;j++){if(j<16){_12[j]=_n[i+j];}
else{_12[j]=_0._s5(_12[j-3]^_12[j-8]^_12[j-14]^_12[j-16],1);}
_U0=_0._81(_0._81(_0._s5(_42,5),_0._ma(j,_d0,_p0,_s0)),_0._81(_0._81(_C2,_12[j]),_0._la(j)));_C2=_s0;_s0=_p0;_p0=_0._s5(_d0,30);_d0=_42;_42=_U0;}
_42=_0._81(_42,_i7);_d0=_0._81(_d0,_j7);_p0=_0._81(_p0,_k7);_s0=_0._81(_s0,_l7);_C2=_0._81(_C2,_m7);}
return[_42,_d0,_p0,_s0,_C2];},_ma:function(_U0,_d0,_p0,_s0){if(_U0<20){return(_d0&_p0)|((~_d0)&_s0);}
if(_U0<40){return _d0^_p0^_s0;}
if(_U0<60){return(_d0&_p0)|(_d0&_s0)|(_p0&_s0);}
return _d0^_p0^_s0;},_la:function(_U0){return(_U0<20)?1518500249:(_U0<40)?1859775393:(_U0<60)?-1894007588:-899497514;},_n5:function(_7,_s){var _0=this,_43=_0._E2(_7),_n7=new Array(16),_o7=new Array(16),i,_T0;if(_43.length>16){_43=_0._F2(_43,_7.length*_0._X);}
for(i=0;i<16;i++){_n7[i]=_43[i]^0x36363636;_o7[i]=_43[i]^0x5C5C5C5C;}
_T0=_0._F2(_n7.concat(_0._E2(_s)),512+_s.length*_0._X);return _0._F2(_o7.concat(_T0),512+160);},_81:function(_n,_j){var _p7=(_n&0xFFFF)+(_j&0xFFFF),_ka=(_n>>16)+(_j>>16)+(_p7>>16);return(_ka<<16)|(_p7&0xFFFF);},_s5:function(_q7,_r7){return(_q7<<_r7)|(_q7>>>(32-_r7));},_E2:function(_p){var _0=this,_Y2=[],_x5=(1<<_0._X)-1,_ia=_p.length*_0._X,i;for(i=0;i<_ia;i+=_0._X){_Y2[i>>5]|=(_p.charCodeAt(i/_0._X)&_x5)<<(32-_0._X-i%32);}
return _Y2;},_h7:function(_Y2){var _0=this,_p="",_x5=(1<<_0._X)-1,i,_z5=_Y2.length*32,_ha=32-_0._X;for(i=0;i<_z5;i+=_0._X){_p+=String.fromCharCode((_Y2[i>>5]>>>(_ha-i%32))&_x5);}
return _p;},_g7:function(_f1){var _0=this,_s7=_0._e5?"0123456789ABCDEF":"0123456789abcdef",_p="",i,_B5=_f1.length*4;for(i=0;i<_B5;i++){_p+=_s7.charAt((_f1[i>>2]>>((3-i%4)*8+4))&0xF)+
_s7.charAt((_f1[i>>2]>>((3-i%4)*8))&0xF);}
return _p;},_l5:function(_f1){var _0=this,_k1="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_p="",i,_B5=_f1.length*4,_t7,_u7,_db,_v7,j,_z5=_f1.length*32;for(i=0;i<_B5;i+=3){_t7=(((_f1[i>>2]>>8*(3-i%4))&0xFF)<<16);_u7=(((_f1[i+1>>2]>>8*(3-(i+1)%4))&0xFF)<<8);_fa=((_f1[i+2>>2]>>8*(3-(i+2)%4))&0xFF);_v7=(_t7|_u7|_fa);for(j=0;j<4;j++){if(i*8+j*6>_z5){_p+=_0._g5;}
else{_p+=_k1.charAt((_v7>>6*(3-j))&0x3F);}}}
return _p;}});SHA=SHAClass.nu(16);HSystem=HClass.extend({windowFocusBehaviour:1,constructor:null,apps:[],appPriorities:[],busyApps:[],freeAppIds:[],defaultInterval:10,defaultPriority:20,viewsZOrder:[],ticks:0,maxAppRunTime:5000,scheduler:function(){for(var _l=0;_l<this.apps.length;_l++){if(this.apps[_l]){if(!this.busyApps[_l]){if((this.ticks%this.appPriorities[_l])===0){if(HSystem.apps[_l]){HSystem.apps[_l]._K4();}}}}}
if(this._l1.length!==0){this._z6();}},ticker:function(){this.ticks++;this.scheduler();this._La=setTimeout(function(){HSystem.ticker();},this.defaultInterval);},addApp:function(_v0,_U){var _l;if(this.freeAppIds.length!==0){_l=this.freeAppIds.unshift();this.apps[_l]=_v0;}else{this.apps.push(_v0);_l=this.apps.length-1;}
_v0.parent=this;_v0.parents=[this];_v0.appId=_l;this.startApp(_l,_U);return _l;},startApp:function(_l,_U){if(_U===undefined){_U=this.defaultInterval;}
this.appPriorities[_l]=_U;this.busyApps[_l]=false;},stopApp:function(_l){this.busyApps[_l]=true;},reniceApp:function(_l,_U){this.appPriorities[_l]=_U;},killApp:function(_l,_O4){if(!_O4){var _A6=new Date().getTime();while(this.busyApps[_l]===true){if(new Date().getTime()>_A6+this.maxAppRunTime){break;}}}
this.busyApps[_l]=true;this.apps[_l].destroyAllViews();this.apps[_l]=null;this.freeAppIds.push(_l);},views:[],_K2:[],addView:function(_c){var _g2;if(this._K2.length===0){_g2=this.views.length;this.views.push(_c);}
else{_g2=this._K2.pop();this.views[_g2]=_c;}
return _g2;},delView:function(_e){this.views[_e]=null;this._K2.push(_e);},activeWindowId:0,windowFocus:function(_c){if(!_c){this.activeWindowId=0;return;}
var _q3=this.activeWindowId,_S=this.views,_e=_c.viewId;if(_S[_q3]){if(_S[_q3]["windowBlur"]){_S[_q3].windowBlur();}}
this.activeWindowId=_e;_c.bringToFront();_c.windowFocus();},_l1:[],updateZIndexOfChildren:function(_e){if(this._l1.indexOf(_e)===-1){this._l1.push(_e);}},_z6:function(){var j=0,_0=HSystem,_U4=this._l1,_B6=_U4.length;for(;j<_B6;j++){var _e=_U4.shift(),_S=((_e===null)?(_0.viewsZOrder):(_0.views[_e].viewsZOrder)),_C6=_S.length,_C1=ELEM.setStyle,_J3=_0.views,_V4,_c,_D6='elemId',_E6='z-index',i=0,_6;for(;i<_C6;i++){_V4=_S[i];_c=_J3[_V4];_6=_c[_D6];_C1(_6,_E6,i);}}}});LOAD(function(){HSystem.ticker();});HApplication=HClass.extend({componentBehaviour:['app'],constructor:function(_U,_f){this.viewId=null;this.views=[];this.markupElemIds=[];this.viewsZOrder=HSystem.viewsZOrder;HSystem.addApp(this,_U);if(_f){this.label=_f;}
else{this.label='ProcessID='+this.appId;}},buildParents:function(_e){var _c=HSystem.views[_e],i=0;_c.parent=this;_c.parents=[];for(;i<this.parents.length;i++){_c.parents.push(this.parents[i]);}
_c.parents.push(this);},addView:function(_c){var _e=HSystem.addView(_c);this.views.push(_e);this.buildParents(_e);this.viewsZOrder.push(_e);return _e;},removeView:function(_e){HSystem.views[_e].remove();},destroyView:function(_e){HSystem.views[_e].die();},die:function(){HSystem.killApp(this.appId,false);},destroyAllViews:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].die();}},_F6:function(){var i,_e,_c;for(i=0;i<this.views.length;i++){_e=this.views[i];_c=HSystem.views[_e];if((_c!==null)&&(_c['onIdle']!==undefined)){_c.onIdle();}}},_K4:function(){HSystem.busyApps[this.appId]=true;this.onIdle();this._F6();HSystem.busyApps[this.appId]=false;},onIdle:function(){}});COMM={_Ja:function(){alert("'ERROR: This web browser doesn't support XMLHttpRequest. Please upgrade; unable to continue.");},_r4:function(_0){if(_0.X.readyState===4){var _e2=_0.X.status,_s4='on'+_e2,_v6=((_e2>=200&&_e2<300)||(_e2===0));_0[_s4]?_0[_s4](_0):_v6?_0.onSuccess(_0):_0.onFailure(_0);}},_53:function(_u1){var i=0,_y0=_u1.length,_23='';for(;i<_y0;i++){_23+=encodeURIComponent(_u1[i]);_23+=(i===_y0-1)?'':(i%2===0)?'=':'&';}
return _23;},request:function(_y,_4){var _f2=COMM,_0=_4?_4:{},_f0=_4.method?_4.method.toUpperCase():'GET',_21=(_4.async===undefined)?true:_4.async,_u1=_4.params?_4.params:[],_13=_4.headers?_4.headers:{},_W0=_4.contentType?_4.contentType:'application/x-www-form-urlencoded',_w6=_4.charset?_4.charset:'UTF-8',_x6=_4.username?_4.username:null,_y6=_4.username?_4.password:null;if(!_4.onFailure){_0.onFailure=function(resp){console.log('No failure handler specified, response: ',resp);};}
if(!_4.onSuccess){_0.onSuccess=function(resp){console.log('No success handler specified, response: ',resp);};}
_0.url=_y;_0.options=_4;_0.X=_f2._X2();if(_f0==='GET'&&_u1.length!==0){_y+=((_y.indexOf('?')!==-1)?'&':'?')+_f2._53(_u1);}
if(!_21){console.log("WARNING: Synchronous "+_f0+" request to "+_y+", these will fail on the Symbian web browser.");}
_0.X.open(_f0,_y,_21,_x6,_y6);_0.X.onreadystatechange=function(){_f2._r4(_0);};if(_f0==='POST'){_13['Content-Type']=_W0+'; charset='+_w6;var _M3=_4.body?_4.body:'';for(var _J4 in _13){_0.X.setRequestHeader(_J4,_13[_J4]);}
_0.X.send(_M3);}
else if(_f0==='GET'){_0.X.send(null);}
if(!_21){_f2._r4(_0);}
return _0;}};if(window['XMLHttpRequest']!==undefined){COMM._X2=function(){return new XMLHttpRequest();};}
else if(BROWSER_TYPE.ie){COMM._X2=function(){return new ActiveXObject("Msxml2.XMLHTTP");};}
else{COMM._X2=function(){console.log("No XMLHttpRequest object types known. Can't Communicate.");return new COMM._Ma();};}
COMM.Queue=HApplication.extend({constructor:function(){this.commandQueue=[];this.paused=false;this.base(10);},onIdle:function(){!this.paused&&this.commandQueue.length!==0&&this.flush();},pause:function(){this.paused=true;},resume:function(){this.paused=false;this.flush();},STRINGS:{ERR:'COMM.Queue Error: ',JS_EXEC_FAIL:'Failed to execute the Javascript function: ',REASON:' Reason:'},flush:function(){var i=0,_q,_C,_B0,_j0=this.commandQueue.length;for(;i<_j0;i++){if(this.paused){break;}
_q=this.commandQueue.shift();try{if(typeof _q==='function'){_q.call();}
else{_C=_q[0];_B0=_q[1];_C.call(_ab);}}
catch(e){var _X4=this.STRINGS;console.log([_X4.ERR_PREFIX,_X4.JS_EXEC_FAIL,_q,_X4.REASON,e.description].join(''));}}},unshift:function(_C,_B0){if(_B0!==undefined){this.commandQueue.unshift([_C,_B0]);}
else{this.commandQueue.unshift(_C);}},push:function(_C,_B0){if(_B0!==undefined){this.commandQueue.push([_C,_B0]);}
else{this.commandQueue.push(_C);}},unshiftEval:function(_Y4,_B0){var _C;eval('_C = function(){'+_Y4+'}');this.unshift(_C);},pushEval:function(_Y4){var _C;eval('_C = function(){'+_Y4+'}');this.push(_C);}}).nu();COMM.Session=HClass.extend({constructor:function(){var _0=this;_0.sha=SHAClass.nu(8);_0.sha_key=_0.sha.hexSHA1(((new Date().getTime())*Math.random()*1000).toString());_0.ses_key='0:.o.:'+_0.sha_key;_0.req_num=0;},newKey:function(_u2){var _0=this,_w7=_0.sha.hexSHA1(_u2+_0.sha_key);_0.req_num++;_0.ses_key=_0.req_num+':.o.:'+_w7;_0.sha_key=_w7;}}).nu();COMM.Transporter=HApplication.extend({constructor:function(){var _0=this;this.serverLostMessage='Server Connection Lost: Reconnecting...';_0.label='Transporter';_0.url=false;_0.busy=false;_0.stop=true;_0._n2=false;_0._J5=false;_0._nb=false;_0.base(1);},onIdle:function(){this.sync();},poll:function(_aa){HSystem.reniceApp(this.appId,_aa);},getClientEvalError:function(){var _0=COMM.Transporter;return _0._J5?'&err_msg='+
COMM.Values._x7(_0._J5):'';},success:function(resp){var _0=COMM.Transporter;if(!resp.X.responseText){_0.failure(resp);return;}
var _j3=eval(resp.X.responseText),i=1,_0a=_j3.length,_u2=_j3[0],_Z9=COMM.Session,_F1=COMM.Queue;if(_u2===''){console.log('Invalid session, error message should follow...');}
else{_Z9.newKey(_u2);}
for(;i<_0a;i++){try{_F1.pushEval(_j3[i]);}
catch(e){console.log('clientError:'+e+" - "+e.description+' - '+_j3[i]);_0._J5=e+" - "+e.description+' - '+_j3[i];}}
if(_0._n2){_0._n2.die();_0._n2=false;}
_F1.push(function(){COMM.Transporter.flushBusy();});_F1.flush();},flushBusy:function(){var _0=COMM.Transporter;_0.busy=false;COMM.Values.tosync.length!==0&&_0.sync();},failMessage:function(_A2,_c4){var _0=COMM.Transporter,_F1=COMM.Queue;console.log('failMessage?');_0.stop=true;_F1.push(function(){jsLoader.load('default_theme');});_F1.push(function(){jsLoader.load('controls');});_F1.push(function(){jsLoader.load('servermessage');});_F1.push(function(){ReloadApp.nu(_A2,_c4);});},failure:function(_m0){var _0=COMM.Transporter;if(_m0.X.status===0){console.log(_0.serverLostMessage);if(!_0._n2){_0._n2=HView.extend({_y7:function(_m0){if(_m0!==undefined){this._z7=_m0;}
this._75++;return this;},_Y9:function(){this._A7++;var _m0=this._z7;COMM.request(_m0.url,_m0.options);},onIdle:function(){var _B7=new Date().getTime();this.bringToFront();if(this._75>0&&(this._A7!==this._75)&&(this._C7+2000<_B7)&&this._z7){this._C7=_B7;this._Y9();}
this.base();},_75:0,_A7:0,_C7:new Date().getTime(),die:function(){var _v0=this.app;HSystem.reniceApp(_v0.appId,this._X9);this.base();_v0.sync();},drawSubviews:function(){var _n0=[['padding-left','8px'],['background-color','#600'],['text-align','center'],['color','#fff'],['font-size','16px'],['opacity',0.85]],i=0;for(;i<_n0.length;i++){this.setStyle(_n0[i][0],_n0[i][1]);}
this.setHTML(this.app.serverLostMessage);this._X9=HSystem.appPriorities[this.appId];if(HSystem.appPriorities[this.appId]<10){HSystem.reniceApp(this.appId,10);}
this._b5=HView.extend({_D7:0,_b5:function(){var _55,_w=ELEM.getSize(this.parent.elemId)[0];this._D7++;if(this._D7%2===0){_55=HRect.nu(0,0,80,20);}
else{_55=HRect.nu(_w-80,0,_w,20);}
this.animateTo(_55,2000);},onAnimationEnd:function(){if(this.drawn){this._b5();}}}).nu([0,0,80,20],this).setStyle('background-color','#fff').setStyle('opacity',0.8)._b5();}}).nu([0,0,200,20,0,null],_0)._y7(_m0);}
else{_0._n2._y7();}}
else{_0.failMessage('Transporter Error','Transporter was unable to complete the synchronization request.');}},sync:function(){if(this.stop){return;}
if(this.busy){return;}
this.busy=true;var _0=this,_82=COMM.Values.sync(),_u2='ses_key='+COMM.Session.ses_key,_W9=_0.getClientEvalError(),_M3=[_u2,_W9,_82?'&values='+_82:''].join('');COMM.request(_0.url,{_0:_0,onSuccess:COMM.Transporter.success,onFailure:COMM.Transporter.failure,method:'POST',async:true,body:_M3});}}).nu();COMM.SessionWatcher=HApplication.extend({constructor:function(_E7,_V9){this.base(10,'SesWatcher');this.sesTimeoutValue=HVM.values[_V9];this.timeoutSecs=_E7;},onIdle:function(){if((new Date().getTime()-this.sesTimeoutValue.value)>this.timeoutSecs){this.sesTimeoutValue.set(new Date().getTime());}}});COMM.URLResponder=HApplication.extend({constructor:function(){this.urlMatchers=[];this.urlCallBack=[];this.defaultCallBack=null;this.prevCallBack=false;this.prevMatchStr='';this.base(1,'URLResponder');this.value=0;this.clientValue=HValue.nu(false,'');this.clientValue.bind(this);this.serverValue=false;},setDefaultResponder:function(_w1){this.defaultCallBack=_w1;},delResponder:function(_A3,_w1){_w1.hide();if(_w1===this.prevCallBack){this.prevCallBack=false;this.prevMatchStr='';}
var i=0,_C3,_f4;for(;i<this.urlMatchers.length;i++){_C3=this.urlMatchers[i].test(_A3);if(_C3){this.urlMatchers.splice(i,1);this.urlCallBack.splice(i,1);return 1;}}
return 0;},addResponder:function(_U9,_w1,_F7){this.urlMatchers.push(new RegExp(_U9));this.urlCallBack.push(_w1);this.checkMatch(this.value);if(_F7!==undefined){location.href=_F7;}},checkMatch:function(_A3){if(_A3===this.prevMatchStr){return 0;}
var i=0,_C3,_f4;for(;i<this.urlMatchers.length;i++){_C3=this.urlMatchers[i].test(_A3);if(_C3){_f4=this.urlCallBack[i];if(this.prevCallBack){this.prevCallBack.hide();}
_f4.show();this.prevCallBack=_f4;this.prevmatchStr=_A3;return 1;}}
if(this.defaultCallBack){if(this.prevCallBack){this.prevCallBack.hide();}
this.defaultCallBack.show();this.prevCallBack=this.defaultCallBack;}
return-1;},refresh:function(){var _1=this.value;if(_1.length===0){return;}
if(!this.serverValue&&this.valueObj.id!==this.clientValue.id){this.clientValue.die();}
if(location.href!==_1){location.href=_1;}
this.checkMatch(_1);},onIdle:function(){if(!this['valueObj']){return;}
var _G7=location.href;if(_G7!==this.valueObj.value){this.setValue(_G7);}}});LOAD(function(){COMM.URLResponder.implement(HValueResponder);COMM.urlResponder=COMM.URLResponder.nu();urlResponder=COMM.urlResponder;COMM.Transporter.url=HCLIENT_HELLO;COMM.Transporter.stop=false;COMM.Transporter.sync();});COMM.Values=HClass.extend({constructor:null,values:{},tosync:[],create:function(_2,_s){HValue.nu(_2,_s);},add:function(_2,_1){this.values[_2]=_1;},set:function(_2,_s){this.values[_2].set(_s);},s:function(_2,_s){var _0=this;_s=_0.decode(_s);_0.values[_2].set(_s);},del:function(_2){var _0=this,_82=_0.values,_1=_82[_2],_S=_1.views,_a5=_S.lengt,i=0,_c;for(;i<_a5;i++){_c=_S[i];_c.valueObj=HDummyValue.nu(0,_1.value);}
_1.views=[];delete _82[_2];},changed:function(_1){var _0=this;if(_0.tosync.indexOf(_1.id)===-1){_0.tosync.push(_1.id);var _H7=COMM.Transporter;if(!_H7.busy){_H7.sync();}}},_I7:['b','n','s'],type:function(_g){var _40=(typeof _g).slice(0,1);if(this._I7.indexOf(_40)!==-1){return _40;}
else if(_40==='o'){if(_g.constructor===Array){return'a';}
else if(_g.constructor===Object){return'h';}
else if(_g.constructor===Date){return'd';}
return false;}
return false;},_Q9:function(_W1){var _p='[',_D0=[],_j0=_W1.length,_0=this,_q,i=0;for(;i<_j0;i++){_q=_0.encode(_W1[i]);_D0.push(_q);}
_p+=_D0.join(',')+']';return _p;},_P9:function(_W1){var _D0=[],_j0=_W1.length,_0=this,_q,i=0;for(;i<_j0;i++){_q=_0.decode(_W1[i]);_D0.push(_q);}
return _D0;},_O9:function(_T0){var _p='{',_D0=[],_0=this,_7,_1;for(_7 in _T0){_1=_T0[_7];_D0.push(_0.encode(_7)+':'+_0.encode(_1));}
_p+=_D0.join(',')+'}';return _p;},_N9:function(_T0){var _D0={},_0=this,_7,_1;for(_7 in _T0){_1=_T0[_7];_D0[_0.decode(_7)]=_0.decode(_1);}
return _D0;},_M9:[[(/\\/g),'\\\\'],[(/\t/g),'\\t'],[(/\n/g),'\\n'],[(/\f/g),'\\f'],[(/\r/g),'\\r'],[(/"/g),'\\"']],_L9:function(_p){var _0=this,_J7=_0._M9,i=0,_j0=_J7.length,_D5,_v2,_M2,_D0='';for(;i<_j0;i++){_D5=_J7[i];_v2=_D5[0];_M2=_D5[1];_p=_p.replace(_v2,_M2);}
return'"'+_p+'"';},_x7:function(_p){var _S1;try{_S1=unescape(encodeURIComponent(_p));}
catch(e){_S1=_p;}
return _S1;},_N8:function(_p){var _S1;try{_S1=decodeURIComponent(escape(_p));}
catch(e){_S1=_p;}
return _S1;},encode:function(_g){var _p,_40,_0=this;if(_g===null){return'null';}
else if(_g!==undefined){_40=_0.type(_g);if(!_40){return'null';}
switch(_40){case'b':_p=String(_g);break;case'n':_p=String(_g);break;case's':_p=_0._L9(_0._x7(_g));break;case'd':_p='"@'+String(_g.getTime()/1000)+'"';break;case'a':_p=_0._Q9(_g);break;case'h':_p=_0._O9(_g);break;default:_p='null';break;}}
else{return'null';}
return _p;},decode:function(_S0){var _g,_40,_0=this;if(_S0!==null&&_S0!==undefined){_40=_0.type(_S0);if(!_40){return null;}
switch(_40){case'b':_g=_S0;break;case'n':_g=_S0;break;case's':_g=_0._N8(_S0);break;case'd':_g=_S0;break;case'a':_g=_0._P9(_S0);break;case'h':_g=_0._N9(_S0);break;default:_g=null;break;}}
else{return null;}
return _g;},clone:function(_g){var _q,_y2;if(_g instanceof Array){_y2=[];for(_q=0;_q<_g.length;_q++){_y2[_q]=this.clone(_g[_q]);}
return _y2;}
else if(_g instanceof Object){_y2={};for(_q in _g){_y2[_q]=this.clone(_g[_q]);}
return _y2;}
else{return _g;}},sync:function(){if(this.tosync.length===0){return false;}
var _K7={},_0=this,_82=_0.values,_L7=_0.tosync,_j0=_L7.length,i=0,_2,_1;for(;i<_j0;i++){_2=_L7.shift();_1=_82[_2].value;_K7[_2]=_1;}
return encodeURIComponent(_0.encode(_K7));}});HVM=COMM.Values;HValue=HClass.extend({constructor:function(_2,_1){this.id=_2;this.type='[HValue]';this.value=_1;this.views=[];if(_2){COMM.Values.add(_2,this);}},die:function(){for(var _R=0;_R<this.views.length;_R++){var _y3=this.views[_R];_y3.setValueObj(HDummyValue.nu());this.views.splice(_R,1);}
if(this.id){COMM.Values.del(this.id);}},set:function(_1){if(this.differs(_1)){this.value=_1;if(this.id){COMM.Values.changed(this);}
this.refresh();}},differs:function(_1){return(COMM.Values.encode(_1)!==COMM.Values.encode(this.value));},s:function(_1){this.value=_1;this.refresh();},get:function(){return this.value;},bind:function(_L){if(_L===undefined){throw("HValueBindError: responder is undefined!");}
if(this.views.indexOf(_L)===-1){this.views.push(_L);_L.setValueObj(this);}},unbind:function(_L){for(var _R=0;_R<this.views.length;_R++){var _y3=this.views[_R];if(_y3===_L){this.views.splice(_R,1);return;}}},release:function(_L){return this.unbind(_L);},refresh:function(){for(var _R=0;_R<this.views.length;_R++){var _L=this.views[_R];if(_L.value!==this.value){if(!_L._h4){_L._h4=true;_L.setValue(this.value);_L._h4=false;}}}}});COMM.JSLoader=HClass.extend({constructor:function(_G6){var _0=this;_0._o4=[];_0.uri=_G6;_0._Ha=false;},_H6:function(_0,_m0){console.log("failed to load js: "+_m0.url);},load:function(_H1){var _0=this;if((_0._o4.indexOf(_H1)!==-1)){return;}
COMM.Queue.pause();_0._o4.push(_H1);if(BROWSER_TYPE.ie||BROWSER_TYPE.symbian){_0._Oa=COMM.request(_0.uri+_H1+'.js',{onSuccess:function(_m0){COMM.Queue.unshiftEval(_m0.X.responseText);COMM.Queue.resume();},onFailure:_0._H6,method:'GET',async:true});}
else{var _J1=document.createElement('script');_J1.onload=function(){COMM.Queue.resume();};_J1.src=_0.uri+_H1+'.js';_J1.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(_J1);}}});JSLoader=COMM.JSLoader;LOAD(function(){COMM.jsLoader=COMM.JSLoader.nu(HCLIENT_BASE+'/js/');jsLoader=COMM.jsLoader;});COMM.JSONRenderer=HClass.extend({version:0.4,constructor:function(_s,_h){if((_s['type']==='GUITree')&&(this.version>=_s['version'])){this.data=_s;this.parent=_h;this.render();}
else{throw("JSONRenderer: Only GUITree version "+this.version+" or older data can be handled.");}},render:function(){this.scopes=[window];this.scopeDepth=0;this.view=this.renderNode(this.data,this.parent);},defineInScope:function(_l0){var _M7=(_l0 instanceof Array),_N7=(_l0 instanceof Object);if(_M7||!_N7){console.log("JSONRenderer; definition must be an Object, got: '"+(typeof _l0)+"'. Definition: ",_l0);return;}
var _B1={},_c2=['class','extend','implement'],_G=_l0[_c2[0]],_F4=_l0[_c2[1]],_A4=_l0[_c2[2]],_c0=_F4?this.findInScope(_F4):false,_w4=_A4?this.findInScope(_A4):false,_11=this.scopes[this.scopeDepth],_7,_1;if(_G===undefined){console.log("JSONRenderer; class name missing in definition scope.");return;}
if(!_c0){_c0=HClass;}
for(_7 in _l0){if(_c2.indexOf(_7)===-1){_1=_l0[_7];_B1[_7]=this.extEval(_1);}}
_11[_G]=_c0.extend(_B1);if(_w4){_11[_G].implement(_w4);}},undefineInScope:function(){},findInScope:function(_G){var _x0=false,_v4=this.scopes,i=_v4.length-1,_11;for(;i>-1;i--){_11=_v4[i];if(_11[_G]!==undefined){return _11[_G];}}
return _x0;},extEval:function(_70){if(_70.indexOf("function(")===0){eval('_70 = '+_70);}
return _70;},renderNode:function(_10,_h){var
_G=_10['class'],_x0=this.findInScope(_G),_3=_10['rect'],_u4=(_3!==undefined)&&(_3 instanceof Array),_63=_10['subviews']!==undefined,_q4=_63?_10['subviews']:null,_83=_10['options']!==undefined,_4=_83?_10['options']:null,_m4=_10['extend']!==undefined,_B1=_m4?_10['extend']:null,_j4=_10['define']!==undefined,_b2=_j4?_10['define']:null,_Q=_h,i,_O7;this.scopeDepth++;this.scopes.push({});try{if(_j4){if(_b2 instanceof Array){for(i=0;i<_b2.length;i++){this.defineInScope(_b2[i]);}}
else{console.log('renderNode definitions not Array, definitions:',_b2);}}
if(_x0){if(_m4){var _T4={},_i,_70;for(_i in _B1){_70=_B1[_i];if(typeof _70==='string'){try{_70=this.extEval(_70);}
catch(e){console.log('renderNode ext eval error:',e,', name:',_i,', block:',_70);}}
_T4[_i]=_70;}
_x0=_x0.extend(_T4);}
if(_83){if(_4['valueObjId']!==undefined){var _Qa=_4['valueObjId'];_4['valueObj']=COMM.Values.values[_4['valueObjId']];}}
if(!_u4&&_83){_Q=_x0.nu(_4);}
else if(_u4){_Q=_x0.nu(_3,_h,_4);}}
else if(!(!_x0&&_63)){console.log('renderNode warning; No such class: '+_G+', node: ',_10);}}
catch(e){console.log('renderNode error:',e,', rect:',_3,', class:',_10['class'],', options:',_4);}
if(_63){for(i=0;i<_q4.length;i++){_O7=this.renderNode(_q4[i],_Q);}}
this.scopes.pop();this.scopeDepth--;return _Q;}});JSONRenderer=COMM.JSONRenderer;HValueMatrixInterface={componentBehaviour:['view','control','matrix'],constructor:function(_3,_h,_4){this.base(_3,_h,_4);this.setValueMatrix();},setValueMatrix:function(){if(this.parent['valueMatrix']===undefined){this.parent.valueMatrix=HValueMatrix.nu();}
this.valueMatrixIndex=this.parent.valueMatrix.addControl(this);},click:function(){if(this.parent.valueMatrix instanceof HValueMatrix){this.parent.valueMatrix.setValue(this.valueMatrixIndex);}},die:function(){if(this['parent']){if(this.parent['valueMatrix']){this.parent.valueMatrix.release(this);}}
this.base();}};HValueMatrixComponentExtension=HValueMatrixInterface;HValueMatrix=HClass.extend({constructor:function(){this.ctrls=[];this.value=-1;this.valueObj=new HDummyValue();},setValueObj:function(_41){this.valueObj=_41;this.setValue(_41.value);},setValue:function(_x){if(_x!==this.value){if(this.value!==-1){if(this.ctrls[this.value]){this.ctrls[this.value].setValue(false);}}
this.value=_x;if(_x!==-1){if(_x<this.ctrls.length){this.ctrls[_x].setValue(true);}}
this.valueObj.set(_x);}},addControl:function(_a){this.ctrls.push(_a);var _P7=this.ctrls.length-1;if(_a.value){this.setValue(_P7);}
return _P7;},release:function(_a){var _x=this.ctrls.indexOf(_a);if(_x!==-1){this.ctrls.splice(_x,1);if(_x===this.value){this.setValue(-1);}}}});HPoint=HClass.extend({constructor:function(){this.type='[HPoint]';var _b=arguments;if(_b.length===0){this._g3();}
else if(_b.length===2){this._Q7(_b[0],_b[1]);}
else if(_b.length===1){this._m3(_b[0]);}
else{throw"Invalid number of arguments.";}},_g3:function(){this.x=null;this.y=null;},_Q7:function(x,y){this.x=x;this.y=y;},_m3:function(_k){this.x=_k.x;this.y=_k.y;},set:function(){var _b=arguments;if(_b.length===0){this._g3();}
else if(_b.length===2){this._Q7(_b[0],_b[1]);}
else if(_b.length===1){this._m3(_b[0]);}
else{throw"Invalid number of arguments.";}},constrainTo:function(_3){if(this.x<_3.left){this.x=_3.left;}
if(this.y<_3.top){this.y=_3.top;}
if(this.x>_3.right){this.x=_3.right;}
if(this.y>_3.bottom){this.y=_3.bottom;}},add:function(_k){_b=arguments;if((_b.length===1)&&(_b[0].type===this.type)){_k=_b[0];return new HPoint((this.x+_k.x),(this.y+_k.y));}
else if(_b.length===2){return new HPoint((this.x+_b[0]),(this.y+_b[1]));}else{return new HPoint(0,0);}},subtract:function(){_b=arguments;if((_b.length===1)&&(_b[0].type===this.type)){_k=_b[0];return new HPoint(this.x-_k.x,this.y-_k.y);}
else if(_b.length===2){return new HPoint(this.x-_b[0],this.y-_b[1]);}else{return new HPoint(0,0);}},equals:function(_k){return(this.x===_k.x&&this.y===_k.y);}});HRect=HClass.extend({constructor:function(){this.type='[HRect]';var _b=arguments;if(_b.length===0){this._g3();}else if(_b.length===4){this._o5(_b[0],_b[1],_b[2],_b[3]);}
else if(_b.length===2){this._m3(_b[0],_b[1]);}
else if(_b.length===1){if(_b[0]instanceof Array){this._o5(_b[0][0],_b[0][1],_b[0][2],_b[0][3]);}
else{this._R7(_b[0]);}}
else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_g3:function(){this.top=0;this.left=0;this.bottom=-1;this.right=-1;},_o5:function(_b0,_F,_Y,_A){this.top=_F;this.left=_b0;this.bottom=_A;this.right=_Y;},_m3:function(_S7,_T7){this.top=_S7.y;this.left=_S7.x;this.bottom=_T7.y;this.right=_T7.x;},_R7:function(_3){this.top=_3.top;this.left=_3.left;this.bottom=_3.bottom;this.right=_3.right;},updateSecondaryValues:function(){this.isValid=(this.right>=this.left&&this.bottom>=this.top);this.leftTop=new HPoint(this.left,this.top);this.leftBottom=new HPoint(this.left,this.bottom);this.rightTop=new HPoint(this.right,this.top);this.rightBottom=new HPoint(this.right,this.bottom);this.width=(this.right-this.left);this.height=(this.bottom-this.top);},set:function(){var _b=arguments;if(_b.length===0){this._g3();}else if(_b.length===4){this._o5(_b[0],_b[1],_b[2],_b[3]);}
else if(_b.length===2){this._m3(_b[0],_b[1]);}
else if(_b.length===1){this._R7(_b[0]);}
else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},setLeft:function(_b0){this.left=_b0;this.updateSecondaryValues();},setRight:function(_Y){this.right=_Y;this.updateSecondaryValues();},setTop:function(_F){this.top=_F;this.updateSecondaryValues();},setBottom:function(_A){this.bottom=_A;this.updateSecondaryValues();},setLeftTop:function(_k){this.left=_k.x;this.top=_k.y;this.updateSecondaryValues();},setLeftBottom:function(_k){this.left=_k.x;this.bottom=_k.y;this.updateSecondaryValues();},setRightTop:function(_k){this.right=_k.x;this.top=_k.y;this.updateSecondaryValues();},setRightBottom:function(_k){this.right=_k.x;this.bottom=_k.y;this.updateSecondaryValues();},setWidth:function(_w){this.right=this.left+_w;this.updateSecondaryValues();},setHeight:function(_B){this.bottom=this.top+_B;this.updateSecondaryValues();},setSize:function(){var _b=arguments;if(_b.length===2){_w=_b[0];_B=_b[1];}
else if(_b.length===1){_w=_b.x;_B=_b.y;}
this.right=this.left+_w;this.bottom=this.top+_B;this.updateSecondaryValues();},intersects:function(_3){return(((_3.left>=this.left&&_3.left<=this.right)||(_3.right>=this.left&&_3.right<=this.right))&&((_3.top>=this.top&&_3.top<=this.bottom)||(_3.bottom>=this.top&&_3.bottom<=this.bottom)));},contains:function(_g){if(_g instanceof HPoint){return this._M8(_g);}
else if(_g instanceof HRect){return this._L8(_g);}
else{throw"Wrong argument type.";}},_M8:function(_k){return(_k.x>=this.left&&_k.x<=this.right&&_k.y>=this.top&&_k.y<=this.bottom);},_L8:function(_3){return(_3.left>=this.left&&_3.right<=this.right&&_3.top>=this.top&&_3.bottom<=this.bottom);},insetBy:function(){var _b=arguments;if(_b.length===1){this._K8(_b[0]);}else if(_b.length===2){this._U7(_b[0],_b[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_K8:function(_k){this._U7(_k.x,_k.y);},_U7:function(x,y){this.left+=x;this.top+=y;this.right-=x;this.bottom-=y;},offsetBy:function(){var _b=arguments;if(_b.length===1){this._Q8(_b[0]);}else if(_b.length===2){this._V7(_b[0],_b[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_Q8:function(_k){this._V7(_k.x,_k.y);},_V7:function(x,y){this.left+=x;this.top+=y;this.right+=x;this.bottom+=y;},offsetTo:function(){var _b=arguments;if(_b.length===1){this._P8(_b[0]);}else if(_b.length===2){this._W7(_b[0],_b[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_P8:function(_k){this._W7(_k.x,_k.y);},_W7:function(x,y){this.right+=x-this.left;this.left=x;this.bottom+=y-this.top;this.top=y;},equals:function(_3){return(this.left===_3.left&&this.top===_3.top&&this.right===_3.right&&this.bottom===_3.bottom);},intersection:function(_3){return new HRect(Math.max(this.left,_3.left),Math.max(this.top,_3.top),Math.min(this.right,_3.right),Math.min(this.bottom,_3.bottom));},union:function(_3){return new HRect(Math.min(this.left,_3.left),Math.min(this.top,_3.top),Math.max(this.right,_3.right),Math.max(this.bottom,_3.bottom));},valueObj:null,viewIds:[],bind:function(_c){if(this.viewIds.indexOf(_c.viewId)!==-1){this.viewIds.push(_c.viewId);}},release:function(_c){var _X7=this.viewIds.indexOf(_c.viewId);if(_X7!==-1){this.viewIds.splice(_X7,1);}},setValueObj:function(_41){this.valueObj=_41;},setValue:function(_1,_I9){if(this.valueObj){this.valueObj.set(_1);}
this.set(_1[0],_1[1],_1[2],_1[3]);var i=0,_e;for(;i<this.viewIds.length;i++){_e=this.viewIds[i];HSystem.views[_e].drawRect();}}});HDefaultThemePath='/H/themes';HDefaultThemeName='default';HNoComponentCSS=[];HNoCommonCSS=[];HThemeHasIE6GifsInsteadOfPng=[];HThemeManager=HClass.extend({constructor:null,init:function(){this.themePath=HDefaultThemePath;this._94={};this._54={};this.currentTheme=HDefaultThemeName;},setThemePath:function(_l2){this.themePath=_l2;},_H9:function(_y){console.log("ERROR: Template Not Found: '"+_y+"' ");},_G9:function(_y){console.log("ERROR: Template Failure: '"+_y+"' ");},_F9:function(_y){console.log("ERROR: Template Exception: '"+_y+"' ");},fetch:function(_y,_W0,_w1,_21){var _F5;if(!_W0){_W0='text/html; charset=UTF-8';}
if(_21){_F5=function(resp){_w1(resp.X.responseText);};}
else{var _Y7;_F5=function(resp){_Y7=resp.X.responseText;};}
COMM.request(_y,{onSuccess:_F5,on404:function(resp){HThemeManager._H9(resp.url);},onFailure:function(resp){HThemeManager._G9(resp.url);},onException:function(resp){HThemeManager._F9(resp.url);},method:'GET',async:_21});if(!_21){return _Y7;}},getThemeGfxPath:function(){var _m=this._Z3[0],_H=this._Z3[1],_P=this._Z3[2],_s1=this._s1(_m,_H,_P);return this._M0(_s1,'gfx');},getCssFilePath:function(_E0){var _m=this._Z3[0];if((HThemeHasIE6GifsInsteadOfPng.indexOf(_m)!==-1)&&ELEM._t1){return"url('"+this._M0(this.getThemeGfxPath(),_E0.replace('.png','-ie6.gif'))+"')";}
else{return"url('"+this._M0(this.getThemeGfxPath(),_E0)+"')";}},loadCSS:function(_y){var _W0='text/css',_E9=function(_C0){if(!_C0||_C0===""){return;}
HThemeManager.useCSS(_C0);};this.fetch(_y,_W0,_E9,true);},useCSS:function(_C0){var _W0='text/css';_C0=this._D9(_C0);var _n0,_C9,_Z7;if(ELEM._I0){_n0=document.createStyleSheet();_n0.cssText=_C0;}
else{_n0=document.createElement("style");_n0.type=_W0;_n0.media="all";_Z7=document.getElementsByTagName('head')[0];_Z7.appendChild(_n0);if(BROWSER_TYPE.safari){var _B9=document.createTextNode(_C0);_n0.appendChild(_B9);}
else{_n0.innerHTML=_C0;}}},_A9:function(_p){if(_p[_p.length-1]!=='/'){_p+='/';}
return _p;},_M0:function(_z9,_y9){return this._A9(_z9)+_y9;},_s1:function(_m,_H,_P){var _l2=_P;if(_P===null){_l2=this.themePath;}
_l2=this._M0(_l2,_m);return _l2;},_Y3:function(_m,_H,_P){this._Z3=[_m,_H,_P];var _x9=this._s1(_m,_H,_P),_v9=this._M0('css',_H+'.css'),_Y3=this._M0(_x9,_v9);return _Y3;},_U5:function(_m,_H,_P){var _u9=this._s1(_m,_H,_P),_t9=this._M0('html',_H+'.html'),_r9=this._M0(_u9,_t9);return _r9;},loadMarkup:function(_m,_H,_P){if(!this._94[_m]){this._94[_m]={};}
var _I=this._94[_m][_H];if(null===_I||undefined===_I){var _U5=this._U5(_m,_H,_P),_Z=this.fetch(_U5,null,null,false);if(null===_Z||undefined===_Z){_Z="";}
HThemeManager._94[_m][_H]=_Z;return _Z;}
return _I;},getMarkup:function(_m,_H,_P){if(!this._54[_m]){this._54[_m]={};if(HNoCommonCSS.indexOf(_m)===-1){var _q9=this._Y3(_m,'common',_P,null);this.loadCSS(_q9);}}
if(HNoComponentCSS.indexOf(_m)===-1){if(!this._54[_m][_H]){var _p9=this._Y3(_m,_H,_P);this._54[_m][_H]=true;this.loadCSS(_p9);}}
return this.loadMarkup(_m,_H,_P);},_j5:function(_m,_H,_P){var _s1=this._s1(_m,_H,_P),_y=this._M0(_s1,'gfx');return _y;},_j9:function(_m,_H,_P,_E0){if((HThemeHasIE6GifsInsteadOfPng.indexOf(_m)!==-1)&&ELEM._t1){return this._M0(this._j5(_m,_H,_P),_E0.replace('.png','-ie6.gif'));}
return this._M0(this._j5(_m,_H,_P),_E0);},getThemeGfxFile:function(_E0){return this.getThemeGfxPath()+_E0;},setTheme:function(_18){this.currentTheme=_18;},restoreDefaultTheme:function(){this.setTheme(HDefaultThemeName);},_Y1:new RegExp(/#\{([^\}]*)\}/),_D9:function(_z3){while(this._Y1.test(_z3)){_z3=_z3.replace(this._Y1,eval(RegExp.$1));}
return _z3;}});HMarkupView=HClass.extend({bindMarkupVariables:function(){var _Z=this.markup;while(HMarkupView._28.test(_Z)){_Z=_Z.replace(HMarkupView._28,this.evalMarkupVariable(RegExp.$1,true));}
while(HMarkupView._Y1.test(_Z)){_Z=_Z.replace(HMarkupView._Y1,this.evalMarkupVariable(RegExp.$1));}
this.markup=_Z;return this;},evalMarkupVariable:function(_k5,_P3){try{var _ID=this.elemId.toString(),_WIDTH=this.rect.width,_HEIGHT=this.rect.height,_38=eval(_k5);if(_P3){return'';}
if(_38===undefined){return'';}
else{return _38;}}
catch(e){console.log("Warning, the markup string '"+_k5+"' failed evaluation. Reason:"+e+' '+e.description);return'';}},toggleCSSClass:function(_d1,_O3,_48){if(_d1){if(_48){ELEM.addClassName(_d1,_O3);}
else{ELEM.removeClassName(_d1,_O3);}}
return this;}},{_Y1:new RegExp(/#\{([^\}]*)\}/),_28:new RegExp(/\$\{([^\}]*)\}/)});HMorphAnimation=HClass.extend({animateTo:function(_g,_n1,_V0){if(!this.drawn){return this;}
if(_g instanceof HPoint){var _3=new HRect(_g,_g);_3.setSize(this.rect.width,this.rect.height);this._p5(_3,_n1);}
else if(_g instanceof HRect){this._p5(_g,_n1);}
else{throw"Wrong argument type.";}
return this;},stopAnimation:function(){if(this._Q3){window.clearInterval(this._Q3);this._Q3=null;var _b0=parseInt(this.style('left'),10),_F=parseInt(this.style('top'),10),_w=parseInt(this.style('width'),10),_B=parseInt(this.style('height'),10);this.rect.set(_b0,_F,_b0+_w,_F+_B);this.drawRect();if(this._58){this.onAnimationEnd();}
else{this.onAnimationCancel();}}
return this;},_p5:function(_3,_n1,_V0){if(null===_n1||undefined===_n1){_n1=500;}
if(null===_V0||undefined===_V0||_V0<1){_V0=50;}
if(!this._Q3){this._58=false;this.onAnimationStart();var _k9=new Date().getTime();var _t=this;this._Q3=window.setInterval(function(){if(!_t){return;}
_t._l9({startTime:_k9,duration:_n1,transition:function(t,b,c,d){return c*t/d+b;},props:[{prop:'left',from:_t.rect.left,to:_3.left,unit:'px'},{prop:'top',from:_t.rect.top,to:_3.top,unit:'px'},{prop:'width',from:_t.rect.width,to:_3.width,unit:'px'},{prop:'height',from:_t.rect.height,to:_3.height,unit:'px'}]});},Math.round(1000/_V0));}
return this;},_l9:function(_g){var _68=new Date().getTime(),i;if(_68<_g.startTime+_g.duration){var _m9=_68-_g.startTime;for(i=0;i<_g.props.length;i++){var _v2=_g.props[i].from;var _M2=_g.props[i].to;if(_v2!==_M2){var _n9=_g.transition(_m9,_v2,(_M2-_v2),_g.duration);this.setStyle(_g.props[i].prop,_n9+_g.props[i].unit);}}}else{for(i=0;i<_g.props.length;i++){this.setStyle(_g.props[i].prop,_g.props[i].to+_g.props[i].unit);}
this._58=true;this.stopAnimation();}
return this;},onAnimationStart:function(){},onAnimationEnd:function(){},onAnimationCancel:function(){}});HView=HClass.extend({themePath:null,isAbsolute:true,flexRight:false,flexLeft:true,flexTop:true,flexBottom:false,flexRightOffset:0,flexBottomOffset:0,componentBehaviour:['view'],drawn:false,theme:null,preserveTheme:false,optimizeWidthOnRefresh:true,parent:null,parents:null,viewId:null,appId:null,app:null,views:null,viewsZOrder:null,isHidden:true,rect:null,constructor:function(_3,_h){if(!this.theme){this.theme=HThemeManager.currentTheme;this.preserveTheme=false;}
else{this.preserveTheme=true;}
this.parent=_h;this.viewId=this.parent.addView(this);this.appId=this.parent.appId;this.app=HSystem.apps[this.appId];this.views=[];this.viewsZOrder=[];this._78();this.setRect(_3);this._88=_3.left;this._98=_3.top;this._I2=[];if(!this.isinherited){this.draw();this.show();}},setFlexRight:function(_9,_M){if(_9===undefined){_9=true;}
this.flexRight=_9;if(_M===undefined){_M=0;}
this.flexRightOffset=_M;return this;},setFlexLeft:function(_9,_M){if(_9===undefined){_9=true;}
this.flexLeft=_9;if((_M||_M===0)&&this.rect){this.rect.setLeft(_M);}
return this;},setFlexTop:function(_9,_M){if(_9===undefined){_9=true;}
this.flexTop=_9;if((_M||_M===0)&&this.rect){this.rect.setTop(_M);}
return this;},setFlexBottom:function(_9,_M){if(_9===undefined){_9=true;}
this.flexBottom=_9;if(_M===undefined){_M=0;}
this.flexBottomOffset=_M;return this;},setAbsolute:function(_9){if(_9===undefined){_9=true;}
this.isAbsolute=_9;return this;},setRelative:function(_9){if(_9===undefined){_9=true;}
this.isAbsolute=(!_9);return this;},getThemeGfxPath:function(){var _m;if(this.preserveTheme){_m=this.theme;}else{_m=HThemeManager.currentTheme;}
return HThemeManager._j5(_m,this.componentName,this.themePath);},getThemeGfxFile:function(_E0){if(this.preserveTheme){_m=this.theme;}else{_m=HThemeManager.currentTheme;}
return HThemeManager._j9(_m,this.componentName,this.themePath,_E0);},_z4:function(_k2){this.elemId=ELEM.make(_k2,'div');},_a8:function(_s9){var _G3='display:none;overflow:hidden;visibility:hidden;';if(this.isAbsolute){_G3+='position:absolute;';}else{_G3+='position:relative;';}
_G3+=_s9;ELEM.setCSS(this.elemId,_G3);},_w3:function(){var _k2;if(this.parent.elemId===undefined){_k2=0;}
else if(this.parent.markupElemIds&&this.parent.markupElemIds['subview']){_k2=this.parent.markupElemIds['subview'];}
else{_k2=this.parent.elemId;}
return _k2;},_78:function(){if(!this.elemId){this._z4(this._w3());this._a8('');if(this.preserveTheme){ELEM.addClassName(this.elemId,this.theme);}
else{ELEM.addClassName(this.elemId,HThemeManager.currentTheme);}}},drawRect:function(){if(this.parent&&this.rect.isValid){var _0=this,_6=_0.elemId,_z=ELEM.setStyle,_3=_0.rect;_z(_6,'left',_0.flexLeft?(_3.left+'px'):'auto',true);_z(_6,'top',_0.flexTop?(_3.top+'px'):'auto',true);_z(_6,'right',_0.flexRight?(_0.flexRightOffset+'px'):'auto',true);_z(_6,'bottom',_0.flexBottom?(_0.flexBottomOffset+'px'):'auto',true);_z(_6,'width',(_0.flexLeft&&_0.flexRight)?'auto':(_3.width+'px'),true);_z(_6,'height',(_0.flexTop&&_0.flexBottom)?'auto':(_3.height+'px'),true);if(_0.flexLeft&&_0.flexRight){_z(_6,'min-width',_3.width+'px',true);}
if(_0.flexTop&&_0.flexBottom){_z(_6,'min-height',_3.height+'px',true);}
if(undefined===_0.isHidden||_0.isHidden===false){_z(_6,'visibility','inherit',true);}
_z(_6,'display','block',true);_0._06();if(_0._88!==_3.left||_0._98!==_3.top){_0.invalidatePositionCache();_0._88=_3.left;_0._98=_3.top;}
_0.drawn=true;}
return this;},_06:function(){HSystem.updateZIndexOfChildren(this.viewId);},_Z1:function(){HSystem.updateZIndexOfChildren(this.parent.viewId);},draw:function(){var _d4=this.drawn;this.drawRect();if(!_d4){if(this['componentName']!==undefined){this.drawMarkup();}
this.drawSubviews();}
this.refresh();return this;},drawSubviews:function(){},_08:function(){var _m,_Z;if(this.preserveTheme){_m=this.theme;}
else{_m=HThemeManager.currentTheme;}
_Z=HThemeManager.getMarkup(_m,this.componentName,this.themePath);if(_Z===false){console.log('Warning: Markup template for "'+this.componentName+'" using theme "'+_m+'" not loaded.');}
this.markup=_Z;return(_Z!==false);},markupElemNames:['bg','label','state','control','value','subview'],drawMarkup:function(){ELEM.setStyle(this.elemId,'display','none',true);var _lb=this._08();this.bindMarkupVariables();ELEM.setHTML(this.elemId,this.markup);this.markupElemIds={};for(var i=0;i<this.markupElemNames.length;i++){var _N=this.markupElemNames[i],_b8=_N+this.elemId,_w9=' id="'+_b8+'"';if(this.markup.indexOf(_w9)!==-1){this.markupElemIds[_N]=this.bindDomElement(_b8);}}
ELEM.setStyle(this.elemId,'display','block');return this;},setHTML:function(_02){ELEM.setHTML(this.elemId,_02);return this;},refresh:function(){if(this.drawn){this.drawRect();}
if(this.optimizeWidthOnRefresh){this.optimizeWidth();}
return this;},setRect:function(_3){if(this.rect){this.rect.release(this);}
if(_3 instanceof Array){var _X3=_3.length,_Q5='HView.setRect: If the HRect instance is replaced by an array, ';if((_X3===4)||(_X3===6)){var _X1=_3[0],_V1=_3[1],_w=_3[2],_B=_3[3],_R5=((_X3===6)?_3[4]:null),_S5=((_X3===6)?_3[5]:null),_R1=(typeof _X1==='number'),_M1=(typeof _V1==='number'),_a2=(typeof _R5==='number'),_72=(typeof _S5==='number'),_t3=(typeof _w==='number'),_l3=(typeof _B==='number'),_Y,_A;if((!_R1&&!_a2)||(!_M1&&!_72)){console.log(_Q5+'(left or top) and (top or bottom) must be specified.');}
else if((!_t3&&!(_R1&&_a2))||(!_l3&&!(_M1&&_72))){console.log(_Q5+'the (height or width) must be specified unless both (left and top) or (top and bottom) are specified.');}
this.setFlexLeft(_R1,_X1);this.setFlexTop(_M1,_V1);this.setFlexRight(_a2,_R5);this.setFlexBottom(_72,_S5);if(_R1&&_t3&&!_a2){_Y=_X1+_w;}
else if(!_R1&&_t3&&_a2){_X1=0;_Y=_w;}
else if(_R1&&!_t3&&_a2){_Y=_X1+_R5;}
else if(_R1&&_t3&&_a2){_Y=_X1+_w;}
if(_M1&&_l3&&!_72){_A=_V1+_B;}
else if(!_M1&&_l3&&_72){_V1=0;_A=_B;}
else if(_M1&&!_l3&&_72){_A=_V1+_S5;}
else if(_M1&&_l3&&_72){_A=_V1+_B;}
this.rect=HRect.nu(_X1,_V1,_Y,_A);}
else{console.log(_Q5+'the length has to be either 4 or 6.');}}
else{this.rect=_3;}
this.rect.bind(this);this.refresh();return this;},setStyle:function(_i,_1,_R0){if(this.elemId){ELEM.setStyle(this.elemId,_i,_1,_R0);}
return this;},style:function(_i){if(this.elemId){return ELEM.getStyle(this.elemId,_i);}
return'';},setStyleOfPart:function(_N,_i,_1,_R0){if(!this.markupElemIds[_N]){console.log('Warning, setStyleOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');}
else{ELEM.setStyle(this.markupElemIds[_N],_i,_1,_R0);}
return this;},styleOfPart:function(_N,_i){if(!this.markupElemIds[_N]){console.log('Warning, styleOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');return'';}
return ELEM.getStyle(this.markupElemIds[_N],_i);},setMarkupOfPart:function(_N,_1){if(!this.markupElemIds[_N]){console.log('Warning, setMarkupOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');}
else{ELEM.setHTML(this.markupElemIds[_N],_1);}
return this;},markupOfPart:function(_N){if(!this.markupElemIds[_N]){console.log('Warning, markupOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');return'';}
return ELEM.getHTML(this.markupElemIds[_N]);},hide:function(){if(!this.isHidden){var _C1=ELEM.setStyle,_6=this.elemId;_C1(_6,'visibility','hidden');_C1(_6,'display','none');this.isHidden=true;}
return this;},show:function(){if(this.isHidden){var _C1=ELEM.setStyle,_6=this.elemId;_C1(_6,'visibility','inherit');_C1(_6,'display','block');this.isHidden=false;}
return this;},toggle:function(){if(this.isHidden){this.show();}else{this.hide();}
return this;},remove:function(){if(this.parent){var _J9=this.parent.viewsZOrder.indexOf(this.viewId),_K9=this.parent.views.indexOf(this.viewId);this.parent.views.splice(_K9,1);HSystem.delView(this.viewId);this.parent.viewsZOrder.splice(_J9,1);var _c8=HSystem._l1.indexOf(this.viewId);if(_c8!==-1){HSystem._l1.splice(_c8,1);}
this._Z1();this.parent=null;this.parents=[];}
return this;},die:function(){this.hide();this.drawn=false;this.stopAnimation();var _d8,i;while(this.views.length!==0){_d8=this.views[0];this.destroyView(_d8);}
this.remove();for(i=0;i<this._I2.length;i++){ELEM.del(this._I2[i]);}
this._I2=[];ELEM.del(this.elemId);this.rect=null;var _0=this;for(i in _0){_0[i]=null;delete _0[i];}},onIdle:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].onIdle();}},buildParents:function(_e){var _c=HSystem.views[_e];_c.parent=this;_c.parents=[];for(var _d5=0;_d5<this.parents.length;_d5++){_c.parents.push(this.parents[_d5]);}
_c.parents.push(this);},addView:function(_c){var _e=HSystem.addView(_c);this.views.push(_e);this.buildParents(_e);this.viewsZOrder.push(_e);return _e;},removeView:function(_e){HSystem.views[_e].remove();return this;},destroyView:function(_e){HSystem.views[_e].die();return this;},bounds:function(){var _62=new HRect(this.rect);_62.right-=_62.left;_62.left=0;_62.bottom-=_62.top;_62.top=0;return _62;},resizeBy:function(_i5,_33){var _3=this.rect;_3.right+=_i5;_3.bottom+=_33;_3.updateSecondaryValues();this.drawRect();return this;},resizeTo:function(_w,_B){var _3=this.rect;_3.right=_3.left+_w;_3.bottom=_3.top+_B;_3.updateSecondaryValues();this.drawRect();return this;},offsetTo:function(){this.rect.offsetTo.apply(this.rect,arguments);this.drawRect();return this;},moveTo:function(){this.offsetTo.apply(this,arguments);return this;},offsetBy:function(_i5,_33){this.rect.offsetBy(_i5,_33);this.drawRect();return this;},moveBy:function(){this.offsetBy.apply(this,arguments);return this;},bringToFront:function(){if(this.parent){var _x=this.zIndex();this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.push(this.viewId);this._Z1();}
return this;},bringToFrontOf:function(_c){if(this.parent.viewId===_c.parent.viewId){this.parent.viewsZOrder.splice(this.zIndex(),1);this.parent.viewsZOrder.splice(_c.zIndex()+1,0,this.viewId);this._Z1();}
return this;},sendToBackOf:function(_c){if(this.parent.viewId===_c.parent.viewId){this.parent.viewsZOrder.splice(this.zIndex(),1);this.parent.viewsZOrder.splice(_c.zIndex(),0,this.viewId);this._Z1();}
return this;},sendBackward:function(){var _x=this.zIndex();if(_x!==0){this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.splice(_x-1,0,this.viewId);this._Z1();}
return this;},bringForward:function(){var _x=this.zIndex();if(_x!==this.parent.viewsZOrder.length-1){this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.splice(_x+1,0,this.viewId);this._Z1();}
return this;},sendToBack:function(){if(this.parent){var _x=this.zIndex();this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.splice(0,0,this.viewId);this._Z1();}
return this;},zIndex:function(){if(!this.parent){return-1;}
return this.parent.viewsZOrder.indexOf(this.viewId);},stringSize:function(_x1,_y0,_6,_e8,_31){if(_y0||_y0===0){_x1=_x1.substring(0,_y0);}
if(!_6&&_6!==0){_6=this.elemId;}
if(!_31){_31='';}
if(!_e8){_31+='white-space:nowrap;';}
var _a4=ELEM.make(_6);ELEM.setCSS(_a4,"visibility:hidden;position:absolute;"+_31);ELEM.setHTML(_a4,_x1);ELEM.flushLoop();var _O8=ELEM.getVisibleSize(_a4);ELEM.del(_a4);return _O8;},stringWidth:function(_x1,_y0,_6,_31){return this.stringSize(_x1,_y0,_6,false,_31)[0];},stringHeight:function(_x1,_y0,_6,_31){return this.stringSize(_x1,_y0,_6,true,_31)[1];},pageX:function(){var _n=0,_5=this;while(_5){if(_5.elemId&&_5.rect){_n+=ELEM.get(_5.elemId).offsetLeft;_n-=ELEM.get(_5.elemId).scrollLeft;}
if(_5.markupElemIds&&_5.markupElemIds.subview){_n+=ELEM.get(_5.markupElemIds.subview).offsetLeft;_n-=ELEM.get(_5.markupElemIds.subview).scrollLeft;}
_5=_5.parent;}
return _n;},pageY:function(){var _j=0,_5=this;while(_5){if(_5.elemId&&_5.rect){_j+=ELEM.get(_5.elemId).offsetTop;_j-=ELEM.get(_5.elemId).scrollTop;}
if(_5.markupElemIds&&_5.markupElemIds.subview){_j+=ELEM.get(_5.markupElemIds.subview).offsetTop;_j-=ELEM.get(_5.markupElemIds.subview).scrollTop;}
_5=_5.parent;}
return _j;},pageLocation:function(){return new HPoint(this.pageX(),this.pageY());},optimizeWidth:function(){},invalidatePositionCache:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].invalidatePositionCache();}
return this;},bindDomElement:function(_f8){var _E5=ELEM.bindId(_f8);if(_E5){this._I2.push(_E5);}
return _E5;},unbindDomElement:function(_d1){var _g8=this._I2.indexOf(_d1);if(_g8>-1){ELEM.del(_d1);this._I2.splice(_g8,1);}}});HView.implement(HMarkupView);HView.implement(HMorphAnimation);HEventResponder=HClass.extend({setEvents:function(_r3){if(!this.events){this.events=HClass.extend({mouseMove:false,mouseDown:false,mouseUp:false,draggable:false,droppable:false,keyDown:false,keyUp:false,mouseWheel:false,textEnter:false,click:false}).nu();}
if(_r3){this.events.extend(_r3);}
this.events.ctrl=this;EVENT.focusOptions[this.elemId]=this.events;var _h8=this.events.mouseMove,_P5=EVENT.coordListeners.indexOf(this.elemId);if(_h8&&(_P5===-1)){EVENT.coordListeners.push(this.elemId);}
else if((!_h8)&&(_P5!==-1)){EVENT.coordListeners.splice(_P5,1);}
return this;},setMouseMove:function(_9){this.events.mouseMove=_9;this.setEvents();return this;},setClickable:function(_9){this.events.click=_9;this.setEvents();return this;},setMouseDown:function(_9){this.events.mouseDown=_9;this.setEvents();return this;},setMouseUp:function(_9){this.events.mouseUp=_9;this.setEvents();return this;},setMouseWheel:function(_9){this.events.mouseWheel=_9;this.setEvents();return this;},setDraggable:function(_9){this.events.draggable=_9;this.setEvents();return this;},setDroppable:function(_9){this.events.droppable=_9;this.setEvents();return this;},setKeyDown:function(_9){this.events.keyDown=_9;this.setEvents();return this;},setKeyUp:function(_9){this.events.keyUp=_9;this.setEvents();return this;},setTextEnter:function(_9){this.events.textEnter=_9;this.setEvents();return this;},setClick:function(_9){return this.setClickable(_9);},focus:function(){},blur:function(){},gainedActiveStatus:function(_V5){if((HSystem.windowFocusBehaviour===1)&&(this.parents.length>2)){if(this.parents[2].componentBehaviour.indexOf('window')!==-1){this.parents[2].gainedActiveStatus();}}},_b7:function(_V5){if(this.enabled){this.toggleCSSClass(this.elemId,HControl.CSS_ACTIVE,true);}
this.gainedActiveStatus(_V5);},lostActiveStatus:function(_a0){},_a7:function(_a0){if(this.enabled){this.toggleCSSClass(this.elemId,HControl.CSS_ACTIVE,false);}
this.lostActiveStatus(_a0);},mouseMove:function(x,y){},click:function(x,y,_51){},mouseDown:function(x,y,_51){},mouseUp:function(x,y,_51){},mouseWheel:function(_V){},startDrag:function(x,y){},drag:function(x,y){this.doDrag(x,y);},doDrag:function(x,y){},endDrag:function(x,y){this.invalidatePositionCache();},drop:function(obj){this.onDrop(obj);},onDrop:function(obj){},startHover:function(obj){this.onHoverStart(obj);},onHoverStart:function(obj){},endHover:function(obj){this.onHoverEnd(obj);},onHoverEnd:function(obj){},keyDown:function(_O){},keyUp:function(_O){},textEnter:function(){},_r2:function(e){if(!Event.element){return;}
var _t=Event.element(e);while(_t&&_t.ctrl===undefined){_t=_t.parentNode;}
if(!_t){return;}
var _0=_t.ctrl;EVENT.focus(_0);Event.stop(e);},_14:function(e){if(!Event.element){return;}
var _t=Event.element(e);while(_t&&_t.ctrl===undefined){_t=_t.parentNode;}
if(!_t){return;}
var _0=_t.owner;EVENT.blur(_0);Event.stop(e);},invalidatePositionCache:function(){this.base();EVENT.coordCacheFlush(this.elemId);return this;}});HValueResponder=HClass.extend({setValueObj:function(_41){this.valueObj=_41;this.setValue(_41.value);return this;},valueDiffers:function(_1){return(COMM.Values.encode(_1)!==COMM.Values.encode(this.value));},setValue:function(_1){if(_1!==undefined&&this['valueObj']&&this.valueDiffers(_1)){var _05=COMM.Values;this.value=_1;if(_05._I7.indexOf(_05.type(_1))===-1){this.valueObj.set(_05.clone(_1));}
else{this.valueObj.set(_1);}
(this['refresh']!==undefined)&&(typeof this.refresh==='function')&&this.refresh();}
return this;}});HDummyValue=HClass.extend({constructor:function(_2,_1){this.id=_2;this.value=_1;},set:function(_1){this.value=_1;},get:function(){return this.value;},bind:function(_R9){},unbind:function(_R9){}});HControlDefaults=HClass.extend({label:"",visible:true,events:null,constructor:function(){if(!this.events){this.events={};}},value:0,enabled:true,active:false,minValue:-2147483648,maxValue:2147483648});HComponentDefaults=HControlDefaults;HControl=HView.extend({componentBehaviour:['view','control'],refreshOnValueChange:true,refreshOnLabelChange:true,label:null,events:null,enabled:null,value:null,valueObj:null,minValue:null,maxValue:null,active:null,options:null,controlDefaults:HControlDefaults,constructor:function(_3,_h,_4){if(!_4){_4={};}
var _0=this;_4=(_0.controlDefaults.extend(_4)).nu(this);_0.options=_4;if(_0.isinherited){_0.base(_3,_h);}
else{_0.isinherited=true;_0.base(_3,_h);_0.isinherited=false;}
var _S9=(_4.minValue||_4.maxValue),_f=_4.label,_r3=_4.events;if(_4.visible){_0.show();}
else{_0.hide();}
_0.setLabel(_f);_0.setEvents(_r3);_0.setEnabled(_4.enabled);if(_4.valueObj){_4.valueObj.bind(_0);}
else if(!_0.valueObj){_0.valueObj=HDummyValue.nu();}
if((_0.value===null)&&(_4.value!==undefined)){_0.setValue(_4.value);}
if(_S9){_0.setValueRange(this.value,_4.minValue,_4.maxValue);}
if(!_0.isinherited){_0.draw();}},die:function(){var _0=this;if(_0.valueObj){_0.valueObj.unbind(_0);_0.valueObj=null;}
EVENT.unreg(_0);_0.base();},setLabel:function(_f){var _0=this,_52=(_f!==_0.label);if(_52){_0.label=_f;_0.options.label=_f;_0.refresh();}
return this;},setEnabled:function(_9){var _0=this,_6=this.elemId,_J3=HSystem.views,i=0,_S=_0.views,_a5=_S.length;for(;i<_a5;i++){_J3[_S[i]].setEnabled(_9);}
if(_0.enabled===_9){return this;}
_0.enabled=_9;if(_9){EVENT.reg(_0,_0.events);}
else{EVENT.unreg(this);}
_0.toggleCSSClass(_6,HControl.CSS_ENABLED,_9);_0.toggleCSSClass(_6,HControl.CSS_DISABLED,!_9);return this;},setValueRange:function(_1,_b4,_e4){this.minValue=_b4;this.maxValue=_e4;_1=(_1<_b4)?_b4:_1;_1=(_1>_e4)?_e4:_1;this.setValue(_1);return this;},refreshValue:function(){if(this.markupElemIds){if(this.markupElemIds['value']){ELEM.setHTML(this.markupElemIds.value,this.value);}}
return this;},refreshLabel:function(){if(this.markupElemIds){if(this.markupElemIds['label']){ELEM.setHTML(this.markupElemIds.label,this.label);}}
return this;},refresh:function(){this.base();if(this.drawn){if(this.refreshOnValueChange){this.refreshValue();}
if(this.refreshOnLabelChange){this.refreshLabel();}}
return this;}},{CSS_DISABLED:"disabled",CSS_ENABLED:"enabled",CSS_ACTIVE:"active"});HControl.implement(HValueResponder);HControl.implement(HEventResponder);HDynControl=HControl.extend({componentBehaviour:['view','control','window'],preserveTheme:true,controlDefaults:(HControlDefaults.extend({constructor:function(_a){var _e1=ELEM.windowSize(),_R2=_e1[0],_O2=_e1[1];if(!this.minSize){this.minSize=[24,54];}
if(!this.maxSize){this.maxSize=_e1;}
if(!this.maxX){this.maxX=_R2-this.minSize[0];}
if(!this.maxY){this.maxY=_O2-this.minSize[1];}
if(!this.events){this.events={draggable:true};}
if(!this.resizeNW){this.resizeNW=[1,1];}
if(!this.resizeNE){this.resizeNE=[1,1];}
if(!this.resizeSW){this.resizeSW=[1,1];}
if(!this.resizeSE){this.resizeSE=[1,1];}},minX:0,minY:0,maxX:null,maxY:null,minSize:null,maxSize:null,resizeW:1,resizeE:1,resizeN:1,resizeS:1,resizeNW:null,resizeNE:null,resizeSW:null,resizeSE:null,noResize:false})),draw:function(){this.base();this._T9();this._i8();},_91:function(_j8,_k8){var _0=this,_3=_0.rect,_4=_0.options,_g4,_N3;if(_3.width<_4.minSize[0]){_g4=0-(_4.minSize[0]-_3.width);_3.setWidth(_4.minSize[0]);if(_j8){_3.offsetBy(_g4,0);}}
else if(_3.width>_4.maxSize[0]){_g4=0-(_4.maxSize[0]-_3.width);_3.setWidth(_4.maxSize[0]);if(_j8){_3.offsetBy(_g4,0);}}
if(_3.height<_4.minSize[1]){_N3=0-(_4.minSize[1]-_3.height);_3.setHeight(_4.minSize[1]);if(_k8){_3.offsetBy(0,_N3);}}
else if(_3.height>_4.maxSize[1]){_N3=0-(_4.maxSize[1]-_3.height);_3.setHeight(_4.maxSize[1]);if(_k8){_3.offsetBy(0,_N3);}}
if(_3.left<_4.minX){_3.offsetTo(_4.minX,_3.top);}
else if(_3.left>_4.maxX){_3.offsetTo(_4.maxX,_3.top);}
if(_3.top<_4.minY){_3.offsetTo(_3.left,_4.minY);}
else if(_3.top>_4.maxY){_3.offsetTo(_3.left,_4.maxY);}
_0.drawRect();},_c1:function(x,y){return this._l8.subtract(x,y);},dynResizeNW:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setLeftTop(_0._a1.leftTop.subtract(_80));_0._91(1,1);},dynResizeNE:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setRightTop(_0._a1.rightTop.subtract(_80));_0._91(0,1);},dynResizeSW:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setLeftBottom(_0._a1.leftBottom.subtract(_80));_0._91(1,0);},dynResizeSE:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setRightBottom(_0._a1.rightBottom.subtract(_80));_0._91(0,0);},dynResizeW:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setLeft(_0._a1.left-_80.x);_0._91(1,0);},dynResizeE:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setRight(_0._a1.right-_80.x);_0._91(0,0);},dynResizeN:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setTop(_0._a1.top-_80.y);_0._91(0,1);},dynResizeS:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.setBottom(_0._a1.bottom-_80.y);_0._91(0,0);},dynDrag:function(_0,x,y){var _80=_0._c1(x,y);_0.rect.offsetTo(_0._a1.leftTop.subtract(_80));_0._91(1,1);},_T9:function(){this._k0=[];this._m8=['nw-resize','ne-resize','sw-resize','se-resize','w-resize','e-resize','n-resize','s-resize','move'];var i,_0=this,_1a=0,_2a=1,_3a=2,_4a=3,_5a=4,_6a=5,_7a=6,_8a=7,_9a=8,_k0=this._k0;_k0[_1a]=_0.dynResizeNW;_k0[_2a]=_0.dynResizeNE;_k0[_3a]=_0.dynResizeSW;_k0[_4a]=_0.dynResizeSE;_k0[_5a]=_0.dynResizeW;_k0[_6a]=_0.dynResizeE;_k0[_7a]=_0.dynResizeN;_k0[_8a]=_0.dynResizeS;_k0[_9a]=_0.dynDrag;},makeRectRules:function(){var _v=this.options,_3=this.rect;return[[0,0,_v.resizeNW[0],_v.resizeNW[1]],[_3.width-_v.resizeNE[0],0,_3.width,_v.resizeNE[1]],[0,_3.height-_v.resizeSW[1],_v.resizeSW[0],_3.height],[_3.width-_v.resizeSE[0],_3.height-_v.resizeSE[1],_3.width,_3.height],[0,_v.resizeN,_v.resizeW,_3.height-_v.resizeS],[_3.width-_v.resizeE,_v.resizeN,_3.width,_3.height-_v.resizeS],[_v.resizeW,0,_3.width-_v.resizeE,_v.resizeN],[_v.resizeW,_3.height-_v.resizeS,_3.width-_v.resizeE,_3.height],[_v.resizeW,_v.resizeN,_3.width-_v.resizeE,_3.height-_v.resizeS]];},_i8:function(){this._E1=-1;this._k3=[];var i=0,_E3,_J2=this.makeRectRules();for(;i<9;i++){_E3=_J2[i];this._k3.push(HRect.nu(_E3[0],_E3[1],_E3[2],_E3[3]));}},_ca:function(){var i,_n8=this._l8.subtract(this.rect.left,this.rect.top),_k3=this._k3;if(this.options.noResize&&_k3[8].contains(_n8)){this._E1=8;this.setStyle('cursor',this._m8[8]);return;}
for(i=0;i!==9;i++){if(_k3[i].contains(_n8)){this._E1=i;this.setStyle('cursor',this._m8[i]);return;}}},startDrag:function(x,y,_51){var _h=this.parent;if(_h.elemId){x-=_h.pageX();y-=_h.pageY();}
this._l8=new HPoint(x,y);this._a1=new HRect(this.rect);this._ca();if(this._E1!==-1){this._k0[this._E1](this,x,y);}
return true;},drag:function(x,y){var _h=this.parent;if(_h.elemId){x-=_h.pageX();y-=_h.pageY();}
if(this._E1!==-1){this._k0[this._E1](this,x,y);}
return true;},endDrag:function(x,y,_51){this.base();var _h=this.parent;if(_h.elemId){x-=_h.pageX();y-=_h.pageY();}
if(this._E1!==-1){this._k0[this._E1](this,x,y);}
this.setStyle('cursor','default');this._i8();return true;}});