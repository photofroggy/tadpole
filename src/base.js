
/**
 * Tadpole UI lib.
 */
var tadpole = {};

tadpole.VERSION = '1.0.1';
tadpole.REVISION = '66';
tadpole.STATE = 'rc';


// jQuery hook.

( function( $ ) {
    $.fn.tadpole = function( method, client, options ) {
        
        var ui = $(window).data('tadpole');
        
        if( method == 'init' || ui === undefined ) {
            if( ui == undefined ) {
                ui = new tadpole.UI( $(this), client, options, ($.browser.mozilla || false) );
                $(window).resize(function() {
                    ui.resize();
                });
                setInterval(function(  ) { ui.loop(); }, 120000);
                ui.build();
            }
            $(window).data('tadpole', ui);
        }
        
        if( method != 'init' && method != undefined ) {
            method = 'jq_' + method;
            if( method in ui )
                ui[method]( $(this), options);
        }
        
        return ui;
        
    };
    
} )( jQuery );




replaceAll = function( text, search, replace ) {
    return text.split(search).join(replace);
};

// Size of an associative array, wooo!
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.steal = function( a, b ) {
    for( var index in b ) {
        if( !a.hasOwnProperty(index) && !b.hasOwnProperty(index) )
            continue;
        if( typeof a[index] == 'object' ) {
            a[index] = Object.extend(a[index], b[index]);
        } else {
            a[index] = b[index];
        }
    }
};

Object.extend = function( a, b ) {
    var obj = {};
    Object.steal(obj, a);
    Object.steal(obj, b);
    return obj;
};

