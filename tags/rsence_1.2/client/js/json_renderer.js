
if(COMM['JSONLoader']===undefined){COMM.JSONRenderer=HClass.extend({version:0.4,constructor:function(_s,_h){if((_s['type']==='GUITree')&&(this.version>=_s['version'])){this.data=_s;this.parent=_h;this.render();}
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
this.scopes.pop();this.scopeDepth--;return _Q;}});JSONRenderer=COMM.JSONRenderer;}