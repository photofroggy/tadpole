
/**
 * Channel header.
 * @class tadpole.Head
 * @constructor
 */
tadpole.Head = function( manager, menu, id, overlay, hidden ) {
    tadpole.MenuItem.call(this, manager, menu, id, overlay, hidden);
};
tadpole.Head.prototype = new tadpole.MenuItem;
tadpole.Head.prototype.constructor = tadpole.MenuItem;

/**
 * Build the channel head display within the overlay.
 * @method build
 */
tadpole.Head.prototype.build = function(  ) {

    this.overlay.view.append(
        '<nav><ul><li>'
        +'  <span class="button" id="headexit"><span class="icon-left-open"></span>Title/Topic</span>'
        +'</li></ul></nav>'
        +'<div class="title"></div><div class="topic"></div>'
    );
    
    this.button_exit = this.overlay.view.find('nav ul li span.button#headexit');
    
    this.view = {
        title: this.overlay.view.find('div.title'),
        topic: this.overlay.view.find('div.topic')
    };
    
    this.content = {
        title: {
            data: new wsc.MessageString(''),
            by: '',
            ts: 0.0
        },
        topic: {
            data: new wsc.MessageString(''),
            by: '',
            ts: 0.0
        },
    };
    
    var head = this;
    
    this.button_exit.on( 'click', function( event ) {
    
        event.preventDefault();
        head.overlay.hide();
        head.hide();
    
    } );

};

/**
 * Set the title or topic.
 * @method set
 */
tadpole.Head.prototype.set = function( header, content, by, ts ) {

    this.view[header].html(content.html());
    this.content[header].data = content;
    this.content[header].by = by;
    this.content[header].ts = ts;

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

tadpole.HeadArray.prototype.create_item = function( id, overlay, hidden ) {

    return new tadpole.Head( this.manager, this.menu, id, overlay, hidden );

};
