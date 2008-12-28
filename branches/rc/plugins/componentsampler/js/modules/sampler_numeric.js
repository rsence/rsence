
HimleSampler.SamplerNumeric = {
  createNumericTabContents: function(){
    
    this.sliderVertical = HVSlider.nu(
      HRect.nu( 8,8 , 29,263 ),
      this.numericTab
    );
    
    this.sliderVerticalDisabled = HVSlider.nu(
      HRect.nu( 37,8 , 58,263 ),
      this.numericTab, {
        enabled: false
      }
    );
    
    this.sliderHorizonal = HSlider.nu(
      HRect.nu( 70,8 , 325,29 ),
      this.numericTab
    );
    
    this.sliderHorizonalDisabled = HSlider.nu(
      HRect.nu( 70,37 , 325,58 ),
      this.numericTab, {
        enabled: false
      }
    );
    
  }
};

