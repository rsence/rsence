InflationCalc = HApplication.extend({
  constructor: function(values){
    this.values = values;
    this.base();
    this.view = HView.extend({
      flexRight: true, flexBottom: true,
      drawSubviews: function(){
        this.setStyle('background-color','#ccc');
        this.setStyle('overflow','auto');
        HStringView.nu( HRect.nu(80,20,400,120),this,{value:'<h1>Inflation calculator</h1>'});
        HStringView.nu( HRect.nu(80,122,220,145),this,{value:'<b>Current value:</b>'});
        HTextControl.nu(HRect.nu(220,120,280,140),this,{valueObj:this.app.values.money,events:{textEnter:true}});
        HStringView.nu( HRect.nu(80,152,220,175),this,{value:'<b>Inflation rate:</b>'});
        HTextControl.nu(HRect.nu(220,150,260,170),this,{valueObj:this.app.values.percent,events:{textEnter:true}});
        HStringView.nu( HRect.nu(260,152,280,175),this,{value:'%'});
        HSlider.extend({
          setValue: function(value){
            this.base(Math.round(value*10)/10);
          }
        }).nu(HRect.nu(270,150,410,170),this,{valueObj:this.app.values.percent,minValue:-20,maxValue:20});
        HStringView.nu( HRect.nu(80,182,220,205),this,{value:'<b>Number of years:</b>'});
        HTextControl.nu(HRect.nu(220,180,280,200),this,{valueObj:this.app.values.years,events:{textEnter:true}});
        HStringView.nu( HRect.nu(80,220,200,240),this,{value:'<b>Future value:</b>'});
        HStringView.nu( HRect.nu(280,220,400,240),this,{value:'<b>Past value:</b>'});
        var SimpleTable = HControl.extend({
          flexBottom: true, flexBottomOffset: 8,
          drawSubviews: function(){
            this.setStyle('background-color','#eee');
            this.setStyle('overflow','auto');
            this.setStyle('border','1px solid #999');
            this.setStyle('font-size','11px');
            this.setStyle('font-family','arial,sans-serif');
            this.setStyle('text-align','right');
          },
          refreshTableElems: function(){
            if(this['tableElems']===undefined){
              this.tableElems = [];
            }
            var tableElemsLen = this.tableElems.length,
                valueLen = this.value.length,
                maxLen = Math.max(tableElemsLen,valueLen),
                elemId_col1, elemId_col2, row, i=0;
            for(;i<maxLen;i++){
              if(i >= tableElemsLen){
                elemId_col1 = ELEM.make(this.elemId);
                ELEM.setCSS(elemId_col1,'position:absolute;display:block;left:0px;width:30px;height:20px;');
                elemId_col2 = ELEM.make(this.elemId);
                ELEM.setCSS(elemId_col2,'position:absolute;display:block;border-left:1px solid #ccc;left:38px;width:55px;height:20px;');
                row = [elemId_col1,elemId_col2];
                this.tableElems[i] = row;
              }
              else if(i>=valueLen){
                var row = this.tableElems.pop();
                ELEM.del(row[0]);
                ELEM.del(row[1]);
              }
            }
          },
          refreshValue: function(){
            this.refreshTableElems();
            var row, i=0;
            for(;i<this.value.length;i++){
              row = this.tableElems[i];
              ELEM.setStyle(row[0],'top',(i*20)+'px');
              ELEM.setStyle(row[1],'top',(i*20)+'px');
              ELEM.setHTML(row[0],i+1);
              ELEM.setHTML(row[1],this.value[i]);
            }
          }
        });
        SimpleTable.nu(HRect.nu( 80,240,200,500),this,{valueObj:this.app.values.result_future});
        SimpleTable.nu(HRect.nu(280,240,400,500),this,{valueObj:this.app.values.result_past  });
      }
    }).nu(HRect.nu(0,0,1,1),this);
  }
});