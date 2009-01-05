
HimleSampler.SamplerNumeric = {
  createNumericTabContents: function(){
    
    var _helperRect = HRect.nu( 8,8 , 29,263 );
    this.sliderVertical = HVSlider.nu(
      HRect.nu( _helperRect ),
      this.numericTab, {
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderVertical );
    
    _helperRect.offsetBy( 32, 0 );
    this.sliderVerticalDisabled = HVSlider.nu(
      HRect.nu( _helperRect ),
      this.numericTab, {
        enabled: false,
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderVerticalDisabled );
    
    _helperRect.set( 70,8 , 325,29 );
    this.sliderHorizonal = HSlider.nu(
      HRect.nu( _helperRect ),
      this.numericTab, {
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderHorizonal );
    
    _helperRect.offsetBy( 0, 32 );
    this.sliderHorizonalDisabled = HSlider.nu(
      HRect.nu( _helperRect ),
      this.numericTab, {
        enabled: false,
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderHorizonalDisabled );
    
    _helperRect.offsetBy( 0, 32 );
    _helperRect.setRight( _helperRect.right - 15 );
    this.num1StringEdit = HTextControl.extend({
      setValue: function(_value){
        try {
          var _pow = Math.pow( 10, this.options.decimals );
          _value = parseInt( parseFloat( _value ) * _pow, 10) / _pow;
        }
        catch(e) {
          _value = 0;
        }
        this.base( _value );
      }
    }).nu(
      HRect.nu( _helperRect ),
      this.numericTab, {
        events: {
          textEnter: true
        },
        decimals: 3
      }
    );
    this.values.num1.bind( this.num1StringEdit );
    
    _helperRect.setLeftTop( _helperRect.rightTop );
    _helperRect.setWidth( 15 );
    this.num1Stepper = HStepper.nu(
      HRect.nu( _helperRect ),
      this.numericTab, {
        minValue: -100,
        maxValue: 100,
        repeatInterval: 50
      }
    );
    this.values.num1.bind( this.num1Stepper );
    
    
  }
};

