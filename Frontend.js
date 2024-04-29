// =============================================================================
// Nerd JavaScript Library (Frontend)
// Programmed by Francois Lamini
// =============================================================================

// *****************************************************************************
// File Implementation
// *****************************************************************************

class cFile {

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
    this.on_read = null;
    this.on_write = null;
    this.on_not_found = null;
    this.on_denied = null;
    this.pointer = 0;
  }

  /**
   * Reads the contents of the file.
   */
  Read() {
    let ajax = new XMLHttpRequest();
    let component = this;
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) { // Ok.
          component.data = ajax.responseText;
          component.lines = Split(component.data);
          if (component.on_read) {
            component.on_read();
          }
        }
        else if (ajax.status == 404) { // Not found.
          component.error = ajax.responseText;
          if (component.on_not_found) {
            component.on_not_found();
          }
        }
        else if (ajax.status == 401) { // Access denied.
          component.error = ajax.responseText;
          if (component.on_denied) {
            component.on_denied();
          }
        }
      }
    };
    ajax.open("GET", this.file, true);
    ajax.send(null);
  }

  /**
   * Writes the contents of a file.
   */
  Write() {
    let ajax = new XMLHttpRequest();
    let component = this;
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) { // Ok.
          component.message = ajax.responseText;
          if (component.on_write) {
            component.on_write();
          }
        }
        else if (ajax.status == 404) { // Not found.
          component.error = ajax.responseText;
          if (component.on_not_found) {
            component.on_not_found();
          }
        }
        else if (ajax.status == 401) { // Access denied.
          component.error = ajax.responseText;
          if (component.on_denied) {
            component.on_denied();
          }
        }
      }
    };
    this.data = this.lines.join("\n");
    ajax.open("POST", this.file, true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("data=" + encodeURIcomponent(this.data));
  }

  /**
   * Adds a line to the file.
   * @param line The line to add.
   */
  Add(line) {
    this.lines.push(line);
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
    if (line != "object") {
      throw new Error("Object identifier missing.");
    }
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

}

// *****************************************************************************
// Config Implementation
// *****************************************************************************

class cConfig {

  /**
   * Creates a new config module.
   * @param name The name of the config file.
   * @param on_load Called when the config file is loaded.
   */
  constructor(name, on_load) {
    this.config = {};
    this.properties = [];
    let component = this;
    let file = new cFile(name + ".txt");
    file.Read();
    file.on_read = function() {
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
          component.config[name] = value;
          component.properties.push(name);
        }
      }
      on_load();
    };
  }

  /**
   * Gets a numeric property value.
   * @param name The name of the property.
   * @return The value of the property.
   * @throws An error if the property does not exist.
   */
  Get_Property(name) {
    if (this.config[name] == undefined) {
      throw new Error("Property value " + name + " does not exist.");
    }
    return this.config[name];
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
             .replace(/image:\/\/(\S+)/g, '<img src="$1" width="90%" />')
             .replace(/anchor:\/\/(\S+)/g, '<a name="$1"></a>')
             .replace(/\r\n|\r|\n/g, "<br />");
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
