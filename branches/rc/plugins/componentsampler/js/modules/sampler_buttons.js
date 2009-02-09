
RSampler.SamplerButtons = {
  
  createButtonsTabContents: function(){
    /*
    
    Next, a bunch of buttons of equal size will be
    constructed. That's why _buttonRect is assigned
    as a 'HRect' "template"
    
    */
    var _buttonRect = HRect.nu(8,8,168,32);
    
    /*
    
    'HButton' is a component that doesn't really do
    anything by default and its intended usage is to
    be a visual button component destined for usage-
    specific extension.
    
    Its HRect is copied from the template '_buttonRect'.
    
    It's placed inside the 'buttonsTab' tab.
    
    Any component's label default by default to "Untitled".
    To change defaults, change the respective properties
    of 'HComponentDefaults' like:
    
    HComponentDefaults.label = 'No Label';
    HComponentDefaults.visible = false;
    
    */
    this.button1 = HButton.nu(
      HRect.nu(_buttonRect),
      this.buttonsTab, {
        label: 'HButton enabled'
      }
    );
    // Uncomment the following line to disable button1:
    //this.button1.setEnabled(false);
    
    // Uncomment the following line to change the label:
    //this.button1.setLabel('Button 1');
    
    /*
    
    Next, we move the template rectangle 180 pixels
    to the right.
    
    */
    _buttonRect.offsetBy(180,0);
    
    /*
    
    This second button has its 'enabled' option turned
    off by default, making it disabled. Disabled means
    it won't respond to user interaction.
    
    */
    this.button2 = HButton.nu(
      HRect.nu(_buttonRect),
      this.buttonsTab, {
        label: 'HButton disabled',
        enabled: false
      }
    );
    // Uncomment the following line to enable button2:
    //this.button2.setEnabled(true);
    
    /*
    
    HCheckboxes are simple components that just toggle
    their value between true and false when clicked
    and shows visually a checkmark when the value is
    true. This HCheckbox is checked by default, unless
    overridden by the value binding (see below):
    
    */
    _buttonRect.offsetBy(-180,32);
    this.checkbox1 = HCheckbox.nu(
      HRect.nu(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox',
        value: true
      }
    );
    
    /*
    
    The next line makes the value of the checkbox accessible
    to the server:
    
    */
    this.values.checkbox1.bind(this.checkbox1);
    
    /*
    
    This checkbox is disabled, but checked by default:
    
    */
    _buttonRect.offsetBy(180,0);
    this.checkbox2 = HCheckbox.nu(
      HRect.nu(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox disabled',
        enabled: false,
        value: true
      }
    );
    this.values.checkbox2.bind(this.checkbox2);
    
    /*
    
    Here we make another copy of the '_buttonRect' and edit
    its properties.
    
    */
    _buttonRect.offsetBy(-180,32);
    var _radioGroupARect = HRect.nu(_buttonRect);
    _radioGroupARect.setHeight(60);
    _radioGroupARect.setWidth(360);
    _radioGroupARect.offsetBy(-4,-4);
    
    /*
    
    HView is the simples visual component. Its main purpose
    is to contain and group other components, just like
    'HWindow' and 'HTab', but much simpler.
    
    It's completely transparent by default and can't receive
    the options block; it can only take the first two arguments.
    
    All components are derived from HView.
    
    */
    this.radioGroupA = HView.nu(
      _radioGroupARect,
      this.buttonsTab
    );
    // Comment the next line 
    this.radioGroupA.setStyle('border','1px solid #999');
    
    /*
    
    HRadioButtons are components that are almost like
    HCheckbox, except they don't toggle their value.
    Instead they set it to true when clicked and set
    the previous one to false, effectively making only
    one HRadioButton in the group selected at once.
    
    Use container-components like 'HView' to group
    HRadioButton instances.
    
    */
    var _radioButtonRect = HRect.nu(_buttonRect);
    _radioButtonRect.offsetTo(4,4);
    this.radiobuttonA1 = HRadioButton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A1'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonA2 = HRadiobutton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A2'
      }
    );
    
    _radioButtonRect.offsetBy(-180,30);
    this.radiobuttonA3 = HRadioButton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A3'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonA4 = HRadiobutton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A4 (disabled)',
        enabled: false,
        value: true
      }
    );
    
    /*
    
    An 'HValueMatrix' instance exists as 'valueMatrix' in the container
    component of any HRadioButton instances. It's a very simple value
    receipent that does most of the magic of coordinating the values of
    individual 'HRadioButton' instances in a group.
    
    Its value is the index of the selected 'HRadioButton' and is more
    useful than using the boolean values of each 'HRadioButton'.
    
    It's very similar to the HTab's selected index value.
    
    Here it's bound to a 'HValue' instance to enable server access to it.
    
    */
    this.values.radio_a.bind(this.radioGroupA.valueMatrix);
    
    /*
    
    This is another group of HRadioButtons just like above.
    
    */
    _buttonRect.offsetBy(0,64);
    var _radioGroupBRect = HRect.nu(_buttonRect);
    _radioGroupBRect.setHeight(60);
    _radioGroupBRect.setWidth(360);
    _radioGroupBRect.offsetBy(-4,-4);
    this.radioGroupB = HView.nu(
      _radioGroupBRect,
      this.buttonsTab
    );
    this.radioGroupB.setStyle('border','1px solid #999');
    
    var _radioButtonRect = HRect.nu(_buttonRect);
    _radioButtonRect.offsetTo(4,4);
    this.radiobuttonB1 = HRadioButton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B1'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonB2 = HRadiobutton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B2',
        value: true
      }
    );
    
    _radioButtonRect.offsetBy(-180,30);
    this.radiobuttonB3 = HRadioButton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B3'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonB4 = HRadiobutton.nu(
      HRect.nu(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B4 (disabled)',
        enabled: false
      }
    );
    this.values.radio_b.bind(this.radioGroupB.valueMatrix);
    
    _buttonRect.offsetBy(0,64);
    
    // upload control, uses special value messaging, see the plugins for details
    var _uploadRect = HRect.nu(_buttonRect);
    _uploadRect.setWidth(320);
    this.uploader = HUploader.nu(
      _uploadRect,
      this.buttonsTab, {
        events: {
          click: true
        }
      }
    );
    this.values.upload1.bind(this.uploader);
    
    _buttonRect.offsetBy(0,32);
    
    this.testZIndexButton = (HButton.extend({
      die: function(){
        var _testWinIdx=0, _testWinLen=this.testWins.length, _win;
        for(;_testWinIdx<_testWinLen;_testWinIdx++){
          _win = this.testWins.shift();
          if(!_win.destroyed){
            _win.die();
          }
        }
        this.base();
      }
    })).nu( HRect.nu( _buttonRect ), this.buttonsTab );
    this.testZIndexButton.setLabel( 'Open Window' );
    this.testZIndexButton.setClickable( true );
    this.testZIndexButton.testWins = [];
    this.testZIndexButton.click = function(){
      var _winIdx = this.testWins.length;
      this.testWins.push(
        HWindow.nu( HRect.nu(8,8,128,119), this.app, { closeButton: true, label: 'test '+_winIdx } )
      );
      var _win = this.testWins[ _winIdx ];
      _win.red = HView.nu( HRect.nu(10,10,40,40), _win );
      _win.red.setStyle('background-color','red');
      _win.grn = HView.nu( HRect.nu(25,25,55,55), _win );
      _win.grn.setStyle('background-color','green');
      _win.blu = HView.nu( HRect.nu(40,40,70,70), _win );
      _win.blu.setStyle('background-color','blue');
      _win.red.bringToFront();
      _win.blu.sendToBack();
    };
    
    _buttonRect.offsetBy(0,32);
    
    this.memLeakButton = HButton.extend({
      testOn: false,
      testCount: 0,
      testWin: false,
      click: function(){
        if(this.testOn){
          this.setLabel('Memleak test off');
          this.testOn=false;
          this.testCount=0;
          HSystem.reniceApp(this.app.appId,10);
        }
        else {
          this.setLabel('Memleak test on');
          this.testOn=true;
          HSystem.reniceApp(this.app.appId,1);
        }
        return true;
      },
      onIdle: function(){
        this.setLabel('Memleak test off: '+HSystem.ticks);
        if(!this.testOn){
          return;
        }
        this.testCount++;
        this.setLabel('Memleak test on: '+HSystem.ticks);
        if(this.testWin){
          this.testWin.die();
          this.testWin = null;
        }
        this.testWin = HWindow.nu(HRect.nu(8,8,130,100), this.app, {label:'testwin'+this.testCount, closeButton: true});
        var testWinBtn = HButton.nu(HRect.nu(8,8,64,32), this.testWin, {label:'Button'});
      }
    }).nu( HRect.nu(_buttonRect), this.buttonsTab, { label:'Memory Leak?' } );
    this.memLeakButton.setClickable( true );
  }
};
