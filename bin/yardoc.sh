#!/bin/bash

# --incremental \
# --use-cache .yardoc_cache \
yardoc \
  bin/rsence \
  lib/rsence.rb \
  lib/**/*.rb \
  plugins/**/*.rb \
  --no-private \
  --exclude lib/util/ruby19_fixes.rb \
  --exclude lib/http/rackup.rb \
  - conf/default_*.yaml INSTALL.rdoc LICENSE.txt VERSION \
    docs/*.rdoc
