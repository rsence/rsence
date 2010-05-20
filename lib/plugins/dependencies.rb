##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module RSence
  
  # = Description:
  # Generic dependency calculator. Used by PluginManager.
  # = Usage:
  # This is an almost real world example:
  #   ## Initialize with pre-satisfied dependencies
  #   deps = RSence::Dependencies.new( [:foo1,:foo2] )
  #   
  #   ## :client_pkg doesn't depend on anything
  #   deps.set_deps( :client_pkg, nil )
  #   
  #   ## :system is the category of :client_pkg
  #   deps.set_deps( :system, :client_pkg )
  #   
  #   ## :index_html depends on :client_pkg
  #   deps.set_deps( :index_html, :client_pkg )
  #   
  #   ## :system is the category of :index_html
  #   deps.set_deps( :system, :index_html )
  #   
  #   ## :main depends on :index_html
  #   deps.set_deps( :main, :index_html )
  #   
  #   ## :system is the category of :main
  #   deps.set_deps( :system, :main )
  #   
  #   ## :impossible has several dependencies, of which :foo3 can't be satisfied
  #   deps.set_deps( :impossible, [:foo1, :foo2, :foo3] )
  #   
  #   ## :ticket has no dependencies
  #   deps.set_deps( :ticket, nil )
  #   
  #   ## :system is the category of :ticket
  #   deps.set_deps( :system, :ticket )
  #   
  #   ## :welcome depends on the :system category
  #   deps.set_deps( :welcome, :system )
  #   
  #   ## :first doesn't depend on anything
  #   deps.set_deps( :first, nil )
  #   
  #   ## Prepending is handled like this:
  #   deps.set_deps( :client_pkg, :first )
  #   deps.set_deps( :ticket, :first )
  #   
  #   ## Calculates the list of dependencies and returns them in an Array
  #   p deps.list
  #   
  #   ## Output of the example above:
  #   # impossible dependencies:
  #   #   :impossible => [:foo3]
  #   # [:foo1, :foo2, :first, :ticket, :client_pkg, :index_html, :main, :system, :welcome]
  class Dependencies
    def initialize( resolved = [] )
      @resolved = resolved.clone
      @depends_on = {
        # :name => [ :dep1, :dep2, :dep3, ... ]
      }
    end
    def set_deps( name, deps )
      if deps.class == Symbol
        deps = [deps]
      elsif deps.class == String
        deps = [deps.to_sym]
      elsif deps.class == NilClass
        deps = []
      elsif deps.class != Array
        raise "Invalid deps class: #{deps.class}"
      end
      if not @depends_on.has_key?(name)
        @depends_on[name] = deps
      else
        @depends_on[name] += deps
      end
    end
    alias set_dependencies set_deps
    alias set_dependency set_deps
    def list
      resolved = @resolved.clone
      same_len = false
      target_len = @depends_on.keys.length + resolved.length
      until resolved.length == target_len
        len = resolved.length
        @depends_on.each do | name, deps |
          # puts "name: #{name.inspect} => #{deps.inspect}"
          if deps.empty? and not resolved.include?(name)
            resolved.push( name )
          elsif deps.empty?
            next
          else
            deps.each do |dep|
              deps.delete(dep) if resolved.include?(dep)
            end
          end
        end
        if len == resolved.length# and @depends_on.keys.length != len
          if same_len
            warn "impossible dependencies:"
            (@depends_on.keys - resolved).each do |unsatisfied|
              warn "  #{unsatisfied.inspect} => #{@depends_on[unsatisfied].inspect}"
            end
            break
          else
            same_len = true
          end
        else
          same_len = false
        end
      end
      return resolved
    end
    alias load_order list
  end
end
