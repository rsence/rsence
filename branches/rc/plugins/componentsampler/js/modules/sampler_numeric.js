
HimleSampler.SamplerNumeric = {
  createNumericTabContents: function(){
    
    this.sliderVertical = HVSlider.nu(
      HRect.nu( 8,8 , 29,263 ),
      this.numericTab, {
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderVertical );
    
    this.sliderVerticalDisabled = HVSlider.nu(
      HRect.nu( 37,8 , 58,263 ),
      this.numericTab, {
        enabled: false,
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderVerticalDisabled );
    
    this.sliderHorizonal = HSlider.nu(
      HRect.nu( 70,8 , 325,29 ),
      this.numericTab, {
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderHorizonal );
    
    this.sliderHorizonalDisabled = HSlider.nu(
      HRect.nu( 70,37 , 325,58 ),
      this.numericTab, {
        enabled: false,
        minValue: -100,
        maxValue: 100
      }
    );
    this.values.num1.bind( this.sliderHorizonalDisabled );
    
    this.num1StringView = HStringView.nu(
      HRect.nu( 333, 8, 400, 29 ),
      this.numericTab
    );
    this.values.num1.bind( this.num1StringView );
    
    this.num1Stepper = HStepper.nu(
      HRect.nu( 333, 37, 400, 58 ),
      this.numericTab
    );
    this.values.num1.bind( this.num1Stepper );
    
  }
};

