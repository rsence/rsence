
ClickerApp = HApplication.extend({
  constructor: function(clicker_id, servertime_id){
    
    this.base();
    
    this.win = new HWindowControl(
      new HRect(100,100,100+320,100+240),
      this, {
        label: 'Server Time'
      }
    );
    
    this.timeView = new HTextControl(
      new HRect(40,40,280,80),
      this.win.windowView, {
        value: 'Getting time...'
      }
    );
    
    this.clicker = new HClickButton(
      new HRect(40,120,280,160),
      this.win.windowView, {
        label: 'Update'
      }
    );
    
    var _timeVal = HValueManager.values[ servertime_id ];
    _timeVal.bind(this.timeView);
    
    var _clickVal = HValueManager.values[ clicker_id ];
    _clickVal.bind(this.clicker);
    
  }
});

