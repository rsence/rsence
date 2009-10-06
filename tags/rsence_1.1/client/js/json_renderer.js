
JSONRenderer=HClass.extend({constructor:function(_V,_b){if((_V['type']==='GUITree')&&([0.1,0.2].indexOf(_V['version'])!==-1)){this.data=_V;this.parent=_b;this.render();}
else{throw("JSONRenderer: Only GUITree 0.1 and 0.2 data can be built at this time.");}},render:function(){this.view=this.renderNode(this.data,this.parent);},renderNode:function(_J4,_b){var
_w1=_J4['class'],_w4=(_w1!==undefined)&&(window[_w1]!==undefined),_X8=_w4?(window[_w1]):false,_2=_J4['rect'],_29=(_2!==undefined)&&(_2 instanceof Array),_W8=_J4['subviews']!==undefined,_09=_W8?_J4['subviews']:null,_r8=_J4['options']!==undefined,_1=_r8?_J4['options']:null,_20=_b,_s9;try{if(_w4){if(_r8){if(_1['valueObjId']!==undefined){var _I9=_1['valueObjId'];_1['valueObj']=COMM.Values.values[_1['valueObjId']];}}
if(!_29&&_r8){_20=_X8.nu(_1);}
else if(_29){_20=_X8.nu(_2,_b,_1);}}}
catch(e){console.log('renderNode error:',e,', rect:',_2,', class:',_J4['class'],', options:',_1);}
if(_W8){for(var i=0;i<_09.length;i++){_s9=this.renderNode(_09[i],_20);}}
return _20;}});