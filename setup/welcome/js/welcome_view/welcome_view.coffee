###
The sheet is used as the main visual container for the gui in this app.
HSheet is an component that dims the background and shows a dialog sheet
while its value is 0. ###
WelcomeView = HSheet.extend
  
  ###
  The extended refreshValue method that terminates its application,
  including all the subviews. It's triggered when the value becomes 1,
  as a result of the "Close" -button being clicked. ###
  refreshValue: ->
    @base()
    @app.die() if @value == 1

  ###
  The drawSubviews is a method to extend, if you want to draw items,
  when construction is completed. ###
  drawSubviews: ->
    @base()
    ###
    The values hash is set in the gui.yaml file for value id references
    of the session-specific plugin values. ###
    _values = @options.values

    ###
    A button in the lower right corner of the HSheet that triggers
    destruction of this application (see WelcomeView#refreshValue) ###
    HClickButton.new( [ null, null, 60, 24, 8, 8 ], @,
      bind: _values.close
      label: 'Close'
    )

    ###
    A Check Box in the lower right corner of the HSheet that triggers
    an server action to disable the whole plugin when combined with
    the close button's value. ###
    HCheckbox.new( [ null, null, 130, 24, 74, 8 ], @,
      bind: _values.dont_show_again
      label: "Don't show again"
    )

    ###
    See welcome_scrollcontainer.coffee for details of this one.
    The rectangle stretches the component to contain all of the parent's
    space except the bottom-most 42 pixels and the minimum size
    of 550 by 300 pixels. ###
    WelcomeScrollContainer.new( [ 0, 0, 550, 300, 0, 42 ], @,
      scrollX: false  # Disables horizontal scroll bars.
      scrollY: 'auto' # Makes vertical scroll bars appear
                      # automatically, when needed.
      # Custom additional styling using style properties:
      style:
        backgroundColor: 'white'
        borderBottom: '1px solid black'
    )
