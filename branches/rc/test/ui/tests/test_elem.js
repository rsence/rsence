var outer = ELEM.make(0,'div');
ELEM.setCSS(outer,'position:absolute;left:0px;top:0px;width:100px;height:100px;border:1px solid black;');
ELEM.setStyle(outer,'left','100px');
ELEM.setStyle(outer,'top','100px');

testName('Buffered ELEM test');
var start = new Date().getTime();
for(var w=0;w<401;w++){
  ELEM.setStyle(outer,'width',w+'px');
  for(var h=0;h<301;h++){
    ELEM.setStyle(outer,'height',h+'px');
  }
}
assertEquals('Buffered width match.',  ELEM.getStyle(outer,'width'),'400px');
assertEquals('Buffered height match.', ELEM.getStyle(outer,'height'),'300px');
var _timeTaken1 = (new Date().getTime()-start);
console.log('buffered test took: '+_timeTaken1);
// should run in less than 1.5 secs
assertTrue('Buffered operation time within limits',(_timeTaken1<1500)); 

testName('Unbuffered ELEM test');
var start = new Date().getTime();
for(var w=0;w<401;w++){
  ELEM.setStyle(outer,'width',w+'px',true);
  for(var h=0;h<301;h++){
    ELEM.setStyle(outer,'height',h+'px',true);
  }
}
assertEquals('Unuffered width match.',  ELEM.getStyle(outer,'width'),'400px');
assertEquals('Unuffered height match.', ELEM.getStyle(outer,'height'),'300px');
var _timeTaken2 = (new Date().getTime()-start);
console.log('unbuffered test took: '+_timeTaken2);

assertTrue('Unuffered operation time within limits',(_timeTaken2<5000));

ELEM.setStyle(outer,'background-color','#cccccc');
ELEM.setStyle(0,'background-color','#dddddd');
