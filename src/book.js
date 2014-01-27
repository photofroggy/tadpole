

/**
 * Channel book.
 * Displays one channel at a time.
 * @class tadpole.Book
 * @contructor
 */
tadpole.Book = function( ui ) {

    this.manager = ui;
    this.clist = {};
    this.build();

};


/**
 * Place the channel book on the screen.
 * @method build
 */
tadpole.Book.prototype.build = function(  ) {

    this.manager.view.append('<div class="book"></div>');
    this.view = this.manager.view.find('div.book');

};


/**
 * Create channel
 * @method add_channel
 * @param ns {String} Namespace for the channel
 * @param raw {String} Raw namespace for the channel
 */
tadpole.Book.prototype.add_channel = function( ns, raw ) {

    var chan = new tadpole.Channel( ns, raw, this.manager, this );
    this.clist[ns.toLowerCase] = chan;
    return chan;

};

