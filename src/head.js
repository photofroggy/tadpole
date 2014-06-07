
/**
 * Channel header.
 * @class tadpole.Head
 * @constructor
 */
tadpole.Head = function( manager, menu, id, overlay ) {
    tadpole.MenuItem.call(this, manager, menu, id, overlay);
};
tadpole.Head.prototype = new tadpole.MenuItem;
tadpole.Head.prototype.constructor = tadpole.MenuItem;

/**
 * Build the channel head display within the overlay.
 * @method build
 */
tadpole.Head.prototype.build = function(  ) {

    this.overlay.view.append('<div class="title">title</div><div class="topic">topic</div>');

};


/**
 * Array of channel headers.
 * @class tadpole.HeadArray
 * @constructor
 */
tadpole.HeadArray = function( ui, menu, parentview, cls, id, origin ) {
    tadpole.MenuItemArray.call(this, ui, menu, parentview, cls, id, origin );
};
tadpole.HeadArray.prototype = new tadpole.MenuItemArray;
tadpole.HeadArray.prototype.constructor = tadpole.HeadArray;

tadpole.HeadArray.prototype.create_item = function( id, overlay ) {

    return new tadpole.Head( this.manager, this.menu, id, overlay );

};
