
/**
 * Menu thing.
 * @class tadpole.Menu
 * @constructor
 */
tadpole.Menu = function( ui, parent, cls ) {

    this.manager = ui;
    this.parent = parent;
    this.overlay = null;
    this.buttons = [];
    this.cls = cls || '';
    this.build();

};

/**
 * Build the menu.
 * @method build
 */
tadpole.Menu.prototype.build = function(  ) {

    var cls = 'menu' + ( this.cls ? ' ' + this.cls : '' );
    this.overlay = new tadpole.Overlay( this.parent, cls );
    this.overlay.view.append( '<nav class="' + cls + '"><ul></ul></nav>');
    this.view = this.overlay.view.find('nav');
    this.ul = this.view.find('ul');

};

/**
 * Add a button to the menu.
 * @method add
 * @param cls {String} Class for the button.
 * @param id {String} ID for the button.
 * @param label {String} Label for the button.
 * @param callback {Function} Method to call when the button is clicked.
 * @param icon {String} Name of the icon to use for the button.
 */
tadpole.Menu.prototype.add = function( cls, id, label, callback, icon, hidden ) {

    var button = new tadpole.MenuButton( this.ul, cls, id, label, callback, icon, hidden );
    this.buttons.push(button);
    return button;

};


/**
 * Add a nested menu.
 * @method add_nested
 */
tadpole.Menu.prototype.add_nested = function( cls, id, label, callback, icon, hidden ) {

    var menu = new tadpole.NestedMenu( this.manager, this.ul, cls, id, label, callback, icon, hidden );
    this.buttons.push(menu);
    return menu;

};


/**
 * Resize the menu.
 * @method resize
 */
tadpole.Menu.prototype.resize = function(  ) {

    this.overlay.resize();

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.Menu.prototype.toggle = function(  ) {

    this.resize();
    
    if( this.overlay.visible ) {
        this.overlay.hide();
        return this.overlay.visible;
    }
    
    this.overlay.reveal();
    return this.overlay.visible;

};

tadpole.Menu.prototype.reveal = function(  ) {

    return this.overlay.reveal();

};

tadpole.Menu.prototype.hide = function(  ) {

    return this.overlay.hide();

};

tadpole.Menu.prototype.hide_quick = function(  ) {

    this.overlay.hide_quick();

};


/**
 * Nested menu.
 * @class tadpole.NestedMenu
 * @constructor
 */
tadpole.NestedMenu = function( ui, parent, cls, id, label, callback, icon, hidden ) {

    this.manager = ui;
    this.parent = parent;
    this.buttons = [];
    this.label = label;
    this.callback = callback;
    this.cls = cls;
    this.id = id || '';
    this.icon = icon || '';
    this.hidden = hidden || false;
    this.button = null;
    this.view = null;
    this.ul = null;
    this.visible = true;
    this.build();

};

/**
 * Build the nested menu.
 * @method build
 */
tadpole.NestedMenu.prototype.build = function(  ) {

    var icon = '';
    var id = '';
    var selector = '.button.' + replaceAll(this.cls, ' ', '.');
    
    if( this.icon )
        icon = '<span class="icon-' + this.icon + '"></span>';
    
    if( this.id ) {
        selector = selector + '#' + this.id;
        id = 'id="' + this.id + '" ';
    }
    
    this.parent.append('<li' + ( this.hidden ? ' class="hidden"': '' ) + '>'
        +'<a class="button ' + this.cls + '" '+id+'href="#">'
        +icon+this.label
        +'</a><ul></ul></li>');
    
    this.button = this.parent.find(selector);
    this.view = this.button.parent();
    this.ul = this.view.find('ul');
    
    var cb = this.callback;
    
    this.button.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        cb( event );
    
    } );
    
    this.button.css({'width': this.parent.parent().parent().width() - 30});

};

/**
 * Add a button to the menu.
 * @method add
 * @param cls {String} Class for the button.
 * @param id {String} ID for the button.
 * @param label {String} Label for the button.
 * @param callback {Function} Method to call when the button is clicked.
 * @param icon {String} Name of the icon to use for the button.
 */
tadpole.NestedMenu.prototype.add = function( cls, id, label, callback, icon, hidden ) {

    var button = new tadpole.MenuButton( this.ul, cls, id, label, callback, icon, hidden, 30 );
    this.buttons.push(button);
    return button;

};


/**
 * Button in a menu.
 * @class tadpole.MenuButton
 * @constructor
 */
tadpole.MenuButton = function( parent, cls, id, label, callback, icon, hidden, pad ) {

    this.parent = parent;
    this.label = label;
    this.callback = callback;
    this.cls = cls;
    this.id = id || '';
    this.icon = icon || '';
    this.hidden = hidden || false;
    this.pad = pad || 0;
    this.button = null;
    this.view = null;
    this.visible = true;
    this.build();

};


