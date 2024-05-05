// =============================================================================
// Nerd JavaScript Library (Frontend)
// Programmed by Francois Lamini
// =============================================================================

const NO_VALUE_FOUND = -1;

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

  /**
   * Gets the extension of the given file.
   * @param file The file path.
   * @return The file extension without the dot.
   */
  static Get_Extension(file) {
    return file.split("/").pop().replace(/^\w+\./, "");
  }

  /**
   * Gets the name of a file.
   * @param file The file to get the name of.
   * @return The name of the file.
   */
  static Get_File_Name(file) {
    return file.split("/").pop();
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
   * Creates a new folder.
   * @param folder The folder to create.
   * @param on_create Called when the folder is created.
   */
  static Create_Folder(folder, on_create) {
    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) { // Ok.
          on_create();
        }
      }
    };
    ajax.open("GET", "create-folder?folder=" + encodeURIComponent(folder), true);
    ajax.send(null);
  }

  /**
   * Queries a set of files from the server.
   * @param folder The folder to search for the files.
   * @param search The search string.
   * @param on_query Called with the file list passed in.
   */
  static Query_Files(folder, search, on_query) {
    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) { // Ok.
          let file_list = Split(ajax.responseText);
          on_query(file_list);
        }
      }
    };
    ajax.open("GET", "query-files?folder=" + encodeURIComponent(folder) + "&search=" + encodeURIComponent(search), true);
    ajax.send(null);
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
// I/O Control Implementation
// *****************************************************************************

class cIO_Control {

  static key_map = {
    "Space":        "  ", // Space
    "Digit0":       "0)", // Numbers
    "Digit1":       "1!",
    "Digit2":       "2@",
    "Digit3":       "3#",
    "Digit4":       "4$",
    "Digit5":       "5%",
    "Digit6":       "6^",
    "Digit7":       "7&",
    "Digit8":       "8*",
    "Digit9":       "9(",
    "KeyA":         "aA", // Letters
    "KeyB":         "bB",
    "KeyC":         "cC",
    "KeyD":         "dD",
    "KeyE":         "eE",
    "KeyF":         "fF",
    "KeyG":         "gG",
    "KeyH":         "hH",
    "KeyI":         "iI",
    "KeyJ":         "jJ",
    "KeyK":         "kK",
    "KeyL":         "lL",
    "KeyM":         "mM",
    "KeyN":         "nN",
    "KeyO":         "oO",
    "KeyP":         "pP",
    "KeyQ":         "qQ",
    "KeyR":         "rR",
    "KeyS":         "sS",
    "KeyT":         "tT",
    "KeyU":         "uU",
    "KeyV":         "vV",
    "KeyW":         "wW",
    "KeyX":         "xX",
    "KeyY":         "yY",
    "KeyZ":         "zZ",
    "Backquote":    "`~", // Special Characters
    "Minus":        "-_",
    "Equal":        "=+",
    "BracketLeft":  "[{",
    "BracketRight": "]}",
    "Backslash":    "\\|",
    "Semicolon":    ";:",
    "Quote":        "'\"",
    "Comma":        ",<",
    "Period":       ".>",
    "Slash":        "/?"
  };
  static mouse_btn_map = {
    1: "left",
    2: "right",
    4: "middle"
  };

