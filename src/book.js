

/**
 * Channel book.
 * Displays one channel at a time.
 * @class tadpole.Book
 * @contructor
 */
tadpole.Book = function( ui ) {

    this.manager = ui;
    this.clist = {};
    this.chans = [];
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
    this.view.height( clh - 80 );

};

/**
 * Resize the channel book.
 * @method resize
 */
tadpole.Book.prototype.resize = function(  ) {

    var clh = $(window).height();
    this.view.height( clh - 80 );
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
 * Iterate through each channel.
 * @method each
 */
tadpole.Book.prototype.each = function( callback, exclude_hidden ) {

    var chan = null;
    exclude_hidden = exclude_hidden || false;
    
    for( var k in this.clist ) {
    
        if( !this.clist.hasOwnProperty( k ) )
            continue;
        
        chan = this.clist[k];
        
        if( chan.hidden && exclude_hidden )
            continue;
        
        if( callback( k, chan ) )
            break;
    
    }

};

/**
 * Count the number of channels currently open in the UI.
 * @method count
 */
tadpole.Book.prototype.count = function( exclude_hidden ) {

    var count = -1;
    
    this.each( function( ns, chan ) {
    
        count++;
    
    }, exclude_hidden );
    
    return count;

};


/**
 * Create channel
 * @method add
 * @param ns {String} Namespace for the channel
 * @param raw {String} Raw namespace for the channel
 */
tadpole.Book.prototype.add = function( ns, raw, hidden, components ) {

    this.remove(raw);
    var chan = new tadpole.Channel( ns, raw, hidden, components, this.manager, this );
    this.clist[raw.toLowerCase()] = chan;
    this.chans.push(raw.toLowerCase());
    
    if( !hidden )
        this.reveal(raw);
    
    return chan;

};

/**
 * Remove a channel from the book.
 * @method remove
 */
tadpole.Book.prototype.remove = function( raw ) {

    var chan = this.channel(raw);
    
    if( !chan )
        return;
    
    if( this.count(true) == 0 && !chan.hidden )
        return;
    
    var rawk = raw.toLowerCase();
    
    chan.remove();
    delete this.clist[rawk];
    
    if( chan == this.current )
        this.reveal(this.previous());
    
    this.chans.splice(this.chans.indexOf(rawk), 1);

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
 * Get the namespace for the channel appearing before the current channel.
 * 
 * @method previous
 */
tadpole.Book.prototype.previous = function(  ) {

    var ns = this.current.raw;
    var index = this.chans.indexOf(ns.toLowerCase());
    
    if( index < 0 )
        return ns;
    
    var nc = null;
    while( true ) {
        try {
            nc = this.channel(this.chans[--index]);
        } catch( err ) {
            index = this.chans.length - 1;
            nc = this.channel(this.chans[index]);
        }
        
        if( !nc.hidden )
            break;
        
        //if( this.manager.settings.developer )
        //    break;
    }
    
    return nc.raw;

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

    var mbox = null;
    
    try {
        if( !message.global ) {
            if( !message.monitor ) {
                mbox = this.channel( event.ns ).log( event.html );
            } else {
                mbox = this.manager.log( event.html );
            }
        } else {
            mbox = this.log( event.html );
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
    
    if( !event.hasOwnProperty( 'user' )
        || event.user.toLowerCase() == this.manager.lusername )
        return;
    
    if( event.name == 'recv_msg' ||
        event.name == 'recv_action' ) {
        if( event.message.toLowerCase().indexOf( this.manager.lusername ) != -1 ) {
            mbox.addClass('highlight');
            try {
                this.channel( event.ns ).highlight();
            } catch(err) {}
        }
    }
    
    var user = event.user;
    var control = this.manager.control;
    
    mbox.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        
        var text = control.get_text();
        
        if( text.length > 0 ) {
            control.set_text(
                text
                + ( text[text.length - 1] == ' ' ? '' : ' ' ) 
                + user
            );
            return;
        }
        
        control.set_text(user + ': ');
    
    } );

};

/**
 * Handle an event.
 * @method handle
 */
tadpole.Book.prototype.handle = function( event, client ) {

    var c = this.channel(event.ns);
    
    if( !c )
        return;
    
    var meth = 'pkt_' + event.name;
    //console.log(meth, c[meth]);
    
    try {
        c[meth](event, client);
    } catch( err ) {
        //console.log(err);
    }

};

