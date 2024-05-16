// ============================================================================
// Project Archive Tool
// Programmed by Francois Lamini
// ============================================================================

let http = require("http");
let nerd = require("./Backend");

// *****************************************************************************
// Project Implementation
// *****************************************************************************

class cProject {

  /**
   * Creates a new project tool.
   * @param name The name of the project to manage.
   * @param server The name of the server where the project is.
   */
  constructor(name, server) {
    this.project = name;
    this.config = new nerd.cConfig(server);
    this.mime = new nerd.cMime_Reader("Mime");
    this.modified = null;
  }

  /**
   * Generates a manifest file reading the current folder and subfolders.
   */
  Generate_Manifest() {
    nerd.cFile.Change_Folder("up/" + this.project); // Change to project folder.
    let file_list = nerd.cFile.Get_File_And_Folder_List("");
    let file = new nerd.cFile("Manifest.txt");
    file.Add_Lines(file_list);
    file.Write();
    nerd.cFile.Revert_Folder();
  }

  /**
   * Adds a folder to the manifest file.
   * @param folder The folder to add.
   */
  Add_Folder(folder) {
    nerd.cFile.Change_Folder("up/" + this.project);
    let file_list = nerd.cFile.Get_File_And_Folder_List(folder);
    file_list.unshift(nerd.cFile.Escape_Path(folder)); // Add in folder first.
    let manifest_file = new nerd.cFile("Manifest.txt");
    manifest_file.Read();
    manifest_file.Add_Lines(file_list);
    manifest_file.Write();
    nerd.cFile.Revert_Folder();
  }

  /**
   * Generates a resource file list.
   */
  Generate_Resources() {
    nerd.cFile.Change_Folder("up/" + this.project);
    let file_list = nerd.cFile.Get_File_And_Folder_List("");
    // Filter out files to extract images, sounds, and music tracks.
    let file_count = file_list.length;
    let files = [];
    for (let file_index = 0; file_index < file_count; file_index++) {
      let file = nerd.cFile.Get_File_Name(file_list[file_index]);
      let ext = nerd.cFile.Get_Extension(file_list[file_index]);
      if (ext.match(/png|bmp|mp3|pic|wav/)) {
        files.push(file);
      }
    }
    let file = new nerd.cFile("Resources.txt");
    file.Add_Lines(files);
    file.Write();
    nerd.cFile.Revert_Folder();
  }

  /**
   * Tries to create a project folder on the server.
   * @param project The project to create a folder for.
   * @param on_create Called when the folder is created, or not.
   */
  Create_Project_Folder(project, on_create) {
    let server = this.config.Get_Property("server");
    let port = this.config.Get_Property("port");
    http.get("http://" + server + ":" + port + "/create-folder?folder=" + encodeURIComponent("up/" + project), function(response) {
      if (response.statusCode == 200) {
        response.setEncoding("utf8");
        let message = "";
        response.on("data", function(chunk) {
          message += chunk;
        });
        response.on("end", function() {
          console.log(message);
          on_create();
        });
      }
      else {
        on_create();
      }
    });
  }

  /**
   * Uploads a project to the server.
   * @param on_upload Called when the project is finished uploading.
   */
  Upload_Project(on_upload) {
    nerd.cFile.Change_Folder("up");
    // Create the project folder.
    let component = this;
    this.Create_Project_Folder(this.project, function() {
      nerd.cFile.Change_Folder(component.project); // Change to new project folder.
      let manifest = new nerd.cFile("Manifest.txt");
      manifest.Read();
      let file_list = manifest.lines.concat("Manifest.txt"); // Add in manifest.
      component.modified = new nerd.cConfig("Modified");
      component.Upload_File(file_list, 0, function() {
        console.log("Uploaded project " + component.project + ".");
        component.modified.Save();
        nerd.cFile.Revert_Folder();
        on_upload();
      });
    });
  }

