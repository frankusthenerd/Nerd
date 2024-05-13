// =============================================================================
// Nerd JavaScript Library (Backend)
// Programmed by Francois Lamini
// =============================================================================

let fs = require("fs");
let path = require("path");
let child_process = require("child_process");

// *****************************************************************************
// File Implementation
// *****************************************************************************

class cFile {

  static startup = process.cwd();
  static saved_startup = process.cwd();

  /**
   * Creates a file module.
   * @param name The name of the file.
   */
  constructor(name) {
    this.file = name;
    this.lines = [];
    this.data = "";
    this.message = "";
    this.error = "";
    this.pointer = 0;
    this.buffer = null;
  }

  /**
   * Reads the contents of the file.
   */
  Read() {
    try {
      this.data = fs.readFileSync(cFile.Get_Local_Path(this.file), "utf8");
      this.lines = Split(this.data);
    }
    catch (error) {
      this.error = error.message;
    }
  }

  /**
   * Reads binary data. Only the buffer is populated.
   */
  Read_Binary() {
    try {
      this.buffer = fs.readFileSync(cFile.Get_Local_Path(this.file));
    }
    catch (error) {
      this.error = error.message;
    }
  }

  /**
   * Writes the contents of a file.
   */
  Write() {
    this.data = this.lines.join("\n");
    this.Write_From_Data();
  }

  /**
   * Writes the file from the data.
   */
  Write_From_Data() {
    try {
      fs.writeFileSync(cFile.Get_Local_Path(this.file), this.data);
    }
    catch (error) {
      this.error = error.message;
    }
  }

  /**
   * Writes binary data.
   */
  Write_Binary() {
    this.buffer = Buffer.from(this.data, "base64");
    this.Write_From_Buffer();
  }

  /**
   * Writes the data from the buffer.
   */
  Write_From_Buffer() {
    try {
      fs.writeFileSync(cFile.Get_Local_Path(this.file), this.buffer);
    }
    catch (error) {
      this.error = error.message;
    }
  }

  /**
   * Adds a line to the file.
   * @param line The line to add.
   */
  Add(line) {
    this.lines.push(line);
  }

  /**
   * Adds a bunch of lines to the file.
   * @param lines The list of lines to add.
   */
  Add_Lines(lines) {
    this.lines = this.lines.concat(lines);
  }

  /**
   * Adds an object to the file.
   * @param object The object to add to the file.
   */
  Add_Object(object) {
    this.Add("object");
    for (let field in object) {
      let value = object[field];
      this.Add(field + "=" + value);
    }
    this.Add("end");
  }

  /**
   * Removes a line at a specified index.
   * @param index The index of the line to remove.
   * @throws An error if the index is not valid.
   */
  Remove(index) {
    Check_Condition(((index >= 0) && (index < this.lines.length)), "Cannot remove line that does not exist.");
    this.lines.splice(index, 1);
  }

  /**
   * Gets the number of lines in the file.
   * @return The number of lines in the file.
   */
  Count() {
    return this.lines.length;
  }

  /**
   * Gets the string at the index.
   * @param index The index of the string.
   * @return The string at the index.
   * @throws An error if the string is not present.
   */
  Get_Line_At(index) {
    Check_Condition(((index >= 0) && (index < this.lines.length)), "Cannot remove line that does not exist.");
    return this.lines[index];
  }
  
  /**
   * Gets a line from the file sequentially.
   * @return The read line.
   * @throws An error if no more lines can be read.
   */
  Get_Line() {
    Check_Condition(this.Has_More_Lines(), "No more lines to read.");
    return this.lines[this.pointer++];
  }

  /**
   * Reads a numeric value from an index.
   * @return The number read.
   * @throws An error if the number could not be read.
   */
  Get_Number() {
    Check_Condition(this.Has_More_Lines(), "No more lines to read.");
    return parseInt(this.lines[this.pointer++]);
  }

