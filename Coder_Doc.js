// ============================================================================
// Coder Doc Documentation Generator
// Programmed by Francois Lamini
// ============================================================================

let nerd = require("./Backend");

// *****************************************************************************
// Coder Doc Implementation
// *****************************************************************************

class cCoder_Doc {

  /**
   * Creates a new documentation generator.
   * @param project The associated project.
   */
  constructor(project) {
    this.project = project;
    this.docs_folder = "";
    this.copy_file_list = [
      "Coder_Doc.css",
      "Regular.ttf",
      "Regular_Bold.ttf",
      "Regular_Italic.ttf"
    ];
    this.copy_file_locs = [
      "",
      "Fonts",
      "Fonts",
      "Fonts"
    ];
  }

  /**
   * Processes a source code file and generates HTML code.
   * @param file The file to process the source.
   */
  Process_Source_File(file) {
    let title = nerd.cFile.Get_File_Title(file);
    let ext = nerd.cFile.Get_Extension(file);
    let file_reader = new nerd.cFile(file);
    file_reader.Read();
    let lines = file_reader.lines;
    let line_count = lines.length;
    let body = [];
    let function_list = [];
    let class_list = [];
    let comment = [];
    let function_hash = {};
    let class_hash = {};
    let last_class = "";
    for (let line_index = 0; line_index < line_count; line_index++) {
      let line = lines[line_index];
      if (line.match(/^\s*\/\*{2}/)) { // Beginning of JavaDoc comment.
        comment.push("\n");
      }
      else if (line.match(/^\s*\*\s+/)) { // Middle of JavaDoc comment.
        let trimmed_line = line.replace(/^\s*\*\s/, "") + "\n";
        comment.push(trimmed_line);
      }
      else if (line.match(/^\s*\*\//)) { // End of JavaDoc comment.
        comment.push("\n");
      }
      else if (line.match(/^\s*\*$/)) { // Empty line in comment.
        comment.push("\n");
      }
      else if (line.match(/^\s*function\s+\w+/)) { // JavaScript function.
        let function_def = line.replace(/^\s*function\s+/, "")
                              .replace(/\s*\{\s*$/, "");
        let function_name = function_def.replace(/\([^\)]*\)/, "");
        comment.unshift("@" + function_def + "@");
        comment.unshift("anchor://" + nerd.String_To_Hex(function_name) + " ");
        function_list.push('<a href="#' + nerd.String_To_Hex(function_name) + '">' + function_name + '</a><br />');
        console.log("Added function " + function_name + ".");
        // Store function code.
        function_hash[function_name] = nerd.String_To_Hex(function_name);
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*class\s+\w+/) && (ext == "js")) { // Class declaration.
        let class_name = line.replace(/^\s*class\s+(\w+).*$/, "$1");
        last_class = class_name;
        comment.unshift("@" + class_name + "@");
        comment.unshift("anchor://" + nerd.String_To_Hex(class_name) + " ");
        class_list.push('<a href="#' + nerd.String_To_Hex(class_name) + '">' + class_name + '</a><br />');
        console.log("Added class " + class_name + ".");
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*\w+\(/) && line.match(/\)\s*\{$/) && !line.match(/function/) && (ext == "js")) { // Class member function.
        let class_function_def = line.replace(/^\s*/, "")
                                    .replace(/\s*\{\s*$/, "");
        let class_function_name = class_function_def.replace(/\([^\)]*\)/, "");
        comment.unshift("$" + class_function_def + "$ ");
        // Make sure member functions do not match eachother or global functions.
        comment.unshift("anchor://" + nerd.String_To_Hex(last_class + class_function_name) + " ");
        class_list.push('<a href="#' + nerd.String_To_Hex(last_class + class_function_name) + '">&nbsp;&nbsp;&rdsh;' + class_function_name + '</a><br />');
        console.log("Added class function " + class_function_name + ".");
        class_hash[last_class + ":" + class_function_name] = nerd.String_To_Hex(last_class + class_function_name);
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*\w+:\s+function\([^\)]*\)\s*\{$/) && (ext == "js")) { // Prototype function member.
        let function_def = line.replace(/^\s*(\w+):\s+function\(([^\)]*)\)\s*\{\s*$/, "$1($2)");
        let function_name = line.replace(/^\s*(\w+):\s+function\([^\)]*\)\s*\{\s*$/, "$1");
        comment.unshift("@" + function_def + "@");
        comment.unshift("anchor://" + nerd.String_To_Hex(function_name) + " ");
        function_list.push('<a href="#' + nerd.String_To_Hex(function_name) + '">' + function_name + '</a><br />');
        console.log("Added function " + function_name + ".");
        function_hash[function_name] = nerd.String_To_Hex(function_name);
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*var\s+\$\w+/)) { // Global variable.
        let global_def = line.replace(/^\s*var\s+\$(\w+)\s+=\s+\S+;?.*$/, "$1");
        comment.unshift("$" + global_def + "$\n");
        console.log("Added global variable " + global_def + ".");
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*\S+\s+\w+\([^\)]*\)(\s+\{|)\s*$/) && ext.match(/cpp|hpp/)) { // C++ routine.
        let function_def = line.replace(/^\s*(\S+\s+\w+\([^\)]*\))(\s+\{|)\s*$/, "$1");
        let function_name = line.replace(/^\s*\S+\s+(\w+)\([^\)]*\)(\s+\{|)\s*$/, "$1");
        comment.unshift("@" + function_def + "@");
        comment.unshift("anchor://" + nerd.String_To_Hex(function_name) + " ");
        function_list.push('<a href="#' + nerd.String_To_Hex(function_name) + '">' + function_name + '</a><br />');
        console.log("Added function " + function_name + ".");
        // Store function code.
        function_hash[function_name] = nerd.String_To_Hex(function_name);
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*\S+\s+[^:]+::[^\(]+\([^\)]*\)(\s+\{|)\s*$/) && ext.match(/cpp|hpp/)) { // C++ class method.
        let function_def = line.replace(/^\s*(\S+\s+[^:]+::[^\(]+\([^\)]*\))(\s+\{|)\s*$/, "$1").replace(/\*/g, "**");
        let function_name = line.replace(/^\s*\S+\s+[^:]+::([^\(]+)\([^\)]*\)(\s+\{|)\s*$/, "$1");
        comment.unshift("@" + function_def + "@");
        comment.unshift("anchor://" + nerd.String_To_Hex(function_name) + " ");
        function_list.push('<a href="#' + nerd.String_To_Hex(function_name) + '">' + function_name + '</a><br />');
        console.log("Added function " + function_name + ".");
        // Store function code.
        function_hash[function_name] = nerd.String_To_Hex(function_name);
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*\w+::\w+\([^\)]*\)(\s+\{|\s+:\s*|\s+:\s+\w+\([^\)]*\)\s+\{)\s*$/) && ext.match(/cpp|hpp/)) { // C++ constructor.
        let function_def = line.replace(/^\s*\w+::(\w+\([^\)]*\))(\s+\{|\s+:\s*|\s+:\s+\w+\([^\)]*\)\s+\{)\s*$/, "$1").replace(/\*/g, "**");
        let function_name = line.replace(/^\s*\w+::(\w+)\([^\)]*\)(\s+\{|\s+:\s*|\s+:\s+\w+\([^\)]*\)\s+\{)\s*$/, "$1");
        comment.unshift("@" + function_def + "@");
        comment.unshift("anchor://" + nerd.String_To_Hex(function_name) + " ");
        function_list.push('<a href="#' + nerd.String_To_Hex(function_name) + '">' + function_name + '</a><br />');
        console.log("Added function " + function_name + ".");
        // Store function code.
        function_hash[function_name] = nerd.String_To_Hex(function_name);
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
      else if (line.match(/^\s*\w+::~\w+\([^\)]*\)\s+\{\s*$/) && ext.match(/cpp|hpp/)) { // C++ destructor.
        let function_def = line.replace(/^\s*\w+::(~\w+)\([^\)]*\)\s+\{\s*$/, "$1");
        let function_name = function_def;
        comment.unshift("@" + function_def + "@");
        comment.unshift("anchor://" + nerd.String_To_Hex(function_name) + " ");
        function_list.push('<a href="#' + nerd.String_To_Hex(function_name) + '">' + function_name + '</a><br />');
        console.log("Added function " + function_name + ".");
        // Store function code.
        function_hash[function_name] = nerd.String_To_Hex(function_name);
        // Add the comment to the body.
        body = body.concat(comment);
        comment = [];
      }
    }
    // Replace all hashes with codes.
    let formatted_body = nerd.Format(body.join(""));
    let hash_keys = formatted_body.match(/hash=\w+:?\w*/g);
    if (hash_keys) {
      let hash_key_count = hash_keys.length;
      for (let hash_index = 0; hash_index < hash_key_count; hash_index++) {
        let hash_key = hash_keys[hash_index].replace(/^hash=/, "");
        let code = "#";
        if (hash_key.match(/:/)) {
          code += class_hash[hash_key];
        }
        else { // Function hash.
          code += function_hash[hash_key];
        }
        if (code) {
          formatted_body = formatted_body.replace(/hash=\w+:?\w*/, code);
        }
      }
    }
    // Process the template here.
    this.Process_Template("Module_Template.html", title + "_" + ext + ".html", {
      title: title,
      api_list: function_list.join("\n") + class_list.join("\n"),
      api_body: formatted_body
    });
  }

  /**
   * Processes a wiki file.
   * @param file The file to process.
   */
  Process_Wiki_File(file) {
    let doc = nerd.cFile.Get_File_Title(file);
    let file_reader = new nerd.cFile(file);
    file_reader.Read();
    let wiki = nerd.Format(file_reader.data);
    this.Process_Template("Wiki_Template.html", doc + ".html", {
      document: doc,
      wiki_body: wiki
    });
    console.log("Processed file " + file + " into " + doc + ".");
  }

  /**
   * Processes a template into an HTML file.
   * @param template_name The name of the template file to be processed.
   * @param output_name The name of the output file.
   * @param config The config hash with the template variables.
   */
  Process_Template(template_name, output_name, config) {
    let file_reader = new nerd.cFile("up/Nerd/" + template_name);
    file_reader.Read();
    let template = file_reader.data;
    // Replace all template variables.
    for (let variable in config) {
      let value = config[variable];
      template = template.replace(new RegExp("%" + variable + "%", "g"), value);
    }
    // Write out template to file.
    let file_writer = new nerd.cFile(this.docs_folder + "/" + output_name);
    file_writer.data = template;
    file_writer.Write_From_Data();
  }

  /**
   * Processes the code into docs.
   * @return The output of the debug log.
   */
  Process_Code() {
    // Set project and documents folder.
    nerd.cFile.Change_Folder("up/" + this.project);
    this.docs_folder = "Docs";
    // Check for document folder.
    nerd.cFile.Create_Folder("Docs");
    console.log("Created " + this.docs_folder + " folder.");
    // Copy files into documents folder.
    let def_file_count = this.copy_file_list.length;
    for (let file_index = 0; file_index < def_file_count; file_index++) {
      let file = this.copy_file_list[file_index];
      let loc = this.copy_file_locs[file_index];
      let source = "up/Nerd/" + loc + "/" + file;
      let dest = this.docs_folder + "/" + file;
      nerd.cFile.Copy_File(source, dest);
      console.log("Copied file " + file + ".");
    }
    // Now process the files.
    let files = nerd.cFile.Get_File_And_Folder_List("");
    let file_count = files.length;
    let file_list = [];
    for (let file_index = 0; file_index < file_count; file_index++) {
      let file = files[file_index];
      let file_title = nerd.cFile.Get_File_Title(file);
      let ext = nerd.cFile.Get_Extension(file);
      if (ext.match(/js|cpp|hpp/)) { // Look for code files.
        this.Process_Source_File(file);
        file_list.push('<a href="' + file_title + '_' + ext + '.html">' + file + '</a>');
        console.log("File " + file + " added to index.");
      }
      else if (file == "Readme.txt") { // Process Readme file too.
        this.Process_Wiki_File(file);
        file_list.push('<a href="' + file_title + '.html">' + file + '</a>');
      }
    }
    // Process the Files index first.
    this.Process_Template("Files_Template.html", "Files.html", {
      file_list: file_list.join("<br />")
    });
    nerd.cFile.Revert_Folder();
  }

}

// *****************************************************************************
// Exports
// *****************************************************************************

module.exports = {
  cCoder_Doc: cCoder_Doc
};
