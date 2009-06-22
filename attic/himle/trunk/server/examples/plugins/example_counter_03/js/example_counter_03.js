

ExampleCounterApp03 = HApplication.extend({
  constructor: function( _hitButtonId, _hitCountId ){
    this.base();
    this.buildUI();
    HVM.values[_hitCountId].bind( this.win.countValue );
    HVM.values[_hitButtonId].bind( this.win.hitButton );
  },
  buildUI: function(){
    this.win = new HWindow( new HRect(30,30,300,102), this );
    this.win.setLabel( "Hit Counter" );
    
    this.win.countLabel = new HStringView( new HRect(8,12,88,32), this.win );
    this.win.countLabel.setValue("Hit Count:");
    this.win.countLabel.setStyle('text-align','right');
    this.win.countLabel.setStyle('font-weight','bold');
    
    this.win.countValue = new HStringView( new HRect(96,12,136,32), this.win );
    
    this.win.hitButton = new HButton( new HRect(136,8,230,32), this.win );
    this.win.hitButton.setLabel("Another Hit!");
    
    this.win.hitButton.click = function(){
      this.setValue( this.value + 1 );
    };
    this.win.hitButton.setClickable( true );
    
  }
});

