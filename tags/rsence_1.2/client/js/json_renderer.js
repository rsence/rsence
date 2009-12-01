
if(COMM['JSONLoader']===undefined){COMM.JSONRenderer=HClass.extend({version:0.4,constructor:function(_s,_h){if((_s['type']==='GUITree')&&(this.version>=_s['version'])){this.data=_s;this.parent=_h;this.render();}
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
this.scopes.pop();this.scopeDepth--;return _Q;}});JSONRenderer=COMM.JSONRenderer;}