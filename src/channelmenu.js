
/**
 * Channel list for the fucking thingy.
 * @class tadpole.ChannelMenu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.ChannelMenu = function( ui, parentview ) {

    this.manager = ui;
    this.parentview = parentview;
    this.menu = null;
    this.build();

};


/**
 * Place the channel list on the page.
 * @method build
 */
tadpole.ChannelMenu.prototype.build = function(  ) {

    // Create the channel menu.
    this.menu = new tadpole.Menu(this.manager, this.parentview, 'channels');
    
    var menu = this;
    
    this.menu.add( 'back', 'exit', 'Channels', function( event ) {
    
        menu.hide();
    
    }, 'left-open' );

};

/**
 * Resize the channel menu.
 * @method resize
 */
tadpole.ChannelMenu.prototype.resize = function(  ) {

    this.menu.resize();

};

/**
 * Reveal the menu.
 * @method reveal
 */
tadpole.ChannelMenu.prototype.reveal = function(  ) {

    return this.menu.reveal();

};

/**
 * Hide the menu.
 * @method hide
 */
tadpole.ChannelMenu.prototype.hide = function(  ) {

    return this.menu.hide();

};

/**
 * Add a channel to the menu.
 * @method add
 */
tadpole.ChannelMenu.prototype.add = function( ns, raw, hidden ) {
    
    var menu = this;
    
    var tab = this.menu.add(
        'tab',
        'tab-c-' + replaceAll(raw, ':', '-'),
        ns, function( event ) {
            menu.manager.book.reveal(raw);
            menu.manager.menu.toggle();
        }, '', hidden
    );
    
    if( ns[0] == '~' )
        return tab;
    
    tab.button.append('<span class="button right red close icon-cancel"></span>');
    var close = tab.view.find('.button.close');
    
    close.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        menu.manager.client.part(raw);
    
    } );
    
    return tab;

};