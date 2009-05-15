InflationCalc = HApplication.extend({
  constructor: function(values){
    this.values = values;
    this.base();
    this.view = HView.extend({
      flexRight: true, flexBottom: true,
      drawSubviews: function(){
        this.setStyle('background-color','#ccc');
        HStringView.nu( HRect.nu(80,20,400,120),this,{value:'<h1>Inflation calculator</h1>'});
        HStringView.nu( HRect.nu(80,122,220,145),this,{value:'<b>Current value:</b>'});
        HTextControl.nu(HRect.nu(220,120,330,140),this,{valueObj:this.app.values.money,events:{textEnter:true}});
        HStringView.nu( HRect.nu(80,152,220,175),this,{value:'<b>Inflation rate:</b>'});
        HTextControl.nu(HRect.nu(220,150,260,170),this,{valueObj:this.app.values.percent,events:{textEnter:true}});
        HStringView.nu( HRect.nu(260,152,280,175),this,{value:'%'});
        HSlider.extend({
          setValue: function(value){
            if(isNaN(value)){return;}
            this.base(Math.round(value*10)/10);
          }
        }).nu(HRect.nu(270,150,410,170),this,{valueObj:this.app.values.percent,minValue:-20,maxValue:20});
        HStringView.nu( HRect.nu(80,182,220,205),this,{value:'<b>Number of years:</b>'});
        HTextControl.nu(HRect.nu(220,180,260,200),this,{valueObj:this.app.values.years,events:{textEnter:true}});
        HStringView.nu( HRect.nu(80,220,200,240),this,{value:'<b>Future value:</b>'});
        HStringView.nu( HRect.nu(280,220,400,240),this,{value:'<b>Past value:</b>'});
        var SimpleTable = HControl.extend({
          flexBottom: true, flexBottomOffset: 8,
          drawSubviews: function(){
            this.setStyle('background-color','#eee');
            this.setStyle('overflow','auto');
            this.setStyle('overflow-y','scroll');
            this.setStyle('border','1px solid #999');
            this.setStyle('font-size','11px');
            this.setStyle('font-family','arial,sans-serif');
            this.setStyle('text-align','right');
            this.setStyle('line-height','20px');
            this.setStyle('vertical-align','middle');
          },
          leftColStyle: 'position:absolute;display:block;left:0px;width:30px;padding-right:8px;height:20px;',
          rightColStyle: 'position:absolute;overflow:hidden;text-overflow:ellipsis;display:block;border-left:1px solid #ccc;left:38px;padding-right:6px;width:90px;height:20px;',
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
                ELEM.setCSS(elemId_col1,this.leftColStyle);
                elemId_col2 = ELEM.make(this.elemId);
                ELEM.setCSS(elemId_col2,this.rightColStyle);
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
            var row, i=0, colors=['#eee','#ddd'];
            for(;i<this.value.length;i++){
              row = this.tableElems[i];
              ELEM.setStyle(row[0],'top',(i*20)+'px');
              ELEM.setStyle(row[1],'top',(i*20)+'px');
              ELEM.setStyle(row[0],'background-color',colors[i%2]);
              ELEM.setStyle(row[1],'background-color',colors[i%2]);
              ELEM.setHTML(row[0],i+1);
              ELEM.setHTML(row[1],this.value[i]);
            }
          }
        });
        SimpleTable.nu(HRect.nu( 80,240,230,500),this,{valueObj:this.app.values.result_future});
        SimpleTable.nu(HRect.nu(250,240,400,500),this,{valueObj:this.app.values.result_past  });
      }
    }).nu(HRect.nu(0,0,408,508),this);
  }
});