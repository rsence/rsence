##   RSence
 #   Copyright 2008-2011 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

# The default locale settings, may be overridden on the server.
HLocale.components.HUploader =
  strings:
    ok: 'OK'
    stateLabels:
       # Upload success states:
       '0': "Select file...",
       '1': "Uploading...",
       '2': "Processing data...",
       '3': "Upload Complete",
       '4': "Preparing upload",
       # Upload failure states:
       '-1': "Error: Invalid request",
       '-2': "Error: Invalid upload key",
       '-3': "Error: Invalid data format",
       '-4': "Error: File too big",
       '-6': "Error: Post-processing failed"

HUploader = HControl.extend
  componentName: 'uploader'
  uploadState: false
  uploadKey: false
  markupElemNames: [
    'form',
    'file',
    'iframe',
    'upload_progress',
    'progress_label',
    'progress_indicator',
    'button',
    'button_label',
    'value',
    'ack_button'
  ]

  defaultEvents:
    click: true
  
  setUploadKey: (_uploadKey, _label)->
    @setStyleOfPart( 'upload_progress', 'visibility', 'hidden' )
    @setStyleOfPart( 'progress_indicator', 'visibility', 'hidden' )
    @setStyleOfPart( 'ack_button', 'visibility', 'hidden' )
    @setMarkupOfPart( 'button_label', _label )
    @setStyleOfPart( 'button', 'visibility', 'inherit' )
    @setStyleOfPart( 'form', 'visibility', 'inherit' )
    @setAttrOfPart( 'form', 'action', '/U/'+_uploadKey, true )
    @setAttrOfPart( 'file', 'value', '', true )
    @uploadKey = _uploadKey
  
  setProgressState: (_state, _label)->
    @setStyleOfPart( 'upload_progress', 'visibility', 'inherit' )
    if _state == 3
      @setStyleOfPart( 'progress_indicator', 'visibility', 'hidden' )
      @setStyleOfPart( 'ack_button', 'visibility', 'inherit' )
    else
      @setStyleOfPart( 'progress_indicator', 'visibility', 'inherit' )
      @setStyleOfPart( 'ack_button', 'visibility', 'hidden' )
    @setMarkupOfPart( 'progress_label', _label )
    @setStyleOfPart( 'button', 'visibility', 'hidden' )
    @setStyleOfPart( 'form', 'visibility', 'hidden' )
    if _state == 1
      @elemOfPart( 'form' ).submit()
  
  setErrorState: (_label)->
    @setStyleOfPart( 'progress_indicator', 'visibility', 'hidden' )
    @setStyleOfPart( 'ack_button', 'visibility', 'inherit' )
    @setMarkupOfPart( 'progress_label', '<span style="color:red;">'+_label+'</span>' )
    @setStyleOfPart( 'button', 'visibility', 'hidden' )
    @setStyleOfPart( 'form', 'visibility', 'hidden' )

  setUploadState: (_state, _uploadKey)->
    if _state != @uploadState
      @uploadState = _state
      _stateKey = _state.toString()
      _stateLabels = HLocale.components.HUploader.strings.stateLabels
      if _stateLabels[_stateKey]?
        _label = _stateLabels[_stateKey]
        ELEM.get(@markupElemIds.value).value = @valueObj.id
        if _state == 0
          @setUploadKey( _uploadKey, _label )
        else if _state >= 1 and _state <= 4
          @setProgressState( _state, _label )
        else if _state < 0
          @setErrorState( _label )
  
  refreshValue: ->
    return unless typeof @value == 'string'
    return if @value.indexOf(':::') == -1
    _stateAndKey = @value.split(':::')
    return unless _stateAndKey.length == 2
    @setUploadState(
      parseInt( _stateAndKey[0], 10),
      _stateAndKey[1]
    )
  upload: ->
    @setValue( '1:::'+@uploadKey )
  
  getNewUploadKey: ->
    @setValue( '4:::'+@uploadKey )
  
  click: ->
    @getNewUploadKey() if @uploadState == 3 or @uploadState < 0
