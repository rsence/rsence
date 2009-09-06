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

RSampler.SamplerIntro = {
  createIntroTabContents: function(){
    /*
    
    Here, you might already follow the pattern.
    
    HStringView is a component that displays its
    value as text or html markup. Its label appears
    as a tooltip unless it's set as an empty string.
    
    Its value could be omitted in the construction
    options and will be displayed only very briefly,
    see below why.
    
    */
    this.introText = (HStringView.extend({
      flexRight:  true,  flexRightOffset:  8,
      flexBottom: true,  flexBottomOffset: 8
    })).nu(
      HRect.nu(8,8,16,16),
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
    _introHTML += "<b>Welcome to Riassence Core Component Sampler!</b><br /><br />";
    _introHTML += "This a simple showcase displaying standard components.<br /><br />";
    _introHTML += "You may already have noticed the <b><code>HWindow</code></b> -component.<br />";
    _introHTML += "Its purpose is to be a draggable and resizable container for other components.<br /><br />";
    _introHTML += "Another is this <b><code>HStringView</code></b> -component.<br />";
    _introHTML += "Its purpose is to display text (just like this text) as its value.<br /><br />";
    _introHTML += "Use the <b><code>HTab</code></b> -component above to reveal more components.<br />";
    this.introText.setValue(_introHTML);
  }
};