  /**
   * Reads an object from the file.
   * @param object The object to read in.
   * @throws An error if the object could not be read.
   */
  Get_Object(object) {
    Check_Condition(this.Has_More_Lines(), "No more lines to read.");
    let line = this.lines[this.pointer++];
    Check_Condition((line == "object"), "Object identifier missing.");
    while (line != "end") {
      Check_Condition(this.Has_More_Lines(), "No more lines to read.");
      line = this.lines[this.pointer++];
      let pair = line.split("=");
      if (pair.length == 2) {
        let name = pair[0];
        let value = pair[1];
        if (!isNaN(value)) {
          object[name] = parseInt(value);
        }
        else {
          object[name] = value;
        }
      }
    }
  }

  /**
   * Clears out the file's lines.
   */
  Clear() {
    this.lines = [];
    this.pointer = 0;
  }
  
  /**
   * Determines if a file has more lines.
   * @return True if there are more lines, false otherwise.
   */
  Has_More_Lines() {
    return (this.pointer < this.lines.length);
  }

  /**
   * Gets the extension of the given file.
   * @param file The file path.
   * @return The file extension without the dot.
   */
  static Get_Extension(file) {
    return cFile.Escape_Path(file).split(path.sep).pop().replace(/^\w+\./, "");
  }

  /**
   * Gets the name of a file.
   * @param file The file to get the name of.
   * @return The name of the file.
   */
  static Get_File_Name(file) {
    return cFile.Escape_Path(file).split(path.sep).pop();
  }

  /**
   * Gets the title of the file.
   * @param file The file to get the title of.
   * @return The title of the file.
   */
  static Get_File_Title(file) {
    return cFile.Get_File_Name(file).replace(/\.\w+$/, "");
  }

  /**
   * Gets the local path given the folder.
   * @param folder The folder path.
   * @return The platform depend OS path.
   */
  static Get_Local_Path(folder) {
    let folders = cFile.startup.split(path.sep).concat(cFile.Escape_Path(folder).split(path.sep));
    let new_folders = [];
    let folder_count = folders.length;
    for (let folder_index = 0; folder_index < folder_count; folder_index++) {
      if (folders[folder_index] == "up") {
        // Remove previous folder.
        new_folders.pop();
      }
      else {
        new_folders.push(folders[folder_index]);
      }
    }
    return new_folders.join(path.sep);
  }

  /**
   * Escapes a folder path to platform independent path separators.
   * @param folder The folder path.
   * @return The path that is platform independent.
   */
  static Escape_Path(folder) {
    return folder.replace(/(\/|\\|:)/g, path.sep);
  }

