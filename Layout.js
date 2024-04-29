// =============================================================================
// Nerd Layout Engine
// Programmed by Francois Lamini
// =============================================================================

// *****************************************************************************
// I/O Control Implementation
// *****************************************************************************

class cIO_Control {

  /**
   * Creates a new I/O control.
   * @param canvas The canvas element name.
   * @param backbuffer The backbuffer element name.
   */
  constructor(canvas, backbuffer) {
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
      let center_x = Math.floor(width / 2);
      let center_y = Math.floor(height / 2);
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
   * Sets the canvas mode based on the flag.
   */
  Set_Canvas_Mode() {
    if (this.use_canvas) {
      this.target = this.canvas;
      this.surface = this.screen;
    }
    else {
      this.target = this.backbuffer;
      this.surface = this.buffer;
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

}

// *****************************************************************************
// Layout Implementation
// *****************************************************************************

class cLayout {

  /**
   * Creates a new layout object.
   * @param config The name of the config file.
   * @param on_load Called when config file is loaded.
   */
  constructor(config, on_load) {
    let component = this;
    this.components = {};
    this.sel_component = "";
    this.clicked = "";
    this.mouse_coords = {};
    this.not_clicked = true;
    this.key = "none";
    this.grid = [];
    let config_file = new cConfig(config, function() {
      component.width = config_file.Get_Property("width");
      component.height = config_file.Get_Property("height");
      component.cell_w = config_file.Get_Property("cell-w");
      component.cell_h = config_file.Get_Property("cell-h");
      component.red = config_file.Get_Property("red");
      component.green = config_file.Get_Property("green");
      component.blue = config_file.Get_Property("blue");
      // Recalculate dimensions to grid dimensions.
      component.width = Math.floor(component.width / component.cell_w);
      component.height = Math.floor(component.height / component.cell_h);
      // Create the grid.
      for (let row_index = 0; row_index < component.height; row_index++) {
        let row = [];
        for (let col_index = 0; col_index < component.width; col_index++) {
          row.push(' ');
        }
        component.grid.push(row);
      }
      on_load();
    });
  }

  /**
   * Clears out the grid.
   */
  Clear_Grid() {
    for (let row_index = 0; row_index < this.height; row_index++) {
      for (let col_index = 0; col_index < this.width; col_index++) {
        this.grid[row_index][col_index] = ' ';
      }
    }
  }

  /**
   * Parses the grid given the layout.
   * @param file The instance of the layout file.
   * @throws An error if the grid could not be loaded.
   */
  Parse_Grid(file) {
    for (let row_index = 0; row_index < this.height; row_index++) {
      let line = file.Get_Line();
      let col_count = (line.length > this.width) ? this.width : line.length;
      for (let col_index = 0; col_index < col_count; col_index++) {
        let letter = line.charAt(col_index);
        this.grid[row_index][col_index] = letter;
      }
    }
  }

  /**
   * Parses the layout.
   * @param name The name of the layout.
   * @param on_parse Called when the layout has been parsed.
   */
  Parse_Layout(name, on_parse) {
    let layout_file = new cFile(name + ".txt");
    let component = this;
    layout_file.Read();
    layout_file.on_read = function() {
      // Parse grid first.
      component.Parse_Grid(layout_file);
      // Parse the entities.
      while (component.Has_Entity()) {
        component.Parse_Entity();
      }
      // Parse the properties here!
      component.Parse_Properties(layout_file);
      // Run all component initializers.
      for (let comp_name in component.components) {
        let comp_obj = component.components[comp_name];
        component.On_Component_Init(comp_obj);
      }
      on_parse();
    }
  }

  /**
   * Checks to see if there is an entity to parse.
   * @return True if there is an entity, false otherwise.
   */
  Has_Entity() {
    let has_entity = false;
    for (let cell_y = 0; cell_y < this.height; cell_y++) {
      for (let cell_x = 0; cell_x < this.width; cell_x++) {
        let  cell = this.grid[cell_y][cell_x];
        if ((cell == '[') || (cell == '{') || (cell == '(') || (cell == '+')) { // Entity identifier.
          has_entity = true;
          break;
        }
      }
    }
    return has_entity;
  }

  /**
   * Parses an entity and adds it to the component stack.
   * @throws An error if the entity is invalid.
   */
  Parse_Entity() {
    let entity = {};
    entity["id"] = "";
    entity["type"] = "";
    entity["x"] = 0;
    entity["y"] = 0;
    entity["width"] = 0;
    entity["height"] = 0;
    for (let cell_y = 0; cell_y < this.height; cell_y++) {
      for (let cell_x = 0; cell_x < this.width; cell_x++) {
        let cell = this.grid[cell_y][cell_x];
        if (cell == '+') {
          entity["x"] = cell_x;
          entity["y"] = cell_y;
          entity["width"] = 1;
          entity["height"] = 1;
          entity["type"] = "box";
          this.Parse_Box(entity);
          // Break out of double loop.
          cell_y = this.height;
          break;
        }
        else if (cell == '[') {
          entity["x"] = cell_x;
          entity["y"] = cell_y;
          entity["width"] = 1;
          entity["height"] = 1;
          entity["type"] = "field";
          this.Parse_Field(entity);
          // Break out of double loop.
          cell_y = this.height;
          break;
        }
        else if (cell == '{') {
          entity["x"] = cell_x;
          entity["y"] = cell_y;
          entity["width"] = 1;
          entity["height"] = 1;
          entity["type"] = "panel";
          this.Parse_Panel(entity);
          // Break out of double loop.
          cell_y = this.height;
          break;
        }
        else if (cell == '(') {
          entity["x"] = cell_x;
          entity["y"] = cell_y;
          entity["width"] = 1;
          entity["height"] = 1;
          entity["type"] = "button";
          this.Parse_Button(entity);
          // Break out of double loop.
          cell_y = this.height;
          break;
        }
        else {
          continue; // Ignore but allow looking for other entities.
        }
      }
    }
    // Add to components.
    this.components[entity["id"]] = entity;
  }

  /**
   * Parses a box structure.
   * @param entity The associated entity.
   * @throws An error if the box is invalid.
   */
  Parse_Box(entity) {
    // We'll navigate in this path: right -> down -> left -> up
    let pos_x = entity["x"]; // Skip the plus.
    let pos_y = entity["y"];
    let rev_width = 1;
    let rev_height = 1;
    let id_str = "";
    // Clear out first plus.
    this.grid[pos_y][pos_x] = ' ';
    // Navigate right.
    pos_x++;
    while (pos_x < this.width) {
      let cell = this.grid[pos_y][pos_x];
      if (cell == '+') {
        entity["width"].number++;
        entity["id"].string = id_str;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (this.Is_Identifier(cell)) { // Box Edge
        if (this.Is_Identifier(cell)) {
          id_str += cell; // Collect ID letter.
        }
        entity["width"].number++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else if (cell == '-') { // The box's side.
        entity["width"].number++;
      }
      else {
        throw new Error("Not a valid box. (right)");
      }
      pos_x++;
    }
    // Check for truncated object.
    if (pos_x == this.width) {
      throw new Error("Truncated box. (width)");
    }
    // Navigate down.
    pos_y++; // Skip the first plus.
    while (pos_y < this.height) {
      let cell = this.grid[pos_y][pos_x];
      if (cell == '+') {
        entity["height"].number++;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (cell == '|') {
        entity["height"].number++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else {
        throw new Error("Not a valid box. (down)");
      }
      pos_y++;
    }
    // Check for truncated object.
    if (pos_y == this.height) {
      throw new Error("Truncated box. (height)");
    }
    // Navigate left.
    pos_x--; // Skip that first plus.
    while (pos_x >= 0) {
      let cell = this.grid[pos_y][pos_x];
      if (cell == '+') {
        rev_width++;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (cell == '-') {
        rev_width++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else {
        throw new Error("Not a valid box. (left)");
      }
      pos_x--;
    }
    if (rev_width != entity["width"].number) {
      throw new Error("Not a valid box. (width mismatch)");
    }
    // Navigate up.
    pos_y--;
    while (pos_y >= 0) {
      let cell = this.grid[pos_y][pos_x];
      if (cell == ' ') { // Plus was removed but validated before.
        rev_height++;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (cell == '|') {
        rev_height++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else {
        throw cError("Not a valid box. (up)");
      }
      pos_y--;
    }
    if (rev_height != entity["height"].number) {
      throw cError("Not a valid box. (height mismatch)");
    }
  }

  /**
   * Parses a field entity.
   * @param entity The associated entity.
   * @throws An error if the field is invalid.
   */
  Parse_Field(entity) {
    let pos_x = entity["x"];
    let pos_y = entity["y"];
    let id_str = "";
    // Clear out initial bracket.
    this.grid[pos_y][pos_x] = ' ';
    // Parse out field.
    pos_x++; // Pass over initial bracket.
    while (pos_x < this.width) {
      let cell = this.grid[pos_y][pos_x];
      if (cell == ']') {
        entity["width"]++;
        entity["id"] = id_str;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (this.Is_Identifier(cell) || (cell == ' ')) {
        if (this.Is_Identifier(cell)) {
          id_str += cell;
        }
        entity["width"]++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else {
        throw new Error("Not a valid field.");
      }
      pos_x++;
    }
    // Check for truncated object.
    if (pos_x == this.width) {
      throw new Error("Truncated field.");
    }
  }

  /**
   * Parses a panel entity.
   * @param entity The associated entity.
   * @throws An error if the panel is invalid.
   */
  Parse_Panel(entity) {
    let pos_x = entity["x"];
    let pos_y = entity["y"];
    let id_str = "";
    // Clear out initial curly.
    this.grid[pos_y][pos_x] = ' ';
    // Skip over initial curly.
    pos_x++;
    // Go ahead and parse the rest.
    while (pos_x < this.width) {
      let cell = this.grid[pos_y][pos_x];
      if (cell == '}') {
        entity["width"]++;
        entity["id"] = id_str;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (this.Is_Identifier(cell) || (cell == ' ')) {
        if (this.Is_Identifier(cell)) {
          id_str += cell;
        }
        entity["width"]++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else {
        throw new Error("Not a valid panel.");
      }
      pos_x++;
    }
    // Check for truncated object.
    if (pos_x == this.width) {
      throw new Error("Truncated panel.");
    }
  }

  /**
   * Parses a button entity.
   * @param entity The associated entity.
   * @throws An error if the button is invalid.
   */
  Parse_Button(entity) {
    let pos_x = entity["x"];
    let pos_y = entity["y"];
    let id_str = "";
    this.grid[pos_y][pos_x] = ' ';
    pos_x++;
    while (pos_x < this.width) {
      let cell = this.grid[pos_y][pos_x];
      if (cell == ')') {
        entity["width"]++;
        entity["id"] = id_str;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (this.Is_Identifier(cell) || (cell == ' ')) {
        if (this.Is_Identifier(cell)) {
          id_str += cell;
        }
        entity["width"]++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else {
        throw new Error("Not a valid button.");
      }
      pos_x++;
    }
    // Check for truncated object.
    if (pos_x == this.width) {
      throw new Error("Truncated button.");
    }
  }

  /**
   * Parses the properties associated with the layout.
   * @param file The instance of the layout file.
   * @throws An error if there is a problem with the layout.
   */
  Parse_Properties(file) {
    while (file.Has_More_Lines()) {
      let line = file.Get_Line();
      let pair = line.split("->");
      if (pair.length == 2) { // Property signature.
        let entity_id = pair[0];
        let value = pair[1];
        if (this.components[entity_id] != undefined) {
          let props = value.split(",");
          let prop_count = props.length;
          for (let prop_index = 0; prop_index < prop_count; prop_index++) {
            let prop = props[prop_index].split("=");
            if (prop.Count() == 2) {
              let name = prop[0];
              let value = prop[1];
              if (!isNaN(value)) {
                this.components[entity_id][name] = parseInt(value);
              }
              else { // A string.
                this.components[entity_id][name] = value;
              }
            }
            else {
              throw new Error("Property is missing value.");
            }
          }
        }
        else {
          throw new Error("Entity " + entity_id + " is not defined.");
        }
      }
      else {
        throw new Error("Entity ID is missing properties.");
      }
    }
  }

}