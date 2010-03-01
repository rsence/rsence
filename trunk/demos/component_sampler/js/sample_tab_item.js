
SampleTabItem = HClass.extend({
  constructor: function(_rect,_tab,_options){
    
    /* Creates tab item: */
    var _tabItem = HTabItem.nu(_rect,_tab,_options);
    
    /* Description: */
    HStringView.nu(
      [ 8, 8, null, _options.descr_height, 8, null ],
      _tabItem, {
        value: '<h1>'+_options.label+'</h1>'+_options.descr
      }
    );
    
    /* YAML Label: */
    HStringView.nu(
      [ 8, _options.descr_height+16, null, 20, 8, null ],
      _tabItem, {
        value: 'YAML:'
      }
    );
    
    /* YAML Source: */
    HTextArea.nu(
      [ 8, _options.descr_height+42, null, _options.yaml_height, 8, null ],
      _tabItem, {
        value: _options.yaml
      }
    );
    
    var _sampleView = SampleView.nu(
      [ 8, _options.descr_height+50+_options.yaml_height, null, _options.sample_height, 8, null ],
      _tabItem
    );
    
    JSONRenderer.nu( _options.json, _sampleView );
    
    return _tabItem;
  }
});

