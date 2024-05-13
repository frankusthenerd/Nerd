image://up/Artwork/Frankus.png

@Overview@
The Nerd Server is a server-client system meant for managing and storing code on
various server which may be Raspberry PIs or Linodes. The Nerd server-client
system is written in JavaScript using Node.

@Components@
The Nerd server-client system consists of the following components:

- Server.js: Contains the server module.
- Backend.js: Contains the Nerd API for reading files, the config, and the shell.
- Project.js: Contains the project module for managing project code.
- Daemon.js: The Nerd daemon that allows the server to be programmed while running.
- Nerd.js: The Nerd server-client interface.
- Layout.js: The layout rendering system for web sites building.
- Frontend.js: The front end API for building web sites. Used with layout.

@Nerd Commands:@
The nerd commands via the command line interface are as follows:

$Server Commands:$
#Start Server#
*node Nerd.js -server <nerd-config>*

#Start Daemon#
*node Daemon.js <nerd-config>*

$Project Commands:$
#Create Project Manifest#
*node Nerd.js -project <project> <nerd-config> new-manifest*

#Add Folder to Manifest#
*node Nerd.js -project <project> <nerd-config> add-folder <folder>*

#Generate Resources File#
*node Nerd.js -project <project> <nerd-config> generate-resources*

#Upload Project#
*node Nerd.js -project <project> <nerd-config> upload*

#Download Project#
*node Nerd.js -project <project> <nerd-config> download*

#Compile Nerd App (Windows)#
*node Nerd.js -project <project> <nerd-config> compile-for-windows*

#List Projects#
*node Nerd.js -list <nerd-config> || local*

$Documentation Commands:$
#Run Coder-Doc#
*node Nerd.js -project <project> <nerd-config> -coder-doc*

@Nerd Configuration@
To configure the Nerd server you need to create a config file with the .txt
extension. In the file the following key=value properties are needed:

#timeout#=*milliseconds*
This is used for the daemon to determine how often to check for changes in files.

#files#=*file 1,file 2,...*
This property specifies the list of files to check for changes. Used by the daemon.

#port#=*number*
The port number for the server to listen.

#server#=*address*
The IP address or domain name of the server where the Nerd resides.

#command#=*command line*
The shell command used to restart the server.

@Layout Engine@
The Nerd client-server system comes with a built in layout engine that can run
on both C++ and JavaScript. It renders all layout components onto the canvas
and skips the CSS and HTML stuff.

There are three components that the layout engine uses. They are:

#Layout#
The engine that renders the layout of an app or web site.

#Page#
A single page loaded into the app. It is a derivative of layout. This is where
components are implemented.

#Page_Manager#
Manages a group of pages to create an app or web site.

$Component Catalog$
These are the components and their properties that are available for Nerd
app and web site programming.

#Base Properties#
All entities have the following properties:

^ Property ^ ^ Description ^
| id     | | The component ID.      |
| type   | | The type of component. |
| x      | | The x coordinate.      |
| y      | | The y coordinate.      |
| width  | | The width.             |
| height | | The height.            |

#Field#

^ Property ^ ^ Description ^
| text     | | The text in the field. |

#Grid View#

^ Property ^ ^ Description ^
| columns     | | The number of columns in the grid.   |
| rows        | | The number of rows in the grid.      |
| grid-x      | | The selected grid cell x coordinate. |
| grid-y      | | The selected grid cell y coordinate. |
| scroll-x    | | The grid scroll x coordinate.        |
| scroll-y    | | The grid scroll y coordinate.        |
| text        | | The grid text.                       |

#Label#

^ Property ^ ^ Description ^
| label | | The label text.            |
| red   | | The red color component.   |
| green | | The green color component. |
| blue  | | The blue color component.  |

#List#

^ Property ^ ^ Description ^
| text     | | The list text.           |
| sel-item | | The selected list item.  |
| scroll-x | | The scroll x coordinate. |
| scroll-y | | The scroll y coordinate. |

#Button#

^ Property ^ ^ Description ^
| label | | The button label.          |
| red   | | The red color component.   |
| green | | The green color component. |
| blue  | | The blue color component.  |

#Toolbar#

^ Property ^ ^ Description ^
| columns  | | The number of columns in the toolbar. |
| scroll-x | | The scroll x coordinate.              |
| scroll-y | | The scroll y coordinate.              |
| text     | | The toolbar text.                     |
| item-x   | | The selected item x coordinate.       |
| item-y   | | The selected item y coordinate.       |
| items    | | The items string.                     |

@Nerd Projects@
As a nerd I'm always engaging in programming projects. Well, here are the
projects I'm working on and their API.

$JavaScript Projects$
#Codeloader#
My defunct Codeloader site. Uses component engine similar to Nerd but
implemented with DOM.

http://www.nerdserver.cloud:8080/up/Codeloader/Docs/Files.html

#Game Lab#
This is a game development studio and a working game engine. It uses the
scripting language C-Lesh.

http://www.nerdserver.cloud:8080/up/Game_Lab/Docs/Files.html

#Electron#
This is a build system for Electron. You can build with any OS.

http://www.nerdserver.cloud:8080/up/Electron/Docs/Files.html

$C++ Projects$
#Bluejay's Quest#
This is a game about a bird. The level editor is written in Python.

http://www.nerdserver.cloud:8080/up/Bluejay_Quest/Docs/Files.html

#C-Lesh#
This is a programming language I wrote. I used it to create a game.
This is is a stand-alone version with a compiler.

http://www.nerdserver.cloud:8080/up/C_Lesh/Docs/Files.html

#C-Lesh Script#
This language is a script version of C-Lesh.

http://www.nerdserver.cloud:8080/up/C_Lesh_Script/Docs/Files.html

#Coder#
My implementation of Assembly and a similator for a 256 byte system.

http://www.nerdserver.cloud:8080/up/Coder/Docs/Files.html

#Layout#
The layout engine. This is the C++ version. Uses only drawing routines
for rendering!

http://www.nerdserver.cloud:8080/up/Layout/Docs/Files.html

#Level Editor#
A 2D level editor for side scrolling and top down view video games.
It probably can handle isometric games.

http://www.nerdserver.cloud:8080/up/Level_Editor/Docs/Files.html

#Nerd#
The Nerd server-client system. It comes complete with documentation
generation and layout rendering.

http://www.nerdserver.cloud:8080/up/Nerd/Docs/Files.html

#Sausage Script#
A source interpreted language that I wrote.

http://www.nerdserver.cloud:8080/up/Sausage_Script/Docs/Files.html

#Terminal#
A terminal renderer built from the ground up.

http://www.nerdserver.cloud:8080/up/Terminal/Docs/Files.html

@Nerd Author@
Frankus the Nerd (Francois) is the creator of the Nerd server-client system. He
is constantly experimenting with the lastest technology to build exciting new
projects in his Nerd Lab.

image://up/Nerd/Nerd_Labs.png