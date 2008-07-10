/*

Himle Component Sampler

This demo is a showcase of components and a reference of how to utilize them.

*/


/*

First, we create an Application class by extending
the HApplication class and naming the new class
'ComponentSampler'.

All classes are based on the 'HClass' root class.

*/
ComponentSampler = HApplication.extend({
  
  /*
  
  Next, we create a constructor function, but we call
  functions methods, because that's what they are
  inside classes. Every method shares the 'this' object
  with other methods in the same class instance.
  
  Instances are 'clones' of the class they are created
  from by using the 'new' keyword. The stuff inside
  the parenthesis are called arguments. In the case
  of the constructor, these arguments are used when
  a new instance is created like:
  
  var valueIds = {main_tabs:'abcdef',...};
  var componentSampler = new ComponentSampler(valueIds);
  
  After that, any method and instance variable can be
  accessed by using the instance's name and the member's
  name delimitted with a period, for instance:
  
  componentSampler.tabs.selectTab(2);
  
  */
  constructor: function(_valueIds){
    
    /*
    
    The constructor of HApplication initializes the stuff
    that makes an App. To call a similarly named method in
    the class extended from, the special "supermethod"
    'this.base()' can be called. This is what we start with,
    because components require at least an application or
    another component as its parent and it would not be
    possible to do that unless the basics of the application
    itself doesn't exist yet.
    
    */
    this.base();
    
    /*
    
    Next, we make the only argument of ComponentSampler's
    constructor an instance member. In this case, we name
    it valueIds. The underscore used for local variables
    is just a naming convention to easily differentiate
    global and local members.
    
    */
    this.valueIds = _valueIds;
    
    /*
    
    Then, we create a new instance of 'HWindow'. It's just
    what the name suggest; a window component.
    A HWindow is a draggable and resizable container
    component. It means that you can put other components
    inside of it.
    
    You may notice, that it takes three arguments. The first
    one is the description of its position and size relative
    to the zero-point, or origo, of the web browser's window.
    
    In this case, the HWindow's left edge is 100 pixels from
    the left edge of the web browser's window. Its top edge
    is 101 pixels from the top edge of the browser's window.
    Its right edge is 740 pixels from the browser's left edge.
    Its bottom edge is 501 pixels from the browser's top edge.
    
    Basically this means that it's positioned at coordinates
    100,101 relative to its parent (the browser's window).
    Its size is 640 by 400 pixels.
    
    The second argument is the parent of the component. In
    this case it's the HApplication derived class
    ComponentSampler described above. It's accessed via the
    'this' keyword, meaning that it's the default object
    namespace inside methods.
    
    These two arguments are used similarly in any standard
    component, as you will see below.
    
    The third argument is always optional, the 'options'
    block that contain all other arguments. Some common
    ones are 'label' and 'value'. In this case we are
    setting the label of the 'HWindow' instance
    'this.window' to "Component Sampler". It's displayed
    in the title bar of the HWindow.
    
    */
    this.window = new HWindow(
      new HRect(100,101,740,501),
      this, {
        label: 'Component Sampler'
      }
    );
    
    /*
    
    The next component we create is the tabs containing
    all other components.
    
    You may notice that it's extended, almost like
    this HApplication extension. Any component may
    be extended to extend, replace or change its
    behaviour.
    
    In this case we make the extended 'HTab' instance
    'this.tabs' "follow" the right and bottom edges of
    the parent instance ('this.window' we constructed
    above) at a distance of 16 pixels horizonally and
    16 pixels vertically.
    
    Components have flexLeft and flexTop set to true
    by default, so when we set all edges to flex, the
    width of the component is specified automatically.
    
    That's why the right and bottom coordinates of its
    HRect loses meaning.
    
    Its options block is omitted in this example, but
    could contain parameters such as enabled:false to
    disable it. Disabled components can't receive user
    interaction events.
    
    */
    this.tabs = new (HTab.extend({
        flexRight: true,
        flexBottom: true,
        flexRightOffset: 16,
        flexBottomOffset: 16
      }))(
      new HRect(16,16,116,116),
      this.window
    );
    
    /*
    
    The following calls are specific to the 'HTab'
    component. Each 'addTab' call creates and returns
    a new HTabView used as a parent for other components
    and a makes clickable tab label in the tab header
    used for activation of tabs. The second argument
    is a flag, when true selects the tab created.
    
    */
    this.introTab    = this.tabs.addTab('Intro',true);
    this.buttonsTab  = this.tabs.addTab('Buttons');
    this.textTab     = this.tabs.addTab('Text');
    this.numericTab  = this.tabs.addTab('Numeric');
    this.progressTab = this.tabs.addTab('Progress');
    this.mediaTab    = this.tabs.addTab('Media');
    
    /*
    
    The following uses the 'HValue' instance created
    by the server-side plugin to bind the HTab instance's
    value to itself. This means that the selected tab at
    any time is reported to the server where it's stored
    with session data and is accessible by server-side
    code. More on this later.
    
    */
    var _tabSeletionValue = HVM.values[this.valueIds.main_tabs];
    _tabSelectionValue.bind(this.tabs);
    
    /*
    
    Here, you might already follow the pattern.
    
    HStringView is a component that displays its
    value as text or html markup. Its label appears
    as a tooltip unless it's set as an empty string.
    
    Its value could be omitted in the construction
    options and will be displayed only very briefly,
    see below why.
    
    */
    this.introText = new (HStringView.extend({
      flexRight:  true,  flexRightOffset:  8,
      flexBottom: true,  flexBottomOffset: 8
    }))(
      new HRect(8,8,16,16),
      this.introTab, {
        label: '',
        value: 'Setting the text of the component..'
      }
    );
    
    /*
    
    Here we override the value of the 'this.introText'
    HStringView instance. That's accomplised by using
    the 'setValue' method. All components derived from
    'HControl' responds to setValue.
    
    */
    var _introHTML = '';
    _introHTML += "<b>Welcome to Himle Component Sampler!</b><br /><br />";
    _introHTML += "This a simple showcase displaying standard components.<br /><br />";
    _introHTML += "You may already have noticed the <b><code>HWindow</code></b> -component.<br />";
    _introHTML += "Its purpose is to be a draggable and resizable container for other components.<br /><br />";
    _introHTML += "Another is this <b><code>HStringView</code></b> -component.<br />";
    _introHTML += "Its purpose is to display text (just like this text) as its value.<br /><br />";
    _introHTML += "Use the <b><code>HTab</code></b> -component above to reveal more components.<br />";
    this.introText.setValue(_introHTML);
    
    /*
    
    Next, a bunch of buttons of equal size will be
    constructed. That's why _buttonRect is assigned
    as a 'HRect' "template"
    
    */
    var _buttonRect = new HRect(8,8,168,32);
    
    /*
    
    'HButton' is a component that doesn't really do
    anything by default and its intended usage is to
    be a visual button component destined for usage-
    specific extension.
    
    Its HRect is copied from the template '_buttonRect'.
    
    It's placed inside the 'buttonsTab' tab.
    
    Any component's label default by default to "Untitled".
    To change defaults, change the respective properties
    of 'HComponentDefaults' like:
    
    HComponentDefaults.label = 'No Label';
    HComponentDefaults.visible = false;
    
    */
    this.button1 = new HButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HButton enabled'
      }
    );
    // Uncomment the following line to disable button1:
    //this.button1.setEnabled(false);
    
    // Uncomment the following line to change the label:
    //this.button1.setLabel('Button 1');
    
    /*
    
    Next, we move the template rectangle 180 pixels
    to the right.
    
    */
    _buttonRect.offsetBy(180,0);
    
    /*
    
    This second button has its 'enabled' option turned
    off by default, making it disabled. Disabled means
    it won't respond to user interaction.
    
    */
    this.button2 = new HButton(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HButton disabled',
        enabled: false
      }
    );
    // Uncomment the following line to enable button2:
    //this.button2.setEnabled(true);
    
    /*
    
    HCheckboxes are simple components that just toggle
    their value between true and false when clicked
    and shows visually a checkmark when the value is
    true. This HCheckbox is checked by default, unless
    overridden by the value binding (see below):
    
    */
    _buttonRect.offsetBy(-180,32);
    this.checkbox1 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox',
        value: true
      }
    );
    
    /*
    
    The next line makes the value of the checkbox accessible
    to the server:
    
    */
    HVM.values[this.valueIds.checkbox1].bind(this.checkbox1);
    
    /*
    
    This checkbox is disabled, but checked by default:
    
    */
    _buttonRect.offsetBy(180,0);
    this.checkbox2 = new HCheckbox(
      new HRect(_buttonRect),
      this.buttonsTab, {
        label: 'HCheckbox disabled',
        enabled: false,
        value: true
      }
    );
    HVM.values[this.valueIds.checkbox2].bind(this.checkbox2);
    
    /*
    
    Here we make another copy of the '_buttonRect' and edit
    its properties.
    
    */
    _buttonRect.offsetBy(-180,32);
    var _radioGroupARect = new HRect(_buttonRect);
    _radioGroupARect.setHeight(60);
    _radioGroupARect.setWidth(360);
    _radioGroupARect.offsetBy(-4,-4);
    
    /*
    
    HView is the simples visual component. Its main purpose
    is to contain and group other components, just like
    'HWindow' and 'HTab', but much simpler.
    
    It's completely transparent by default and can't receive
    the options block; it can only take the first two arguments.
    
    All components are derived from HView.
    
    */
    this.radioGroupA = new HView(
      _radioGroupARect,
      this.buttonsTab
    );
    // Comment the next line 
    this.radioGroupA.setStyle('border','1px solid #999');
    
    /*
    
    HRadioButtons are components that are almost like
    HCheckbox, except they don't toggle their value.
    Instead they set it to true when clicked and set
    the previous one to false, effectively making only
    one HRadioButton in the group selected at once.
    
    Use container-components like 'HView' to group
    HRadioButton instances.
    
    */
    var _radioButtonRect = new HRect(_buttonRect);
    _radioButtonRect.offsetTo(4,4);
    this.radiobuttonA1 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A1'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonA2 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A2'
      }
    );
    
    _radioButtonRect.offsetBy(-180,30);
    this.radiobuttonA3 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A3'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonA4 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupA, {
        label: 'HRadiobutton A4 (disabled)',
        enabled: false,
        value: true
      }
    );
    
    /*
    
    An 'HValueMatrix' instance exists as 'valueMatrix' in the container
    component of any HRadioButton instances. It's a very simple value
    receipent that does most of the magic of coordinating the values of
    individual 'HRadioButton' instances in a group.
    
    Its value is the index of the selected 'HRadioButton' and is more
    useful than using the boolean values of each 'HRadioButton'.
    
    It's very similar to the HTab's selected index value.
    
    Here it's bound to a 'HValue' instance to enable server access to it.
    
    */
    HVM.values[this.valueIds.radio_a].bind(this.radioGroupA.valueMatrix);
    
    /*
    
    This is another group of HRadioButtons just like above.
    
    */
    _buttonRect.offsetBy(0,64);
    var _radioGroupBRect = new HRect(_buttonRect);
    _radioGroupBRect.setHeight(60);
    _radioGroupBRect.setWidth(360);
    _radioGroupBRect.offsetBy(-4,-4);
    this.radioGroupB = new HView(
      _radioGroupBRect,
      this.buttonsTab
    );
    this.radioGroupB.setStyle('border','1px solid #999');
    
    var _radioButtonRect = new HRect(_buttonRect);
    _radioButtonRect.offsetTo(4,4);
    this.radiobuttonB1 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B1'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonB2 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B2',
        value: true
      }
    );
    
    _radioButtonRect.offsetBy(-180,30);
    this.radiobuttonB3 = new HRadioButton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B3'
      }
    );
    _radioButtonRect.offsetBy(180,0);
    this.radiobuttonB4 = new HRadiobutton(
      new HRect(_radioButtonRect),
      this.radioGroupB, {
        label: 'HRadiobutton B4 (disabled)',
        enabled: false
      }
    );
    HVM.values[this.valueIds.radio_b].bind(this.radioGroupB.valueMatrix);
    
    
    
  }
});


