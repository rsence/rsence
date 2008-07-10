
ComponentSampler = HApplication.extend({
  constructor: function(_valueIds){
    this.base();
    this.valueIds = _valueIds;
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
    this.introTab = this.tabs.addTab('Intro',true);
    this.buttonsTab = this.tabs.addTab('Buttons');
    this.textTab = this.tabs.addTab('Text');
    this.numericTab = this.tabs.addTab('Numeric');
    this.progressTab = this.tabs.addTab('Progress');
    this.mediaTab = this.tabs.addTab('Media');
    HVM.values[this.valueIds.main_tabs].bind(this.tabs);
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
    
    _buttonRect.offsetBy(-180,32);
    this.checkbox1 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox',
        value: true
      }
    );
    HVM.values[this.valueIds.checkbox1].bind(this.checkbox1);
    _buttonRect.offsetBy(180,0);
    this.checkbox2 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox disabled',
        enabled: false,
        value: true
      }
    );
    HVM.values[this.valueIds.checkbox2].bind(this.checkbox2);
    _buttonRect.offsetBy(-180,32);
    
    var _radioGroupARect = new HRect(_buttonRect);
    _radioGroupARect.setHeight(60);
    _radioGroupARect.setWidth(360);
    _radioGroupARect.offsetBy(-4,-4);
    this.radioGroupA = new HView(
      _radioGroupARect,
      this.buttonsTab
    );
    this.radioGroupA.setStyle('border','1px solid #999');
    
    var _radioButtonRect = new HRect(_buttonRect);
    _radioButtonRect.offsetTo(4,4);
    this.radiobuttonA1 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A1'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonA2 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A2'
      }
    );
    
    _radioButtonRect.offsetBy(-180,30);
    this.radiobuttonA3 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A3'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonA4 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A4 (disabled)',
        enabled: false,
        value: true
      }
    );
    HVM.values[this.valueIds.radio_a].bind(this.radioGroupA.valueMatrix);
    
    _buttonRect.offsetBy(0,64);
    var _radioGroupBRect = new HRect(_buttonRect);
    _radioGroupBRect.setHeight(60);
    _radioGroupBRect.setWidth(360);
    _radioGroupBRect.offsetBy(-4,-4);
    this.radioGroupB = new HView(
      _radioGroupBRect,
      this.buttonsTab
    );
    this.radioGroupB.setStyle('border','1px solid #999');
    
    var _radioButtonRect = new HRect(_buttonRect);
    _radioButtonRect.offsetTo(4,4);
    this.radiobuttonB1 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B1'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonB2 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B2',
        value: true
      }
    );
    
    _radioButtonRect.offsetBy(-180,30);
    this.radiobuttonB3 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B3'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonB4 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B4 (disabled)',
        enabled: false
      }
    );
    HVM.values[this.valueIds.radio_b].bind(this.radioGroupB.valueMatrix);
    
    
    
  }
});


