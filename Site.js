// =============================================================================
// Nerd Site Base Script
// Programmed by Francois Lamini
// =============================================================================

// *****************************************************************************
// Site Initialization
// *****************************************************************************

let browser = new cBrowser();
let page_manager = null;
let io = null;
browser.Detect(function() {
  io = new cIO_Control("screen", "backbuffer", "sound_stack", On_Frame);
  io.Load_Resources("Resources", function() {
    page_manager = new cPage_Manager();
    page_manager.Add_Page(new cSite_Home(On_Site_Home_Load), "home", function() {
      io.Start(); // Start the render timer.
    });
  });
}, function(error) {
  alert(error);
});

// *****************************************************************************
// Callback Routines
// *****************************************************************************

/**
 * Called every time the page needs to render.
 */
function On_Frame() {
  page_manager.Render();
}

/**
 * Called when the site home page is loaded.
 */
function On_Site_Home_Load() {

}

// *****************************************************************************
// Site Page Implementation
// *****************************************************************************

class cSite_Home extends cPage {

  /**
   * Creates a new home page for the site.
   * @param on_load Called when the site is loaded.
   */
  constructor(on_load) {
    super("Site", io, on_load);
  }

  /**
   * Called when the button was clicked.
   * @param entity The button entity.
   */
  On_Button_Click(entity) {
    
  }

  /**
   * Fires when a list item is clicked.
   * @param entity The list entity.
   * @param text The text of the item that was clicked.
   */
  On_List_Click(entity, text) {
    
  }

  /**
   * Fires when a toolbar item is clicked.
   * @param entity The toolbar entity.
   * @param label The label of the clicked item.
   */
  On_Toolbar_Click(entity, label) {
    
  }

  /**
   * Called when the layout is initialized.
   */
  On_Init() {
    
  }

}