
/**
 * Menu for the fucking thingy.
 * @class tadpole.Menu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.Menu = function( ui ) {

    this.manager = ui;
    this.users = null;
    this.heads = null;
    this.build();

};


/**
 * Place the menu on the page.
 * @method build
 */
tadpole.Menu.prototype.build = function(  ) {

    // Create the main menu.
    this.overlay = new tadpole.Overlay( this.manager.view, 'menu' );
    this.overlay.view.append('<nav class="menu">'
        +'<ul>'
        +'  <li><a class="head" href="#"><span class="icon-doc"></span>Topic/Title</a></li>'
        +'  <li><a class="users" href="#"><span class="icon-user"></span>Users</a></li>'
        +'  <li><a class="channels" href="#"><span class="icon-comment"></span>Channels</a></li>'
        +'  <li><a class="commands" href="#"><span class="icon-plus"></span>Commands</a>'
        +'      <ul>'
        +'          <li><a class="e-join" href="#">Join Channel</a></li>'
        +'          <li><a class="e-join" href="#">Leave Channel</a></li>'
        +'      </ul>'
        +'  </li>'
        +'  <li><a class="settings" href="#"><span class="icon-cog"></span>Settings</a></li>'
        +'</ul></nav>');
    
    this.view = this.overlay.view.find('nav');
    this.button_head = this.view.find('.head');
    this.button_users = this.view.find('.users');
    this.button_channels = this.view.find('.channels');
    this.button_commands = this.view.find('.commands');
    this.button_settings = this.view.find('.settings');
    
    // Handle events.
    var menu = this;
    
    this.button_head.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_head();
    
    } );
    
    this.button_users.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_users();
    
    } );
    
    this.button_channels.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_channels();
    
    } );
    
    this.button_commands.on( 'click', function( event ) {
    
        event.preventDefault();
    
    } );
    
    this.button_settings.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_settings();
    
    } );
    
    // Create sub-menus.
    this.channel = new tadpole.ChannelMenu( this.manager, this.overlay.view );
    this.heads = new tadpole.HeadArray( this.manager, this, this.manager.view, 'head', 'h' );
    this.users = new tadpole.UsersArray( this.manager, this, this.manager.view, 'userlist', 'u' );
    //this.settings = new tadpole.SettingsOverlay( this.manager );

};

/**
 * Resize the menu.
 * @method resize
 */
