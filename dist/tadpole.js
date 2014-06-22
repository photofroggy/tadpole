
/**
 * Tadpole UI lib.
 */
var tadpole = {};

tadpole.VERSION = '0.11.26';
tadpole.STATE = 'beta';


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
        'monitor': ['~Monitor', true]
    }, options || {});
    
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
    this.monitor = null;
    this.lusername = this.client.settings.username.toLowerCase();
    
    this.protocol = new tadpole.Protocol();
    
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
        
        event.html = msg.html();
        
        /*this.cascade(
            'log_message',
            function( data, done ) {*/
                try{ui.book.log_message( msg, event );}
                catch(err) {console.log(err);}
            /*}, {
                message: msg,
                event: event
            }
        );*/
    
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

    this.manager.view.append('<div class="top"><span class="label">Tadpole</span><span class="control"><a class="menubutton icon-menu" href="#"></a></span></div>');
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


;/**
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
    this.view.height( clh - 72 );

};

/**
 * Resize the overlay.
 * @method resize
 */
tadpole.Overlay.prototype.resize = function(  ) {

    var clh = $(window).height();
    this.view.height( clh - 72 );

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

;
/**
 * Menu thing.
 * @class tadpole.Menu
 * @constructor
 */
tadpole.Menu = function( ui, parent, cls ) {

    this.manager = ui;
    this.parent = parent;
    this.overlay = null;
    this.buttons = [];
    this.cls = cls || '';
    this.build();

};

/**
 * Build the menu.
 * @method build
 */
tadpole.Menu.prototype.build = function(  ) {

    var cls = 'menu' + ( this.cls ? ' ' + this.cls : '' );
    this.overlay = new tadpole.Overlay( this.parent, cls );
    this.overlay.view.append( '<nav class="' + cls + '"><ul></ul></nav>');
    this.view = this.overlay.view.find('nav');
    this.ul = this.view.find('ul');

};

/**
 * Add a button to the menu.
 * @method add
 * @param cls {String} Class for the button.
 * @param id {String} ID for the button.
 * @param label {String} Label for the button.
 * @param callback {Function} Method to call when the button is clicked.
 * @param icon {String} Name of the icon to use for the button.
 */
tadpole.Menu.prototype.add = function( cls, id, label, callback, icon, hidden ) {

    var button = new tadpole.MenuButton( this.ul, cls, id, label, callback, icon, hidden );
    this.buttons.push(button);
    return button;

};


/**
 * Add a nested menu.
 * @method add_nested
 */
tadpole.Menu.prototype.add_nested = function( cls, id, label, callback, icon, hidden ) {

    var menu = new tadpole.NestedMenu( this.manager, this.ul, cls, id, label, callback, icon, hidden );
    this.buttons.push(menu);
    return menu;

};


/**
 * Resize the menu.
 * @method resize
 */
tadpole.Menu.prototype.resize = function(  ) {

    this.overlay.resize();

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.Menu.prototype.toggle = function(  ) {

    this.resize();
    
    if( this.overlay.visible ) {
        this.overlay.hide();
        return this.overlay.visible;
    }
    
    this.overlay.reveal();
    return this.overlay.visible;

};

tadpole.Menu.prototype.reveal = function(  ) {

    return this.overlay.reveal();

};

tadpole.Menu.prototype.hide = function(  ) {

    return this.overlay.hide();

};

tadpole.Menu.prototype.hide_quick = function(  ) {

    this.overlay.hide_quick();

};


/**
 * Nested menu.
 * @class tadpole.NestedMenu
 * @constructor
 */
tadpole.NestedMenu = function( ui, parent, cls, id, label, callback, icon, hidden ) {

    this.manager = ui;
    this.parent = parent;
    this.buttons = [];
    this.label = label;
    this.callback = callback;
    this.cls = cls;
    this.id = id || '';
    this.icon = icon || '';
    this.hidden = hidden || false;
    this.button = null;
    this.view = null;
    this.ul = null;
    this.visible = true;
    this.build();

};

/**
 * Build the nested menu.
 * @method build
 */
tadpole.NestedMenu.prototype.build = function(  ) {

    var icon = '';
    var id = '';
    var selector = '.button.' + replaceAll(this.cls, ' ', '.');
    
    if( this.icon )
        icon = '<span class="icon-' + this.icon + '"></span>';
    
    if( this.id ) {
        selector = selector + '#' + this.id;
        id = 'id="' + this.id + '" ';
    }
    
    this.parent.append('<li' + ( this.hidden ? ' class="hidden"': '' ) + '>'
        +'<a class="button ' + this.cls + '" '+id+'href="#">'
        +icon+this.label
        +'</a><ul></ul></li>');
    
    this.button = this.parent.find(selector);
    this.view = this.button.parent();
    this.ul = this.view.find('ul');
    
    var cb = this.callback;
    
    this.button.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        cb( event );
    
    } );
    
    this.button.css({'width': this.parent.parent().parent().width() - 30});

};

/**
 * Add a button to the menu.
 * @method add
 * @param cls {String} Class for the button.
 * @param id {String} ID for the button.
 * @param label {String} Label for the button.
 * @param callback {Function} Method to call when the button is clicked.
 * @param icon {String} Name of the icon to use for the button.
 */
tadpole.NestedMenu.prototype.add = function( cls, id, label, callback, icon, hidden ) {

    var button = new tadpole.MenuButton( this.ul, cls, id, label, callback, icon, hidden, 30 );
    this.buttons.push(button);
    return button;

};


/**
 * Button in a menu.
 * @class tadpole.MenuButton
 * @constructor
 */
