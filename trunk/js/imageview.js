
HImageView=HControl.extend({componentName:"imageview",constructor:function(H0,H4,H1){if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
if(!this.value){this.value=this.getThemeGfxPath()+"blank.gif";}
this.type='[HImageView]';if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this.drawn=true;}
this.refresh();},refresh:function(){if(this.drawn){this.base();if(!this.H07){this.H07=this.bindDomElement(HImageView.H2v+this.elemId);}
if(this.H07){elem_get(this.H07).src=this.value;}}},scaleToFit:function(){if(this.H07){prop_set(this.H07,'width',this.rect.width+'px');prop_set(this.H07,'height',this.rect.height+'px');}},scaleToOriginal:function(){if(this.H07){prop_set(this.H07,'width','auto');prop_set(this.H07,'height','auto');}}},{H2v:"imageview"});