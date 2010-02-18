/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** A self-contained application class that creates the user interface.
  ***/
InflationCalc = HApplication.extend({
  
/** Resets the values to the defaults.
  **/
  reset: function(){
    var values = this.values;
    values.amount.set(1000);
    values.years.set(10);
    values.percent.set(7);
  },
  
/** Uses +values+ as the constructor parameter, it's a hash
  * that contains the references to the values used in the application.
  * See inflation_calc.rb
  **/
  constructor: function(values){
    this.values = values;
    this.base();
    
    // Extends the HWindow component in place to contain the gui elements.
    this.view = HWindow.extend({
      drawSubviews: function(){
        // These are constructed inside the window.
        
        // Label for the value field
        HStringView.nu( HRect.nu(8,22,150,45),this,{value:'<b>Current value:</b>'});
        
        // The value field itself
        HTextControl.nu(HRect.nu(150,20,250,40),this,{valueObj:this.app.values.amount,events:{textEnter:true}});
        
        // The 'Reset' button, calls the reset method of the application upon click.
        HButton.extend({
          click: function(){
            this.app.reset();
          }
        }).nu(HRect.nu(258,18,330,42),this,{events:{click:true},label:'Reset'});
        
        // Label for the inflation rate field
        HStringView.nu( HRect.nu(8,52,150,75),this,{value:'<b>Inflation rate:</b>'});
        
        // The inflation rate field itself
        HTextControl.nu(HRect.nu(150,50,190,70),this,{valueObj:this.app.values.percent,events:{textEnter:true}});
        
        // Percent as the suffix for the field
        HStringView.nu( HRect.nu(190,52,210,75),this,{value:'%'});
        
        // A slider to control the rate
        HSlider.extend({
          setValue: function(value){
            if(isNaN(value)){return;}
            this.base(Math.round(value*10)/10); // makes decimals with just one digit after the dot
          }
        }).nu(HRect.nu(200,50,330,70),this,{valueObj:this.app.values.percent,minValue:-20,maxValue:20});
        
        // Label for the years field
        HStringView.nu( HRect.nu(8,82,150,105),this,{value:'<b>Number of years:</b>'});
        
        // The years field
        HTextControl.nu(HRect.nu(150,80,190,100),this,{valueObj:this.app.values.years,events:{textEnter:true}});
        
        // A slider to control the years
        HSlider.extend({
          setValue: function(value){
            if(isNaN(value)){return;}
            this.base(Math.round(value)); // makes integers
          }
        }).nu(HRect.nu(200,80,330,100),this,{valueObj:this.app.values.years,minValue:1,maxValue:100});
        
        // Label for the future values table
        HStringView.nu( HRect.nu(8,120,158,140),this,{value:'<b>Future value:</b>'});
        
        // Table for the future values
        SimpleTable.nu(HRect.nu( 8,140,158,300),this,{valueObj:this.app.values.result_future});
        
        // Label for the past values table
        HStringView.nu( HRect.nu(180,120,330,140),this,{value:'<b>Past value:</b>'});
        
        // Table for the past values
        SimpleTable.nu(HRect.nu(180,140,330,300),this,{valueObj:this.app.values.result_past  });
      }
      
      // Constructor arguments for the HWindow extended above
    }).nu(HRect.nu(40,40,386,508),this,{
      label: 'Inflation calculator',
      zoomButton: true,
      collapseButton: true,
      closeButton: true,
      minSize: [346,380],
      maxSize: [346,3072]
    });
  }
});

