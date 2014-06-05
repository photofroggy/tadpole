
/**
 * Menu for the fucking thingy.
 * @class tadpole.Menu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.Menu = function( ui ) {

    this.manager = ui;
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
        +'  <li><a class="users" href="#">Users</a></li>'
        +'  <li><a class="channels" href="#">Channels</a></li>'
        +'  <li><a class="settings" href="#">Settings</a></li>'
        +'</ul></nav>');
    
    this.view = this.overlay.view.find('nav');
    this.button_users = this.view.find('.users');
    this.button_channels = this.view.find('.channels');
    this.button_settings = this.view.find('.settings');
    
    // Handle events.
    var menu = this;
    
    this.button_users.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_users();
    
    } );
    
    this.button_channels.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_channels();
    
    } );
    
    this.button_settings.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_settings();
    
    } );
    
    // Create sub-menus.
    this.channel = new tadpole.ChannelMenu( this.manager, this.overlay.view );
    //this.users = new tadpole.UsersOverlay( this.manager );
    //this.settings = new tadpole.SettingsOverlay( this.manager );

};

/**
 * Resize the menu.
 * @method resize
 */
tadpole.Menu.prototype.resize = function(  ) {

    this.overlay.resize();
    this.channel.resize();
    //this.users.resize();
    //this.settings.reszie();

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.Menu.prototype.toggle = function(  ) {

    if( this.overlay.visible ) {
        this.channel.hide();
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
 * Show the users.
 * @method show_users
 */
tadpole.Menu.prototype.show_users = function(  ) {};

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


