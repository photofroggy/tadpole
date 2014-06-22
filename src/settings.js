
/**
 * Settings menu.
 * @class tadpole.SettingsMenu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.SettingsMenu = function( ui, parentview ) {

    this.manager = ui;
    this.parentview = parentview;
    this.menu = null;
    this.build();

};


/**
 * Place the channel list on the page.
 * @method build
 */
tadpole.SettingsMenu.prototype.build = function(  ) {

    // Create the channel menu.
    this.menu = new tadpole.Menu(this.manager, this.parentview, 'settings');
    
    var menu = this;
    
    this.add( 'exit', 'Settings', function( event ) {
    
        menu.hide();
    
    }, 'left-open' );
    
    this.add( 'comingsoon', 'Coming Soon...', function( event ) {} );

};

/**
 * Resize the channel menu.
 * @method resize
 */
tadpole.SettingsMenu.prototype.resize = function(  ) {

    this.menu.resize();

};

/**
 * Reveal the menu.
 * @method reveal
 */
tadpole.SettingsMenu.prototype.reveal = function(  ) {

    return this.menu.reveal();

};

/**
 * Hide the menu.
 * @method hide
 */
tadpole.SettingsMenu.prototype.hide = function(  ) {

    return this.menu.hide();

};

/**
 * Add an item to the settings menu.
 * @method add
 */
tadpole.SettingsMenu.prototype.add = function( id, label, callback, icon, hidden ) {
    
    var menu = this;
    
    var tab = this.menu.add(
        'settings', id,
        label, function( event ) {
            callback( event );
        }, icon, hidden
    );
    
    return tab;

};