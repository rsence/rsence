UtilMethods = HClass.extend
  
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
    return '-' unless _obj?
    return '~' if _obj == null
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
