# Nerd Project
The Nerd Server is a server-client system meant for managing and storing code on
various server which may be Raspberry PIs or Linodes. The Nerd server-client
system is written in JavaScript using Node.

## Components
The Nerd server-client system consists of the following components:

- Server.js: Contains the server module.
- Backend.js: Contains the Nerd API for reading files, the config, and the shell.
- Project.js: Contains the project module for managing project code.
- Daemon.js: The Nerd daemon that allows the server to be programmed while running.
- Nerd.js: The Nerd server-client interface.
- Layout.js: The layout rendering system for web sites building.
- Frontend.js: The front end API for building web sites. Used with layout.

## Nerd Commands:
There is a Nerd command interpreter where you enter commands just
like in a command shell. It is independent of any shell. To start
the Nerd shell type in:

*node Nerd.js <nerd-config>*

There is also a daemon which can start the server as a process and
allow changes to files with automatic reloading. To start the daemon
type in:

*node Daemon.js <nerd-config>*

The Nerd shell will present you with a prompt. You can then type in
commands just as if you were on the terminal. The commands are as
follows:

## Server Commands:
### Start Server
*server start*

### Stop Server
*server stop*

## Project Commands:
### Create Project Manifest
*project <project> new-manifest*

### Add Folder to Manifest
*project <project> add-folder <folder>*

### Generate Resources File
*project <project> generate-resources*

### Upload Project
*project <project> upload*

### Download Project
*project <project> download*

### Compile Nerd App (Windows)
*project <project> compile-for-windows*

### List Projects
*list <nerd-config> || local*

## Documentation Commands:
### Run Coder-Doc
*coder-doc <project>*

## Exiting the Nerd
*exit*

## Nerd Configuration
To configure the Nerd server you need to create a config file with the .txt
extension. In the file the following key=value properties are needed:

**timeout**=*milliseconds*
This is used for the daemon to determine how often to check for changes in files.

**files**=*file 1,file 2,...*
This property specifies the list of files to check for changes. Used by the daemon.

**port**=*number*
The port number for the server to listen.

**server**=*address*
The IP address or domain name of the server where the Nerd resides.

**command**=*command line*
The shell command used to restart the server.

# Layout Engine
The Nerd client-server system comes with a built in layout engine that can run
on both C++ and JavaScript. It renders all layout components onto the canvas
and skips the CSS and HTML stuff.

There are three components that the layout engine uses. They are:

### Layout
The engine that renders the layout of an app or web site.

### Page
A single page loaded into the app. It is a derivative of layout. This is where
components are implemented.

### Page_Manager
Manages a group of pages to create an app or web site.

## Component Catalog
These are the components and their properties that are available for Nerd
app and web site programming.

### Base Properties
All entities have the following properties:

| Property | | Description |
| id     | | The component ID.      |
| type   | | The type of component. |
| x      | | The x coordinate.      |
| y      | | The y coordinate.      |
| width  | | The width.             |
| height | | The height.            |

### Field

| Property | | Description |
| text     | | The text in the field. |

### Grid View

| Property | | Description |
| columns     | | The number of columns in the grid.   |
| rows        | | The number of rows in the grid.      |
| grid-x      | | The selected grid cell x coordinate. |
| grid-y      | | The selected grid cell y coordinate. |
| scroll-x    | | The grid scroll x coordinate.        |
| scroll-y    | | The grid scroll y coordinate.        |
| text        | | The grid text.                       |


### Label

| Property | | Description |
| label | | The label text.            |
| red   | | The red color component.   |
| green | | The green color component. |
| blue  | | The blue color component.  |

### List

| Property | | Description |
| text     | | The list text.           |
| sel-item | | The selected list item.  |
| scroll-x | | The scroll x coordinate. |
| scroll-y | | The scroll y coordinate. |

### Button

| Property | | Description |
| label | | The button label.          |
| red   | | The red color component.   |
| green | | The green color component. |
| blue  | | The blue color component.  |

### Toolbar

| Property | | Description |
| columns  | | The number of columns in the toolbar. |
| scroll-x | | The scroll x coordinate.              |
| scroll-y | | The scroll y coordinate.              |
| text     | | The toolbar text.                     |
| item-x   | | The selected item x coordinate.       |
| item-y   | | The selected item y coordinate.       |
| items    | | The items string.                     |

# Nerd Author
Frankus the Nerd (Francois) is the creator of the Nerd server-client system. He
is constantly experimenting with the lastest technology to build exciting new
projects in his Nerd Lab.