  /**
   * Uploads a file onto the nerd server and into the project folder.
   * @param file_list The list of files to upload.
   * @param index The index of the file to upload.
   * @param on_upload Called when the files have finished uploading.
   */
  Upload_File(file_list, index, on_upload) {
    if (index < file_list.length) {
      let file = file_list[index];
      let url_file = nerd.cFile.To_URL_Path("up/" + this.project + "/" + file);
      let modified = nerd.cFile.Get_File_Modified_Time(file);
      let needs_upload = false; 
      let ext = nerd.cFile.Get_Extension(file);
      let base_name = nerd.cFile.Get_File_Name(file);
      let server = this.config.Get_Property("server");
      let port = this.config.Get_Property("port");
      let component = this;
      // Determine if file needs to be uploaded.
      if (this.modified.Has_Property(file)) {
        if (this.modified.Get_Property(file) != modified) {
          needs_upload = true;
        }
      }
      else { // Not entered? We need to upload.
        needs_upload = true;
      }
      if (base_name == "Modified.txt") {
        needs_upload = false;
      }
      if (needs_upload) {
        if (base_name.match(/^\w+$/)) { // Folder.
          http.get("http://" + server + ":" + port + "/create-folder?folder=" + encodeURIComponent("up/" + this.project + "/" + file), function(response) {
            if (response.statusCode == 200) {
              response.setEncoding("utf8");
              let message = "";
              response.on("data", function(chunk) {
                message += chunk;
              });
              response.on("end", function() {
                console.log(message);
                component.Upload_File(file_list, index + 1, on_upload);
              });
            }
            else {
              component.Upload_File(file_list, index + 1, on_upload);
            }
          });
        }
        else if (this.mime.Has_Mime_Type(ext)) {
          // Update modification time.
          this.modified.Set_Property(file, modified);
          // Upload the file.
          let mime = this.mime.Get_Mime_Type(ext);
          let file_reader = new nerd.cFile(file);
          let data = null;
          if (mime.binary) {
            file_reader.Read_Binary();
            if (file_reader.error.length == 0) {
              data = file_reader.buffer.toString("base64");
            }
            else {
              console.log(file_reader.error);
            }
          }
          else { // Text
            file_reader.Read();
            if (file_reader.error.length == 0) {
              data = file_reader.data;
            }
            else {
              console.log(file_reader.error);
            }
          }
          let post = "data=" + encodeURIComponent(data);
          let request = http.request({
            hostname: server,
            port: port,
            path: "/" + url_file,
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": Buffer.byteLength(post)
            }
          }, function(response) {
            let message = "";
            response.setEncoding("utf8");
            response.on("data", function(chunk) {
              message += chunk;
            });
            response.on("end", function() {
              console.log(message);
              component.Upload_File(file_list, index + 1, on_upload);
            });
          });
          request.on("error", function(error) {
            console.log(error.message);
            component.Upload_File(file_list, index + 1, on_upload);
          });
          request.write(post);
          request.end();
        }
        else { // Go to the next file.
          this.Upload_File(file_list, index + 1, on_upload);
        }
      }
      else {
        this.Upload_File(file_list, index + 1, on_upload);
      }
    }
    else {
      on_upload();
    }
  }

  /**
   * Downloads the current project from the server.
   * @param on_download Called when the project is finished downloading.
   */
  Download_Project(on_download) {
    nerd.cFile.Change_Folder("up");
    let component = this;
    nerd.cFile.Create_Folder(this.project);
    nerd.cFile.Change_Folder(this.project);
    // Download manifest.
    component.Download_File([ "Manifest.txt" ], 0, function() { // Download manifest first.
      let manifest = new nerd.cFile("Manifest.txt");
      manifest.Read();
      let file_list = manifest.lines;
      component.Download_File(file_list, 0, function() {
        console.log("Downloaded project " + component.project + ".");
        nerd.cFile.Revert_Folder();
        on_download();
      });
    });
  }

  /**
   * Downloads a file.
   * @param file_list The list of files to download.
   * @param index The starting index.
   * @param on_download Called when the downloads have finished.
   */
  Download_File(file_list, index, on_download) {
    if (index < file_list.length) {
      let file = file_list[index];
      let file_name = nerd.cFile.Get_File_Name(file);
      if (file_name.match(/^\w+$/)) { // A folder.
        nerd.cFile.Create_Folder(file_name); // Create the folder.
        console.log("Created folder " + file + ".");
        this.Download_File(file_list, index + 1, on_download);
      }
      else { // Normal file.
        let url_file = nerd.cFile.To_URL_Path(file);
        let ext = nerd.cFile.Get_Extension(file);
        if (this.mime.Has_Mime_Type(ext)) {
          let server = this.config.Get_Property("server");
          let port = this.config.Get_Property("port");
          let url = "http://" + server + ":" + port + "/up/" + encodeURIComponent(this.project) + "/" + encodeURIComponent(url_file);
          let component = this;
          http.get(url, function(response) {
            if (response.statusCode == 200) {
              let data = [];
              response.on("data", function(chunk) {
                data.push(chunk);
              });
              response.on("end", function() {
                let mime = component.mime.Get_Mime_Type(ext);
                let file_writer = new nerd.cFile(file);
                if (mime.binary) {
                  file_writer.buffer = Buffer.concat(data);
                  file_writer.Write_From_Buffer();
                }
                else {
                  file_writer.data = data.join("");
                  file_writer.Write_From_Data();
                }
                console.log("Wrote out file " + file + ".");
                component.Download_File(file_list, index + 1, on_download);
              });
            }
            else {
              component.Download_File(file_list, index + 1, on_download);
            }
          });
        }
        else { // File type not defined?
          this.Download_File(file_list, index + 1, on_download);
        }
      }
    }
    else {
      on_download();
    }
  }

  /**
   * Compiles a C++ program with Allegro for Windows.
   * @param on_compile Called when the program is done compiling.
   */
  Compile_Cpp_With_Allegro_For_Windows(on_compile) {
    nerd.cFile.Change_Folder("up/" + this.project);
    let library = "-LC:\\mingw64\\lib";
    let include = "-IC:\\mingw64\\include";
    let libs = [ "-lallegro_monolith-static",
                 "-static",
                 "-lwebp",
                 "-ljpeg",
                 "-lphysfs",
                 "-lfreetype",
                 "-lpng16",
                 "-lzlibstatic",
                 "-ltheora",
                 "-lvorbisfile",
                 "-lvorbis",
                 "-logg",
                 "-lOpenAL32.dll",
                 "-ldsound",
                 "-lgdiplus",
                 "-luuid",
                 "-lkernel32",
                 "-lwinmm",
                 "-lpsapi",
                 "-lopengl32",
                 "-lglu32",
                 "-luser32",
                 "-lcomdlg32",
                 "-lgdi32",
                 "-lshell32",
                 "-lole32",
                 "-ladvapi32",
                 "-lws2_32",
                 "-lshlwapi",
                 "-static-libstdc++",
                 "-static-libgcc" ];
    if (nerd.cFile.Does_File_Exist(this.project + ".cpp")) {
      if (nerd.cFile.Does_File_Exist("Icon.rc")) {
        let shell = new nerd.cShell();
        let batch = [
          "windres Icon.rc -O coff -o Icon.res",
          "g++ -o " + this.project + " " + this.project + ".cpp " + library + " " + include + " Icon.res " + libs.join(" ")
        ];
        shell.Execute_Batch(batch, 0, function() {
          console.log("Compilation complete!");
          nerd.cFile.Revert_Folder();
          on_compile();
        });
      }
    }
  }

  /**
   * Lists all projects on the server.
   * @param srv_name The name of the server where the projects reside.
   * @param on_list Called when all projects are listed.
   */
  static List_Projects(srv_name, on_list) {
    if (srv_name == "local") {
      let projects = nerd.cFile.Query_Files("up", "folders");
      let project_count = projects.length;
      for (let project_index = 0; project_index < project_count; project_index++) {
        let project = projects[project_index];
        console.log(project);
      }
      on_list();
    }
    else {
      let config = new nerd.cConfig(srv_name);
      let server = config.Get_Property("server");
      let port = config.Get_Property("port");
      http.get("http://" + server + ":" + port + "/query-files?folder=up&search=folders", function(response) {
        let data = [];
        response.on("data", function(chunk) {
          data.push(chunk);
        });
        response.on("end", function() {
          let projects = nerd.Split(data.join(""));
          let project_count = projects.length;
          for (let project_index = 0; project_index < project_count; project_index++) {
            let project = projects[project_index];
            console.log(project);
          }
          on_list();
        });
      });
    }
  }

}

// *****************************************************************************
// Exports
// *****************************************************************************

module.exports = {
  cProject: cProject
};