  /**
   * Creates a new folder.
   * @param folder The folder to create.
   */
  static Create_Folder(folder) {
    try {
      let dest = cFile.Get_Local_Path(folder);
      fs.mkdirSync(dest, {
        recursive: true
      });
    }
    catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Queries a group of files in a directory or a group of folders.
   * @param folder The folder to look for files.
   * @param search The search string. Used Nerd wildcards.
   * @return The list of files in the folder.
   */
  static Query_Files(folder, search) {
    let file_list = [];
    try {
      folder = cFile.Escape_Path(folder);
      // Remove trailing slash.
      folder = (folder[folder.length - 1] == path.sep) ? folder.substr(0, folder.length - 1) : folder;
      let dest = cFile.Get_Local_Path(folder);
      let files = fs.readdirSync(dest);
      // Process files to determine if they are directories.
      let file_count = files.length;
      for (let file_index = 0; file_index < file_count; file_index++) {
        let file = files[file_index];
        let dir = path.join(dest, file);
        let stats = fs.lstatSync(dir);
        if (!stats.isDirectory()) {
          if (search == "all") { // All keys.
            file_list.push(file);
          }
          else if (search.match(/,/)) { // List of extensions.
            let list = search.replace(/,/g, "|");
            if (file.match(new RegExp("\\.(" + list + ")$"), "")) {
              file_list.push(file);
            }
          }
          else if (search.match(/^\*\w+$/)) { // File extension.
            let query = search.replace(/^\*/, "");
            if (file.match(new RegExp("\\w+\\." + query + "$"), "")) {
              file_list.push(file);
            }
          }
          else if (search.match(/^\*\w+\.\w+$/)) { // File pattern.
            let query = search.replace(/^\*/, "");
            if (file.match(new RegExp(query + "$"), "")) {
              file_list.push(file);
            }
          }
          else if (search.match(/^@\w+$/)) { // Random pattern.
            let query = search.replace(/^@/, "");
            if (file.indexOf(query) != -1) {
              file_list.push(file);
            }
          }
        }
        else { // Directory read.
          if (search == "folders") {
            if ((file.indexOf(".") == -1) && (file.indexOf("..") == -1)) {
              file_list.push(file);
            }
          }
        }
      }
    }
    catch (error) {
      console.log(error.message);
    }
    return file_list;
  }

  /**
   * Grabs the list of files from the folder including the subfolders.
   * @param folder The folder to look in.
   * @param exclude An optional parameter to exclude a list of folders.
   * @return The list of files and folders.
   */
  static Get_File_And_Folder_List(folder, exclude) {
    let file_list = [];
    try {
      let files = fs.readdirSync(cFile.Get_Local_Path(folder));
      let file_count = files.length;
      for (let file_index = 0; file_index < file_count; file_index++) {
        let file = path.join(cFile.Escape_Path(folder), files[file_index]);
        let stats = fs.statSync(cFile.Get_Local_Path(file));
        if (stats.isDirectory()) {
          let skip_folder = false;
          if (exclude != undefined) {
            let exclude_count = exclude.length;
            for (let exclude_index = 0; exclude_index < exclude_count; exclude_index++) {
              if (cFile.Escape_Path(exclude[exclude_index]).indexOf(file) != -1) { // Check for pattern match.
                skip_folder = true;
                break;
              }
            }
          }
          if (!skip_folder) {
            file_list.push(file);
            var sub_file_list = cFile.Get_File_And_Folder_List(file, exclude);
            file_list = file_list.concat(sub_file_list);
          }
        }
        else {
          file_list.push(file);
        }
      }
    }
    catch (error) {
      console.log(error.message);
    }
    return file_list;
  }

  /**
   * Changes to a specific folder.
   * @param folder The folder to change to.
   */
  static Change_Folder(folder) {
    cFile.startup = cFile.Get_Local_Path(folder);
  }

  /**
   * Reverts back to the original startup folder.
   */
  static Revert_Folder() {
    cFile.startup = cFile.saved_startup;
  }

  /**
   * Gets the modification time of a file.
   * @param file The file to get the modification time for.
   * @return The modification time of the file.
   */
  static Get_File_Modified_Time(file) {
    let modification_time = "";
    try {
      let stats = fs.statSync(cFile.Get_Local_Path(file));
      modification_time = stats.mtime;
    }
    catch (error) {
      console.log(error.message);
    }
    return modification_time;
  }

  /**
   * Converts a path to a URL path.
   * @param file The file to convert.
   * @return The URL file path.
   */
  static To_URL_Path(file) {
    return cFile.Escape_Path(file).replace(path.sep, "/");
  }

  /**
   * Checks to see if a file exists.
   * @param file The file to check.
   * @return True if the file exists, false otherwise.
   */
  static Does_File_Exist(file) {
    let exists = false;
    try {
      exists = fs.existsSync(cFile.Get_Local_Path(file));
    }
    catch (error) {
      console.log(error.message);
    }
    return exists;
  }

  /**
   * Copies a file from source to dest.
   * @param source The source file to copy.
   * @param dest The destination file.
   */
  static Copy_File(source, dest) {
    try {
      fs.copyFileSync(cFile.Get_Local_Path(source), cFile.Get_Local_Path(dest));
    }
    catch (error) {
      console.log(error.message);
    }
  }

}

// *****************************************************************************
// Config Implementation
// *****************************************************************************

class cConfig {

  /**
   * Creates a new config module.
   * @param name The name of the config file.
   */
  constructor(name) {
    this.config = {};
    this.name = name;
    this.properties = [];
    let file = new cFile(name + ".txt");
    file.Read();
    let line_count = file.lines.length;
    for (let line_index = 0; line_index < line_count; line_index++) {
      let line = file.lines[line_index];
      let pair = line.split("=");
      if (pair.length == 2) {
        let name = pair[0];
        let value = pair[1];
        if (!isNaN(pair[1])) {
          value = parseInt(pair[1]);
        }
        this.config[name] = value;
        this.properties.push(name);
      }
    }
  }

