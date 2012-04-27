/*   RSence
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** COMM.Queue executes javascript blocks in a managed queue.
  **
  ** COMM.Queue is used by COMM.Transporter and JSLoader to continue
  ** javascript command execution after a XMLHttpRequest finishes.
  **
  ** COMM.Queue runs as a single instance, dan't try to reconstruct it.
***/
//var//RSence.COMM
COMM.Queue = HApplication.extend({
  
/** The constructor takes no arguments and starts queue flushing automatically.
  **/
  constructor: function(){
    
    // The queue itself, is packed with anonymous functions
    this.commandQueue = [];
    
    // Flag to signal the pause and resume status.
    this.paused = false;
    
    // Run with priority 10; not too demanding but not too sluggish either
    this.base(10);
  },
  
/** Checks periodically, if the queue needs flushing.
  **/
  onIdle: function(){
    // Runs the flush operation, if the queue is not
    // empty and the state is not resumed:
    !this.paused && this.commandQueue.length !== 0 && this.flush();
  },
  
/** = Description
  * Pauses the queue.
  *
  * Use to stop execution, if some data or code needs to be loaded that the
  * rest of the queue depends on.
  * Typically called before an +XMLHttpRequest+ with the +onSuccess+
  * event defined to call +resume+ when the request is done.
  *
  **/
  pause: function(){
    this.paused = true;
  },
  
/** = Description
  * Resumes queue flushing.
  *
  * Use to resume execuption, when some depending code for the rest
  * of the queue has been loaded.
  * Typically on an +XMLHttpRequest+ +onSuccess+ event.
  *
  **/
  resume: function(){
    this.paused = false;
    this.flush();
  },
  
/** A Group of localizable strings; errors and warnings.
  **/
  STRINGS: {
    ERR: 'COMM.Queue Error: ',
    JS_EXEC_FAIL: 'Failed to execute the Javascript function: ',
    REASON: ' Reason:'
  },

/** Basic queue item exception reporter. Override with your own, if needed.
  **/
  clientException: function( _exception, _item ){
    var
    _strs = this.STRINGS,
    _errorText = [
      _strs.ERR_PREFIX,
      _strs.JS_EXEC_FAIL,
      _exception.name+'->'+_exception.message,
      _strs.REASON,
      _exception
    ].join('');
    console.log( _errorText );
    return _errorText;
  },
  
/** = Description
  * Flushes the queue until stopped.
  *
  * Iterates through the +commandQueue+ and calls each function.
  * Removes items from the queue after execution.
  *
  **/
  flush: function(){
    var i = 0, // current index in the for-loop.
        _item, // the current item to execute
        _function, // the function to run
        _arguments, // the arguments of the function
        _len = this.commandQueue.length; // the length of the queue
    
    // Iterates through the items.
    for(;i<_len;i++){
      
      // Checks that the queue hasn't been paused.
      if(this.paused){
        break; // stops flushing, if paused.
      }
      
      // The first item in the queue is removed from the queue.
      _item = this.commandQueue.shift();
      
      // Execute the item, with arugments if the item
      try{
        if(typeof _item === 'function'){
          _item.call();
        }
        else {
          _function = _item[0];
          _arguments = _item[1];
          _function.apply(this,_arguments);
        }
      }
      
      // Displays an error message in the Javascript console, if failure.
      catch(e){
        this.clientException( e, _item );
      }
    }
  },
  
/** = Description
  * Adds an item to the beginning of the queue.
  *
  * Use to make the given +_function+ with its 
  * optional +_arguments+ the next item to flush.
  *
  * = Parameters:
  * +_function+::  An anonymous function. Contains the code to execute.
  *
  * +_arguments+:: _Optional_ arguments to pass on to the +_function+
  **/
  unshift: function(_function,_arguments){
    if(_arguments!==undefined){
      this.commandQueue.unshift([_function,_arguments]);
    }
    else {
      this.commandQueue.unshift(_function);
    }
  },
  
/** = Description
  * Adds an item to the end of the queue.
  *
  * Use to make the given +_function+ with its 
  * optional +_arguments+ the last item to flush.
  *
  * = Parameters:
  * +_function+::  An anonymous function. Contains the code to execute.
  *
  * +_arguments+:: _Optional_ arguments to pass on to the +_function+
  **/
  push: function(_function,_arguments){
    if(_arguments!==undefined){
      this.commandQueue.push([_function,_arguments]);
    }
    else {
      this.commandQueue.push(_function);
    }
  },
  
/** Like +unshift+, but uses the code block as a string to be
  * passed on as an evaluated anonymous function.
  **/
  unshiftEval: function(_evalStr,_arguments){
    var _function;
    eval('_function = function(){'+_evalStr+'}');
    this.unshift(_function);
  },
  
/** Like +push+, but uses the code block as a string to be
  * passed on as an evaluated anonymous function.
  **/
  pushEval: function(_evalStr){
    var _function;
    eval('_function = function(){'+_evalStr+'}');
    this.push(_function);
  }
}).nu();
