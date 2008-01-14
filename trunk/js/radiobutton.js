
HRadiobutton=HToggleButton.extend({componentName:"radiobutton",constructor:function(H0,H4,H1){if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.type='[HRadiobutton]';if(!this.isinherited){this.draw();}},setValueMatrix:function(H2P){this.valueMatrix=H2P;this.valueMatrixIndex=this.valueMatrix.addValue(this.valueObj,this.value);},click:function(x,y,HW){this.base(x,y,HW);if(undefined!==this.valueMatrix&&this.valueMatrix instanceof HValueMatrix){this.valueMatrix.setValue(this.valueMatrixIndex);}}});HRadioButton=HRadiobutton;