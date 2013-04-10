
/*** = Description
  ** HMorphAnimation defines morphing animation.
  **
  ** HMorphAnimation is implemented by HView as an interface. 
  ** Its methods define the functionality to zoom from the current geometry to a 
  ** target geometry with animated intervals.
***/
var//RSence.Foundation
HMorphAnimation = HClass.extend({
  
/** = Description
  * Moves the view smoothly into another location and/or size. The
  * onAnimationStart event on the view gets called when the animation starts.
  * 
  * = Parameters:
  * +_obj+::      An instance of <HPoint> or <HRect>, depending on the desired 
  *               animation result. When a point is passed, the view is moved in
  *               that position. When a rect is passed, the view can also be resized
  *               with or without moving to different coordinates.
  * 
  * +_duration+:: _optional_ The duration of the animation in milliseconds. The
  *               default duration is 500 ms.
  * 
  * +_fps+::      _optional_ The frame rate for the animation. The default fps is 50.
  *
  * = Returns:
  * +self+
  *   
  * = Usage:
  *  HView.extend({
  *    onAnimationEnd: function(){
  *      this.die();
  *    }
  *  }).nu(
  *    [ 0, 0, 300, 300 ],
  *    HApplication.nu()
  *  ).setStyle(
  *    'background-color', 'red'
  *  ).animateTo(
  *    HRect.nu( 300, 300, 500, 500 )
  *  );
  *   
  **/
  animateTo: function(_obj, _duration, _fps) {
    if(!this.drawn){
      return this;
    }
    // Redirect the method call to _animateTo(HRect).
    if(_obj instanceof HPoint) {
      var _rect = new HRect(_obj, _obj);
      _rect.setSize(this.rect.width, this.rect.height);
      this._animateTo(_rect, _duration);
    }
    else if(_obj instanceof HRect) {
      this._animateTo(_obj, _duration);
    }
    else {
      this._animateTo(_obj, _duration);
    }
    return this;
  },
  
  
/** = Description
  * Stops the current animation for this view. If the view is not being
  * animated, this method has no effect.  The onAnimationEnd event on the view
  * gets called when the animation finishes (reaches the end position/size), but
  * onAnimationCancel gets called when this method is called while the animation
  * is still in action.
  *  
  */
  stopAnimation: function(_target) {
    if (this._animateInterval) {
      // Stop the animation interval only if it has been set.
      window.clearInterval(this._animateInterval);
      this._animateInterval = null;
      
      // Update the rect after the new position and size have been reached.
      var _left   = parseInt(this.style('left'), 10),
          _top    = parseInt(this.style('top'), 10),
          _width  = parseInt(this.style('width'), 10),
          _height = parseInt(this.style('height'), 10);
      this.rect.set(_left, _top, _left + _width, _top + _height);
      this.drawRect();
      
      if (this._animationDone) {
        this.onAnimationEnd();
      }
      else {
        this.onAnimationCancel();
      }
      
    }
    return this;
  },
  
  _animFunction: function(_that,_target,_startTime,_duration){
    return function(){
      if(!_that){
        return;
      }
      var _rect = _target;
      _that._animateStep({
        startTime: _startTime,
        duration: _duration,
        // Linear transition effect.
        transition: function(t, b, c, d) { return c * t / d + b; },
        props: [{
          prop: 'left',
          from: _that.rect.left,
          to: _rect.left,
          unit: 'px'
        },{
          prop: 'top',
          from: _that.rect.top,
          to: _rect.top,
          unit: 'px'
        },{
          prop: 'width',
          from: _that.rect.width,
          to: _rect.width,
          unit: 'px'
        },{
          prop: 'height',
          from: _that.rect.height,
          to: _rect.height,
          unit: 'px'
        }]
      });
    };
  },
  
  // --Private method.++
  // --Starts the animation with the target _rect.++
  _animateTo: function(_target, _duration, _fps) {
    
    if (null === _duration || undefined === _duration) {
      _duration = 500; // default duration is half second
    }
    if (null === _fps || undefined === _fps || _fps < 1) {
      _fps = 50; // default fps
    }
    
    if (!this._animateInterval) {
      
      this._animationDone = false;
      this.onAnimationStart();
      
      var _startTime = new Date().getTime();
      this._animateInterval = window.setInterval(
        this._animFunction(this, _target, _startTime, _duration),
        Math.round(1000 / _fps)
      );
    }
    return this;
  },
  
  
  // --Private method.++
  // --Moves the view for one step. This gets called repeatedly when the animation++
  // --is happening.++
  _animateStep: function(_obj) {
    var
    _time = new Date().getTime(),
    i;
    if (_time < _obj.startTime + _obj.duration) {
      var _cTime = _time - _obj.startTime;
      
      // Handle all the defined properties.
      for (i = 0; i < _obj.props.length; i++) {
        var
        _from = _obj.props[i].from,
        _to = _obj.props[i].to;
        
        if (_from !== _to) {
          // The value of the property at this time.
          var
          _key = _obj.props[i].prop,
          _propNow = _obj.transition(
            _cTime, _from, (_to - _from), _obj.duration
          ),
          _unit = _obj.props[i].unit;
          if(_unit){
            _propNow += _unit;
          }
          this._animateStepStyle( _key, _propNow );
        }
      }
    }
    else {
      // Animation is done, clear the interval and finalize the animation.
      for (i = 0; i < _obj.props.length; i++) {
        this._animateFinalStepStyle(_obj.props[i]);
      }
      this._animationDone = true;
      this.stopAnimation();
    }
    return this;
  },

  _animateStepStyle: function( _key, _propNow ){
    ELEM.setStyle( this.elemId, _key, _propNow );
  },

  _animateFinalStepStyle: function(_props){
    ELEM.setStyle(
      this.elemId,
      _props.prop,
      _props.to + _props.unit
    );
  },
  
/** = Description
  * Extend the onAnimationStart method, if you want to do something special 
  * when this view starts animating.
  *
  * = Usage:
  *  HView.extend({
  *     onAnimationStart: function() {
  *       this.setStyle('background-color','green')
  *     }, 
  *     onAnimationEnd: function() {
  *       this.setStyle('background-color','grey')}
  *     }).nu(
  *       [0,0,300,300],
  *       HApplication.nu()
  *     ).setStyle(
  *       'background-color','blue'
  *     ).animateTo(
  *       HRect.nu(
  *         300,300,700,700
  *       )
  *     );
  *
  **/
  onAnimationStart: function() {
    if(typeof this.startAnimation == 'function'){
      this.startAnimation();
    }
  },
  
/** Extend the onAnimationEnd method, if you want to do something special 
  * when an animation on this view is finished.
  **/
  onAnimationEnd: function() {
    if(typeof this.endAnimation == 'function'){
      this.endAnimation();
    }
  },
  
/** Extend this method if functionality is desired upon cancellation of animation.
  **/
  onAnimationCancel: function() {
    if(typeof this.cancelAnimation == 'function'){
      this.cancelAnimation();
    }
  }
});