tadpole.MenuButton = function( parent, cls, id, label, callback, icon, hidden, pad ) {

    this.parent = parent;
    this.label = label;
    this.callback = callback;
    this.cls = cls;
    this.id = id || '';
    this.icon = icon || '';
    this.hidden = hidden || false;
    this.pad = pad || 0;
    this.button = null;
    this.view = null;
    this.visible = true;
    this.build();

};


/**
 * Build the button.
 * @method build
 */
tadpole.MenuButton.prototype.build = function(  ) {

    var id = '';
    var icon = '<span class="icon-' + ( this.icon ? this.icon : 'null' )
        + '"></span>';
    var selector = '.button.' + replaceAll(this.cls, ' ', '.');
    
    if( this.id ) {
        selector = selector + '#' + this.id;
        id = 'id="' + this.id + '" ';
    }
    
    this.parent.append('<li' + ( this.hidden ? ' class="hidden"': '' ) + '>'
        +'<a class="button ' + this.cls + '" '+id+'href="#">'
        +icon+this.label
        +'</a></li>');
    
    this.button = this.parent.find(selector);
    this.view = this.button.parent();
    
    var cb = this.callback;
    
    this.button.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        cb( event );
    
    } );
    /*
    var parent = this.parent.parent().parent();
    
    if( this.pad != 0 )
        parent = parent.parent().parent();
    
    this.button.css({'width': parent.width() - (30 + this.pad)});*/

};

/**
 * Remove this shit yo.
 * @method remove
 */
tadpole.MenuButton.prototype.remove = function(  ) {

    this.view.remove();

};


/**
 * Menu for the fucking thingy.
 * @class tadpole.Menu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.MainMenu = function( ui ) {

    this.manager = ui;
    this.menu = null;
    this.users = null;
    this.heads = null;
    this.build();

};


/**
 * Place the menu on the page.
 * @method build
 */
tadpole.MainMenu.prototype.build = function(  ) {

    // Create the main menu.
    var menu = this;
    this.menu = new tadpole.Menu( this.manager, this.manager.view, 'main' );
    
    this.button_head = this.menu.add( 'head', '', 'Title/Topic', function( event ) {
    
        menu.show_head();
    
    }, 'doc' );
    
    this.button_users = this.menu.add( 'users', '', 'Users', function( event ) {
    
        menu.show_users();
    
    }, 'user' );
    
    this.button_channels = this.menu.add( 'channels', '', 'Channels', function( event ) {
    
        menu.show_channels();
    
    }, 'comment' );
    
    this.commands = this.menu.add_nested( 'commands', '', 'Commands', function( event ) {}, 'plus' );
    
    this.button_settings = this.menu.add( 'settings', '', 'Settings', function( event ) {
    
        menu.show_settings();
    
    }, 'cog' );
    
    this.button_about = this.menu.add( 'about', '', 'About', function( event ) {
    
        menu.show_about();
    
    }, 'info-alt' );
    
    // Create sub-menus.
    this.channel = new tadpole.ChannelMenu( this.manager, this.manager.view );
    this.heads = new tadpole.HeadArray( this.manager, this, this.manager.view, 'head', 'h' );
    this.users = new tadpole.UsersArray( this.manager, this, this.manager.view, 'userlist', 'u' );
    this.commanditems = new tadpole.MenuItemArray( this.manager, this, this.manager.view, 'command', 'mcom' );
    this.settings = new tadpole.SettingsMenu( this.manager, this.manager.view );
    this.about = new tadpole.Overlay( this.manager.view, 'about' );
    
    // Build the about page.
    this.about.view.append(
        '<nav><ul><li>'
        +'  <a href="#" class="button"><span class="icon-left-open"></span>About</a>'
        +'</li></nav>'
        +'<div class="section border">'
        +'  <p>Currently using wsc ' + wsc.VERSION + ' and'
        +'  tadpole ' + this.manager.VERSION + '. Tadpole is a mobile GUI for'
        +'  wsc.</p><p>Tadpole and wsc work using HTML, CSS, and javascript.'
        +'  </p><p>Created by'
        +'  <a href="http://photofroggy.deviantart.com">photofroggy</a>.</p>'
        +'</div>'
        +'<div class="section">'
        +'  <p><strong>Chat Agent:</strong></p>'
        +'  <p><code>' + this.manager.client.settings.agent
        +'      </code></p>'
        +'  <p><strong>User Agent:</strong></p>'
        +'  <p><code>' + navigator.userAgent + '</code></p>'
        +'</div>'
    );
    
    var about = this.about;
    
    this.button_about = this.about.view.find('a.button');
    this.button_about.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        about.hide();
    
    } );

};

/**
 * Resize the menu.
 * @method resize
 */
