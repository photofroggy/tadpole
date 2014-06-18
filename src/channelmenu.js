
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
    this.overlay = new tadpole.Overlay( this.manager.view, 'channelmenu' );
    this.overlay.view.append('<nav class="channels">'
        +'<ul>'
        +'  <li><span class="button" id="channelexit"><span class="icon-left-open"></span>Channels</span></li>'
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
 * Resize the channel menu.
 * @method resize
 */
tadpole.ChannelMenu.prototype.resize = function(  ) {

    this.overlay.resize();

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
tadpole.ChannelMenu.prototype.add = function( ns, raw, hidden ) {

    var selector = 'c-' + replaceAll(raw, ':', '-');
    var hcls = '';
    
    if( hidden )
        hcls = 'class="hidden" ';
    
    this.ul.append( '<li><a '+hcls+'id="tab-' + selector + '" href="#">' + ns + '</a></li>');
    
    var cmenu = this;
    var tab = this.ul.find('a#tab-' + selector);
    
    tab.on( 'click', function( event ) {
    
        event.preventDefault();
        cmenu.manager.book.reveal(raw);
        cmenu.manager.menu.toggle();
    
    } );
    
    return tab;

};