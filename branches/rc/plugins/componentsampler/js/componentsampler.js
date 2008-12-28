
// The application body, methods are implemented in separate "modules".
HimleSampler.SamplerApp = HApplication.extend({
  constructor: function(_values){
    this.base(10);
    this.values = _values;
    this.createDock();
  }
});
HimleSampler.SamplerApp.implement( HimleSampler.SamplerDock     );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerWindow   );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerTabs     );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerIntro    );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerButtons  );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerText     );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerNumeric  );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerProgress );
HimleSampler.SamplerApp.implement( HimleSampler.SamplerMedia    );