  /**
   * Creates a new I/O control.
   * @param canvas The canvas element name.
   * @param backbuffer The backbuffer element name.
   * @param sound_stack The container which will hold the sound stack.
   * @param on_frame Called when a single frame is rendered.
   */
  constructor(canvas, backbuffer, sound_stack, on_frame) {
    this.canvas = document.getElementById(canvas);
    this.backbuffer = document.getElementById(backbuffer);
    this.screen = this.canvas.getContext("2d");
    this.buffer = this.backbuffer.getContext("2d");
    this.use_canvas = false;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.signal_buffer = [];
    this.images = {};
    this.target = null;
    this.surface = null;
    this.Set_Canvas_Mode();
    this.sound_stack = document.getElementById(sound_stack);
    this.sounds = {};
    this.tracks = {};
    this.playing_track = "";
    this.timer = null;
    this.on_frame = on_frame;
    this.shift_mode = 0;
    this.stop_processing = false;
    // Event handlers here.
    let component = this;
    this.canvas.addEventListener("mousedown", function(event) {
      if (!component.stop_processing) {
        component.Process_Mouse(event)
      }
    }, false);
    this.canvas.addEventListener("mousemove", function(event) {
      if (!component.stop_processing) {
        component.Process_Mouse(event);
      }
    }, false);
    this.canvas.addEventListener("mouseup", function(event) {
      if (!component.stop_processing) {
        component.Process_Mouse(event);
      }
    }, false);
    window.addEventListener("keydown", function(event) {
      if (!component.stop_processing) {
        component.Process_Keys(event);
      }
    }, false);
    window.addEventListener("keyup", function(event) {
      if (!component.stop_processing) {
        component.Process_Keys(event);
      }
    }, false);
  }

  /**
   * Reads a signal from the signal buffer.
   * @return The signal from the signal buffer.
   */
  Read_Signal() {
    let signal = {
      code: "none",
      coords: {
        x: 0,
        y: 0
      },
      button: "none"
    };
    if (this.signal_buffer.length > 0) {
      signal = this.signal_buffer.shift();
    }
    return signal;
  }

  /**
   * Reads a key from the buffer. Leaves any other signals in.
   * @return The read key or nothing.
   */
  Read_Key() {
    let signal = {
      code: "none",
      coords: {
        x: 0,
        y: 0
      },
      button: "none"
    };
    // Find a key signal.
    let signal_count = this.signal_buffer.length;
    for (let signal_index = signal_count - 1; signal_count >= 0; signal_index--) { // Back to front.
      if (this.signal_buffer[signal_index].code != "mouse") {
        signal = this.signal_buffer.splice(signal_index, 1);
        break;
      }
    }
    return signal;
  }

  /**
   * Adds a key signal to the buffer.
   * @param key The key to add.
   */
  Add_Key(key) {
    this.signal_buffer.push({
      code: key,
      coords: {
        x: 0,
        y: 0
      },
      button: "none"
    });
  }

  /**
   * Adds a mouse signal.
   * @param button The pressed button or none.
   * @param x The mouse x coordinate.
   * @param y The mouse y coordinate.
   */
  Add_Mouse(button, x, y) {
    this.signal_buffer.push({
      code: "mouse",
      coords: {
        x: x,
        y: y
      },
      button: button
    });
  }

  /**
   * Draws an image to the screen.
   * @param name The name of the image.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param width The width of the image.
   * @param height The height of the image.
   * @param angle The angle in degrees.
   * @param flip_x If set flips the image on the x-axis.
   * @param flip_y If set flips the image on the y-axis.
   */
  Draw_Image(name, x, y, width, height, angle, flip_x, flip_y) {
    if (this.images[name] != undefined) {
      this.Set_Canvas_Mode();
      let image = this.images[name];
      let image_w = image.width;
      let image_h = image.height;
      let scale_x = Math.floor(width / image_w);
      let scale_y = Math.floor(height / image_h);
      this.surface.save(); // Save context.
      if (flip_x) {
        this.surface.translate(image_w, 0);
        this.surface.scale(-1, 1);
      }
      if (flip_y) {
        this.surface.translate(0, image_h);
        this.surface.scale(1, -1);
      }
      // Draw the image.
      if (angle > 0) {
        this.surface.rotate(angle * 3.14 / 180.0);
      }
      this.surface.scale(scale_x, scale_y);
      this.surface.restore(); // Restore context.
    }
    else {
      throw new Error("Could not draw image " + name + ".");
    }
  }

  /**
   * Draws the background canvas to the screen.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param width The width of the clipping rectangle.
   * @param height The height of the clipping rectangle.
   */
  Draw_Canvas(x, y, width, height) {
    this.screen.drawImage(this.backbuffer, 0, 0, width, height, x, y, width, height);
  }

