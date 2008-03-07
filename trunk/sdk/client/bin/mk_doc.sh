#!/usr/bin/env bash

###
  # HIMLE RIA Client
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  # Copyright (C) 2006-2007 Helmi Technologies
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

../NaturalDocs/NaturalDocs -i src/ -nag -o HTML doc -p ../test/proj/ -t 2 -r -do -s Helmi

rm -rf apidoc_src
mkdir apidoc_src

touch ./bin/cp_apidoc_src.sh
chmod +x ./bin/cp_apidoc_src.sh
find src -name as.inc|sed -E "s/src\/(.*)as.inc/mkdir -p apidoc_src\/\1/g" > ./bin/cp_apidoc_src.sh
find src -name as.inc|sed -E "s/src\/(.*)as.inc/cp src\/\1\*.js apidoc_src\/\1/g" >> ./bin/cp_apidoc_src.sh
. ./bin/cp_apidoc_src.sh
rm -r apidoc_src/util
rm -r apidoc_src/virtualbrowser

../NaturalDocs/NaturalDocs -i apidoc_src/ -nag -o HTML doc/api -p ../test/proj/ -t 2 -r -do -s Small

rm -r apidoc_src
rm bin/cp_apidoc_src.sh

echo "<html><head><meta http-equiv=\"Refresh\" CONTENT=\"0; URL=index/Classes.html\"></head></html>" > doc/api/index.html
