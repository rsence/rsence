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
  
class HDateValueParser
  
  def valid?( hdate_xml, time_obj )
    year   = hdate_xml.elements['year'  ].text.to_i
    month  = hdate_xml.elements['month' ].text.to_i
    mday   = hdate_xml.elements['mday'  ].text.to_i
    hour   = hdate_xml.elements['hour'  ].text.to_i
    minute = hdate_xml.elements['minute'].text.to_i
    second = hdate_xml.elements['second'].text.to_i
    return time_obj.to_i == Time.gm( year, month, mday, hour, minute, second ).to_i
  end
  
  def handle( msg, hdate_xml )
    hsyncvalues = msg.hsyncvalues
    hdate = {:id=>nil,:int_id=>false,:order=>nil,:value=>Time.at(0),:zone=>0}
    hdate[:id] = hrect_xml.attributes['id']
    if hdate[:id] == hdate[:id].to_i.to_s
      hdate[:int_id] = true
      hdate[:id].to_i!
    end
    hdate[:order] = hdate_xml.attributes['order'].to_i
    hdate[:value].at( hdate_xml.attributes['epochvalue'].to_i )
    hdate[:value].gmtime
    if not valid?( hdate_xml, hdate[:value] )
      pp hdate
      raise InvalidDateValue
    end
    hdate[:zone]  = hdate_xml.attributes['timezone'].to_i
    hsyncvalues[:dates].push(hdate)
  end
end


