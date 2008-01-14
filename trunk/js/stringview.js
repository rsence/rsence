
HStringView=HControl.extend({componentName:"stringview",constructor:function(H0,H4,H1){if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.type='[HStringView]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this.drawn=true;}
this.refresh();},refresh:function(){if(this.drawn){this.base();if(!this.H1f){this.H1f=this.bindDomElement("stringview"+this.elemId);}
if(this.H1f){elem_set(this.H1f,this.value);}}},stringElementId:function(){return this.H1f;},optimizeWidth:function(){if(this.H1f){var H5K=elem_get(this.H1f).cloneNode(true);var H2m=elem_add(H5K);prop_set(H2m,"visibility","hidden",true);elem_append(0,H2m);var Hf=this.stringWidth(this.value,null,H2m);if(!isNaN(Hf)){var H5L=prop_get_extra_width(this.H1f);this.resizeTo(Hf+H5L,this.rect.height);}
elem_del(H2m);}}});