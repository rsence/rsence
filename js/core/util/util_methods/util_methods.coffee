UtilMethods = (->
  _classBase =
    arrIncludes: (_arr,_what)->
      _arr.indexOf(_what) != -1

    # List of primitive object type's chars
    _builtinTypeChr: [
      'b' # boolean
      'n' # number
      's' # string
    ]

    getValueById: (_id)->
      COMM.Values.values[_id]

    ###
    # Returns object type as a single-char string.
    # Use this method to detect the type of the object given.
    #
    # Returns the type of the object given as a character code. Returns false,
    # if unknown or unsupported objcet type.
    #
    # Returns:
    # _One of the following:_
    # - 'a': Array
    # - 'h': Hash (Generic Object)
    # - 'd': Date
    # - 'b': Boolean (true/false)
    # - 'n': Number (integers and floats)
    # - 's': String
    # - '~': Null
    # - '-': Undefined
    # - false: unknown
    ###
    typeChr: (_obj)->
      return '~' if _obj == null
      return '-' unless _obj?
      _typeChr = (typeof _obj).slice(0,1)
      return _typeChr if @arrIncludes(@_builtinTypeChr,_typeChr)
      if _typeChr == 'o'
        return 'a' if _obj.constructor == Array
        return 'h' if _obj.constructor == Object
        return 'd' if _obj.constructor == Date
      return false

    baseStrToNum: (_str, _base)->
      return null if 's' != @typeChr(_str)
      _base = 10 unless _base?
      parseInt(_str, _base)

    baseNumToStr: (_num, _base)->
      return null if 'n' != @typeChr(_num)
      _base = 10 unless _base?
      _num.toString(_base)

    hexToNum: (_hex)->
      @baseStrToNum(_hex,16)

    numToHex: (_int)->
      @baseNumToStr(_int,16)

    base36ToNum: (_base36)->
      @baseStrToNum(_base36,36)
    
    numToBase36: (_num)->
      @baseIntToStr(_num,36)
    
    _hexColorLengths: [3,4,6,7]
    _hexCharacters: ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']
    _hex3To6Ratio: 4097 # parseInt('1001',16)
    _normalizeHexColorToNum: (_color)->
      return null if @typeChr(_color) != 's'
      _hexLen = _color.length
      return null unless @arrIncludes(@_hexColorLengths,_hexLen)
      _color = _color.toLowerCase()
      _str = ''
      for _chr, i in _color.split('')
        continue if i == 0 and _chr == '#' and ( _hexLen == 4 or _hexLen == 7 )
        return null unless @arrIncludes( @_hexCharacters, _chr )
        _str += _chr
      _num = @hexToNum( _str )
      _num = 0 if _num < 0
      _num = 16777215 if _num > 16777215
      _num = _num*@_hex3To6Ratio if _hexLen < 6
      return _num
    _normalizeNumToHexColor: (_num)->
      _num = 0 if _num < 0
      _num = 16777215 if _num > 16777215
      _str = @numToHex(_num)
      _str = '0'+_str until _str.length == 6
      if _str[0] == _str[1] and _str[2] == _str[3] and _str[4] == _str[5]
        _str = _str[0]+_str[2]+_str[4]
      return '#'+_str

    hexColorAdd: (_hex1,_hex2)->
      @_normalizeNumToHexColor(
        @_normalizeHexColorToNum(_hex1) +
        @_normalizeHexColorToNum(_hex2)
      )

    hexColorSubtract: (_hex1,_hex2)->
      @_normalizeNumToHexColor(
        @_normalizeHexColorToNum(_hex1) -
        @_normalizeHexColorToNum(_hex2)
      )

    # Regular expression match/replace pairs for string escaping.
    _stringSubstitutions: [
      [(/\\/g), '\\\\'],
      #[(/\b/g), '\\b'],
      [(/\t/g), '\\t'],
      [(/\n/g), '\\n'],
      [(/\f/g), '\\f'],
      [(/\r/g), '\\r'],
      [(/"/g),  '\\"']
    ]
    # Returns a quoted string (escapes quotation marks and places quotes within)
    _quoteString: (_str)->
      for _substitution in @_stringSubstritutions
        [ _substFrom, _substTo ] = _substitution
        _str = _str.replace( _substFrom, _substTo )
      '"'+_str+'"'
    # (Deprecated/shouldfix): Encodes the native character set to url-encoded unicode.
    _encodeString: (_str)->
      console.log 'WARNING: '+'_'+'encodeString shouldn\'t be called, but was called with: '+_str
      unescape( encodeURIComponent( _str ) )
    # (Deprecated/shouldfix): Decodes the url-encoded unicode _str to the native character set.
    _decodeString: (_str)->
      console.log 'WARNING: '+'_'+'decodeString shouldn\'t be called, but was called with: '+_str
      try
        return decodeURIComponent( escape( _str ) )
      catch e
        console.log('_'+'decodeString failed for _'+'str: ',_str)
        return _str
    # Returns a decoded Array with the decoded content of Array _arr
    _decodeArr: (_arr)->
      _output = []
      for _item in _arr
        _output.push @decodeObject(_item)
      _output
    # Returns a decoded Object of the Object _hash
    _decodeHash: (_hash)->
      _output = {}
      for _key, _value of _hash
        _output[@decodeObject(_key)] = @decodeObject(_value)
      _output
    ## = Description
     # Decodes a JSON object. Decodes the url-encoded strings within.
     # 
     # = Parameters
     # +_ibj+::  A raw object with special characters contained.
     # 
     # = Returns
     # A version of the object with the contained strings decoded to unicode.
     # 
     ##
    decodeObject: (_obj)->
      return null unless _obj?
      _type = @typeChr(_obj)
      unless _type
        console.log 'WARNING: decode of '+(typeof _obj)+' not possible'
        return null
      # return @_decodeString(_obj) if _type == 's'
      return @_decodeArr(_obj) if _type == 'a'
      return @_decodeHash(_obj) if _type == 'h'
      _obj
  if window.JSON?
    _JSON = window.JSON
    _fun = 'function'
    _hasJSON = ( typeof _JSON['parse'] == _fun and typeof _JSON['stringify'] == _fun )
  else
    _hasJSON = false
  if _hasJSON
    _encodeDecodeMethods =
      encodeObject: (_obj)->
        try
          return JSON.stringify( _obj )
        catch e
          console.log('invalid json:',_obj)
          return "{}"
      
      # decodeObject: (_obj)->
      #   return null unless _obj?
      #   _type = @typeChr(_obj)
      #   unless _type
      #     console.log 'WARNING: decode of '+(typeof _obj)+' not possible'
      #     return null
      #   return @_decodeString(_obj) if _type == 's'
      #   if _type == 'a' or _type == 'h'
      #     try
      #       return JSON.parse(_obj)
      #     catch e
      #       console.log e, _obj
      #   _obj
      
      cloneObject: ( _obj )->
        unless _obj?
          console.log 'WARNING: clone of undefined returns null.' if _obj == undefined
          return null
        _type = @typeChr(_obj)
        return null unless _type
        return JSON.parse( JSON.stringify(_obj) ) if _type == 'a' or _type == 'h'
        _obj
  else
    _encodeDecodeMethods =
      # Returns the Array _arr as an encoded string
      _encodeArr: (_arr)->
        _output = []
        for _item in _arr
          _output.push @encodeObject(_item)
        '['+_output.join(',')+']'
      # Returns the Object _hash as an encoded string
      _encodeHash: (_hash)->
        _output = []
        for _key, _value of _hash
          _output.push @encodeObject(_key)+':'+@encodeObject(_value)
        '{'+_output.join(',')+'}'
      ## = Description
       # Encodes any object into an ASCII string. Special characters are url-encoded.
       # 
       # = Parameters
       # +_obj+::  Any object (including primary types)
       # 
       # = Returns
       # A +String+ representation of +_obj+
       ##
      encodeObject: (_obj)->
        return 'null' unless _obj?
        _type = @typeChr(_obj)
        unless _obj
          console.log 'WARNING: encode of '+(typeof _obj)+' not possible'
          return 'null'
        return String(_obj) if _type == 'b' or _type == 'n'
        return @_quoteString(_obj) if _type == 's'
        # The above with uri-encoding, disabled for now:
        # return @_quoteString( @_encodeString( _obj ) )
        return @_encodeArr(_obj) if _type == 'a'
        return @_encodeHash(_obj) if _type == 'h'
        return '"@'+String(_obj.getTime()/1000)+'"' if _type == 'd'
        'null'
      ## = Description
       # Makes a deep copy of the object.
       # 
       # When you use assignment of a js object, only primitive object
       # types (strings, numbers and booleans) are copied. This method
       # makes a deep (nested) clone of the input object.
       # 
       # = Parameters
       # +_obj+:: Any object
       # 
       # = Returns
       # A copy of the object
       ##
      cloneObject: (_obj,_shallow)->
        unless _obj?
          console.log 'WARNING: clone of undefined returns null.' if _obj == undefined
          return null
        _type = @typeChr(_obj)
        if _type == 'a'
          _cloned = []
          if _shallow
            for _item, i in _obj
              _cloned[i] = _item
          else
            for _item, i in _obj
              _cloned[i] = @cloneObject( _item )
          return _cloned
        else if _type == 'h'
          _cloned = {}
          if _shallow
            for _key, _value of _obj
              _cloned[_key] = _value
          else
            for _key, _value of _obj
              _cloned[_key] = @cloneObject( _item )
          return _cloned
        _obj
  for _methodName, _methodValue of _encodeDecodeMethods
    _classBase[_methodName] = _methodValue
  return HClass.extend(_classBase)
)()
