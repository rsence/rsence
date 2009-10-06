
  Riassence Core 1.0                                               2009/06/23
  RIA Framework
  http://rsence.org/


INSTALLATION

For installation instructions, read the INSTALL document.


COMMUNITY SUPPORT
 - http://rsence.org/
 - IRC: #rsence on IRCNet, Freenode and QuakeNet


COMMERCIAL SUPPORT
 - http://riassence.com/
 - support@riassence.com



INTRODUCTION

The Riassence Core Framework (or casually, just "RSence") is a
Rich Internet Application Framework with the defining characteristics:
 * Thick Client
 * Thin Server


Thick Client

The Riassence Core client framework is a relatively small, independent
javascript package that communicates asynchronously with the server.
The client is able to load resources on the fly and needs the server
essentially just for bootstrapping, session management and data handling.
The reasoning is that modern web browsers are fairly powerful universal
layout engines with a safe, sand-boxed environment for running client
applications.
One major factor of a good user experience is responsiveness. To achieve that,
the user interface needs to be controlled where it's displayed.
A well written Riassence Core application provides realtime responsiveness
and has the same user interface characteristics of a typical desktop
application.

The desktop metaphor for user interfaces is the established way to develop
client software. To do it on the web used to be a fairly involved process.
One of the first approaches were Java Applets, but these had a tendency of
long startup times and didn't integrate too well with the rest of the web.
Flash applications are also separate sandboxes in the web page and as such
doesn't integrate too well or leverage the capabilities of the browser 
itself. The Shockwave Flash -plugin is also proprietary and it's not
available on all platforms.

Javascript is enabled on almost all web browsers, but used to be a difficult
platform to build applications on. Writing a desktop-like Javascript GUI
support framework is not an easy task either and then there are all those
dreaded browser incompatibilities. The Riassence client framework addresses
these issues and has been under active development since early 2006.
It supports 99% of the web browsers out there, including Internet Explorer
versions 6 through 8, Firefox, Chrome, Opera, Safari and the majority of
mobile browsers in use.

One of the core building blocks is the HClass -class object that enables
proper, inherited Object-Oriented programming in Javascript by building
on the prototyped OO model Javascript has natively. It allows a high
grade of code re-usability with minimal effort.

Another core feature is the ELEM interface. It provides a controlled, 
double-buffered, cross-browser engine for DOM manipulation.

Desktop-like events are provided by the EVENT interface. It abstracts
event handling by binding the low-level event listeners and provides
the higher level event interface used by the UI framework. Such high-level 
events include dragging, dropping, clicking, typing, key combinations etc.

The COMM package provides high-level data transfer capabilities and
automatic client-server session handshaking and transparent, asynchronous
data transfers between client and server.

HSystem is the "Kernel" for process and view control. It provides multitasking
for processes with features like starting, stopping, destruction and
prioritization.

HApplication is the basic process model and the root level controller of an
client-side application. Destructing an HApplication instance destructs its
UI too.

The HThemeManager service supports loading theme files (markup and css) on
the fly. Automatically and transparently.

HRect and HPoint define a high-level coordinate model and include a lot of
geometry calculations such as intersections, offsets and manipulation of
shapes by any edge or corner.

The HView class is the high-level foundation building block for building
user interfaces. Any class that inherits HView gets a high-level UI building
block with themeability, animation and sub-view support for free. HViews define
the bounds of all UI components.

The HControl class extends view with support for events, labels, values and
a multitude of options. All interactive UI components extends HControl.

Riassence Core comes bundled with a full set of essential UI components:
HButton, HCheckbox, HImageView, HPasswordControl, HRadioButton, HSplitView, 
HSlider, HVSlider, HStepper, HTextControl, HTextArea, HValidatorView,
HProgressbar, HUploader, HStringView, HProgressIndicator, HTab and HWindow.

These components share the API of HControl and are useable as-is. They are
also easily extendable for any specific tasks.


Thin Server

Although you can run the client independently without the server, 
the server is necessary for building complex web applications and doing
tasks not allowed in the web browser's sandbox. As the client can
handle the user interface independently, the server does what a server
needs to do, and does it efficiently.

The main responsibilities of the Riassence server is to avoid tasks the
client is capable of and emphasize on the tasks the client can't do.

Session management is one of these tasks. Sessions are needed to tell
the clients apart and to keep the data shared by the client and server
intact, secure and up to date. Sessions also have a persistent database
back-end where the session data is stored. This allows uninterrupted
operation of the client even if the server becomes unreachable for a while.
Session keys are by default disposable and use cryptographic hashing (SHA1)
for key exchange. Data of concurrent sessions are kept separate from each 
other.

Another important duty of the server is to bridge the sand-boxed client
environment with the I/O capabilities of the server. Some of these 
capabilities are access to databases, the filesystem, external interfaces
and tasks that needs to be done securely.

The server-side controller model is the Plugin. The plugin does tasks
like decide which user interfaces to launch, defines session data,
responds to data changes etc. It's the necessary glue between back-end and GUI.

Plugins are deployed by dropping a plugin bundle into the plugins directory 
and un-deployed by dragging it out of the plugins directory. In 
debug/development mode, plugins are automatically reloaded. Each plugin is
initialized as a single instance and user interaction is managed through
evented messages. Messages are light-weight, disposable objects that provide
the request/response cycle, access to system-wide interfaces and session-bound
data.


Data Management

Client-server data is managed using the DSM (Distributed Shared Memory)
approach. Values are smart data container objects that are bound to other
objects. When the data changes, each bound objects synchronized with 
notification events. These events are automatically distributed to both
server and client member objects. Synchronization is transparent and
triggered automatically in both directions. This makes data handling
very simple, deprecates the need of explicit notification and complex
routing schemes.

Currently supported ballast value types are:
 - Boolean
 - Number (integer and float)
 - String
 - Flat array (containing any combinations of data types listed above)



-- Juha-Jarmo Heinonen
   o@rsence.org

