
HSlider=HControl.extend({packageName:"sliders",componentName:"slider",constructor:function(H0,H4,H1){if(!H1){H1={};}
H1.events={mouseDown:false,mouseUp:false,draggable:true,keyDown:true,keyUp:true,mouseWheel:true};var HJ=Base.extend({minValue:0,maxValue:1});HJ=HJ.extend(H1);H1=new HJ();if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.type='[HSlider]';this.refreshOnValueChange=false;this.H4f='sliderknob';this.H0x=false;if(!this.isinherited){this.draw();}},setValue:function(H3){if(H3<this.minValue){H3=this.minValue;}
if(H3>this.maxValue){H3=this.maxValue;}
this.base(H3);if(this.H3a){this.drawKnobPos();}},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this.H5O();}
this.refresh();},startDrag:function(H8,H9){var H2=elem_get(this.elemId);var H1d=helmi.Element.getPageLocation(H2,true);this.H5P=H1d[0];this.H5Q=H1d[1];this.doDrag(H8,H9);},endDrag:function(H8,H9){this.doDrag(H8,H9);},doDrag:function(H8,H9){H8-=this.H5P;H9-=this.H5Q;H5R=this.H0x?H9:H8;H3=this.H5M(H5R);this.setValue(H3);},keyDown:function(Hx){if((Hx==Event.KEY_LEFT&&!this.H0x)||(Hx==Event.KEY_UP&&this.H0x)){this.H1V=true;this.H1W(-0.05);}
else if((Hx==Event.KEY_RIGHT&&!this.H0x)||(Hx==Event.KEY_DOWN&&this.H0x)){this.H1V=true;this.H1W(0.05);}
else if(Hx==Event.KEY_HOME){this.setValue(this.minValue);}
else if(Hx==Event.KEY_END){this.setValue(this.maxValue);}
else if(Hx==Event.KEY_PAGEUP){this.H1V=true;this.H1W(-0.25);}
else if(Hx==Event.KEY_PAGEDOWN){this.H1V=true;this.H1W(0.25);}},keyUp:function(Hx){this.H1V=false;},mouseWheel:function(H0a){var H1y;if(H0a>0){H1y=-0.05;}
else{H1y=0.05;}
H3=(this.maxValue-this.minValue)*H1y;this.setValue(this.value+H3);},H1W:function(H1y,H1z){if(!H1z){H1z=300;}
else if(H1z==300){H1z=50;}
if(this.H1V&&this.active){H3=(this.maxValue-this.minValue)*H1y;this.setValue(this.value+H3);var Hw=this;if(this.H3e){window.clearTimeout(this.H3e);this.H3e=null;}
this.H3e=window.setTimeout(function(){Hw.H1W(H1y,H1z);},H1z);}},H5O:function(){this.H3a=this.bindDomElement(this.H4f+this.elemId);this.drawKnobPos();},H39:function(){var Hc=elem_get(this.H3a);if(this.H0x){H4d=this.rect.height-parseInt(Hc.offsetHeight,10);}else{H4d=this.rect.width-parseInt(Hc.offsetWidth,10);}
H3b=H4d*((this.value-this.minValue)/(this.maxValue-this.minValue));H3d=parseInt(H3b,10)+'px';return H3d;},H5M:function(H4e){H0Y=this.H0x?(H4e):(H4e);if(H0Y<0){H0Y=0;}
if(this.H0x){if(H0Y>this.rect.height){H0Y=this.rect.height;}
return this.minValue+((H0Y/this.rect.height)*(this.maxValue-this.minValue));}else{if(H0Y>this.rect.width){H0Y=this.rect.width;}
return this.minValue+((H0Y/this.rect.width)*(this.maxValue-this.minValue));}},drawKnobPos:function(){H5N=this.H0x?'top':'left';H3c=this.H39();prop_set(this.H3a,H5N,H3c);}});HVSlider=HSlider.extend({packageName:"sliders",componentName:"vslider",constructor:function(H0,H4,H1){if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.type='[HVSlider]';this.H4f='vsliderknob';this.H0x=true;if(!this.isinherited){this.draw();}}});