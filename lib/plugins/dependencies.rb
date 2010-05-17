##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module RSence
  class Dependencies
    def initialize( deps = [] )
      @deps = deps
      @depends_on = {
        # :name => [ :dep1, :dep2, :dep3, ... ]
      }
      # ...additional initialization?
    end
    def set_deps( name, deps )
      if not @depends_on.has_key?(name)
        @depends_on[name] = deps
      else
        @depends_on[name].join( deps )
      end
      # ...additional checks?
    end
    alias set_dependencies set_deps
    def deps
      # calculate @depends_on and push items with
      # resolved dependencies into @deps
      # ...
      return @deps
    end
    alias deps load_order
  end
end

