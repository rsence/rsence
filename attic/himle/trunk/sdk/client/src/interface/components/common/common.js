
// ff version 3.0.3 fails on this, when firebug installed: try/catch block
try {

// console.log surrogate for browsers without a console
if(window['console']===undefined){
  console = {
    log: function(){
    }
  };
}


} catch(e) {}