  /**
   * Gets a numeric property value.
   * @param name The name of the property.
   * @return The value of the property.
   * @throws An error if the property does not exist.
   */
  Get_Property(name) {
    Check_Condition((this.config[name] != undefined), "Property value " + name + " does not exist.");
    return this.config[name];
  }

  /**
   * Determines if a property exists.
   * @param name The name of the property.
   * @return True if the property exists, false otherwise.
   */
  Has_Property(name) {
    return (this.config[name] != undefined);
  }

  /**
   * Sets the property of the config file.
   * @param name The name of the property to set.
   * @param value The value of the property to set.
   */
  Set_Property(name, value) {
    this.config[name] = value;
    this.properties.push(name);
  }

  /**
   * Saves the config file.
   */
  Save() {
    let file = new cFile(this.name + ".txt");
    for (let property in this.config) {
      let value = this.config[property];
      file.Add(property + "=" + value);
    }
    file.Write();
  }

}

// *****************************************************************************
// MIME Reader Implementation
// *****************************************************************************

class cMime_Reader extends cConfig {

  /**
   * Creates an MIME reader.
   * @param name The name of the MIME file.
   * @throws An error if the MIME file is not formatted correctly.
   */
  constructor(name) {
    super(name);
    this.mime = {};
    let prop_count = this.properties.length;
    for (let prop_index = 0; prop_index < prop_count; prop_index++) {
      let property = this.properties[prop_index];
      let data = this.Get_Property(property);
      let pair = data.split(",");
      Check_Condition((pair.length == 2), "Mime data not formatted correctly.");
      this.mime[property] = {
        type: pair[0],
        binary: (pair[1] == "true") ? true : false
      };
    }
  }

  /**
   * Gets the MIME type associated with the given extension.
   * @param ext The extension associated with the MIME type.
   * @throws An error if the MIME type is invalid.
   */
  Get_Mime_Type(ext) {
    Check_Condition((this.mime[ext] != undefined), "MIME type " + ext + " is not defined.");
    return this.mime[ext];
  }

  /**
   * Determines if an MIME type exists.
   * @param ext The extension to check.
   * @return True if the MIME type exists, false otherwise.
   */
  Has_Mime_Type(ext) {
    return (this.mime[ext] != undefined);
  }

}

// *****************************************************************************
// Shell Implementation
// *****************************************************************************

class cShell {

  /**
   * Creates a shell to execute commands.
   */
  constructor() {
    this.command_log = [];
    this.command = null;
  }

  /**
   * Executes a command in the terminal.
   * @param command The command to run.
   * @param on_close Called when the command closes.
   */
  Execute_Command(command, on_close) {
    let params = command.split(/\s+/);
    let op = params.shift();
    this.command = child_process.spawn(op, params, {
      cwd: cFile.startup
    });
    let component = this;
    this.command.stdout.on("data", function(data) {
      component.command_log.push(data.toString("utf8"));
    });
    this.command.stderr.on("data", function(data) {
      component.command_log.push("Error: " + data.toString("utf8"));
    });
    this.command.on("close", function(code) {
      let log = new cFile(op + ".txt");
      log.Add_Lines(component.command_log);
      log.Write();
      on_close();
    });
  }

  /**
   * Executes a batch of commands.
   * @param commands The list of commands to execute.
   */
  Execute_Batch(commands, index, on_done) {
    if (index < commands.length) {
      let component = this;
      this.Execute_Command(commands[index], function() {
        component.Execute_Batch(commands, index + 1, on_done);
      });
    }
    else {
      on_done();
    }
  }

  /**
   * Closes the currently running command. Might not work in batch mode.
   */
  Close() {
    this.command.kill();
  }

}

// *****************************************************************************
// Log Implementation
// *****************************************************************************

class cLog extends cFile {

  /**
   * Creates a new log.
   * @param name The name of the log to create.
   */
  constructor(name) {
    super(name + "_Log.txt");
  }

