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

RSampler.SamplerTabs = {
  createTabs: function() {
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
    this.tabs = HTab.extend({
        flexRight: true,
        flexBottom: true,
        flexRightOffset: 16,
        flexBottomOffset: 16
    }).nu(
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
    
    this.createIntroTabContents();
    
    
    this.buttonsTab  = this.tabs.addTab('Buttons');
    
    this.createButtonsTabContents();
    
    
    this.textTab     = this.tabs.addTab('Text');
    this.numericTab  = this.tabs.addTab('Numeric');
    
    this.createNumericTabContents();
    
    
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
    this.values.main_tabs.bind( this.tabs );
  }
};

