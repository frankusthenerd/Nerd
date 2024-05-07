// ============================================================================
// Nerd Daemon
// Programmed by Francois Lamini
// ============================================================================

let fs = require("fs");
let nerd = require("./Backend");

// *****************************************************************************
// Daemon Implementation
// *****************************************************************************

class cDaemon {

  /**
   * Creates a daemon.
   * @param name The name of the server.
   */
  constructor(name) {
    this.config = new nerd.cConfig(name);
    this.shell = new nerd.cShell();
    this.needs_restart = false;
  }

  /**
   * Starts the daemon.
   */
  Start() {
    let command = this.config.Get_Property("command");
    let component = this;
    this.shell.Execute_Command(command, function() {
      component.On_Close();
    });
  }

  /**
   * Called when the shell was closed.
   */
  On_Close() {
    if (this.needs_restart) {
      this.Start(); // Restart the command.
      this.needs_restart = false; // Reset flag.
    }
  }

  /**
   * Checks for any changes in selected files.
   */
  Check_For_Changes() {
    let component = this;
    // Check for changes.
    let files = this.config.Get_Property("files").split(",");
    let file_count = files.length;
    for (let file_index = 0; file_index < file_count; file_index++) {
      let file = nerd.cFile.Get_Local_Path(files[file_index]);
      fs.watchFile(file, {
        interval: component.config.Get_Property("timeout")
      }, function(current, prev) {
        let delta = current.mtime.getTime() - prev.mtime.getTime();
        if (delta > 0) {
          component.needs_restart = true;
          component.shell.Close(); // Close the command, wait for restart.
        }
      });
    }
  }

}

// *****************************************************************************
// Daemon Initializer
// *****************************************************************************

/**
 * Creates a new daemon.
 * @param params The associated daemon parameters.
 */
function Daemon(params) {
  nerd.Check_Condition((params.length == 1), "Missing name parameter.");
  let name = params[0];
  let daemon = new cDaemon(name);
  daemon.Start();
  daemon.Check_For_Changes();
}

// *****************************************************************************
// Entry point.
// *****************************************************************************

Daemon(process.argv.slice(2));
