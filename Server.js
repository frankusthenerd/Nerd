// ============================================================================
// Nerd Server
// Programmed by Francois Lamini
// ============================================================================

let http = require("http");
let querystring = require("querystring");
let nerd = require("./Backend");

// *****************************************************************************
// Server Implementation
// *****************************************************************************

class cServer {

  /**
   * Creates a new server.
   * @param name The name of the server.
   */
  constructor(name) {
    let component = this;
    this.mime = new nerd.cMime_Reader("Mime");
    this.config = new nerd.cConfig(name);
    this.log = new nerd.cLog(name);
    this.server = http.createServer(function(request, response) {
      try {
        component.Handle_Request(request, response);
      }
      catch (error) {
        component.log.Log(error.message);
      }
    });
    this.server.on("dropRequest", function(request, socket) {
      component.log.Log("Request dropped.");
    });
    this.server.on("clientError", function(error, socket) {
      socket.end(error.message);
    });
  }

  /**
   * Reads a file from the server.
   * @param file The file to be processed.
   * @param response The response to be populated.
   * @param params Extra parameters passed to the file.
   * @throws An error if the file type is not found in the MIME table.
   */
  Read_File(file, response, params) {
    let status = 0;
    let mime_type = "text/plain";
    let binary = false;
    let ext = nerd.cFile.Get_Extension(file);
    let mime = this.mime.Get_Mime_Type(ext);
    let input_file = new nerd.cFile(file);
    if (mime.binary) {
      input_file.Read_Binary();
    }
    else {
      input_file.Read();
    }
    if (input_file.error.length == 0) {
      status = 200;
      mime_type = mime.type;
      binary = mime.binary;
    }
    else {
      this.log.Log(input_file.error);
      status = 404;
    }
    if (file == "Readme.txt") {
      mime_type = "text/html";
    }
    response.writeHead(status, {
      "Content-Type": mime_type
    });
    if (binary) {
      response.end(input_file.buffer, "binary");
    }
    else {
      let text = input_file.data;
      if (file == "Readme.txt") {
        text = this.Render_Markdown(file, text);
      }
      response.end(text);
    }
  }

  /**
   * Writes a file to the server.
   * @param file The file to write to the server.
   * @param response The server response object.
   * @param params The parameters passed to the file.
   */
  Write_File(file, response, params) {
    let ext = nerd.cFile.Get_Extension(file);
    let mime_type = "text/plain";
    let message = "";
    let status = 0;
    nerd.Check_Condition((params.data != undefined), "No data parameter passed.");
    let data = params.data;
    let output_file = new nerd.cFile(file);
    let mime = this.mime.Get_Mime_Type(ext);
    if (!mime.binary) { // Text file.
      // Save the file.
      output_file.data = data;
      output_file.Write_From_Data();
    }
    else { // Binary file.
      // Save the binary code.
      output_file.data = data;
      output_file.Write_Binary();
    }
    if (output_file.error.length == 0) {
      message = "Wrote " + file + ".";
      status = 200;
    }
    else {
      message = "Write Error: " + output_file.error;
      status = 404;
    }
    // Write server output.
    response.writeHead(status, {
      "Content-Type": mime_type
    });
    response.end(message);
  }

  /**
   * Creates a new folder if one does not exist.
   * @param params The parameter object with the passed in folder.
   * @param response The response object.
   */
  Create_Folder(params, response) {
    let folder = params.folder || "";
    nerd.cFile.Create_Folder(folder);
    let message = "Created folder: " + folder;
    let status = 200;
    // Write server output.
    response.writeHead(status, {
      "Content-Type": "text/plain"
    });
    response.end(message);
  }

  /**
   * Queries a group of files in a directory or a group of folders.
   * @param params The parameter object containing the folder and search.
   * @param response The server response.
   */
  Query_Files(params, response) {
    let folder = params.folder || "";
    let search = params.search || "";
    let file_list = nerd.cFile.Query_Files(folder, search);
    let output = file_list.join("\n");
    let status = 200;
    // Write server output.
    response.writeHead(status, {
      "Content-Type": "text/plain"
    });
    response.end(output);
  }

  /**
   * Renders markdown into HTML.
   * @param title The title of the document.
   * @param text The markdown text to render.
   * @return The HTML block.
   */
  Render_Markdown(title, text) {
    let markdown = nerd.Format(text);
    let html = [
      '<html>',
      '<head>',
      '<title>' + title + '</title>',
      '<style type="text/css">',
      '@import url("Markdown.css")',
      '</style>',
      '<link rel="icon" href="Icon.ico" type="image/x-icon" />',
      '</head>',
      '<body>',
      '<div class="Container">',
      markdown,
      '</div>',
      '</body>',
      '</html>'
    ];
    return html.join("\n");
  }

  /**
   * Handles a request from the server.
   * @param request The request object that is passed in.
   * @param response The response object that is passed in.
   */
  Handle_Request(request, response) {
    if (request.method == "GET") {
      let pair = request.url.split("?");
      let file = pair[0].substr(1);
      let params = querystring.parse((pair[1] == undefined) ? "" : pair[1]);
      if (file.match(/\w+\.\w+$/)) {
        this.Read_File(file, response, params);
      }
      else if (file == "create-folder") {
        this.Create_Folder(params, response);
      }
      else if (file == "query-files") {
        this.Query_Files(params, response);
      }
      else {
        this.Read_File("Readme.txt", response, params); // Default doc file.
      }
    }
    else if (request.method == "POST") {
      let component = this;
      let data = "";
      request.on("data", function(chunk) {
        data += chunk;
      });
      request.on("end", function() {
        let params = querystring.parse(data);
        let file = request.url.substr(1);
        if (file.match(/\w+\.\w+$/)) {
          try {
            component.Write_File(file, response, params);
          }
          catch (error) {
            response.writeHead(401, {
              "Content-Type": "text/plain"
            });
            response.end(error.message);
          }
        }
        else {
          response.writeHead(401, {
            "Content-Type": "text/plain"
          });
          response.end("Cannot write to odd files.");
        }
      });
    }
  }

  /**
   * Starts the server.
   */
  Start() {
    try {
      this.server.listen(this.config.Get_Property("port"));
    }
    catch (error) {
      this.log.Log(error.message);
    }
  }

}

// *****************************************************************************
// Exports
// *****************************************************************************

module.exports = {
  cServer: cServer
};