tadpole.MainMenu.prototype.resize = function(  ) {

    this.menu.resize();
    this.channel.resize();
    this.heads.resize();
    this.users.resize();
    this.commanditems.resize();
    this.settings.resize();

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.MainMenu.prototype.toggle = function(  ) {

    this.resize();
    
    if( this.menu.overlay.visible ) {
        this.channel.hide();
        this.heads.hide();
        this.users.hide();
        this.menu.hide();
        this.commanditems.hide();
        this.settings.hide();
        this.about.hide();
        this.manager.top.inactive();
        return this.menu.overlay.visible;
    }
    
    this.menu.reveal();
    this.manager.top.active();
    return this.menu.overlay.visible;

};

tadpole.MainMenu.prototype.hide_quick = function(  ) {

    this.manager.top.inactive();
    this.menu.hide_quick();

};

/**
 * Show the head.
 * @method show_head
 */
tadpole.MainMenu.prototype.show_head = function(  ) {

    this.heads.reveal(this.manager.book.current.selector);

};

/**
 * Show the users.
 * @method show_users
 */
tadpole.MainMenu.prototype.show_users = function( onselect ) {

    this.users.reveal(this.manager.book.current.selector, onselect);

};

/**
 * Show the channels.
 * @method show_channels
 */
tadpole.MainMenu.prototype.show_channels = function(  ) {

    this.channel.reveal();

};

/**
 * Show the settings.
 * @method show_settings
 */
tadpole.MainMenu.prototype.show_settings = function(  ) {

    this.settings.reveal();

};

/**
 * Show the about page.
 * @method show_about
 */
tadpole.MainMenu.prototype.show_about = function(  ) {

    this.about.reveal();

};


/**
 * Menu item.
 * @class tadpole.MenuItem
 * @constructor
 */
tadpole.MenuItem = function( manager, menu, id, overlay, hidden ) {

    this.manager = manager;
    this.menu = menu;
    this.id = id;
    this.overlay = overlay || null;
    this.hidden = hidden || false;
    this.build();

};

/**
 * Build the menu item, if need be.
 * @method build
 */
tadpole.MenuItem.prototype.build = function(  ) {};

/**
 * Do something when the item is resized.
 * @method resize
 */
tadpole.MenuItem.prototype.resize = function(  ) {};

/**
 * Do something when the item is revealed.
 * @method reveal
 */
tadpole.MenuItem.prototype.reveal = function(  ) {};

/**
 * Do something when the item is hidden.
 * @method hide
 */
tadpole.MenuItem.prototype.hide = function(  ) {};

/**
 * Do something when the item is removed.
 * @method remove
 */
tadpole.MenuItem.prototype.remove = function(  ) {};


/**
 * Array of items accessible from the menu based on currently open
 * channel.
 * @class tadpole.MenuItemArray
 * @constructor
 */
tadpole.MenuItemArray = function( ui, menu, parentview, cls, id, origin ) {

    this.manager = ui;
    this.menu = menu;
    this.parentview = parentview;
    this.cls = cls;
    this.id = id;
    this.origin = origin || 'top';
    this.items = {};
    
    this.overlays = this.create_overlay_array();

};

/**
 * Create a new MenuItem.
 * @method create_item
 */
tadpole.MenuItemArray.prototype.create_item = function( id, overlay, hidden ) {

    return new tadpole.MenuItem( this.manager, this.menu, id, overlay, hidden );

};

/**
 * Create an overlay array.
 * @method create_overlay_array
 */
tadpole.MenuItemArray.prototype.create_overlay_array = function(  ) {

    return new tadpole.OverlayArray( this.parentview, this.cls, this.id, this.origin );

};

/**
 * Add an item to the array.
 * @method add
 */
tadpole.MenuItemArray.prototype.add = function( id, hidden ) {

    this.remove( id );
    var ol = this.overlays.add(id);
    var item = this.create_item( id, ol, hidden );
    this.items[id.toLowerCase()] = item;
    return item;

};

/**
 * Get an item.
 * @method item
 */
tadpole.MenuItemArray.prototype.item = function( id ) {

    try {
        return this.items[id.toLowerCase()];
    } catch( err ) {}
    
    return null;

};

/**
 * Iterate through the items.
 * @method each
 */
tadpole.MenuItemArray.prototype.each = function( callback ) {

    for( var id in this.items ) {
        if( !this.items.hasOwnProperty(id) )
            continue;
        callback(id, this.items[id]);
    }

};

/**
 * Resize all of the items.
 * @method resize
 */
tadpole.MenuItemArray.prototype.resize = function(  ) {

    this.each(
        function( id, item ) {
            item.overlay.resize();
            item.resize();
        }
    );

};

/**
 * Reveal a menu item.
 * @method reveal
 */
tadpole.MenuItemArray.prototype.reveal = function( id ) {

    var item = this.item( id );
    
    if( !item )
        return;
    
    item.overlay.reveal();
    item.reveal();

};

/**
 * Hide items.
 * @method hide
 */
tadpole.MenuItemArray.prototype.hide = function(  ) {

    this.each(
        function( id, item ) {
            item.overlay.hide();
            item.hide();
        }
    );

};

/**
 * Hide items quickly.
 * @method hide_quick
 */
tadpole.MenuItemArray.prototype.hide_quick = function(  ) {

    this.each(
        function( id, item ) {
            item.overlay.hide_quick();
            item.hide();
        }
    );

};

/**
 * Remove an item.
 * @method remove
 */
tadpole.MenuItemArray.prototype.remove = function( id ) {

    var item = this.item( id );
    
    if( !item )
        return;
    
    this.overlays.remove(id);
    item.remove();
    delete this.items[id.toLowerCase()];

};

/**
 * Remove all items.
 * @method remove_all
 */
tadpole.MenuItemArray.prototype.remove_all = function(  ) {

    var arr = this;
    
    this.each(
        function( id, item ) {
            arr.overlays.remove(id);
            item.remove();
            delete arr.items[id];
        }
    );

};


;
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
        +'<div class="section border title"></div><div class="section topic"></div>'
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
;
/**
 * Channel Userser.
 * @class tadpole.Users
 * @constructor
 */
tadpole.Users = function( manager, menu, id, overlay ) {
    this.onselect = null;
    tadpole.MenuItem.call(this, manager, menu, id, overlay);
};
tadpole.Users.prototype = new tadpole.MenuItem;
tadpole.Users.prototype.constructor = tadpole.MenuItem;

/**
 * Build the channel Users display within the overlay.
 * @method build
 */
tadpole.Users.prototype.build = function(  ) {

    this.users = {};
    
    this.overlay.view.append(
        '<nav><ul><li>'
        +'  <span class="button" id="usersexit"><span class="icon-left-open"></span>Users</span>'
        +'</li></ul></nav>'
        +'<div class="list"><nav><ul></ul></nav></div>'
    );
    
    this.view = this.overlay.view.find('div.list');
    this.ul = this.view.find('nav ul');
    this.button_exit = this.overlay.view.find('nav ul li span.button#usersexit');
    
    var users = this;
    
    this.button_exit.on( 'click', function( event ) {
    
        event.preventDefault();
        users.overlay.hide();
        users.hide();
    
    } );

};

/**
 * When revealing the user list, store an onselect callback.
 * @method reveal
 */
tadpole.Users.prototype.reveal = function( onselect ) {

    this.onselect = onselect || null;

};

/**
 * Reveal or hide the userlist depending on the number of users present.
 * 
 * @method reveal_pcs
 */
tadpole.Users.prototype.reveal_pcs = function(  ) {

    var total = 0;
    var count = 0;
    var pc = null;
    var ulist = this;
    
    this.ul.find('.pc').each( function( i, el ) {
        pc = ulist.ul.find(this);
        count = pc.find('ul li').length;
        total+= count;
        pc.css('display', ( count == 0 ? 'none' : 'block' ));
    } );
    
    this.ul.css('display', ( total == 0 ? 'none' : 'block' ));

};

/**
 * Build the user list.
 * 
 * @method set_pcs
 * @param names {Object} Privilege class names
 * @param order {Array} Privilege class orders
 */
tadpole.Users.prototype.set_pcs = function( names, order ) {
    
    var pc = '';
    var pcel = null;
    
    this.ul.html('');
    
    for(var index in order) {
        pc = names[order[index]];
        
        this.ul.append(
            '<li class="pc" id="' + replaceAll( pc, ' ', '-' ) + '">'
            +'  <span class="button"><span class="icon-user"></span>' + pc + '</span>'
            +'  <ul></ul>'
            +'</li>'
        );
        
        pcel = this.ul.find('li.pc#' + pc);
        pcel.css('display', 'none');
        
        this.users[pc] = {
            'pc': pcel,
            'users': pcel.find('ul')
        };
    }

};

/**
 * Set a user in the user list.
 * @method set
 */
tadpole.Users.prototype.set = function( user, noreveal ) {

    var pc = this.users[user.pc];
    
    var conn = user.conn == 1 ? '' : '[' + user.conn + ']';
    var html = '<li class="user" id="' + user.name + '">'
        +'<a target="_blank" href="http://' + user.name + '.' + this.manager.options['domain'] + '"><em>'
        + user.symbol + '</em>'
        + user.name + conn + '</a></li>';
    
    pc.users.append(html);
    
    var el = pc.users.find('li.user#' + user.name);
    var control = this.manager.control;
    var ul = this;
    
    el.find('a').on( 'click', function( event ) {
    
        event.preventDefault();
        
        ( ul.onselect || function( list, user ) {
            var text = control.get_text();
            
            if( text.length > 0 ) {
                control.set_text(
                    text
                    + ( text[text.length - 1] == ' ' ? '' : ' ' ) 
                    + user.name
                );
                return;
            }
            
            control.set_text(user.name + ': ');
        } )( ul, user );
    
    } );
    
    if( noreveal )
        return;
    
    this.reveal_pcs();

};

/**
 * Set the list of users.
 * @method set_users
 */
tadpole.Users.prototype.set_users = function( users ) {

    for( var i in users ) {
        this.remove_user( users[i].name, true );
        this.set(users[i], true);
    }
    
    this.reveal_pcs();

};

/**
 * Remove a user from the list.
 * @method remove_user
 */
tadpole.Users.prototype.remove_user = function( user, noreveal ) {

    var entry = this.ul.find('li.user#' + user);
    
    if( entry )
        entry.remove();
    
    if( noreveal )
        return;
    
    this.reveal_pcs();

};

/**
 * Handle the register user event.
 * 
 * @method register
 * @param user {String} Name of the user to register
 */
tadpole.Users.prototype.register = function( user, noreveal ) {

    this.remove_user( user, true );
    var member = this.manager.client.channel(
        this.id.split('-').slice(1).join(':')).info.members[user];
    
    if( !member ) {
        if( noreveal )
            return;
        this.reveal_pcs();
        return;
    }
    
    this.set(member, noreveal || false);

};


/**
 * Array of channel Usersers.
 * @class tadpole.UsersArray
 * @constructor
 */
tadpole.UsersArray = function( ui, menu, parentview, cls, id, origin ) {
    tadpole.MenuItemArray.call(this, ui, menu, parentview, cls, id, origin );
};
tadpole.UsersArray.prototype = new tadpole.MenuItemArray;
tadpole.UsersArray.prototype.constructor = tadpole.UsersArray;

tadpole.UsersArray.prototype.create_item = function( id, overlay ) {

    return new tadpole.Users( this.manager, this.menu, id, overlay );

};

/**
 * Reveal a user list.
 * @method reveal
 */
tadpole.UsersArray.prototype.reveal = function( id, onselect ) {

    var item = this.item( id );
    
    if( !item )
        return;
    
    item.overlay.reveal();
    item.reveal(onselect);

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
    this.menu = null;
    this.build();

};


/**
 * Place the channel list on the page.
 * @method build
 */
tadpole.ChannelMenu.prototype.build = function(  ) {

    // Create the channel menu.
    this.menu = new tadpole.Menu(this.manager, this.parentview, 'channels');
    
    var menu = this;
    
    this.menu.add( 'back', 'exit', 'Channels', function( event ) {
    
        menu.hide();
    
    }, 'left-open' );

};

/**
 * Resize the channel menu.
 * @method resize
 */
tadpole.ChannelMenu.prototype.resize = function(  ) {

    this.menu.resize();

};

/**
 * Reveal the menu.
 * @method reveal
 */
tadpole.ChannelMenu.prototype.reveal = function(  ) {

    return this.menu.reveal();

};

/**
 * Hide the menu.
 * @method hide
 */
tadpole.ChannelMenu.prototype.hide = function(  ) {

    return this.menu.hide();

};

/**
 * Add a channel to the menu.
 * @method add
 */
tadpole.ChannelMenu.prototype.add = function( ns, raw, hidden ) {
    
    var menu = this;
    
    var tab = this.menu.add(
        'tab',
        'tab-c-' + replaceAll(raw, ':', '-'),
        ns, function( event ) {
            menu.manager.book.reveal(raw);
            menu.manager.menu.toggle();
        }, '', hidden
    );
    
    if( ns[0] == '~' )
        return tab;
    
    tab.button.append('<span class="button right red close icon-cancel"></span>');
    var close = tab.view.find('.button.close');
    
    close.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        menu.manager.client.part(raw);
    
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

    this.manager.view.append('<div class="control"><form><input type="text" class="msg"></input></form></div>');
    this.view = this.manager.view.find('div.control');
    this.form = this.view.find('form');
    this.input = this.view.find('input');
    this.input.width(this.view.width() - 20);
    
    var ctrl = this;
    
    this.input.keydown( function( event ) { return ctrl.keypress( event ); } );
    this.form.submit( function( event ) { return ctrl.submit( event ); } );

};

/**
 * Resize the channel book.
 * @method resize
 */
tadpole.Control.prototype.resize = function(  ) {

    var clh = this.view.width();
    this.input.width( clh - 20 );

};

/**
 * Get the text in the input box.
 * 
 * @method get_text
 * @return {String} The text currently in the input box.
 */
tadpole.Control.prototype.get_text = function( text ) {

    if( text == undefined )
        return this.input.val();
    this.input.val( text || '' );
    return this.input.val();

};

/**
 * Set the text in the input box.
 * 
 * @method set_text
 * @param text {String} The text to put in the input box.
 */
tadpole.Control.prototype.set_text = function( text ) {

    this.input.val( text || '' );

};

/**
 * Handle the send button being pressed.
 * 
 * @method submit
 * @param event {Object} Event data.
 */
tadpole.Control.prototype.submit = function( event ) {

    var msg = this.get_text();
    //this.append_history(msg);
    this.set_text('');
    this.handle(event, msg);
    return false;

};
/**
 * Processes a key being typed in the input area.
 * 
 * @method keypress
 * @param event {Object} Event data.
 */
tadpole.Control.prototype.keypress = function( event ) {

    var key = event.which || event.keyCode;
    //var ut = this.tab.hit;
    var bubble = false;
    
    switch( key ) {
        case 13: // Enter
            /*if( !this.multiline() ) {
                this.submit(event);
            } else {*/
                if( event.shiftKey ) {
                    this.submit(event);
                } else {
                    bubble = true;
                }
            //}
            break;
        /*case 38: // Up
            if( !this.multiline() ) {
                this.scroll_history(true);
                break;
            }
            bubble = true;
            break;
        case 40: // Down
            if( !this.multiline() ) {
                this.scroll_history(false);
                break;
            }
            bubble = true;
            break;
        case 9: // Tab
            if( event.shiftKey ) {
                this.manager.channel_right();
            } else {
                this.tab_item( event );
                ut = false;
            }
            break;
        case 219: // [
            if( event.ctrlKey ) {
                this.manager.channel_left();
            } else {
                bubble = true;
            }
            break;
        case 221: // ] (using instead of +)
            if( event.ctrlKey ) {
                this.manager.channel_right();
            } else {
                bubble = true;
            }
            break;*/
        default:
            bubble = true;
            break;
    }
    /*
    if( ut )
        this.end_tab( event );*/
    
    if( bubble )
        return;
    
    event.preventDefault();
    event.stopPropagation();

};

/**
 * Handle some user input.
 * 
 * @method handle
 * @param event {Object} Event data.
 * @param data {String} Input message given by the user.
 */
tadpole.Control.prototype.handle = function( event, data ) {

    if( data == '' )
        return;
    
    if( !this.manager.book.current )
        return;
    
    var autocmd = false;
    
    if( data[0] != '/' ) {
        autocmd = true;
    }
    
    data = (event.shiftKey ? '/npmsg ' : ( data[0] == '/' ? '' : '/say ' )) + data;
    data = data.slice(1);
    var bits = data.split(' ');
    var cmdn = bits.shift().toLowerCase();
    var ens = this.manager.book.current.raw;
    var etarget = ens;
    
    if( !autocmd && bits[0] ) {
        var hash = bits[0][0];
        if( (hash == '#' || hash == '@') && bits[0].length > 1 ) {
            etarget = this.manager.client.format_ns(bits.shift());
        }
    }
    
    var arg = bits.join(' ');
    
    var fired = this.manager.client.trigger('cmd.' + cmdn, {
        name: 'cmd',
        cmd: cmdn,
        args: arg,
        target: etarget,
        ns: ens
    });
    
    if( fired == 0 ) {
        /*this.manager.pager.notice({
            'ref': 'cmd-fail',
            'heading': 'Command failed',
            'content': '"' + cmdn + '" is not a command.'
        }, false, 5000 );*/
    }

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

;

/**
 * Channel object.
 * Manage a channel view.
 * @class tadpole.Channel
 * @contructor
 */
tadpole.Channel = function( ns, raw, hidden, components, ui, book ) {

    this.manager = ui;
    this.book = book;
    this.secret = hidden;
    this.tab = components.tab;
    this.head = components.head;
    this.users = components.users;
    this.ns = ns;
    this.raw = raw;
    this.selector = 'c-' + replaceAll(this.raw, ':', '-');
    this.hidden = hidden || false;
    this.visible = false;
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
 * Remove a channel from the client.
 * @method remove
 */
tadpole.Channel.prototype.remove = function(  ) {

    this.view.remove();
    this.tab.remove();
    this.manager.menu.heads.remove(this.selector);
    this.manager.menu.users.remove(this.selector);

};

/**
 * Scroll the log panel downwards.
 * 
 * @method scroll
 */
tadpole.Channel.prototype.scroll = function( ) {
    //this.pad();
    //var ws = this.el.l.w.prop('scrollWidth') - this.el.l.w.innerWidth();
    var hs = this.view.prop('scrollHeight') - this.logview.innerHeight();
    //if( ws > 0 )
    //    hs += ws;
    if( hs < 0 || (hs - this.view.scrollTop()) > 100 )
        return;
    this.view.animate({
        scrollTop: this.view.prop('scrollHeight')
    }, 600);
};


/**
 * Reveal the channel.
 * @method reveal
 */
tadpole.Channel.prototype.reveal = function(  ) {

    if( this.visible )
        return;
    
    if( this.hidden )
        return;
    
    this.view.css({'display': 'block'});
    this.visible = true;
    this.manager.top.set_label(this.ns);
    this.scroll();

};


/**
 * Hide the channel.
 * @method hide
 */
tadpole.Channel.prototype.hide = function(  ) {

    if( !this.visible )
        return;
    
    this.view.css({'display': 'none'});
    this.visible = false;

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
        '</span>'+content+'</li>'
    );
    
    this.scroll();
    
    return this.logview.find('li#'+ms).last();

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
    this.highlight(mb, user, message);

};


/**
 * Display a chat action message.
 * @method action
 * @param user {String} Username of the person who sent the message
 * @param message {String} Message to display
 */
tadpole.Channel.prototype.action = function( user, message ) {

    var mb = this.log('<p><em><strong class="username">* '+user+'</strong> '+message+'</em></p>');
    this.highlight(mb, user, message);

};

tadpole.Channel.prototype.highlight = function( box, user, message ) {

    var self = this.manager.client.settings.username.toLowerCase();
    
    if( user.toLowerCase() == self )
        return;
    
    if( message.toLowerCase().indexOf( self ) == -1 )
        return;
    
    box.addClass('highlight');

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

/**
 * Handle a property packet.
 * @method pkt_property
 * @param event {Object} Event data
 * @param client {Object} Reference to the client
 */
tadpole.Channel.prototype.pkt_property = function( event, client ) {

    var prop = event.pkt.arg.p;
    var c = client.channel( this.raw );
    
    switch(prop) {
        case "title":
        case "topic":
            this.head.set(prop, event.value || (new wsc.MessageString( '' )), event.by, event.ts );
            break;
        case "privclasses":
            this.users.set_pcs( c.info.pc, c.info.pc_order.slice(0) );
            break;
        case "members":
            //this.users.set_users(event.users);
            break;
        default:
            // this.server_message("Received unknown property " + prop + " received in " + this.info["namespace"] + '.');
            break;
    }

};

;/**
 * Rendering for dAmn-like protocols.
 *
 * This object is mainly used for constructing LogMessage objects with the
 * right data. Seemed to make more sense than having multiple definitions of
 * LogMessage and/or if...else/switch...case blocks.
 * 
 * @class tadpole.Protocol
 * @constructor
 */
tadpole.Protocol = function(  ) {

    /**
     * Messages object.
     * 
     * This object determines how each protocol packet should be rendered based
     * data from an `event object`. For each packet, there is an entry, where the key is the
     * {{#crossLink "tadpole.Protocol/event:method"}}event name{{/crossLink}} of the packet.
     * 
     * Each entry is an array. The array consists of options for rendering and
     * logging. The array is of the structure `[ renderers, monitor, global ]`.
     * All items are optional, but positional. There are default options that
     * can be used.
     * 
     * When `renderers` is present it must be an array. This array contains
     * renderers for different kinds of formats. Renderers can be either a
     * formatted string or a callback that returns a string. There must be at
     * least one renderer, for text output. Otherwise the array should contain
     * a renderer for text ouput, a renderer for HTML output, and a renderer
     * for ANSI output. If a renderer is missing then everything falls back to
     * text renderer.
     * 
     * The `monitor` option determines whether or not to display the log
     * message in the monitor channel. The default for this is `false`.
     * 
     * The `global` option determines whether or not to display the log message
     * in every open channel. The default for this is also `false`.
     * 
     * An example for an entry in this object:
     *      
     *      { 'join': [
     *          [
     *              '** Join {ns}: "{e}" *',
     *              '<p><strong class="event">** Join {ns}: "{e}" *</strong></p>'
     *          ],
     *          true
     *      ] }
     * 
     * This shows how the join packet will render in the monitor channel. If a
     * channel is set to display in the monitor channel, then it should not
     * be displayed in the event channel.
     *
     * At the moment, we only have to render using HTML, so the `renderers`
     * array in the entries are only HTML renderers at the moment. No array,
     * just formatting strings.
     * 
     * To display absolutely nothing for an event, the whole entry can simply
     * be `null`.
     * @property messages
     * @type Object
     */
    this.messages = {
        'chatserver': {
            keys: [ 'version' ],
            template: '<h2>Connected to llama {version}</h2>',
            global: true
        },
        'dAmnServer': {
            keys: [ 'version' ],
            template: '<h2>Connected to dAmnServer {version}</h2>',
            global: true
        },
        'login': {
            keys: [ 'username', 'e', 'data' ],
            template: '<p><strong class="event">Login as {username}:</strong> "{e}"</p>',
            global: true
        },
        'join': {
            keys: [ 'ns', 'e' ],
            template: '<p><strong class="event">Join {ns}:</strong> "{e}"</p>',
            monitor: true
        },
        'part': {
            keys: [ 'ns', 'e', 'r' ],
            template: '<h2>Part {ns} "{e}"</h2><p>{r}</p>',
            monitor: true
        },
        'property': {
            keys: [ 'ns', 'p', 'by', 'ts', 'value' ],
            template: '<h2>Got {p} for {ns}</h2>',
            monitor: true
        },
        'recv_msg': {
            keys: [ 'user', 'message' ],
            template: '<h2 class="username">{user}</h2><p>{message}</p>'
        },
        /*
        'recv_npmsg': {
            keys: [ 'user', 'message' ],
            template: '<span class="cmsg user u-{user}"><strong>&lt;{user}&gt;</strong></span><span class="cmsg u-{user}">{message}</span>'
        },
        */
        'recv_action': {
            keys: [ 's', 'user', 'message' ],
            template: '<p><em><strong class="username">* {user}</strong> {message}</em></p>'
        },
        'recv_join': {
            keys: [ 'user', 's', 'info' ],
            template: '<h2 class="background">{user} joined</h2>',
        },
        'recv_part': {
            keys: [ 'user', 'r' ],
            template: '<h2 class="background">{user} has left</h2><p class="background">{r}</p>'
        },
        'recv_privchg': {
            keys: [ 'user', 's', 'by', 'pc' ],
            template: '<p><strong><em>{user} has been made a member of {pc} by {by}</em></strong></p>'
        },
        'recv_kicked': {
            keys: [ 'user', 's', 'by', 'r' ],
            template: '<h2>{user} has been kicked by {by}</h2><p>{r}</p>'
        },
        'recv_admin_create': {
            keys: [ 'p', 'user', 'pc', 'privs' ],
            template: '<h2>Privilege class {pc} has been created by {user}</h2><p>{privs}</p>'
        },
        'recv_admin_update': {
            keys: [ 'p', 'user', 'pc', 'privs' ],
            template: '<h2>Privilege class {pc} has been updated by {user}</h2><p>{privs}</p>'
        },
        'recv_admin_rename': {
            keys: [ 'p', 'user', 'prev', 'pc' ],
            template: '<h2>Privilege class {prev} has been renamed to {pc} by {user}</h2>'
        },
        'recv_admin_move': {
            keys: [ 'p', 'user', 'prev', 'pc', 'affected' ],
            template: '<h2>All members of {prev} have been moved to {pc} by {user}</h2><p>{affected} affected user(s)</p>'
        },
        'recv_admin_remove': {
            keys: [ 'p', 'user', 'pc', 'affected' ],
            template: '<h2>Privilege class {pc} has been removed by {user}</h2><p>{affected} affected user(s)</p>'
        },
        'recv_admin_show': null,
        'recv_admin_showverbose': null,
        'recv_admin_privclass': {
            keys: [ 'p', 'e', 'command' ],
            template: '<h2>Admin command "{command}" failed</h2><p>{e}</p>'
        },
        'kicked': {
            keys: [ 'ns', 'user', 'r' ],
            template: '<h2>You have been kicked by {user}</h2><p>{r}</p>'
        },
        'ping': null, //['<p><strong class="event">** Ping...</strong></p>', true],
        'disconnect': {
           keys: [ 'e' ],
           template: '<h2>You have been disconnected</h2><p>{e}</p>',
           global: true
        },
        // Stuff here is errors, yes?
        'send': {
            keys: [ 'ns', 'e' ],
            template: '<p><strong class="event">Send error: <em>{e}</em></p>'
        },
        'kick': {
            keys: [ 'ns', 'user', 'e' ],
            template: '<h2>Could not kick {user}</h2><p>{e}</p>'
        },
        'get': {
            keys: [ 'ns', 'p', 'e' ],
            template: '<h2>Could not get {p} info for {ns}</h2><p>{e}</p>'
        },
        'set': {
            keys: [ 'ns', 'p', 'e' ],
            template: '<h2>Could not set {p}</h2><p>{e}</p>'
        },
        'kill': {
            keys: [ 'ns', 'e' ],
            template: '<h2>Kill error</h2><p>{e}</p>'
        },
        'log': {
            keys: [ 'ns', 'msg', 'info' ],
            template: '<h2>{msg}</h2><p>{info}</p>'
        },
        'unknown': {
            keys: [ 'ns', 'packet' ],
            template: '<h2>Received unknown packet in {ns}</h2><p>{packet}</p>',
            monitor: true
        }
    };

};

/**
 * Extend the protocol message renderers.
 * 
 * @method extend_messages
 * @param messages {Object} An object containing packet rendering methods.
 */
tadpole.Protocol.prototype.extend_messages = function( messages ) {

    for( var key in messages ) {
        if( !this.messages.hasOwnProperty(key) )
            continue;
        this.messages[key] = messages[key];
    }

};

/**
 * Produce a log message for an event.
 * @method log
 * @param event {Object} Event data to produce a log message with
 * @return {Object} A log message object on success. Null if failed.
 */
tadpole.Protocol.prototype.log = function( event ) {

    var msgm = this.messages[event.name];
    //console.log(this.map[event.name]);
    return new tadpole.Protocol.LogMessage( event, msgm );

};


/**
 * Log message object represents a log message.
 * @class tadpole.Protocol.LogMessage
 * @constructor
 * @param event {Object} Event data
 * @param options {Array} Log message options
 */
tadpole.Protocol.LogMessage = function( event, options ) {
    
    options = options || {};
    
    this.event = event;
    this.template = options.template || '';
    this.keys = options.keys || [];
    this.monitor = options.monitor || false;
    this.global = options.global || false;
    this._html = false;
    this._text = false;
    this._ansi = false;

};

/**
 * Get a text rendition.
 * @method text
 * @return {String} Rendered message
 */
tadpole.Protocol.LogMessage.prototype.text = function(  ) {

    if( this._text === false )
        this._text = this.render( 0 );
    
    return this._text;

};

/**
 * Get an HTML rendition.
 * @method html
 * @return {String} Rendered message
 */
tadpole.Protocol.LogMessage.prototype.html = function(  ) {

    if( this._html === false )
        this._html = this.render( 1 );
    
    return this._html;

};

/**
 * Get an ANSI rendition.
 * @method ansi
 * @return {String} Rendered message
 */
tadpole.Protocol.LogMessage.prototype.ansi = function(  ) {

    if( this._ansi === false )
        this._ansi = this.render( 2 );
    
    return this._ansi;

};

/**
 * Render a log message in the given format.
 * 
 * @method render
 * @param [format=0] {Integer} What rendering format to use. 0 is text, 1 is
 *      html, 2 is ansi.
 * @return {String} Rendered event
 */
tadpole.Protocol.LogMessage.prototype.render = function( format ) {
    
    if( format === undefined )
        format = 0;
    
    /*
    var render = this.render[ format ];
    
    try {
        return render( this, this.event );
    } catch( err ) {
    */
    
    var render = this.template;
    var d = '';
    
    for( var i in this.keys ) {
    
        if( !this.keys.hasOwnProperty( i ) )
            continue;
        
        key = this.keys[i];
        
        if( key instanceof Array )
            key = key[1];
        
        if( key == 'pkt' )
            continue;
        
        d = this.event[key] || '';
        
        if( d == null )
            continue;
        
        if( key == 'ns' || key == 'sns' ) {
            key = 'ns';
            d = this.event['sns'] || d;
        }
        
        if( d.hasOwnProperty('_parser') ) {
            switch(format) {
                case 1:
                    d = d.html();
                    break;
                case 2:
                    d = d.ansi();
                    break;
                case 0:
                default:
                    d = d.text();
                    break;
            }
        }
        
        render = replaceAll( render, '{' + key + '}', d );
        
    }
    
    return render;

};
;
/**
 * Default commands for tadpole.
 * @class tadpole.Commands
 * @constructor
 */
tadpole.Commands = function( client, ui ) {

    var api = {};
    
    var init = function(  ) {
        ui.menu.commands.add( 'join', 'joinchannel', 'Join Channel', function( event ) {
        
            cmdarr.reveal('joinchannel');
        
        } );
        
        ui.menu.commands.add( 'kick', 'kickuser', 'Kick User', function( event ) {
        
            ui.menu.show_users(
                function( list, user ) {
                
                    client.kick(ui.book.current.raw, user.name);
                    ui.menu.toggle();
                
                }
            );
        
        } );
        
        ui.menu.commands.add( 'ban', 'banuser', 'Ban User', function( event ) {
        
            ui.menu.show_users(
                function( list, user ) {
                
                    client.ban(ui.book.current.raw, user.name);
                    ui.menu.toggle();
                
                }
            );
        
        } );
    };
    
    var cmdarr = ui.menu.commanditems;
    tadpole.Commands.JoinChannel( client, ui, cmdarr );
    
    init();
    
    return api;

};


/**
 * Join channel command overlay.
 * @class tadpole.Commands.JoinChannel
 * @constructor
 */
tadpole.Commands.JoinChannel = function( client, ui, cmd_array ) {

    var item = cmd_array.add( 'joinchannel' );
    var view = item.overlay.view;
    view.append(
        '<nav><ul><li>'
        +'<a href="#" class="button">'
        +'  <span class="icon-left-open"></span> Join Channel'
        +'  </a>'
        +'</li></ul></nav><div class="section">'
        +'  <p>Enter the name of a channel to join using the field below.</p>'
        +'  <form><input class="join" type="text" /></form></div>'
    );
    
    var back = view.find('nav ul li a.button');
    
    back.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        cmd_array.hide('joinchannel');
    
    } );
    
    var field = view.find('input.join');
    var form = view.find('form');
    form.submit( function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        var chan = field.val();
        chan = chan.split(' ');
        
        for( var i in chan ) {
            client.join(chan[i]);
        }
        
        cmd_array.hide('joinchannel');
        ui.menu.toggle();
        field.val('');
    
    } );

};

