/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

/*** class: HThemeManager
  **
  ** A single instance class.
  **
  ** The theme manager knows the name of the currently loaded theme and handles
  ** the loading of theme specific markup snippets and style declarations.
  **
  ** vars: Instance variables
  **  themePath - Relative path to the components' top directory. 
  **  currentTheme - The name of the theme currently in use. Initially the
  **    default unnamed theme is used.
  **  usesComponentDir - True when the components are separated in their own
  **    directories, usually when using the source/development version. False
  **    when the components are all in same directory. This is the case in the
  **    release build.
  **
  ** See also:
  **  <HView> <HMarkupView>
  ***/

HDefaultThemePath = '/H/themes';
HDefaultThemeName = 'default';
HNoComponentCSS = [];
HThemeHasIE6GifsInsteadOfPng = [];

/** HDefaultThemeMode:
  *
  *  0 = Pre-built mode
  *  1 = Post-built mode
  *
  */
HThemeMode = 1;

HThemeManager = HClass.extend({
  
  constructor: null,
  
  init: function(){
    
    // Default root path of the themes path, should contain at least the default theme.
    this.themePath = HDefaultThemePath;
    
    // Hash map of loaded template markup (html templates), by theme.
    // componentName is used as the secondary key.
    this._tmplCache = {};
    
    // Hash map of loaded css templates, by theme.
    // componentName is used as the secondary key.
    this._cssCache = {};
    
    // The currently selected default theme name.
    this.currentTheme = HDefaultThemeName;
  },
  
  setThemePath: function( _path ){
    this.themePath = _path;
  },
  
  // Error messages, should be refined.
  _errTemplateNotFound: function( _url ) {
    console.log( "ERROR: Template Not Found: '" + _url + "' ");
  },
  _errTemplateFailure: function( _url ) {
    console.log( "ERROR: Template Failure: '" + _url + "' ");
  },
  _errTemplateException: function( _url ) {
    console.log( "ERROR: Template Exception: '" + _url + "' ");
  },
  
/** method: fetch
  *
  * Loads a template file and returns its contents.
  * If errors occurred, calls the error management functions.
  *
  * Parameters:
  *  _url - A valid local file path or http url pointing to the resource to load.
  *  _contentType - An optional parameter, specifies the content type wanted, defaults to text/html.
  *
  * Returns:
  *  The contents of the path.
  */
  fetch: function( _url, _contentType ) {
    var _result;
    if( !_contentType ){
      var _contentType = 'text/html; charset=UTF-8';
    }
    var _req = new Ajax.Request(_url, {
      method:    'GET',
      
      onSuccess: function( _xhr ) {
        _result   = _xhr.responseText;
      },
      
      on404:        function(){ HThemeManager._errTemplateNotFound(  _url ); },
      onFailure:    function(){ HThemeManager._errTemplateFailure(   _url ); },
      onException:  function(){ HThemeManager._errTemplateException( _url ); },
      
      asynchronous: false,
      contentType:  _contentType
    });
    
    _req.onStateChange();
    
    return _result;
  },
  
  
/** method: getThemeGfxPath
  *
  * Returns the theme/component -specific path, called from inside css
  * themes, a bit kludgy approach to tell the theme grapics file paths. 
  */
  getThemeGfxPath: function() {
    var _themeName      = this._cssEvalParams[0],
        _componentName  = this._cssEvalParams[1],
        _themePath      = this._cssEvalParams[2],
        _pkgName        = this._cssEvalParams[3],
        _urlPrefix      = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    return this._joinPath( _urlPrefix, 'gfx' );
  },
  
/** method: getCssFilePath
  *
  * Returns the theme/component -specific graphics file path with proper css wrappers.
  * Used from inside css themes, a bit kludgy approach to tell the file name path.
  *
  * Parameters:
  *  _fileName - The File name to load.
  *
  */
  getCssFilePath: function( _fileName ){
    var _themeName      = this._cssEvalParams[0];
    if((HThemeHasIE6GifsInsteadOfPng.indexOf(_themeName)!=-1) && ELEM._is_ie6){
      return "url('"+this._joinPath( this.getThemeGfxPath(), _fileName.replace('.png','-ie6.gif') )+"')";
    }
    else {
      return "url('"+this._joinPath( this.getThemeGfxPath(), _fileName )+"')";
    }
  },
  
/** method: loadCSS
  *
  * Loads a css file based on the given url (or file path).
  * Evaluates the css data.
  * Makes sure the browser uses the data for component styles.
  *
  * Parameter:
  *  _url - A valid url that points to a valid css file.
  *
  * Returns:
  *  The source of the url.
  */
  loadCSS: function( _url ) {
    var _contentType = 'text/css';
    var _cssText = this.fetch( _url, _contentType );
    
    // Don't try to do anything with empty or invalid css data:
    if (!_cssText || _cssText == "") {
      return;
    }
    
    // Evaluate the css text
    _cssText = this._bindCSSVariables( _cssText );
    
    var _style, _styleSheet, _head;
    
    if(ELEM._is_ie) {
      // Internet Explorer (at least 6.x; check what 7.x does)
      _style         = document.createStyleSheet();
      _style.cssText = _cssText;
    }
    
    else {
      // Common, standard <style> tag generation in <head>
      _style        = document.createElement( "style" );
      _style.type   = _contentType;
      _style.media  = "all";
      
      _head = document.getElementsByTagName('head')[0];
      _head.appendChild(_style);
      
      if (navigator.userAgent.indexOf('KHTML') != -1) {
        // Work-around for safari
        var _cssTextElement = document.createTextNode(_cssText);
        _style.appendChild(_cssTextElement);
      }
      else {
        // This works for others (add more checks, if problems with new browsers)
        _style.innerHTML = _cssText;
      }
    }
  },
  
  _addSlash: function( _str ){
    if( _str[ _str.length-1 ] != '/' ){
      _str += '/';
    }
    return _str;
  },
  
  _joinPath: function( _str1, _str2 ){
    return this._addSlash( _str1 ) + _str2;
  },
  
  // Makes a common url prefix for template files
  _urlPrefix: function( _themeName, _componentName, _themePath, _pkgName ) {
    
    var _path = _themePath;
    
    // Usually null
    if( _themePath === null ) {
      _path = this.themePath;
    }
    
    // Pre-Build Path Format
    if( HThemeMode == 0 ) {
      if( _pkgName ){
        _path = this._joinPath( _path, _pkgName );
      }
      // When using a component specific theme path, skip the standard directory
      // structure and use the path directly.
      if( _themePath === null ) {
        _path = this._joinPath( _path, _componentName );
        _path = this._joinPath( _path, 'themes' );
      }
      _path = this._joinPath( _path, _themeName );
    }
    
    // Post-Build Path Format
    else if( HThemeMode == 1 ) {
      _path = this._joinPath( _path, _themeName );
    }
    
    return _path;
  },
  
  // Makes a valid css template url
  _cssUrl: function( _themeName, _componentName, _themePath, _pkgName ) {
    this._cssEvalParams = [_themeName, _componentName, _themePath, _pkgName];
    var _cssPrefix = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    var _cssSuffix = this._joinPath( 'css', _componentName+'.css' );
    var _cssUrl = this._joinPath( _cssPrefix, _cssSuffix );
    return _cssUrl;
  },
  
  // Makes a valid html template url
  _markupUrl: function( _themeName, _componentName, _themePath, _pkgName ) {
    var _htmlPrefix = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    var _htmlSuffix = this._joinPath( 'html', _componentName+'.html' );
    var _htmlUrl = this._joinPath( _htmlPrefix, _htmlSuffix );
    return _htmlUrl;
  },
  
/** method: loadMarkup
  *
  * Loads HTML templates of components. Handles caching independently and intelligently.
  *
  * Parameters:
  *  _themeName     - The name of the template to use.
  *  _componentName - The name of the component template (css/html) to load.
  *  _themePath     - (Optional) parameter to override the global theme path.
  *  _pkgPath       - (Optional) parameter to specify the package of the component, useful only in pre-built mode.
  *
  * Returns:
  *  The Pre-Evaluated HTML Template.
  *
  **/
  loadMarkup: function( _themeName, _componentName, _themePath, _pkgName ) {
    if( !this._tmplCache[_themeName] ){
      this._tmplCache[_themeName] = {};
    }
    var _cached = this._tmplCache[_themeName][_componentName];
    
    if (null === _cached || undefined === _cached) { 
      var _markupUrl = this._markupUrl( _themeName, _componentName, _themePath, _pkgName );
      _cached = this.fetch( _markupUrl );
      // Save an empty string to template cache to prevent repeated failing
      // requests.
      if (null === _cached || undefined === _cached) {
        _cached = "";
      }
      this._tmplCache[_themeName][_componentName] = _cached;
    }
    return _cached;
  },
  
/** method: getMarkup
  *
  * Loads CSS and HTML templates of components. Called from <HView._loadMarkup>.
  * Returns the HTML Template as text.
  * Manages file caches independently and intelligently.
  *
  * Parameters:
  *  _themeName     - The name of the template to use.
  *  _componentName - The name of the component template (css/html) to load.
  *  _themePath     - (Optional) parameter to override the global theme path.
  *  _pkgPath       - (Optional) parameter to specify the package of the component, useful only in pre-built mode.
  *
  * Returns:
  *  The Pre-Evaluated HTML Template.
  *
  **/
  getMarkup: function( _themeName, _componentName, _themePath, _pkgName ) {
    
    /* Load Theme-Specific CSS: */
    if (!this._cssCache[_themeName]){
      var _commonCssUrl = this._cssUrl( _themeName, 'common', _themePath, null );
      this._cssCache[_themeName] = {};
      this.loadCSS( _commonCssUrl );
    }
    
    /* Load Component-Specific CSS, unless configured to only load the common css: */
    if(HNoComponentCSS.indexOf(_themeName)==-1){
      //console.log('HNoComponentCSS:',HNoComponentCSS,',  indexOf:',HNoComponentCSS.indexOf(_themeName),',  themeName:',_themeName, ',  componentName:', _componentName, ',  themePath:',_themePath,',  pkgName:',_pkgName);
      if (!this._cssCache[_themeName][_componentName]){
        var _componentCssUrl = this._cssUrl( _themeName, _componentName, _themePath, _pkgName );
        this._cssCache[_themeName][_componentName] = true;
        this.loadCSS( _componentCssUrl );
      }
    }
    
    /* Load/Return Component-Specific HTML: */
    return this.loadMarkup( _themeName, _componentName, _themePath, _pkgName );
  },
  
  
/** method: _componentGfxPath
  *
  * Called via HView to determine the valid path prefix to aid
  * finding theme- and component-specific image files.
  *
  * Returns:
  *   A valid path, for example: '/helmi/themes/helmiTheme/gfx/'
  *
  **/
  _componentGfxPath: function( _themeName, _componentName, _themePath, _pkgName ) {
    var _urlPrefix      = this._urlPrefix( _themeName, _componentName, _themePath, _pkgName );
    var _url = this._joinPath( _urlPrefix, 'gfx' );
    return _url;
  },
  _componentGfxFile: function( _themeName, _componentName, _themePath, _pkgName, _fileName ){
    if((HThemeHasIE6GifsInsteadOfPng.indexOf(_themeName)!=-1) && ELEM._is_ie6){
      return this._joinPath( this._componentGfxPath(_themeName, _componentName, _themePath, _pkgName), _fileName.replace('.png','-ie6.gif') );
    }
    return this._joinPath( this._componentGfxPath(_themeName, _componentName, _themePath, _pkgName), _fileName );
  },
  
  
  getThemeGfxFile: function( _fileName ) {
    
    return this.getThemeGfxPath() + _fileName;
    
  },
  
  
/** method: setTheme
  * 
  * Sets the active theme.
  * 
  * Parameters:
  *  _theme - The name of the theme to be set as the active theme.
  *
  **/
  setTheme: function(_theme) {
    this.currentTheme = _theme;
  },
  
/** method: restoreDefaultTheme
  *
  * Sets the default theme ( HDefaultTheme ) to be the active theme.
  **/
  restoreDefaultTheme: function() {
    this.setTheme( HDefaultThemeName );
  },
  
/** regexp: _variable_match
  *
  * A regular expression to match the template evaluation syntax: #{stuff_to_evaluate}
  **/
  _variable_match: new RegExp(/#\{([^\}]*)\}/),
  
/** method: _bindCSSVariables
  *
  * Evaluates the _variable_match regular expression for the string _markup.
  *
  * Parameters:
  *  _cssTmpl - The css template file to be evaluated. 
  *
  * Returns:
  *  An evaluated CSS Template.
  **/
  _bindCSSVariables: function( _cssTmpl ) {
    while ( this._variable_match.test( _cssTmpl ) ) {  
      _cssTmpl = _cssTmpl.replace(  this._variable_match, eval( RegExp.$1 )  );
    }
    return _cssTmpl;
  }
  
});
