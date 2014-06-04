
/**
 * Channel list for the fucking thingy.
 * @class tadpole.ChannelMenu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.ChannelMenu = function( ui, parentview ) {

    this.manager = ui;
    this.parentview = parentview;
    this.build();

};


/**
 * Place the channel list on the page.
 * @method build
 */
tadpole.ChannelMenu.prototype.build = function(  ) {

    // Create the main menu.
    this.overlay = new tadpole.Overlay( this.manager.view, 'channelmenu', 'right' );
    this.overlay.view.append('<nav class="channels">'
        +'<ul>'
        +'  <li><span class="button" id="channelexit">&laquo; Channels</span></li>'
        +'</ul></nav>');
    
    this.view = this.overlay.view.find('nav');
    this.ul = this.view.find('ul');
    this.button_back = this.ul.find('span#channelexit');
    
    var cmenu = this;
    
    this.button_back.on( 'click', function( event ) {
    
        event.preventDefault();
        cmenu.hide();
    
    } );

};

/**
 * Reveal the menu.
 * @method reveal
 */
tadpole.ChannelMenu.prototype.reveal = function(  ) {

    this.overlay.reveal();
    return this.overlay.visible;

};

/**
 * Hide the menu.
 * @method hide
 */
tadpole.ChannelMenu.prototype.hide = function(  ) {

    this.overlay.hide();
    return this.overlay.visible;

};

/**
 * Add a channel to the menu.
 * @method add
 */
tadpole.ChannelMenu.prototype.add = function( ns, raw ) {

    var selector = replaceAll(raw, 'pchat:', 'c-pchat-');
    selector = replaceAll(selector, 'chat:', 'c-chat-');
    selector = replaceAll(selector, 'server:', 'c-server-');
    selector = replaceAll(selector, ':', '-');
    
    this.ul.append( '<li><a id="tab-' + selector + '" href="#">' + ns + '</a></li>');
    
    var cmenu = this;
    var tab = this.ul.find('a#tab-' + selector);
    
    tab.on( 'click', function( event ) {
    
        event.preventDefault();
        cmenu.manager.book.reveal(raw);
        cmenu.manager.menu.toggle();
    
    } );
    
    return tab;

};