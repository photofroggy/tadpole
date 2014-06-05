

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
    
    var clh = $(window).height();
    this.view.height( clh - 72 );

};

/**
 * Resize the channel book.
 * @method resize
 */
tadpole.Book.prototype.resize = function(  ) {

    var clh = $(window).height();
    this.view.height( clh - 72 );
    this.current.scroll();

};


/**
 * Get a channel.
 * @method channel
 * @param ns {String} Namespace
 */
tadpole.Book.prototype.channel = function( ns ) {

    var nsk = ns.toLowerCase();
    
    for( var k in this.clist ) {
    
        if( !this.clist.hasOwnProperty( k ) )
            continue;
        
        if( k == nsk )
            return this.clist[k];
    
    }
    
    return null;

};


/**
 * Create channel
 * @method add
 * @param ns {String} Namespace for the channel
 * @param raw {String} Raw namespace for the channel
 */
tadpole.Book.prototype.add = function( ns, raw, tab ) {

    var chan = new tadpole.Channel( ns, raw, tab, this.manager, this );
    this.clist[raw.toLowerCase()] = chan;
    this.reveal(raw);
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

/**
 * Display a log item across all open channels.
 * 
 * @method log
 * @param msg {String} Message to display.
 */
tadpole.Book.prototype.log = function( msg ) {

    for( ns in this.clist ) {
        this.clist[ns].log(msg);
    }

};

/**
 * Handle a log message.
 * @method log_message
 * @param message {Object} Log message object
 * @param event {Object} Event data
 */
tadpole.Book.prototype.log_message = function( message, event ) {

    try {
        if( !message.global ) {
            if( !message.monitor ) {
                this.channel( event.ns ).log( event.html );
            } else {
                this.manager.log( event.html );
            }
        } else {
            this.log( event.html );
        }
    } catch( err ) {
        try {
            this.manager.log( 'Failed to log for', event.sns, event.html );
        } catch( err ) {
            console.log( '>> Failed to log message for', event.sns, '::' );
            console.log( '>>', event.html );
            console.log( err );
        }
    }

};