;
/**
 * Settings menu.
 * @class tadpole.SettingsMenu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.SettingsMenu = function( ui, parentview ) {

    this.manager = ui;
    this.parentview = parentview;
    this.menu = null;
    this.build();

};


/**
 * Place the channel list on the page.
 * @method build
 */
tadpole.SettingsMenu.prototype.build = function(  ) {

    // Create the channel menu.
    this.menu = new tadpole.Menu(this.manager, this.parentview, 'settings');
    
    var menu = this;
    
    this.add( 'exit', 'Settings', function( event ) {
    
        menu.hide();
    
    }, 'left-open' );
    
    this.add( 'comingsoon', 'Coming Soon...', function( event ) {} );

};

/**
 * Resize the channel menu.
 * @method resize
 */
tadpole.SettingsMenu.prototype.resize = function(  ) {

    this.menu.resize();

};

/**
 * Reveal the menu.
 * @method reveal
 */
tadpole.SettingsMenu.prototype.reveal = function(  ) {

    return this.menu.reveal();

};

/**
 * Hide the menu.
 * @method hide
 */
tadpole.SettingsMenu.prototype.hide = function(  ) {

    return this.menu.hide();

};

/**
 * Add an item to the settings menu.
 * @method add
 */
tadpole.SettingsMenu.prototype.add = function( id, label, callback, icon, hidden ) {
    
    var menu = this;
    
    var tab = this.menu.add(
        'settings', id,
        label, function( event ) {
            callback( event );
        }, icon, hidden
    );
    
    return tab;

};