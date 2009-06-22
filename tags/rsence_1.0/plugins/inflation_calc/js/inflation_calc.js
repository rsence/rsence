InflationCalc = HApplication.extend({
  reset: function(){
    var values = this.values;
    values.amount.set(1000);
    values.years.set(10);
    values.percent.set(7);
  },
  constructor: function(values){
    this.values = values;
    this.base();
    this.view = HWindow.extend({
      drawSubviews: function(){
        HStringView.nu( HRect.nu(8,22,150,45),this,{value:'<b>Current value:</b>'});
        HTextControl.nu(HRect.nu(150,20,250,40),this,{valueObj:this.app.values.amount,events:{textEnter:true}});
        HButton.extend({
          click: function(){
            this.app.reset();
          }
        }).nu(HRect.nu(258,18,330,42),this,{events:{click:true},label:'Reset'});
        HStringView.nu( HRect.nu(8,52,150,75),this,{value:'<b>Inflation rate:</b>'});
        HTextControl.nu(HRect.nu(150,50,190,70),this,{valueObj:this.app.values.percent,events:{textEnter:true}});
        HStringView.nu( HRect.nu(190,52,210,75),this,{value:'%'});
        HSlider.extend({
          setValue: function(value){
            if(isNaN(value)){return;}
            this.base(Math.round(value*10)/10); // makes decimals with just one digit after the dot
          }
        }).nu(HRect.nu(200,50,330,70),this,{valueObj:this.app.values.percent,minValue:-20,maxValue:20});
        HStringView.nu( HRect.nu(8,82,150,105),this,{value:'<b>Number of years:</b>'});
        HTextControl.nu(HRect.nu(150,80,190,100),this,{valueObj:this.app.values.years,events:{textEnter:true}});
        HSlider.extend({
          setValue: function(value){
            if(isNaN(value)){return;}
            this.base(Math.round(value)); // makes integers
          }
        }).nu(HRect.nu(200,80,330,100),this,{valueObj:this.app.values.years,minValue:1,maxValue:100});
        HStringView.nu( HRect.nu(8,120,158,140),this,{value:'<b>Future value:</b>'});
        HStringView.nu( HRect.nu(180,120,330,140),this,{value:'<b>Past value:</b>'});
        SimpleTable.nu(HRect.nu( 8,140,158,300),this,{valueObj:this.app.values.result_future});
        SimpleTable.nu(HRect.nu(180,140,330,300),this,{valueObj:this.app.values.result_past  });
      }
    }).nu(HRect.nu(40,40,386,508),this,{
      label: 'Inflation calculator',
      minSize: [346,380],
      maxSize: [346,3072]
    });
  }
});