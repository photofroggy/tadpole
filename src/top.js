
/**
 * Top bar for the fucking thingy.
 * @class tadpole.Top
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.Top = function( ui ) {

    this.manager = ui;
    this.unread = 0;
    this.build();

};


/**
 * Place the top bar on the page.
 * @method build
 */
tadpole.Top.prototype.build = function(  ) {

    this.manager.view.append('<div class="top">'
        +'<span class="label">Tadpole</span>'
        +'<span class="control">'
        +'<span class="button highlights red icon-comment"><span class="count">5</span></span>'
        +'<a class="menubutton icon-menu" href="#"></a></span></div>');
        
    this.view = this.manager.view.find('.top');
    this.button = this.view.find('.menubutton');
    this.label = this.view.find('span.label');
    this.hbox = this.view.find('.highlights');
    this.hcount = this.hbox.find('.count');

    var top = this;
    
    this.button.on( 'click', function( event ) {
    
        event.preventDefault();
        console.log('menu button clicked');
    
    } );
    
    this.view.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        top.manager.toggle_menu();
    
    } );

};

/**
 * Set the text for the top bar.
 * @method set_label
 */
tadpole.Top.prototype.set_label = function( text ) {

    this.label.html(text);

};

/**
 * Set the menu as active.
 * @method active
 */
tadpole.Top.prototype.active = function(  ) {

    if( this.view.hasClass('active') )
        return;
    
    this.view.addClass('active');

};

/**
 * Set the menu as inactive.
 * @method inactive
 */
tadpole.Top.prototype.inactive = function(  ) {

    if( !this.view.hasClass('active') )
        return;
    
    this.view.removeClass('active');

};

/**
 * Tab the user n times.
 * @method tab
 */
tadpole.Top.prototype.tab = function( msgs ) {

    this.unread = this.unread + msgs;
    this.notify();

};

/**
 * Untab the user n times.
 * @method tab
 */
tadpole.Top.prototype.untab = function( msgs ) {

    this.unread = this.unread - msgs;
    this.notify();

};

/**
 * Reveal or hide the highlighting notice depending on the unread count.
 * @method notify
 */
tadpole.Top.prototype.notify = function(  ) {

    
    if( this.unread <= 0 ) {
        var top = this;
        this.hbox.fadeOut( function(  ) {
            top.hcount.text( top.unread.toString() );
        });
        return;
    }
    
    this.hcount.text( this.unread.toString() );
    
    var margin = -15;
    
    if( this.unread > 9 )
        margin = -25;
    
    this.hbox.fadeIn();
    this.hcount.css({'margin-right': margin});

};