/**
 * Build the button.
 * @method build
 */
tadpole.MenuButton.prototype.build = function(  ) {

    var icon = '';
    var id = '';
    var selector = '.button.' + replaceAll(this.cls, ' ', '.');
    
    if( this.icon )
        icon = '<span class="icon-' + this.icon + '"></span>';
    
    if( this.id ) {
        selector = selector + '#' + this.id;
        id = 'id="' + this.id + '" ';
    }
    
    this.parent.append('<li' + ( this.hidden ? ' class="hidden"': '' ) + '>'
        +'<a class="button ' + this.cls + '" '+id+'href="#">'
        +icon+this.label
        +'</a></li>');
    
    this.button = this.parent.find(selector);
    this.view = this.button.parent();
    
    var cb = this.callback;
    
    this.button.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        cb( event );
    
    } );
    
    var parent = this.parent.parent().parent();
    
    if( this.pad != 0 )
        parent = parent.parent().parent();
    
    this.button.css({'width': parent.width() - (30 + this.pad)});

};

/**
 * Remove this shit yo.
 * @method remove
 */
tadpole.MenuButton.prototype.remove = function(  ) {

    this.view.remove();

};


/**
 * Menu for the fucking thingy.
 * @class tadpole.Menu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.MainMenu = function( ui ) {

    this.manager = ui;
    this.menu = null;
    this.users = null;
    this.heads = null;
    this.build();

};


/**
 * Place the menu on the page.
 * @method build
 */
tadpole.MainMenu.prototype.build = function(  ) {

    // Create the main menu.
    /*
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
    */
    
    this.menu = new tadpole.Menu( this.manager, this.manager.view, 'main' );
    
    
    // Handle events.
    var menu = this;
    
    this.button_head = this.menu.add( 'head', '', 'Title/Topic', function( event ) {
    
        menu.show_head();
    
    }, 'doc' );
    
    this.button_users = this.menu.add( 'users', '', 'Users', function( event ) {
    
        menu.show_users();
    
    }, 'user' );
    
    this.button_channels = this.menu.add( 'channels', '', 'Channels', function( event ) {
    
        menu.show_channels();
    
    }, 'comment' );
    
    
    this.commands = this.menu.add_nested( 'commands', '', 'Commands', function( event ) {}, 'plus' );
    //this.commands.add( 'join', 'Join Channel', function( event ) {} );
    //this.commands.add( 'part', 'Leave Channel', function( event ) {} );
    
    
    this.button_settings = this.menu.add( 'settings', '', 'Settings', function( event ) {
    
        menu.show_settings();
    
    }, 'cog' );
    
    // Create sub-menus.
    this.channel = new tadpole.ChannelMenu( this.manager, this.manager.view );
    this.heads = new tadpole.HeadArray( this.manager, this, this.manager.view, 'head', 'h' );
    this.users = new tadpole.UsersArray( this.manager, this, this.manager.view, 'userlist', 'u' );
    this.commanditems = new tadpole.MenuItemArray( this.manager, this, this.manager.view, 'command', 'mcom' );
    //this.settings = new tadpole.SettingsOverlay( this.manager );

};

/**
 * Resize the menu.
 * @method resize
 */
tadpole.MainMenu.prototype.resize = function(  ) {

    this.menu.resize();
    this.channel.resize();
    this.heads.resize();
    this.users.resize();
    this.commanditems.resize();
    //this.settings.reszie();

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.MainMenu.prototype.toggle = function(  ) {

    this.resize();
    
    if( this.menu.overlay.visible ) {
        this.channel.hide();
        this.heads.hide();
        this.users.hide();
        this.menu.hide();
        this.commanditems.hide();
        this.manager.top.inactive();
        return this.menu.overlay.visible;
    }
    
    this.menu.reveal();
    this.manager.top.active();
    return this.menu.overlay.visible;

};

tadpole.MainMenu.prototype.hide_quick = function(  ) {

    this.manager.top.inactive();
    this.menu.hide_quick();

};

/**
 * Show the head.
 * @method show_head
 */
tadpole.MainMenu.prototype.show_head = function(  ) {

    this.heads.reveal(this.manager.book.current.selector);

};

/**
 * Show the users.
 * @method show_users
 */
tadpole.MainMenu.prototype.show_users = function(  ) {

    this.users.reveal(this.manager.book.current.selector);

};

/**
 * Show the channels.
 * @method show_channels
 */
tadpole.MainMenu.prototype.show_channels = function(  ) {

    this.channel.reveal();

};

/**
 * Show the settings.
 * @method show_settings
 */
tadpole.MainMenu.prototype.show_settings = function(  ) {};


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


