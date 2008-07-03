
ComponentSampler = HApplication.extend({
  constructor: function(){
    this.window = new HWindow(
      new HRect(100,100,740,500),
      this
    );
    console.log('hello');
  }
});


