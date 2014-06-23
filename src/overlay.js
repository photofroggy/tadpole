/**
 * GUI overlay for the menu.
 * @class tadpole.Overlay
 * @constructor
 */
tadpole.Overlay = function( parentview, cls, id, origin ) {

    this.parentview = parentview;
    this.cls = cls;
    this.id = id || null;
    this.selector = '.overlay.' + replaceAll(this.cls, ' ', '.');
    this.origin = origin || 'top';
    this.visible = false;
    
    if( this.id != null )
        this.selector = this.selector + '#' + this.id;
    
    this.build();

};

/**
 * Build the overlay.
 * @method build
 */
tadpole.Overlay.prototype.build = function(  ) {

    var ids = '';
    
    if( this.id )
        ids = ' id="' + this.id + '"';
    
    this.parentview.append('<div class="overlay ' + this.cls + '"' + ids + '></div>');
    this.view = this.parentview.find(this.selector);
    
    var clh = $(window).height();
    this.view.height( clh - 45 );

};

/**
 * Resize the overlay.
 * @method resize
 */
tadpole.Overlay.prototype.resize = function(  ) {

    var clh = $(window).height();
    this.view.height( clh - 45 );

};

/**
 * Show the overlay.
 * @method reveal
 */
tadpole.Overlay.prototype.reveal = function(  ) {

    if( this.visible )
        return;
    
    switch(this.origin) {
        /*case 'left':
            this.view.slideRight();
            break;
        case 'right':
            this.view.slideLeft();
            break;
        case 'bottom':
            this.view.slideUp();
            break;*/
        case 'top':
        default:
            this.view.slideDown();
            break;
    }
    
    this.visible = true;

};

/**
 * Hide the overlay.
 * @method hide
 */
tadpole.Overlay.prototype.hide = function(  ) {

    if( !this.visible )
        return;
    
    switch(this.origin) {
        /*case 'left':
            this.view.slideLeft();
            break;
        case 'right':
            this.view.slideRight();
            break;
        case 'bottom':
            this.view.slideDown();
            break;*/
        case 'top':
        default:
            this.view.slideUp();
            break;
    }
    
    this.visible = false;

};

/**
 * Quick hide!
 * @method hide_quick
 */
tadpole.Overlay.prototype.hide_quick = function(  ) {

    this.view.css({ 'display': 'none' });
    this.visible = false;

};

/**
 * Remove the overlay completely.
 * @method remove
 */
tadpole.Overlay.prototype.remove = function(  ) {

    this.view.remove();

};


/**
 * Array of overlays.
 * @class tadpole.OverlayArray
 * @constructor
 */
tadpole.OverlayArray = function( parentview, cls, id, origin ) {

    this.parentview = parentview;
    this.cls = cls;
    this.id = id;
    this.origin = origin || 'top';
    this.overlays = {};

};

/**
 * Add a new thingy to the thing.
 * @method add
 */
tadpole.OverlayArray.prototype.add = function( id ) {

    this.remove( id );
    var overlay = new tadpole.Overlay( this.parentview, this.cls, this.id + '-' + id, this.origin );
    this.overlays[id.toLowerCase()] = overlay;
    return overlay;

};

/**
 * Get an overlay.
 * @method overlay
 */
tadpole.OverlayArray.prototype.overlay = function( id ) {

    try {
        return this.overlays[id.toLowerCase()];
    } catch(err) {}
    
    return null;

};

/**
 * Iterate through the overlays.
 * @method each
 */
tadpole.OverlayArray.prototype.each = function( callback ) {

    for( var id in this.overlays ) {
        if( !this.overlays.hasOwnProperty(id) )
            continue;
        callback(id, this.overlays[id]);
    }

};

/**
 * Resize all of the overlays.
 * @method resize
 */
tadpole.OverlayArray.prototype.resize = function(  ) {

    this.each(
        function( id, ol ) {
            ol.resize();
        }
    );

};

/**
 * Reveal an overlay.
 * @method reveal
 */
tadpole.OverlayArray.prototype.reveal = function( id ) {

    var ol = this.overlay(id);
    
    if( ol == null )
        return;
    
    ol.reveal();

};

/**
 * Hide overlays.
 * @method hide
 */
tadpole.OverlayArray.prototype.hide = function(  ) {

    this.each(
        function( id, ol ) {
            ol.hide();
        }
    );

};

/**
 * Hide overlays quickly.
 * @method hide_quick
 */
tadpole.OverlayArray.prototype.hide_quick = function(  ) {

    this.each(
        function( id, ol ) {
            ol.hide_quick();
        }
    );

};

/**
 * Remove an overlay.
 * @method remove
 */
tadpole.OverlayArray.prototype.remove = function( id ) {

    var ol = this.overlay(id);
    
    if( ol == null )
        return;
    
    ol.remove();
    delete this.overlays[id.toLowerCase()];

};

/**
 * Remove all overlays.
 * @method remove_all
 */
tadpole.OverlayArray.prototype.remove_all = function(  ) {

    this.each(
        function( id, ol ) {
            ol.remove();
            delete this.overlays[id];
        }
    );

};

