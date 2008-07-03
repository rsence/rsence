
ComponentSampler = HApplication.extend({
  constructor: function(){
    this.base();
    this.window = new HWindow(
      new HRect(100,100,740,500),
      this, {
        label: 'Component Sampler'
      }
    );
    this.win2 = new HWindow(
      new HRect(10,10,100,100),
      this
    );
  }
});


