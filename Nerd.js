// ============================================================================
// Nerd Command Interpreter
// Programmed by Francois Lamini
// ============================================================================

let nerd = require("./Backend");
let server = require("./Server");
let project = require("./Project");
let coder_doc = require("./Coder_Doc");

/**
 * Processes a single nerd command.
 * @param params The parameters passed to the script. Hack off first two.
 */
function Nerd(params) {
  try {
    nerd.Check_Condition((params.length >= 1), "Missing command name.");
    let command = params[0];
    if (command == "-server") {
      nerd.Check_Condition((params.length == 2), "Missing server name.");
      let name = params[1];
      let nerd_srv = new server.cServer(name);
      nerd_srv.Start();
    }
    else if (command == "-project") {
      nerd.Check_Condition((params.length >= 3), "Missing project name and/or server name.");
      let name = params[1];
      let srv_name = params[2];
      let project_manager = new project.cProject(name, srv_name);
      nerd.Check_Condition((params.length >= 4), "Missing project command.");
      let prj_command = params[3];
      if (prj_command == "new-manifest") {
        project_manager.Generate_Manifest();
      }
      else if (prj_command == "add-folder") {
        nerd.Check_Condition((params.length == 5), "Missing folder name.");
        let folder = params[4];
        project_manager.Add_Folder(folder);
      }
      else if (prj_command == "generate-resources") {
        project_manager.Generate_Resources();
      }
      else if (prj_command == "upload") {
        project_manager.Upload_Project();
      }
      else if (prj_command == "download") {
        project_manager.Download_Project();
      }
      else if (prj_command == "compile-for-windows") {
        project_manager.Compile_Cpp_With_Allegro_For_Windows();
      }
      else {
        throw new Error("Invalid project command " + prj_command + ".");
      }
    }
    else if (command == "-coder-doc") {
      nerd.Check_Condition((params.length == 2), "Missing project name.");
      let name = params[1];
      let generator = new coder_doc.cCoder_Doc(name);
      generator.Process_Code();
    }
    else if (command == "-list") {
      let srv_name = params[1];
      project.cProject.List_Projects(srv_name);
    }
    else {
      throw new Error("Invalid command " + command + ".");
    }
  }
  catch (error) {
    console.log(error.message);
  }
}

// *****************************************************************************
// Entry Point
// *****************************************************************************

Nerd(process.argv.slice(2));