  /**
   * Logs a message with the current time and date.
   * @param message The message to log.
   */
  Log(message) {
    let date = new Date();
    let time = date.toLocaleString();
    super.Add(time + ": " + message);
    super.Write(); // Save log on write.
  }

  /**
   * Prints out the contents of the log.
   */
  Print() {
    let line_count = this.lines.length;
    for (let line_index = 0; line_index < line_count; line_index++) {
      console.log(this.lines[line_index]);
    }
  }

}

// *****************************************************************************
// Utility Functions
// *****************************************************************************

/**
 * Splits text into lines regardless of the line endings.
 * @param data The text to be split.
 * @return An array of string representing the lines.
 */
function Split(data) {
  let lines = data.split(/\r\n|\r|\n/);
  // Remove any carrage return at the end.
  let line_count = lines.length;
  let blanks = 0;
  for (let line_index = line_count - 1; line_index >= 0; line_index--) { // Start from back.
    let line = lines[line_index];
    if (line.length == 0) {
      blanks++;
    }
    else {
      break;
    }
  }
  return lines.slice(0, line_count - blanks);
}

/**
 * Checks a condition to see if it passes otherwise an error is thrown.
 * @param condition The condition to check. 
 * @param error An error message for the condition fails.
 * @throws An error if the condition fails. 
 */
function Check_Condition(condition, error) {
  if (!condition) {
    throw new Error(error);
  }
}

/**
 * Converts a string into hex format.
 * @param string The string to convert.
 * @return The hex string.
 */
function String_To_Hex(string) {
  let hex_str = "";
  let length = string.length;
  for (let ch_index = 0; ch_index < length; ch_index++) {
    let ch_value = string.charCodeAt(ch_index);
    let hex_value = ch_value.toString(16).toUpperCase();
    if (hex_value.length == 1) {
      hex_value = "0" + hex_value;
    }
    hex_str += hex_value;
  }
  return hex_str;
}

/**
 * Formats text according to Wiki format.
 * @param text The wiki text to format into HTML.
 * @return HTML generated from wiki text.
 */
function Format(text) {
  return text.replace(/&/g, "&amp;")
             .replace(/>/g, "&gt;")
             .replace(/</g, "&lt;")
             .replace(/\*{2}/g, "&ast;")
             .replace(/#{2}/g, "&num;")
             .replace(/@{2}/g, "&commat;")
             .replace(/\${2}/g, "&dollar;")
             .replace(/%{2}/g, "&percnt;")
             .replace(/\^{2}/g, "&Hat;")
             .replace(/\|{2}/g, "&vert;")
             .replace(/@param\s+(\w+)/g, '<span class="parameter">$1</span>')
             .replace(/@return/g, '<span class="return">returns</span>')
             .replace(/@throws/g, '<span class="throws">throws</span>')
             .replace(/@see\s+(\w+:?\w*)/g, '<span class="see">see</span> <a href="hash=$1">$1</a>')
             .replace(/#([^#]+)#/g, "<b>$1</b>")
             .replace(/\*([^*]+)\*/g, "<i>$1</i>")
             .replace(/@([^@]+)@/g, "<h1>$1</h1>")
             .replace(/\$([^$]+)\$/g, "<h2>$1</h2>")
             .replace(/\^([^\^]+)\^/g, '<div class="table_head">$1</div>')
             .replace(/\|([^\|]+)\|/g, '<div class="table_data">$1</div>')
             .replace(/%([^%]+)%/g, "<code><pre>$1</pre></code>")
             .replace(/(http:\/\/\S+|https:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>')
             .replace(/image:\/\/(\S+)/g, '<img src="$1" />')
             .replace(/anchor:\/\/(\S+)/g, '<a name="$1"></a>')
             .replace(/\r\n|\r|\n/g, "<br />");
}

// *****************************************************************************
// Exports
// *****************************************************************************

module.exports = {
  cFile: cFile,
  cConfig: cConfig,
  cMime_Reader: cMime_Reader,
  cShell: cShell,
  cLog: cLog,
  Split: Split,
  Check_Condition: Check_Condition,
  String_To_Hex: String_To_Hex,
  Format: Format
};
