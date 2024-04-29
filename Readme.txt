@Nerd@
The Nerd servers are to store projects that I work on. There will be more focus
on applications and server interaction and less on web sites. Some basic web
apps such as a project showcase and message board are necessary.

$Markdown$
Most site content is markdown. The layout is called Markdown. Using the layout
fully functional components can be instantiated. These are implemented in text
and converted into coordinates and dimensions to allow the components to be
size. All are attached to a fixed size container. This is then stretched to fill
the viewing window.

$Nerd Layout Engine$
The engine used to generate the layout and the site itself follows some basic
coding standards. Everything is in a class with some general utility functions in
the global namespace.

Function names are capitalized with the space replaced with an underscore.
%
function Render_Grid() {

}
%

Class names (or components) are just like function names but prepended with the
letter c.
%
class cComponent {

}
%

$Components$
Components are rendered inside of the layout and the page. Components are
implemented by extending the component renderers of the page module.

$Files$
All files should be named with uppercase names just like function names. The extension
is in lower case. An example:
%
My_Component.js
%

Name all files according to what they contain. For example, a module that contains classes
should be called #Components.js#.

$HTML and CSS$
None of this stuff in the Nerd layout engine. We don't do HTML and CSS anymore!
