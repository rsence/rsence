
HimleSampler.SamplerWindow = {
  
  createWindow: function() {
    this.window = HWindow.nu(
      HRect.nu(100,101,740,501),
      this, {
        label: 'Component Sampler',
        minSize: [420,320],
        maxSize: [800,600],
        resizeW: 3,
        resizeE: 3,
        resizeN: 3,
        resizeS: 3,
        closeButton: true,
        collapseButton: true,
        zoomButton: true
      }
    );
    
    this.window.windowClose = function() {
      this.animateTo(HRect.nu(this.app.createWindowButton.origRect),300);
    };
    
    this.window.onAnimationEnd = function() {
      this.app.createWindowButton.restoreButton();
      this.die();
    };
    
    this.createTabs();
    
  }
  
};

