// =============================================================================
// Nerd Layout Engine
// Programmed by Francois Lamini
// =============================================================================

// *****************************************************************************
// Layout Implementation
// *****************************************************************************

class cLayout {

  /**
   * Creates a new layout object.
   * @param config The name of the config file.
   * @param io The I/O control.
   * @param on_load Called when config file is loaded.
   */
  constructor(config, io, on_load) {
    let component = this;
    this.components = {};
    this.sel_component = "";
    this.clicked = "";
    this.mouse_coords = {
      x: 0,
      y: 0
    };
    this.not_clicked = true;
    this.key = "none";
    this.grid = [];
    this.io = io;
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
    };
    layout_file.Read();
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
        entity["width"]++;
        entity["id"] = id_str;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (this.Is_Identifier(cell)) { // Box Edge
        if (this.Is_Identifier(cell)) {
          id_str += cell; // Collect ID letter.
        }
        entity["width"]++;
        this.grid[pos_y][pos_x] = ' ';
      }
      else if (cell == '-') { // The box's side.
        entity["width"]++;
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
        entity["height"]++;
        this.grid[pos_y][pos_x] = ' ';
        break;
      }
      else if (cell == '|') {
        entity["height"]++;
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
    if (rev_width != entity["width"]) {
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
    if (rev_height != entity["height"]) {
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

  /**
   * Renders the entities.
   */
  Render() {
    // Render a background color.
    this.io.Set_Screen_Target();
    this.io.Box(0, 0, this.target.width, this.target.height, this.red, this.green, this.blue);
    this.clicked = "";
    // Read a mouse signal.
    let signal = this.io.Read_Signal();
    if (signal.code == "mouse") {
      // Try reading key signal.
      let key_signal = this.io.Read_Key();
      this.key = key_signal.code;
    }
    else {
      this.key = signal.code;
    }
    for (let name in this.components) {
      let entity = this.components[name];
      if (signal.code == "mouse") {
        let bump_map = this.Get_Entity_Dimensions(entity);
        if (Is_Point_In_Box(signal.coords, bump_map) && ((signal.button == "left") || (signal.button == "right")) && this.not_clicked) { // Input focus.
          this.sel_component = name;
          this.clicked = name;
          // Normalize mouse coordinates to entity space.
          this.mouse_coords.x = signal.coords.x - (entity["x"] * this.cell_w);
          this.mouse_coords.y = signal.coords.y - (entity["y"] * this.cell_h);
          this.not_clicked = false;
        }
        else if (signal.button == "up") {
          this.not_clicked = true;
        }
      }
      this.io.Set_Canvas_Target();
      this.On_Component_Render(entity);
    }
  }

  /**
   * Called when the component is initialized.
   * @param entity The associated entity.
   */
  On_Component_Init(entity) {
    // To be implemented in app.
  }

  /**
   * Called when the component is rendered.
   * @param entity The associated entity.
   */
  On_Component_Render(entity) {
    // To be implemented in app.
  }

  /**
   * Gets the dimensions of an entity.
   * @param entity The entity.
   * @return The rectangle with the dimensions.
   */
  Get_Entity_Dimensions(entity) {
    let dimensions = {
      left: entity["x"] * this.cell_w,
      top: entity["y"] * this.cell_h,
      right: (entity["x"] * this.cell_w) + (entity["width"] * this.cell_w) - 1,
      bottom: (entity["y"] * this.cell_h) + (entity["height"] * this.cell_h) - 1
    };
    return dimensions;
  }

  /**
   * Determines if a letter is part of an identifier.
   * @param letter The letter to test.
   * @return True if the letter is an identifier, false if not.
   */
  Is_Identifier(letter) {
    return (((letter >= 'a') && (letter <= 'z')) || ((letter >= 'A') && (letter <= 'Z')) || ((letter >= '0') && (letter <= '9')) || (letter == '_'));
  }

  /**
   * Clears the layout of selected components. 
   */
  Clear() {
    this.sel_component = "";
    this.clicked = "";
    this.not_clicked = false;
    this.key = 0;
    this.mouse_coords.x = 0;
    this.mouse_coords.y = 0;
  }

}

// *****************************************************************************
// Page Implementation
// *****************************************************************************

class cPage extends cLayout {

  /**
   * Creates a new layout tester.
   * @param config The config file name.
   * @param io The I/O control.
   * @param on_load Called when the page is loaded.
   */
  constructor(config, io, on_load) {
    super(config, io, on_load);
  }

  /**
   * Called when a component is initialized.
   * @param entity The entity that is initialized.
   */
  On_Component_Init(entity) {
    if (entity["type"] == "field") {
      this.Init_Field(entity);
    }
    else if (entity["type"] == "grid-view") {
      this.Init_Grid_View(entity);
    }
    else if (entity["type"] == "list") {
      this.Init_List(entity);
    }
    else if (entity["type"] == "toolbar") {
      this.Init_Toolbar(entity);
    }
  }

  /**
   * Called when a component needs to be rendered.
   * @param entity The entity to be rendered.
   */
  On_Component_Render(entity) {
    // Clear out the component. Make background white.
    this.io.Box(0, 0, super.target.width, super.target.height, 255, 255, 255);
    if (entity["type"] == "field") {
      this.Render_Field(entity);
    }
    else if (entity["type"] == "label") {
      this.Render_Label(entity);
    }
    else if (entity["type"] == "grid-view") {
      this.Render_Grid_View(entity);
    }
    else if (entity["type"] == "button") {
      this.Render_Button(entity);
    }
    else if (entity["type"] == "toolbar") {
      this.Render_Toolbar(entity);
    }
    else if (entity["type"] == "list") {
      this.Render_List(entity);
    }
    // Draw the canvas of the component.
    this.io.Draw_Canvas(entity["x"] * this.cell_w, entity["y"] * this.cell_h, entity["width"] * this.cell_w, entity["height"] * this.cell_h);
  }

  /**
   * Called when the layout is initialized.
   */
  On_Init() {
    // To be implemented in app.
  }

  /**
   * Initializes the field component.
   * @param entity The field entity.
   */
  Init_Field(entity) {
    entity["text"] = "";
  }

  /**
   * Renders a field entity.
   * @param entity The field component.
   */
  Render_Field(entity) {
    let dy = Math.floor(((entity["height"] * this.cell_h) - this.io.Get_Text_Height(entity["text"])) / 2);
    let width = this.io.Get_Text_Width(entity["text"]);
    let char_w = this.io.Get_Text_Width("X");
    let limit = (entity["width"] * this.cell_w) - 2 - char_w; // Don't allow extra character.
    if (this.sel_component == entity["id"]) { // Does field have input focus?
      if ((Get_Char_Code(this.key) >= Get_Char_Code(' ')) && (Get_Char_Code(this.key) <= Get_Char_Code('~'))) {
        if (width < limit) { // Only allow text if input has space.
          entity["text"] += this.key;
        }
      }
      else if (this.key == "backspace") {
        entity["text"] = entity["text"].substr(0, entity["text"].length() - 1); // Decrease string.
      }
      else if (this.key == "delete") {
        entity["text"] = ""; // Clear out
      }
      // Highlight the field.
      this.io.Box(0, 0, entity["width"] * this.cell_w, entity["height"] * this.cell_h, 0, 255, 0);
    }
    else {
      this.io.Box(0, 0, entity["width"] * this.cell_w, entity["height"] * this.cell_h, 0, 0, 0);
    }
    // Render the field.
    this.io.Box(1, 1, entity["width"] * this.cell_w - 2, entity["height"] * this.cell_h - 2, 255, 255, 255);
    this.io.Output_Text(entity["text"], 2, dy, 0, 0, 0);
  }

  /**
   * Initializes a grid view component.
   * @param entity The grid view entity.
   */
  Init_Grid_View(entity) {
    Check_Condition((entity["columns"] != undefined), "No column count specified for grid view.");
    Check_Condition((entity["rows"] != undefined), "No row count specified for grid view.");
    entity["grid-x"] = NO_VALUE_FOUND;
    entity["grid-y"] = NO_VALUE_FOUND;
    entity["scroll-x"] = 0;
    entity["scroll-y"] = 0;
    entity["text"] = "";
    this.Clear_Grid(entity);
  }

  /**
   * Renders a grid view component.
   * @param entity The grid view entity.
   */
  Render_Grid_View(entity) {
    let row_count = entity["rows"];
    let col_count = entity["columns"];
    let cell_width = Math.floor((entity["width"] * this.cell_w) / col_count);
    let cell_height = this.io.Get_Text_Height(entity["text"]) + 4;
    let highlight = 0;
    let rows = entity["text"].split(";");
    for (let grid_y = 0; grid_y < row_count; grid_y++) {
      let cells = rows[grid_y].split(",");
      for (let grid_x = 0; grid_x < col_count; grid_x++) {
        if (this.sel_component == entity["id"]) { // Does field have input focus?
          let cell_map = { 
            left: grid_x * cell_width - entity["scroll-x"],
            top: grid_y * cell_height - entity["scroll-y"],
            right: grid_x * cell_width + cell_width - 1 - entity["scroll-x"],
            bottom: grid_y * cell_height + cell_height - 1 - entity["scroll-y"]
          };
          if (Is_Point_In_Box(this.mouse_coords, cell_map) && (this.clicked == entity["id"])) { // Check to see if we clicked into the cell.
            entity["grid-x"] = grid_x; // Set selected grid cell.
            entity["grid-y"] = grid_y;
          }
          if ((entity["grid-x"] == grid_x) && (entity["grid-y"] == grid_y)) { // Do we have a selected grid cell.
            if ((Get_Char_Code(this.key) >= Get_Char_Code(' ')) && (Get_Char_Code(this.key) <= Get_Char_Code('~'))) {
              let width = this.io.Get_Text_Width(text);
              let char_w = this.io.Get_Text_Width("X");
              if (width < (cell_width - char_w)) { // Only allow text if input has space.
                if ((this.key != ';') && (this.key != ',')) { // Do not allow delimiting characters.
                  if (cells[grid_x] == "free") { // Replace free text.
                    cells[grid_x] = this.key;
                  }
                  else {
                    cells[grid_x] += this.key;
                  }
                }
              }
            }
            else if (this.key == "backspace") {
              cells[grid_x] = cells[grid_x].substr(0, cells[grid_x].length() - 1); // Decrease string.
            }
            else if (this.key == "delete") {
              cells[grid_x] = "free"; // Clear out.
            }
            if (cells[grid_x].length == 0) {
              cells[grid_x] = "free"; // Replace with free text.
            }
            rows[grid_y] = cells.join(",");
            entity["text"] = rows.join(";");
            highlight = 255;
          }
          else {
            highlight = 0;
          }
        }
        this.io.Box(grid_x * cell_width - entity["scroll-x"], grid_y * cell_height - entity["scroll-y"], cell_width, cell_height, 255, 255, 255);
        this.io.Output_Text(text, grid_x * cell_width + 2 - entity["scroll-x"], grid_y * cell_height + 2 - entity["scroll-y"], 0, highlight, 0);
      }
    }
    // Allow scrolling of component.
    this.Scroll_Component(entity);
  }

  /**
   * Renders the label component.
   * @param entity The label entity.
   */
  Render_Label(entity) {
    Check_Condition((entity["label"] != undefined), "No label specified for label.");
    Check_Condition((entity["red"] != undefined), "Red component missing for label color.");
    Check_Condition((entity["green"] != undefined), "Green component missing for label color.");
    Check_Condition((entity["blue"] != undefined), "Blue component missing for label color.");
    this.io.Output_Text(entity["label"], 0, 0, entity["red"], entity["green"], entity["blue"]);
  }

  /**
   * Initializes a list component.
   * @param entity The list entity.
   */
  Init_List(entity) {
    entity["scroll-x"] = 0;
    entity["scroll-y"] = 0;
    entity["text"] = "";
    entity["sel-item"] = NO_VALUE_FOUND;
    if (entity["items"] != undefined) {
      let items = entity["items"].split(";");
      entity["text"] = items,join(",");
    }
  }

  /**
   * Renders a list entity.
   * @param entity The entity component.
   */
  Render_List(entity) {
    let items = entity["text"].split(",");
    let item_count = items.length;
    let height = this.io.Get_Text_Height(entity["text"]) + 2;
    for (let item_index = 0; item_index < item_count; item_index++) {
      let item = items[item_index];
      let highlight = 0;
      if (entity["sel-item"] == item_index) {
        highlight = 255;
      }
      this.io.Box(0 - entity["scroll-x"], item_index * height - entity["scroll-y"], entity["width"] * this.cell_w, height, 255, 255, 255);
      this.io.Output_Text(item, 2 - entity["scroll-x"], item_index * height + 2 - entity["scroll-y"], 0, highlight, 0);
      if (this.clicked == entity["id"]) { // Was item clicked?
        let item_map = {
          left: 0,
          top: item_index * height - entity["scroll-y"],
          right: entity["width"] * this.cell_w - 1,
          bottom: item_index * height + height - 1 - entity["scroll-y"]
        };
        if (Is_Point_In_Box(this.mouse_coords, item_map)) { // Was item clicked on?
          entity["sel-item"] = item_index;
          this.On_List_Click(entity, item);
        }
      }
    }
    this.Scroll_Component(entity);
  }

  /**
   * Renders a button component.
   * @param entity The button entity.
   */
  Render_Button(entity) {
    Check_Condition((entity["label"] != undefined), "No label for button.");
    Check_Condition((entity["red"] != undefined), "Missing red component for button color.");
    Check_Condition((entity["green"] != undefined), "Missing green component for button color.");
    Check_Condition((entity["blue"] != undefined), "Missing blue component for button color.");
    let dx = Math.floor((entity["width"] * this.cell_w - this.io.Get_Text_Width(entity["label"])) / 2);
    let dy = Math.floor((entity["height"] * this.cell_h - this.io.Get_Text_Height(entity["label"])) / 2);
    this.io.Box(0, 0, entity["width"] * this.cell_w, entity["height"] * this.cell_h, entity["red"], entity["green"], entity["blue"]);
    this.io.Output_Text(entity["label"], dx, dy, 255, 255, 255); // White
    if (this.clicked == entity["id"]) { // Was the button clicked?
      this.On_Button_Click(entity);
    }
  }

  /**
   * Called when the button was clicked.
   * @param entity The button entity.
   */
  On_Button_Click(entity) {
    // To be implemented in app.
  }

  /**
   * Initializes a toolbar component.
   * @param entity The toolbar entity.
   */
  Init_Toolbar(entity) {
    Check_Condition((entity["columns"] != undefined), "No column count specified for toolbar.");
    entity["scroll-x"] = 0;
    entity["scroll-y"] = 0;
    entity["text"] = "";
    entity["item-x"] = NO_VALUE_FOUND;
    entity["item-y"] = NO_VALUE_FOUND;
    if (entity["items"] != undefined) {
      let items = entity["items"].split(";");
      entity["text"] = items.join(",");
    }
  }

  /**
   * Renders the toolbar component.
   * @param entity The toolbar entity.
   */
  Render_Toolbar(entity) {
    let items = entity["text"].split(",");
    let item_count = items.length;
    let cell_width = Math.floor((entity["width"] * this.cell_w) / entity["columns"]);
    let grid_x = 0;
    let grid_y = 0;
    for (let item_index = 0; item_index < item_count; item_index++) {
      let item = items[item_index];
      let pair = item.split(":");
      Check_Condition((pair.length == 2), "Invalid data format in toolbar item.");
      let label = pair[0];
      let icon = pair[1];
      let image_width = icon.width;
      let image_height = icon.height;
      let dx = Math.floor((cell_width - image_width) / 2);
      let dy = Math.floor((cell_width - image_height) / 2);
      let text_x = Math.floor((cell_width - this.io.Get_Text_Width(label)) / 2);
      let text_y = dy + image_height + 1;
      if (this.clicked == entity["id"]) {
        let box = {
          left: grid_x * cell_width - entity["scroll-x"],
          top: grid_y * cell_width - entity["scroll-y"],
          right: grid_x * cell_width + cell_width - 1 - entity["scroll-x"],
          bottom: grid_y * cell_width + cell_width - 1 - entity["scroll-y"]
        };
        if (Is_Point_In_Box(this.mouse_coords, box)) {
          entity["item-x"] = grid_x;
          entity["item-y"] = grid_y;
          this.On_Toolbar_Click(entity, label);
        }
      }
      let highlight = 0;
      if ((entity["item-x"] == grid_x) && (entity["item-y"] == grid_y)) {
        highlight = 255;
      }
      this.io.Draw_Image(icon, (grid_x * cell_width) + dx - entity["scroll-x"], (grid_y * cell_width) + dy - entity["scroll-y"], image_width, image_height, 0, false, false);
      this.io.Output_Text(label, (grid_x * cell_width) + text_x - entity["scroll-x"], (grid_y * cell_width) + text_y - entity["scroll-y"], 0, highlight, 0);
      if (((item_index + 1) % entity["columns"]) == 0) { // Go to next row.
        grid_y++;
        grid_x = 0;
      }
      else {
        grid_x++;
      }
    }
    this.Scroll_Component(entity);
  }

  /**
   * Fires when a list item is clicked.
   * @param entity The list entity.
   * @param text The text of the item that was clicked.
   */
  On_List_Click(entity, text) {
    // To be implemented in app.
  }

  /**
   * Fires when a toolbar item is clicked.
   * @param entity The toolbar entity.
   * @param label The label of the clicked item.
   */
  On_Toolbar_Click(entity, label) {
    // To be implemented in app.
  }

  /**
   * Scrolls a component when the user presses the arrow keys.
   * @param entity The component to scroll.
   */
 Scroll_Component(entity) {
    Check_Condition((entity["scroll-x"] != undefined), "Scroll x coordinate missing.");
    Check_Condition((entity["scroll-y"] != undefined), "Scroll y coordinate missing.");
    if (this.sel_component == entity["id"]) { // Input focus?
      switch (this.key) {
        case "left": {
          entity["scroll-x"] -= this.cell_w;
          break;
        }
        case "right": {
          entity["scroll-x"] += this.cell_w;
          break;
        }
        case "up": {
          entity["scroll-y"] -= this.cell_h;
          break;
        }
        case "down": {
          entity["scroll-y"] += this.cell_h;
        }
      }
    }
  }

  /**
   * Clears a grid component.
   * @param entity The grid component. 
   */
  Clear_Grid(entity) {
    // Allocate new rows.
    let rows = [];
    let row_count = entity["rows"];
    let col_count = entity["columns"];
    for (let grid_y = 0; grid_y < row_count; grid_y++) {
      let cells = [];
      for (let grid_x = 0; grid_x < col_count; grid_x++) {
        cells.push("free");
      }
      rows.push(cells.join(","));
    }
    entity["text"] = rows.join(";");
  }

  /**
   * Parses a rectangle from text.
   * @param text The text containing the rectangle string.
   * @return A rectangle object.
   * @throws An error if the rectangle is not valid.
   */
  Parse_Rectangle(text) {
    let str_rect = text.split(",");
    Check_Condition((str_rect.length == 4), "Rectangle is not formatted correctly.");
    let rect = {
      left: parseInt(str_rect[0]),
      top: parseInt(str_rect[1]),
      right: parseInt(str_rect[2]),
      bottom: parseInt(str_rect[3])
    };
    return rect;
  }

  /**
   * Gets the value of a grid cell.
   * @param entity The grid component.
   * @param x The x coordinate of the cell.
   * @param y The y coordinate of the cell.
   * @return The cell value or blank if the cell is a free cell. 
   * @throws An error if an invalid cell is accessed.
   */
  Get_Grid_Cell(entity, x, y) {
    let value = "";
    let row_count = entity["rows"];
    let col_count = entity["columns"];
    Check_Condition(((x >= 0) && (x < col_count)), "Invalid column accessed.");
    Check_Condition(((y >= 0) && (y < row_count)), "Invalid row accessed.");
    let rows = entity["text"].split(";");
    for (let grid_y = 0; grid_y < row_count; grid_y++) {
      let cells = rows[grid_y].split(",");
      for (let grid_x = 0; grid_x < col_count; grid_x++) {
        if ((x == grid_x) && (y == grid_y)) {
          value = cells[grid_x];
          if (value == "free") {
            value = "";
          }
          break;
        }
      }
    }
    return value;
  }

  /**
   * Sets a value for a given grid cell.
   * @param entity The grid component.
   * @param x The x coordinate of the cell.
   * @param y The y coordinate of the cell.
   * @param value The value to set for the cell. 
   * @throws An error if an invalid cell is accessed or if the value has invalid characters.
   */
  Set_Grid_Cell(entity, x, y, value) {
    let row_count = entity["rows"];
    let col_count = entity["columns"];
    Check_Condition(((x >= 0) && (x < col_count)), "Invalid column accessed.");
    Check_Condition(((y >= 0) && (y < row_count)), "Invalid row accessed.");
    let rows = entity["text"].split(";");
    for (let grid_y = 0; grid_y < row_count; grid_y++) {
      let cells = rows[grid_y].split(",");
      for (let grid_x = 0; grid_x < col_count; grid_x++) {
        if ((x == grid_x) && (y == grid_y)) {
          // Check for invalid characters.
          Check_Condition(((value.indexOf(';') == NO_VALUE_FOUND) && (value.indexOf(',') == NO_VALUE_FOUND)), "Invalid characters in grid cell.");
          if (value == "") {
            value = "free";
          }
          cells[grid_x] = value;
          rows[grid_y] = cells.join(",");
          entity["text"] = rows.join(";");
          break;
        }
      }
    }
  }

  /**
   * Adds an item to a list.
   * @param entity The list component.
   * @param value The value to add.
   * @throws An error if the value has invalid values.
   */
  Add_List_Item(entity, value) {
    let items = Parse_Sausage_Text(entity["text"] = ",");
    Check_Condition((value.indexOf(',') == NO_VALUE_FOUND), "Invalid character in value.");
    items.push(value);
    entity["text"] = items.join(",");
  }

  /**
   * Removes an item from the list.
   * @param entity The list component.
   * @param index The index of the item to remove from the list.
   * @throws An error if the index is invalid.
   */
  Remove_List_Item(entity, index) {
    let items = entity["text"].split(",");
    if (items.length > 0) {
      items.splice(index, 1);
    }
    entity["text"] = items.join(",");
  }

  /**
   * Gets the number of items in the list.
   * @param entity The list component.
   * @return The list item count.
   */
  Get_List_Item_Count(entity) {
    let items = entity["text"].split(",");
    return items.length;
  }

  /**
   * Clears a list.
   * @param entity The list component.
   */
  Clear_List(entity) {
    entity["text"] = "";
  }

  /**
   * Adds an item to a toolbar.
   * @param entity The toolbar component.
   * @param value The value to add.
   * @throws An error if the value has invalid values.
   */
  Add_Toolbar_Item(entity, value) {
    let items = entity["text"].split(",");
    Check_Condition((value.indexOf(',') == NO_VALUE_FOUND), "Invalid character in value.");
    items.push(value);
    entity["text"] = items.join(",");
  }

  /**
   * Removes an item from the toolbar.
   * @param entity The toolbar component.
   * @param index The index of the item to remove from the toolbar.
   * @throws An error if the index is invalid.
   */
  Remove_Toolbar_Item(entity, index) {
    let items = entity["text"].split(",");
    if (items.length > 0) {
      items.splice(index, 1);
    }
    entity["text"] = items,join(",");
  }

  /**
   * Gets the number of items in the toolbar.
   * @param entity The toolbar component.
   * @return The toolbar item count.
   */
  Get_Toolbar_Item_Count(entity) {
    let items = entity["text"].split(",");
    return items.length;
  }

  /**
   * Clears a toolbar.
   * @param entity The toolbar component.
   */
  Clear_Toolbar(entity) {
    entity["text"] = "";
  }

}

// *****************************************************************************
// Page Manager Implementation
// *****************************************************************************

class cPage_Manager {

  /**
   * Creates a new page manager.
   */
  constructor() {
    this.pages = {};
    this.sel_page = "";
  }

  /**
   * Retrieves a component from a page given the reference.
   * @param ref The component reference. References look like this: page->component
   * @throws An error if the component could not retrieved.
   */
  Get_Entity(ref) {
    let pair = ref.split("->");
    Check_Condition((pair.length == 2), "Invalid object reference format.");
    let page = pair[0];
    let component = pair[1];
    Check_Condition((this.pages[page] != undefined), "No paged named " + page + ".");
    let page_ptr = this.pages[page];
    Check_Condition((page_ptr.components[component] != undefined), "No component named " + component + " in page " + page + ".");
    return page_ptr.components[component];
  }

  /**
   * Renders the currently selected page. 
   */
  Render() {
    this.pages[this.sel_page].Render();
  }

  /**
   * Goes to a specific page.
   * @param name The name of the page to go to.
   * @throws An error if the page does not exist. 
   */
  Go_To_Page(name) {
    Check_Condition((this.pages[name] != undefined), "No page named " + name + ".");
    this.sel_page = name;
  }

  /**
   * Adds a page to the page manager.
   * @param page The instantiated page object.
   * @param name The name of the page.
   */
  Add_Page(page, name, on_add) {
    this.pages[name] = page;
    // Initialize page.
    let component = this;
    this.pages[name].Parse_Layout(name, function() {
      component.pages[name].On_Init();
      // Select as initial page.
      component.Go_To_Page(name);
      on_add();
    });
  }

}