  /**
   * Sets the canvas mode based on the flag.
   */
  Set_Canvas_Mode() {
    if (this.use_canvas) { // Indicates background canvas.
      this.target = this.backbuffer;
      this.surface = this.buffer;
    }
    else {
      this.target = this.canvas;
      this.surface = this.screen;
    }
  }

  /**
   * Sets the screen drawing mode.
   */
  Set_Screen_Target() {
    this.use_canvas = false;
  }

  /**
   * Sets the canvas drawing mode.
   */
  Set_Canvas_Target() {
    this.use_canvas = true;
  }

  /**
   * Outputs text to the screen at the specified coordinate.
   * @param text The text to output.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param red The red component.
   * @param green The green component.
   * @param blue The blue component.
   */
  Output_Text(text, x, y, red, green, blue) {
    this.Set_Canvas_Mode();
    this.surface.font = "14px Arial";
    this.surface.fillStyle = "rgb(" + red + ", " + green + ", " + blue + ")";
    this.surface.fillText(text, x, y);
  }

  /**
   * Draws a box.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param width The width of the box.
   * @param height The height of the box.
   * @param red The red component.
   * @param green The green component.
   * @param blue The blue component.
   */
  Box(x, y, width, height, red, green, blue) {
    this.Set_Canvas_Mode();
    this.surface.fillStyle = "rgb(" + red + ", " + green + ", " + blue + ")";
    this.surface.fillRect(x, y, width, height);
  }

  /**
   * Draws a frame.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param width The width of the box.
   * @param height The height of the box.
   * @param red The red component.
   * @param green The green component.
   * @param blue The blue component.
   */
  Frame(x, y, width, height, red, green, blue) {
    this.Set_Canvas_Mode();
    this.surface.fillStyle = "rgb(" + red + ", " + green + ", " + blue + ")";
    this.surface.strokeRect(x, y, width, height);
  }

  /**
   * Plays a sound by name.
   * @param name The name of the sound to play.
   * @throws A error if the sound cannot be played.
   */
  Play_Sound(name) {
    Check_Condition((this.sounds[name] != undefined), "Could not find sound " + name + ".");
    let sound = this.sounds[name];
    sound.play();
  }

  /**
   * Plays a music track.
   * @param name The name of the music track.
   * @throws An error if the music cannot be played.
   */
  Play_Music(name) {
    Check_Condition((this.tracks[name] != undefined), "Could not find track " + name + ".");
    let track = this.tracks[name];
    this.playing_track = name;
    track.loop = true;
    track.play();
  }

  /**
   * Stops all sounds and music.
   */
  Silence() {
    // Stop sounds.
    for (let name in this.sounds) {
      let sound = this.sounds[name];
      sound.pause();
      sound.currentTime = 0;
    }
    // Stop music.
    Check_Condition((this.tracks[this.playing_track] != undefined), "Could not find track " + this.playing_track + ".");
    let track = this.tracks[this.playing_track];
    track.pause();
    track.currentTime = 0;
  }

  /**
   * Creates a sound object in the sound stack.
   * @param db The sound database reference.
   * @param name The name of the sound to create.
   * @param file The file to load the sound from.
   */
  Create_Sound_Object(db, name, file) {
    let audio = document.createElement("audio");
    audio.src = file;
    db[name] = audio;
    this.sound_stack.appendChild(audio);
  }

  /**
   * Loads a list of resources from a file.
   * @param name The name of the file to load the resources from.
   * @param on_load Called when all the resources are loaded.
   */
  Load_Resources(name, on_load) {
    let resource_file = new cFile(name + ".txt");
    let component = this;
    resource_file.on_read = function() {
      component.Load_Resource(resource_file.lines, 0, on_load);
    };
    resource_file.Read();
  }

