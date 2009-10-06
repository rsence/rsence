
var HClass=function(){if(arguments.length){var _84=arguments[0];if(this===window){HClass.prototype.extend.call(_84,arguments.callee.prototype);}else{this.extend(_84);}}};HClass.prototype={extend:function(_h0,_3){var _t1=HClass.prototype.extend;if(arguments.length===2){var _b3=this[_h0];if((_b3 instanceof Function)&&(_3 instanceof Function)&&_b3.valueOf()!==_3.valueOf()&&(/\bbase\b/).test(_3)){var _60=_3;_3=function(){var _J5=this.base;this.base=_b3;var _K5=_60.apply(this,arguments);this.base=_J5;return _K5;};_3.valueOf=function(){return _60;};_3.toString=function(){return String(_60);};}
return this[_h0]=_3;}else if(_h0){var _d0={toSource:null};var _94=["toString","valueOf"];if(HClass._83){_94.push("constructor");}
for(var i=0;(_i=_94[i]);i++){if(_h0[_i]!==_d0[_i]){_t1.call(this,_i,_h0[_i]);}}
for(var _i in _h0){if(!_d0[_i]){_t1.call(this,_i,_h0[_i]);}}}
this.nu=function(){return new(this.extend({constructor:function(args){this.base.apply(this,args);}}))(arguments);};return this;},base:function(){}};HClass.extend=function(_20,_53){var _t1=HClass.prototype.extend;if(!_20){_20={};}
HClass._83=true;var _d0=new this;_t1.call(_d0,_20);var _n1=_d0.constructor;_d0.constructor=this;delete HClass._83;var _y0=function(){if(!HClass._83){_n1.apply(this,arguments);}
this.constructor=_y0;};_y0.prototype=_d0;_y0.extend=this.extend;_y0.implement=this.implement;_y0.toString=function(){return String(_n1);};_t1.call(_y0,_53);var _43=_n1?_y0:_d0;if(_43.init instanceof Function){_43.init();}
return _43;};HClass.implement=function(_u1){if(_u1 instanceof Function){_u1=_u1.prototype;}
this.prototype.extend(_u1);};var Base=HClass;if([]['indexOf']===undefined){Object.extend=function(destination,source){for(property in source){destination[property]=source[property];}
return destination;};Object.extend(Array.prototype,{indexOf:function(_L5){var i=0,l=this.length;for(;i<l;i++){if(this[i]===_L5){return i;}}
return-1;}});}
try{if(window['console']===undefined){console={log:function(){}};}}catch(e){}
ELEMTickerInterval=10;BROWSER_TYPE={ie:false,ie6:false,ie7:false,ie8:false,opera:false,safari:false,symbian:false,chrome:false,firefox:false,firefox2:false,firefox3:false};ELEM={_n1:function(){var _0=ELEM;_0._j1=false;_0._R1=[];_0._j3=null;_0._t3=false;_0._16=false;_0._S4=0;_0._M0=0;_0._G1=0;_0._j2=0;_0._u3=0;_0._k2=0;_0._T7=0;_0._l2=0;_0._v3=0;_0._B4=0;_0._w3=500;_0._Q1=null;_0._B0=ELEMTickerInterval;_0._O1=false;_0._U2=false;_0._x3=1;_0._t=[];if(_0._j1){_0._z={_15:[]};}else{_0._R4=[];}
_0._03={};_0._v0={};_0._g0={};_0._p0={};_0._E0=[];_0._R0={};_0._Q7=",ADDRESS,BLOCKQUOTE,CENTER,DIR,DIV,DL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,ISINDEX,MENU,NOFRAMES,NOSCRIPT,OL,P,PRE,TABLE,UL,";},_i9:function(_26,_s){if(!ELEM._j1){return;}
var _0=ELEM,i=0,_36=[],_z=_0._46(_s),_u0=_z._u0;for(;i!==_26;i++){_36.push(_0.make(_u0,_s));}
for(i=0;i!==_26;i++){_0.del(_36[i]);}},_e5:function(_5){var _4,_0=ELEM,_t=_0._t,_P7=(_0._R4.length!==0);if(_P7){_4=_0._R4.pop();_t[_4]=_5;}
else{_t.push(_5);_4=_t.length-1;}
return _4;},_M1:function(_4){var _0=ELEM;_0._v0[_4]=[];_0._03[_4]={};_0._g0[_4]=[];_0._p0[_4]={};_0._R0[_4]=false;},bindId:function(_E7){var _0=ELEM,_5=document.getElementById(_E7),_6=_0._e5(_5);_0._M1(_6);return _6;},bind:function(_5){var _4,_0=ELEM;_4=_0._e5(_5);_0._M1(_4);return _4;},_v9:function(_4,_5){var _0=ELEM;_0._t[_4]=_5;},get:function(_4){return ELEM._t[_4];},setHTML:function(_4,_e1){try{var _0=ELEM;if(!_0._t[_4]){return;}
if(!((typeof _e1==='string')||(typeof _e1==='number'))){return;}
_0._t[_4].innerHTML=_e1;}catch(e){}},getHTML:function(_4){try{var _0=ELEM;if(_0._t[_4]){return _0._t[_4].innerHTML;}
else{return'';}}catch(e){}},_46:function(_s){if(!ELEM._j1){return;}
var _0=ELEM,_z=_0._z;if(!_z[_s]){_z._15.push(_s);_z[_s]=[];_z[_s]._i3=1;_z[_s]._m2=0;_z[_s]._u0=_0.make(_0._u0,'div');}
return _z[_s]._u0;},del:function(_4){var _0=ELEM,_5=_0._t[_4];while(_0._O1){}
_0._O1=true;if(_0._j1){var _s=_5.tagName,_u0=_0._46(_s),_z=_0._z[_s];_0.append(_4,_u0);}
var _56=_0._E0.indexOf(_4);if(_56!==-1){_0._E0.splice(_56,1);}
_0._M1(_4);if(_0._j1){_z._i3++;_z.push(_4);}else{_0._R4.push(_4);var _66=_5.parentNode;if(_66!==null){_66.removeChild(_5);}
_5=null;_0._t[_4]=null;}
_0._O1=false;},append:function(_D7,_N1){var _h0,_65,_0;_0=ELEM;_h0=_0._t[_D7];_65=_0._t[_N1];_65.appendChild(_h0);},setCSS:function(_4,_C7){ELEM._t[_4].style.cssText=_C7;},getCSS:function(_4){return ELEM._t[_4].style.cssText;},getVisibleSize:function(_4){var _0,_5,w,h,_b,_p1,_0=ELEM,_5=_0._t[_4],w=_5.offsetWidth,h=_5.offsetHeight,_b=_5.parentNode;while(_b&&_b.nodeName.toLowerCase()!=='body'){if(!_0._30){_p1=document.defaultView.getComputedStyle(_b,null).getPropertyValue('overflow');}
else{_p1=_b.currentStyle.getAttribute('overflow');}
_p1=_p1!=='visible';if(w>_b.clientWidth&&_p1){w=_b.clientWidth-_5.offsetLeft;}
if(h>_b.clientHeight&&_p1){h=_b.clientHeight-_5.offsetTop;}
_5=_5.parentNode;_b=_5.parentNode;}
return[w,h];},getSize:function(_4){var _0,_5,w,h,_b,_p1,_0=ELEM,_5=_0._t[_4],w=_5.offsetWidth,h=_5.offsetHeight;return[w,h];},getScrollSize:function(_4){var _0,_5,w,h,_b,_p1,_0=ELEM,_5=_0._t[_4],w=_5.scrollWidth,h=_5.scrollHeight;return[w,h];},getVisiblePosition:function(_4){var _0,_0=ELEM,x=0,y=0,_5=_0._t[_4];while(_5!==document){x+=_5.offsetLeft;y+=_5.offsetTop;x-=_5.scrollLeft;y-=_5.scrollTop;_5=_5.parentNode;if(!_5){break;}}
return[x,y];},getOpacity:function(_4){var _0,_G0,_M4,_z3;_0=ELEM;_z3=_0.getStyle;if(_G0=_z3(_4,'-khtml-opacity')){return parseFloat(_G0);}
if(_G0=_z3(_4,'-moz-opacity')){return parseFloat(_G0);}
_M4=_z3(_4,'opacity',true);if(_G0=_M4||(_M4===0)){return parseFloat(_G0);}
if(_G0=(_0._t[_4].currentStyle['filter']||'').match(/alpha\(opacity=(.*)\)/)){if(_G0[1]){return parseFloat(_G0[1])/100;}}
return 1.0;},setOpacity:function(_4,_3){var _0=ELEM;if(_3===1&&_0._30){_0._t[_4].style.setAttribute('filter',_0.getStyle(_4,'filter',true).replace(/alpha\([^\)]*\)/gi,''));}else{if(_3<0.01){_3=0;}
if(_0._30){_0._t[_4].style.setAttribute('filter',_0.getStyle(_4,'filter',true).replace(/alpha\([^\)]*\)/gi,'')+'alpha(opacity='+_3*100+')');}else{_0._t[_4].style.setProperty('opacity',_3,'');}}},getIntStyle:function(_4,_a){var _3=ELEM.getStyle(_4,_a);return parseInt(_3,10);},setBoxCoords:function(_4,_r0){ELEM.setStyle(_4,'left',_r0[0]+'px');ELEM.setStyle(_4,'top',_r0[1]+'px');ELEM.setStyle(_4,'width',_r0[2]+'px');ELEM.setStyle(_4,'height',_r0[3]+'px');},getExtraWidth:function(_4){var _61=ELEM.getIntStyle;return _61(_4,'padding-left')+_61(_4,'padding-right')+_61(_4,'border-left-width')+_61(_4,'border-right-width');},getExtraHeight:function(_4){var _61=ELEM.getIntStyle;return _61(_4,'padding-top')+_61(_4,'padding-bottom')+_61(_4,'border-top-width')+_61(_4,'border-bottom-width');},setFPS:function(_b1){ELEM._B0=1000/_b1;if(ELEM._B0<ELEMTickerInterval){ELEM._B0=ELEMTickerInterval;}},setSlowness:function(_x3){ELEM._x3=_x3;},setIdleDelay:function(_w3){ELEM._w3=_w3;},_v1:false,flushLoop:function(_S0){var _0=ELEM;_0._k2++;if(_0._z0&&(_0._k2%5===0)&&_0._v1){iefix._h1();_0._v1=false;}
clearTimeout(_0._Q1);if(_0._O1){_S0*=2;_0._Q1=setTimeout('ELEM.flushLoop('+_S0+');',_S0);return;}else{if(!_0._U2){if(_0._z0&&_0._v1){iefix._h1();_0._v1=false;}
_0._Q1=setTimeout('ELEM.flushLoop('+_S0+');',_0._w3);return;}
_S0=parseInt(_0._x3*(_0._v3/_0._B4),ELEMTickerInterval);if(_S0<_0._B0||!_S0){_S0=_0._B0;}
_0._O1=true;_0._Q1=setTimeout('ELEM.flushLoop('+_S0+');',_S0);}
_0._v3-=new Date().getTime();var _Q4,_L1,i,_v0;_E0=_0._E0;_Q4=_E0.length;_L1=_E0.splice(0,_Q4);var _e9=new Date().getTime();for(i=0;i<_Q4;i++){_0._c9++;var _4=_L1.pop();_0._R0[_4]=false;_0._76(_4);_0._A7(_4);}
_0._B4++;_0._v3+=new Date().getTime();if(_0._E0.length===0&&_0._U2){_0._U2=false;}
_0._O1=false;},_A7:function(_4){var _0=ELEM,_g0=_0._g0[_4],_p0=_0._p0[_4],_5=_0._t[_4],_a,_V1,i,_86=_g0.length,_L1=_g0.splice(0,_86);for(i=0;i!==_86;i++){_a=_L1.pop();_V1=_p0[_a];_5.setAttribute(_a,_V1);}},getAttr:function(_4,_a,_i0){var _0=ELEM,_96=_0._p0[_4][_a],_V1;if(_96!==undefined&&!_i0){return _96;}
var _5=_0._t[_4];if(_5.getAttribute(_a)===null){_5[_a]='';}
_V1=_5.getAttribute(_a);_0._p0[_4][_a]=_V1;return _V1;},setAttr:function(_4,_a,_3,_i0){var _n2,_0=ELEM,_g0=_0._g0[_4],_p0=_0._p0[_4];_n2=_3!==_0.getAttr(_4,_a);if(_n2){_p0[_a]=_3;if(_i0){_0._t[_4].setAttribute(_a,_3);}
else{if(_g0.indexOf(_a)===-1){_g0.push(_a);}
if(!_0._R0[_4]){_0._E0.push(_4);_0._R0[_4]=true;_0._W4();}}}},delAttr:function(_4,_a){var _n2,_0=ELEM,_g0=_0._g0[_4],_p0=_0._p0[_4];delete _p0[_a];_0._t[_4].removeAttribute(_a);if(_g0.indexOf(_a)!==-1){_g0.splice(_g0.indexOf(_a,1));}
if(_0._R0[_4]){_0._E0.splice(_0._E0.indexOf(_4,1));_0._R0[_4]=false;_0._W4();}},hasClassName:function(_6,_w1){var _c=ELEM.get(_6);if(!_c)return;var _w4=false;var _o2=_c.className.split(' ');for(var i=0;i<_o2.length;i++){if(_o2[i]===_w1){_w4=true;}}
return _w4;},addClassName:function(_6,_w1){var _c=ELEM.get(_6);if(!_c)return;ELEM.removeClassName(_6,_w1);_c.className+=' '+_w1;},removeClassName:function(_6,_w1){var _c=ELEM.get(_6);if(!_c)return;var _K4='';var _o2=_c.className.split(' ');for(var i=0;i<_o2.length;i++){if(_o2[i]!==_w1){if(i>0)_K4+=' ';_K4+=_o2[i];}}
_c.className=_K4;},_W4:function(){var _0=ELEM;if(!_0._U2){_0._U2=true;if(!_0._O1){clearTimeout(_0._Q1);_0._Q1=setTimeout('ELEM.flushLoop('+_0._B0+');',_0._B0);}}},setStyle:function(_4,_a,_3,_i0){var _0=ELEM,_H=_0._03[_4],_b6=_0._t,_n2,_v0;_0._M0++;if(_H===undefined){_0._M1(_4);var _H=_0._03[_4];}
_n2=_3!==_H[_a];if(_n2){_0._G1++;_H[_a]=_3;if(_i0){if(_a==='opacity'){_0.setOpacity(_4,_3);}
else{_0._30?(_b6[_4].style.setAttribute(_a.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;}),_H[_a])):(_b6[_4].style.setProperty(_a,_H[_a],''));}
if(_0._z0){if(iefix._l5.indexOf(_a)!==-1){_0._v1=true;}}}else{_R0=_0._R0;_v0=_0._v0[_4];if(_v0.indexOf(_a)===-1){_v0.push(_a);}
if(!_R0[_4]){_0._E0.push(_4);_R0[_4]=true;_0._W4();}}}},make:function(_N1,_s){if(_N1===undefined){_N1=0;}
if(_s===undefined){_s='DIV';}else{_s=_s.toUpperCase();}
var _0=ELEM,_5,_4;_0._S4++;if(_0._j1){if(_0._z[_s]){if(_0._z[_s].length!==0){_4=_0._z[_s].pop();_0._z[_s]._m2++;_5=_0._t[_4];if(_0._Q7.indexOf(','+_s+',')!==-1){_0.setCSS(_4,'display:block;');}else{_0.setCSS(_4,'display:inline;');}
_0.append(_4,_N1);return _4;}}}
_5=document.createElement(_s);_0._t[_N1].appendChild(_5);_4=_0._e5(_5);_0._M1(_4);return _4;},windowSize:function(){var _N0,_c6;_N0=(window.innerWidth)?window.innerWidth:document.documentElement.clientWidth;_c6=(window.innerHeight)?window.innerHeight:document.documentElement.clientHeight;return[_N0,_c6];},_Y4:function(){var _0=ELEM,_X1,_T4;var _U4=["ELEM.getStyle=function(_4,_a,_i0){","var _0=ELEM,_H=_0._03[_4],_p2;_0._j2++;","if((_H[_a]===undefined)||_i0){","if(!_i0){_0._u3++;}","if((_a==='opacity')&&_i0){_p2=_0.getOpacity(_4);}","else{","_p2=document.defaultView.getComputedStyle(_0._t[_4],null).getPropertyValue(_a);","_y7=_a.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){","return $3.toUpperCase()+$4});","_p2=_0._t[_4].currentStyle[_y7];","}_H[_a]=_p2;","}return _H[_a];};"];if(_0._30){_U4.splice(6,1);}else{_U4.splice(7,3);}
eval(_U4.join(''));var _X4=["ELEM._76=function(_4){","var _0=ELEM,_v0=_0._v0[_4],_H=_0._03[_4],_5=_0._t[_4],_l3,_Z4,_05,_a,_L1,_p2;","if(!_5){return;}","_l3=_5.style;","_Z4=_v0.length;","_L1=_v0.splice(0,_Z4);","for(_05=0;_05!==_Z4;_05++){","_a=_L1.pop();_0._l2++;","if(_a==='opacity'){_p2=_0.setOpacity(_4,_H[_a]);}else{","if(_0._z0){if(iefix._l5.indexOf(_a)!==-1){_0._v1=true;}}try{_l3.setAttribute(_a.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4}),_H[_a]);}catch(e){}}}};","_l3.setProperty(_a,_H[_a],'');}}};"];if(_0._30){_X4.pop();}else{_X4.splice(9,1);}
eval(_X4.join(''));_0.bind(document.body);if(_0._j1){_0._u0=_0.make(0,'div');_0.setCSS(_0._u0,"display:none;visibility:hidden;");_0.setAttr(_0._u0,'id','trashcan_'+_0._u0);}
_0._Q1=setTimeout('ELEM.flushLoop('+_0._B0+')',_0._B0);if(!_0._R1){return;}
while(_0._R1.length!==0){_X1=_0._R1.shift();if(typeof _X1==='string'){_T4=eval(_X1);if(typeof _T4==='string'){_0._R1.push(_T4);}}}
_0._16=true;},_v7:function(){_0=ELEM;_0._30=(document.all&&navigator.userAgent.indexOf("Opera")===-1)?true:false;_0._z0=(_0._30&&navigator.userAgent.indexOf("MSIE 6")!==-1)?true:false;_0._u7=(_0._30&&navigator.userAgent.indexOf("MSIE 7")!==-1)?true:false;_0._t7=(_0._30&&navigator.userAgent.indexOf("MSIE 8")!==-1)?true:false;_0._e6=(navigator.userAgent.indexOf("KHTML")!==-1)?true:false;_0._q7=(navigator.userAgent.indexOf("SymbianOS")!==-1)?true:false;_0._U8=(navigator.userAgent.indexOf("Chrome")!==-1)?true:false;_0._S8=(navigator.userAgent.indexOf("Firefox")!==-1)?true:false;_0._R8=(navigator.userAgent.indexOf("Firefox/2.")!==-1)?true:false;_0._P8=(navigator.userAgent.indexOf("Firefox/3.")!==-1)?true:false;_0._O8=(navigator.userAgent.indexOf("Opera")!==-1)?true:false;BROWSER_TYPE={opera:_0._O8,safari:_0._e6,symbian:_0._q7,chrome:_0._U8,ie:_0._30,ie6:_0._z0,ie7:_0._u7,ie8:_0._t7,firefox:_0._S8,firefox2:_0._R8,firefox3:_0._P8};_0._f6();},_g6:function(_X1){var _0=ELEM;if(typeof _X1==='string'){if(_0._16===true){eval(_X1);}else{_0._R1.push(_X1);}}},_f6:function(){var _A9=false;var _0=ELEM;if(_0._30){var _m5="javascript:void(0)";if(location.protocol==="https:"){_m5="src=//0";}
document.write("<scr"+"ipt id=_K8 defer src="+_m5+"><\/scr"+"ipt>");var _J8=document.getElementById("_K8");_J8.onreadystatechange=function(){if(this.readyState==="complete"){ELEM._t3=true;ELEM._Y4();delete ELEM._R1;clearTimeout(ELEM._j3);delete ELEM._j3;}};return;}
else if((/KHTML|WebKit/i.test(navigator.userAgent))&&(/loaded|complete/.test(document.readyState))){_0._t3=true;}
else if(document.body){_0._t3=true;}
if(!_0._t3){_0._j3=setTimeout('ELEM._f6()',ELEMTickerInterval*10);}else{_0._Y4();delete _0._R1;clearTimeout(_0._j3);delete _0._j3;}}};ELEM._n1();RUN=ELEM._g6;LOAD=ELEM._g6;ELEM._v7();Event={element:function(e){return e.target||e.srcElement;},pointerX:function(e){return e.pageX||e.clientX+document.documentElement.scrollLeft;},pointerY:function(e){return e.pageY||e.clientY+document.documentElement.scrollTop;},stop:function(e){if(e.preventDefault){e.preventDefault();e.stopPropagation();}
else{e.returnValue=false;e.cancelBubble=true;}},isLeftClick:function(e){if(ELEM._30||ELEM._e6){return(e.button===1);}
else{return(e.button===0);}},observers:false,_I8:function(_5,_i,_L0,_q0){if(!Event.observers){Event.observers=[];}
if(_5.addEventListener){this.observers.push([_5,_i,_L0,_q0]);_5.addEventListener(_i,_L0,_q0);}
else if(_5.attachEvent){this.observers.push([_5,_i,_L0,_q0]);_5.attachEvent("on"+_i,_L0);}},unloadCache:function(){if(!Event.observers){return;}
var i,l=Event.observers.length;for(i=0;i<l;i++){Event.stopObserving.apply(this,Event.observers[0]);}
Event.observers=false;},observe:function(_5,_i,_L0,_q0){_q0=_q0||false;Event._I8(_5,_i,_L0,_q0);},stopObserving:function(_5,_i,_L0,_q0){if(_5===undefined){console.log('Warning Event.stopObserving of event name: "'+_i+'" called with an undefined elem!');return;}
_q0=_q0||false;if(_5['removeEventListener']){_5.removeEventListener(_i,_L0,_q0);}
else if(detachEvent){_5.detachEvent("on"+_i,_L0);}
var i=0;while(i<Event.observers.length){var eo=Event.observers[i];if(eo&&eo[0]===_5&&eo[1]===_i&&eo[2]===_L0&&eo[3]===_q0){Event.observers[i]=null;Event.observers.splice(i,1);}
else{i++;}}},KEY_BACKSPACE:8,KEY_TAB:9,KEY_RETURN:13,KEY_ESC:27,KEY_LEFT:37,KEY_UP:38,KEY_RIGHT:39,KEY_DOWN:40,KEY_DELETE:46,KEY_HOME:36,KEY_END:35,KEY_PAGEUP:33,KEY_PAGEDOWN:34};if(ELEM._30){Event.observe(window,"unload",Event.unloadCache,false);}
_h6={mouseMove:false,mouseDown:false,click:false,mouseUp:false,draggable:false,droppable:false,keyDown:false,keyUp:false,mouseWheel:false,isDragged:false,textEnter:false};EVENT={status:[false,false,0,0,[],false,false,false],button1:0,button2:1,crsrX:2,crsrY:3,keysDown:4,altKeyDown:5,ctrlKeyDown:6,shiftKeyDown:7,enableDroppableChecks:true,startDroppable:function(){var _0=EVENT;_0.hovered=[];_0.hoverInterval=50;_0.hoverTimer=new Date().getTime();},start:function(){var _C4,_K3,i=0,_0=EVENT;if(ELEM._30){_C4=document;}
else{_C4=window;}
_K3=[['mousemove',EVENT.mouseMove],['mouseup',EVENT.mouseUp],['mousedown',EVENT.mouseDown],['click',EVENT.click],['keyup',EVENT.keyUp],['keydown',EVENT.keyDown],['keypress',EVENT.keyPress],['contextmenu',EVENT.contextMenu],['resize',EVENT.resize],['mousewheel',EVENT.mouseWheel]];for(;i!==_K3.length;i++){Event.observe(_C4,_K3[i][0],_K3[i][1]);}
if(window.addEventListener){window.addEventListener('DOMMouseScroll',EVENT.mouseWheel,false);window.addEventListener('resize',EVENT.resize,false);}
_0.listeners=[];_0.focused=[];_0.resizeListeners=[];_0.coordListeners=[];_0.focusOptions={};_0.dragItems=[];if(_0.enableDroppableChecks){_0.startDroppable();}
_0.topmostDroppable=null;_0.textEnterCtrls=[];_0._r2=[];_0._H8=true;_0._i6=null;_0.activeControl=null;_0._E4=null;},coordCacheFlush:function(_6){if(_6){EVENT._r2[_6]=null;}
else{EVENT._r2=[];}},reg:function(_e,_71){var _6,_5,_0=EVENT,_M3;_6=_e.elemId;_5=ELEM.get(_6);if(ELEM._30){_5.setAttribute('ctrl',_e);}
else{_5.ctrl=_e;}
_0.listeners[_6]=true;_0.focused[_6]=false;for(_M3 in _h6){if(_71[_M3]===undefined){_71[_M3]=_h6[_M3];}}
_0.focusOptions[_6]=_71;var _I4=_0.coordListeners.indexOf(_6);if(_71.mouseMove){if(_I4===-1){_0.coordListeners.push(_6);}}
else if(_I4!==-1){_0.coordListeners.splice(_I4,1);}
if(_71.textEnter){if(_0.textEnterCtrls.indexOf(_e.viewId)===-1){_0.textEnterCtrls.push(_e.viewId);}}
if(_71.resize){if(_0.resizeListeners.indexOf(_e.viewId)===-1){_0.resizeListeners.push(_e.viewId);}}
Event.observe(_5,'mouseover',_0._t2);},unreg:function(_e){var _0=EVENT,_6,_5;if(_e===this.activeControl){_0.changeActiveControl(null);}
_6=_e.elemId;_5=ELEM.get(_6);this.listeners[_6]=false;this.focused[_6]=false;this._r2[_6]=null;var _j6=_0.textEnterCtrls.indexOf(_e.viewId);if(_j6!==-1){_0.textEnterCtrls.splice(_j6,1);}
var _k6=_0.resizeListeners.indexOf(_e.viewId);if(_k6!==-1){_0.resizeListeners.splice(_k6,1);}
if(_5!==undefined){Event.stopObserving(_5,'mouseover',_0._t2);}},resize:function(e){var i=0,_0=EVENT,_u2,_e;for(;i<_0.resizeListeners.length;i++){_u2=_0.resizeListeners[i];_e=HSystem.views[_u2];if(_e.onResize){_e.onResize();}}},_t2:function(e){if(!Event.element){return;}
var _r=Event.element(e);while(_r&&_r.ctrl===undefined){_r=_r.parentNode;}
if(!_r){return;}
var _0=_r.ctrl;EVENT.focus(_0);Event.stop(e);},_O3:function(e){if(!Event.element){return;}
var _r=Event.element(e);while(_r&&_r.ctrl===undefined){_r=_r.parentNode;}
if(!_r){return;}
var _0=_r.ctrl;EVENT.blur(_0);Event.stop(e);},focus:function(_e){var _0=EVENT,_6,_5;_6=_e.elemId;_5=ELEM.get(_6);if(_0.focused[_6]===false&&_0.focusOptions[_6].isDragged===false){Event.stopObserving(_5,'mouseover',_0._t2);Event.observe(_5,'mouseout',_0._O3);_0.focused[_6]=true;if(_e['focus']){_e.focus();}}},blur:function(_e){var _0=EVENT,_6,_5;_6=_e.elemId;_5=ELEM.get(_6);if(_0.focused[_6]===true&&_0.focusOptions[_6].isDragged===false){Event.stopObserving(_5,'mouseout',_0._O3);Event.observe(_5,'mouseover',_0._t2);_0.focused[_6]=false;if(_e['blur']){_e.blur();}}},mouseMove:function(e){var _0=EVENT,x,y,_v2;x=Event.pointerX(e);y=Event.pointerY(e);_0.status[_0.crsrX]=x;_0.status[_0.crsrY]=y;_v2=_0.flushMouseMove(x,y);_0._w2(e);if(_v2){Event.stop(e);}},flushMouseMove:function(x,y){var _0=EVENT,_v2,i,j,_6,_e;clearTimeout(_0._i6);_v2=false;for(i=0;i!==_0.dragItems.length;i++){_6=_0.dragItems[i];_0.focusOptions[_6].ctrl.doDrag(x,y);_0.coordCacheFlush(_6);_v2=true;}
if(_0.enableDroppableChecks){if(new Date().getTime()>_0.hoverTimer+_0.hoverInterval){for(i=0;i!==_0.coordListeners.length;i++){_6=_0.coordListeners[i];_e=_0.focusOptions[_6].ctrl;_e.mouseMove(x,y);}
if(_0.enableDroppableChecks){_0._l6();}
var _P3;for(i=0;i!==_0.dragItems.length;i++){_P3=_0.topmostDroppable;_0.topmostDroppable=null;_6=_0.dragItems[i];_e=_0.focusOptions[_6].ctrl;var _Q3,_Y2;for(j=0;j!==_0.hovered.length;j++){_Q3=_0.hovered[j];if(_Q3!==_6&&_0.focusOptions[_Q3].ctrl){_Y2=_0.focusOptions[_Q3].ctrl;if(!_0.topmostDroppable||_Y2.zIndex()>_0.topmostDroppable.zIndex()||_Y2.supr===_0.topmostDroppable){if(_0.focusOptions[_Y2.elemId].droppable){_0.topmostDroppable=_Y2;}}}}
if(_P3!==_0.topmostDroppable){if(_P3){_P3.onHoverEnd(_e);}
if(_0.topmostDroppable){_0.topmostDroppable.onHoverStart(_e);}}}
_0.hoverTimer=new Date().getTime();}
else{_0._i6=setTimeout('EVENT.flushMouseMove('+x+','+y+');',_0.hoverInterval);}}
return _v2;},_l6:function(){var _0=EVENT,x,y,i,_e,_5,_25,_K1,_r0;_0.hovered=[];x=_0.status[_0.crsrX];y=_0.status[_0.crsrY];for(i=0;i!==_0.listeners.length;i++){if(!_0.listeners[i]||!_0.focusOptions[i].ctrl){continue;}
_e=_0.focusOptions[i].ctrl;_5=ELEM.get(i);if(!_0._H8||!_0._r2[i]){_25=ELEM.getVisiblePosition(_e.elemId);_K1=ELEM.getVisibleSize(_e.elemId);_0._r2[i]=[_25[0],_25[1],_K1[0],_K1[1]];}
_r0=_0._r2[i];if(x>=_r0[0]&&x<=_r0[0]+_r0[2]&&y>=_r0[1]&&y<=_r0[1]+_r0[3]){_0.hovered.push(i);}}},startDragging:function(_e){var _0=EVENT;_0.dragItems.push(_e.elemId);_0.changeActiveControl(_e);_e.startDrag(_0.status[_0.crsrX],_0.status[_0.crsrY]);},mouseDown:function(e,_C0){var _0=EVENT,_b5,x,y,i,_Q,_c1,_X2;_0._w2(e);_b5=false;if(_C0===undefined){_C0=Event.isLeftClick(e);}
if(_C0){_0.status[_0.button1]=true;}
else{_0.status[_0.button2]=true;}
x=_0.status[_0.crsrX];y=_0.status[_0.crsrY];_Q=null;_c1=[];_X2=[];for(i=0;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].ctrl.enabled){_Q=_0.focusOptions[i].ctrl;}
if((_0.focusOptions[i].draggable===true)&&_0.dragItems.indexOf(i)===-1){_c1.push(i);}
else if(_0.focusOptions[i].mouseDown===true){_X2.push(i);}}}
if(_Q){_0.changeActiveControl(_Q);}
for(i=0;i!==_c1.length;i++){_0.dragItems.push(_c1[i]);_0.focusOptions[_c1[i]].ctrl.startDrag(x,y);_b5=true;}
var _T2=_X2.length;for(i=0;i!==_X2.length;i++){if(_0.focusOptions[_X2[i]].ctrl.mouseDown(x,y,_C0)){_T2--;}}
if(_b5){document.body.focus();_0._G8=document.onselectstart;document.onselectstart=function(){return false;};}
if(this.enableDroppableChecks){if((_T2===0)&&(_0.hovered.length!==0)&&(_Q&&(_Q.textElemId===false))){Event.stop(e);}}
return true;},click:function(e,_C0){var _0=EVENT,x,y,i,_Q,_S2;_0._w2(e);if(_C0===undefined){_C0=Event.isLeftClick(e);}
if(_C0){_0.status[_0.button1]=true;}
else{_0.status[_0.button2]=true;}
x=_0.status[_0.crsrX];y=_0.status[_0.crsrY];_Q=null;_S2=[];for(i=0;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].ctrl.enabled){_Q=_0.focusOptions[i].ctrl;}
if(_0.focusOptions[i].click===true){_S2.push(i);}}}
if(_Q){_0.changeActiveControl(_Q);}
var _T2=_S2.length;for(i=0;i!==_S2.length;i++){if(_0.focusOptions[_S2[i]].ctrl.click(x,y,_C0)){_T2--;}}
if(_0.enableDroppableChecks){if((_T2===0)&&(_0.hovered.length!==0)&&(_Q&&(_Q.textElemId===false))){Event.stop(e);}}
return true;},changeActiveControl:function(_e){var _0=EVENT,_y2;_y2=_0.activeControl;if(_e!==_y2){if(_y2){_y2.active=false;_y2._m6(_e);}
_0.activeControl=null;if(_e){_e.active=true;_0.activeControl=_e;_e._n6(_y2);}}},mouseUp:function(e){var _0=EVENT,_f5,x,y,_6,_e,i;_0._w2(e);_f5=false;_C0=Event.isLeftClick(e);_0.status[_0.button1]=false;_0.status[_0.button2]=false;x=_0.status[_0.crsrX];y=_0.status[_0.crsrY];for(i=0;i!==_0.dragItems.length;i++){_6=_0.dragItems[i];_e=_0.focusOptions[_6].ctrl;_e.endDrag(x,y);_f5=true;if(_0.enableDroppableChecks){_0._l6();if(_0.hovered.indexOf(_6)===-1){_0.blur(_e);}}
if(_0.topmostDroppable){_0.topmostDroppable.onHoverEnd(_e);_0.topmostDroppable.onDrop(_e);_0.topmostDroppable=null;}}
_0.dragItems=[];if(_f5){document.onselectstart=_0._G8;}
for(i=0;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].mouseUp===true){_0.focusOptions[i].ctrl.mouseUp(x,y,_C0);}}}
return true;},keyDown:function(e){var _0=EVENT,_Q0;_0._w2(e);_Q0=e.keyCode;if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyDown===true){Event.stop(e);if(_0._E4!==_Q0){_0.activeControl.keyDown(_Q0);}}
if(_0.status[_0.keysDown].indexOf(_Q0)===-1){_0.status[_0.keysDown].push(_Q0);}
_0._E4=_Q0;for(var i=0;i!==_0.textEnterCtrls.length;i++){var _u2=_0.textEnterCtrls[i],_e=HSystem.views[_u2];if(_e.textEnter){_e.textEnter();}}},keyUp:function(e){var _0=EVENT,_Q0,_f9;_0._w2(e);_Q0=e.keyCode;_0._E4=null;if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyUp===true){_0.activeControl.keyUp(_Q0);}
_o6=_0.status[_0.keysDown].indexOf(_Q0);if(_o6!==-1){_0.status[_0.keysDown].splice(_o6,1);}
for(var i=0;i!==_0.textEnterCtrls.length;i++){var _u2=_0.textEnterCtrls[i],_e=HSystem.views[_u2];if(_e.textEnter){_e.textEnter();}}},keyPress:function(e){var _0=EVENT;if(_0.activeControl&&_0.focusOptions[_0.activeControl.elemId].keyDown===true){Event.stop(e);}},mouseWheel:function(e){var _0=EVENT,_M=0,i=0;if(!e){e=window.event;}
if(e.wheelDelta){_M=e.wheelDelta/120;_M=-_M;}
else if(e.detail){_M=-e.detail/3;}
if(BROWSER_TYPE.opera){_M=0-_M;}
for(;i!==_0.focused.length;i++){if(_0.focused[i]===true){if(_0.focusOptions[i].mouseWheel===true){Event.stop(e);_0.focusOptions[i].ctrl.mouseWheel(_M);}}}},contextMenu:function(e){EVENT.mouseDown(e,false);Event.stop(e);},_w2:function(e){var _0=EVENT;_0.status[_0.altKeyDown]=e.altKey;_0.status[_0.ctrlKeyDown]=e.ctrlKey;_0.status[_0.shiftKeyDown]=e.shiftKey;}};LOAD('EVENT.start();');SHAClass=HClass.extend({constructor:function(_X){if(_X){this.setChrsz(_X);}},_H4:0,hexCase:function(){return this._H4;},setHexCase:function(_F8){this._H4=_F8;},_g5:"=",base64Pad:function(){return this._g5;},setBase64Pad:function(_E8){this._g5=_E8;},_X:8,chrsz:function(){return this._X;},setChrsz:function(_D8){this._X=_D8;},hexSHA1:function(_A1){var _0=this;return _0._p6(_0._B2(_0._C2(_A1),_A1.length*_0._X));},b64SHA1:function(_A1){var _0=this;return _0._z4(_0._B2(_0._C2(_A1),_A1.length*_0._X));},strSHA1:function(_A1){var _0=this;return _0._q6(_0._B2(_0._C2(_A1),_A1.length*_0._X));},hexHmacSHA1:function(_a,_V){var _0=this;return _0._p6(_0._y4(_a,_V));},b64HmacSHA1:function(_a,_V){var _0=this;return _0._z4(_0._y4(_a,_V));},strHmacSHA1:function(_a,_V){var _0=this;return _0._q6(_0._y4(_a,_V));},str2Base64:function(_l){var _0=this;return _0._z4(_0._C2(_l));},test:function(){return this.hexSHA1("abc")==="a9993e364706816aba3e25717850c26c9cd0d89d";},_B2:function(_d,_80){var _0=this;_d[_80>>5]|=0x80<<(24-_80%32);_d[((_80+64>>9)<<4)+15]=_80;var _N0=new Array(80),_Z1=1732584193,_b0=-271733879,_k0=-1732584194,_j0=271733878,_f2=-1009589776,i,_r6,_s6,_t6,_u6,_v6,j,_K0;for(i=0;i<_d.length;i+=16){_r6=_Z1;_s6=_b0;_t6=_k0;_u6=_j0;_v6=_f2;for(j=0;j<80;j++){if(j<16){_N0[j]=_d[i+j];}
else{_N0[j]=_0._P4(_N0[j-3]^_N0[j-8]^_N0[j-14]^_N0[j-16],1);}
_K0=_0._i1(_0._i1(_0._P4(_Z1,5),_0._o7(j,_b0,_k0,_j0)),_0._i1(_0._i1(_f2,_N0[j]),_0._B8(j)));_f2=_j0;_j0=_k0;_k0=_0._P4(_b0,30);_b0=_Z1;_Z1=_K0;}
_Z1=_0._i1(_Z1,_r6);_b0=_0._i1(_b0,_s6);_k0=_0._i1(_k0,_t6);_j0=_0._i1(_j0,_u6);_f2=_0._i1(_f2,_v6);}
return[_Z1,_b0,_k0,_j0,_f2];},_o7:function(_K0,_b0,_k0,_j0){if(_K0<20){return(_b0&_k0)|((~_b0)&_j0);}
if(_K0<40){return _b0^_k0^_j0;}
if(_K0<60){return(_b0&_k0)|(_b0&_j0)|(_k0&_j0);}
return _b0^_k0^_j0;},_B8:function(_K0){return(_K0<20)?1518500249:(_K0<40)?1859775393:(_K0<60)?-1894007588:-899497514;},_y4:function(_a,_V){var _0=this,_R2=_0._C2(_a),_w6=new Array(16),_x6=new Array(16),i,_s1;if(_R2.length>16){_R2=_0._B2(_R2,_a.length*_0._X);}
for(i=0;i<16;i++){_w6[i]=_R2[i]^0x36363636;_x6[i]=_R2[i]^0x5C5C5C5C;}
_s1=_0._B2(_w6.concat(_0._C2(_V)),512+_V.length*_0._X);return _0._B2(_x6.concat(_s1),512+160);},_i1:function(_d,_g){var _y6=(_d&0xFFFF)+(_g&0xFFFF),_A8=(_d>>16)+(_g>>16)+(_y6>>16);return(_A8<<16)|(_y6&0xFFFF);},_P4:function(_h3,_z6){return(_h3<<_z6)|(_h3>>>(32-_z6));},_C2:function(_l){var _0=this,_23=[],_L4=(1<<_0._X)-1,_y8=_l.length*_0._X,i;for(i=0;i<_y8;i+=_0._X){_23[i>>5]|=(_l.charCodeAt(i/_0._X)&_L4)<<(32-_0._X-i%32);}
return _23;},_q6:function(_23){var _0=this,_l="",_L4=(1<<_0._X)-1,i,_G4=_23.length*32,_x8=32-_0._X;for(i=0;i<_G4;i+=_0._X){_l+=String.fromCharCode((_23[i>>5]>>>(_x8-i%32))&_L4);}
return _l;},_p6:function(_d1){var _0=this,_A6=_0._H4?"0123456789ABCDEF":"0123456789abcdef",_l="",i,_c5=_d1.length*4;for(i=0;i<_c5;i++){_l+=_A6.charAt((_d1[i>>2]>>((3-i%4)*8+4))&0xF)+
_A6.charAt((_d1[i>>2]>>((3-i%4)*8))&0xF);}
return _l;},_z4:function(_d1){var _0=this,_m1="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_l="",i,_c5=_d1.length*4,_B6,_C6,_r9,_D6,j,_G4=_d1.length*32;for(i=0;i<_c5;i+=3){_B6=(((_d1[i>>2]>>8*(3-i%4))&0xFF)<<16);_C6=(((_d1[i+1>>2]>>8*(3-(i+1)%4))&0xFF)<<8);_w8=((_d1[i+2>>2]>>8*(3-(i+2)%4))&0xFF);_D6=(_B6|_C6|_w8);for(j=0;j<4;j++){if(i*8+j*6>_G4){_l+=_0._g5;}
else{_l+=_m1.charAt((_D6>>6*(3-j))&0x3F);}}}
return _l;}});SHA=SHAClass.nu(16);HDefaultApplicationInterval=20;HSystemTickerInterval=10;HWindowFocusBehaviour=1;HSystem=HClass.extend({constructor:null,type:'[HSystem]',apps:[],appPriorities:[],busyApps:[],appTimers:[],freeAppIds:[],defaultInterval:HDefaultApplicationInterval,viewsZOrder:[],ticks:0,maxAppRunTime:5000,scheduler:function(){for(var _j=0;_j<this.apps.length;_j++){if(this.apps[_j]){if(!this.busyApps[_j]){if((this.ticks%this.appPriorities[_j])===0){this.appTimers[_j]=setTimeout('if (HSystem.apps['+_j+']) {HSystem.apps['+_j+']._s4();}',10);}}}}
if(this._o1.length!==0){this._N5();}},ticker:function(){this.ticks++;this.scheduler();this._69=setTimeout('HSystem.ticker();',HSystemTickerInterval);},addApp:function(_V0,_N){if(this.freeAppIds.length!==0){var _j=this.freeAppIds.unshift();this.apps[_j]=_V0;}else{this.apps.push(_V0);var _j=this.apps.length-1;}
_V0.parent=this;_V0.parents=[this];_V0.appId=_j;this.startApp(_j,_N);return _j;},startApp:function(_j,_N){if(_N===undefined){_N=this.defaultInterval;}
this.appPriorities[_j]=_N;this.busyApps[_j]=false;},stopApp:function(_j){this.busyApps[_j]=true;},reniceApp:function(_j,_N){this.appPriorities[_j]=_N;},killApp:function(_j,_O5){if(!_O5){var _P5=new Date().getTime();while(this.busyApps[_j]===true){if(new Date().getTime()>_P5+this.maxAppRunTime){break;}}}
this.busyApps[_j]=true;this.apps[_j].destroyAllViews();this.apps[_j]=null;delete this.apps[_j];this.freeAppIds.push(_j);},views:[],_Q2:[],addView:function(_7){var _92;if(this._Q2.length===0){_92=this.views.length;this.views.push(_7);}
else{_92=this._Q2.pop();this.views[_92]=_7;}
return _92;},delView:function(_f){this.views[_f]=null;this._Q2.push(_f);},activeWindowId:0,windowFocus:function(_7){if(!_7){this.activeWindowId=0;return;}
var _V2=this.activeWindowId,_40=this.views,_f=_7.viewId;if(_40[_V2]){if(_40[_V2]["windowBlur"]){_40[_V2].windowBlur();}}
this.activeWindowId=_f;_7.bringToFront();_7.windowFocus();},_o1:[],updateZIndexOfChildren:function(_f){if(this._o1.indexOf(_f)===-1){this._o1.push(_f);}},_N5:function(){var j=0,_0=HSystem,_74=this._o1,_Q5=_74.length;for(;j<_Q5;j++){var _f=_74.shift(),_40=((_f===null)?(_0.viewsZOrder):(_0.views[_f].viewsZOrder)),_R5=_40.length,_y1=ELEM.setStyle,_T3=_0.views,_14,_7,_S5='elemId',_T5='z-index',i=0,_6;for(;i<_R5;i++){_14=_40[i];_7=_T3[_14];_6=_7[_S5];_y1(_6,_T5,i);}}}});LOAD('HSystem.ticker();');HApplication=HClass.extend({componentBehaviour:['app'],constructor:function(_N,_o){this.viewId=null;this.views=[];this.markupElemIds=[];this.viewsZOrder=HSystem.viewsZOrder;HSystem.addApp(this,_N);if(_o){this.label=_o;}
else{this.label='ProcessID='+this.appId;}},buildParents:function(_f){var _7=HSystem.views[_f];_7.parent=this;_7.parents=[];for(var _k1=0;_k1<this.parents.length;_k1++){_7.parents.push(this.parents[_k1]);}
_7.parents.push(this);},addView:function(_7){var _f=HSystem.addView(_7);this.views.push(_f);this.buildParents(_f);this.viewsZOrder.push(_f);return _f;},removeView:function(_f){HSystem.views[_f].remove();},destroyView:function(_f){HSystem.views[_f].die();},die:function(){HSystem.killApp(this.appId,false);},destroyAllViews:function(){var i,_f;for(i=0;i<this.views.length;i++){_f=this.views[i];HSystem.views[_f].die();}},_U5:function(){var i,_f,_7;for(i=0;i<this.views.length;i++){_f=this.views[i];_7=HSystem.views[_f];if((_7!==null)&&(_7['onIdle']!==undefined)){_7.onIdle();}}},_s4:function(){HSystem.busyApps[this.appId]=true;this.onIdle();this._U5();HSystem.busyApps[this.appId]=false;},onIdle:function(){}});COMM={_Y8:function(){}};eval('COMM._M5 = function(){return new '+((window['XMLHttpRequest']!==undefined)?'XMLHttpRequest()':(BROWSER_TYPE.ie?'ActiveXObject("Msxml2.XMLHTTP")':'COMM._49()'))+';}');COMM._j4=function(_Y0){var i=0,_n0=_Y0.length,_W2='';for(;i<_n0;i++){_W2+=encodeURIComponent(_Y0[i]);_W2+=(i===_n0-1)?'':(i%2===0)?'=':'&';}
return _W2;};COMM._k4=function(_0){if(_0.X.readyState===4){var _d2=_0.X.status,_l4='on'+_d2,_n4=((_d2>=200&&_d2<300)||(_d2===0));_0[_l4]?_0[_l4](_0):_n4?_0.onSuccess(_0):_0.onFailure(_0);}};COMM.request=function(_w,_1){var _12=COMM,_0=_1?_1:{},_60=_1.method?_1.method.toUpperCase():'GET',_F0=(_1.async===undefined)?true:_1.async,_Y0=_1.params?_1.params:[],_52=_1.headers?_1.headers:{},_t0=_1.contentType?_1.contentType:'application/x-www-form-urlencoded',_i4=_1.charset?_1.charset:'UTF-8',_a4=_1.username?_1.username:null,_d4=_1.username?_1.password:null;if(!_1.onFailure){_0.onFailure=function(resp){console.log('No failure handler specified, response: ',resp);};}
if(!_1.onSuccess){_0.onSuccess=function(resp){console.log('No success handler specified, response: ',resp);};}
_0.url=_w;_0.X=_12._M5();if(_60==='GET'&&_Y0.length!==0){_w+=((_w.indexOf('?')!==-1)?'&':'?')+_12._j4(_Y0);}
if(!_F0){console.log("WARNING: Synchronous "+_60+" request to "+_w+", these will fail on the Symbian web browser.");}
_0.X.open(_60,_w,_F0,_a4,_d4);_0.X.onreadystatechange=function(){_12._k4(_0);};if(_60==='POST'){_52['Content-Type']=_t0+'; charset='+_i4;var _32=_1.body?_1.body:'';for(var _24 in _52){_0.X.setRequestHeader(_24,_52[_24]);}
_0.X.send(_32);}
else if(_60==='GET'){_0.X.send(null);}
if(!_F0){_12._k4(_0);}
return _0;};COMM.Queue=HApplication.extend({commandQueue:[],paused:false,constructor:function(){this.base(10);},onIdle:function(){if(!this.paused&&(this.commandQueue.length!==0)){this.flush();}},pause:function(){this.paused=true;},resume:function(){this.paused=false;this.flush();},flush:function(){var i=0,_v,_x,_10,_80=this.commandQueue.length;for(;i<_80;i++){if(this.paused){break;}
_v=this.commandQueue.shift();try{if(typeof _v==='function'){_v();}
else{_x=_v[0];_10=_v[1];_x(_10);}}
catch(e){if(BROWSER_TYPE.ie){console.log('COMM.Queue; failed to execute the js block: '+_v+' reason:'+e);}
else{console.log('COMM.Queue; failed to execute the js block: '+_v.toSource()+' reason:'+e);}}}},unshift:function(_x,_10){if(_10!==undefined){this.commandQueue.unshift([_x,_10]);}
else{this.commandQueue.unshift(_x);}},push:function(_x,_10){if(_10!==undefined){this.commandQueue.push([_x,_10]);}
else{this.commandQueue.push(_x);}},unshiftEval:function(_02,_10){var _x;eval('_x = function(){'+_02+'}');this.unshift(_x);},pushEval:function(_02){var _x;eval('_x = function(){'+_02+'}');this.push(_x);}}).nu();COMM.Session=HClass.extend({ses_key:'',req_num:0,newKey:function(_T0){var _0=this,_Z3=_0.sha.hexSHA1(_T0+_0.sha_key);_0.req_num++;_0.ses_key=_0.req_num+':.o.:'+_Z3;_0.sha_key=_Z3;},constructor:function(){var _0=this;_0.sha=SHAClass.nu(8);_0.sha_key=_0.sha.hexSHA1(((new Date().getTime())*Math.random()*1000).toString());_0.ses_key='0:.o.:'+_0.sha_key;}}).nu();COMM.Transporter=HApplication.extend({constructor:function(){var _0=this;this.serverLostMessage='Server Connection Lost. Retrying.';_0.label='Transporter';_0.url=false;_0.busy=false;_0.stop=true;_0._c0=false;_0._L2=false;_0._V5=false;_0.base(1);},onIdle:function(){if(!this.busy){this.sync();}},poll:function(_W5){HSystem.reniceApp(this.appId,_W5);},getClientEvalError:function(){var _0=COMM.Transporter;if(_0._L2){return'&err_msg='+HVM._j5(_0._L2);}
return'';},success:function(resp){var _0=COMM.Transporter,_x1=eval(resp.X.responseText),i=1,_X5=_x1.length,_T0=_x1[0];if(_T0===''){console.log('Invalid session, error message should follow...');}
else{COMM.Session.newKey(_T0);}
for(;i<_X5;i++){try{COMM.Queue.pushEval(_x1[i]);}
catch(e){console.log('clientError:'+e+" - "+e.description+' - '+_x1[i]);_0._L2=e+" - "+e.description+' - '+_x1[i];}}
if(_0._c0){ELEM.del(_0._c0);_0._c0=false;}
COMM.Queue.push(function(){COMM.Transporter.flushBusy();});COMM.Queue.flush();},flushBusy:function(){var _0=COMM.Transporter;_0.busy=false;if(HVM.tosync.length!==0){_0.sync();}},failMessage:function(_J1,_S3){console.log('failMessage?');this.stop=true;COMM.Queue.push(function(){jsLoader.load('default_theme');});COMM.Queue.push(function(){jsLoader.load('controls');});COMM.Queue.push(function(){jsLoader.load('servermessage');});COMM.Queue.push(function(){ReloadApp.nu(_J1,_S3);});},failure:function(_F1){var _0=COMM.Transporter;if(_F1.X.status===0){console.log(_0.serverLostMessage);if(HSystem.appPriorities[_0.appId]<10){HSystem.reniceApp(_0.appId,10);}
if(!_0._c0){_0._c0=ELEM.make(0);ELEM.setCSS(_0._c0,'position:absolute;z-index:1000;padding-left:8px;left:0px;top:0px;height:28px;width:100%;background-color:#600;color:#fff;font-family:Arial,sans-serif;font-size:20px;');ELEM.setStyle(_0._c0,'opacity',0.85);ELEM.setHTML(_0._c0,_0.serverLostMessage);}
else{ELEM.get(_0._c0).innerHTML+='.';}
_0.busy=false;}
else{_0.failMessage('Transporter Error','Transporter was unable to complete the synchronization request.');}},sync:function(){if(this.stop){return;}
if(this.busy){return;}
this.busy=true;var _0=this,_l1=COMM.Values.sync(),_T0='ses_key='+COMM.Session.ses_key,_Y5=_0.getClientEvalError(),_32=[_T0,_Y5,_l1?'&values='+_l1:''].join('');COMM.request(_0.url,{_0:_0,onSuccess:COMM.Transporter.success,onFailure:COMM.Transporter.failure,method:'POST',async:true,body:_32});}}).nu();LOAD('COMM.Transporter.url=HCLIENT_HELLO;COMM.Transporter.stop=false;COMM.Transporter.sync();');COMM.Values=HClass.extend({constructor:function(){var _0=this;_0.values={};_0.tosync=[];},create:function(_4,_V){HValue.nu(_4,_V);},add:function(_4,_3){this.values[_4]=_3;},set:function(_4,_V){this.values[_4].set(_V);},s:function(_4,_V){var _0=this;_V=_0.decode(_V);_0.values[_4].set(_V);},del:function(_4){var _0=this,_l1=_0.values,_3=_l1[_4],_40=_3.views,_85=_40.lengt,i=0,_7;for(;i<_85;i++){_7=_40[i];_7.valueObj=HDummyValue.nu(0,_3.value);}
_3.views=[];delete _l1[_4];},changed:function(_3){var _0=this;if(_0.tosync.indexOf(_3.id)===-1){_0.tosync.push(_3.id);var _E6=COMM.Transporter;if(!_E6.busy){_E6.sync();}}},_t8:['b','n','s'],type:function(_h){var _w0=(typeof _h).slice(0,1);if(this._t8.indexOf(_w0)!==-1){return _w0;}
else if(_w0==='o'){if(_h.constructor===Array){return'a';}
else if(_h.constructor===Object){return'h';}
else if(_h.constructor===Date){return'd';}
return false;}
return false;},_s8:function(_Z2){var _l='[',_s0=[],_80=_Z2.length,_0=this,_v,i=0;for(;i<_80;i++){_v=_0.encode(_Z2[i]);_s0.push(_v);}
_l+=_s0.join(',')+']';return _l;},_l8:function(_Z2){var _s0=[],_80=_Z2.length,_0=this,_v,i=0;for(;i<_80;i++){_v=_0.decode(_Z2[i]);_s0.push(_v);}
return _s0;},_k8:function(_s1){var _l='{',_s0=[],_0=this,_a,_3;for(_a in _s1){_3=_s1[_a];_s0.push(_0.encode(_a)+':'+_0.encode(_3));}
_l+=_s0.join(',')+'}';return _l;},_j8:function(_s1){var _s0={},_0=this,_a,_3;for(_a in _s1){_3=_s1[_a];_s0[_0.decode(_a)]=_0.decode(_3);}
return _s0;},_i8:[[(/\\/g),'\\\\'],[(/\t/g),'\\t'],[(/\n/g),'\\n'],[(/\f/g),'\\f'],[(/\r/g),'\\r'],[(/"/g),'\\"']],_h8:function(_l){var _0=this,_F6=_0._i8,i=0,_80=_F6.length,_A4,_e2,_c3,_s0='';for(;i<_80;i++){_A4=_F6[i];_e2=_A4[0];_c3=_A4[1];_l=_l.replace(_e2,_c3);}
return'"'+_l+'"';},_j5:function(_l){var _Y1;try{_Y1=unescape(encodeURIComponent(_l));}
catch(e){_Y1=_l;}
return _Y1;},_p7:function(_l){var _Y1;try{_Y1=decodeURIComponent(escape(_l));}
catch(e){_Y1=_l;}
return _Y1;},encode:function(_h){var _l,_w0,_0=this;if(_h===null){return'null';}
else if(_h!==undefined){_w0=_0.type(_h);if(!_w0){return'null';}
switch(_w0){case'b':_l=String(_h);break;case'n':_l=String(_h);break;case's':_l=_0._h8(_0._j5(_h));break;case'd':_l='"@'+String(_h.getTime()/1000)+'"';break;case'a':_l=_0._s8(_h);break;case'h':_l=_0._k8(_h);break;default:_l='null';break;}}
else{return'null';}
return _l;},decode:function(_81){var _h,_w0,_0=this;if(_81!==null&&_81!==undefined){_w0=_0.type(_81);if(!_w0){return null;}
switch(_w0){case'b':_h=_81;break;case'n':_h=_81;break;case's':_h=_0._p7(_81);break;case'd':_h=_81;break;case'a':_h=_0._l8(_81);break;case'h':_h=_0._j8(_81);break;default:_h=null;break;}}
else{return null;}
return _h;},sync:function(){if(this.tosync.length===0){return false;}
var _G6={},_0=this,_l1=_0.values,_H6=_0.tosync,_80=_H6.length,i=0,_4,_3;for(;i<_80;i++){_4=_H6.shift();_3=_l1[_4].value;_G6[_4]=_3;}
return encodeURIComponent(_0.encode(_G6));}}).nu();HVM=COMM.Values;HValue=HClass.extend({constructor:function(_4,_3){this.id=_4;this.type='[HValue]';this.value=_3;this.views=[];if(_4){HVM.add(_4,this);}},die:function(){for(var _O=0;_O<this.views.length;_O++){var _73=this.views[_O];_73.setValueObj(HDummyValue.nu());this.views.splice(_O,1);}
if(this.id){HVM.del(this.id);}},set:function(_3){if(this.differs(_3)){this.value=_3;if(this.id){HVM.changed(this);}
this.refresh();}},differs:function(_3){return(COMM.Values.encode(_3)!==COMM.Values.encode(this.value));},s:function(_3){this.value=_3;this.refresh();},get:function(){return this.value;},bind:function(_B){if(_B===undefined){throw("HValueBindError: _B is undefined!");}
if(this.views.indexOf(_B)===-1){this.views.push(_B);_B.setValueObj(this);}},unbind:function(_B){for(var _O=0;_O<this.views.length;_O++){var _73=this.views[_O];if(_73===_B){this.views.splice(_O,1);return;}}},release:function(_B){return this.unbind(_B);},refresh:function(){for(var _O=0;_O<this.views.length;_O++){var _B=this.views[_O];if(_B.value!==this.value){if(!_B._c4){_B._c4=true;_B.setValue(this.value);_B._c4=false;}}}}});JSLoader=HClass.extend({constructor:function(_Z5){var _0=this;_0._f4=[];_0.uri=_Z5;_0._19=false;},_06:function(_0,_F1){console.log("failed to load js: "+_F1.url);},load:function(_I2){var _0=this;if((_0._f4.indexOf(_I2)!==-1)){return;}
COMM.Queue.pause();_0._f4.push(_I2);_0._99=COMM.request(_0.uri+_I2+'.js',{onSuccess:function(_F1){COMM.Queue.unshiftEval(_F1.X.responseText);COMM.Queue.resume();},onFailure:_0._06,method:'GET',async:true});}});RUN("jsLoader = JSLoader.nu(HCLIENT_BASE+'/js/');");HValueMatrixComponentExtension={componentBehaviour:['view','control','matrix'],constructor:function(_2,_b,_1){this.base(_2,_b,_1);this.setValueMatrix();},setValueMatrix:function(){if(this.parent['valueMatrix']===undefined){this.parent.valueMatrix=new HValueMatrix();}
this.valueMatrixIndex=this.parent.valueMatrix.addControl(this);},click:function(){if(this.parent.valueMatrix instanceof HValueMatrix){this.parent.valueMatrix.setValue(this.valueMatrixIndex);}},die:function(){if(this['parent']){if(this.parent['valueMatrix']){this.parent.valueMatrix.release(this);}}
this.base();}};HValueMatrix=HClass.extend({constructor:function(){this.ctrls=[];this.value=-1;this.valueObj=new HDummyValue();},setValueObj:function(_T1){this.valueObj=_T1;this.setValue(_T1.value);},setValue:function(_m){if(_m!==this.value){if(this.value!==-1){if(this.ctrls[this.value]){this.ctrls[this.value].setValue(false);}}
this.value=_m;if(_m!==-1){if(_m<this.ctrls.length){this.ctrls[_m].setValue(true);}}
this.valueObj.set(_m);}},addControl:function(_e){this.ctrls.push(_e);var _I6=this.ctrls.length-1;if(_e.value){this.setValue(_I6);}
return _I6;},release:function(_e){var _m=this.ctrls.indexOf(_e);if(_m!==-1){this.ctrls.splice(_m,1);if(_m===this.value){this.setValue(-1);}}}});HPoint=HClass.extend({constructor:function(){this.type='[HPoint]';var _9=arguments;if(_9.length===0){this._e3();}
else if(_9.length===2){this._J6(_9[0],_9[1]);}
else if(_9.length===1){this._m3(_9[0]);}
else{throw"Invalid number of arguments.";}},_e3:function(){this.x=null;this.y=null;},_J6:function(x,y){this.x=x;this.y=y;},_m3:function(_k){this.x=_k.x;this.y=_k.y;},set:function(){var _9=arguments;if(_9.length===0){this._e3();}
else if(_9.length===2){this._J6(_9[0],_9[1]);}
else if(_9.length===1){this._m3(_9[0]);}
else{throw"Invalid number of arguments.";}},constrainTo:function(_2){if(this.x<_2.left){this.x=_2.left;}
if(this.y<_2.top){this.y=_2.top;}
if(this.x>_2.right){this.x=_2.right;}
if(this.y>_2.bottom){this.y=_2.bottom;}},add:function(_k){_9=arguments;if((_9.length===1)&&(_9[0].type===this.type)){_k=_9[0];return new HPoint((this.x+_k.x),(this.y+_k.y));}
else if(_9.length===2){return new HPoint((this.x+_9[0]),(this.y+_9[1]));}else{return new HPoint(0,0);}},subtract:function(){_9=arguments;if((_9.length===1)&&(_9[0].type===this.type)){_k=_9[0];return new HPoint(this.x-_k.x,this.y-_k.y);}
else if(_9.length===2){return new HPoint(this.x-_9[0],this.y-_9[1]);}else{return new HPoint(0,0);}},equals:function(_k){return(this.x===_k.x&&this.y===_k.y);}});HRect=HClass.extend({constructor:function(){this.type='[HRect]';var _9=arguments;if(_9.length===0){this._e3();}else if(_9.length===4){this._95(_9[0],_9[1],_9[2],_9[3]);}
else if(_9.length===2){this._m3(_9[0],_9[1]);}
else if(_9.length===1){if(_9[0]instanceof Array){this._95(_9[0][0],_9[0][1],_9[0][2],_9[0][3]);}
else{this._K6(_9[0]);}}
else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_e3:function(){this.top=0;this.left=0;this.bottom=-1;this.right=-1;},_95:function(_31,_C1,_P0,_O0){this.top=_C1;this.left=_31;this.bottom=_O0;this.right=_P0;},_m3:function(_L6,_M6){this.top=_L6.y;this.left=_L6.x;this.bottom=_M6.y;this.right=_M6.x;},_K6:function(_2){this.top=_2.top;this.left=_2.left;this.bottom=_2.bottom;this.right=_2.right;},updateSecondaryValues:function(){this.isValid=(this.right>=this.left&&this.bottom>=this.top);this.leftTop=new HPoint(this.left,this.top);this.leftBottom=new HPoint(this.left,this.bottom);this.rightTop=new HPoint(this.right,this.top);this.rightBottom=new HPoint(this.right,this.bottom);this.width=(this.right-this.left);this.height=(this.bottom-this.top);},set:function(){var _9=arguments;if(_9.length===0){this._e3();}else if(_9.length===4){this._95(_9[0],_9[1],_9[2],_9[3]);}
else if(_9.length===2){this._m3(_9[0],_9[1]);}
else if(_9.length===1){this._K6(_9[0]);}
else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},setLeft:function(_31){this.left=_31;this.updateSecondaryValues();},setRight:function(_P0){this.right=_P0;this.updateSecondaryValues();},setTop:function(_C1){this.top=_C1;this.updateSecondaryValues();},setBottom:function(_O0){this.bottom=_O0;this.updateSecondaryValues();},setLeftTop:function(_k){this.left=_k.x;this.top=_k.y;this.updateSecondaryValues();},setLeftBottom:function(_k){this.left=_k.x;this.bottom=_k.y;this.updateSecondaryValues();},setRightTop:function(_k){this.right=_k.x;this.top=_k.y;this.updateSecondaryValues();},setRightBottom:function(_k){this.right=_k.x;this.bottom=_k.y;this.updateSecondaryValues();},setWidth:function(_D){this.right=this.left+_D;this.updateSecondaryValues();},setHeight:function(_W){this.bottom=this.top+_W;this.updateSecondaryValues();},setSize:function(){var _9=arguments;if(_9.length===2){_D=_9[0];_W=_9[1];}
else if(_9.length===1){_D=_9.x;_W=_9.y;}
this.right=this.left+_D;this.bottom=this.top+_W;this.updateSecondaryValues();},intersects:function(_2){return(((_2.left>=this.left&&_2.left<=this.right)||(_2.right>=this.left&&_2.right<=this.right))&&((_2.top>=this.top&&_2.top<=this.bottom)||(_2.bottom>=this.top&&_2.bottom<=this.bottom)));},contains:function(_h){if(_h instanceof HPoint){return this._C8(_h);}
else if(_h instanceof HRect){return this._f8(_h);}
else{throw"Wrong argument type.";}},_C8:function(_k){return(_k.x>=this.left&&_k.x<=this.right&&_k.y>=this.top&&_k.y<=this.bottom);},_f8:function(_2){return(_2.left>=this.left&&_2.right<=this.right&&_2.top>=this.top&&_2.bottom<=this.bottom);},insetBy:function(){var _9=arguments;if(_9.length===1){this._c8(_9[0]);}else if(_9.length===2){this._N6(_9[0],_9[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_c8:function(_k){this._N6(_k.x,_k.y);},_N6:function(x,y){this.left+=x;this.top+=y;this.right-=x;this.bottom-=y;},offsetBy:function(){var _9=arguments;if(_9.length===1){this._78(_9[0]);}else if(_9.length===2){this._O6(_9[0],_9[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_78:function(_k){this._O6(_k.x,_k.y);},_O6:function(x,y){this.left+=x;this.top+=y;this.right+=x;this.bottom+=y;},offsetTo:function(){var _9=arguments;if(_9.length===1){this._48(_9[0]);}else if(_9.length===2){this._P6(_9[0],_9[1]);}else{throw"Invalid number of arguments.";}
this.updateSecondaryValues();},_48:function(_k){this._P6(_k.x,_k.y);},_P6:function(x,y){this.right+=x-this.left;this.left=x;this.bottom+=y-this.top;this.top=y;},equals:function(_2){return(this.left===_2.left&&this.top===_2.top&&this.right===_2.right&&this.bottom===_2.bottom);},intersection:function(_2){return new HRect(Math.max(this.left,_2.left),Math.max(this.top,_2.top),Math.min(this.right,_2.right),Math.min(this.bottom,_2.bottom));},union:function(_2){return new HRect(Math.min(this.left,_2.left),Math.min(this.top,_2.top),Math.max(this.right,_2.right),Math.max(this.bottom,_2.bottom));},valueObj:null,viewIds:[],bind:function(_7){if(this.viewIds.indexOf(_7.viewId)!==-1){this.viewIds.push(_7.viewId);}},release:function(_7){var _Q6=this.viewIds.indexOf(_7.viewId);if(_Q6!==-1){this.viewIds.splice(_Q6,1);}},setValueObj:function(_T1){this.valueObj=_T1;},setValue:function(_3,_k9){if(this.valueObj){this.valueObj.set(_3);}
this.set(_3[0],_3[1],_3[2],_3[3]);var i=0,_f;for(;i<this.viewIds.length;i++){_f=this.viewIds[i];HSystem.views[_f].drawRect();}}});HDefaultThemePath='/H/themes';HDefaultThemeName='default';HNoComponentCSS=[];HNoCommonCSS=[];HThemeHasIE6GifsInsteadOfPng=[];HThemeMode=1;HThemeManager=HClass.extend({constructor:null,init:function(){this.themePath=HDefaultThemePath;this._D3={};this._A3={};this.currentTheme=HDefaultThemeName;},setThemePath:function(_f0){this.themePath=_f0;},_Y7:function(_w){console.log("ERROR: Template Not Found: '"+_w+"' ");},_W7:function(_w){console.log("ERROR: Template Failure: '"+_w+"' ");},_V7:function(_w){console.log("ERROR: Template Exception: '"+_w+"' ");},fetch:function(_w,_t0,_U7,_F0){if(!_t0){_t0='text/html; charset=UTF-8';}
if(_F0){var _R6=function(resp){_U7(resp.X.responseText);};}
else{var _S6;var _R6=function(resp){_S6=resp.X.responseText;};}
COMM.request(_w,{onSuccess:_R6,on404:function(resp){HThemeManager._Y7(resp.url);},onFailure:function(resp){HThemeManager._W7(resp.url);},onException:function(resp){HThemeManager._V7(resp.url);},method:'GET',async:_F0});if(!_F0){return _S6;}},getThemeGfxPath:function(){var _n=this._H2[0],_C=this._H2[1],_E=this._H2[2],_S=this._H2[3],_q1=this._q1(_n,_C,_E,_S);return this._70(_q1,'gfx');},getCssFilePath:function(_H0){var _n=this._H2[0];if((HThemeHasIE6GifsInsteadOfPng.indexOf(_n)!==-1)&&ELEM._z0){return"url('"+this._70(this.getThemeGfxPath(),_H0.replace('.png','-ie6.gif'))+"')";}
else{return"url('"+this._70(this.getThemeGfxPath(),_H0)+"')";}},loadCSS:function(_w){var _t0='text/css',_X7=function(_a1){if(!_a1||_a1===""){return;}
HThemeManager.useCSS(_a1);};this.fetch(_w,_t0,_X7,true);},useCSS:function(_a1){var _t0='text/css';_a1=this._T6(_a1);var _U0,_Z7,_U6;if(ELEM._30){_U0=document.createStyleSheet();_U0.cssText=_a1;}
else{_U0=document.createElement("style");_U0.type=_t0;_U0.media="all";_U6=document.getElementsByTagName('head')[0];_U6.appendChild(_U0);if(BROWSER_TYPE.safari){var _08=document.createTextNode(_a1);_U0.appendChild(_08);}
else{_U0.innerHTML=_a1;}}},_18:function(_l){if(_l[_l.length-1]!=='/'){_l+='/';}
return _l;},_70:function(_28,_38){return this._18(_28)+_38;},_q1:function(_n,_C,_E,_S){var _f0=_E;if(_E===null){_f0=this.themePath;}
if(HThemeMode===0){if(_S){_f0=this._70(_f0,_S);}
if(_E===null){_f0=this._70(_f0,_C);_f0=this._70(_f0,'themes');}
_f0=this._70(_f0,_n);}
else if(HThemeMode===1){_f0=this._70(_f0,_n);}
return _f0;},_E3:function(_n,_C,_E,_S){this._H2=[_n,_C,_E,_S];var _58=this._q1(_n,_C,_E,_S),_68=this._70('css',_C+'.css'),_E3=this._70(_58,_68);return _E3;},_O4:function(_n,_C,_E,_S){var _88=this._q1(_n,_C,_E,_S),_98=this._70('html',_C+'.html'),_a8=this._70(_88,_98);return _a8;},loadMarkup:function(_n,_C,_E,_S){if(!this._D3[_n]){this._D3[_n]={};}
var _H=this._D3[_n][_C];if(null===_H||undefined===_H){var _O4=this._O4(_n,_C,_E,_S),_R=this.fetch(_O4,null,null,false);if(null===_R||undefined===_R){_R="";}
HThemeManager._D3[_n][_C]=_R;return _R;}
return _H;},getMarkup:function(_n,_C,_E,_S){if(!this._A3[_n]){this._A3[_n]={};if(HNoCommonCSS.indexOf(_n)===-1){var _d8=this._E3(_n,'common',_E,null);this.loadCSS(_d8);}}
if(HNoComponentCSS.indexOf(_n)===-1){if(!this._A3[_n][_C]){var _e8=this._E3(_n,_C,_E,_S);this._A3[_n][_C]=true;this.loadCSS(_e8);}}
return this.loadMarkup(_n,_C,_E,_S);},_E2:function(_n,_C,_E,_S){var _q1=this._q1(_n,_C,_E,_S),_w=this._70(_q1,'gfx');return _w;},_g8:function(_n,_C,_E,_S,_H0){if((HThemeHasIE6GifsInsteadOfPng.indexOf(_n)!==-1)&&ELEM._z0){return this._70(this._E2(_n,_C,_E,_S),_H0.replace('.png','-ie6.gif'));}
return this._70(this._E2(_n,_C,_E,_S),_H0);},getThemeGfxFile:function(_H0){return this.getThemeGfxPath()+_H0;},setTheme:function(_W6){this.currentTheme=_W6;},restoreDefaultTheme:function(){this.setTheme(HDefaultThemeName);},_W1:new RegExp(/#\{([^\}]*)\}/),_T6:function(_d3){while(this._W1.test(_d3)){_d3=_d3.replace(this._W1,eval(RegExp.$1));}
return _d3;}});HMarkupView=HClass.extend({bindMarkupVariables:function(){var _R=this.markup;while(HMarkupView._X6.test(_R)){_R=_R.replace(HMarkupView._X6,this.evalMarkupVariable(RegExp.$1,true));}
while(HMarkupView._W1.test(_R)){_R=_R.replace(HMarkupView._W1,this.evalMarkupVariable(RegExp.$1));}
this.markup=_R;return this;},evalMarkupVariable:function(_Y6,_n7){try{var _ID=this.elemId.toString(),_WIDTH=this.rect.width,_HEIGHT=this.rect.height,_Z6=eval(_Y6);if(_n7){return'';}
if(_Z6===undefined){return'';}
else{return _Z6;}}
catch(e){console.log("Warning, the markup string '"+_Y6+"' failed evaluation. Reason:"+e+' '+e.description);return'';}},toggleCSSClass:function(_I0,_33,_07){if(_I0){var _17=ELEM.hasClassName(_I0,_33);if(_07){if(!_17){ELEM.addClassName(_I0,_33);}}
else{if(_17){ELEM.removeClassName(_I0,_33);}}}
return this;}},{_W1:new RegExp(/#\{([^\}]*)\}/),_X6:new RegExp(/\$\{([^\}]*)\}/)});HMorphAnimation=HClass.extend({animateTo:function(_h,_H1,_b1){if(_h instanceof HPoint){var _2=new HRect(_h,_h);_2.setSize(this.rect.width,this.rect.height);this._F4(_2,_H1);}
else if(_h instanceof HRect){this._F4(_h,_H1);}
else{throw"Wrong argument type.";}
return this;},stopAnimation:function(){if(this._L3){window.clearInterval(this._L3);this._L3=null;var _31=parseInt(this.style('left'),10),_C1=parseInt(this.style('top'),10),_D=parseInt(this.style('width'),10),_W=parseInt(this.style('height'),10);this.rect.set(_31,_C1,_31+_D,_C1+_W);this.drawRect();if(this._27){this.onAnimationEnd();}
else{this.onAnimationCancel();}}
return this;},_F4:function(_2,_H1,_b1){if(null===_H1||undefined===_H1){_H1=500;}
if(null===_b1||undefined===_b1||_b1<1){_b1=50;}
if(!this._L3){this._27=false;this.onAnimationStart();var _m8=new Date().getTime();var _r=this;this._L3=window.setInterval(function(){_r._n8({startTime:_m8,duration:_H1,transition:function(t,b,c,d){return c*t/d+b;},props:[{prop:'left',from:_r.rect.left,to:_2.left,unit:'px'},{prop:'top',from:_r.rect.top,to:_2.top,unit:'px'},{prop:'width',from:_r.rect.width,to:_2.width,unit:'px'},{prop:'height',from:_r.rect.height,to:_2.height,unit:'px'}]});},Math.round(1000/_b1));}
return this;},_n8:function(_h){var _37=new Date().getTime(),i;if(_37<_h.startTime+_h.duration){var _o8=_37-_h.startTime;for(i=0;i<_h.props.length;i++){var _e2=_h.props[i].from;var _c3=_h.props[i].to;if(_e2!==_c3){var _p8=_h.transition(_o8,_e2,(_c3-_e2),_h.duration);this.setStyle(_h.props[i].prop,_p8+_h.props[i].unit);}}}else{for(i=0;i<_h.props.length;i++){this.setStyle(_h.props[i].prop,_h.props[i].to+_h.props[i].unit);}
this._27=true;this.stopAnimation();}
return this;},onAnimationStart:function(){},onAnimationEnd:function(){},onAnimationCancel:function(){}});HView=HClass.extend({themePath:null,packageName:null,isAbsolute:true,flexRight:false,flexLeft:true,flexTop:true,flexBottom:false,flexRightOffset:0,flexBottomOffset:0,componentBehaviour:['view'],constructor:function(_2,_b){if(this.theme===undefined){this.theme=HThemeManager.currentTheme;this.preserveTheme=false;}
else{this.preserveTheme=true;}
this.optimizeWidthOnRefresh=true;this.parent=_b;this.viewId=this.parent.addView(this);this.appId=this.parent.appId;this.app=HSystem.apps[this.appId];this.views=[];this.viewsZOrder=[];this._q8();this.setRect(_2);this.isHidden=true;this.drawn=false;this._47=_2.left;this._57=_2.top;this._i2=[];if(!this.isinherited){this.draw();this.show();}},setFlexRight:function(_8,_K){if(_8===undefined){_8=true;}
this.flexRight=_8;if(_K===undefined){_K=0;}
this.flexRightOffset=_K;return this;},setFlexLeft:function(_8,_K){if(_8===undefined){_8=true;}
this.flexLeft=_8;if((_K||_K===0)&&this.rect){this.rect.setLeft(_K);}
return this;},setFlexTop:function(_8,_K){if(_8===undefined){_8=true;}
this.flexTop=_8;if((_K||_K===0)&&this.rect){this.rect.setTop(_K);}
return this;},setFlexBottom:function(_8,_K){if(_8===undefined){_8=true;}
this.flexBottom=_8;if(_K===undefined){_K=0;}
this.flexBottomOffset=_K;return this;},setAbsolute:function(_8){if(_8===undefined){_8=true;}
this.isAbsolute=_8;return this;},setRelative:function(_8){if(_8===undefined){_8=true;}
this.isAbsolute=(!_8);return this;},getThemeGfxPath:function(){if(this.preserveTheme){_n=this.theme;}else{_n=HThemeManager.currentTheme;}
return HThemeManager._E2(_n,this.componentName,this.themePath,this.packageName);},getThemeGfxFile:function(_H0){if(this.preserveTheme){_n=this.theme;}else{_n=HThemeManager.currentTheme;}
return HThemeManager._g8(_n,this.componentName,this.themePath,this.packageName,_H0);},_h5:function(_h2){this.elemId=ELEM.make(_h2,'div');},_u8:function(_v8){var _R3='display:none;overflow:hidden;visibility:hidden;';if(this.isAbsolute){_R3+='position:absolute;';}else{_R3+='position:relative;';}
_R3+=_v8;ELEM.setCSS(this.elemId,_R3);},_s3:function(){var _h2;if(this.parent.elemId===undefined){_h2=0;}
else if(this.parent.markupElemIds&&this.parent.markupElemIds['subview']){_h2=this.parent.markupElemIds['subview'];}
else{_h2=this.parent.elemId;}
return _h2;},_q8:function(){if(!this.elemId){this._h5(this._s3());this._u8('');if(this.preserveTheme){ELEM.addClassName(this.elemId,this.theme);}
else{ELEM.addClassName(this.elemId,HThemeManager.currentTheme);}}},drawRect:function(){if(this.parent&&this.rect.isValid){var _0=this,_6=_0.elemId,_J0=ELEM.setStyle,_2=_0.rect;_J0(_6,'left',_0.flexLeft?(_2.left+'px'):'auto',true);_J0(_6,'top',_0.flexTop?(_2.top+'px'):'auto',true);_J0(_6,'right',_0.flexRight?(_0.flexRightOffset+'px'):'auto',true);_J0(_6,'bottom',_0.flexBottom?(_0.flexBottomOffset+'px'):'auto',true);_J0(_6,'width',(_0.flexLeft&&_0.flexRight)?'auto':(_2.width+'px'),true);_J0(_6,'height',(_0.flexTop&&_0.flexBottom)?'auto':(_2.height+'px'),true);if(_0.flexLeft&&_0.flexRight){_J0(_6,'min-width',_2.width+'px',true);}
if(_0.flexTop&&_0.flexBottom){_J0(_6,'min-height',_2.height+'px',true);}
if(undefined===_0.isHidden||_0.isHidden===false){_J0(_6,'visibility','inherit',true);}
_J0(_6,'display','block',true);_0._67();if(_0._47!==_2.left||_0._57!==_2.top){_0.invalidatePositionCache();_0._47=_2.left;_0._57=_2.top;}
_0.drawn=true;}
return this;},_67:function(){HSystem.updateZIndexOfChildren(this.viewId);},_D1:function(){HSystem.updateZIndexOfChildren(this.parent.viewId);},draw:function(){var _P1=this.drawn;this.drawRect();if(!_P1){if(this['componentName']!==undefined){this.drawMarkup();}
this.drawSubviews();}
this.refresh();return this;},drawSubviews:function(){},_V6:function(){var _n,_R;if(this.preserveTheme){_n=this.theme;}
else{_n=HThemeManager.currentTheme;}
_R=HThemeManager.getMarkup(_n,this.componentName,this.themePath,this.packageName);if(_R===false){console.log('Warning: Markup template for "'+this.componentName+'" using theme "'+_n+'" not loaded.');}
this.markup=_R;return(_R!==false);},markupElemNames:['bg','label','state','control','value','subview'],drawMarkup:function(){ELEM.setStyle(this.elemId,'display','none',true);var _u9=this._V6();this.bindMarkupVariables();ELEM.setHTML(this.elemId,this.markup);this.markupElemIds={};for(var i=0;i<this.markupElemNames.length;i++){var _L=this.markupElemNames[i],_77=_L+this.elemId,_z8=' id="'+_77+'"';if(this.markup.indexOf(_z8)!==-1){this.markupElemIds[_L]=this.bindDomElement(_77);}}
ELEM.setStyle(this.elemId,'display','block');return this;},setHTML:function(_e1){ELEM.setHTML(this.elemId,_e1);return this;},refresh:function(){if(this.drawn){this.drawRect();}
if(this.optimizeWidthOnRefresh){this.optimizeWidth();}
return this;},setRect:function(_2){if(this.rect){this.rect.release(this);}
if(_2 instanceof Array){var _N3=_2.length,_x4='HView.setRect: If the HRect instance is replaced by an array, ';if((_N3===4)||(_N3===6)){var _g2=_2[0],_A2=_2[1],_D=_2[2],_W=_2[3],_D4=((_N3===6)?_2[4]:null),_V4=((_N3===6)?_2[5]:null),_z2=(typeof _g2==='number'),_x2=(typeof _A2==='number'),_s2=(typeof _D4==='number'),_q2=(typeof _V4==='number'),_J3=(typeof _D==='number'),_I3=(typeof _W==='number'),_P0,_O0;if((!_z2&&!_s2)||(!_x2&&!_q2)){console.log(_x4+'(left or top) and (top or bottom) must be specified.');}
else if((!_J3&&!(_z2&&_s2))||(!_I3&&!(_x2&&_q2))){console.log(_x4+'the (height or width) must be specified unless both (left and top) or (top and bottom) are specified.');}
this.setFlexLeft(_z2,_g2);this.setFlexTop(_x2,_A2);this.setFlexRight(_s2,_D4);this.setFlexBottom(_q2,_V4);if(_z2&&_J3&&!_s2){_P0=_g2+_D;}
else if(!_z2&&_J3&&_s2){_g2=0;_P0=_D;}
else if(_z2&&!_J3&&_s2){_P0=_g2+_D4;}
if(_x2&&_I3&&!_q2){_O0=_A2+_W;}
else if(!_x2&&_I3&&_q2){_A2=0;_O0=_W;}
else if(_x2&&!_I3&&_q2){_O0=_A2+_V4;}
this.rect=HRect.nu(_g2,_A2,_P0,_O0);}
else{console.log(_x4+'the length has to be either 4 or 6.');}}
else{this.rect=_2;}
this.rect.bind(this);this.refresh();return this;},setStyle:function(_i,_3,_g1){if(this.elemId){ELEM.setStyle(this.elemId,_i,_3,_g1);}
return this;},style:function(_i){if(this.elemId){return ELEM.getStyle(this.elemId,_i);}
return'';},setStyleOfPart:function(_L,_i,_3,_g1){if(!this.markupElemIds[_L]){console.log('Warning, setStyleOfPart: partName "'+_L+'" does not exist for viewId '+this.viewId+'.');}
else{ELEM.setStyle(this.markupElemIds[_L],_i,_3,_g1);}
return this;},styleOfPart:function(_L,_i){if(!this.markupElemIds[_L]){console.log('Warning, styleOfPart: partName "'+_L+'" does not exist for viewId '+this.viewId+'.');return'';}
return ELEM.getStyle(this.markupElemIds[_L],_i);},setMarkupOfPart:function(_L,_3){if(!this.markupElemIds[_L]){console.log('Warning, setMarkupOfPart: partName "'+_L+'" does not exist for viewId '+this.viewId+'.');}
else{ELEM.setHTML(this.markupElemIds[_L],_3);}
return this;},markupOfPart:function(_L){if(!this.markupElemIds[_L]){console.log('Warning, markupOfPart: partName "'+_L+'" does not exist for viewId '+this.viewId+'.');return'';}
return ELEM.getHTML(this.markupElemIds[_L]);},hide:function(){if(!this.isHidden){var _y1=ELEM.setStyle,_6=this.elemId;_y1(_6,'visibility','hidden');_y1(_6,'display','none');this.isHidden=true;}
return this;},show:function(){if(this.isHidden){var _y1=ELEM.setStyle,_6=this.elemId;_y1(_6,'visibility','inherit');_y1(_6,'display','block');this.isHidden=false;}
return this;},toggle:function(){if(this.isHidden){this.show();}else{this.hide();}
return this;},remove:function(){if(this.parent){var _L8=this.parent.viewsZOrder.indexOf(this.viewId),_M8=this.parent.views.indexOf(this.viewId);this.parent.views.splice(_M8,1);HSystem.delView(this.viewId);this.parent.viewsZOrder.splice(_L8,1);var _87=HSystem._o1.indexOf(this.viewId);if(_87!==-1){HSystem._o1.splice(_87,1);}
this._D1();this.parent=null;this.parents=[];}
return this;},die:function(){this.hide();var _97,i;while(this.views.length!==0){_97=this.views[0];this.destroyView(_97);}
this.remove();for(i=0;i<this._i2.length;i++){ELEM.del(this._i2[i]);}
this._i2=[];this.drawn=false;ELEM.del(this.elemId);delete this.rect;var _0=this;for(i in _0){_0[i]=null;delete _0[i];}},onIdle:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].onIdle();}},buildParents:function(_f){var _7=HSystem.views[_f];_7.parent=this;_7.parents=[];for(var _k1=0;_k1<this.parents.length;_k1++){_7.parents.push(this.parents[_k1]);}
_7.parents.push(this);},addView:function(_7){var _f=HSystem.addView(_7);this.views.push(_f);this.buildParents(_f);this.viewsZOrder.push(_f);return _f;},removeView:function(_f){HSystem.views[_f].remove();return this;},destroyView:function(_f){HSystem.views[_f].die();return this;},bounds:function(){var _S1=new HRect(this.rect);_S1.right-=_S1.left;_S1.left=0;_S1.bottom-=_S1.top;_S1.top=0;return _S1;},resizeBy:function(_a5,_n3){var _2=this.rect;_2.right+=_a5;_2.bottom+=_n3;_2.updateSecondaryValues();this.drawRect();return this;},resizeTo:function(_D,_W){var _2=this.rect;_2.right=_2.left+_D;_2.bottom=_2.top+_W;_2.updateSecondaryValues();this.drawRect();return this;},offsetTo:function(){this.rect.offsetTo.apply(this.rect,arguments);this.drawRect();return this;},moveTo:function(){this.offsetTo.apply(this,arguments);return this;},offsetBy:function(_a5,_n3){this.rect.offsetBy(_a5,_n3);this.drawRect();return this;},moveBy:function(){this.offsetBy.apply(this,arguments);return this;},bringToFront:function(){if(this.parent){var _m=this.zIndex();this.parent.viewsZOrder.splice(_m,1);this.parent.viewsZOrder.push(this.viewId);this._D1();}
return this;},bringToFrontOf:function(_7){if(this.parent.viewId===_7.parent.viewId){this.parent.viewsZOrder.splice(this.zIndex(),1);this.parent.viewsZOrder.splice(_7.zIndex()+1,0,this.viewId);this._D1();}
return this;},sendToBackOf:function(_7){if(this.parent.viewId===_7.parent.viewId){this.parent.viewsZOrder.splice(this.zIndex(),1);this.parent.viewsZOrder.splice(_7.zIndex(),0,this.viewId);this._D1();}
return this;},sendBackward:function(){var _m=this.zIndex();if(_m!==0){this.parent.viewsZOrder.splice(_m,1);this.parent.viewsZOrder.splice(_m-1,0,this.viewId);this._D1();}
return this;},bringForward:function(){var _m=this.zIndex();if(_m!==this.parent.viewsZOrder.length-1){this.parent.viewsZOrder.splice(_m,1);this.parent.viewsZOrder.splice(_m+1,0,this.viewId);this._D1();}
return this;},sendToBack:function(){if(this.parent){var _m=this.zIndex();this.parent.viewsZOrder.splice(_m,1);this.parent.viewsZOrder.splice(0,0,this.viewId);this._D1();}
return this;},zIndex:function(){if(!this.parent){return-1;}
return this.parent.viewsZOrder.indexOf(this.viewId);},stringSize:function(_x0,_n0,_6,_Q8,_B1){if(_n0||_n0===0){_x0=_x0.substring(0,_n0);}
if(!_6&&_6!==0){_6=this.elemId;}
if(!_B1){_B1='';}
if(!_Q8){_B1+='white-space:nowrap;';}
var _H3=ELEM.make(_6);ELEM.setCSS(_H3,"visibility:hidden;position:absolute;"+_B1);ELEM.setHTML(_H3,_x0);var _T8=ELEM.getVisibleSize(_H3);ELEM.del(_H3);return _T8;},stringWidth:function(_x0,_n0,_6,_B1){return this.stringSize(_x0,_n0,_6,false,_B1)[0];},stringHeight:function(_x0,_n0,_6,_B1){return this.stringSize(_x0,_n0,_6,true,_B1)[1];},pageX:function(){var _d=0;var _5=this;while(_5){if(_5.elemId&&_5.rect){_d+=ELEM.get(_5.elemId).offsetLeft;_d-=ELEM.get(_5.elemId).scrollLeft;}
if(_5.markupElemIds&&_5.markupElemIds.subview){_d+=ELEM.get(_5.markupElemIds.subview).offsetLeft;_d-=ELEM.get(_5.markupElemIds.subview).scrollLeft;}
_5=_5.parent;}
return _d;},pageY:function(){var _g=0;var _5=this;while(_5){if(_5.elemId&&_5.rect){_g+=ELEM.get(_5.elemId).offsetTop;_g-=ELEM.get(_5.elemId).scrollTop;}
if(_5.markupElemIds&&_5.markupElemIds.subview){_g+=ELEM.get(_5.markupElemIds.subview).offsetTop;_g-=ELEM.get(_5.markupElemIds.subview).scrollTop;}
_5=_5.parent;}
return _g;},pageLocation:function(){return new HPoint(this.pageX(),this.pageY());},optimizeWidth:function(){},invalidatePositionCache:function(){for(var i=0;i<this.views.length;i++){HSystem.views[this.views[i]].invalidatePositionCache();}
return this;},bindDomElement:function(_a7){var _75=ELEM.bindId(_a7);if(_75){this._i2.push(_75);}
return _75;},unbindDomElement:function(_I0){var _b7=this._i2.indexOf(_I0);if(_b7>-1){ELEM.del(_I0);this._i2.splice(_b7,1);}}});HView.implement(HMarkupView);HView.implement(HMorphAnimation);HEventResponder=HClass.extend({setEvents:function(_o3){if(!this.events){var _r7=HClass.extend({mouseMove:false,mouseDown:false,mouseUp:false,draggable:false,droppable:false,keyDown:false,keyUp:false,mouseWheel:false,textEnter:false,click:false});this.events=new _r7;}
if(_o3){this.events.extend(_o3);}
this.events.ctrl=this;EVENT.focusOptions[this.elemId]=this.events;var _c7=this.events.mouseMove;var _45=EVENT.coordListeners.indexOf(this.elemId);if(_c7&&(_45===-1)){EVENT.coordListeners.push(this.elemId);}else if((!_c7)&&(_45!==-1)){EVENT.coordListeners.splice(_45,1);}
this.isDragged=false;return this;},setMouseMove:function(_8){this.events.mouseMove=_8;this.setEvents();return this;},setClickable:function(_8){this.events.click=_8;this.setEvents();return this;},setMouseDown:function(_8){this.events.mouseDown=_8;this.setEvents();return this;},setMouseUp:function(_8){this.events.mouseUp=_8;this.setEvents();return this;},setMouseWheel:function(_8){this.events.mouseWheel=_8;this.setEvents();return this;},setDraggable:function(_8){this.events.draggable=_8;this.setEvents();return this;},setDroppable:function(_8){this.events.droppable=_8;this.setEvents();return this;},setKeyDown:function(_8){this.events.keyDown=_8;this.setEvents();return this;},setKeyUp:function(_8){this.events.keyUp=_8;this.setEvents();return this;},setTextEnter:function(_8){this.events.textEnter=_8;this.setEvents();return this;},textEnter:function(){},setClick:function(_8){this.events.click=_8;this.setEvents();return this;},click:function(x,y,_m9){},focus:function(){},blur:function(){},gainedActiveStatus:function(_35){if((HWindowFocusBehaviour===1)&&(this.parents.length>2)){if(this.parents[2].componentBehaviour.indexOf('window')!==-1){this.parents[2].gainedActiveStatus();}}},_n6:function(_35){if(this.enabled){this.toggleCSSClass(this.elemId,HControl.CSS_ACTIVE,true);}
this.gainedActiveStatus(_35);},lostActiveStatus:function(_Q){},_m6:function(_Q){if(this.enabled){this.toggleCSSClass(this.elemId,HControl.CSS_ACTIVE,false);}
this.lostActiveStatus(_Q);},mouseMove:function(_d,_g){},mouseDown:function(_d,_g,_G3){},mouseUp:function(_d,_g,_G3){},mouseWheel:function(_M){},startDrag:function(x,y){this.isDragged=true;},doDrag:function(x,y){},endDrag:function(x,y){this.isDragged=false;this.invalidatePositionCache();},onDrop:function(obj){},onHoverStart:function(obj){},onHoverEnd:function(obj){},keyDown:function(_J){},keyUp:function(_J){},_t2:function(e){if(!Event.element){return;}
var _r=Event.element(e);while(_r&&_r.ctrl===undefined){_r=_r.parentNode;}
if(!_r){return;}
var _0=_r.ctrl;EVENT.focus(_0);Event.stop(e);},_O3:function(e){if(!Event.element){return;}
var _r=Event.element(e);while(_r&&_r.ctrl===undefined){_r=_r.parentNode;}
if(!_r){return;}
var _0=_r.owner;EVENT.blur(_0);Event.stop(e);},invalidatePositionCache:function(){this.base();EVENT.coordCacheFlush(this.elemId);return this;}});HValueResponder=HClass.extend({setValueObj:function(_T1){this.valueObj=_T1;this.setValue(_T1.value);return this;},valueDiffers:function(_3){return(COMM.Values.encode(_3)!==COMM.Values.encode(this.value));},setValue:function(_3){if(_3===undefined){return;}
if(!this.valueObj){return;}
if(this.valueDiffers(_3)){this.value=_3;this.valueObj.set(_3);this.refresh();}
return this;}});HControl=HView.extend({componentBehaviour:['view','control'],refreshOnValueChange:true,refreshOnLabelChange:true,constructor:function(_2,_b,_1){if(!_1){_1={};}
var _w7=(_1.minValue||_1.maxValue);_1=HComponentDefaults.extend(_1).nu();var _o=_1.label,_o3=_1.events,_0=this;_0.options=_1;if(_0.isinherited){_0.base(_2,_b);}
else{_0.isinherited=true;_0.base(_2,_b);_0.isinherited=false;}
if(_1.visible){_0.show();}
else{_0.hide();}
_0.setLabel(_o);_0.setEvents(_o3);_0.setEnabled(_1.enabled);if(_1.valueObj){_1.valueObj.bind(_0);}
if(!_0.valueObj){_0.valueObj=HDummyValue.nu();}
if((_0.value===undefined)&&(_1.value!==undefined)){_0.setValue(_1.value);}
if(_w7){_0.setValueRange(this.value,_1.minValue,_1.maxValue);}
if(!_0.isinherited){_0.draw();}},setAction:function(_d7){this.action=_d7;return this;},die:function(){var _0=this;if(_0.valueObj){_0.valueObj.unbind(_0);delete _0.valueObj;}
EVENT.unreg(_0);_0.base();},setLabel:function(_o){var _0=this;_0.label=_o;_0.options.label=_o;_0.refresh();return this;},setEnabled:function(_8){var _0=this,_6=this.elemId,_T3=HSystem.views,i=0,_40=_0.views,_85=_40.length;for(;i<_85;i++){_T3[_40[i]].setEnabled(_8);}
if(_0.enabled===_8){return;}
_0.enabled=_8;if(_8){EVENT.reg(_0,_0.events);}
else{EVENT.unreg(this);}
_0.toggleCSSClass(_6,HControl.CSS_ENABLED,_8);_0.toggleCSSClass(_6,HControl.CSS_DISABLED,!_8);return this;},setValueRange:function(_3,_F3,_C3){this.minValue=_F3;this.maxValue=_C3;_3=(_3<_F3)?_F3:_3;_3=(_3>_C3)?_C3:_3;this.setValue(_3);this.refresh();return this;},refreshValue:function(){if(this.markupElemIds){if(this.markupElemIds.value){ELEM.setHTML(this.markupElemIds.value,this.value);}}
return this;},refreshLabel:function(){if(this.markupElemIds){if(this.markupElemIds.label){ELEM.setHTML(this.markupElemIds.label,this.label);}}
return this;},refresh:function(){this.base();if(this.drawn){if(this.refreshOnValueChange){this.refreshValue();}
if(this.refreshOnLabelChange){this.refreshLabel();}}
return this;}},{stopPropagation:function(event){if(event.stopPropagation){event.stopPropagation();}else{event.cancelBubble=true;}},H_CONTROL_ON:1,H_CONTROL_OFF:0,CSS_DISABLED:"disabled",CSS_ENABLED:"enabled",CSS_ACTIVE:"active"});HControl.implement(HValueResponder);HControl.implement(HEventResponder);HDummyValue=HClass.extend({constructor:function(_4,_3){this.id=_4;this.value=_3;},set:function(_3){this.value=_3;},get:function(){return this.value;},bind:function(_z7){},unbind:function(_z7){}});HComponentDefaults=HClass.extend({label:"",visible:true,events:{},value:0,enabled:true,active:false,minValue:-2147483648,maxValue:2147483648});HDynControl=HControl.extend({componentBehaviour:['view','control','window'],constructor:function(_2,_b,_1){if(!_1){_1={};}
var _B3=ELEM.windowSize();var _P=HClass.extend({minX:0,minY:0,maxX:_B3[0],maxY:_B3[1],minSize:[24,54],maxSize:[_B3[0],_B3[1]],resizeW:1,resizeE:1,resizeN:1,resizeS:1,resizeNW:[1,1],resizeNE:[1,1],resizeSW:[1,1],resizeSE:[1,1],noResize:false});_1=new(_P.extend(_1))();if(_1.noResize){_1.minSize=[_2.width,_2.height];_1.maxSize=[_2.width,_2.height];_1.resizeW=0;resizeE=0;resizeN=0;resizeS=0;resizeNW=[0,0];resizeNE=[0,0];resizeSW=[0,0];resizeSE=[0,0];}
if(this.isinherited){this.base(_2,_b,_1);}
else{this.isinherited=true;this.base(_2,_b,_1);this.isinherited=false;}
this.preserveTheme=true;this.setDraggable(true);this._B7();this._e7();if(!this.isinherited){this.draw();}},_91:function(_f7,_g7){var _0=this,_2=_0.rect,_1=_0.options;if(_2.width<_1.minSize[0]){var _d5=0-(_1.minSize[0]-_2.width);_2.setWidth(_1.minSize[0]);if(_f7){_2.offsetBy(_d5,0);}}
else if(_2.width>_1.maxSize[0]){var _d5=0-(_1.maxSize[0]-_2.width);_2.setWidth(_1.maxSize[0]);if(_f7){_2.offsetBy(_d5,0);}}
if(_2.height<_1.minSize[1]){var _55=0-(_1.minSize[1]-_2.height);_2.setHeight(_1.minSize[1]);if(_g7){_2.offsetBy(0,_55);}}
else if(_2.height>_1.maxSize[1]){var _55=0-(_1.maxSize[1]-_2.height);_2.setHeight(_1.maxSize[1]);if(_g7){_2.offsetBy(0,_55);}}
_0.drawRect();},_90:function(x,y){return this._h7.subtract(x,y);},dynResizeNW:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setLeftTop(_0._f1.leftTop.subtract(_00));_0._91(1,1);},dynResizeNE:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setRightTop(_0._f1.rightTop.subtract(_00));_0._91(0,1);},dynResizeSW:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setLeftBottom(_0._f1.leftBottom.subtract(_00));_0._91(1,0);},dynResizeSE:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setRightBottom(_0._f1.rightBottom.subtract(_00));_0._91(0,0);},dynResizeW:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setLeft(_0._f1.left-_00.x);_0._91(1,0);},dynResizeE:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setRight(_0._f1.right-_00.x);_0._91(0,0);},dynResizeN:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setTop(_0._f1.top-_00.y);_0._91(0,1);},dynResizeS:function(_0,x,y){var _00=_0._90(x,y);_0.rect.setBottom(_0._f1.bottom-_00.y);_0._91(0,0);},dynDrag:function(_0,x,y){var _00=_0._90(x,y);_0.rect.offsetTo(_0._f1.leftTop.subtract(_00));_0._91(1,1);},_B7:function(){this._e0=[];this._F7=['nw-resize','ne-resize','sw-resize','se-resize','w-resize','e-resize','n-resize','s-resize','move'];var i,_0=this,_G7=0,_H7=1,_I7=2,_J7=3,_K7=4,_L7=5,_M7=6,_N7=7,_O7=8,_e0=this._e0;_e0[_G7]=_0.dynResizeNW;_e0[_H7]=_0.dynResizeNE;_e0[_I7]=_0.dynResizeSW;_e0[_J7]=_0.dynResizeSE;_e0[_K7]=_0.dynResizeW;_e0[_L7]=_0.dynResizeE;_e0[_M7]=_0.dynResizeN;_e0[_N7]=_0.dynResizeS;_e0[_O7]=_0.dynDrag;},makeRectRules:function(){var _q=this.options,_2=this.rect;return[[0,0,_q.resizeNW[0],_q.resizeNW[1]],[_2.width-_q.resizeNE[0],0,_2.width,_q.resizeNE[1]],[0,_2.height-_q.resizeSW[1],_q.resizeSW[0],_2.height],[_2.width-_q.resizeSE[0],_2.height-_q.resizeSE[1],_2.width,_2.height],[0,_q.resizeN,_q.resizeW,_2.height-_q.resizeS],[_2.width-_q.resizeE,_q.resizeN,_2.width,_2.height-_q.resizeS],[_q.resizeW,0,_2.width-_q.resizeE,_q.resizeN],[_q.resizeW,_2.height-_q.resizeS,_2.width-_q.resizeE,_2.height],[_q.resizeW,_q.resizeN,_2.width-_q.resizeE,_2.height-_q.resizeS]];},_e7:function(){this._U1=-1;this._y3=[];var i,_63,_D2=this.makeRectRules();for(i=0;i!==9;i++){_63=_D2[i];this._y3.push(new HRect(_63[0],_63[1],_63[2],_63[3]));}},_R7:function(){var i,_S7=this._h7.subtract(this.rect.left,this.rect.top),_y3=this._y3;for(i=0;i!==9;i++){if(_y3[i].contains(_S7)){this._U1=i;this.setStyle('cursor',this._F7[i]);return;}}},startDrag:function(x,y,_i7){var _b=this.parent;if(_b.elemId){x-=_b.pageX();y-=_b.pageY();}
this._h7=new HPoint(x,y);this._f1=new HRect(this.rect);this._R7();if(this._U1!==-1){this._e0[this._U1](this,x,y);}
return true;},doDrag:function(x,y,_i7){var _b=this.parent;if(_b.elemId){x-=_b.pageX();y-=_b.pageY();}
if(this._U1!==-1){this._e0[this._U1](this,x,y);}
return true;},endDrag:function(x,y,_i7){var _b=this.parent;if(_b.elemId){x-=_b.pageX();y-=_b.pageY();}
if(this._U1!==-1){this._e0[this._U1](this,x,y);}
this.setStyle('cursor','default');this._e7();return true;}});