// ============================================================================
// Nerd Command Interpreter
// Programmed by Francois Lamini
// ============================================================================

let readline = require("readline");
let nerd = require("./Backend");
let server = require("./Server");
let project = require("./Project");
let coder_doc = require("./Coder_Doc");

// *****************************************************************************
// Nerd Command Implementation
// *****************************************************************************

class cNerd {

  /**
   * Creates a new Nerd command interpreter.
   * @param server_name The name of the server to use.
   */
  constructor(server_name) {
    this.server_name = server_name;
    this.server = new server.cServer(server_name);
    let component = this;
    this.command_ctrl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: ": ",
      tabSize: 2
    });
    this.command_ctrl.on("line", function(line) {
      component.Interpret(line);
    });
    this.command_ctrl.on("close", function() {
      console.log("Done.");
      process.exit(0);
    });
    process.on("uncaughtException", function(error, origin) {
      console.log(error.message);
      component.command_ctrl.prompt();
    });
  }

  /**
   * Interprets a single command entered in by the user.
   * @param command The command to interpret.
   */
  Interpret(command) {
    try {
      let params = command.split(/\s+/);
      let op = this.Get_Param(params, "Missing command.");
      let component = this;
      if (op == "server") {
        let srv_command = this.Get_Param(params, "Missing server command.");
        if (srv_command == "start") {
          this.server.Start();
          this.command_ctrl.prompt();
        }
        else if (srv_command == "stop") {
          this.server.Stop(function() {
            component.command_ctrl.prompt();
          });
        }
        else {
          throw new Error("Invalid server command " + srv_command + ".");
        }
      }
      else if (op == "project") {
        let name = this.Get_Param(params, "Missing project name.");
        let project_manager = new project.cProject(name, this.server_name);
        let prj_command = this.Get_Param(params, "Missing project command.");
        if (prj_command == "new-manifest") {
          project_manager.Generate_Manifest();
          this.command_ctrl.prompt();
        }
        else if (prj_command == "add-folder") {
          let folder = this.Get_Param(params, "Missing folder name.");
          project_manager.Add_Folder(folder);
          this.command_ctrl.prompt();
        }
        else if (prj_command == "generate-resources") {
          project_manager.Generate_Resources();
          this.command_ctrl.prompt();
        }
        else if (prj_command == "upload") {
          project_manager.Upload_Project(function() {
            component.command_ctrl.prompt();
          });
        }
        else if (prj_command == "download") {
          project_manager.Download_Project(function() {
            component.command_ctrl.prompt();
          });
        }
        else if (prj_command == "compile-for-windows") {
          project_manager.Compile_Cpp_With_Allegro_For_Windows(function() {
            component.command_ctrl.prompt();
          });
        }
        else {
          throw new Error("Invalid project command " + prj_command + ".");
        }
      }
      else if (op == "coder-doc") {
        let name = this.Get_Param(params, "Missing project name.");
        let generator = new coder_doc.cCoder_Doc(name);
        generator.Process_Code();
        this.command_ctrl.prompt();
      }
      else if (op == "list") {
        let srv_name = this.Get_Param(params, "Missing server name.");
        project.cProject.List_Projects(srv_name, function() {
          component.command_ctrl.prompt();
        });
      }
      else if (op == "exit") {
        this.command_ctrl.close();
      }
      else {
        throw new Error("Invalid command " + op + ".");
      }
    }
    catch (error) {
      console.log(error.message);
      this.command_ctrl.prompt();
    }
  }

  /**
   * Grabs a single parameter from the list of parameters.
   * @param params The parameters.
   * @param message The error message to report.
   * @return The parameter text.
   * @throws An error if there are no more parameters.
   */
  Get_Param(params, message) {
    nerd.Check_Condition((params.length > 0), message);
    return params.shift();
  }

  /**
   * Runs the Nerd command interpreter.
   */
  Run() {
    console.log("Frankus the Nerd Command Interpreter");
    console.log("Programmed by Francois Lamini");
    console.log("");
    // Start command line query.
    this.command_ctrl.prompt();
  }

}

// *****************************************************************************
// Entry Point
// *****************************************************************************

nerd.Check_Condition((process.argv.length == 3), "Missing server name.");
let server_name = process.argv[2];
let nerd_command = new cNerd(server_name);
nerd_command.Run();
