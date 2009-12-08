
HClass=function(){if(arguments.length){if(this===window){HClass.prototype.extend.call(arguments[0],arguments.callee.prototype);}
else{this.extend(arguments[0]);}}};HClass.prototype={extend:function(_s0,_1){var _h0=HClass.prototype.extend;if(arguments.length===2){var _73=this[_s0];if((_73 instanceof Function)&&(_1 instanceof Function)&&_73.valueOf()!==_1.valueOf()&&(/\bbase\b/).test(_1)){var _e0=_1;_1=function(){var _z8=this.base;this.base=_73;var _y8=_e0.apply(this,arguments);this.base=_z8;return _y8;};_1.valueOf=function(){return _e0;};_1.toString=function(){return String(_e0);};}
return this[_s0]=_1;}else if(_s0){var _c0={toSource:null};var _r4=["toString","valueOf"];if(HClass._83){_r4.push("constructor");}
for(var i=0;(_i=_r4[i]);i++){if(_s0[_i]!==_c0[_i]){_h0.call(this,_i,_s0[_i]);}}
for(var _i in _s0){if(!_c0[_i]){_h0.call(this,_i,_s0[_i]);}}}
this.nu=function(){return new(this.extend({constructor:function(args){this.base.apply(this,args);}}))(arguments);};return this;},base:function(){}};HClass.extend=function(_Q,_93){var _h0=HClass.prototype.extend;if(!_Q){_Q={};}
HClass._83=true;var _c0=new this;_h0.call(_c0,_Q);var _l1=_c0.constructor;_c0.constructor=this;delete HClass._83;var _F0=function(){if(!HClass._83){_l1.apply(this,arguments);}
this.constructor=_F0;};_F0.prototype=_c0;_F0.extend=this.extend;_F0.implement=this.implement;_F0.toString=function(){return String(_l1);};_h0.call(_F0,_93);var _a3=(_l1!==null)?_F0:_c0;if(_a3.init instanceof Function){_a3.init();}
return _a3;};HClass.implement=function(_I1){if(_I1 instanceof Function){_I1=_I1.prototype;}
this.prototype.extend(_I1);};var Base=HClass;if([]['indexOf']===undefined){Object.extend=function(destination,source){for(property in source){destination[property]=source[property];}
return destination;};Object.extend(Array.prototype,{indexOf:function(_w8){var i=0,l=this.length;for(;i<l;i++){if(this[i]===_w8){return i;}}
return-1;}});}
try{if(window['console']===undefined){console={log:function(){}};}}catch(e){}
ELEMTickerInterval=10;BROWSER_TYPE={ie:false,ie6:false,ie7:false,ie8:false,opera:false,safari:false,symbian:false,chrome:false,firefox:false,firefox2:false,firefox3:false};ELEM={_l1:function(){var _0=ELEM;_0._S1=false;_0._U1=[];_0._h3=null;_0._S3=false;_0._d6=false;_0._c9=0;_0._za=0;_0._ya=0;_0._e6=0;_0._f6=0;_0._H3=0;_0._Ta=0;_0._g6=0;_0._D5=0;_0._h6=0;_0._i3=500;_0._72=null;_0._71=ELEMTickerInterval;_0._P1=false;_0._j3=false;_0._k3=1;_0._t=[];if(_0._S1){_0._X={_m9:[]};}else{_0._R5=[];}
_0._W1={};_0._k0={};_0._j0={};_0._C0={};_0._P0=[];_0._R0={};_0._e9=",ADDRESS,BLOCKQUOTE,CENTER,DIR,DIV,DL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,ISINDEX,MENU,NOFRAMES,NOSCRIPT,OL,P,PRE,TABLE,UL,";},_1b:function(_o6,_E){if(!ELEM._S1){return;}
var _0=ELEM,i=0,_16=[],_X=_0._r6(_E),_O0=_X._O0;for(;i!==_o6;i++){_16.push(_0.make(_O0,_E));}
for(i=0;i!==_o6;i++){_0.del(_16[i]);}},_25:function(_5){var _2,_0=ELEM,_t=_0._t,_69=(_0._R5.length!==0);if(_69){_2=_0._R5.pop();_t[_2]=_5;}
else{_t.push(_5);_2=_t.length-1;}
return _2;},_R1:function(_2){var _0=ELEM;_0._k0[_2]=[];_0._W1[_2]={};_0._j0[_2]=[];_0._C0[_2]={};_0._R0[_2]=false;},bindId:function(_s6){var _0=ELEM,_5=document.getElementById(_s6),_6=_0._25(_5);_0._R1(_6);return _6;},bind:function(_5){var _0=ELEM,_2=_0._25(_5);_0._R1(_2);return _2;},_Sa:function(_2,_5){var _0=ELEM;_0._t[_2]=_5;},get:function(_2){return ELEM._t[_2];},setHTML:function(_2,_Q1){try{var _0=ELEM;if(!_0._t[_2]){return;}
if(!((typeof _Q1==='string')||(typeof _Q1==='number'))){return;}
_0._t[_2].innerHTML=_Q1;}catch(e){}},getHTML:function(_2){try{var _0=ELEM;if(_0._t[_2]){return _0._t[_2].innerHTML;}}catch(e){}
return'';},_r6:function(_E){if(!ELEM._S1){return null;}
var _0=ELEM,_X=_0._X;if(!_X[_E]){_X._m9.push(_E);_X[_E]=[];_X[_E]._Z8=1;_X[_E]._S8=0;_X[_E]._O0=_0.make(_0._O0,'div');}
return _X[_E]._O0;},del:function(_2){var _0=ELEM,_5=_0._t[_2];if(_0._P1){_0.del(_2);}
_0._P1=true;if(_0._S1){var _E=_5.tagName,_O0=_0._r6(_E),_X=_0._X[_E];_0.append(_2,_O0);}
var _t6=_0._P0.indexOf(_2);if(_t6!==-1){_0._P0.splice(_t6,1);}
_0._R1(_2);if(_0._S1){_X._Z8++;_X.push(_2);}else{_0._R5.push(_2);var _u6=_5.parentNode;if(_u6!==null){_u6.removeChild(_5);}
_5=null;_0._t[_2]=null;}
_0._P1=false;},append:function(_v6,_B1){var _0=ELEM,_s0=_0._t[_v6],_O8=_0._t[_B1];_O8.appendChild(_s0);},setCSS:function(_2,_D0){ELEM._t[_2].style.cssText=_D0;},getCSS:function(_2){return ELEM._t[_2].style.cssText;},getVisibleSize:function(_2){var _p2,_0=ELEM,_5=_0._t[_2],w=_5.offsetWidth,h=_5.offsetHeight,_h=_5.parentNode;while(_h&&_h.nodeName.toLowerCase()!=='body'){if(!_0._E0){_p2=document.defaultView.getComputedStyle(_h,null).getPropertyValue('overflow');}
else{_p2=_h.currentStyle.getAttribute('overflow');}
_p2=_p2!=='visible';if(w>_h.clientWidth&&_p2){w=_h.clientWidth-_5.offsetLeft;}
if(h>_h.clientHeight&&_p2){h=_h.clientHeight-_5.offsetTop;}
_5=_5.parentNode;_h=_5.parentNode;}
return[w,h];},getSize:function(_2){var _0=ELEM,_5=_0._t[_2],w=_5.offsetWidth,h=_5.offsetHeight;return[w,h];},getScrollSize:function(_2){var _0=ELEM,_5=_0._t[_2],w=_5.scrollWidth,h=_5.scrollHeight;return[w,h];},getVisiblePosition:function(_2){var _0=ELEM,x=0,y=0,_5=_0._t[_2];while(_5!==document){x+=_5.offsetLeft;y+=_5.offsetTop;x-=_5.scrollLeft;y-=_5.scrollTop;_5=_5.parentNode;if(!_5){break;}}
return[x,y];},getOpacity:function(_2){var _00,_i5,_0=ELEM,_l5=_0.getStyle;if(_00===_l5(_2,'-khtml-opacity')){return parseFloat(_00);}
if(_00===_l5(_2,'-moz-opacity')){return parseFloat(_00);}
_i5=_l5(_2,'opacity',true);if(_00===_i5||(_i5===0)){return parseFloat(_00);}
if(_00===(_0._t[_2].currentStyle['filter']||'').match(/alpha(opacity=(.*))/)){if(_00[1]){return parseFloat(_00[1])/100;}}
return 1.0;},setOpacity:function(_2,_00){var _0=ELEM;if(_00===1&&_0._A1){_0._t[_2].style.setAttribute('filter',_0.getStyle(_2,'filter',true).replace(/alpha([^)]*)/gi,''));}
else{if(_00<0.01){_00=0;}
if(_0._A1){_0._t[_2].style.setAttribute('filter',_0.getStyle(_2,'filter',true).replace(/alpha([^)]*)/gi,'')+'alpha(opacity='+_00*100+')');}
else if(_0._E0){(_0._t[_2].style.setAttribute('opacity',_00));}
else{_0._t[_2].style.setProperty('opacity',_00,'');}}},getIntStyle:function(_2,_7){var _1=ELEM.getStyle(_2,_7);return parseInt(_1,10);},setBoxCoords:function(_2,_r0){ELEM.setStyle(_2,'left',_r0[0]+'px');ELEM.setStyle(_2,'top',_r0[1]+'px');ELEM.setStyle(_2,'width',_r0[2]+'px');ELEM.setStyle(_2,'height',_r0[3]+'px');},getExtraWidth:function(_2){var _61=ELEM.getIntStyle;return _61(_2,'padding-left')+_61(_2,'padding-right')+_61(_2,'border-left-width')+_61(_2,'border-right-width');},getExtraHeight:function(_2){var _61=ELEM.getIntStyle;return _61(_2,'padding-top')+_61(_2,'padding-bottom')+_61(_2,'border-top-width')+_61(_2,'border-bottom-width');},setFPS:function(_T0){var _0=ELEM;_0._71=1000/_T0;if(_0._71<ELEMTickerInterval){_0._71=ELEMTickerInterval;}},setSlowness:function(_k3){ELEM._k3=_k3;},setIdleDelay:function(_i3){ELEM._i3=_i3;},_t2:false,flushLoop:function(_N0){var _0=ELEM;_0._H3++;if(_0._A1&&(_0._H3%5===0)&&_0._t2){iefix._F3();_0._t2=false;}
clearTimeout(_0._72);if(_0._P1){_N0*=2;_0._72=setTimeout(function(){ELEM.flushLoop(_N0);},_N0);return;}else{if(!_0._j3){if(_0._A1&&_0._t2){iefix._F3();_0._t2=false;}
_0._72=setTimeout(function(){ELEM.flushLoop(_N0);},_0._i3);return;}
_N0=parseInt(_0._k3*(_0._D5/_0._h6),ELEMTickerInterval);if(_N0<_0._71||!_N0){_N0=_0._71;}
_0._P1=true;_0._72=setTimeout(function(){ELEM.flushLoop(_N0);},_N0);}
_0._D5-=new Date().getTime();var i,_2,_P0=_0._P0,_B6=_P0.length,_y1=_P0.splice(0,_B6),_7b=new Date().getTime();for(i=0;i<_B6;i++){_0._ib++;_2=_y1.pop();_0._R0[_2]=false;_0._A5(_2);_0._Ca(_2);}
_0._h6++;_0._D5+=new Date().getTime();if(_0._P0.length===0&&_0._j3){_0._j3=false;}
_0._P1=false;},_Ca:function(_2){var _0=ELEM,_j0=_0._j0[_2],_C0=_0._C0[_2],_5=_0._t[_2],_7,_02,i,_D6=_j0.length,_y1=_j0.splice(0,_D6);for(i=0;i!==_D6;i++){_7=_y1.pop();_02=_C0[_7];_5.setAttribute(_7,_02);}},getAttr:function(_2,_7,_T){var _0=ELEM,_E6=_0._C0[_2][_7],_02;if(_E6!==undefined&&!_T){return _E6;}
var _5=_0._t[_2];if(_5.getAttribute(_7)===null){_5[_7]='';}
_02=_5.getAttribute(_7);_0._C0[_2][_7]=_02;return _02;},setAttr:function(_2,_7,_1,_T){var _0=ELEM,_j0=_0._j0[_2],_C0=_0._C0[_2],_Z1=_1!==_0.getAttr(_2,_7);if(_Z1){_C0[_7]=_1;if(_T){_0._t[_2].setAttribute(_7,_1);}
else{if(_j0.indexOf(_7)===-1){_j0.push(_7);}
if(!_0._R0[_2]){_0._P0.push(_2);_0._R0[_2]=true;_0._E5();}}}},delAttr:function(_2,_7){var _Z1,_0=ELEM,_j0=_0._j0[_2],_C0=_0._C0[_2];delete _C0[_7];_0._t[_2].removeAttribute(_7);if(_j0.indexOf(_7)!==-1){_j0.splice(_j0.indexOf(_7,1));}
if(_0._R0[_2]){_0._P0.splice(_0._P0.indexOf(_2,1));_0._R0[_2]=false;_0._E5();}},hasClassName:function(_6,_G){var _d=ELEM.get(_6);if(!_d){return null;}
var _c1=_d.className.split(' ');return(_c1.indexOf(_G)!==-1);},addClassName:function(_6,_G){var _0=ELEM,_d=_0.get(_6);if(!_d){return;}
if(_d.className===''||_d.className===' '){_d.className=_G;}
else{var _c1=_d.className.split(' '),_x=_c1.indexOf(_G);if(_x===-1){_c1.push(_G);_d.className=_c1.join(' ');}}},removeClassName:function(_6,_G){var _0=ELEM,_d=_0.get(_6);if(!_d){return;}
if(!_0.hasClassName(_6,_G)){return;}
var _c1=_d.className.split(' '),_x=_c1.indexOf(_G);if(_x!==-1){_c1.splice(_x,1);_d.className=_c1.join(' ');}},_E5:function(){var _0=ELEM;if(!_0._j3){_0._j3=true;if(!_0._P1){clearTimeout(_0._72);_0._72=setTimeout(function(){ELEM.flushLoop(ELEM._71);},_0._71);}}},setStyle:function(_2,_7,_1,_T){var _0=ELEM,_H=_0._W1[_2],_I6=_0._t,_Z1,_k0;_0._za++;if(_H===undefined){_0._R1(_2);_H=_0._W1[_2];}
_Z1=_1!==_H[_7];if(_Z1){_0._ya++;_H[_7]=_1;if(_T){if(_7==='opacity'){_0.setOpacity(_2,_1);}
else{if(_0._E0){var _Q3=_7.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;});_I6[_2].style[_Q3]=_H[_7];}
else{_I6[_2].style.setProperty(_7,_H[_7],'');}}
if(_0._A1){if(iefix._Y5.indexOf(_7)!==-1){_0._t2=true;}}}
else{_R0=_0._R0;_k0=_0._k0[_2];if(_k0.indexOf(_7)===-1){_k0.push(_7);}
if(!_R0[_2]){_0._P0.push(_2);_R0[_2]=true;_0._E5();}}}},make:function(_B1,_E){if(_B1===undefined){_B1=0;}
if(_E===undefined){_E='DIV';}else{_E=_E.toUpperCase();}
var _0=ELEM,_5,_2;_0._c9++;if(_0._S1){if(_0._X[_E]){if(_0._X[_E].length!==0){_2=_0._X[_E].pop();_0._X[_E]._S8++;_5=_0._t[_2];if(_0._e9.indexOf(','+_E+',')!==-1){_0.setCSS(_2,'display:block;');}else{_0.setCSS(_2,'display:inline;');}
_0.append(_2,_B1);return _2;}}}
_5=document.createElement(_E);_0._t[_B1].appendChild(_5);_2=_0._25(_5);_0._R1(_2);return _2;},windowSize:function(){return[(window.innerWidth)?window.innerWidth:document.documentElement.clientWidth,(window.innerHeight)?window.innerHeight:document.documentElement.clientHeight];},getStyle:function(_2,_7,_T){var _0=ELEM,_H=_0._W1[_2],_w1;_0._e6++;if((_H[_7]===undefined)||_T){if(!_T){_0._f6++;}
if((_7==='opacity')&&_T){_w1=_0.getOpacity(_2);}
else{_w1=document.defaultView.getComputedStyle(_0._t[_2],null).getPropertyValue(_7);}
_H[_7]=_w1;}
return _H[_7];},_sa:function(_2,_7,_T){var _0=ELEM,_H=_0._W1[_2],_w1;_0._e6++;if((_H[_7]===undefined)||_T){if(!_T){_0._f6++;}
if((_7==='opacity')&&_T){_w1=_0.getOpacity(_2);}
else{_ra=_7.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;});_0._t[_2].currentStyle[_ra];}
_H[_7]=_w1;}
return _H[_7];},_A5:function(_2){var _0=ELEM,_k0=_0._k0[_2],_H=_0._W1[_2],_5=_0._t[_2],_l3,_w2,_I5,_7,_y1,_w1;if(!_5){return;}
_l3=_5.style;_w2=_k0.length;_y1=_k0.splice(0,_w2);for(_I5=0;_I5!==_w2;_I5++){_7=_y1.pop();_0._g6++;if(_7==='opacity'){_w1=_0.setOpacity(_2,_H[_7]);}
else{_l3.setProperty(_7,_H[_7],'');}}},_qa:function(_2){var _0=ELEM,_k0=_0._k0[_2],_H=_0._W1[_2],_5=_0._t[_2];if(!_5){return;}
var _l3=_5.style,_w2=_k0.length,i=0,_7,_y1=_k0.splice(0,_w2);for(;i!==_w2;i++){_7=_y1.pop();_0._g6++;if(_7==='opacity'){_0.setOpacity(_2,_H[_7]);}
else{if(_0._A1){if(iefix._Y5.indexOf(_7)!==-1){_0._t2=true;}}
try{var _Q3=_7.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;});_l3.setAttribute(_Q3,_H[_7]);}
catch(e){console.log(e);}}}},_L6:function(){var _0=ELEM,_81,_50,_L5;if(_0._E0){ELEM.getStyle=_0._sa;}
if(_0._E0){ELEM._A5=_0._qa;}
_0.bind(document.body);if(_0._S1){_0._O0=_0.make(0,'div');_0.setCSS(_0._O0,"display:none;visibility:hidden;");_0.setAttr(_0._O0,'id','trashcan_'+_0._O0);}
_0._72=setTimeout(function(){ELEM.flushLoop(ELEM._71);},_0._71);if(!_0._U1){return;}
while(_0._U1.length!==0){_81=_0._U1.shift();_50=(typeof _81);if(_50==='function'){_81.call();}
else if(_50==='string'){_L5=eval(_81);if(typeof _L5==='string'){_0._U1.push(_L5);}}}
_0._d6=true;},_pa:function(){var _0=ELEM,_L0=navigator.userAgent,_V3=(document.all&&_L0.indexOf("Opera")===-1),_W3=[['opera','_db',_L0.indexOf("Opera")!==-1],['safari','_la',_L0.indexOf("KHTML")!==-1],['symbian','_4b',_L0.indexOf("SymbianOS")!==-1],['chrome','_hb',_L0.indexOf("Chrome")!==-1],['ie','_E0',_V3],['ie6','_A1',_V3&&_L0.indexOf("MSIE 6")!==-1],['ie7','_gb',_V3&&_L0.indexOf("MSIE 7")!==-1],['ie8','_3b',_V3&&_L0.indexOf("MSIE 8")!==-1],['firefox','_qb',_L0.indexOf("Firefox")!==-1],['firefox2','_pb',_L0.indexOf("Firefox/2.")!==-1],['firefox3','_mb',_L0.indexOf("Firefox/3.")!==-1]],i=0,_P6,_Q6,_S5;for(;i<_W3.length;i++){_P6=_W3[i][0];_Q6=_W3[i][1];_S5=_W3[i][2];BROWSER_TYPE[_P6]=_S5;_0[_Q6]=_S5;}
_0._R6();},_8a:function(_81){var _0=ELEM,_50=(typeof _81);if(_0._d6===true){if(_50==='string'){eval(_81);}
else if(_50==='function'){_81.call();}}else{_0._U1.push(_81);}},_R6:function(){var _Wa=false,_0=ELEM;if(_0._E0){var _S6="javascript:void(0)";if(location.protocol==="https:"){_S6="src=//0";}
document.write("<scr"+"ipt id=_Y9 defer src="+_S6+"></scr"+"ipt>");var _O9=document.getElementById("_Y9");_O9.onreadystatechange=function(){if(this.readyState==="complete"){ELEM._S3=true;ELEM._L6();delete ELEM._U1;clearTimeout(ELEM._h3);delete ELEM._h3;}};return;}
else if((/KHTML|WebKit/i.test(navigator.userAgent))&&(/loaded|complete/.test(document.readyState))){_0._S3=true;}
else if(document.body){_0._S3=true;}
if(!_0._S3){_0._h3=setTimeout('ELEM._R6()',ELEMTickerInterval*10);}else{_0._L6();delete _0._U1;clearTimeout(_0._h3);delete _0._h3;}}};ELEM._l1();LOAD=ELEM._8a;ELEM._pa();Event={element:function(e){return e.target||e.srcElement;},pointerX:function(e){return e.pageX||e.clientX+document.documentElement.scrollLeft;},pointerY:function(e){return e.pageY||e.clientY+document.documentElement.scrollTop;},stop:function(e){if(e.preventDefault){e.preventDefault();e.stopPropagation();}
else{e.returnValue=false;e.cancelBubble=true;}},isLeftClick:function(e){if(ELEM._E0||ELEM._la){return(e.button===1);}
else{return(e.button===0);}},observers:false,_N9:function(_5,_i,_B,_B0){if(!Event.observers){Event.observers=[];}
if(_5.addEventListener){this.observers.push([_5,_i,_B,_B0]);_5.addEventListener(_i,_B,_B0);}
else if(_5.attachEvent){this.observers.push([_5,_i,_B,_B0]);_5.attachEvent("on"+_i,_B);}},unloadCache:function(){if(!Event.observers){return;}
var i,l=Event.observers.length;for(i=0;i<l;i++){Event.stopObserving.apply(this,Event.observers[0]);}
Event.observers=false;},observe:function(_5,_i,_B,_B0){_B0=_B0||false;Event._N9(_5,_i,_B,_B0);},stopObserving:function(_5,_i,_B,_B0){if(_5===undefined){console.log('Warning Event.stopObserving of event name: "'+_i+'" called with an undefined elem!');return;}
_B0=_B0||false;if(_5['removeEventListener']){_5.removeEventListener(_i,_B,_B0);}
else if(detachEvent){_5.detachEvent("on"+_i,_B);}
var i=0;while(i<Event.observers.length){var eo=Event.observers[i];if(eo&&eo[0]===_5&&eo[1]===_i&&eo[2]===_B&&eo[3]===_B0){Event.observers[i]=null;Event.observers.splice(i,1);}
else{i++;}}},KEY_BACKSPACE:8,KEY_TAB:9,KEY_RETURN:13,KEY_ESC:27,KEY_LEFT:37,KEY_UP:38,KEY_RIGHT:39,KEY_DOWN:40,KEY_DELETE:46,KEY_HOME:36,KEY_END:35,KEY_PAGEUP:33,KEY_PAGEDOWN:34};if(ELEM._E0){Event.observe(window,"unload",Event.unloadCache,false);}
_V6={mouseMove:false,mouseDown:false,click:false,mouseUp:false,draggable:false,droppable:false,keyDown:false,keyUp:false,mouseWheel:false,textEnter:false};EVENT={status:[false,false,0,0,[],false,false,false],button1:0,button2:1,crsrX:2,crsrY:3,keysDown:4,altKeyDown:5,ctrlKeyDown:6,shiftKeyDown:7,enableDroppableChecks:true,startDroppable:function(){var _0=EVENT;_0.hovered=[];_0.hoverInterval=50;_0.hoverTimer=new Date().getTime();},start:function(){var _M9=ELEM._E0?document:window,_0=EVENT,_P5=[['mousemove',_0.mouseMove],['mouseup',_0.mouseUp],['mousedown',_0.mouseDown],['click',_0.click],['keyup',_0.keyUp],['keydown',_0.keyDown],['keypress',_0.keyPress],['contextmenu',_0.contextMenu],['resize',_0.resize],['mousewheel',_0.mouseWheel]],i=0;for(;i!==_P5.length;i++){Event.observe(_M9,_P5[i][0],_P5[i][1]);}
if(window.addEventListener){window.addEventListener('DOMMouseScroll',EVENT.mouseWheel,false);window.addEventListener('resize',EVENT.resize,false);}
_0.listeners=[];_0.focused=[];_0.resizeListeners=[];_0.coordListeners=[];_0.focusOptions={};_0.dragItems=[];if(_0.enableDroppableChecks){_0.startDroppable();}
_0.topmostDroppable=null;_0.textEnterCtrls=[];_0._A2=[];_0._K9=true;_0._W6=null;_0.activeControl=null;_0._Z4=null;},coordCacheFlush:function(_6){if(_6){EVENT._A2[_6]=null;}
else{EVENT._A2=[];}},reg:function(_a,_41){var _6,_5,_0=EVENT,_a4;_6=_a.elemId;_5=ELEM.get(_6);if(ELEM._E0){_5.setAttribute('ctrl',_a);}
else{_5.ctrl=_a;}
_0.listeners[_6]=true;_0.focused[_6]=false;for(_a4 in _V6){if(_41[_a4]===undefined){_41[_a4]=_V6[_a4];}}
_0.focusOptions[_6]=_41;var _05=_0.coordListeners.indexOf(_6);if(_41.mouseMove){if(_05===-1){_0.coordListeners.push(_6);}}
else if(_05!==-1){_0.coordListeners.splice(_05,1);}
if(_41.textEnter){if(_0.textEnterCtrls.indexOf(_a.viewId)===-1){_0.textEnterCtrls.push(_a.viewId);}}
if(_41.resize){if(_0.resizeListeners.indexOf(_a.viewId)===-1){_0.resizeListeners.push(_a.viewId);}}
Event.observe(_5,'mouseover',_0._B2);},unreg:function(_a){var _0=EVENT,_6,_5;if(_a===this.activeControl){_0.changeActiveControl(null);}
_6=_a.elemId;_5=ELEM.get(_6);this.listeners[_6]=false;this.focused[_6]=false;this._A2[_6]=null;var _Y6=_0.textEnterCtrls.indexOf(_a.viewId);if(_Y6!==-1){_0.textEnterCtrls.splice(_Y6,1);}
var _Z6=_0.resizeListeners.indexOf(_a.viewId);if(_Z6!==-1){_0.resizeListeners.splice(_Z6,1);}
if(_5!==undefined){Event.stopObserving(_5,'mouseover',_0._B2);}},resize:function(e){var i=0,_0=EVENT,_07,_a;for(;i<_0.resizeListeners.length;i++){_07=_0.resizeListeners[i];_a=HSystem.views[_07];if(_a['onResize']){_a.onResize();}}},_B2:function(e){if(!Event.element){return;}
var _u=Event.element(e);while(_u&&_u.ctrl===undefined){_u=_u.parentNode;}
if(!_u){return;}
var _0=_u.ctrl;EVENT.focus(_0);Event.stop(e);},_N3:function(e){if(!Event.element){return;}
var _u=Event.element(e);while(_u&&_u.ctrl===undefined){_u=_u.parentNode;}
if(!_u){return;}
var _0=_u.ctrl;EVENT.blur(_0);Event.stop(e);},focus:function(_a){var _0=EVENT,_6=_a.elemId,_5=ELEM.get(_6);if(_0.focused[_6]===false&&_0.dragItems.indexOf(_6)===-1){Event.stopObserving(_5,'mouseover',_0._B2);Event.observe(_5,'mouseout',_0._N3);_0.focused[_6]=true;if(_a['focus']){_a.focus();}}},blur:function(_a){var _0=EVENT,_6=_a.elemId,_5=ELEM.get(_6);if(_0.focused[_6]===true&&_0.dragItems.indexOf(_6)===-1){Event.stopObserving(_5,'mouseout',_0._N3);Event.observe(_5,'mouseover',_0._B2);_0.focused[_6]=false;if(_a['blur']){_a.blur();}}},mouseMove:function(e){var _0=EVENT,x=Event.pointerX(e),y=Event.pointerY(e),_O3=_0.flushMouseMove(x,y);_0.status[_0.crsrX]=x;_0.status[_0.crsrY]=y;_0._k2(e);if(_O3){Event.stop(e);}},flushMouseMove:function(x,y){var _0=EVENT,_O3=false,i=0,j,_6,_a;clearTimeout(_0._W6);for(;i!==_0.dragItems.length;i++){_6=_0.dragItems[i];_0.focusOptions[_6].ctrl.drag(x,y);_0.coordCacheFlush(_6);_O3=true;}
if(_0.enableDroppableChecks){if(new Date().getTime()>_0.hoverTimer+_0.hoverInterval){for(i=0;i!==_0.coordListeners.length;i++){_6=_0.coordListeners[i];_a=_0.focusOptions[_6].ctrl;_a.mouseMove(x,y);}
if(_0.enableDroppableChecks){_0._17();}
var _T3;for(i=0;i!==_0.dragItems.length;i++){_T3=_0.topmostDroppable;_0.topmostDroppable=null;_6=_0.dragItems[i];_a=_0.focusOptions[_6].ctrl;var _Z3,_m3;for(j=0;j!==_0.hovered.length;j++){_Z3=_0.hovered[j];if(_Z3!==_6&&_0.focusOptions[_Z3].ctrl){_m3=_0.focusOptions[_Z3].ctrl;if(!_0.topmostDroppable||_m3.zIndex()>_0.topmostDroppable.zIndex()||_m3.supr===_0.topmostDroppable){if(_0.focusOptions[_m3.elemId].droppable){_0.topmostDroppable=_m3;}}}}
if(_T3!==_0.topmostDroppable){if(_T3){_T3.endHover(_a);}
if(_0.topmostDroppable){_0.topmostDroppable.startHover(_a);}}}
_0.hoverTimer=new Date().getTime();}
else{_0._W6=setTimeout(function(){EVENT.flushMouseMove(x,y);},_0.hoverInterval);}}
return _O3;},_17:function(){var _0=EVENT,x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],i=0,_a,_5,_L1,_o0,_r0;_0.hovered=[];for(;i!==_0.listeners.length;i++){if(!_0.listeners[i]||!_0.focusOptions[i].ctrl){continue;}
_a=_0.focusOptions[i].ctrl;_5=ELEM.get(i);if(!_0._K9||!_0._A2[i]){_L1=ELEM.getVisiblePosition(_a.elemId);_o0=ELEM.getVisibleSize(_a.elemId);_0._A2[i]=[_L1[0],_L1[1],_o0[0],_o0[1]];}
_r0=_0._A2[i];if(x>=_r0[0]&&x<=_r0[0]+_r0[2]&&y>=_r0[1]&&y<=_r0[1]+_r0[3]){_0.hovered.push(i);}}},startDragging:function(_a){var _0=EVENT;_0.dragItems.push(_a.elemId);_0.changeActiveControl(_a);_a.startDrag(_0.status[_0.crsrX],_0.status[_0.crsrY]);},mouseDown:function(e,_K0){var _0=EVENT,_27=false,x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],i=0,_a0=null,_74=[],_84=[];_0._k2(e);if(_K0===undefined){_K0=Event.isLeftClick(e);}
if(_K0){_0.status[_0.button1]=true;}
else{_0.status[_0.button2]=true;}
for(;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].ctrl.enabled){_a0=_0.focusOptions[i].ctrl;}
if((_0.focusOptions[i].draggable===true)&&_0.dragItems.indexOf(i)===-1){_74.push(i);}
else if(_0.focusOptions[i].mouseDown===true){_84.push(i);}}}
if(_a0){_0.changeActiveControl(_a0);}
for(i=0;i!==_74.length;i++){_0.dragItems.push(_74[i]);_0.focusOptions[_74[i]].ctrl.startDrag(x,y);_27=true;}
var _n3=_84.length;for(i=0;i!==_84.length;i++){if(_0.focusOptions[_84[i]].ctrl.mouseDown(x,y,_K0)){_n3--;}}
if(_27){document.body.focus();_0._x9=document.onselectstart;document.onselectstart=function(){return false;};Event.stop(e);}
if(this.enableDroppableChecks){if((_n3===0)&&(_0.hovered.length!==0)&&(_a0&&(_a0.textElemId===false))){Event.stop(e);}}
return true;},click:function(e,_K0){var _0=EVENT,x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],i=0,_a0=null,_c4=[];_0._k2(e);if(_K0===undefined){_K0=Event.isLeftClick(e);}
if(_K0){_0.status[_0.button1]=true;}
else{_0.status[_0.button2]=true;}
for(;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].ctrl.enabled){_a0=_0.focusOptions[i].ctrl;}
if(_0.focusOptions[i].click===true){_c4.push(i);}}}
if(_a0){_0.changeActiveControl(_a0);}
var _n3=_c4.length;for(i=0;i!==_c4.length;i++){if(_0.focusOptions[_c4[i]].ctrl.click(x,y,_K0)){_n3--;}}
if(_0.enableDroppableChecks){if((_n3===0)&&(_0.hovered.length!==0)&&(_a0&&(_a0.textElemId===false))){Event.stop(e);}}
return true;},changeActiveControl:function(_a){var _0=EVENT,_o3=_0.activeControl;if(_a!==_o3){if(_o3){_o3.active=false;_o3._47(_a);}
_0.activeControl=null;if(_a){_a.active=true;_0.activeControl=_a;_a._57(_o3);}}},mouseUp:function(e){var _0=EVENT,_67=false,_K0=Event.isLeftClick(e),x=_0.status[_0.crsrX],y=_0.status[_0.crsrY],_6,_a,i=0;_0._k2(e);_0.status[_0.button1]=false;_0.status[_0.button2]=false;for(;i!==_0.dragItems.length;i++){_6=_0.dragItems[i];_a=_0.focusOptions[_6].ctrl;_a.endDrag(x,y);_67=true;if(_0.enableDroppableChecks){_0._17();if(_0.hovered.indexOf(_6)===-1){_0.blur(_a);}}
if(_0.topmostDroppable){_0.topmostDroppable.endHover(_a);_0.topmostDroppable.drop(_a);_0.topmostDroppable=null;}}
_0.dragItems=[];if(_67){document.onselectstart=_0._x9;}
for(i=0;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].mouseUp===true){_0.focusOptions[i].ctrl.mouseUp(x,y,_K0);}}}
return true;},keyDown:function(e){var _0=EVENT,_n1=e.keyCode;_0._k2(e);if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyDown===true){Event.stop(e);if(_0._Z4!==_n1){_0.activeControl.keyDown(_n1);}}
if(_0.status[_0.keysDown].indexOf(_n1)===-1){_0.status[_0.keysDown].push(_n1);}
_0._Z4=_n1;},keyUp:function(e){var _0=EVENT,_n1=e.keyCode,_55,i=0,_V2,_a;_0._k2(e);_0._Z4=null;if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyUp===true){_0.activeControl.keyUp(_n1);}
_55=_0.status[_0.keysDown].indexOf(_n1);if(_55!==-1){_0.status[_0.keysDown].splice(_55,1);}
for(;i<_0.textEnterCtrls.length;i++){_V2=_0.textEnterCtrls[i];_a=HSystem.views[_V2];if(_a.textEnter){_a.textEnter();}}},keyPress:function(e){var _0=EVENT;if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyDown===true){Event.stop(e);}},mouseWheel:function(e){var _0=EVENT,_V=0,i=0;if(!e){e=window.event;}
if(e.wheelDelta){_V=0-(e.wheelDelta/120);}
else if(e.detail){_V=0-(e.detail/3);}
if(BROWSER_TYPE.opera){_V=0-_V;}
for(;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].mouseWheel===true){Event.stop(e);_0.focusOptions[i].ctrl.mouseWheel(_V);}}}},contextMenu:function(e){EVENT.mouseDown(e,false);Event.stop(e);},_k2:function(e){var _0=EVENT;_0.status[_0.altKeyDown]=e.altKey;_0.status[_0.ctrlKeyDown]=e.ctrlKey;_0.status[_0.shiftKeyDown]=e.shiftKey;}};LOAD(function(){EVENT.start();});SHAClass=HClass.extend({constructor:function(_Z){_Z&&this.setChrsz(_Z);},_65:0,hexCase:function(){return this._65;},setHexCase:function(_77){this._65=_77;},_75:"=",base64Pad:function(){return this._75;},setBase64Pad:function(_87){this._75=_87;},_Z:8,chrsz:function(){return this._Z;},setChrsz:function(_97){this._Z=_97;},hexSHA1:function(_J0){var _0=this;return _0._a7(_0._F2(_0._n2(_J0),_J0.length*_0._Z));},b64SHA1:function(_J0){var _0=this;return _0._a5(_0._F2(_0._n2(_J0),_J0.length*_0._Z));},strSHA1:function(_J0){var _0=this;return _0._b7(_0._F2(_0._n2(_J0),_J0.length*_0._Z));},hexHmacSHA1:function(_7,_s){var _0=this;return _0._a7(_0._c5(_7,_s));},b64HmacSHA1:function(_7,_s){var _0=this;return _0._a5(_0._c5(_7,_s));},strHmacSHA1:function(_7,_s){var _0=this;return _0._b7(_0._c5(_7,_s));},str2Base64:function(_p){var _0=this;return _0._a5(_0._n2(_p));},test:function(){return this.hexSHA1("abc")==="a9993e364706816aba3e25717850c26c9cd0d89d";},_F2:function(_n,_d0){var _0=this;_n[_d0>>5]|=0x80<<(24-_d0%32);_n[((_d0+64>>9)<<4)+15]=_d0;var _52=new Array(80),_O1=1732584193,_m0=-271733879,_p0=-1732584194,_t0=271733878,_G2=-1009589776,i,_e7,_f7,_g7,_h7,_i7,j,_W0;for(i=0;i<_n.length;i+=16){_e7=_O1;_f7=_m0;_g7=_p0;_h7=_t0;_i7=_G2;for(j=0;j<80;j++){if(j<16){_52[j]=_n[i+j];}
else{_52[j]=_0._h5(_52[j-3]^_52[j-8]^_52[j-14]^_52[j-16],1);}
_W0=_0._b1(_0._b1(_0._h5(_O1,5),_0._p9(j,_m0,_p0,_t0)),_0._b1(_0._b1(_G2,_52[j]),_0._n9(j)));_G2=_t0;_t0=_p0;_p0=_0._h5(_m0,30);_m0=_O1;_O1=_W0;}
_O1=_0._b1(_O1,_e7);_m0=_0._b1(_m0,_f7);_p0=_0._b1(_p0,_g7);_t0=_0._b1(_t0,_h7);_G2=_0._b1(_G2,_i7);}
return[_O1,_m0,_p0,_t0,_G2];},_p9:function(_W0,_m0,_p0,_t0){if(_W0<20){return(_m0&_p0)|((~_m0)&_t0);}
if(_W0<40){return _m0^_p0^_t0;}
if(_W0<60){return(_m0&_p0)|(_m0&_t0)|(_p0&_t0);}
return _m0^_p0^_t0;},_n9:function(_W0){return(_W0<20)?1518500249:(_W0<40)?1859775393:(_W0<60)?-1894007588:-899497514;},_c5:function(_7,_s){var _0=this,_p3=_0._n2(_7),_l7=new Array(16),_m7=new Array(16),i,_U0;if(_p3.length>16){_p3=_0._F2(_p3,_7.length*_0._Z);}
for(i=0;i<16;i++){_l7[i]=_p3[i]^0x36363636;_m7[i]=_p3[i]^0x5C5C5C5C;}
_U0=_0._F2(_l7.concat(_0._n2(_s)),512+_s.length*_0._Z);return _0._F2(_m7.concat(_U0),512+160);},_b1:function(_n,_j){var _n7=(_n&0xFFFF)+(_j&0xFFFF),_a9=(_n>>16)+(_j>>16)+(_n7>>16);return(_a9<<16)|(_n7&0xFFFF);},_h5:function(_o7,_p7){return(_o7<<_p7)|(_o7>>>(32-_p7));},_n2:function(_p){var _0=this,_q3=[],_o5=(1<<_0._Z)-1,_49=_p.length*_0._Z,i;for(i=0;i<_49;i+=_0._Z){_q3[i>>5]|=(_p.charCodeAt(i/_0._Z)&_o5)<<(32-_0._Z-i%32);}
return _q3;},_b7:function(_q3){var _0=this,_p="",_o5=(1<<_0._Z)-1,i,_q5=_q3.length*32,_39=32-_0._Z;for(i=0;i<_q5;i+=_0._Z){_p+=String.fromCharCode((_q3[i>>5]>>>(_39-i%32))&_o5);}
return _p;},_a7:function(_e1){var _0=this,_q7=_0._65?"0123456789ABCDEF":"0123456789abcdef",_p="",i,_s5=_e1.length*4;for(i=0;i<_s5;i++){_p+=_q7.charAt((_e1[i>>2]>>((3-i%4)*8+4))&0xF)+
_q7.charAt((_e1[i>>2]>>((3-i%4)*8))&0xF);}
return _p;},_a5:function(_e1){var _0=this,_k1="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_p="",i,_s5=_e1.length*4,_r7,_s7,_cb,_t7,j,_q5=_e1.length*32;for(i=0;i<_s5;i+=3){_r7=(((_e1[i>>2]>>8*(3-i%4))&0xFF)<<16);_s7=(((_e1[i+1>>2]>>8*(3-(i+1)%4))&0xFF)<<8);_X8=((_e1[i+2>>2]>>8*(3-(i+2)%4))&0xFF);_t7=(_r7|_s7|_X8);for(j=0;j<4;j++){if(i*8+j*6>_q5){_p+=_0._75;}
else{_p+=_k1.charAt((_t7>>6*(3-j))&0x3F);}}}
return _p;}});SHA=SHAClass.nu(16);HSystem=HClass.extend({windowFocusBehaviour:1,constructor:null,apps:[],appPriorities:[],busyApps:[],freeAppIds:[],defaultInterval:10,defaultPriority:20,viewsZOrder:[],ticks:0,maxAppRunTime:5000,scheduler:function(){for(var _l=0;_l<this.apps.length;_l++){if(this.apps[_l]){if(!this.busyApps[_l]){if((this.ticks%this.appPriorities[_l])===0){if(HSystem.apps[_l]){HSystem.apps[_l]._x4();}}}}}
if(this._j1.length!==0){this._G8();}},ticker:function(){this.ticks++;this.scheduler();this._Ha=setTimeout(function(){HSystem.ticker();},this.defaultInterval);},addApp:function(_y0,_S){var _l;if(this.freeAppIds.length!==0){_l=this.freeAppIds.unshift();this.apps[_l]=_y0;}else{this.apps.push(_y0);_l=this.apps.length-1;}
_y0.parent=this;_y0.parents=[this];_y0.appId=_l;this.startApp(_l,_S);return _l;},startApp:function(_l,_S){if(_S===undefined){_S=this.defaultInterval;}
this.appPriorities[_l]=_S;this.busyApps[_l]=false;},stopApp:function(_l){this.busyApps[_l]=true;},reniceApp:function(_l,_S){this.appPriorities[_l]=_S;},killApp:function(_l,_V4){if(!_V4){var _q6=new Date().getTime();while(this.busyApps[_l]===true){if(new Date().getTime()>_q6+this.maxAppRunTime){break;}}}
this.busyApps[_l]=true;this.apps[_l].destroyAllViews();this.apps[_l]=null;this.freeAppIds.push(_l);},views:[],_f3:[],addView:function(_c){var _f2;if(this._f3.length===0){_f2=this.views.length;this.views.push(_c);}
else{_f2=this._f3.pop();this.views[_f2]=_c;}
return _f2;},delView:function(_e){this.views[_e]=null;this._f3.push(_e);},activeWindowId:0,windowFocus:function(_c){if(!_c){this.activeWindowId=0;return;}
var _K2=this.activeWindowId,_R=this.views,_e=_c.viewId;if(_R[_K2]){if(_R[_K2]["windowBlur"]){_R[_K2].windowBlur();}}
this.activeWindowId=_e;_c.bringToFront();_c.windowFocus();},_j1:[],updateZIndexOfChildren:function(_e){if(this._j1.indexOf(_e)===-1){this._j1.push(_e);}},_G8:function(){var j=0,_0=HSystem,_W4=this._j1,_36=_W4.length;for(;j<_36;j++){var _e=_W4.shift(),_R=((_e===null)?(_0.viewsZOrder):(_0.views[_e].viewsZOrder)),_46=_R.length,_v1=ELEM.setStyle,_P3=_0.views,_P4,_c,_56='elemId',_66='z-index',i=0,_6;for(;i<_46;i++){_P4=_R[i];_c=_P3[_P4];_6=_c[_56];_v1(_6,_66,i);}}}});LOAD(function(){HSystem.ticker();});HApplication=HClass.extend({componentBehaviour:['app'],constructor:function(_S,_f){this.viewId=null;this.views=[];this.markupElemIds=[];this.viewsZOrder=HSystem.viewsZOrder;HSystem.addApp(this,_S);if(_f){this.label=_f;}
else{this.label='ProcessID='+this.appId;}},buildParents:function(_e){var _c=HSystem.views[_e],i=0;_c.parent=this;_c.parents=[];for(;i<this.parents.length;i++){_c.parents.push(this.parents[i]);}
_c.parents.push(this);},addView:function(_c){var _e=HSystem.addView(_c);this.views.push(_e);this.buildParents(_e);this.viewsZOrder.push(_e);return _e;},removeView:function(_e){HSystem.views[_e].remove();},destroyView:function(_e){HSystem.views[_e].die();},die:function(){HSystem.killApp(this.appId,false);},destroyAllViews:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].die();}},_76:function(){var i,_e,_c;for(i=0;i<this.views.length;i++){_e=this.views[i];_c=HSystem.views[_e];if((_c!==null)&&(_c['onIdle']!==undefined)){_c.onIdle();}}},_x4:function(){HSystem.busyApps[this.appId]=true;this.onIdle();this._76();HSystem.busyApps[this.appId]=false;},onIdle:function(){}});COMM={_Na:function(){alert("'ERROR: This web browser doesn't support XMLHttpRequest. Please upgrade; unable to continue.");},_w4:function(_0){if(_0.X.readyState===4){var _i2=_0.X.status,_A4='on'+_i2,_x8=((_i2>=200&&_i2<300)||(_i2===0));_0[_A4]?_0[_A4](_0):_x8?_0.onSuccess(_0):_0.onFailure(_0);}},_b3:function(_D1){var i=0,_w0=_D1.length,_c3='';for(;i<_w0;i++){_c3+=encodeURIComponent(_D1[i]);_c3+=(i===_w0-1)?'':(i%2===0)?'=':'&';}
return _c3;},request:function(_y,_4){var _b2=COMM,_0=_4?_4:{},_e0=_4.method?_4.method.toUpperCase():'GET',_a1=(_4.async===undefined)?true:_4.async,_D1=_4.params?_4.params:[],_d3=_4.headers?_4.headers:{},_V0=_4.contentType?_4.contentType:'application/x-www-form-urlencoded',_B8=_4.charset?_4.charset:'UTF-8',_C8=_4.username?_4.username:null,_D8=_4.username?_4.password:null;if(!_4.onFailure){_0.onFailure=function(resp){console.log('No failure handler specified, response: ',resp);};}
if(!_4.onSuccess){_0.onSuccess=function(resp){console.log('No success handler specified, response: ',resp);};}
_0.url=_y;_0.options=_4;_0.X=_b2._e3();if(_e0==='GET'&&_D1.length!==0){_y+=((_y.indexOf('?')!==-1)?'&':'?')+_b2._b3(_D1);}
if(!_a1){console.log("WARNING: Synchronous "+_e0+" request to "+_y+", these will fail on the Symbian web browser.");}
_0.X.open(_e0,_y,_a1,_C8,_D8);_0.X.onreadystatechange=function(){_b2._w4(_0);};if(_e0==='POST'){_d3['Content-Type']=_V0+'; charset='+_B8;var _54=_4.body?_4.body:'';for(var _D4 in _d3){_0.X.setRequestHeader(_D4,_d3[_D4]);}
_0.X.send(_54);}
else if(_e0==='GET'){_0.X.send(null);}
if(!_a1){_b2._w4(_0);}
return _0;}};if(window['XMLHttpRequest']!==undefined){COMM._e3=function(){return new XMLHttpRequest();};}
else if(BROWSER_TYPE.ie){COMM._e3=function(){return new ActiveXObject("Msxml2.XMLHTTP");};}
else{COMM._e3=function(){console.log("No XMLHttpRequest object types known. Can't Communicate.");return new COMM._Ga();};}
COMM.Queue=HApplication.extend({constructor:function(){this.commandQueue=[];this.paused=false;this.base(10);},onIdle:function(){!this.paused&&this.commandQueue.length!==0&&this.flush();},pause:function(){this.paused=true;},resume:function(){this.paused=false;this.flush();},STRINGS:{ERR:'COMM.Queue Error: ',JS_EXEC_FAIL:'Failed to execute the Javascript function: ',REASON:' Reason:'},flush:function(){var i=0,_r,_B,_z0,_d0=this.commandQueue.length;for(;i<_d0;i++){if(this.paused){break;}
_r=this.commandQueue.shift();try{if(typeof _r==='function'){_r.call();}
else{_B=_r[0];_z0=_r[1];_B.call(_0b);}}
catch(e){var _v5=this.STRINGS;console.log([_v5.ERR_PREFIX,_v5.JS_EXEC_FAIL,_r,_v5.REASON,e.description].join(''));}}},unshift:function(_B,_z0){if(_z0!==undefined){this.commandQueue.unshift([_B,_z0]);}
else{this.commandQueue.unshift(_B);}},push:function(_B,_z0){if(_z0!==undefined){this.commandQueue.push([_B,_z0]);}
else{this.commandQueue.push(_B);}},unshiftEval:function(_x5,_z0){var _B;eval('_B = function(){'+_x5+'}');this.unshift(_B);},pushEval:function(_x5){var _B;eval('_B = function(){'+_x5+'}');this.push(_B);}}).nu();COMM.Session=HClass.extend({constructor:function(){var _0=this;_0.sha=SHAClass.nu(8);_0.sha_key=_0.sha.hexSHA1(((new Date().getTime())*Math.random()*1000).toString());_0.ses_key='0:.o.:'+_0.sha_key;_0.req_num=0;},newKey:function(_E2){var _0=this,_v7=_0.sha.hexSHA1(_E2+_0.sha_key);_0.req_num++;_0.ses_key=_0.req_num+':.o.:'+_v7;_0.sha_key=_v7;}}).nu();COMM.Transporter=HApplication.extend({constructor:function(){var _0=this;this.serverLostMessage='Server Connection Lost: Reconnecting...';_0.label='Transporter';_0.url=false;_0.busy=false;_0.stop=true;_0._C2=false;_0._w5=false;_0._Ua=false;_0.base(1);},onIdle:function(){this.sync();},poll:function(_R8){HSystem.reniceApp(this.appId,_R8);},getClientEvalError:function(){var _0=COMM.Transporter;return _0._w5?'&err_msg='+
COMM.Values._w7(_0._w5):'';},success:function(resp){var _0=COMM.Transporter;if(!resp.X.responseText){_0.failure(resp);return;}
var _r3=eval(resp.X.responseText),i=1,_T8=_r3.length,_E2=_r3[0],_U8=COMM.Session,_q1=COMM.Queue;if(_E2===''){console.log('Invalid session, error message should follow...');}
else{_U8.newKey(_E2);}
for(;i<_T8;i++){try{_q1.pushEval(_r3[i]);}
catch(e){console.log('clientError:'+e+" - "+e.description+' - '+_r3[i]);_0._w5=e+" - "+e.description+' - '+_r3[i];}}
if(_0._C2){_0._C2.die();_0._C2=false;}
_q1.push(function(){COMM.Transporter.flushBusy();});_q1.flush();},flushBusy:function(){var _0=COMM.Transporter;_0.busy=false;COMM.Values.tosync.length!==0&&_0.sync();},failMessage:function(_I2,_J3){var _0=COMM.Transporter,_q1=COMM.Queue;console.log('failMessage?');_0.stop=true;_q1.push(function(){jsLoader.load('default_theme');});_q1.push(function(){jsLoader.load('controls');});_q1.push(function(){jsLoader.load('servermessage');});_q1.push(function(){ReloadApp.nu(_I2,_J3);});},failure:function(_f0){var _0=COMM.Transporter;if(_f0.X.status===0){console.log(_0.serverLostMessage);if(!_0._C2){_0._C2=HView.extend({_x7:function(_f0){if(_f0!==undefined){this._y7=_f0;}
this._u5++;return this;},_Y8:function(){this._z7++;var _f0=this._y7;COMM.request(_f0.url,_f0.options);},onIdle:function(){var _A7=new Date().getTime();this.bringToFront();if(this._u5>0&&(this._z7!==this._u5)&&(this._B7+2000<_A7)&&this._y7){this._B7=_A7;this._Y8();}
this.base();},_u5:0,_z7:0,_B7:new Date().getTime(),die:function(){var _y0=this.app;HSystem.reniceApp(_y0.appId,this._29);this.base();_y0.sync();},drawSubviews:function(){var _n0=[['padding-left','8px'],['background-color','#600'],['text-align','center'],['color','#fff'],['font-size','16px'],['opacity',0.85]],i=0;for(;i<_n0.length;i++){this.setStyle(_n0[i][0],_n0[i][1]);}
this.setHTML(this.app.serverLostMessage);this._29=HSystem.appPriorities[this.appId];if(HSystem.appPriorities[this.appId]<10){HSystem.reniceApp(this.appId,10);}
this._r5=HView.extend({_C7:0,_r5:function(){var _p5,_w=ELEM.getSize(this.parent.elemId)[0];this._C7++;if(this._C7%2===0){_p5=HRect.nu(0,0,80,20);}
else{_p5=HRect.nu(_w-80,0,_w,20);}
this.animateTo(_p5,2000);},onAnimationEnd:function(){if(this.drawn){this._r5();}}}).nu([0,0,80,20],this).setStyle('background-color','#fff').setStyle('opacity',0.8)._r5();}}).nu([0,0,200,20,0,null],_0)._x7(_f0);}
else{_0._C2._x7();}}
else{_0.failMessage('Transporter Error','Transporter was unable to complete the synchronization request.');}},sync:function(){if(this.stop){return;}
if(this.busy){return;}
this.busy=true;var _0=this,_42=COMM.Values.sync(),_E2='ses_key='+COMM.Session.ses_key,_59=_0.getClientEvalError(),_54=[_E2,_59,_42?'&values='+_42:''].join('');COMM.request(_0.url,{_0:_0,onSuccess:COMM.Transporter.success,onFailure:COMM.Transporter.failure,method:'POST',async:true,body:_54});}}).nu();COMM.SessionWatcher=HApplication.extend({constructor:function(_D7,_79){this.base(10,'SesWatcher');this.sesTimeoutValue=HVM.values[_79];this.timeoutSecs=_D7;},onIdle:function(){if((new Date().getTime()-this.sesTimeoutValue.value)>this.timeoutSecs){this.sesTimeoutValue.set(new Date().getTime());}}});COMM.URLResponder=HApplication.extend({constructor:function(){this.urlMatchers=[];this.urlCallBack=[];this.defaultCallBack=null;this.prevCallBack=false;this.prevMatchStr='';this.base(1,'URLResponder');this.value=0;this.clientValue=HValue.nu(false,'');this.clientValue.bind(this);this.serverValue=false;},setDefaultResponder:function(_t1){this.defaultCallBack=_t1;},delResponder:function(_s3,_t1){_t1.hide();if(_t1===this.prevCallBack){this.prevCallBack=false;this.prevMatchStr='';}
var i=0,_t3,_b4;for(;i<this.urlMatchers.length;i++){_t3=this.urlMatchers[i].test(_s3);if(_t3){this.urlMatchers.splice(i,1);this.urlCallBack.splice(i,1);return 1;}}
return 0;},addResponder:function(_b9,_t1,_F7){this.urlMatchers.push(new RegExp(_b9));this.urlCallBack.push(_t1);this.checkMatch(this.value);if(_F7!==undefined){location.href=_F7;}},checkMatch:function(_s3){if(_s3===this.prevMatchStr){return 0;}
var i=0,_t3,_b4;for(;i<this.urlMatchers.length;i++){_t3=this.urlMatchers[i].test(_s3);if(_t3){_b4=this.urlCallBack[i];if(this.prevCallBack){this.prevCallBack.hide();}
_b4.show();this.prevCallBack=_b4;this.prevmatchStr=_s3;return 1;}}
if(this.defaultCallBack){if(this.prevCallBack){this.prevCallBack.hide();}
this.defaultCallBack.show();this.prevCallBack=this.defaultCallBack;}
return-1;},refresh:function(){var _1=this.value;if(_1.length===0){return;}
if(!this.serverValue&&this.valueObj.id!==this.clientValue.id){this.clientValue.die();}
if(location.href!==_1){location.href=_1;}
this.checkMatch(_1);},onIdle:function(){if(!this['valueObj']){return;}
var _G7=location.href;if(_G7!==this.valueObj.value){this.setValue(_G7);}}});LOAD(function(){COMM.URLResponder.implement(HValueResponder);COMM.urlResponder=COMM.URLResponder.nu();urlResponder=COMM.urlResponder;COMM.Transporter.url=HCLIENT_HELLO;COMM.Transporter.stop=false;COMM.Transporter.sync();});COMM.Values=HClass.extend({constructor:null,values:{},tosync:[],create:function(_2,_s){HValue.nu(_2,_s);},add:function(_2,_1){this.values[_2]=_1;},set:function(_2,_s){this.values[_2].set(_s);},s:function(_2,_s){var _0=this;_s=_0.decode(_s);_0.values[_2].set(_s);},del:function(_2){var _0=this,_42=_0.values,_1=_42[_2],_R=_1.views,_k5=_R.lengt,i=0,_c;for(;i<_k5;i++){_c=_R[i];_c.valueObj=HDummyValue.nu(0,_1.value);}
_1.views=[];delete _42[_2];},changed:function(_1){var _0=this;if(_0.tosync.indexOf(_1.id)===-1){_0.tosync.push(_1.id);var _H7=COMM.Transporter;if(!_H7.busy){_H7.sync();}}},_I7:['b','n','s'],type:function(_g){var _50=(typeof _g).slice(0,1);if(this._I7.indexOf(_50)!==-1){return _50;}
else if(_50==='o'){if(_g.constructor===Array){return'a';}
else if(_g.constructor===Object){return'h';}
else if(_g.constructor===Date){return'd';}
return false;}
return false;},_f9:function(_32){var _p='[',_A0=[],_d0=_32.length,_0=this,_r,i=0;for(;i<_d0;i++){_r=_0.encode(_32[i]);_A0.push(_r);}
_p+=_A0.join(',')+']';return _p;},_h9:function(_32){var _A0=[],_d0=_32.length,_0=this,_r,i=0;for(;i<_d0;i++){_r=_0.decode(_32[i]);_A0.push(_r);}
return _A0;},_i9:function(_U0){var _p='{',_A0=[],_0=this,_7,_1;for(_7 in _U0){_1=_U0[_7];_A0.push(_0.encode(_7)+':'+_0.encode(_1));}
_p+=_A0.join(',')+'}';return _p;},_j9:function(_U0){var _A0={},_0=this,_7,_1;for(_7 in _U0){_1=_U0[_7];_A0[_0.decode(_7)]=_0.decode(_1);}
return _A0;},_k9:[[(/\\/g),'\\\\'],[(/\t/g),'\\t'],[(/\n/g),'\\n'],[(/\f/g),'\\f'],[(/\r/g),'\\r'],[(/"/g),'\\"']],_l9:function(_p){var _0=this,_L7=_0._k9,i=0,_d0=_L7.length,_j5,_y2,_u3,_A0='';for(;i<_d0;i++){_j5=_L7[i];_y2=_j5[0];_u3=_j5[1];_p=_p.replace(_y2,_u3);}
return'"'+_p+'"';},_w7:function(_p){var _Y1;try{_Y1=unescape(encodeURIComponent(_p));}
catch(e){_Y1=_p;}
return _Y1;},_r9:function(_p){var _Y1;try{_Y1=decodeURIComponent(escape(_p));}
catch(e){_Y1=_p;}
return _Y1;},encode:function(_g){var _p,_50,_0=this;if(_g===null){return'null';}
else if(_g!==undefined){_50=_0.type(_g);if(!_50){return'null';}
switch(_50){case'b':_p=String(_g);break;case'n':_p=String(_g);break;case's':_p=_0._l9(_0._w7(_g));break;case'd':_p='"@'+String(_g.getTime()/1000)+'"';break;case'a':_p=_0._f9(_g);break;case'h':_p=_0._i9(_g);break;default:_p='null';break;}}
else{return'null';}
return _p;},decode:function(_S0){var _g,_50,_0=this;if(_S0!==null&&_S0!==undefined){_50=_0.type(_S0);if(!_50){return null;}
switch(_50){case'b':_g=_S0;break;case'n':_g=_S0;break;case's':_g=_0._r9(_S0);break;case'd':_g=_S0;break;case'a':_g=_0._h9(_S0);break;case'h':_g=_0._j9(_S0);break;default:_g=null;break;}}
else{return null;}
return _g;},clone:function(_g){var _r,_v2;if(_g instanceof Array){_v2=[];for(_r=0;_r<_g.length;_r++){_v2[_r]=this.clone(_g[_r]);}
return _v2;}
else if(_g instanceof Object){_v2={};for(_r in _g){_v2[_r]=this.clone(_g[_r]);}
return _v2;}
else{return _g;}},sync:function(){if(this.tosync.length===0){return false;}
var _N7={},_0=this,_42=_0.values,_O7=_0.tosync,_d0=_O7.length,i=0,_2,_1;for(;i<_d0;i++){_2=_O7.shift();_1=_42[_2].value;_N7[_2]=_1;}
return encodeURIComponent(_0.encode(_N7));}});HVM=COMM.Values;HValue=HClass.extend({constructor:function(_2,_1){this.id=_2;this.type='[HValue]';this.value=_1;this.views=[];if(_2){COMM.Values.add(_2,this);}},die:function(){for(var _U=0;_U<this.views.length;_U++){var _g3=this.views[_U];_g3.setValueObj(HDummyValue.nu());this.views.splice(_U,1);}
if(this.id){COMM.Values.del(this.id);}},set:function(_1){if(this.differs(_1)){this.value=_1;if(this.id){COMM.Values.changed(this);}
this.refresh();}},differs:function(_1){return(COMM.Values.encode(_1)!==COMM.Values.encode(this.value));},s:function(_1){this.value=_1;this.refresh();},get:function(){return this.value;},bind:function(_K){if(_K===undefined){throw("HValueBindError: responder is undefined!");}
if(this.views.indexOf(_K)===-1){this.views.push(_K);_K.setValueObj(this);}},unbind:function(_K){for(var _U=0;_U<this.views.length;_U++){var _g3=this.views[_U];if(_g3===_K){this.views.splice(_U,1);return;}}},release:function(_K){return this.unbind(_K);},refresh:function(){for(var _U=0;_U<this.views.length;_U++){var _K=this.views[_U];if(_K.value!==this.value){if(!_K._K4){_K._K4=true;_K.setValue(this.value);_K._K4=false;}}}}});COMM.JSLoader=HClass.extend({constructor:function(_86){var _0=this;_0._L4=[];_0.uri=_86;_0._Ka=false;},_96:function(_0,_f0){console.log("failed to load js: "+_f0.url);},load:function(_x1){var _0=this;if((_0._L4.indexOf(_x1)!==-1)){return;}
COMM.Queue.pause();_0._L4.push(_x1);if(BROWSER_TYPE.ie||BROWSER_TYPE.symbian){_0._Ma=COMM.request(_0.uri+_x1+'.js',{onSuccess:function(_f0){COMM.Queue.unshiftEval(_f0.X.responseText);COMM.Queue.resume();},onFailure:_0._96,method:'GET',async:true});}
else{var _J1=document.createElement('script');_J1.onload=function(){COMM.Queue.resume();};_J1.src=_0.uri+_x1+'.js';_J1.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(_J1);}}});JSLoader=COMM.JSLoader;LOAD(function(){COMM.jsLoader=COMM.JSLoader.nu(HCLIENT_BASE+'/js/');jsLoader=COMM.jsLoader;});COMM.JSONRenderer=HClass.extend({version:0.4,constructor:function(_s,_h){if((_s['type']==='GUITree')&&(this.version>=_s['version'])){this.data=_s;this.parent=_h;this.render();}
else{throw("JSONRenderer: Only GUITree version "+this.version+" or older data can be handled.");}},render:function(){this.scopes=[window];this.scopeDepth=0;this.view=this.renderNode(this.data,this.parent);},defineInScope:function(_l0){var _d7=(_l0 instanceof Array),_c7=(_l0 instanceof Object);if(_d7||!_c7){console.log("JSONRenderer; definition must be an Object, got: '"+(typeof _l0)+"'. Definition: ",_l0);return;}
var _C1={},_c2=['class','extend','implement'],_G=_l0[_c2[0]],_T4=_l0[_c2[1]],_S4=_l0[_c2[2]],_h0=_T4?this.findInScope(_T4):false,_Q4=_S4?this.findInScope(_S4):false,_11=this.scopes[this.scopeDepth],_7,_1;if(_G===undefined){console.log("JSONRenderer; class name missing in definition scope.");return;}
if(!_h0){_h0=HClass;}
for(_7 in _l0){if(_c2.indexOf(_7)===-1){_1=_l0[_7];_C1[_7]=this.extEval(_1);}}
_11[_G]=_h0.extend(_C1);if(_Q4){_11[_G].implement(_Q4);}},undefineInScope:function(){},findInScope:function(_G){var _x0=false,_E4=this.scopes,i=_E4.length-1,_11;for(;i>-1;i--){_11=_E4[i];if(_11[_G]!==undefined){return _11[_G];}}
return _x0;},extEval:function(_60){if(_60.indexOf("function(")===0){eval('_60 = '+_60);}
return _60;},renderNode:function(_10,_h){var
_G=_10['class'],_x0=this.findInScope(_G),_3=_10['rect'],_B4=(_3!==undefined)&&(_3 instanceof Array),_P2=_10['subviews']!==undefined,_z4=_P2?_10['subviews']:null,_Q2=_10['options']!==undefined,_4=_Q2?_10['options']:null,_p4=_10['extend']!==undefined,_C1=_p4?_10['extend']:null,_y4=_10['define']!==undefined,_j2=_y4?_10['define']:null,_Q=_h,i,_37;this.scopeDepth++;this.scopes.push({});try{if(_y4){if(_j2 instanceof Array){for(i=0;i<_j2.length;i++){this.defineInScope(_j2[i]);}}
else{console.log('renderNode definitions not Array, definitions:',_j2);}}
if(_x0){if(_p4){var _I4={},_i,_60;for(_i in _C1){_60=_C1[_i];if(typeof _60==='string'){try{_60=this.extEval(_60);}
catch(e){console.log('renderNode ext eval error:',e,', name:',_i,', block:',_60);}}
_I4[_i]=_60;}
_x0=_x0.extend(_I4);}
if(_Q2){if(_4['valueObjId']!==undefined){var _Qa=_4['valueObjId'];_4['valueObj']=COMM.Values.values[_4['valueObjId']];}}
if(!_B4&&_Q2){_Q=_x0.nu(_4);}
else if(_B4){_Q=_x0.nu(_3,_h,_4);}}
else if(!(!_x0&&_P2)){console.log('renderNode warning; No such class: '+_G+', node: ',_10);}}
catch(e){console.log('renderNode error:',e,', rect:',_3,', class:',_10['class'],', options:',_4);}
if(_P2){for(i=0;i<_z4.length;i++){_37=this.renderNode(_z4[i],_Q);}}
this.scopes.pop();this.scopeDepth--;return _Q;}});JSONRenderer=COMM.JSONRenderer;HValueMatrixInterface={componentBehaviour:['view','control','matrix'],constructor:function(_3,_h,_4){this.base(_3,_h,_4);this.setValueMatrix();},setValueMatrix:function(){if(this.parent['valueMatrix']===undefined){this.parent.valueMatrix=HValueMatrix.nu();}
this.valueMatrixIndex=this.parent.valueMatrix.addControl(this);},click:function(){if(this.parent.valueMatrix instanceof HValueMatrix){this.parent.valueMatrix.setValue(this.valueMatrixIndex);}},die:function(){if(this['parent']){if(this.parent['valueMatrix']){this.parent.valueMatrix.release(this);}}
this.base();}};HValueMatrixComponentExtension=HValueMatrixInterface;HValueMatrix=HClass.extend({constructor:function(){this.ctrls=[];this.value=-1;this.valueObj=new HDummyValue();},setValueObj:function(_i1){this.valueObj=_i1;this.setValue(_i1.value);},setValue:function(_x){if(_x!==this.value){if(this.value!==-1){if(this.ctrls[this.value]){this.ctrls[this.value].setValue(false);}}
this.value=_x;if(_x!==-1){if(_x<this.ctrls.length){this.ctrls[_x].setValue(true);}}
this.valueObj.set(_x);}},addControl:function(_a){this.ctrls.push(_a);var _P7=this.ctrls.length-1;if(_a.value){this.setValue(_P7);}
return _P7;},release:function(_a){var _x=this.ctrls.indexOf(_a);if(_x!==-1){this.ctrls.splice(_x,1);if(_x===this.value){this.setValue(-1);}}}});HPoint=HClass.extend({constructor:function(){this.type='[HPoint]';var _b=arguments;if(_b.length===0){this._v3();}
else if(_b.length===2){this._R7(_b[0],_b[1]);}
else if(_b.length===1){this._w3(_b[0]);}
else{throw"Invalid number of arguments.";}},_v3:function(){this.x=null;this.y=null;},_R7:function(x,y){this.x=x;this.y=y;},_w3:function(_k){this.x=_k.x;this.y=_k.y;},set:function(){var _b=arguments;if(_b.length===0){this._v3();}
else if(_b.length===2){this._R7(_b[0],_b[1]);}
else if(_b.length===1){this._w3(_b[0]);}
else{throw"Invalid number of arguments.";}},constrainTo:function(_3){if(this.x<_3.left){this.x=_3.left;}
if(this.y<_3.top){this.y=_3.top;}
if(this.x>_3.right){this.x=_3.right;}
if(this.y>_3.bottom){this.y=_3.bottom;}},add:function(_k){_b=arguments;if((_b.length===1)&&(_b[0].type===this.type)){_k=_b[0];return new HPoint((this.x+_k.x),(this.y+_k.y));}
else if(_b.length===2){return new HPoint((this.x+_b[0]),(this.y+_b[1]));}else{return new HPoint(0,0);}},subtract:function(){_b=arguments;if((_b.length===1)&&(_b[0].type===this.type)){_k=_b[0];return new HPoint(this.x-_k.x,this.y-_k.y);}
else if(_b.length===2){return new HPoint(this.x-_b[0],this.y-_b[1]);}else{return new HPoint(0,0);}},equals:function(_k){return(this.x===_k.x&&this.y===_k.y);}});HRect=HClass.extend({constructor:function(){this.type='[HRect]';var _b=arguments;if(_b.length===0){this._v3();}else if(_b.length===4){this._35(_b[0],_b[1],_b[2],_b[3]);}
else if(_b.length===2){this._w3(_b[0],_b[1]);}
else if(_b.length===1){if(_b[0]instanceof Array){this._35(_b[0][0],_b[0][1],_b[0][2],_b[0][3]);}
else{this._S7(_b[0]);}}
else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_v3:function(){this.top=0;this.left=0;this.bottom=-1;this.right=-1;},_35:function(_b0,_F,_W,_C){this.top=_F;this.left=_b0;this.bottom=_C;this.right=_W;},_w3:function(_T7,_U7){this.top=_T7.y;this.left=_T7.x;this.bottom=_U7.y;this.right=_U7.x;},_S7:function(_3){this.top=_3.top;this.left=_3.left;this.bottom=_3.bottom;this.right=_3.right;},updateSecondaryValues:function(){this.isValid=(this.right>=this.left&&this.bottom>=this.top);this.leftTop=new HPoint(this.left,this.top);this.leftBottom=new HPoint(this.left,this.bottom);this.rightTop=new HPoint(this.right,this.top);this.rightBottom=new HPoint(this.right,this.bottom);this.width=(this.right-this.left);this.height=(this.bottom-this.top);},set:function(){var _b=arguments;if(_b.length===0){this._v3();}else if(_b.length===4){this._35(_b[0],_b[1],_b[2],_b[3]);}
else if(_b.length===2){this._w3(_b[0],_b[1]);}
else if(_b.length===1){this._S7(_b[0]);}
else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},setLeft:function(_b0){this.left=_b0;this.updateSecondaryValues();},setRight:function(_W){this.right=_W;this.updateSecondaryValues();},setTop:function(_F){this.top=_F;this.updateSecondaryValues();},setBottom:function(_C){this.bottom=_C;this.updateSecondaryValues();},setLeftTop:function(_k){this.left=_k.x;this.top=_k.y;this.updateSecondaryValues();},setLeftBottom:function(_k){this.left=_k.x;this.bottom=_k.y;this.updateSecondaryValues();},setRightTop:function(_k){this.right=_k.x;this.top=_k.y;this.updateSecondaryValues();},setRightBottom:function(_k){this.right=_k.x;this.bottom=_k.y;this.updateSecondaryValues();},setWidth:function(_w){this.right=this.left+_w;this.updateSecondaryValues();},setHeight:function(_A){this.bottom=this.top+_A;this.updateSecondaryValues();},setSize:function(){var _b=arguments;if(_b.length===2){_w=_b[0];_A=_b[1];}
else if(_b.length===1){_w=_b.x;_A=_b.y;}
this.right=this.left+_w;this.bottom=this.top+_A;this.updateSecondaryValues();},intersects:function(_3){return(((_3.left>=this.left&&_3.left<=this.right)||(_3.right>=this.left&&_3.right<=this.right))&&((_3.top>=this.top&&_3.top<=this.bottom)||(_3.bottom>=this.top&&_3.bottom<=this.bottom)));},contains:function(_g){if(_g instanceof HPoint){return this._B9(_g);}
else if(_g instanceof HRect){return this._C9(_g);}
else{throw"Wrong argument type.";}},_B9:function(_k){return(_k.x>=this.left&&_k.x<=this.right&&_k.y>=this.top&&_k.y<=this.bottom);},_C9:function(_3){return(_3.left>=this.left&&_3.right<=this.right&&_3.top>=this.top&&_3.bottom<=this.bottom);},insetBy:function(){var _b=arguments;if(_b.length===1){this._D9(_b[0]);}else if(_b.length===2){this._V7(_b[0],_b[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_D9:function(_k){this._V7(_k.x,_k.y);},_V7:function(x,y){this.left+=x;this.top+=y;this.right-=x;this.bottom-=y;},offsetBy:function(){var _b=arguments;if(_b.length===1){this._F9(_b[0]);}else if(_b.length===2){this._W7(_b[0],_b[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_F9:function(_k){this._W7(_k.x,_k.y);},_W7:function(x,y){this.left+=x;this.top+=y;this.right+=x;this.bottom+=y;},offsetTo:function(){var _b=arguments;if(_b.length===1){this._G9(_b[0]);}else if(_b.length===2){this._X7(_b[0],_b[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_G9:function(_k){this._X7(_k.x,_k.y);},_X7:function(x,y){this.right+=x-this.left;this.left=x;this.bottom+=y-this.top;this.top=y;},equals:function(_3){return(this.left===_3.left&&this.top===_3.top&&this.right===_3.right&&this.bottom===_3.bottom);},intersection:function(_3){return new HRect(Math.max(this.left,_3.left),Math.max(this.top,_3.top),Math.min(this.right,_3.right),Math.min(this.bottom,_3.bottom));},union:function(_3){return new HRect(Math.min(this.left,_3.left),Math.min(this.top,_3.top),Math.max(this.right,_3.right),Math.max(this.bottom,_3.bottom));},valueObj:null,viewIds:[],bind:function(_c){if(this.viewIds.indexOf(_c.viewId)!==-1){this.viewIds.push(_c.viewId);}},release:function(_c){var _Y7=this.viewIds.indexOf(_c.viewId);if(_Y7!==-1){this.viewIds.splice(_Y7,1);}},setValueObj:function(_i1){this.valueObj=_i1;},setValue:function(_1,_K8){if(this.valueObj){this.valueObj.set(_1);}
this.set(_1[0],_1[1],_1[2],_1[3]);var i=0,_e;for(;i<this.viewIds.length;i++){_e=this.viewIds[i];HSystem.views[_e].drawRect();}}});HDefaultThemePath='/H/themes';HDefaultThemeName='default';HNoComponentCSS=[];HNoCommonCSS=[];HThemeHasIE6GifsInsteadOfPng=[];HThemeManager=HClass.extend({constructor:null,init:function(){this.themePath=HDefaultThemePath;this._94={};this._24={};this.currentTheme=HDefaultThemeName;},setThemePath:function(_r2){this.themePath=_r2;},_H9:function(_y){console.log("ERROR: Template Not Found: '"+_y+"' ");},_I9:function(_y){console.log("ERROR: Template Failure: '"+_y+"' ");},_J9:function(_y){console.log("ERROR: Template Exception: '"+_y+"' ");},fetch:function(_y,_V0,_t1,_a1){var _Y4;if(!_V0){_V0='text/html; charset=UTF-8';}
if(_a1){_Y4=function(resp){_t1(resp.X.responseText);};}
else{var _Z7;_Y4=function(resp){_Z7=resp.X.responseText;};}
COMM.request(_y,{onSuccess:_Y4,on404:function(resp){HThemeManager._H9(resp.url);},onFailure:function(resp){HThemeManager._I9(resp.url);},onException:function(resp){HThemeManager._J9(resp.url);},method:'GET',async:_a1});if(!_a1){return _Z7;}},getThemeGfxPath:function(){var _m=this._f4[0],_I=this._f4[1],_O=this._f4[2],_m1=this._m1(_m,_I,_O);return this._H0(_m1,'gfx');},getCssFilePath:function(_G0){var _m=this._f4[0];if((HThemeHasIE6GifsInsteadOfPng.indexOf(_m)!==-1)&&ELEM._A1){return"url('"+this._H0(this.getThemeGfxPath(),_G0.replace('.png','-ie6.gif'))+"')";}
else{return"url('"+this._H0(this.getThemeGfxPath(),_G0)+"')";}},loadCSS:function(_y){var _V0='text/css',_R9=function(_D0){if(!_D0||_D0===""){return;}
HThemeManager.useCSS(_D0);};this.fetch(_y,_V0,_R9,true);},useCSS:function(_D0){var _V0='text/css';_D0=this._S9(_D0);var _n0,_T9,_28;if(ELEM._E0){_n0=document.createStyleSheet();_n0.cssText=_D0;}
else{_n0=document.createElement("style");_n0.type=_V0;_n0.media="all";_28=document.getElementsByTagName('head')[0];_28.appendChild(_n0);if(BROWSER_TYPE.safari){var _U9=document.createTextNode(_D0);_n0.appendChild(_U9);}
else{_n0.innerHTML=_D0;}}},_V9:function(_p){if(_p[_p.length-1]!=='/'){_p+='/';}
return _p;},_H0:function(_W9,_X9){return this._V9(_W9)+_X9;},_m1:function(_m,_I,_O){var _r2=_O;if(_O===null){_r2=this.themePath;}
_r2=this._H0(_r2,_m);return _r2;},_G3:function(_m,_I,_O){this._f4=[_m,_I,_O];var _Z9=this._m1(_m,_I,_O),_0a=this._H0('css',_I+'.css'),_G3=this._H0(_Z9,_0a);return _G3;},_U5:function(_m,_I,_O){var _1a=this._m1(_m,_I,_O),_2a=this._H0('html',_I+'.html'),_3a=this._H0(_1a,_2a);return _3a;},loadMarkup:function(_m,_I,_O){if(!this._94[_m]){this._94[_m]={};}
var _H=this._94[_m][_I];if(null===_H||undefined===_H){var _U5=this._U5(_m,_I,_O),_Y=this.fetch(_U5,null,null,false);if(null===_Y||undefined===_Y){_Y="";}
HThemeManager._94[_m][_I]=_Y;return _Y;}
return _H;},getMarkup:function(_m,_I,_O){if(!this._24[_m]){this._24[_m]={};if(HNoCommonCSS.indexOf(_m)===-1){var _6a=this._G3(_m,'common',_O,null);this.loadCSS(_6a);}}
if(HNoComponentCSS.indexOf(_m)===-1){if(!this._24[_m][_I]){var _7a=this._G3(_m,_I,_O);this._24[_m][_I]=true;this.loadCSS(_7a);}}
return this.loadMarkup(_m,_I,_O);},_T5:function(_m,_I,_O){var _m1=this._m1(_m,_I,_O),_y=this._H0(_m1,'gfx');return _y;},_9a:function(_m,_I,_O,_G0){if((HThemeHasIE6GifsInsteadOfPng.indexOf(_m)!==-1)&&ELEM._A1){return this._H0(this._T5(_m,_I,_O),_G0.replace('.png','-ie6.gif'));}
return this._H0(this._T5(_m,_I,_O),_G0);},getThemeGfxFile:function(_G0){return this.getThemeGfxPath()+_G0;},setTheme:function(_48){this.currentTheme=_48;},restoreDefaultTheme:function(){this.setTheme(HDefaultThemeName);},_T1:new RegExp(/#\{([^\}]*)\}/),_S9:function(_x3){while(this._T1.test(_x3)){_x3=_x3.replace(this._T1,eval(RegExp.$1));}
return _x3;}});HMarkupView=HClass.extend({bindMarkupVariables:function(){var _Y=this.markup;while(HMarkupView._58.test(_Y)){_Y=_Y.replace(HMarkupView._58,this.evalMarkupVariable(RegExp.$1,true));}
while(HMarkupView._T1.test(_Y)){_Y=_Y.replace(HMarkupView._T1,this.evalMarkupVariable(RegExp.$1));}
this.markup=_Y;return this;},evalMarkupVariable:function(_Q5,_34){try{var _ID=this.elemId.toString(),_WIDTH=this.rect.width,_HEIGHT=this.rect.height,_68=eval(_Q5);if(_34){return'';}
if(_68===undefined){return'';}
else{return _68;}}
catch(e){console.log("Warning, the markup string '"+_Q5+"' failed evaluation. Reason:"+e+' '+e.description);return'';}},toggleCSSClass:function(_h1,_14,_78){if(_h1){if(_78){ELEM.addClassName(_h1,_14);}
else{ELEM.removeClassName(_h1,_14);}}
return this;}},{_T1:new RegExp(/#\{([^\}]*)\}/),_58:new RegExp(/\$\{([^\}]*)\}/)});HMorphAnimation=HClass.extend({animateTo:function(_g,_F1,_T0){if(!this.drawn){return this;}
if(_g instanceof HPoint){var _3=new HRect(_g,_g);_3.setSize(this.rect.width,this.rect.height);this._X4(_3,_F1);}
else if(_g instanceof HRect){this._X4(_g,_F1);}
else{throw"Wrong argument type.";}
return this;},stopAnimation:function(){if(this._04){window.clearInterval(this._04);this._04=null;var _b0=parseInt(this.style('left'),10),_F=parseInt(this.style('top'),10),_w=parseInt(this.style('width'),10),_A=parseInt(this.style('height'),10);this.rect.set(_b0,_F,_b0+_w,_F+_A);this.drawRect();if(this._88){this.onAnimationEnd();}
else{this.onAnimationCancel();}}
return this;},_X4:function(_3,_F1,_T0){if(null===_F1||undefined===_F1){_F1=500;}
if(null===_T0||undefined===_T0||_T0<1){_T0=50;}
if(!this._04){this._88=false;this.onAnimationStart();var _fa=new Date().getTime();var _u=this;this._04=window.setInterval(function(){if(!_u){return;}
_u._ga({startTime:_fa,duration:_F1,transition:function(t,b,c,d){return c*t/d+b;},props:[{prop:'left',from:_u.rect.left,to:_3.left,unit:'px'},{prop:'top',from:_u.rect.top,to:_3.top,unit:'px'},{prop:'width',from:_u.rect.width,to:_3.width,unit:'px'},{prop:'height',from:_u.rect.height,to:_3.height,unit:'px'}]});},Math.round(1000/_T0));}
return this;},_ga:function(_g){var _98=new Date().getTime(),i;if(_98<_g.startTime+_g.duration){var _ha=_98-_g.startTime;for(i=0;i<_g.props.length;i++){var _y2=_g.props[i].from;var _u3=_g.props[i].to;if(_y2!==_u3){var _ia=_g.transition(_ha,_y2,(_u3-_y2),_g.duration);this.setStyle(_g.props[i].prop,_ia+_g.props[i].unit);}}}else{for(i=0;i<_g.props.length;i++){this.setStyle(_g.props[i].prop,_g.props[i].to+_g.props[i].unit);}
this._88=true;this.stopAnimation();}
return this;},onAnimationStart:function(){},onAnimationEnd:function(){},onAnimationCancel:function(){}});HView=HClass.extend({themePath:null,isAbsolute:true,flexRight:false,flexLeft:true,flexTop:true,flexBottom:false,flexRightOffset:0,flexBottomOffset:0,componentBehaviour:['view'],drawn:false,theme:null,preserveTheme:false,optimizeWidthOnRefresh:true,parent:null,parents:null,viewId:null,appId:null,app:null,views:null,viewsZOrder:null,isHidden:true,rect:null,constructor:function(_3,_h){if(!this.theme){this.theme=HThemeManager.currentTheme;this.preserveTheme=false;}
else{this.preserveTheme=true;}
this.parent=_h;this.viewId=this.parent.addView(this);this.appId=this.parent.appId;this.app=HSystem.apps[this.appId];this.views=[];this.viewsZOrder=[];this._a8();this.setRect(_3);this._b8=_3.left;this._c8=_3.top;this._l2=[];if(!this.isinherited){this.draw();this.show();}},setFlexRight:function(_9,_M){if(_9===undefined){_9=true;}
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
return HThemeManager._T5(_m,this.componentName,this.themePath);},getThemeGfxFile:function(_G0){if(this.preserveTheme){_m=this.theme;}else{_m=HThemeManager.currentTheme;}
return HThemeManager._9a(_m,this.componentName,this.themePath,_G0);},_O4:function(_H2){this.elemId=ELEM.make(_H2,'div');},_d8:function(_ka){var _Y3='display:none;overflow:hidden;visibility:hidden;';if(this.isAbsolute){_Y3+='position:absolute;';}else{_Y3+='position:relative;';}
_Y3+=_ka;ELEM.setCSS(this.elemId,_Y3);},_Y2:function(){var _H2;if(this.parent.elemId===undefined){_H2=0;}
else if(this.parent.markupElemIds&&this.parent.markupElemIds['subview']){_H2=this.parent.markupElemIds['subview'];}
else{_H2=this.parent.elemId;}
return _H2;},_a8:function(){if(!this.elemId){this._O4(this._Y2());this._d8('');if(this.preserveTheme){ELEM.addClassName(this.elemId,this.theme);}
else{ELEM.addClassName(this.elemId,HThemeManager.currentTheme);}}},drawRect:function(){if(this.parent&&this.rect.isValid){var _0=this,_6=_0.elemId,_z=ELEM.setStyle,_3=_0.rect;_z(_6,'left',_0.flexLeft?(_3.left+'px'):'auto',true);_z(_6,'top',_0.flexTop?(_3.top+'px'):'auto',true);_z(_6,'right',_0.flexRight?(_0.flexRightOffset+'px'):'auto',true);_z(_6,'bottom',_0.flexBottom?(_0.flexBottomOffset+'px'):'auto',true);_z(_6,'width',(_0.flexLeft&&_0.flexRight)?'auto':(_3.width+'px'),true);_z(_6,'height',(_0.flexTop&&_0.flexBottom)?'auto':(_3.height+'px'),true);if(_0.flexLeft&&_0.flexRight){_z(_6,'min-width',_3.width+'px',true);}
if(_0.flexTop&&_0.flexBottom){_z(_6,'min-height',_3.height+'px',true);}
if(undefined===_0.isHidden||_0.isHidden===false){_z(_6,'visibility','inherit',true);}
_z(_6,'display','block',true);_0._06();if(_0._b8!==_3.left||_0._c8!==_3.top){_0.invalidatePositionCache();_0._b8=_3.left;_0._c8=_3.top;}
_0.drawn=true;}
return this;},_06:function(){HSystem.updateZIndexOfChildren(this.viewId);},_X1:function(){HSystem.updateZIndexOfChildren(this.parent.viewId);},draw:function(){var _L3=this.drawn;this.drawRect();if(!_L3){if(this['componentName']!==undefined){this.drawMarkup();}
this.drawSubviews();}
this.refresh();return this;},drawSubviews:function(){},_38:function(){var _m,_Y;if(this.preserveTheme){_m=this.theme;}
else{_m=HThemeManager.currentTheme;}
_Y=HThemeManager.getMarkup(_m,this.componentName,this.themePath);if(_Y===false){console.log('Warning: Markup template for "'+this.componentName+'" using theme "'+_m+'" not loaded.');}
this.markup=_Y;return(_Y!==false);},markupElemNames:['bg','label','state','control','value','subview'],drawMarkup:function(){ELEM.setStyle(this.elemId,'display','none',true);var _ab=this._38();this.bindMarkupVariables();ELEM.setHTML(this.elemId,this.markup);this.markupElemIds={};for(var i=0;i<this.markupElemNames.length;i++){var _N=this.markupElemNames[i],_e8=_N+this.elemId,_oa=' id="'+_e8+'"';if(this.markup.indexOf(_oa)!==-1){this.markupElemIds[_N]=this.bindDomElement(_e8);}}
ELEM.setStyle(this.elemId,'display','block');return this;},setHTML:function(_Q1){ELEM.setHTML(this.elemId,_Q1);return this;},refresh:function(){if(this.drawn){this.drawRect();}
if(this.optimizeWidthOnRefresh){this.optimizeWidth();}
return this;},setRect:function(_3){if(this.rect){this.rect.release(this);}
if(_3 instanceof Array){var _X3=_3.length,_M5='HView.setRect: If the HRect instance is replaced by an array, ';if((_X3===4)||(_X3===6)){var _92=_3[0],_82=_3[1],_w=_3[2],_A=_3[3],_H5=((_X3===6)?_3[4]:null),_G5=((_X3===6)?_3[5]:null),_62=(typeof _92==='number'),_N1=(typeof _82==='number'),_a2=(typeof _H5==='number'),_V1=(typeof _G5==='number'),_y3=(typeof _w==='number'),_z3=(typeof _A==='number'),_W,_C;if((!_62&&!_a2)||(!_N1&&!_V1)){console.log(_M5+'(left or top) and (top or bottom) must be specified.');}
else if((!_y3&&!(_62&&_a2))||(!_z3&&!(_N1&&_V1))){console.log(_M5+'the (height or width) must be specified unless both (left and top) or (top and bottom) are specified.');}
this.setFlexLeft(_62,_92);this.setFlexTop(_N1,_82);this.setFlexRight(_a2,_H5);this.setFlexBottom(_V1,_G5);if(_62&&_y3&&!_a2){_W=_92+_w;}
else if(!_62&&_y3&&_a2){_92=0;_W=_w;}
else if(_62&&!_y3&&_a2){_W=_92+_H5;}
else if(_62&&_y3&&_a2){_W=_92+_w;}
if(_N1&&_z3&&!_V1){_C=_82+_A;}
else if(!_N1&&_z3&&_V1){_82=0;_C=_A;}
else if(_N1&&!_z3&&_V1){_C=_82+_G5;}
else if(_N1&&_z3&&_V1){_C=_82+_A;}
this.rect=HRect.nu(_92,_82,_W,_C);}
else{console.log(_M5+'the length has to be either 4 or 6.');}}
else{this.rect=_3;}
this.rect.bind(this);this.refresh();return this;},setStyle:function(_i,_1,_X0){if(this.elemId){ELEM.setStyle(this.elemId,_i,_1,_X0);}
return this;},style:function(_i){if(this.elemId){return ELEM.getStyle(this.elemId,_i);}
return'';},setStyleOfPart:function(_N,_i,_1,_X0){if(!this.markupElemIds[_N]){console.log('Warning, setStyleOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');}
else{ELEM.setStyle(this.markupElemIds[_N],_i,_1,_X0);}
return this;},styleOfPart:function(_N,_i){if(!this.markupElemIds[_N]){console.log('Warning, styleOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');return'';}
return ELEM.getStyle(this.markupElemIds[_N],_i);},setMarkupOfPart:function(_N,_1){if(!this.markupElemIds[_N]){console.log('Warning, setMarkupOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');}
else{ELEM.setHTML(this.markupElemIds[_N],_1);}
return this;},markupOfPart:function(_N){if(!this.markupElemIds[_N]){console.log('Warning, markupOfPart: partName "'+_N+'" does not exist for viewId '+this.viewId+'.');return'';}
return ELEM.getHTML(this.markupElemIds[_N]);},hide:function(){if(!this.isHidden){var _v1=ELEM.setStyle,_6=this.elemId;_v1(_6,'visibility','hidden');_v1(_6,'display','none');this.isHidden=true;}
return this;},show:function(){if(this.isHidden){var _v1=ELEM.setStyle,_6=this.elemId;_v1(_6,'visibility','inherit');_v1(_6,'display','block');this.isHidden=false;}
return this;},toggle:function(){if(this.isHidden){this.show();}else{this.hide();}
return this;},remove:function(){if(this.parent){var _wa=this.parent.viewsZOrder.indexOf(this.viewId),_xa=this.parent.views.indexOf(this.viewId);this.parent.views.splice(_xa,1);HSystem.delView(this.viewId);this.parent.viewsZOrder.splice(_wa,1);var _g8=HSystem._j1.indexOf(this.viewId);if(_g8!==-1){HSystem._j1.splice(_g8,1);}
this._X1();this.parent=null;this.parents=[];}
return this;},die:function(){this.hide();this.drawn=false;this.stopAnimation();var _h8,i;while(this.views.length!==0){_h8=this.views[0];this.destroyView(_h8);}
this.remove();for(i=0;i<this._l2.length;i++){ELEM.del(this._l2[i]);}
this._l2=[];ELEM.del(this.elemId);this.rect=null;var _0=this;for(i in _0){_0[i]=null;delete _0[i];}},onIdle:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].onIdle();}},buildParents:function(_e){var _c=HSystem.views[_e];_c.parent=this;_c.parents=[];for(var _C5=0;_C5<this.parents.length;_C5++){_c.parents.push(this.parents[_C5]);}
_c.parents.push(this);},addView:function(_c){var _e=HSystem.addView(_c);this.views.push(_e);this.buildParents(_e);this.viewsZOrder.push(_e);return _e;},removeView:function(_e){HSystem.views[_e].remove();return this;},destroyView:function(_e){HSystem.views[_e].die();return this;},bounds:function(){var _12=new HRect(this.rect);_12.right-=_12.left;_12.left=0;_12.bottom-=_12.top;_12.top=0;return _12;},resizeBy:function(_B5,_A3){var _3=this.rect;_3.right+=_B5;_3.bottom+=_A3;_3.updateSecondaryValues();this.drawRect();return this;},resizeTo:function(_w,_A){var _3=this.rect;_3.right=_3.left+_w;_3.bottom=_3.top+_A;_3.updateSecondaryValues();this.drawRect();return this;},offsetTo:function(){this.rect.offsetTo.apply(this.rect,arguments);this.drawRect();return this;},moveTo:function(){this.offsetTo.apply(this,arguments);return this;},offsetBy:function(_B5,_A3){this.rect.offsetBy(_B5,_A3);this.drawRect();return this;},moveBy:function(){this.offsetBy.apply(this,arguments);return this;},bringToFront:function(){if(this.parent){var _x=this.zIndex();this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.push(this.viewId);this._X1();}
return this;},bringToFrontOf:function(_c){if(this.parent.viewId===_c.parent.viewId){this.parent.viewsZOrder.splice(this.zIndex(),1);this.parent.viewsZOrder.splice(_c.zIndex()+1,0,this.viewId);this._X1();}
return this;},sendToBackOf:function(_c){if(this.parent.viewId===_c.parent.viewId){this.parent.viewsZOrder.splice(this.zIndex(),1);this.parent.viewsZOrder.splice(_c.zIndex(),0,this.viewId);this._X1();}
return this;},sendBackward:function(){var _x=this.zIndex();if(_x!==0){this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.splice(_x-1,0,this.viewId);this._X1();}
return this;},bringForward:function(){var _x=this.zIndex();if(_x!==this.parent.viewsZOrder.length-1){this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.splice(_x+1,0,this.viewId);this._X1();}
return this;},sendToBack:function(){if(this.parent){var _x=this.zIndex();this.parent.viewsZOrder.splice(_x,1);this.parent.viewsZOrder.splice(0,0,this.viewId);this._X1();}
return this;},zIndex:function(){if(!this.parent){return-1;}
return this.parent.viewsZOrder.indexOf(this.viewId);},stringSize:function(_G1,_w0,_6,_j8,_31){if(_w0||_w0===0){_G1=_G1.substring(0,_w0);}
if(!_6&&_6!==0){_6=this.elemId;}
if(!_31){_31='';}
if(!_j8){_31+='white-space:nowrap;';}
var _M3=ELEM.make(_6);ELEM.setCSS(_M3,"visibility:hidden;position:absolute;"+_31);ELEM.setHTML(_M3,_G1);ELEM.flushLoop();var _Fa=ELEM.getVisibleSize(_M3);ELEM.del(_M3);return _Fa;},stringWidth:function(_G1,_w0,_6,_31){return this.stringSize(_G1,_w0,_6,false,_31)[0];},stringHeight:function(_G1,_w0,_6,_31){return this.stringSize(_G1,_w0,_6,true,_31)[1];},pageX:function(){var _n=0,_5=this;while(_5){if(_5.elemId&&_5.rect){_n+=ELEM.get(_5.elemId).offsetLeft;_n-=ELEM.get(_5.elemId).scrollLeft;}
if(_5.markupElemIds&&_5.markupElemIds.subview){_n+=ELEM.get(_5.markupElemIds.subview).offsetLeft;_n-=ELEM.get(_5.markupElemIds.subview).scrollLeft;}
_5=_5.parent;}
return _n;},pageY:function(){var _j=0,_5=this;while(_5){if(_5.elemId&&_5.rect){_j+=ELEM.get(_5.elemId).offsetTop;_j-=ELEM.get(_5.elemId).scrollTop;}
if(_5.markupElemIds&&_5.markupElemIds.subview){_j+=ELEM.get(_5.markupElemIds.subview).offsetTop;_j-=ELEM.get(_5.markupElemIds.subview).scrollTop;}
_5=_5.parent;}
return _j;},pageLocation:function(){return new HPoint(this.pageX(),this.pageY());},optimizeWidth:function(){},invalidatePositionCache:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].invalidatePositionCache();}
return this;},bindDomElement:function(_k8){var _z5=ELEM.bindId(_k8);if(_z5){this._l2.push(_z5);}
return _z5;},unbindDomElement:function(_h1){var _l8=this._l2.indexOf(_h1);if(_l8>-1){ELEM.del(_h1);this._l2.splice(_l8,1);}}});HView.implement(HMarkupView);HView.implement(HMorphAnimation);HEventResponder=HClass.extend({setEvents:function(_B3){if(!this.events){this.events=HClass.extend({mouseMove:false,mouseDown:false,mouseUp:false,draggable:false,droppable:false,keyDown:false,keyUp:false,mouseWheel:false,textEnter:false,click:false}).nu();}
if(_B3){this.events.extend(_B3);}
this.events.ctrl=this;EVENT.focusOptions[this.elemId]=this.events;var _m8=this.events.mouseMove,_f5=EVENT.coordListeners.indexOf(this.elemId);if(_m8&&(_f5===-1)){EVENT.coordListeners.push(this.elemId);}
else if((!_m8)&&(_f5!==-1)){EVENT.coordListeners.splice(_f5,1);}
return this;},setMouseMove:function(_9){this.events.mouseMove=_9;this.setEvents();return this;},setClickable:function(_9){this.events.click=_9;this.setEvents();return this;},setMouseDown:function(_9){this.events.mouseDown=_9;this.setEvents();return this;},setMouseUp:function(_9){this.events.mouseUp=_9;this.setEvents();return this;},setMouseWheel:function(_9){this.events.mouseWheel=_9;this.setEvents();return this;},setDraggable:function(_9){this.events.draggable=_9;this.setEvents();return this;},setDroppable:function(_9){this.events.droppable=_9;this.setEvents();return this;},setKeyDown:function(_9){this.events.keyDown=_9;this.setEvents();return this;},setKeyUp:function(_9){this.events.keyUp=_9;this.setEvents();return this;},setTextEnter:function(_9){this.events.textEnter=_9;this.setEvents();return this;},setClick:function(_9){return this.setClickable(_9);},focus:function(){},blur:function(){},gainedActiveStatus:function(_95){if((HSystem.windowFocusBehaviour===1)&&(this.parents.length>2)){if(this.parents[2].componentBehaviour.indexOf('window')!==-1){this.parents[2].gainedActiveStatus();}}},_57:function(_95){if(this.enabled){this.toggleCSSClass(this.elemId,HControl.CSS_ACTIVE,true);}
this.gainedActiveStatus(_95);},lostActiveStatus:function(_a0){},_47:function(_a0){if(this.enabled){this.toggleCSSClass(this.elemId,HControl.CSS_ACTIVE,false);}
this.lostActiveStatus(_a0);},mouseMove:function(x,y){},click:function(x,y,_51){},mouseDown:function(x,y,_51){},mouseUp:function(x,y,_51){},mouseWheel:function(_V){},startDrag:function(x,y){},drag:function(x,y){this.doDrag(x,y);},doDrag:function(x,y){},endDrag:function(x,y){this.invalidatePositionCache();},drop:function(obj){this.onDrop(obj);},onDrop:function(obj){},startHover:function(obj){this.onHoverStart(obj);},onHoverStart:function(obj){},endHover:function(obj){this.onHoverEnd(obj);},onHoverEnd:function(obj){},keyDown:function(_P){},keyUp:function(_P){},textEnter:function(){},_B2:function(e){if(!Event.element){return;}
var _u=Event.element(e);while(_u&&_u.ctrl===undefined){_u=_u.parentNode;}
if(!_u){return;}
var _0=_u.ctrl;EVENT.focus(_0);Event.stop(e);},_N3:function(e){if(!Event.element){return;}
var _u=Event.element(e);while(_u&&_u.ctrl===undefined){_u=_u.parentNode;}
if(!_u){return;}
var _0=_u.owner;EVENT.blur(_0);Event.stop(e);},invalidatePositionCache:function(){this.base();EVENT.coordCacheFlush(this.elemId);return this;}});HValueResponder=HClass.extend({setValueObj:function(_i1){this.valueObj=_i1;this.setValue(_i1.value);return this;},valueDiffers:function(_1){return(COMM.Values.encode(_1)!==COMM.Values.encode(this.value));},setValue:function(_1){if(_1!==undefined&&this['valueObj']&&this.valueDiffers(_1)){var _85=COMM.Values;this.value=_1;if(_85._I7.indexOf(_85.type(_1))===-1){this.valueObj.set(_85.clone(_1));}
else{this.valueObj.set(_1);}
(this['refresh']!==undefined)&&(typeof this.refresh==='function')&&this.refresh();}
return this;}});HDummyValue=HClass.extend({constructor:function(_2,_1){this.id=_2;this.value=_1;},set:function(_1){this.value=_1;},get:function(){return this.value;},bind:function(_09){},unbind:function(_09){}});HControlDefaults=HClass.extend({label:"",visible:true,events:null,constructor:function(){if(!this.events){this.events={};}},value:0,enabled:true,active:false,minValue:-2147483648,maxValue:2147483648});HComponentDefaults=HControlDefaults;HControl=HView.extend({componentBehaviour:['view','control'],refreshOnValueChange:true,refreshOnLabelChange:true,label:null,events:null,enabled:null,value:null,valueObj:null,minValue:null,maxValue:null,active:null,options:null,controlDefaults:HControlDefaults,constructor:function(_3,_h,_4){if(!_4){_4={};}
var _0=this;_4=(_0.controlDefaults.extend(_4)).nu(this);_0.options=_4;if(_0.isinherited){_0.base(_3,_h);}
else{_0.isinherited=true;_0.base(_3,_h);_0.isinherited=false;}
var _19=(_4.minValue||_4.maxValue),_f=_4.label,_B3=_4.events;if(_4.visible){_0.show();}
else{_0.hide();}
_0.setLabel(_f);_0.setEvents(_B3);_0.setEnabled(_4.enabled);if(_4.valueObj){_4.valueObj.bind(_0);}
else if(!_0.valueObj){_0.valueObj=HDummyValue.nu();}
if((_0.value===null)&&(_4.value!==undefined)){_0.setValue(_4.value);}
if(_19){_0.setValueRange(this.value,_4.minValue,_4.maxValue);}
if(!_0.isinherited){_0.draw();}},die:function(){var _0=this;if(_0.valueObj){_0.valueObj.unbind(_0);_0.valueObj=null;}
EVENT.unreg(_0);_0.base();},setLabel:function(_f){var _0=this,_Z1=(_f!==_0.label);if(_Z1){_0.label=_f;_0.options.label=_f;_0.refresh();}
return this;},setEnabled:function(_9){var _0=this,_6=this.elemId,_P3=HSystem.views,i=0,_R=_0.views,_k5=_R.length;for(;i<_k5;i++){_P3[_R[i]].setEnabled(_9);}
if(_0.enabled===_9){return this;}
_0.enabled=_9;if(_9){EVENT.reg(_0,_0.events);}
else{EVENT.unreg(this);}
_0.toggleCSSClass(_6,HControl.CSS_ENABLED,_9);_0.toggleCSSClass(_6,HControl.CSS_DISABLED,!_9);return this;},setValueRange:function(_1,_K3,_d4){this.minValue=_K3;this.maxValue=_d4;_1=(_1<_K3)?_K3:_1;_1=(_1>_d4)?_d4:_1;this.setValue(_1);return this;},refreshValue:function(){if(this.markupElemIds){if(this.markupElemIds['value']){ELEM.setHTML(this.markupElemIds.value,this.value);}}
return this;},refreshLabel:function(){if(this.markupElemIds){if(this.markupElemIds['label']){ELEM.setHTML(this.markupElemIds.label,this.label);}}
return this;},refresh:function(){this.base();if(this.drawn){if(this.refreshOnValueChange){this.refreshValue();}
if(this.refreshOnLabelChange){this.refreshLabel();}}
return this;}},{CSS_DISABLED:"disabled",CSS_ENABLED:"enabled",CSS_ACTIVE:"active"});HControl.implement(HValueResponder);HControl.implement(HEventResponder);HDynControl=HControl.extend({componentBehaviour:['view','control','window'],preserveTheme:true,controlDefaults:(HControlDefaults.extend({constructor:function(_a){var _g1=ELEM.windowSize(),_03=_g1[0],_13=_g1[1];if(!this.minSize){this.minSize=[24,54];}
if(!this.maxSize){this.maxSize=_g1;}
if(!this.maxX){this.maxX=_03-this.minSize[0];}
if(!this.maxY){this.maxY=_13-this.minSize[1];}
if(!this.events){this.events={draggable:true};}
if(!this.resizeNW){this.resizeNW=[1,1];}
if(!this.resizeNE){this.resizeNE=[1,1];}
if(!this.resizeSW){this.resizeSW=[1,1];}
if(!this.resizeSE){this.resizeSE=[1,1];}},minX:0,minY:0,maxX:null,maxY:null,minSize:null,maxSize:null,resizeW:1,resizeE:1,resizeN:1,resizeS:1,resizeNW:null,resizeNE:null,resizeSW:null,resizeSE:null,noResize:false})),draw:function(){this.base();this._99();this._o8();},_91:function(_q8,_r8){var _0=this,_3=_0.rect,_4=_0.options,_64,_e4;if(_3.width<_4.minSize[0]){_64=0-(_4.minSize[0]-_3.width);_3.setWidth(_4.minSize[0]);if(_q8){_3.offsetBy(_64,0);}}
else if(_3.width>_4.maxSize[0]){_64=0-(_4.maxSize[0]-_3.width);_3.setWidth(_4.maxSize[0]);if(_q8){_3.offsetBy(_64,0);}}
if(_3.height<_4.minSize[1]){_e4=0-(_4.minSize[1]-_3.height);_3.setHeight(_4.minSize[1]);if(_r8){_3.offsetBy(0,_e4);}}
else if(_3.height>_4.maxSize[1]){_e4=0-(_4.maxSize[1]-_3.height);_3.setHeight(_4.maxSize[1]);if(_r8){_3.offsetBy(0,_e4);}}
if(_3.left<_4.minX){_3.offsetTo(_4.minX,_3.top);}
else if(_3.left>_4.maxX){_3.offsetTo(_4.maxX,_3.top);}
if(_3.top<_4.minY){_3.offsetTo(_3.left,_4.minY);}
else if(_3.top>_4.maxY){_3.offsetTo(_3.left,_4.maxY);}
_0.drawRect();},_d1:function(x,y){return this._s8.subtract(x,y);},dynResizeNW:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setLeftTop(_0._21.leftTop.subtract(_80));_0._91(1,1);},dynResizeNE:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setRightTop(_0._21.rightTop.subtract(_80));_0._91(0,1);},dynResizeSW:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setLeftBottom(_0._21.leftBottom.subtract(_80));_0._91(1,0);},dynResizeSE:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setRightBottom(_0._21.rightBottom.subtract(_80));_0._91(0,0);},dynResizeW:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setLeft(_0._21.left-_80.x);_0._91(1,0);},dynResizeE:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setRight(_0._21.right-_80.x);_0._91(0,0);},dynResizeN:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setTop(_0._21.top-_80.y);_0._91(0,1);},dynResizeS:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.setBottom(_0._21.bottom-_80.y);_0._91(0,0);},dynDrag:function(_0,x,y){var _80=_0._d1(x,y);_0.rect.offsetTo(_0._21.leftTop.subtract(_80));_0._91(1,1);},_99:function(){this._g0=[];this._t8=['nw-resize','ne-resize','sw-resize','se-resize','w-resize','e-resize','n-resize','s-resize','move'];var i,_0=this,_w9=0,_y9=1,_z9=2,_A9=3,_E9=4,_L8=5,_M8=6,_J8=7,_L9=8,_g0=this._g0;_g0[_w9]=_0.dynResizeNW;_g0[_y9]=_0.dynResizeNE;_g0[_z9]=_0.dynResizeSW;_g0[_A9]=_0.dynResizeSE;_g0[_E9]=_0.dynResizeW;_g0[_L8]=_0.dynResizeE;_g0[_M8]=_0.dynResizeN;_g0[_J8]=_0.dynResizeS;_g0[_L9]=_0.dynDrag;},makeRectRules:function(){var _v=this.options,_3=this.rect;return[[0,0,_v.resizeNW[0],_v.resizeNW[1]],[_3.width-_v.resizeNE[0],0,_3.width,_v.resizeNE[1]],[0,_3.height-_v.resizeSW[1],_v.resizeSW[0],_3.height],[_3.width-_v.resizeSE[0],_3.height-_v.resizeSE[1],_3.width,_3.height],[0,_v.resizeN,_v.resizeW,_3.height-_v.resizeS],[_3.width-_v.resizeE,_v.resizeN,_3.width,_3.height-_v.resizeS],[_v.resizeW,0,_3.width-_v.resizeE,_v.resizeN],[_v.resizeW,_3.height-_v.resizeS,_3.width-_v.resizeE,_3.height],[_v.resizeW,_v.resizeN,_3.width-_v.resizeE,_3.height-_v.resizeS]];},_o8:function(){this._p1=-1;this._C3=[];var i=0,_D3,_J2=this.makeRectRules();for(;i<9;i++){_D3=_J2[i];this._C3.push(HRect.nu(_D3[0],_D3[1],_D3[2],_D3[3]));}},_5a:function(){var i,_v8=this._s8.subtract(this.rect.left,this.rect.top),_C3=this._C3;if(this.options.noResize&&_C3[8].contains(_v8)){this._p1=8;this.setStyle('cursor',this._t8[8]);return;}
for(i=0;i!==9;i++){if(_C3[i].contains(_v8)){this._p1=i;this.setStyle('cursor',this._t8[i]);return;}}},startDrag:function(x,y,_51){var _h=this.parent;if(_h.elemId){x-=_h.pageX();y-=_h.pageY();}
this._s8=new HPoint(x,y);this._21=new HRect(this.rect);this._5a();if(this._p1!==-1){this._g0[this._p1](this,x,y);}
return true;},drag:function(x,y){var _h=this.parent;if(_h.elemId){x-=_h.pageX();y-=_h.pageY();}
if(this._p1!==-1){this._g0[this._p1](this,x,y);}
return true;},endDrag:function(x,y,_51){this.base();var _h=this.parent;if(_h.elemId){x-=_h.pageX();y-=_h.pageY();}
if(this._p1!==-1){this._g0[this._p1](this,x,y);}
this.setStyle('cursor','default');this._o8();return true;}});HButton=HControl.extend({componentName:'button',setStyle:function(_i,_1){ELEM.setStyle(this.markupElemIds.label,_i,_1);}});HClickValueButton=HButton.extend({refreshValue:function(){this.setEnabled(this.value===0);},click:function(){if(this.enabled){this.setValue(1);}}});HCheckbox=HButton.extend({componentName:'checkbox',controlDefaults:(HControlDefaults.extend({constructor:function(){if(!this.events){this.events={click:true}}}})),click:function(){this.setValue(!this.value);},setStyle:function(_i,_1,_T){this.setStyleOfPart('label',_i,_1,_T);},refreshValue:function(){if(this.markupElemIds.control){if(this.value){this.toggleCSSClass(this.markupElemIds.control,'checked',true);this.toggleCSSClass(this.markupElemIds.control,'unchecked',false);}
else{this.toggleCSSClass(this.markupElemIds.control,'checked',false);this.toggleCSSClass(this.markupElemIds.control,'unchecked',true);}}}});HCheckBox=HCheckbox;HRadioButton=HCheckbox.extend(HValueMatrixComponentExtension);HRadioButton.prototype.componentName='radiobutton';HRadiobutton=HRadioButton;HStringView=HControl.extend({componentName:"stringview",componentBehaviour:['view','control','text'],setStyle:function(_i,_1,_X0){if(!this['markupElemIds']||!this.markupElemIds['value']){return;}
ELEM.setStyle(this.markupElemIds.value,_i,_1,_X0);},refreshLabel:function(){if(this.markupElemIds){if(this.markupElemIds.value){ELEM.setAttr(this.markupElemIds.value,'title',this.label);}}}});HTextControl=HControl.extend({componentName:"textcontrol",controlDefaults:(HControlDefaults.extend({constructor:function(_a){if(!this.events){this.events={textEnter:true};}}})),refreshLabel:function(){if(this['markupElemIds']!==undefined){if(this.markupElemIds['label']!==undefined){ELEM.setAttr(this.markupElemIds.label,'title',this.label);}}},drawSubviews:function(){if(this['markupElemIds']!==undefined){if(this.markupElemIds['label']!==undefined){var _D=this.markupElemIds.value,_f=this.markupElemIds.label;if(BROWSER_TYPE.firefox){if(this.componentName==='textarea'){ELEM.setStyle(_D,'padding-top','0px');}
else{ELEM.setStyle(_D,'margin-top','1px');}
ELEM.setStyle(_D,'padding-left','0px');ELEM.setStyle(_f,'left','2px');ELEM.setStyle(_f,'top','0px');ELEM.setStyle(_f,'right','2px');ELEM.setStyle(_f,'bottom','2px');}
else if(BROWSER_TYPE.ie){ELEM.flushLoop();var _o0=ELEM.getVisibleSize(this.elemId),_w=_o0[0],_A=_o0[1];ELEM.setStyle(_D,'left','2px');ELEM.setStyle(_D,'top','1px');ELEM.setStyle(_D,'padding-top','0px');ELEM.setStyle(_D,'padding-left','0px');ELEM.setStyle(_D,'padding-right','8px');ELEM.setStyle(_D,'padding-bottom','0px');ELEM.setStyle(_D,'width',(_w-10)+'px');ELEM.setStyle(_D,'height',(_A-2)+'px');ELEM.setStyle(_f,'left','0px');ELEM.setStyle(_f,'top','0px');ELEM.setStyle(_f,'right','0px');ELEM.setStyle(_f,'bottom','0px');}
else if(BROWSER_TYPE.safari||BROWSER_TYPE.chrome){ELEM.setStyle(_D,'width','auto');ELEM.setStyle(_D,'height','auto');ELEM.setStyle(_D,'left','-2px');ELEM.setStyle(_D,'top','-2px');if(BROWSER_TYPE.chrome){ELEM.setStyle(_D,'right','0px');ELEM.setStyle(_D,'bottom','0px');}
else{ELEM.setStyle(_D,'right','-2px');ELEM.setStyle(_D,'bottom','-2px');}
ELEM.setStyle(_f,'left','0px');ELEM.setStyle(_f,'top','0px');ELEM.setStyle(_f,'right','0px');ELEM.setStyle(_f,'bottom','0px');}}}
this.setEnabled(this.enabled);},setStyle:function(_i,_1,_X0){if(!this['markupElemIds']||!this.markupElemIds['value']){return;}
this.setStyleOfPart('value',_i,_1,_X0);},setEnabled:function(_9){this.base(_9);if(this['markupElemIds']===undefined){return;}
if(this.markupElemIds.value){ELEM.get(this.markupElemIds.value).disabled=!this.enabled;}},hasTextFocus:false,textFocus:function(){this.hasTextFocus=true;return true;},textBlur:function(){this.hasTextFocus=false;return true;},refreshValue:function(){if(this.markupElemIds){if(this.markupElemIds.value){ELEM.get(this.markupElemIds.value).value=this.value;}}},validateText:function(_1){return _1;},getTextFieldValue:function(){return ELEM.get(this.markupElemIds.value).value;},textEnter:function(){if(this['markupElemIds']===undefined){return;}
var _1=this.validateText(this.getTextFieldValue());if(_1!==this.value.toString()){this.setValue(_1);}}});HNumericTextControl=HTextControl.extend({mouseWheel:function(_V){var _1=this.value;_1=_1-((_V<0)?1:-1);this.setValue(Math.round(this.validateText(_1)));},validateText:function(_1){if(isNaN(_1)){_1=this.value;}
_1=parseInt(_1,10);if(_1>this.options.maxValue){_1=this.options.maxValue;}
else if(_1<this.options.minValue){_1=this.options.minValue;}
if(this['markupElemIds']&&this.markupElemIds['value']){var _5=ELEM.get(this.markupElemIds.value);if(_5.value!=_1){_5.value=_1;}}
return _1;},setValue:function(_1){this.base(this.validateText(_1));}});HPasswordControl=HTextControl.extend({componentName:'passwordcontrol'});HTextArea=HTextControl.extend({componentName:"textarea"});HUploader=HControl.extend({componentName:'uploader',uploadState:false,uploadKey:false,uploadStateLabels:{'0':"Select file...",'1':"Uploading...",'2':"Processing data...",'3':"Upload Complete",'4':"Preparing upload",'-1':"Error: Invalid request",'-2':"Error: Invalid upload key",'-3':"Error: Invalid data format",'-4':"Error: File too big",'-6':"Error: Post-processing failed"},markupElemNames:['form','file','iframe','upload_progress','progress_label','progress_indicator','button','button_label','value','ack_button'],setUploadState:function(_L,_o1){if(_L!==this.uploadState){this.uploadState=_L;var _R2=_L.toString();if(this.uploadStateLabels[_R2]!==undefined){ELEM.get(this.markupElemIds.value).value=this.valueObj.id;var _f=this.uploadStateLabels[_R2];if(_L===0){ELEM.setStyle(this.markupElemIds.upload_progress,'visibility','hidden');ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','hidden');ELEM.setStyle(this.markupElemIds.ack_button,'visibility','hidden');ELEM.setHTML(this.markupElemIds.button_label,_f);ELEM.setStyle(this.markupElemIds.button,'visibility','inherit');ELEM.setStyle(this.markupElemIds.form,'visibility','inherit');ELEM.setAttr(this.markupElemIds.form,'action','/U/'+_o1,true);ELEM.get(this.markupElemIds.file).value='';this.uploadKey=_o1;}
else if(_L===1||_L===2||_L===3||_L===4){ELEM.setStyle(this.markupElemIds.upload_progress,'visibility','inherit');if(_L===1||_L===2||_L===4){ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','inherit');ELEM.setStyle(this.markupElemIds.ack_button,'visibility','hidden');}
else{ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','hidden');ELEM.setStyle(this.markupElemIds.ack_button,'visibility','inherit');}
ELEM.setHTML(this.markupElemIds.progress_label,_f);ELEM.setStyle(this.markupElemIds.button,'visibility','hidden');ELEM.setStyle(this.markupElemIds.form,'visibility','hidden');if(_L===1){ELEM.get(this.markupElemIds.form).submit();}}
else if(_L<0){ELEM.setStyle(this.markupElemIds.progress_indicator,'visibility','hidden');ELEM.setStyle(this.markupElemIds.ack_button,'visibility','inherit');ELEM.setHTML(this.markupElemIds.progress_label,'<span style="color:red;">'+_f+'</span>');ELEM.setStyle(this.markupElemIds.button,'visibility','hidden');ELEM.setStyle(this.markupElemIds.form,'visibility','hidden');}}}},refreshValue:function(){if(typeof this.value!=='string'){return;}
if(this.value.indexOf(':::')<1){return;}
var _S2=this.value.split(':::');if(_S2.length!==2){return;}
var _L=parseInt(_S2[0],10),_o1=_S2[1];this.setUploadState(_L,_o1);},upload:function(){this.setValue('1:::'+this.uploadKey);},getNewUploadKey:function(){this.setValue('4:::'+this.uploadKey);},click:function(){if((this.uploadState===3)||(this.uploadState<0)){this.getNewUploadKey();}}});HSlider=HControl.extend({componentName:"slider",controlDefaults:(HControlDefaults.extend({minValue:0,maxValue:1,repeatDelay:300,repeatInterval:50,inverseAxis:false,constructor:function(_a){if(!this.events){this.events={draggable:true,keyDown:true,keyUp:true,mouseWheel:true};}}})),refreshOnValueChange:false,_20:false,setValue:function(_1){if(_1<this.minValue){_1=this.minValue;}
if(_1>this.maxValue){_1=this.maxValue;}
this.base(_1);if(this._n4){this.drawThumbPos();}
return this;},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this._X6();}
this.refresh();},startDrag:function(_n,_j){var _u4=ELEM.getVisiblePosition(this.elemId,true);this._U6=_u4[0];this._T6=_u4[1];this.drag(_n,_j);},endDrag:function(_n,_j){this.drag(_n,_j);},drag:function(_n,_j){_n-=this._U6;_j-=this._T6;var _O6=this._20?_j:_n;var _1=this._N6(_O6);this.setValue(_1);},keyDown:function(_P){if((_P===Event.KEY_LEFT&&!this._20)||(_P===Event.KEY_DOWN&&this._20)){this._r1=true;this._s1(-0.05);}
else if((_P===Event.KEY_RIGHT&&!this._20)||(_P===Event.KEY_UP&&this._20)){this._r1=true;this._s1(0.05);}
else if(_P===Event.KEY_HOME){this.setValue(this.minValue);}
else if(_P===Event.KEY_END){this.setValue(this.maxValue);}
else if(_P===Event.KEY_PAGEDOWN){this._r1=true;this._s1(-0.25);}
else if(_P===Event.KEY_PAGEUP){this._r1=true;this._s1(0.25);}},keyUp:function(_P){this._r1=false;},mouseWheel:function(_V){var _u0;if(_V>0){_u0=0.05;}
else{_u0=-0.05;}
if(this.options.inverseAxis){_u0=0-_u0;}
var _1=(this.maxValue-this.minValue)*_u0;this.setValue(this.value+_1);},_s1:function(_u0,_01){if(!_01){_01=this.options.repeatDelay;}
else if(_01===this.options.repeatDelay){_01=this.options.repeatInterval;}
if(this._r1&&this.active){var _1=(this.maxValue-this.minValue)*_u0;this.setValue(this.value+_1);var _u=this;if(this._T2){window.clearTimeout(this._T2);this._T2=null;}
this._T2=window.setTimeout(function(){_u._s1(_u0,_01);},_01);}},thumbSize:21,_X6:function(){this._n4=this.markupElemIds.control;this.drawThumbPos();},_M6:function(){var _70;if(this._20){_70=this.rect.height-this.thumbSize;}else{_70=this.rect.width-this.thumbSize;}
var _U2=_70*((this.value-this.minValue)/(this.maxValue-this.minValue));if(this._20){_U2=_70-_U2;}
_K6=parseInt(_U2,10)+'px';return _K6;},_N6:function(_M0){var _70;if(this._20){_70=this.rect.height-this.thumbSize;}else{_70=this.rect.width-this.thumbSize;}
_M0-=(this.thumbSize/2);if(_M0<0){_M0=0;}
if(_M0>_70){_M0=_70;}
if(this._20){return this.maxValue-((_M0/_70)*(this.maxValue-this.minValue));}else{return this.minValue+((_M0/_70)*(this.maxValue-this.minValue));}},drawThumbPos:function(){var _J6=this._20?'top':'left',_H6=this._M6();ELEM.setStyle(this._n4,_J6,_H6);this.setOrientation(this.options['orientation']||this.prevOrientation);},prevOrientation:'c',cssClassPrefix:'h',setOrientation:function(_i0){if(!_i0){_i0='c';}
_i0=_i0.toLowerCase();if(_i0===this.prevOrientation){return;}
if(this['markupElemIds']===undefined){return;}
if(this.markupElemIds['control']===undefined){return;}
var _G6=this.toggleCSSClass,_V2=this.markupElemIds.control,_F6=['n','s','w','e','c'],_W2='',_F4='',_C4=this.cssClassPrefix,_C6=this._20?'v':'',_l4=false,i=0;for(;i<5;i++){_W2=_F6[i];_l4=(_i0===_W2);_F4=(_i0==='c')?_C4+_C6+'slider_thumb':_C4+'slider_thumb_'+_W2;_G6(_V2,_F4,_l4);}
this.prevOrientation=_i0;}});HVSlider=HSlider.extend({componentName:"vslider",_20:true});HProgressBar=HControl.extend({componentName:"progressbar",themeWidthInset:2,refreshValue:function(){if(this.drawn&&this.markupElemIds.value){var _A6=ELEM.getVisibleSize(this.elemId)[0]-this.themeWidthInset,_z6=_A6/this.maxValue,_y6=Math.round(_z6*this.value);this.setStyleOfPart('value','width',_y6+'px');}}});HProgressIndicator=HView.extend({_e2:null,_X2:0,drawSubviews:function(){var _0=this;_0.setStyle('border','1px solid #999');_0.setStyle('background-color','#ccc');var _A=_0.rect.height,_w=ELEM.getVisibleSize(_0.elemId)[0]-2;_0['_3'+0]=HRect.nu(0,0,_A,_A);_0['_3'+1]=HRect.nu(_w-_A,0,_w,_A);_0._e2=HView.nu(HRect.nu(_0['_3'+0]),_0);_0._e2.setStyle('background-color','#333');_0._e2.onAnimationEnd=function(){this.parent._k4();};_0._k4();},_k4:function(){this._X2=this._X2===1?0:1;var _x6=HRect.nu(this['_3'+this._X2]);this._e2.animateTo(_x6);}});HImageView=HControl.extend({controlDefaults:(HControlDefaults.extend({scaleToFit:true,value:null,constructor:function(_a){if(this.value===null){this.value=_a.getThemeGfxPath()+"/blank.gif";}}})),_j4:function(_Z0){this.elemId=ELEM.make(_Z0,'img');ELEM.setAttr(this.elemId,'src',this.value);ELEM.setAttr(this.elemId,'alt',this.label);},_i4:function(_Z0){this.elemId=ELEM.make(_Z0,'div');ELEM.setStyle(this.elemId,'background-image','url('+this.value+')');ELEM.setStyle(this.elemId,'background-position','0px 0px');ELEM.setStyle(this.elemId,'background-repeat','no-repeat');},_O4:function(_Z0){if(this.options.scaleToFit){this._j4(_Z0);}
else{this._i4(_Z0);}},refreshValue:function(){ELEM.setAttr(this.elemId,'src',this.value);},refreshLabel:function(){ELEM.setAttr(this.elemId,'alt',this.label);},scaleToFit:function(){if(!this.options.scaleToFit){ELEM.del(this.elemId);this._j4(this._Y2());this.options.scaleToFit=true;}},scaleToOriginal:function(){if(this.options.scaleToFit){ELEM.del(this.elemId);this._i4(this._Y2());this.options.scaleToFit=false;}}});HStepper=HControl.extend({componentName:"stepper",controlDefaults:(HControlDefaults.extend({minValue:0,maxValue:100,stepSize:1,repeatInterval:200,wrapAround:false,constructor:function(_a){if(!this.events){this.events={mouseDown:true,keyDown:true,mouseWheel:true};}}})),setWrapAround:function(_w6){this.options.wrapAround=_w6;},_t4:function(_1){var _0=this,_4=_0.options,_v4=_4.minValue,_o4=_4.maxValue,_m4=_1<_v4,_p6=_1>_o4,_n6=(_m4||_p6);if(!_n6){return _1;}
if(_4.wrapAround){if(_m4){return _o4;}
else{return _v4;}}
else{return _0.value;}},stepUp:function(){this.setValue(this._t4(this.value+this.options.stepSize));},stepDown:function(){this.setValue(this._t4(this.value-this.options.stepSize));},_M4:function(_Q0){return['HSystem.views[',this.viewId,'].step',(_Q0?'Up':'Down'),'();'].join('');},bgStateUp:'0px -23px',bgStateDown:'0px -46px',_m6:function(_Q0){ELEM.setStyle(this.markupElemIds.state,'background-position',_Q0?this.bgStateUp:this.bgStateDown);},_l6:function(){ELEM.setStyle(this.markupElemIds.state,'background-position','');},_Y0:function(_Q0){var _0=this,_4=_0.options;_0._m6(_Q0);if(_Q0){_0.stepUp();_0._U4=setInterval(_0._M4(1),_4.repeatInterval);}
else{_0.stepDown();_0._U4=setInterval(_0._M4(0),_4.repeatInterval);}},_Z2:function(){this._l6();clearInterval(this._U4);},mouseDown:function(x,y){this.setMouseUp(true);this._Y0((y-ELEM.getVisiblePosition(this.elemId)[1])<=11);},mouseUp:function(){this._Z2();},blur:function(){this._Z2();},keyDown:function(_v0){this.setKeyUp(true);var _k6=(_v0===Event.KEY_DOWN),_h4=(_v0===Event.KEY_UP),_j6=(_v0===Event.KEY_LEFT),_N4=(_v0===Event.KEY_RIGHT),_i6=(_k6||_h4||_j6||_N4);if(_i6){this._Y0((_h4||_N4));}
else if(_v0===Event.KEY_HOME){this.setValue(this.options.minValue);}
else if(_v0===Event.KEY_END){this.setValue(this.options.maxValue);}
else if(_v0===Event.KEY_PAGEUP){this._Y0(1);}
else if(_v0===Event.KEY_PAGEDOWN){this._Y0(0);}},keyUp:function(){this._Z2();},mouseWheel:function(_V){(_V>0)?this.stepUp():this.stepDown();}});HValidatorView=HControl.extend({constructor:function(_3,_h,_4){if(_4!==undefined){if(_4.valueField&&_4.valueField.componentBehaviour[1]==='control'){_3.offsetTo(_4.valueField.rect.right,_4.valueField.rect.top);}}
this.base(_3,_h,_4);},setValue:function(_9){if(!_9&&_9!==false){_9=false;}
this.base(_9);},refreshValue:function(){var _0=this,_1=_0.value,_J4=_1===true,_n=_J4?-21:0,_j=_0.enabled?0:-21,_I2=_J4?'':_1,_6=_0.elemId;ELEM.setStyle(_6,'background-image',"url("+_0.getThemeGfxFile('validator.png')+")");ELEM.setStyle(_6,'background-repeat','no-repeat');ELEM.setStyle(_6,'background-position',_n+'px '+_j+'px');}});HWindow=HDynControl.extend({componentName:'window',controlDefaults:(HDynControl.prototype.controlDefaults.extend({constructor:function(_a){var _g1=ELEM.windowSize(),_03=_g1[0],_13=_g1[1];if(!this.minSize){this.minSize=[96,54];}
if(!this.maxSize){this.maxSize=_g1;}
if(!this.maxX){this.maxX=_03-this.minSize[0];}
if(!this.maxY){this.maxY=_13-this.minSize[1];}
if(!this.events){this.events={draggable:true};}
if(!this.resizeNW){this.resizeNW=[6,6];}
if(!this.resizeNE){this.resizeNE=[6,6];}
if(!this.resizeSW){this.resizeSW=[6,6];}
if(!this.resizeSE){this.resizeSE=[16,16];}},resizeW:4,resizeE:4,resizeN:4,resizeS:4,fullWindowMove:false,closeButton:false,collapseButton:false,zoomButton:false})),draw:function(){var _c6=this.drawn;this.base();if(!_c6){HSystem.windowFocus(this);}},makeRectRules:function(){var _0=this,_J2=_0.base(),_3=_0.rect,_v=_0.options,_h2=_v.resizeW;if(!_v.fullWindowMove){if(_v.zoomButton){_h2=61;}
else if(_v.collapseButton){_h2=46;}
else if(_v.closeButton){_h2=27;}
_J2[8]=[_h2,_v.resizeN,_3.width-_v.resizeE,25];}
return _J2;},gainedActiveStatus:function(){HSystem.windowFocus(this);},windowFocus:function(){this.toggleCSSClass(this.elemId,'inactive',false);},windowBlur:function(){this.toggleCSSClass(this.elemId,'inactive',true);this.setStyle('cursor','default');},windowClose:function(){this.die();},windowCollapse:function(){var _H1=HRect.nu(this.rect.leftTop,this.rect.leftTop.subtract(0-this.options.minSize[0],0-this.options.minSize[1]));_H1.setHeight(26);if(this.rect.equals(_H1)){if(this.prevRect!==undefined&&!this.prevRect.equals(_H1)){this.animateTo(HRect.nu(this.prevRect));}
else{this.windowZoom();}}
else{this.prevRect=HRect.nu(_H1);this.animateTo(_H1);}},windowZoom:function(){var _b6=HRect.nu(this.options.minX,this.options.minY,this.options.maxSize[0],this.options.maxSize[1]),_J=HRect.nu(this.rect),i=0,_R=this.views,_c,_o0,_W,_C;for(;i<_R.length;i++){_c=HSystem.views[_R[i]];_o0=ELEM.getVisibleSize(_c.elemId);_L1=ELEM.getVisiblePosition(_c.elemId);_W=_o0[0]+_L1[0];_C=_o0[1]+_L1[1];if(_W>_J.width){_J.setWidth(_W);}
if(_C>_J.height){_J.setHeight(_C);}}
if(_J.width>this.options.maxSize[0]){_J.setWidth(this.options.maxSize[0]);}
else if(_J.width<this.options.minSize[0]){_J.setWidth(this.options.minSize[0]);}
if(_J.height>this.options.maxSize[1]){_J.setHeight(this.options.maxSize[1]);}
else if(_J.height<this.options.minSize[1]){_J.setHeight(this.options.minSize[1]);}
if(this.rect.equals(_J)){if(this.prevRect!==undefined&&!this.prevRect.equals(_J)){this.animateTo(HRect.nu(this.prevRect));}
else{this.prevRect=HRect.nu(this.rect);this.animateTo(_b6);}}
else{this.prevRect=HRect.nu(_J);this.animateTo(_J);}}});HTabView=HView.extend({draw:function(){var _L3=this.drawn;this.base();if(!_L3){var i=0,_23=[['overflow','auto']];for(i;i<_23.length;i++){this.setStyle(_23[i][0],_23[i][1]);}
this.hide();}}});HTab=HControl.extend({componentName:"tab",componentBehaviour:['view','control','tab'],refreshOnValueChange:true,refreshOnLabelChange:false,controlDefaults:(HControlDefaults.extend({constructor:function(_a){if(!this.events){this.events={mouseDown:true};}
this.tabInit(_a);},tabInit:function(_a){_a.tabs=[];_a.tabLabels=[];_a.tabLabelBounds=[];_a.tabLabelStrings=[];}})),rightmostPx:0,selectIdx:-1,tabLabelHeight:20,tabLabelLeftEdge:4,tabLabelRightEdge:4,fontStyle:'font-family:Arial,sans-serif;font-size:13px;',tabLabelHTMLPrefix1:'<div class="edge-left"></div><div class="tablabel" style="width:',tabLabelHTMLPrefix2:'px">',tabLabelHTMLSuffix:'</div><div class="edge-right"></div>',tabLabelParentElem:'label',tabLabelElementTagName:'div',tabLabelAlign:'left',tabLabelFillBg:false,tabTriggerLink:false,tabLabelNoHTMLPrefix:false,refreshValue:function(){var _1=this.value;if(typeof _1==='number'){var _x=parseInt(_1,10);if(_x<this.tabs.length){if(_x!==this.selectIdx){this.selectTab(_x);}}}},setLabel:function(_f){this.label=_f;},selectTab:function(_o){if(_o instanceof HTabView){_o=_o.tabIndex;}
if(this.selectIdx!==-1){var _s4=this.tabLabels[this.selectIdx],_a6=this.tabs[this.selectIdx];ELEM.removeClassName(_s4,'item-fg');ELEM.addClassName(_s4,'item-bg');HSystem.views[_a6].hide();}
if(_o!==-1){var _30=this.tabLabels[_o],_33=this.tabs[_o];ELEM.removeClassName(_30,'item-bg');ELEM.addClassName(_30,'item-fg');HSystem.views[_33].show();}
this.selectIdx=_o;this.setValue(_o);},addTab:function(_u1,_H4){var _o=this.tabs.length,_43='',_G4=this.stringWidth(_u1),_53=_G4+this.tabLabelLeftEdge+this.tabLabelRightEdge,_k1=new HTabView([0,this.tabLabelHeight,null,null,0,0],this),_30=ELEM.make(this.markupElemIds[this.tabLabelParentElem],this.tabLabelElementTagName);_o=this.tabs.length;if(this.tabLabelNoHTMLPrefix){_43=_u1;}
else{_43=this.tabLabelHTMLPrefix1+_G4+this.tabLabelHTMLPrefix2+_u1+this.tabLabelHTMLSuffix;}
_k1.hide();ELEM.addClassName(_30,'item-bg');ELEM.setStyle(_30,'width',_53+'px');ELEM.setStyle(_30,this.tabLabelAlign,this.rightmostPx+'px');ELEM.setHTML(_30,_43);this.tabLabelStrings.push(_u1);if(this.tabTriggerLink&&this.tabLabelElementTagName==='a'){ELEM.setAttr(_30,'href','javascript:HSystem.views['+this.viewId+'].selectTab('+_o+');');}
else if(this.tabTriggerLink){ELEM.setAttr(_30,'mouseup','HSystem.views['+this.viewId+'].selectTab('+_o+');');}
else{this.tabLabelBounds.push([this.rightmostPx,this.rightmostPx+_53]);}
this.rightmostPx+=_53;if(this.tabLabelAlign==='right'){ELEM.setStyle(this.markupElemIds[this.tabLabelParentElem],'width',this.rightmostPx+'px');}
else if(this.tabLabelFillBg){ELEM.setStyle(this.markupElemIds.state,'left',this.rightmostPx+'px');}
this.tabs.push(_k1.viewId);this.tabLabels.push(_30);_k1.tabIndex=_o;if(_H4||(this.value===_o)){this.selectTab(_o);}
return _k1;},mouseDown:function(_n,_j){if(this.tabTriggerLink){this.setMouseDown(false);return;}
_n-=this.pageX();_j-=this.pageY();if(_j<=this.tabLabelHeight){if(this.tabLabelAlign==='right'){_n=this.rect.width-_n;}
if(_n<=this.rightmostPx){var i=0,_63;for(i;i<this.tabLabelBounds.length;i++){_63=this.tabLabelBounds[i];if(_n<_63[1]&&_n>=_63[0]){this.selectTab(i);return;}}}}},removeTab:function(_o){var _R4=this.selectIdx,_33=this.tabs[_o],_30=this.tabViews[_o];this.tabs.splice(_o,1);this.tabLabels.splice(_o,1);this.tabLabelBounds.splice(_o,1);this.tabLabelStrings.splice(_o,1);if(_o===_R4){this.selectIdx=-1;if(_o===0&&this.tabs.length===0){this.selectTab(-1);}
else if(_o===(this.tabs.length-1)){this.selectTab(_o-1);}
else{this.selectTab(_o);}}
else if(_o<_R4){this.selectIdx--;}
ELEM.del(_30);HSystem.views[_33].die();}});HTabItem={nu:function(_3,_h,_4){return _h.addTab(_4.label,_4.select);}};HSheet=HControl.extend({componentName:'sheet',refreshValue:function(){if(this.value===0){this.show();}
else{this.hide();}},drawRect:function(){if(this.parent&&this.rect.isValid){var _0=this,_6=_0.elemId,_z=ELEM.setStyle,_3=_0.rect,_w=_3.width,_b0=0-Math.floor(_3.width/2),_A=_3.height;_z(_6,'left','0px',true);_z(_6,'top','0px',true);_z(_6,'right','0px',true);_z(_6,'bottom','0px',true);_z(_6,'width','auto',true);_z(_6,'height','auto',true);_z(_6,'min-width',_w+'px',true);_z(_6,'min-height',_A+'px',true);if(_0['markupElemIds']){var _g2=_0.markupElemIds['state'];_z(_g2,'left',_b0+'px',true);_z(_g2,'top','0px',true);_z(_g2,'width',_w+'px',true);_z(_g2,'height',_A+'px',true);}
if(undefined===_0.isHidden||_0.isHidden===false){_z(_6,'visibility','inherit',true);}
_z(_6,'display','block',true);_0._06();_0.drawn=true;}
return this;}});HAlertSheet=HSheet.extend({refreshLabel:function(){this.base();if(this['alertText']){this.alertText.setValue(this.label);}},drawSubviews:function(){this.icon=HImageView.nu([16,16,48,48],this,{value:this.getThemeGfxFile('sheet_warning.png')});this.alertText=HStringView.nu([80,16,null,null,8,48],this,{value:this.label});this.alertButtons();},alertButtons:function(){this.okButton=HClickValueButton.nu([null,null,60,23,8,8],this,{label:'OK',valueObj:this.valueObj,events:{click:true}});}});HConfirmSheet=HAlertSheet.extend({alertButtons:function(){this.cancelButton=HClickValueButton.extend({click:function(){this.setValue(-1);}}).nu([null,null,60,23,76,8],this,{label:'Cancel',valueObj:this.valueObj,events:{click:true}});this.base();}});HListItems=HValueResponder.extend({constructor:function(_3,_h,_4){this.parent=_h;if(_4 instanceof Object){if(_4['valueObj']!==undefined){_4.valueObj.bind(this);}}},_26:function(_W8){console.log("Warning; HListItems: "+_W8);},refresh:function(){if(this.value instanceof Array){var _40=[],_I0,_f,_1,i=0;for(;i<this.value.length;i++){_I0=this.value[i];if(_I0 instanceof Object){_f=_I0['label'];_1=_I0['value'];if(_f===undefined||_1===undefined){this._26("The value or label of row "+_I0+" is undefined (ignored)");}
_40.push([_1,_f]);}
else{this._26("The row "+_I0+" is not an object (ignored)");}}
this.parent.setListItems(_40);}}});HCheckboxList=HControl.extend({drawSubviews:function(){this.setStyle('border','1px solid #999');this.setStyle('overflow','auto');},listItems:[],listItemViews:[],ListCheckbox:HCheckbox.extend({refreshValue:function(){this.base();if(this.value===true){this.parent.addItem(this.options.listValue);}
else{this.parent.delItem(this.options.listValue);}}}),addItem:function(_E1){if(this.value.indexOf(_E1)===-1){var _o2=[],i=0;for(;i<this.value.length;i++){_o2.push(this.value[i]);}
_o2.push(_E1);this.setValue(_o2);}},delItem:function(_E1){var _N8=this.value.indexOf(_E1);if(_N8!==-1){var _o2=[],i=0;for(;i<this.value.length;i++){if(this.value[i]!==_E1){_o2.push(this.value[i]);}}
this.setValue(_o2);}},setListItems:function(_40){var _22,_1,_f,_F8,_E8,i=0;for(;i<this.listItemViews.length;i++){try{this.listItemViews[i].die();}
catch(e){console.log('HCheckboxList, setListItems item destruction error: ',e);}}
this.listItems=_40;this.listItemViews=[];for(i=0;i<_40.length;i++){_22=_40[i];_1=_22[0];_f=_22[1];_F8=(this.value.indexOf(_1)!==-1);_E8=this.ListCheckbox.nu([4,(i*23)+4,null,23,4,null],this,{label:_f,value:_F8,listValue:_1});this.listItemViews[i]=_E8;}
this.refreshValue();},die:function(){this.listItems=null;this.listItemViews=null;this.base();},refreshValue:function(){if(this.listItemViews.length===0){return this;}
var _1=this.value,_40=this.listItems,_15,_d9=[],i=0,_g5;for(;i<_40.length;i++){_15=_40[i][0];_g5=(_1.indexOf(_15)!==-1);this.listItemViews[i].setValue(_g5);if(_g5){_d9.push(_15);}}
return this;}});HRadiobuttonList=HControl.extend({drawSubviews:function(){this.setStyle('border','1px solid #999');this.setStyle('overflow-y','auto');},listItems:[],listItemViews:[],setListItems:function(_40){var _22,_1,_f,_A8,i=0;for(;i<this.listItemViews.length;i++){try{this.listItemViews[i].die();}
catch(e){console.log('HRadiobuttonList, setListItems item destruction error: ',e);}}
this.listItems=_40;this.listItemViews=[];for(i=0;i<_40.length;i++){_22=_40[i];_1=_22[0];_f=_22[1];_A8=HRadiobutton.nu([4,(i*23)+4,null,23,4,null],this,{label:_f});this.listItemViews[i]=_A8;}
this.refreshValue();},die:function(){this.listItems=null;this.listItemViews=null;this.radioButtonIndexValue.die();this.base();},radioButtonIndexValue:false,radioButtonResponder:false,RadioButtonIndexResponder:HValueResponder.extend({constructor:function(_h,_i1){this.parent=_h;},refresh:function(){var _40=this.parent.listItems;if(_40[this.value]!==undefined){this.parent.setValue(_40[this.value][0]);}}}),refreshValue:function(){var _1=this.value;if(this.listItems.length!==0&&this['valueMatrix']!==undefined){if(this.radioButtonResponder===false){this.radioButtonIndexValue=HValue.nu(false,0);this.radioButtonIndexValue.bind(this.valueMatrix);this.radioButtonResponder=this.RadioButtonIndexResponder.nu(this);this.radioButtonIndexValue.bind(this.radioButtonResponder);}
for(var i=0;i<this.listItems.length;i++){if(this.listItems[i][0]===_1){this.radioButtonResponder.setValue(-1);this.radioButtonResponder.setValue(i);break;}}}}});HDateTime=HClass.extend({msWeek:604800000,msDay:86400000,msHour:3600000,msMinute:60000,months_localized:['January','February','March','April','May','June','July','August','September','October','November','December'],monthName:function(_8){_8=(_8 instanceof Date)?_8:this.date();return this.months_localized[_8.getUTCMonth()];},week:function(_8){_8=(_8 instanceof Date)?_8:this.date();var _E7=this.firstDateOfYear(_8),_L2=this.firstDateOfWeek(_E7);if(_L2.getUTCDate()<=28){_L2=new Date(_L2.getTime()+this.msWeek-this.tzMs(_L2));}
var _b5=Math.ceil((((_8.getTime()-_L2-this.tzMs(_8))/this.msDay)+_E7.getUTCDay()+1)/7);if((_b5===53)&&(this.firstDateOfWeek(this.lastDateOfYear(_8)).getUTCDate()>28)){_b5=1;}
return _b5;},mday:function(_8){_8=(_8 instanceof Date)?_8:this.date();return _8.getUTCDate();},month:function(_8){_8=(_8 instanceof Date)?_8:this.date();return _8.getUTCMonth();},year:function(_8){_8=(_8 instanceof Date)?_8:this.date();return _8.getUTCFullYear();},tzMs:function(_8){return _8.getTimezoneOffset()*this.msMinute;},date:function(epoch_seconds){epoch_seconds=(typeof epoch_seconds==='number')?epoch_seconds:this.value;var _8=new Date(epoch_seconds*1000);return _8;},firstDateOfYear:function(_8){_8=(_8 instanceof Date)?_8:this.date();var _q0=new Date(_8.getUTCFullYear(),0,1),_f1=new Date(_q0.getTime()-this.tzMs(_q0));return _f1;},lastDateOfYear:function(_8){_8=(_8 instanceof Date)?_8:this.date();var _q0=new Date(new Date(_8.getUTCFullYear()+1,0,1)-1),_f1=new Date(_q0.getTime()-this.tzMs(_q0));return _f1;},firstDateOfMonth:function(_8){_8=(_8 instanceof Date)?_8:this.date();var _q0=new Date(_8.getUTCFullYear(),_8.getUTCMonth(),1),_f1=new Date(_q0.getTime()-this.tzMs(_q0));return _f1;},lastDateOfMonth:function(_8){_8=(_8 instanceof Date)?_8:this.date();var _q0=new Date(new Date(_8.getUTCFullYear(),_8.getUTCMonth()+1,1)-1),_f1=new Date(_q0.getTime()-this.tzMs(_q0));return _f1;},firstDateOfWeek:function(_8){_8=(_8 instanceof Date)?_8:this.date();var _K5=_8.getUTCDay();if(_K5===0){_K5=7;}
var _v9=((_K5-1)*this.msDay),_q0=new Date(_8.getTime()-_v9),_f1=new Date(_q0.getTime());return _f1;},lastDateOfWeek:function(_8){var _u9=this.firstDateOfWeek(_8),_t9=new Date(_u9.getTime()+this.msWeek-this.msDay-1);return _t9;}});HCalendar=HControl.extend({componentName:'calendar',weekdays_localized:['Wk','Mon','Tue','Wed','Thu','Fri','Sat','Sun'],mouseWheel:function(_V){if(_V<0){this.nextMonth();}
else{this.prevMonth();}},refreshLabel:function(){var _N5=this.weekdays_localized,_p8=Math.floor(this.rect.width/_N5.length),_n8=[],i=0,_Ea=['<div style="width:'+_p8+'px;left:','px">'],_Da='</div>';for(;i<_N5.length;i++){_n8.push([_Ea.join(i*_p8),_N5[i],_Da].join(''));}
ELEM.setHTML(this.markupElemIds.label,_n8.join(''));},calendarDateRange:function(_8){var _Aa=this.firstDateOfMonth(_8),_va=this.lastDateOfMonth(_8),_z1=this.firstDateOfWeek(_Aa),_x2=this.lastDateOfWeek(_va),_ua=this.week(_z1),_ta=this.week(_x2),_F5=_ta-_ua;if((_F5===5)&&(_z1.getDate()!==1)){_x2=new Date(_x2.getTime()+this.msWeek);}
else if((_F5===5)&&(_z1.getDate()===1)){_z1=new Date(_z1.getTime()-this.msWeek);}
else if(_F5===4){_z1=new Date(_z1.getTime()-this.msWeek);_x2=new Date(_x2.getTime()+this.msWeek);}
return[_z1,_x2];},refreshValue:function(){var _8=this.date();this.drawCalendar(_8);},nextMonth:function(){var _8=new Date(this.viewMonth[0],this.viewMonth[1]+1,1);this.drawCalendar(new Date(_8.getTime()-this.tzMs(_8)));},prevMonth:function(){var _8=new Date(this.viewMonth[0],this.viewMonth[1]-1,1);this.drawCalendar(new Date(_8.getTime()-this.tzMs(_8)));},viewMonth:[1970,0],drawCalendar:function(_8){_8=(_8 instanceof Date)?_8:this.date();var _f8=this.calendarDateRange(_8),_J5=this.firstDateOfMonth(_8),_na=this.lastDateOfMonth(_8),_ma=_f8[0],_5b=_f8[1],_ja=this.weekdays_localized.length,_O5=Math.floor((this.rect.width-1)/_ja),_m2=Math.floor((this.rect.height-1-35)/6),_ca=['<div class="calendar_weeks_week_row" style="width:'+(this.rect.width-3)+'px;height:'+_m2+'px;top:','px">'],_aa='</div>',_44=['<a href="javascript:void(HSystem.views['+this.viewId+'].setValue(','));" class="calendar_weeks_week_col','" style="width:'+_O5+'px;height:'+_m2+'px;line-height:'+_m2+'px;left:','px">'],_4a='</a>',_Q9='<div class="calendar_weeks_week_col_wk" style="width:'+_O5+'px;height:'+_m2+'px;line-height:'+_m2+'px;left:0px">',_P9='</div>',_18=[],_V5,_W5,_I0=0,_q2,_08,_R3,_s2,_45;for(;_I0<6;_I0++){_V5=[];for(_q2=0;_q2<8;_q2++){_s2=new Date(_ma.getTime()+((_I0*this.msWeek)+((_q2-1)*this.msDay)));_08=_s2.getTime();if(_q2===0){_W5=[_Q9,this.week(_s2),_P9].join('');}
else{_R3=Math.round(_08/1000);if((this.value>=_R3)&&(this.value<(_R3+86400))){_45='_'+'sel';}
else{_45=(_s2<_J5||_s2>_na)?'_'+'no':'_'+'yes';}
_W5=[_44[0],_R3,_44[1],_45,_44[2],(_q2*_O5),_44[3],this.mday(_s2),_4a].join('');}
_V5.push(_W5);}
_18.push([_ca.join(_I0*_m2),_V5.join(''),_aa].join(''));}
ELEM.setHTML(this.markupElemIds.value,_18.join(''));ELEM.setHTML(this.markupElemIds.state,this.monthName(_8)+'&nbsp;'+this.year(_8));this.viewMonth=[_J5.getUTCFullYear(),_J5.getUTCMonth()];}});HCalendar.implement(HDateTime);HTimeSheet=HControl.extend({componentName:'timesheet',pxPerHour:24,itemOffsetLeft:36,itemOffsetRight:0,refresh:function(){if(this.drawn){var _Q7=this.rect.height;this.pxPerHour=(_Q7-(_Q7%48))/24;if(this.options['hideLabel']){this.setStyleOfPart('label','display','none');this.setStyleOfPart('state','left','0px');this.itemOffsetLeft=0;}
else{this.setStyleOfPart('label','height',(this.pxPerHour*24)+'px');}
this.setStyleOfPart('state','height',(this.pxPerHour*24)+'px');}
this.base();},refreshLabel:function(){var hour=1,hours=[],rowHeight=this.pxPerHour;lineHeight=Math.round(this.pxPerHour/2);for(;hour<24;hour++){hours.push('<div style="line-height:'+rowHeight+'px;height:'+rowHeight+'px;top:'+Math.round((hour*rowHeight)-lineHeight)+'px" class="timesheet_hours_row">'+hour+':00</div>');}
ELEM.setHTML(this.markupElemIds.label,hours.join(''));this.refreshState();},refreshState:function(){var line=0,lines=[],lineHeight=Math.round(this.pxPerHour/2);for(;line<48;line++){lines.push('<div style="top:'+(line*lineHeight)+'px" class="timesheet_lines_row'+(line%2)+'"></div>');}
ELEM.setHTML(this.markupElemIds.state,lines.join(''));},dragItem:false,createItem:function(origY){var _q=Math.round(this.pxPerHour/2);origY=Math.floor(origY/_q)*_q;var maxY=_q*48,lineHeight=Math.round(this.pxPerHour/2);if(origY>maxY){origY=maxY;}
var item=HTimeSheetItem.nu(this.createItemRect(origY,lineHeight),this,{label:'New Item',events:{draggable:true}});this.dragItem=item;},startDrag:function(x,y){this.createItem(y-this.pageY());EVENT.startDragging(this.dragItem);},listItemViews:false,setEditor:function(_u2){this.editor=_u2;},createItemRect:function(_d5,_q){var _b0=this.itemOffsetLeft,_F=_d5,_W=this.rect.width-this.itemOffsetRight,_C=_d5+_q;return HRect.nu(_b0,_F,_W,_C);},die:function(){this.editor.die();this.base();},refreshValue:function(){var _s=this.value,i;if(this.listItemViews===false){this.listItemViews=[];}
if(this.listItemViews.length!==0){for(i=0;i<this.listItemViews.length;i++){this.listItemViews[i].die();}
this.listItemViews=[];}
if(_s instanceof Array){var _1,_f,_r;for(i=0;i<_s.length;i++){_1=_s[i];_f=_1['label'];_r=HTimeSheetItem.nu(this.createItemRect(0,12),this,{label:_f,value:_1,events:{draggable:true}});_r.dragMode='normal';this.listItemViews.push(_r);}}}});HTimeSheetItem=HControl.extend({componentName:'timesheet_item',dragMode:'create',prevXY:[0,0],prevXYTime:0,startDrag:function(x,y){this.origY=y-this.parent.pageY();if(this.dragMode==='normal'){var _M7=new Date().getTime(),_q9=(Math.round(this.prevXY[0]/4)===Math.round(x/4)),_o9=(Math.round(this.prevXY[1]/4)===Math.round(y/4)),_g9=((_M7-this.prevXYTime)<500);if(_q9&&_o9&&_g9){if(this.parent['editor']){var _u2=this.parent.editor;_u2.setTimeSheetItem(this);_u2.bringToFront();_u2.show();}}
else{var _K7=this.rect.top-this.origY,_J7=this.rect.bottom-this.origY;if(0>=_K7&&_K7>=-3){this.dragMode='resize-top';}
else if(0<=_J7&&_J7<=4){this.dragMode='resize-bottom';}
else{this.dragMode='move';this.moveDiff=this.origY-this.rect.top;}
this.bringToFront();}}
this.prevXY=[x,y];this.prevXYTime=_M7;return true;},setTimeSheetItemLabel:function(_f){this.label=_f;this.refreshLabel();},dragCreate:function(_j){var _89=(_j<this.origY),_q=Math.floor(this.parent.pxPerHour/2),_F,_C,_z2;if(_89){var _M2=Math.floor(_j/_q)*_q,_n5=Math.ceil(this.origY/_q)*_q;if(_M2<0){_M2=0;}
_z2=_M2-_n5;if(_z2<=0-_q){_F=_M2;_C=_n5;}
else if(_z2===0){_F=_M2-_q;_C=_n5;}}
else{var _N2=Math.ceil(_j/_q)*_q,_t5=Math.floor(this.origY/_q)*_q;if(_N2>(_q*48)){_N2=_q*48;}
_z2=_N2-_t5;if(_z2>=_q){_F=_t5;_C=_N2;}
else if(_z2===0){_F=_t5;_C=_N2+_q;}}
this.rect.setTop(_F);this.rect.setBottom(_C);},dragResizeTop:function(_j){var _q=Math.floor(this.parent.pxPerHour/2),_F=Math.floor(_j/_q)*_q;if(_F<0){_F=0;}
if(_F+_q>this.rect.bottom){_F=this.rect.bottom-_q;}
this.rect.setTop(_F);},dragResizeBottom:function(_j){var _q=Math.floor(this.parent.pxPerHour/2),_C=Math.floor(_j/_q)*_q;if(_C>_q*48){_C=_q*48;}
if(_C-_q<this.rect.top){_C=this.rect.top+_q;}
this.rect.setBottom(_C);},dragMove:function(_j){var _q=Math.floor(this.parent.pxPerHour/2),_F=Math.floor((0-this.moveDiff+_j)/_q)*_q;if(_F<0){_F=0;}
if(_F+this.rect.height>_q*48){_F=_q*48-this.rect.height;}
this.rect.offsetTo(this.rect.left,_F);},drag:function(x,y){var _V8=this.parent.pageY(),_j=y-_V8;if(this.dragMode==='create'){this.dragCreate(_j);}
else if(this.dragMode==='resize-top'){this.dragResizeTop(_j);}
else if(this.dragMode==='resize-bottom'){this.dragResizeBottom(_j);}
else if(this.dragMode==='move'){this.dragMove(_j);}
this.drawRect();return true;},endDrag:function(x,y){var _M1=Math.floor(this.parent.pxPerHour),_1;if(this.dragMode==='create'){this.parent.listItemViews.push(this);_1={'timeBegin':this.rect.top/_M1,'timeEnd':this.rect.bottom/_M1,'label':this.label};if(this.parent['editor']){this.parent.editor.createItem(_1);}}
else{_1=COMM.Values.clone(this.value);_1['timeBegin']=this.rect.top/_M1;_1['timeEnd']=this.rect.bottom/_M1;if(this.parent['editor']){this.parent.editor.modifyItem(_1);}}
this.setValue(_1);this.dragMode='normal';return true;},refreshValue:function(){var _1=this.value,_M1=this.parent.pxPerHour;if((_1 instanceof Object)&&!(_1 instanceof Array)){this.setLabel(_1['label']);this.rect.setTop(_1['timeBegin']*_M1);this.rect.setBottom(_1['timeEnd']*_M1);this.drawRect();}}});HTimeSheetEditor=HControl.extend({timeSheetItem:false,createId:0,setTimeSheetItem:function(_y5){this.timeSheetItem=_y5;this.textField.setValue(_y5.label);},show:function(){if(this.timeSheetItem!==false){var _D2=HRect.nu(this.timeSheetItem.rect);if(_D2.height<40){_D2.setHeight(40);}
if(_D2.width<200){_D2.setWidth(200);}
var _u7=this.timeSheetItem.parent.rect;_D2.offsetBy(_u7.left,_u7.top);this.setRect(_D2);this.drawRect();}
this.base();},hide:function(){this.base();},origParent:null,createItem:function(_90){if(_90['id']===undefined){this.createId--;_90['id']=this.createId;}
var _1=COMM.Values.clone(this.value),_I3=_1['create'],i=0,_r=false;for(;i<_I3.length;i++){if(_I3[i]['id']===_90['id']){_r=_I3[i];break;}}
if(!_r){_I3.push(_90);}
else{for(var _7 in _90){_r[_7]=_90[_7];}}
this.setValue(_1);},modifyItem:function(_90){if(_90['id']<0){this.createItem(_90);}
else{var _1=COMM.Values.clone(this.value),_g4=_1['modify'],i=0,_r=false;for(;i<_g4.length;i++){if(_g4[i]['id']===_90['id']){_r=_g4[i];break;}}
if(!_r){_g4.push(_90);}
else{for(var _7 in _90){_r[_7]=_90[_7];}}
this.setValue(_1);}},deleteItem:function(_m5){var _1=COMM.Values.clone(this.value);if(_1['delete'].indexOf(_m5)===-1){_1['delete'].push(_m5);this.setValue(_1);}},refreshValue:function(){var _1=COMM.Values.clone(this.value),i=0,_h=this.origParent?this.origParent:this.parent,_k7=_h.listItemViews,_j7=_1['response'],_r,_e5,_O2,j,k;for(;i<_j7.length;i++){for(j=0;j<_k7.length;j++){_O2=_j7[i];_r=_k7[j];if(_r.value['id']===_O2['id']){_e5=COMM.Values.clone(_r.value);if(_O2['modify']!==undefined){for(k in _O2['modify']){_e5[k]=_O2['modify'][k];}
_r.setValue(_e5);}}}}
_1['response']=[];this.setValue(_1);},drawSubviews:function(){this.origParent=this.parent;this.remove();this.origParent.parent.addView(this);ELEM.append(this.elemId,this.parent.elemId);this.textField=HTextArea.nu([0,0,null,20,0,26],this,{value:''});this.delButton=HButton.extend({click:function(){this.parent.hide();var _U3=this.parent.timeSheetItem;if(_U3!==false){this.parent.deleteItem(_U3.value['id']);_U3.die();var _h=this.parent.origParent?this.parent.origParent:this.parent.parent;var _s9=_h.listItemViews.indexOf(_U3);_h.listItemViews.splice(_s9,1);this.parent.timeSheetItem=false;}}}).nu([2,null,60,24,null,0],this,{label:'Delete',events:{click:true}});this.okButton=HButton.extend({click:function(){this.parent.hide();if(this.parent.timeSheetItem!==false){var _f=this.parent.textField.getTextFieldValue(),_2=this.parent.timeSheetItem.value['id'],_s=this.parent.timeSheetItem.value;_s['label']=_f;this.parent.modifyItem(_s);this.parent.timeSheetItem.setTimeSheetItemLabel(_f);this.parent.timeSheetItem=false;}}}).nu([null,null,60,24,2,0],this,{label:'Save',events:{click:true}});this.cancelButton=HButton.extend({click:function(){this.parent.hide();if(this.timeSheetItem!==false){this.parent.timeSheetItem=false;}}}).nu([null,null,60,24,66,0],this,{label:'Cancel',events:{click:true}});this.textField.setStyle('text-align','center');this.textField.setStyle('line-height','12px');this.textField.setStyle('font-size','12px');this.textField.setStyle('font-family','Arial, sans-serif');this.origParent.setEditor(this);}});