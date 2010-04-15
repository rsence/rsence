RSence = {
  
  // List of apps initialized utilizing GUITrees, by GUIPlugin name
  apps: { },
  
  // Subview that utilizes GUITrees
  GUIView: HControl.extend({
    
  }),
  
  // Application that handles GUITrees, populates its values dynamically
  GUIApp: HApplication.extend({
    constructor: function(_options){
      
      var
      _this      = this,
      
      // Application priority
      _priority  = _options.priority?_options.priority:100,
      
      // Application label / title
      _label     = _options.label?_options.label:'Untitled Application',
      
      // Application description (multiline)
      _descr     = _options.descr?_options.descr:'No Description',
      
      // Allow multiple instances?
      _allowMulti = _options.allowMulti?_options.allowMulti:false,
      
      // The GUI Tree
      _valueObj   = _options.valueObj?_options.valueObj:false,
      
      // Signal input (from server to client)
      _sigInput   = _options.sigInput?COMM.Values.values[_options.sigInput]:false,
      
      // Signal output (from client to server)
      _sigOutput  = _options.sigOutput?COMM.Values.values[_options.sigOutput]:false,
      
      // Icon image url.
      // Minimum size is 16x16 and multiple sizes are stacked on top of each other,
      // largest topmost, smaller versions aligned left below in size order.
      // Image formats supported are: SVG (except for IE), PNG (all), GIF (all), JPG (all).
      // Recommended formats are: SVG and PNG24 with transparency / translucency.
      // Size has to be a factor of two; 16,32,64,128,256,512 are valid dimensions:
      // 32x32   -> 32x32 single icon
      // 32x48   -> 32x32 and 16x16
      // 512x512 -> 512x512 single icon
      // 512x768 -> 512x512, 256x256
      // 512x640 -> 512x512, 128x128
      // 512x896 -> 512x512, 256x256 and 128x128
      // etc..
      _iconUrl    = _options.iconUrl?COMM.Values.values[_options.iconUrl]:false;
      
      // Construct the application base:
      _this.base( _priority, _label );
      
      // Options combined from vars above
      _this.options = {
        label: _label,
        descr: _descr,
        allowMulti: _allowMulti,
        sigInput: _sigInput,
        sigOutput: _sigOutput,
        icon: { url: _iconUrl, width: null, height: null },
        pid: this.appId,
        views: []
      };
      
      _this.valueObj = _valueObj;
      _this.value = _valueObj.value;
      
      // _this.app = _this;
      
      // 
      // _this.renderer = COMM.JSONRenderer.extend({
      //   
      // }).nu( _this.value, _this );
    },
    
    die: function(){
      this.base();
      
    }
    
  })
};

