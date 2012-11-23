###
This custom HScrollView contains a number of subviews that are inside
its scrollbars (if the inner content area is bigger than the outer
dimensions of HScrollView itself). ###
WelcomeScrollContainer = HScrollView.extend

  ###
  Subviews of the HScrollView; items inside are displayed
  inside the scrollbars. ###
  drawSubviews: ->
    @base()
    ###
    The HInlineView is a simple HTML container, designed
    to contain "flowing layout" html. ###
    HInlineView.new( [ 0, 0, null, null, 0, 0 ], @,
      ###
      See the gui_params method of welcome.rb to understand how the
      contents of the text/welcome.html files is linked like this. ###
      html: @parent.options.welcomeText
      style:
        fontFamily: 'Helvetica, Arial, sans-serif'
        fontSize: '16px'
        lineHeight: '20px'
    )

    # The RSence logo image:
    HImageView.extend(
      click: ->
        console.log 'clicked'
        location.href="http://rsence.org/"
    ).new( [ 20, 10, 559, 110 ], @,
      # Images use the value as the URL of the image.
      value: 'http://rsence.org/rsence_org_logo.gif'
      scaleToFit: false
      events:
        click: true
    )
