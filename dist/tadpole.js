
/**
 * Tadpole UI lib.
 */
var tadpole = {};

tadpole.VERSION = '0.0.2';
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

;

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

;

/**
 * Channel object.
 * Manage a channel view.
 * @class tadpole.Channel
 * @contructor
 */
tadpole.Channel = function( ns, raw, tab, ui, book ) {

    this.manager = ui;
    this.book = book;
    this.tab = tab;
    this.ns = ns;
    this.raw = raw;
    this.selector = replaceAll(this.raw, 'pchat:', 'c-pchat-');
    this.selector = replaceAll(this.selector, 'chat:', 'c-chat-');
    this.hidden = true;
    this.background = false;
    this.build();

};


/**
 * Place the channel on the screen.
 * @method build
 */
tadpole.Channel.prototype.build = function(  ) {

    this.book.view.append('<div class="channel" id="'+this.selector+'"><ul class="log"></ul></div>');
    this.view = this.book.view.find('div.channel#'+this.selector);
    this.logview = this.view.find('ul.log');

};


/**
 * Reveal the channel.
 * @method reveal
 */
tadpole.Channel.prototype.reveal = function(  ) {

    if( !this.hidden )
        return;
    
    if( this.background )
        return;
    
    this.view.css({'display': 'block'});
    this.hidden = false;
    this.manager.top.set_label(this.ns);

};


/**
 * Hide the channel.
 * @method hide
 */
tadpole.Channel.prototype.hide = function(  ) {

    if( this.hidden )
        return;
    
    this.view.css({'display': 'none'});
    this.hidden = true;

};


/**
 * Display a log message.
 * @method log
 * @param content {String} Message to display.
 */
tadpole.Channel.prototype.log = function( content ) {

    var date = new Date();
    var ts = formatTime('{HH}:{mm}:{ss}', date);
    var ms = date.getTime();
    
    this.logview.append(
        '<li id="'+ms+'"><span class="timestamp">'+ts+
        '</span><span class="content">'+content+'</span></li>'
    );
    
    return this.logview.find('li#'+ms);

};


/**
 * Someone joined the channel.
 * @method join
 * @param user {String} Person joining
 */
tadpole.Channel.prototype.join = function( user ) {

    this.log('<p class="background"><strong class="event join">** '+user+' joined *</strong></p>');

};


/**
 * Someone left the channel.
 * @method part
 * @param user {String} Person joining
 * @param [reason=''] {String} Reason for leaving
 */
tadpole.Channel.prototype.part = function( user, reason ) {

    this.log('<p class="background"><strong class="event part">** '+user+' left *</strong> '+ reason +'</p>');

};


/**
 * Display a chat message.
 * @method message
 * @param user {String} Username of the person who sent the message
 * @param message {String} Message to display
 */
tadpole.Channel.prototype.message = function( user, message ) {

    var mb = this.log('<h2 class="username">'+user+'</h2><p>'+message+'</p>');
    console.log(mb);

};


/**
 * Display a chat action message.
 * @method action
 * @param user {String} Username of the person who sent the message
 * @param message {String} Message to display
 */
tadpole.Channel.prototype.action = function( user, message ) {

    this.log('<p><em><strong class="username">* '+user+'</strong> '+message+'</em></p>');

};


/**
 * Someone got kicked from the channel.
 * @method kick
 * @param user {String} Person kicked
 * @param by {String} Person who kicked
 * @param [reason=''] {String} Reason for the kick
 */
tadpole.Channel.prototype.kick = function( user, by, reason ) {

    this.log('<p><em><strong class="event kick">** '+user+' kicked by '+by+' *</strong> '+reason+'</em></p>');

};

;
/**
 * Channel list for the fucking thingy.
 * @class tadpole.ChannelMenu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.ChannelMenu = function( ui, parentview ) {

    this.manager = ui;
    this.parentview = parentview;
    this.build();

};


/**
 * Place the channel list on the page.
 * @method build
 */
tadpole.ChannelMenu.prototype.build = function(  ) {

    // Create the main menu.
    this.overlay = new tadpole.Overlay( this.manager.view, 'channelmenu', 'right' );
    this.overlay.view.append('<nav class="channels">'
        +'<ul>'
        +'  <li><span class="button" id="channelexit">&laquo; Channels</span></li>'
        +'</ul></nav>');
    
    this.view = this.overlay.view.find('nav');
    this.ul = this.view.find('ul');
    this.button_back = this.ul.find('span#channelexit');
    
    var cmenu = this;
    
    this.button_back.on( 'click', function( event ) {
    
        event.preventDefault();
        cmenu.hide();
    
    } );

};

/**
 * Reveal the menu.
 * @method reveal
 */
tadpole.ChannelMenu.prototype.reveal = function(  ) {

    this.overlay.reveal();
    return this.overlay.visible;

};

