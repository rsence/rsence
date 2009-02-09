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

RSampler.SamplerWindow = {
  
  createWindow: function() {
    this.window = HWindow.nu(
      HRect.nu(100,101,740,501),
      this, {
        label: 'Component Sampler',
        minSize: [420,320],
        maxSize: [800,600],
        resizeW: 3,
        resizeE: 3,
        resizeN: 3,
        resizeS: 3,
        closeButton: true,
        collapseButton: true,
        zoomButton: true
      }
    );
    
    this.window.windowClose = function() {
      this.animateTo(HRect.nu(this.app.createWindowButton.origRect),300);
    };
    
    this.window.onAnimationEnd = function() {
      this.app.createWindowButton.restoreButton();
      this.die();
    };
    
    this.createTabs();
    
  }
  
};