  /**
   * Loads a resource from the list of resources.
   * @param resources The list of resources.
   * @param index The index of the resource to load.
   * @param on_load Called when the resources are loaded.
   */
  Load_Resource(resources, index, on_load) {
    if (index < resources.length) {
      let file = resources[index];
      let component = this;
      let res_name = cFile.Get_File_Title(file);
      let ext = cFile.Get_Extension(file);
      if (ext == "png") {
        let image = new Image();
        image.src = file;
        image.onload = function() {
          component.Load_Resource(resources, index + 1, on_load);
        };
        this.images[res_name] = image;
      }
      else if (ext == "wav") {
        this.Create_Sound_Object(this.sounds, res_name, file);
        this.Load_Resource(resources, index + 1, on_load);
      }
      else if (ext == "mp3") {
        this.Create_Sound_Object(this.tracks, res_name, file);
        this.Load_Resource(resources, index + 1, on_load);
      }
      else {
        console.log("Invalid resource type " + ext + ".");
        this.Load_Resource(resources, index + 1, on_load);
      }
    }
    else {
      on_load();
    }
  }

  /**
   * Gets the width of the text.
   * @param text The text to measure.
   * @return The width of the text.
   */
  Get_Text_Width(text) {
    let metrics = this.surface.measureText(text);
    return metrics.width;
  }

  /**
   * Gets the height of the text.
   * @param text The text to measure.
   * @return The height of the text.
   */
  Get_Text_Height(text) {
    let metrics = this.surface.measureText(text);
    let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return height;
  }

  /**
   * Gets a new random number.
   * @param lower The lower bound.
   * @param upper The upper bound.
   * @return The random number.
   */
  Get_Random_Number(lower, upper) {
    return lower + Math.floor(Math.random() * (upper - lower + 1));
  }

  /**
   * Processes the keys.
   * @param event The event associated with the keys.
   */
  Process_Keys(event) {
    let key = event.code;
    if (key == "Enter") {
      this.Add_Key("enter");
    }
    else if (key == "Backspace") {
      this.Add_Key("backspace");
    }
    else if (key == "Delete") {
      this.Add_Key("delete");
    }
    else if (key == "ArrowLeft") {
      this.Add_Key("left");
    }
    else if (key == "ArrowRight") {
      this.Add_Key("right");
    }
    else if (key == "ArrowUp") {
      this.Add_Key("up");
    }
    else if (key == "ArrowDown") {
      this.Add_Key("down");
    }
    else if (key == "Home") {
      this.Add_Key("home");
    }
    else if (key == "End") {
      this.Add_Key("end");
    }
    else if (key == "Tab") {
      this.Add_Key("tab");
    }
    else if (key == "PageUp") {
      this.Add_Key("page-up");
    }
    else if (key == "PageDown") {
      this.Add_Key("page-down");
    }
    else if (key == "Escape") {
      this.Add_Key("escape");
    }
    else if (key.match(/Shift/)) {
      if (event.type == "keydown") {
        this.shift_mode = 1;
      }
      else if (event.type == "keyup") {
        this.shift_mode = 0;
      }
    }
    else { // Character keys.
      let character = cIO_Control.key_map[key].substr(this.shift_mode, 1);
      this.Add_Key(character);
    }
  }

  /**
   * Processes the mouse.
   * @param event The event associated with the mouse.
   */
  Process_Mouse(event) {
    if (event.type == "mousedown") {
      this.Add_Mouse(cIO_Control.mouse_btn_map[event.button], event.offsetX, event.offsetY);
    }
    else if (event.type == "mouseup") {
      this.Add_Mouse("up", event.offsetX, event.offsetY);
    }
    else if (event.type == "mousemove") {
      this.Add_Mouse("none", event.offsetX, event.offsetY);
    }
  }

  /**
   * Adds a key signal to the buffer.
   * @param key The key to add.
   */
  Add_Key(key) {
    this.signal_buffer.push({
      code: key,
      coords: {
        x: 0,
        y: 0
      },
      button: "none"
    });
  }