tadpole.Menu.prototype.resize = function(  ) {

    this.overlay.resize();
    this.channel.resize();
    this.heads.resize();
    this.users.resize();
    //this.settings.reszie();

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.Menu.prototype.toggle = function(  ) {

    this.resize();
    
    if( this.overlay.visible ) {
        this.channel.hide();
        this.heads.hide();
        this.users.hide();
        this.overlay.hide();
        this.manager.top.inactive();
        return this.overlay.visible;
    }
    
    this.overlay.reveal();
    this.manager.top.active();
    return this.overlay.visible;

};

tadpole.Menu.prototype.hide_quick = function(  ) {

    this.manager.top.inactive();
    this.overlay.hide_quick();

};

/**
 * Show the head.
 * @method show_head
 */
tadpole.Menu.prototype.show_head = function(  ) {

    this.heads.reveal(this.manager.book.current.selector);

};

/**
 * Show the users.
 * @method show_users
 */
tadpole.Menu.prototype.show_users = function(  ) {

    this.users.reveal(this.manager.book.current.selector);

};

/**
 * Show the channels.
 * @method show_channels
 */
tadpole.Menu.prototype.show_channels = function(  ) {

    this.channel.reveal();

};

/**
 * Show the settings.
 * @method show_settings
 */
tadpole.Menu.prototype.show_settings = function(  ) {};


/**
 * Menu item.
 * @class tadpole.MenuItem
 * @constructor
 */
tadpole.MenuItem = function( manager, menu, id, overlay, hidden ) {

    this.manager = manager;
    this.menu = menu;
    this.id = id;
    this.overlay = overlay || null;
    this.hidden = hidden || false;
    this.build();

};

/**
 * Build the menu item, if need be.
 * @method build
 */
tadpole.MenuItem.prototype.build = function(  ) {};

/**
 * Do something when the item is resized.
 * @method resize
 */
tadpole.MenuItem.prototype.resize = function(  ) {};

/**
 * Do something when the item is revealed.
 * @method reveal
 */
tadpole.MenuItem.prototype.reveal = function(  ) {};

/**
 * Do something when the item is hidden.
 * @method hide
 */
tadpole.MenuItem.prototype.hide = function(  ) {};

/**
 * Do something when the item is removed.
 * @method remove
 */
tadpole.MenuItem.prototype.remove = function(  ) {};


/**
 * Array of items accessible from the menu based on currently open
 * channel.
 * @class tadpole.MenuItemArray
 * @constructor
 */
tadpole.MenuItemArray = function( ui, menu, parentview, cls, id, origin ) {

    this.manager = ui;
    this.menu = menu;
    this.parentview = parentview;
    this.cls = cls;
    this.id = id;
    this.origin = origin || 'top';
    this.items = {};
    
    this.overlays = this.create_overlay_array();

};

/**
 * Create a new MenuItem.
 * @method create_item
 */
tadpole.MenuItemArray.prototype.create_item = function( id, overlay, hidden ) {

    return new tadpole.MenuItem( this.manager, this.menu, id, overlay, hidden );

};

/**
 * Create an overlay array.
 * @method create_overlay_array
 */
tadpole.MenuItemArray.prototype.create_overlay_array = function(  ) {

    return new tadpole.OverlayArray( this.parentview, this.cls, this.id, this.origin );

};

/**
 * Add an item to the array.
 * @method add
 */
tadpole.MenuItemArray.prototype.add = function( id, hidden ) {

    this.remove( id );
    var ol = this.overlays.add(id);
    var item = this.create_item( id, ol, hidden );
    this.items[id.toLowerCase()] = item;
    return item;

};

/**
 * Get an item.
 * @method item
 */
tadpole.MenuItemArray.prototype.item = function( id ) {

    try {
        return this.items[id.toLowerCase()];
    } catch( err ) {}
    
    return null;

};

/**
 * Iterate through the items.
 * @method each
 */
tadpole.MenuItemArray.prototype.each = function( callback ) {

    for( var id in this.items ) {
        if( !this.items.hasOwnProperty(id) )
            continue;
        callback(id, this.items[id]);
    }

};

/**
 * Resize all of the items.
 * @method resize
 */
tadpole.MenuItemArray.prototype.resize = function(  ) {

    this.each(
        function( id, item ) {
            item.overlay.resize();
            item.resize();
        }
    );

};

/**
 * Reveal a menu item.
 * @method reveal
 */
tadpole.MenuItemArray.prototype.reveal = function( id ) {

    var item = this.item( id );
    
    if( !item )
        return;
    
    item.overlay.reveal();
    item.reveal();

};

/**
 * Hide items.
 * @method hide
 */
tadpole.MenuItemArray.prototype.hide = function(  ) {

    this.each(
        function( id, item ) {
            item.overlay.hide();
            item.hide();
        }
    );

};

/**
 * Hide items quickly.
 * @method hide_quick
 */
tadpole.MenuItemArray.prototype.hide_quick = function(  ) {

    this.each(
        function( id, item ) {
            item.overlay.hide_quick();
            item.hide();
        }
    );

};

/**
 * Remove an item.
 * @method remove
 */
tadpole.MenuItemArray.prototype.remove = function( id ) {

    var item = this.item( id );
    
    if( !item )
        return;
    
    this.overlays.remove(id);
    item.remove();
    delete this.items[id.toLowerCase()];

};

/**
 * Remove all items.
 * @method remove_all
 */
tadpole.MenuItemArray.prototype.remove_all = function(  ) {

    var arr = this;
    
    this.each(
        function( id, item ) {
            arr.overlays.remove(id);
            item.remove();
            delete arr.items[id];
        }
    );

};


