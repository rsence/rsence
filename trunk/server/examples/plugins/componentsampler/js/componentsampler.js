
ComponentSampler = HApplication.extend({
  constructor: function(){
    this.base();
    this.window = new HWindow(
      new HRect(100,100,740,500),
      this, {
        label: 'Component Sampler'
      }
    );
    this.tabs = new (HTab.extend({
        flexRight: true,
        flexBottom: true,
        flexRightOffset: 16,
        flexBottomOffset: 16
      }))(
      new HRect(16,16,100,100),
      this.window, {
        events: { mouseDown: true },
        enabled: true
      }
    );
    this.buttonsTab = this.tabs.addTab('Buttons',true);
    this.textTab = this.tabs.addTab('Text');
    this.numericTab = this.tabs.addTab('Numeric');
    this.progressTab = this.tabs.addTab('Progress');
    this.mediaTab = this.tabs.addTab('Media');
    this.makeButtons();
  },
  makeButtons: function(){
    var _buttonRect = new HRect(8,8,168,32);
    
    this.button1 = new HButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HButton enabled'
      }
    );
    _buttonRect.offsetBy(180,0);
    this.button2 = new HButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HButton disabled',
        enabled: false
      }
    );
    
    _buttonRect.offsetBy(-180,30);
    this.checkbox1 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox',
        value: true
      }
    );
    _buttonRect.offsetBy(180,0);
    this.checkbox2 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox disabled',
        enabled: false,
        value: true
      }
    );
    
    _buttonRect.offsetBy(-180,30);
    this.radiobutton1 = new HRadioButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HRadiobutton 1'
      }
    );
    _buttonRect.offsetBy(180,0);
    this.radiobutton2 = new HRadiobutton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HRadiobutton 2'
      }
    );
    
    _buttonRect.offsetBy(-180,30);
    this.radiobutton3 = new HRadioButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HRadiobutton 3'
      }
    );
    _buttonRect.offsetBy(180,0);
    this.radiobutton4 = new HRadiobutton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HRadiobutton 4 (disabled)',
        enabled: false,
        value: true
      }
    );
    
  }
});


