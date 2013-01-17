
var
HDateTimePicker = HControl.extend({
  setLocked: function(_lockedState){
    var
    _enabledState = !_lockedState;
    this.yyyy.setEnabled(_enabledState);
    this.mm.setEnabled(_enabledState);
    this.dd.setEnabled(_enabledState);
    this.h.setEnabled(_enabledState);
    this.m.setEnabled(_enabledState);
  },
  refreshValue: function(_readMode){
    if(!this.drawn){
      return;
    }
    if(!this.m){
      return;
    }
    this.setLocked( HVM.values[ this.options.lockedId ].value );
    var
    date = new Date( this.value*1000 ),
    yyyy = date.getUTCFullYear(),
    mm = date.getUTCMonth()+1,
    dd = date.getUTCDate(),
    h = date.getUTCHours(),
    m = date.getUTCMinutes();
    if(_readMode){
      var
      nuDate = new Date( this.value*1000 ),
      doSet = false;
      if(this.yyyyValue.value !== yyyy){
        nuDate.setUTCFullYear( this.yyyyValue.value ); doSet = true;
      }
      if(this.mmValue.value !== mm){
        nuDate.setUTCMonth( this.mmValue.value-1 ); doSet = true;
      }
      if(this.ddValue.value !== dd){
        nuDate.setUTCDate( this.ddValue.value ); doSet = true;
      }
      if(this.hValue.value !== h){
        nuDate.setUTCHours( this.hValue.value ); doSet = true;
      }
      if(this.mValue.value !== m){
        nuDate.setUTCMinutes( this.mValue.value ); doSet = true;
      }
      if(doSet){
        this.setValue( nuDate.getTime()/1000 );
        this.setMonthMax( nuDate );
      }
    }
    else{
      this.yyyyValue.set( yyyy );
      this.mmValue.set( mm );
      this.ddValue.set( dd );
      this.hValue.set( h );
      this.mValue.set( m );
    }
  },
  setMonthMax: function( nuDate ){
    nuDate.setUTCSeconds( 0 );
    nuDate.setUTCMinutes( 0 );
    nuDate.setUTCHours( 0 );
    nuDate.setUTCDate( 1 );
    var
    mm = nuDate.getUTCMonth();
    if(mm === 11){
      nuDate.setUTCMonth( 0 );
      nuDate.setUTCFullYear( nuDate.getUTCFullYear()+1 );
    }
    else {
      nuDate.setUTCMonth( mm+1 );
    }
    var
    ms = nuDate.getTime() - 1000,
    maxDaysDate = new Date(ms),
    maxDays = maxDaysDate.getUTCDate();
    // console.log('maxDaysDate:',maxDaysDate.getUTCFullYear(),'-',maxDaysDate.getUTCMonth(),'-',maxDaysDate.getUTCDate());
    // console.log('maxDays:',maxDays);
    if(maxDays !== this.dd.numField.options.maxValue){
      // console.log('reset maxValue..');
      this.dd.numField.options.maxValue = maxDays;
      (this.dd.numField.options.maxValue < this.dd.numField.value) && this.ddValue.set( maxDays );
      this.dd.stepper.options.maxValue = maxDays;
    }
  },
  die: function(){
    this.yyyyValue.die();
    this.yyyy.die();
    this.mmValue.die();
    this.mm.die();
    this.ddValue.die();
    this.dd.die();
    this.hValue.die();
    this.h.die();
    this.mValue.die();
    this.m.die();
    this.base();
  },
  drawSubviews: function(){
    ELEM.setStyle( this.elemId, 'overflow', 'visible' );
    var
    _NumStepperField = HView.extend({
      setEnabled: function(_state){
        this.numField.setEnabled(_state);
        this.stepper.setEnabled(_state);
        if(_state){
          this.stepper.show();
        }
        else{
          this.stepper.hide();
        }
      },
      drawSubviews: function(){
        ELEM.setStyle( this.elemId, 'overflow', 'visible' );
        this.numField = HNumericTextControl.extend({
          refreshValue: function(){
            this.base();
            this.parent.parent.refreshValue(true);
          },
          textBlur: function(){
            this.setValue(
              this.validateText(
                this.getTextFieldValue()
              )
            );
          }
        }).nu(
          [ 0, 0, this.rect.width-10, 21 ],
          this, {
            events: {
              textEnter: false
            },
            minValue: this.options.minValue,
            maxValue: this.options.maxValue,
            valueObj: this.options.valueObj
          }
        );
        this.stepper = HStepper.nu(
          [ this.rect.width-15, 0, 15, 21 ],
          this, {
            minValue: this.options.minValue,
            maxValue: this.options.maxValue,
            valueObj: this.options.valueObj
          }
        );
      }
    }),
    _numStepperRect = HRect.nu( 0, 0, 50, 21 );
    this.yyyyValue = HValue.nu( false, 2010 );
    this.yyyy = _NumStepperField.nu(
      HRect.nu( _numStepperRect ),
      this, {
        minValue: 2010,
        maxValue: 2020,
        valueObj: this.yyyyValue
      }
    );
    _numStepperRect.setWidth( 35 );
    _numStepperRect.offsetBy( 55, 0 );
    this.mmValue = HValue.nu( false, 12 );
    this.mm = _NumStepperField.nu(
      HRect.nu( _numStepperRect ),
      this, {
        minValue: 1,
        maxValue: 12,
        valueObj: this.mmValue
      }
    );
    _numStepperRect.offsetBy( 40, 0 );
    this.ddValue = HValue.nu( false, 24 );
    this.dd = _NumStepperField.nu(
      HRect.nu( _numStepperRect ),
      this, {
        minValue: 1,
        maxValue: 31,
        valueObj: this.ddValue
      }
    );
    _numStepperRect.offsetBy( 50, 0 );
    this.hValue = HValue.nu( false, 22 );
    this.h = _NumStepperField.nu(
      HRect.nu( _numStepperRect ),
      this, {
        minValue: 0,
        maxValue: 23,
        valueObj: this.hValue
      }
    );
    _numStepperRect.offsetBy( 40, 0 );
    this.mValue = HValue.nu( false, 45 );
    this.m = _NumStepperField.nu(
      HRect.nu( _numStepperRect ),
      this, {
        minValue: 0,
        maxValue: 59,
        valueObj: this.mValue
      }
    );
    _numStepperRect.offsetBy( 37, 2 );
    _numStepperRect.setWidth( 60 );
    HStringView.nu(
      HRect.nu( _numStepperRect ),
      this, {
        valueObj: HVM.values[this.options.tzValueId]
      }
    );
    this.refreshValue();
  }
});