function zeroPad( number, width ) {
    width = width || 2;
    width -= number.toString().length;
    if ( width > 0 ) {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + "";
}

function formatTime( format, date ) {
    date = date || new Date();
    
    HH = date.getHours();
    hh = HH;
    format = replaceAll(format, '{mm}', zeroPad(date.getMinutes(), 2));
    format = replaceAll(format, '{ss}', zeroPad(date.getSeconds(), 2));
    mr = 'am';
    
    if( hh > 11 ) {
        mr = 'pm';
        if( hh > 12 )
            hh = hh - 12;
    } else if( hh == 0 ) {
        hh = '12';
    }
    
    format = replaceAll(format, '{hh}', zeroPad(hh, 2));
    format = replaceAll(format, '{HH}', zeroPad(HH, 2));
    format = replaceAll(format, '{mr}', mr);
    return format;
}


/**
 * Main UI object.
 * @class tadpole.UI
 * @constructor
 */
tadpole.UI = function( view, client, options, mozilla ) {

    this.client = client;
    this.options = Object.extend({
        'monitor': ['~Monitor', true],
        default_theme: 'Blue',
        themes: {
            Blue: 'theme_blue',
            Dark: 'theme_dark',
            'DeviantArt Green': 'theme_dagr'
        }
    }, options || {});
    
    this.mozilla = mozilla;
    
    client.settings.agent = 'tadpole/' + tadpole.VERSION
        + '-r' + tadpole.REVISION + ' ' + client.settings.agent;
    
    this.LIB = 'tadpole';
    this.VERSION = tadpole.VERSION;
    this.REVISION = tadpole.REVISION;
    this.STATE = tadpole.STATE;
    
    view.append('<div class="tadpole"></div>');
    this.view = view.find('.tadpole');
    
    this.control = null;
    this.top = null;
    this.menu = null;
    this.book = null;
    this.monitor = null;
    this.lusername = this.client.settings.username.toLowerCase();
    
    this.protocol = new tadpole.Protocol();
    
    this.mw = new wsc.Middleware();
    this.evt = new EventEmitter();
    
    this.ext = {};

};


/**
 * Build the interface!
 * @method build
 */
tadpole.UI.prototype.build = function(  ) {

    this.top = new tadpole.Top( this );
    this.book = new tadpole.Book( this );
    this.control = new tadpole.Control( this );
    this.menu = new tadpole.MainMenu( this );
    
    // Create a monitor channel for debugging?
    // Shouldn't really need this sort of thing.
    // Although debugging on mobile is somewhat tricky.
    this.monitor = this.channel_add( this.options.monitor[0], replaceAll(this.options.monitor[0], '~', 'server:') );
    
    var ui = this;
    
    this.client.bind( 'pkt', function( event, client ) {
    
        ui.packet(event, client);
    
    } );
    
    this.client.bind( 'log', function( event, client ) {
    
        ui.packet(event, client);
    
    } );
    
    // Channel removed from client.
    this.client.middle(
        'ns.remove',
        function( data, done ) {
            ui.book.remove( data.ns );
            done( data );
        }
    );
    
    this.client.bind(
        'ns.create',
        function( event, client ) {
            ui.channel_add(event.chan.namespace, event.chan.raw, event.chan.hidden);
        }
    );
    
    this.client.bind(
        'ns.user.list',
        function( event, client ) {
            ui.book.channel(client.format_ns(event.ns)).users.set_users( event.users );
        }
    );
    
    this.client.middle(
        'ns.user.privchg',
        function( data, done ) {
            var users = ui.book.channel(ui.client.format_ns(data.ns)).users;
            var member = ui.client.channel(data.ns).info.members[data.user];
            
            users.remove_user(data.user, true);
            
            if( !member ) {
                users.reveal_pcs();
                done(data);
                return;
            }
            
            member = Object.extend(member, {});
            member.pc = data.pc;
            users.set(member);
            done(data);
        }
    );
    
    this.client.bind(
        'ns.user.remove',
        function( event, client ) {
            ui.book.channel(client.format_ns(event.ns)).users.register( event.user );
        }
    );
    
    this.client.bind(
        'ns.user.registered',
        function( event, client ) {
            ui.book.channel(client.format_ns(event.ns)).users.register( event.user );
        }
    );
    
    this.on( 'ns.log.after', function( data ) {
    
        var mbox = data.item;
        
        if( !data.event.hasOwnProperty( 'user' )
            || data.event.user.toLowerCase() == ui.lusername )
            return;
        
        if( data.event.name == 'recv_msg' ||
            data.event.name == 'recv_action' ) {
            if( data.event.message.toLowerCase().indexOf( ui.lusername ) != -1 ) {
                mbox.addClass('highlight');
                try {
                    ui.book.channel( data.event.ns ).highlight();
                } catch(err) {}
            }
        }
        
        var user = data.event.user;
        var control = ui.control;
        
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
    
    } );
    
    this.ext.default = tadpole.Commands( this.client, this );

};


/**
 * Resize the interface!
 * @method resize
 */
tadpole.UI.prototype.resize = function(  ) {
    this.menu.resize();
    this.control.resize();
    this.book.resize();
};


/**
 * Do stuff in a loop.
 * @method loop
 */
tadpole.UI.prototype.loop = function(  ) {
};

/**
 * Toggle the menu visibility.
 * @method toggle_menu
 */
tadpole.UI.prototype.toggle_menu = function(  ) {

    return this.menu.toggle();

};

/**
 * Add a channel to the UI.
 * @method channel_add
 */
tadpole.UI.prototype.channel_add = function( ns, raw, hidden ) {

    var selector = 'c-' + replaceAll(raw, ':', '-');
    
    var components = {
        tab: this.menu.channel.add( ns, raw, hidden ),
        head: this.menu.heads.add( selector, hidden ),
        users: this.menu.users.add( selector, hidden )
    };
    
    return this.book.add( ns, raw, hidden, components );

};

/**
 * Register some middleware with the thing.
 * @method middle
 * @param event {String} Event to insert middleware for.
 * @param callback {Function} Middleware callback.
 */
tadpole.UI.prototype.middle = function( event, callback ) {

    this.mw.add( event, callback );

};

/**
 * Run a method with middleware.
 * @method cascade
 * @param event {String} Event to run middleware for.
 * @param callback {Function} Eventual callback to run.
 * @param data {Object} Input data for the callback.
 */
tadpole.UI.prototype.cascade = function( event, callback, data ) {

    this.mw.run( event, callback, data );

};

/**
 * Bind an event listener.
 * @method on
 * @param event {String} Event to listen for.
 * @param callback {Function} Event handler.
 */
tadpole.UI.prototype.on = function( event, callback ) {

    this.evt.addListener( event, callback );

};

/**
 * Fire an event.
 * @method emit
 * @param event {String} Event to fire.
 * @param data {Object} Event data.
 */
tadpole.UI.prototype.emit = function( event, data ) {

    this.evt.emit( event, data, this );

};

/**
 * Handle a packet being received.
 * @method packet
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
tadpole.UI.prototype.packet = function( event, client ) {

    var ui = this;
    var msg = this.protocol.log( event );
    
    if( msg ) {
        
        //if( this.options.developer ) {
        //    console.log( '>>>', event.sns, '|', msg.text() );
        //}
        
        if( event.name == 'log' && event.sns == '~current' ) {
            event.ns = ui.book.current.raw;
            event.sns = ui.book.current.ns;
        }
        
        // If the event is -shownotice, don't display it!
        if( event.hasOwnProperty( 's' ) && event.s == '0' ) {
            this.book.handle( event, client );
            return;
        }
        
        if( event.hasOwnProperty('user')
            && client.ext.defaults.ignore.ignored.indexOf(
                event.user.toLowerCase() ) != -1 ) {
                    this.book.handle(event, client);
                    return;
        }
        
        event.html = msg.html();
        
        this.cascade(
            'log_message',
            function( data, done ) {
                //try{
                    ui.book.log_message( data.message, data.event );
                //} catch(err) {console.log(err);}
            }, {
                message: msg,
                event: event
            }
        );
    
    }
    
    this.book.handle( event, client );

};

/**
 * Send a log message to the monitor channel.
 * @method log
 */
tadpole.UI.prototype.log = function( data ) {

    return this.monitor.log( data );

};

