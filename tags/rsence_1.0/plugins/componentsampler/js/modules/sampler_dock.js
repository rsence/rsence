/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

/** The SamplerDock module block implements a zooming
*** button to open the sampler window.
**/
RSampler.SamplerDock = {
  
  createDockButtons: function() {
    
    /**  Fairly complex example of how to extend a control
    ***  in-place and construct it right away:
    **/
    
    /*  Allocates the instance (constructed after the extend block)
    **  on left-hand and define extension block on the right-hand side.
    */
    this.createWindowButton = HButton.extend({
      
      /* (Re-)Defines the 'click' method. It's called via the event manager,
      ** whenever the control has focus and is registered as a receipent
      ** of 'click' methods. In this example it's registered upon
      ** construction via the 'events' block in the options block of
      ** the constructor.
      */
      click: function(){
        
        /* Removes event-receiving capabilities
        ** and visually dims the button.
        ** It's re-enabled when the window is closed.
        ** See the 'restoreButton' method.
        */
        this.setEnabled(false);
        
        /* Stores the original coordinates of the button,
        ** to restore its position and size when animating
        ** the window back.
        */
        this.origRect = HRect.nu( this.rect );
        
        /* Starts the animation sequence that animates (morphs) the button
        ** to the coordinates specified in _animRect in 200 milliseconds:
        */
        var _animRect = HRect.nu( 100,101 , 740,501 ); // x1,y1 , x2,y2
        this.animateTo( _animRect, 200 ); // the rect of the window in 200 ms
      },
      
      /* (Re-)Defines the 'onAnimationEnd' method. It's called automatically,
      ** whenever the animation sequence is complete.
      */
      onAnimationEnd: function() {
        
        /* Calls the 'createWindow' method defined in the
        ** sampler_window module.
        ** It creates the main application window into the
        ** space the button animated to.
        */
        this.app.createWindow();
        
        // makes the button invisible
        this.hide();
      },
      
      /** The restoreButton -method restores the button into its
      *** original coordinates, effectively restoring its original
      *** properties. Called when the window is closed.
      **/
      restoreButton: function() {
        
        /* Restores the original position and size.
        */
        this.setRect( this.origRect );
        
        /* Tells the button to restore its enabled
        ** appearance as well as event-receiving
        ** capabilities.
        */
        this.setEnabled( true );
        
        // Makes the button visible.
        this.show();
      }
    
    /* The end of the 'extend' block, beginning of the constructor
    ** parameters (called with the nu class method, an alternative
    ** of the 'new' keyword).
    */
    }).nu(
      
      /* Specifies the position and size of the button.
      ** (8px from the top left corner of the parent viewport)
      */
      HRect.nu(8,8,108,32),
      
      /* The parent, when invoked, is the SamplerApp instance */
      this,
      
      /* The options block specifies the optional, 'extra'
      ** parameters a control can take.
      ** In this case, we specify the label (the text of the button)
      ** as well as telling the button to receive the 'click' event.
      */
      {
        label: 'Start Sampler',
        events: {
          click: true
        }
      }
    );
    
    /* The end of the 'createDockButtons' method. */
  },
  
  /* The createDock -method is called from within
  ** the constructor of the SamplerApp.
  */
  createDock: function(){
    this.createDockButtons();
  }
  
  /* The end of the SamplerDock module block */
};


