
// The application body, methods are implemented in separate "modules".
RSampler.SamplerApp = HApplication.extend({
  constructor: function(_values){
    this.base(10);
    this.values = _values;
    this.createDock();
  }
});
RSampler.SamplerApp.implement( RSampler.SamplerDock     );
RSampler.SamplerApp.implement( RSampler.SamplerWindow   );
RSampler.SamplerApp.implement( RSampler.SamplerTabs     );
RSampler.SamplerApp.implement( RSampler.SamplerIntro    );
RSampler.SamplerApp.implement( RSampler.SamplerButtons  );
RSampler.SamplerApp.implement( RSampler.SamplerText     );
RSampler.SamplerApp.implement( RSampler.SamplerNumeric  );
RSampler.SamplerApp.implement( RSampler.SamplerProgress );
RSampler.SamplerApp.implement( RSampler.SamplerMedia    );


