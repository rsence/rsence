
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
    
    var _sampleTop = _options.descr_height+42,
        _sampleHeight = (_options.sample_height > _options.yaml_height)?_options.sample_height:_options.yaml_height;
    
    /* Sample Label: */
    HStringView.nu(
      [ 8, _sampleTop-16, null, 20, 8, null ],
      _tabItem, {
        value: '<b>Visual sample:</b>'
      }
    );
    
    /* YAML Source label: */
    HStringView.nu(
      [ null, _sampleTop-16, 400, 20, 8, null ],
      _tabItem, {
        value: '<b>YAML source:</b>'
      }
    );
    
    /* YAML Source: */
    HTextArea.nu(
      [ null, _sampleTop, 400, _sampleHeight, 8, null ],
      _tabItem, {
        value: _options.yaml
      }
    );
    
    var _sampleView = SampleView.nu(
      [ 8, _sampleTop, null, _sampleHeight, 416, null ],
      _tabItem
    );
    
    JSONRenderer.nu( _options.json, _sampleView );
    
    return _tabItem;
  }
});

