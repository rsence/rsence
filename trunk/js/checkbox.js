
HCheckbox=HToggleButton.extend({componentName:"checkbox",constructor:function(H0,H4,H1){if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.type='[HCheckbox]';if(!this.isinherited){this.draw();}}});