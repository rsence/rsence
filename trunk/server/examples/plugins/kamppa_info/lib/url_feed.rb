# -* coding: UTF-8 -*-
###
  # Himle Server -- http://himle.org/
  #
  # Copyright (C) 2008 Juha-Jarmo Heinonen
  #
  # This file is part of Himle Server.
  #
  # Himle Server is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Himle server is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

require 'kamppa_parser'

require 'net/http'
require 'uri'

class UrlFeed
  def get_oikotie_apartments
    url = URI.parse("http://www.oikotie.fi/aptsearch_forrent_adv?exit=search")
    begin
      response = Net::HTTP.post_form(
        url, {
        'mainNavi'=>'apartments',
        'subNavi'=>'apartments_forrent',
        'favouriteList.subverticalId'=>'2',
        'query'=>'%26cookieValue%3D121057745892506061%26subNavi%3Dapartments_forrent%26selectedpage%3D1%26minArea%3D45%26Area3%3D10013%26listlength%3D25%26Area2%3D10013%26aptType%3D5%26Area1%3D1%26fcid%3D964029610203807449%26target%3Drentable%26mainNavi%3Dapartments%26orderby%3DDATEOFPUBLICATION_ORA%26advsearch%3Dtrue%26published%3D0%26dir%3Ddesc%26vendor%3Dkaikki%26rooms%3D2%26rooms%3D3%26rooms%3D4%26searchtype%3Dadvanced_search%26maxRent%3D1500%26searchtotal%3D66',
        'cpyId'=>'',
        'from'=>'',
        'orderby'=>'DATEOFPUBLICATION_ORA',
        'dir'=>'desc',
        'hideLogoFilter'=>'false',
        'orderby_dir'=>''
      } )
      response.read_header
      headers = {}
      response.each_header do |key,value|
        headers[key] = value
      end
      response.read_body
      response_body = response.body.strip
      if response.code != "200"
        puts "failure: response code=#{response.code}, response body=#{response_body[0..512]}"
        return false
      end
      return response_body
    rescue => e
      puts "fail: #{e.inspect}"
      return false
    end
  end
  def fix_html(html)
    html.gsub!("\200",'&euro;')
    html.gsub!("\244",'&euro;')
    html.gsub!(0xe4.chr,'ä')
    html.gsub!(0xf6.chr,'ö')
    html.gsub!("\326",'Ö')
    html.gsub!("\304",'Ä')
    html.gsub!("\351",'é')
    html.squeeze!(' ')
    html.gsub!(' >','>')
    html.gsub!('> ','>')
    html.gsub!(' <','<')
    html.gsub!("\r\n","\n")
    html.gsub!("\n ","\n")
    html.squeeze!("\n")
    html.squeeze!(' ')
    return html
  end
  def parse_html
    @html.split("href='/realestlist?exit=aptinfo_fromsearch")[1..-1].each do |url_start|
      urlbase = url_start.split("=apartments_forrent'>")[0]
      url = "http://www.oikotie.fi/realestlist?exit=aptinfo_fromsearch#{urlbase}=apartments_forrent"
      @url_list.push( url )
    end
  end
  def initialize
    while true
      puts "scanning urls #{Time.now.inspect}"
      @url_list = []
      html = get_oikotie_apartments()
      if html
        @html = fix_html(html)
        puts "finding urls.."
        parse_html()
        puts "fetching.."
        KamppaHaku.new(false,@url_list)
      end
      puts "sleeping.."
      sleep 60*15
    end
  end
end
urlFeed = UrlFeed.new


