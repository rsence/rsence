
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
    this.populateButtons();
  },
  populateButtons: function(){
    var _buttonRect = new HRect(8,8,148,28);
    
    this.button1 = new HButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HButton enabled'
      }
    );
    _buttonRect.offsetBy(160,0);
    this.button2 = new HButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HButton disabled',
        enabled: false
      }
    );
    
    _buttonRect.offsetBy(-160,30);
    this.checkbox1 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox',
        value: true
      }
    );
    _buttonRect.offsetBy(160,0);
    this.checkbox2 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox disabled',
        enabled: false,
        value: false
      }
    );
  }
});


