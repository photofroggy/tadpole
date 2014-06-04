

/**
 * Channel book.
 * Displays one channel at a time.
 * @class tadpole.Book
 * @contructor
 */
tadpole.Book = function( ui ) {

    this.manager = ui;
    this.clist = {};
    this.current = null;
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
 * @method add
 * @param ns {String} Namespace for the channel
 * @param raw {String} Raw namespace for the channel
 */
tadpole.Book.prototype.add = function( ns, raw, tab ) {

    var chan = new tadpole.Channel( ns, raw, tab, this.manager, this );
    this.clist[ns.toLowerCase()] = chan;
    this.reveal(ns);
    return chan;

};


/**
 * Reveal a given channel, hide the current one.
 * @method reveal
 */
tadpole.Book.prototype.reveal = function( ns ) {

    var nsk = ns.toLowerCase();
    
    if( !this.clist.hasOwnProperty(nsk) )
        return;
    
    if( this.current )
        this.current.hide();
    
    this.current = this.clist[nsk];
    this.current.reveal();
    this.manager.top.set_label(this.current.ns);

};