  /**
   * Adds a mouse signal.
   * @param button The pressed button or none.
   * @param x The mouse x coordinate.
   * @param y The mouse y coordinate.
   */
  Add_Mouse(button, x, y) {
    this.signal_buffer.push({
      code: "mouse",
      coords: {
        x: x,
        y: y
      },
      button: button
    });
  }

  /**
   * Starts the processing of the I/O control.
   */
  Start() {
    this.stop_processing = false;
    this.Set_FPS(20);
  }

  /**
   * Stops the processing of the I/O control.
   */
  Stop() {
    clearInterval(this.timer);
    this.timer = null;
    this.stop_processing = true; // Do not process events.
    this.signal_buffer = [];
  }

  /**
   * Sets the frames per second for throttling of the processing
   * callback function.
   * @param fps The number of frames per second that the processing callback with run at. 
   */
  Set_FPS(fps) {
    if (this.timer) {
      clearInterval(this.timer);
    }
    let timeout = Math.floor(1000 / fps);
    let component = this;
    this.timer = setInterval(function() {
      component.on_frame();
    }, timeout);
  }

}

// *****************************************************************************
// Browser Implementation
// *****************************************************************************

class cBrowser {
 
  /**
   * Create a new browser object.
   */
  constructor() {
    this.name = "";
    this.ip = "";
    this.port = "";
  }

  /**
   * Detects the type of browser that is running the system.
   * @param on_success Called if the browser is successfull detected.
   * @param on_error Called if there was a problem detecting the browser. A parameter containing the error is passed in.
   */
  Detect(on_success, on_error) {
    let old_browser = false;
    let unknown_browser = false;
    let unsupported_browser = false;
    if (navigator.userAgent.match(/Android/)) { // Android
      this.name = "android";
      this.ip = location.hostname;
      this.port = location.port;
    }
    else if (navigator.userAgent.match(/Chrome\/\d+/)) { // Chrome
      let parts = navigator.userAgent.split(/\s+/);
      // Find pair.
      let part_count = parts.length;
      for (let part_index = 0; part_index < part_count; part_index++) {
        let part = parts[part_index];
        if (part.match(/Chrome/)) {
          let pair = part.split(/\//);
          let version = parseInt(pair[1]);
          if (version < 50) { // Older than 2016?
            old_browser = true;
          }
          break;
        }
      }
      this.name = "chrome";
      this.ip = location.hostname;
      this.port = location.port;
    }
    else if (navigator.userAgent.match(/Firefox\/\d+/)) { // Firefox
      let parts = navigator.userAgent.split(/\s+/);
      // Find pair.
      let part_count = parts.length;
      for (let part_index = 0; part_index < part_count; part_index++) {
        let part = parts[part_index];
        if (part.match(/Firefox/)) {
          let pair = part.split(/\//);
          let version = parseInt(pair[1]);
          if (version < 50) { // Older than 2016?
            old_browser = true;
          }
          break;
        }
      }
      this.name = "firefox";
      this.ip = location.hostname;
      this.port = location.port;
    }
    else { // Unknown browser.
      unknown_browser = true;
    }
    if (unknown_browser) {
      window.addEventListener("load", function() {
        on_error("browser-unknown");
      }, false);
    }
    else if (old_browser) {
      window.addEventListener("load", function() {
        on_error("browser-old");
      }, false);
    }
    else if (unsupported_browser) {
      window.addEventListener("load", function() {
        on_error("unsupported-browser");
      }, false);
    }
    else {
      // Wait for window to load first.
      window.addEventListener("load", function() {
        on_success();
      }, false);
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
 * Determines if a point is in a box.
 * @param point The point to test.
 * @param box The box.
 * @return True if the point is in the box, false otherwise.
 */
function Is_Point_In_Box(point, box) {
  let result = false;
  if ((point.x >= box.left) && (point.x <= box.right) && (point.y >= box.top) && (point.y <= box.bottom)) {
    result = true;
  }
  return result;
}

/**
 * Grabs the code of a single character.
 * @param character The character to grab the code of.
 * @return The numeric code of the character.
 */
function Get_Char_Code(character) {
  return character.charCodeAt(0);
}
