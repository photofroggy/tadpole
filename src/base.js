
/**
 * Tadpole UI lib.
 */
var tadpole = {};

tadpole.VERSION = '0.0.1';
tadpole.STATE = 'alpha';


// jQuery hook.

( function( $ ) {
    $.fn.tadpole = function( method, client, options ) {
        
        var ui = $(window).data('tadpole');
        
        if( method == 'init' || ui === undefined ) {
            if( ui == undefined ) {
                ui = new tadpole.UI( $(this), client, options, ($.browser.mozilla || false) );
                $(window).resize(function() { ui.resize(); });
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
    this.options = options;
    this.mozilla = mozilla;
    
    client.settings.agent = 'tadpole/' + tadpole.VERSION + ' ' + client.settings.agent;
    
    this.LIB = 'tadpole';
    this.VERSION = tadpole.VERSION;
    this.STATE = tadpole.STATE;
    
    view.append('<div class="tadpole"></div>');
    this.view = view.find('.tadpole');
    
    this.control = null;
    this.top = null;
    this.menu = null;
    this.book = null;

};


/**
 * Build the interface!
 * @method build
 */
tadpole.UI.prototype.build = function(  ) {

    this.top = new tadpole.Top( this );
    this.book = new tadpole.Book( this );
    this.control = new tadpole.Control( this );
    this.menu = new tadpole.Menu( this );
    
    // Create a monitor channel for debugging?
    // Shouldn't really need this sort of thing.
    // Although debugging on mobile is somewhat tricky.

};


/**
 * Resize the interface!
 * @method resize
 */
tadpole.UI.prototype.resize = function(  ) {
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
tadpole.UI.prototype.channel_add = function( ns, raw ) {

    var tab = this.menu.channel.add( ns, raw );
    return this.book.add( ns, raw, tab );

};

