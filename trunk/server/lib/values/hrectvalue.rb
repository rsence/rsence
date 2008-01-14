###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies Inc.
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

class HRectValueParser
  def handle( msg, hrect_xml )
    hsyncvalues = msg.hsyncvalues
    hrect = {:id=>nil,:int_id=>false,:order=>nil,:left=>-1,:top=>-1,:bottom=>-1,:right=>-1}
    hrect[:id] = hrect_xml.attributes['id']
    if hrect[:id] == hrect[:id].to_i.to_s
      hrect[:int_id] = true
      hrect[:id].to_i!
    end
    hrect[:order]  = hrect_xml.attributes['order'].to_i
    hrect[:left]   = hrect_xml.elements['left'].text.to_i
    hrect[:top]    = hrect_xml.elements['top'].text.to_i
    hrect[:right]  = hrect_xml.elements['right'].text.to_i
    hrect[:bottom] = hrect_xml.elements['bottom'].text.to_i
    if hrect[:int_id]
      hsyncvalues[:rects   ].push(hrect)
    else
      hsyncvalues[:commands].push(hcolor)
    end
  end
end