/**
 * Hide the menu.
 * @method hide
 */
tadpole.ChannelMenu.prototype.hide = function(  ) {

    this.overlay.hide();
    return this.overlay.visible;

};

/**
 * Add a channel to the menu.
 * @method add
 */
tadpole.ChannelMenu.prototype.add = function( ns, raw ) {

    var selector = replaceAll(raw, 'pchat:', 'c-pchat-');
    selector = replaceAll(selector, 'chat:', 'c-chat-');
    
    this.ul.append( '<li><a id="tab-' + selector + '" href="#">' + ns + '</a></li>');
    
    var cmenu = this;
    var tab = this.ul.find('a#tab-' + selector);
    
    tab.on( 'click', function( event ) {
    
        event.preventDefault();
        cmenu.manager.book.reveal(ns);
        cmenu.manager.menu.toggle();
        //cmenu.hide();
    
    } );
    
    return tab;

};;

/**
 * Control bar.
 * Just an input box really.
 * @class tadpole.Control
 * @contructor
 */
tadpole.Control = function( ui ) {

    this.manager = ui;
    this.build();

};


/**
 * Place the control box on the screen.
 * @method build
 */
tadpole.Control.prototype.build = function(  ) {

    this.manager.view.append('<div class="control"><input type="text" class="msg"></input></div>');
    this.view = this.manager.view.find('div.control');
    this.input = this.view.find('input');
    this.input.width(this.view.width() - 20);

};

;
/**
 * Menu for the fucking thingy.
 * @class tadpole.Menu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.Menu = function( ui ) {

    this.manager = ui;
    this.build();

};


/**
 * Place the menu on the page.
 * @method build
 */
tadpole.Menu.prototype.build = function(  ) {

    // Create the main menu.
    this.overlay = new tadpole.Overlay( this.manager.view, 'menu' );
    this.overlay.view.append('<nav class="menu">'
        +'<ul>'
        +'  <li><a class="users" href="#">Users</a></li>'
        +'  <li><a class="channels" href="#">Channels</a></li>'
        +'  <li><a class="settings" href="#">Settings</a></li>'
        +'</ul></nav>');
    
    this.view = this.overlay.view.find('nav');
    this.button_users = this.view.find('.users');
    this.button_channels = this.view.find('.channels');
    this.button_settings = this.view.find('.settings');
    
    // Handle events.
    var menu = this;
    
    this.button_users.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_users();
    
    } );
    
    this.button_channels.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_channels();
    
    } );
    
    this.button_settings.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_settings();
    
    } );
    
    // Create sub-menus.
    this.channel = new tadpole.ChannelMenu( this.manager, this.overlay.view );
    //this.users = new tadpole.UsersOverlay( this.manager );
    //this.settings = new tadpole.SettingsOverlay( this.manager );

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.Menu.prototype.toggle = function(  ) {

    if( this.overlay.visible ) {
        this.channel.hide();
        this.overlay.hide();
        this.manager.top.inactive();
        return this.overlay.visible;
    }
    
    this.overlay.reveal();
    this.manager.top.active();
    return this.overlay.visible;

};

tadpole.Menu.prototype.hide_quick = function(  ) {

    this.manager.top.inactive();
    this.overlay.hide_quick();

};

/**
 * Show the users.
 * @method show_users
 */
tadpole.Menu.prototype.show_users = function(  ) {};

/**
 * Show the channels.
 * @method show_channels
 */
tadpole.Menu.prototype.show_channels = function(  ) {

    this.channel.reveal();

};

/**
 * Show the settings.
 * @method show_settings
 */
tadpole.Menu.prototype.show_settings = function(  ) {};


;/**
 * GUI overlay for the menu.
 * @class tadpole.Overlay
 * @constructor
 */
tadpole.Overlay = function( parentview, cls, origin ) {

    this.parentview = parentview;
    this.cls = cls;
    this.origin = origin || 'top';
    this.visible = false;
    this.build();

};

/**
 * Build the overlay.
 * @method build
 */
tadpole.Overlay.prototype.build = function(  ) {

    this.parentview.append('<div class="overlay ' + this.cls + '"></div>');
    this.view = this.parentview.find('.overlay.' + this.cls);
    
    var clh = $('body').height();
    this.view.height( clh - 95 );

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

;
/**
 * Top bar for the fucking thingy.
 * @class tadpole.Top
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.Top = function( ui ) {

    this.manager = ui;
    this.build();

};


/**
 * Place the top bar on the page.
 * @method build
 */
tadpole.Top.prototype.build = function(  ) {

    this.manager.view.append('<div class="top"><span class="label">Tadpole</span><span class="control"><a class="menubutton" href="#">+</a></span></div>');
    this.view = this.manager.view.find('.top');
    this.button = this.view.find('.menubutton');
    this.label = this.view.find('span.label');

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


