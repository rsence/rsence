
ie_htc_path=null;function ie_early_fixes(){document.execCommand("BackgroundImageCache",false,true);var _n9=document.scripts[document.scripts.length-1],_Z8=_n9.src;ie_htc_path=_Z8.substring(0,_Z8.lastIndexOf("/")+1);console={log:function(){}};}
ie_early_fixes();iefix={setWinSize:function(){window.innerWidth=document.documentElement.clientWidth;window.innerHeight=document.documentElement.clientHeight;},_p9:function(_c){return _c.currentStyle.hasLayout;},layoutWidth:function(_c){var _0=iefix,_b,i=0,_62=_c.offsetParent;while(_62&&!_0._p9(_62)){_62=_62.offsetParent;}
if(!_62._i5){_62._i5=[];}
if(!_c._t9){_62._i5.push(_c);_b=_62;while(_b.offsetParent){_b=_b.offsetParent;if(_b._i5){_b._i5.push(_c);}
if(_b.style.position==="absolute"||_b.style.position==="fixed"){break;}}
_c._t9=true;}
if(!_62._a9){_62.attachEvent("onpropertychange",function(){if(window.event.propertyName==="style.width"){for(;i<_62._i5.length;i++){_0.resizeRight(_62._i5[i]);}}});_62._a9=true;}
return(_62||document.documentElement).clientWidth;},getBorderWidth:function(_c){return _c.offsetWidth-_c.clientWidth;},getPixelValue:function(_c,_3){var _0=iefix,_U0,_79;if(_0._w9.test(_3)){return parseInt(_3,10);}
_U0=_c.style.left;_79=_c.runtimeStyle.left;_c.runtimeStyle.left=_c.currentStyle.left;_0.resizing=true;_c.style.left=_3||0;_3=_c.style.pixelLeft;_c.style.left=_U0;_0.resizing=false;_c.runtimeStyle.left=_79;return _3;},getPixelWidth:function(_c,_3){var _0=iefix;if(_0._g9.test(_3)){return parseInt(parseFloat(_3)/100*_0.layoutWidth(_c),10);}
return _0.getPixelValue(_c,_3);},getPaddingWidth:function(_c){var _0=iefix;return _0.getPixelWidth(_c,_c.currentStyle.paddingLeft)+_0.getPixelWidth(_c,_c.currentStyle.paddingRight);},resizeRight:function(_c){var _0=iefix,_31,_D;if(_c.currentStyle===null){return;}
_31=parseInt(_c.currentStyle.left,10);_D=_0.layoutWidth(_c)-parseInt(_c.currentStyle.right,10)-_31;if(parseInt(_c.runtimeStyle.width,10)===_D){return;}
_c.runtimeStyle.width="";if(_c.offsetWidth<_D){_D-=_0.getBorderWidth(_c)+_0.getPaddingWidth(_c);if(_D<0){_D=0;}
_c.runtimeStyle.width=_D;}},fixOpacity:function(_c){var _G0=(parseFloat(_c.currentStyle.opacity)*100)||1,_I1=_c.filters["DXImageTransform.Microsoft.Alpha"];if(_I1){_I1.Opacity=_G0;_I1.Enabled=true;}
else{_c.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.Alpha(opacity="+_G0+")";}},fixBackgroundImage:function(_c){var _0=iefix,_w,_I1;_w=_c.currentStyle.backgroundImage.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);if(!_w){return;}
else{_w=_w[1];}
_I1=_c.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(_0.pngCheck.test(_w)){if(_I1){_I1.sizingMethod="crop";_I1.src=_w;_I1.Enabled=true;}
else{_c.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_w+"',sizingMethod='crop')";}
_c.runtimeStyle.zoom="0";_c.runtimeStyle.backgroundImage="none";}
else if(_I1){_I1.Enabled=false;}},addFilter:function(_c,_g4){var _0=iefix,_I1,_L9;_I1=_c.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(_I1){_I1.src=_c.src;_I1.Enabled=true;}
else{_c.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_c.src+"',sizingMethod='scale')";}
_B9=_c.src;_c.src=_0.blankGifPath;_g4.src=_B9;},fixImg:function(_c){var _0=iefix,_g4;if(_0.pngCheck.test(_c.src)){_g4=new Image(_c.width,_c.height);_g4.onload=function(){_c.width=_g4.width;_c.height=_g4.height;_g4=null;};_0.addFilter(_c,_g4);}},_C9:['PARAM'],inlineStyleChanged:function(_c){var _0=iefix,_M2;_M2=_c.currentStyle;if(_0._C9.indexOf(_c.tagName)!==-1){return;}
try{if((_M2.position==="absolute"||_M2.position==="fixed")&&_M2.left!=="auto"&&_M2.right!=="auto"&&_M2.width==="auto"){_0.resizeRight(_c);}
if((_M2.position==="absolute"||_M2.position==="fixed")&&_M2.top!=="auto"&&_M2.bottom!=="auto"&&_M2.height==="auto"){_0.resizeBottom(_c);}
if(_c.currentStyle.opacity){_0.fixOpacity(_c);}}catch(e){alert("iefix error! element:"+_c.tagName+" e:"+e.description);}
if(_c.style.backgroundColor==='transparent'&&(_c.style.backgroundImage==='none'||!_c.style.backgroundImage)){_c.style.backgroundImage="url("+ie_htc_path+"128.gif)";}},_39:0,_h1:function(_c){var _0=iefix;_0._39++;_c=_c||document.documentElement;while(_c){if(_c.nodeType===1){_0.inlineStyleChanged(_c);}
var _j7=_c.firstChild;if(!_j7){_j7=_c.nextSibling;}
while(!_j7&&_c.parentNode){_c=_c.parentNode;_j7=_c.nextSibling;}
_c=_j7;}},stylesheet_refresh:function(_Z7){_Z7.cssText+="";},init:function(){var _0=iefix;_0._D9=/^(auto|0cm)$/;_0._w9=/^\d+(px)?$/i;_0._g9=/^\d+%$/;_0.pngCheck=new RegExp(".png$","i");_0.blankGifPath=ie_htc_path+"0.gif";eval("_0.getMarginWidth="+String(_0.getPaddingWidth).replace(/padding/g,"margin"));eval("_0.getPaddingHeight="+String(_0.getPaddingWidth).replace(/Width/g,"Height").replace(/Left/g,"Top").replace(/Right/g,"Bottom"));eval("_0.getMarginHeight="+String(_0.getPaddingHeight).replace(/padding/g,"margin"));eval("_0.getBorderHeight="+String(_0.getBorderWidth).replace(/Width/g,"Height"));eval("_0.layoutHeight="+String(_0.layoutWidth).replace(/Width/g,"Height").replace(/width/g,"height").replace(/Right/g,"Bottom"));eval("_0.getPixelHeight="+String(_0.getPixelWidth).replace(/Width/g,"Height"));eval("_0.resizeBottom="+String(_0.resizeRight).replace(/Width/g,"Height").replace(/width/g,"height").replace(/left/g,"top").replace(/right/g,"bottom"));_0.resizing=false;},htcStyleEntry:function(){if(document.readyState==="complete"&&window.event.srcElement.readyState==="complete"){iefix._h1();}},_l5:['width','height','left','top','right','bottom','display','position'],htcElementEntry:function(){var _c=window.event.srcElement,_k7=window.event.propertyName;if(_k7==="style.opacity"){iefix.fixOpacity(_c);}
else if((_k7==="src"&&_c.tagName==="IMG")||(_c.tagName==="INPUT"&&_c.type==="image")){window.status='htcElementEntry: '+iefix._k5+' img';iefix.fixImg(_c);}
else if(_k7.substring(0,6)==='style.'){if(iefix._l5.indexOf(_k7.split('style.')[1])!==-1){iefix._h1();}}}};iefix.init();ie_complete=document.readyState==="complete";ie_initialized=false;ie_documentLoaded=function(){if(document.readyState==="complete"){iefix._h1();}};ie_fixes=function(){if(!ie_initialized){if(ie_complete){ie_documentLoaded();}
else{document.onreadystatechange=ie_documentLoaded;}
ie_initialized=true;}};ie_fixes();window.onresize=function(){iefix.setWinSize();iefix._h1();};