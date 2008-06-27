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

require '/Users/o/code/himle/trunk/server/lib/db/mysql'

require 'open-uri'

require 'pp'

class KamppaHaku
  
  def get_url(url,retry_count=0)
    begin
      url_obj = open(url)
      data = url_obj.read #do |f|
      url_obj.close
      return data
    rescue
      puts "fail, retrying" if ARGV.include?('--verbose')
      return false if retry_count == 2
      return get_url(url,retry_count+1)
    end
  end
  def hexlify(str)
    return '0x'+str.unpack('H*')[0]
  end
  def loop_urls
    @db_urls   = {} # urli -> id
    @url_data  = {} # id -> data
    @id2url    = {} # id -> urli
    @not_processed = [] # id,id,id..
    @update_urls = []
    @db.q("select id,urli,data,processed from urli_data").each do |row|
      @db_urls[row['urli']]=row['id']
      @url_data[row['id']]=row['data']
      @not_processed.push(row['id']) if (row['processed'].to_i == 0)
      @id2url[row['id']]=row['urli']
    end
    @url_list.each do |urli|
      host = urli.split('http://')[1].split('/')[0]
      if host == 'www.oikotie.fi'
        urli.gsub!(/^(.*)www.oikotie.fi(.*)&id=([0-9]*)(.*)$/,'http://www.oikotie.fi/realestlist?exit=aptinfo_fromsearch&id=\3')
      elsif host == 'kuluttaja.etuovi.com'
        urli.gsub!(/^(.*)kuluttaja.etuovi.com(.*)&item_id=(([0-9]*)\.([0-9]*))(.*)$/,'http://kuluttaja.etuovi.com/crometapp/product/realties/common/public/search/item/item.jsp?portal=eo&item_id=\3')
      end
      if @db_urls.has_key?(urli)
        #puts "skipping: #{urli}"
      else
        puts "fetching: #{urli}" if ARGV.include?('--verbose')
        url_data = get_url(urli)
        next if url_data == false
        #puts "--"*40
        url_id = @db.q("insert into urli_data (urli,data) values (#{hexlify(urli)},#{hexlify(url_data)})")
        @not_processed.push(url_id)
        @db_urls[urli]=url_id
        @url_data[url_id]=url_data
        @id2url[url_id]=urli
        #puts "=-"*40
      end
    end
  end
  def parse_oikotie_html(html)
    html = html.split('<div id="contextBox">'
                )[1].split('.owncity_border { padding:5px 9px 5px 9px; border-top:1px solid #C2C2C2; border-bottom:1px solid #C2C2C2; ')[0]
    row_num = 0
    data = {}
    data_map = {
      'Sijainti'=>:sijainti,
      'Kaupunginosa'=>:kaupunginosa,
      'Huoneiden lukumäärä'=>:huonemaara,
      "Huoneiston kokoonpano"=>:kokoonpano,
      "Asuinpinta-ala"=>:pinta_ala,
      "Kokonaispinta-ala"=>:kok_pinta_ala,
      "Vuokra"=>:vuokra,
      "Vuokra-aika"=>:vuokra_aika,
      "Vuokran korotus"=>:vuokran_korotus,
      "Välityspalkkio"=>:palkkio,
      "Vuokravakuus"=>:vakuus,
      "Asuntotyyppi"=>:tyyppi,
      "Asumismuoto"=>:muoto,
      "Vesimaksun peruste"=>:vesimaksu,
      "Muut maksut"=>:muut_maksut,
      "Keitti&ouml;n varusteet"=>:keittio,
      "Kylpyhuoneen varusteet"=>:kylpyhuone,
      "Pintamateriaalit"=>:pintamateriaalit,
      "Yleiskunto"=>:yleiskunto,
      "Hissi"=>:hissi,
      "Kerros"=>:kerros,
      "Rakennusvuosi"=>:rak_vuosi,
      "S&auml;ilytystilat"=>:sailytys,
      "Kohdenumero"=>:kohdenumero,
      "Sauna"=>:sauna,
      "Yhteiset tilat"=>:yhteiset_tilat,
      "Lisätiedot"=>:lisatiedot,
      "Esittelyajat"=>:esittelyajat,
      "Vapautumisen lis&auml;tiedot"=>:vapautumisen_lisatiedot,
      "Vuokrauksen erityisehdot"=>:erityisehdot,
      "Parveke"=>:parveke,
      "Parvekkeen lisätieto"=>:parveke_info,
      "Ikkunoiden suunnat"=>:ikkunoiden_suunnat,
      "Rakennusvuoden lisätiedot"=>:rak_vuoden_lisatiedot,
      "Antennij&auml;rjestelm&auml;"=>:antenni,
      "Ilmansuunnat"=>:ilmansuunnat,
      "N&auml;kym&auml;t"=>:nakymat,
      "Liikenneyhteydet"=>:liikenneyhteydet,
      "Asuntojen lkm"=>:asuntojen_lkm,
      "Palvelut"=>:palvelut,
      "Tontti"=>:tontti,
      "Vapautumisp&auml;iv&auml;m&auml;&auml;r&auml;"=>:vapautumis_pvm,
      "Saunan lisätieto"=>:sauna_info,
      "L&auml;mmitys"=>:lammitys,
      "Kiinteistön asuinhuoneistopinta-ala"=>:kiinteisto_pinta_ala,
      "Kiinteist&ouml;"=>:kiinteisto,
      "Peruskorjaukset"=>:peruskorjaukset,
      "Rakennusmateriaali"=>:rak_materiaali,
      "Sein&auml;rakenne"=>:seinarakenne,
      "Muut tilat"=>:muut_tilat,
      "Lisätietoja varustuksesta"=>:varustus_info,
      "Pys&auml;k&ouml;intitilat"=>:pysakointitilat,
      "Yhtiön hallinnassa olevat tilat/tuotot"=>:yhtion_tilat_tuotot,
      "Isännöitsijän yhteystiedot"=>:isannoitsijan_yhteystiedot,
      "L&auml;mmityskulut"=>:lammityskulut,
      'Tulevat korjaukset'=>:peruskorjaukset,
      "Kaavatiedot"=>:kiinteisto,
      "Uudisasunto varattu"=>false
    }
    data[:kuvaus] = html.split('<!-- Kohteen kuvaus-->'
             )[1].split('<span id="favouriteselect">'
             )[0].gsub(/(<(.*?)>)/,'').strip
    begin
      data[:yhteystiedot] = html.split('<input type="hidden" name="companyName"'
                            )[1].split('<span class="bold">'
                            )[1].split('<br />'
                            )[0].gsub(/(<(.*?)>)/,'').strip
    rescue
      data[:yhteystiedot] = html.split('<div class="contextBoxHeader"><span class="contextBoxHeaderText">Yhteystiedot ja yhteydenotto</span></div>'
                            )[1].split('<div class="contextBoxContent">'
                            )[1].split('<script type'
                            )[0].gsub(/(<(.*?)>)/,'').strip
    end
    html.split('<span class="searchColHeader">')[1..-1].each do |html_row|
      row_num += 1
      map_key = html_row.split('</span>')[0].strip
      #puts map_key[0..32].inspect
      if not data_map.has_key?(map_key)
        puts "invalid key: #{map_key.inspect}"
        next
      end
      data_key = data_map[map_key]
      next if data_key == false
      row_data = html_row.split('<td')[1].split('>')[1].split('</td')[0]
      if data_key == :kaupunginosa
        row_data = row_data.downcase.capitalize
      end
      #puts html_row[0..96].inspect
      data[data_key] = row_data
      begin
        data[data_key].strip!
      rescue
        data.delete(data_key)
      end
      # html_row[0..60].inspect
    end
    #pp data
    #puts '-'*80
    return data
  end
  def parse_etuovi_html(html)
    data = {}
    data_map = {
      'Sijainti:'=>:kaupunginosa,
      'Tyyppi:'=>:tyyppi,
      'Vuokra:'=>:vuokra,
      'Vakuus:'=>:vakuus,
      'Vuokrasopimuksen tyyppi:'=>:vuokra_aika,
      'Muut vuokrausehdot:'=>:vuokra_aika, #### ???
      'Kuvaus:'=>:kokoonpano,
      'Huoneiden määrä:'=>:huonemaara,
      'Pinta-ala:'=>:pinta_ala,
      'Yleiskunto:'=>:yleiskunto,
      'Kerros:'=>:kerros,
      'Muuta:'=>:erityisehdot,
      'Vesimaksu:'=>:vesimaksu,
      'Lisätietoa maksuista:'=>:lisatiedot,
      'Lattiamateriaalien kuvaus:'=>:pintamateriaalit,
      'Säilytystilojen kuvaus:'=>:sailytys,
      'Tilat ja varustelu:'=>:muut_tilat,
      'Tilojen kuvaus:'=>:muut_tilat,
      "Kokonaispinta-ala:"=>:kok_pinta_ala,
      'Näkymät:'=>:nakymat,
      "Huoneistoon kuuluu:"=>:varustus_info,
      'Pääasiallinen rakennusmateriaali:'=>:rak_materiaali,
      "Pintamateriaalit:"=>:pintamateriaalit,
      'Lämmitysjärjestelmä:'=>:lammitys,
      "Vapautuminen:"=>:vapautumis_pvm,
      "Rakennusvuosi:"=>:rak_vuosi,
      "Sijainti rakennuksessa:"=>:kokoonpano,
      "Omistusmuoto:"=>:tyyppi,
      "Ilmansuunnat:"=>:ilmansuunnat,
      "Taloyhtiön nimi:"=>:isannoitsijan_yhteystiedot,
      "Seinämateriaalien kuvaus:"=>:seinarakenne
    }
    tilat_varustelu = {
      'hissi' => :hissi
    }
    data[:kohdenumero] = html.split('<h1 style="color:black;">Kohdenumero '
                         )[1].split('</h1>')[0].strip
    data[:kuvaus] = html.split('<div id="item_presentation_col">'
                    )[1].split('<div class="left">')[0].strip
    data[:yhteystiedot] = html.split('<div class="item_broker_col_text">'
                          )[1].split('</div>')[0].gsub(/(<(.*?)>)/,'').strip
    begin
      data[:keittio] = html.split('<span class="itemLeaf">Keittiö</span></h3>'
                       )[1].split('<span class="bold">Kuvaus:</span>'
                       )[1].split('<td class="colOneThirdItemR">'
                       )[1].split('</td></tr>'
                       )[0].strip
    rescue
      #puts "ei keittiötä?"
    end
    begin
      data[:kylpyhuone] = html.split('<span class="itemLeaf">Pesutilat</span></h3>'
                          )[1].split('<span class="bold">Kuvaus:</span>'
                          )[1].split('<td class="colOneThirdItemR">'
                          )[1].split('</td></tr>'
                          )[0].strip
    rescue
      #puts "ei kylppäriä?"
    end
    begin
      data[:esittelyajat] = html.split('<span class="bold">Aika:</span>'
                            )[1].split('<br />')[0].gsub("\n",' ').strip + \
                            ', ' + \
                            html.split('<span class="bold">Info:</span>'
                            )[1].split('<br />')[0].gsub("\n",' ').strip
    rescue
      #puts "ei esittelyä!"
    end
    perus_html = html.split('Perustiedot</span></h3>'
                 )[1].split('Keittiö</span></h3>')[0]
    perus_html.split('<td class="colOneThirdItemL"><span class="bold">')[1..-1].each do |html_row|
      #puts html_row[0..64].inspect
      map_key = html_row.split('</span></td>')[0].strip
      row_data = html_row.split('<td')[1].split('>')[1].split('</td')[0]
      next if map_key == 'Koko:'
      if map_key == 'Sijainti:'
        row_data = row_data.downcase.gsub('helsinki','').strip.capitalize
      elsif map_key == 'Vuokraustyyppi:'
        if row_data != 'Päävuokralainen'
          puts "tuntematon vuokraustyyppi: #{row_data.inspect}"
          next
        else
          next
        end
      elsif not data_map.has_key?(map_key)
        puts "invalid key: #{map_key.inspect}"
        puts html_row[0..96]
        puts
        next
      end
      data_key = data_map[map_key]
      if data.has_key?(data_key)
        puts "appending #{data_key.to_s}"
        data[data_key] += " ... #{row_data}"
      else
        data[data_key] = row_data
        begin
          data[data_key].strip!
        rescue
          data.delete(data_key)
        end
      end
    end
    return data
  end
  def save_data(url_id,data,palvelun_nimi,is_update=false)
    if is_update
      kamppa_data = @db.q("select * from kamppa_info where url_id = #{url_id}")[0]
      kamppa_id = kamppa_data['id']
      was_updated = false
    else
      kamppa_id = @db.q("insert into kamppa_info (url_id,palvelun_nimi,updated) values (#{url_id},#{hexlify(palvelun_nimi)},#{Time.now.to_i})")
    end
    @db.q("update urli_data set processed = 1 where id = #{url_id}")
    @not_processed.delete(url_id)
    data.each_key do |data_key|
      if is_update
        if kamppa_data[data_key] != data[data_key]
          puts "#{data_key} updated"
          @db.q("update kamppa_info set updated = #{Time.now.to_i} where id = #{kamppa_id}")
        end
      end
      data_val = data[data_key]
      if data_val != nil and data_val.size > 0
        if data_key == :vuokra
          data_val = data_val.gsub(',','.').gsub(' ','').to_i.to_s
          qu = "update kamppa_info set #{data_key.to_s} = #{data_val} where id = #{kamppa_id}"
        else
          if data_key == :kokoonpano
            data_val.gsub!('Kodikas','')
            data_val.gsub!('Viihtyisä','')
            data_val.gsub!('Upea','')
            data_val.gsub!('Viehättävä','')
            data_val.gsub!(/([0-9]) h/,'\1h')
            data_val.gsub!(',','+')
            data_val.squeeze!(' ')
            data_val.gsub!('+ ','+')
            data_val.gsub!(' +','+')
            data_val.strip!
          end
          data_val.gsub!(/(<(.*?)>)/,'')
          qu = "update kamppa_info set #{data_key.to_s} = #{hexlify(data_val)} where id = #{kamppa_id}"
        end
        @db.q(qu)
      end
    end
  end
  def fix_html(url_id)
    html = @url_data[url_id]
    html.gsub!("\262",'2')
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
  def parse_urls
    until @not_processed.empty?
      url_id = @not_processed.shift
      urli = @id2url[url_id]
      host = urli.split('http://')[1].split('/')[0]
      html = fix_html(url_id)
      if host == 'www.oikotie.fi'
        puts "parsing: #{urli}"
        data = parse_oikotie_html(html)
        save_data(url_id,data,'oikotie')
      elsif host == 'kuluttaja.etuovi.com'
        puts "parsing: #{urli}"
        data = parse_etuovi_html(html)
        save_data(url_id,data,'etuovi')
      else
        puts "unknown host: #{host.inspect}"
      end
    end
  end
  def update_url(row)
    puts row.inspect if ARGV.include?('--verbose')
    #exit
    update_age = Time.now.to_i - row['updated']
    kamppa_id = row['kamppa_id']
    urli = row['urli']
    url_id = row['url_id']
    if update_age > 60*20 # 20 minutes
      host = urli.split('http://')[1].split('/')[0]
      url_data = get_url(urli)
      if url_data == false
        puts "checking if #{urli} needs update.."
        url_id = @db_urls[urli]
        url_data = get_url(urli)
        if url_data == false
          puts "url error, deleting.."
          @db.q("delete from urli_data where id = #{url_id}")
          @db.q("delete from kamppa_info where id = #{kamppa_id}")
          @db_urls.delete(urli)
          @url_data.delete(url_id)
          @id2url.delete(url_id)
        elsif url_data != @url_data[url_id]
          puts "needs update.." if ARGV.include?('--verbose')
          @url_data[url_id] = url_data
          @db.q("update urli_data set data=#{hexlify(url_data)} where id = #{url_id}")
          html = fix_html(url_id)
          if host == 'www.oikotie.fi'
            puts "updating: #{urli}"
            data = parse_oikotie_html(html)
            save_data(url_id,data,'oikotie',true)
          elsif host == 'kuluttaja.etuovi.com'
            puts "updating: #{urli}"
            data = parse_etuovi_html(html)
            save_data(url_id,data,'etuovi',true)
          end
        end
      end
    end
  end
  def update_urls
    qu = "select k.updated as updated,k.id as kamppa_id,u.urli as urli,u.id as url_id from kamppa_info as k, urli_data as u where u.id = k.url_id"
    @db.q(qu).each do |row|
      update_url(row)
    end
  end
  def initialize(url_txt=false,url_list=false)
    if url_txt != false
      url_file = open(url_txt)
      @url_list = url_file.read.strip.split("\n")
      url_file.close
    else
      @url_list = url_list
    end
    puts "opening db" if ARGV.include?('--verbose')
    @db = MySQLAbstractor.new({:user=>'root',:pass=>'',:host=>'localhost'},'kampat')
    @db.q("update urli_data set processed = 0") if ARGV.include?('--reset')
    @db.q("delete from kamppa_info") if ARGV.include?('--reset')
    unless @db.q("select * from kamppa_info limit 1")[0].keys.include?('updated')
      @db.q("alter table kamppa_info add column updated int not null default 0")
    end
    puts "loop_urls" if ARGV.include?('--verbose')
    loop_urls
    puts "parse_urls" if ARGV.include?('--verbose')
    parse_urls
    puts "update_urls" if ARGV.include?('--verbose')
    update_urls
    puts "close db" if ARGV.include?('--verbose')
    @db.close
  end
end

#KamppaHaku.new('kamppaurlit.txt')

