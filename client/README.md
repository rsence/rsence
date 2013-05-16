
*rsnc.js* is a client-side single page framework for
rapidly developing large and complex webapps with minimal effort.
All component classes follow the same basic API no matter what
your widgets look like. Theming is done by simple component-
and theme-specific html and css templates.
UI construction can be done using just a simple
[YAML][yaml_site] / [JSON][json_site]
structure format, which even beginners can rapidly prototype
with.

For more advanced users, there is a nice [API][rsnc_api] which supports
[CoffeeScript][coffeescript] and JS.

## Usage
Clone this repository into the root of an RSence repository clone as 'client'.
  
(install the [dependencies](#))
    git clone git@rsence.org:rsence.git rsence
    git clone git@rsence.org:rsnc.git rsence/client
(run your code, see [examples](#))

## Facts

*rsnc.js* is an object-oriented framework and classes are
designed to be extended. The superclasses do all the difficult
housekeeping for you. Client-server as well as client-client communication
is done via automatic value synchronization.

Interdependencies are kept at a minimum, so you don't have
to worry about referencing your variables throughout various
parts of your project, and `this` is practically always `this`.

If you are using the [RSence][rsence_site] server, your
code will automatically be built and deployed to all
connected clients.
This means that while developing, you can keep
writing code and at each save, your browsers will refresh
to show the current state of progress. Besides building the
client packages and serving them, the server doesn't
participate in user interface tasks. It's entirely data
oriented, to keep your UI and data models cleanly separate.

## License
*rsnc.js* is licensed under the [MIT license][rsnc_license].
You are encouraged to [fork it on Github][github_rsnc] and to write your own
server interface to suit your needs. The [protocol][rsnc_protocol] is very
simple to implement and requires just a single JSON POST listener
/ responder for the [data pump][data_pump].

## More information:
* [rsnc.js Website][rsnc_site]
* [RSence Website](rsence_site)
* `#rsence` on FreeNode

[yaml_site]: http://yaml.org/
[json_site]: http://json.org/
[rsnc_api]: http://rsnc.io/api/
[coffeescript]: http://coffeescript.org
[rsnc_site]: http://rsnc.io/
[rsence_site]: http://rsence.org/
[data_pump]: http://rsnc.io/data_pump/
[rsnc_protocol]: http://rsnc.io/protocol/
[github_rsnc]: https://github.com/jammi/rsnc/
[rsnc_license]: MIT-LICENSE.txt
