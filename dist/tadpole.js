
/**
 * Tadpole UI lib.
 */
var tadpole = {};

tadpole.VERSION = '0.3.9';
tadpole.STATE = 'alpha';


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
    
    this.protocol = new tadpole.Protocol();

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
    this.monitor = this.channel_add( this.options.monitor[0], replaceAll(this.options.monitor[0], '~', 'server:') );
    
    var ui = this;
    
    this.client.bind( 'pkt', function( event, client ) {
    
        ui.packet(event, client);
    
    } );
    
    this.client.bind( 'log', function( event, client ) {
    
        ui.packet(event, client);
    
    } );
    
    /*
    // Channel removed from client.
    this.client.middle(
        'ns.remove',
        function( data, done ) {
            ui.remove_channel( data.ns );
            done( data );
        }
    );
    */
    
    this.client.bind(
        'ns.create',
        function( event, client ) {
            ui.channel_add(event.chan.namespace, event.chan.raw);
        }
    );
    /*
    this.client.bind(
        'ns.user.list',
        function( event ) {
            ui.channel(event.ns).set_user_list( event.users );
        }
    );
    
    this.client.middle(
        'ns.user.privchg',
        function( data, done ) {
            ui.channel(data.ns).privchg( data, done );
        }
    );
    
    this.client.bind(
        'ns.user.remove',
        function( event, client ) {
            ui.channel(event.ns).remove_one_user( event.user );
        }
    );
    
    this.client.bind(
        'ns.user.registered',
        function( event ) {
            ui.channel(event.ns).register_user( event.user );
        }
    );
    */

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
tadpole.UI.prototype.channel_add = function( ns, raw ) {

    var selector = replaceAll(raw, 'pchat:', 'c-pchat-');
    selector = replaceAll(selector, 'chat:', 'c-chat-');
    selector = replaceAll(selector, 'server:', 'c-server-');
    selector = replaceAll(selector, ':', '-');
    
    var components = {
        tab: this.menu.channel.add( ns, raw ),
        head: this.menu.heads.add( selector )
    };
    
    return this.book.add( ns, raw, components );

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
            //this.book.handle( event, client );
            return;
        }
        
        event.html = msg.html();
        
        /*this.cascade(
            'log_message',
            function( data, done ) {*/
                ui.book.log_message( msg, event );
            /*}, {
                message: msg,
                event: event
            }
        );*/
    
    }
    
    //this.book.handle( event, client );

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
    this.selector = '.overlay.' + this.cls;
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

    this.parentview.append('<div class="overlay ' + this.cls + '"></div>');
    this.view = this.parentview.find('.overlay.' + this.cls);
    
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
 * Menu for the fucking thingy.
 * @class tadpole.Menu
 * @constructor
 * @param ui {Object} Main ui object.
 */
tadpole.Menu = function( ui ) {

    this.manager = ui;
    this.users = null;
    this.heads = null;
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
        +'  <li><a class="head" href="#"><span class="icon-doc"></span>Topic/Title</a></li>'
        +'  <li><a class="users" href="#"><span class="icon-user"></span>Users</a></li>'
        +'  <li><a class="channels" href="#"><span class="icon-comment"></span>Channels</a></li>'
        +'  <li><a class="commands" href="#"><span class="icon-plus"></span>Commands</a>'
        +'      <ul>'
        +'          <li><a class="e-join" href="#">Join Channel</a></li>'
        +'          <li><a class="e-join" href="#">Leave Channel</a></li>'
        +'      </ul>'
        +'  </li>'
        +'  <li><a class="settings" href="#"><span class="icon-cog"></span>Settings</a></li>'
        +'</ul></nav>');
    
    this.view = this.overlay.view.find('nav');
    this.button_head = this.view.find('.head');
    this.button_users = this.view.find('.users');
    this.button_channels = this.view.find('.channels');
    this.button_commands = this.view.find('.commands');
    this.button_settings = this.view.find('.settings');
    
    // Handle events.
    var menu = this;
    
    this.button_head.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_head();
    
    } );
    
    this.button_users.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_users();
    
    } );
    
    this.button_channels.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_channels();
    
    } );
    
    this.button_commands.on( 'click', function( event ) {
    
        event.preventDefault();
    
    } );
    
    this.button_settings.on( 'click', function( event ) {
    
        event.preventDefault();
        menu.show_settings();
    
    } );
    
    // Create sub-menus.
    this.channel = new tadpole.ChannelMenu( this.manager, this.overlay.view );
    this.heads = new tadpole.HeadArray( this.manager, this, this.manager.view, 'head', 'h' );
    //this.users = new tadpole.UserListArray( this.manager );
    //this.settings = new tadpole.SettingsOverlay( this.manager );

};

/**
 * Resize the menu.
 * @method resize
 */
tadpole.Menu.prototype.resize = function(  ) {

    this.overlay.resize();
    this.channel.resize();
    this.heads.resize();
    //this.users.resize();
    //this.settings.reszie();

};

/**
 * Toggle the menu.
 * @method toggle
 */
tadpole.Menu.prototype.toggle = function(  ) {

    if( this.overlay.visible ) {
        this.channel.hide();
        this.heads.hide();
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
 * Show the head.
 * @method show_head
 */
tadpole.Menu.prototype.show_head = function(  ) {

    this.heads.reveal(this.manager.book.current.selector);

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


/**
 * Menu item.
 * @class tadpole.MenuItem
 * @constructor
 */
tadpole.MenuItem = function( manager, menu, id, overlay ) {

    this.manager = manager;
    this.menu = menu;
    this.id = id;
    this.overlay = overlay || null;
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
tadpole.MenuItemArray.prototype.create_item = function( id, overlay ) {

    return new tadpole.MenuItem( this.manager, this.menu, id, overlay );

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
tadpole.MenuItemArray.prototype.add = function( id ) {

    this.remove( id );
    var ol = this.overlays.add(id);
    this.items[id.toLowerCase()] = this.create_item( id, ol );

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
    this.overlay = new tadpole.Overlay( this.manager.view, 'channelmenu' );
    this.overlay.view.append('<nav class="channels">'
        +'<ul>'
        +'  <li><span class="button" id="channelexit"><span class="icon-left-open"></span>Channels</span></li>'
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
 * Resize the channel menu.
 * @method resize
 */
tadpole.ChannelMenu.prototype.resize = function(  ) {

    this.overlay.resize();

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
    selector = replaceAll(selector, 'server:', 'c-server-');
    selector = replaceAll(selector, ':', '-');
    
    this.ul.append( '<li><a id="tab-' + selector + '" href="#">' + ns + '</a></li>');
    
    var cmenu = this;
    var tab = this.ul.find('a#tab-' + selector);
    
    tab.on( 'click', function( event ) {
    
        event.preventDefault();
        cmenu.manager.book.reveal(raw);
        cmenu.manager.menu.toggle();
    
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

;

/**
 * Channel object.
 * Manage a channel view.
 * @class tadpole.Channel
 * @contructor
 */
tadpole.Channel = function( ns, raw, components, ui, book ) {

    this.manager = ui;
    this.book = book;
    this.tab = components.tab;
    this.head = components.head;
    this.ns = ns;
    this.raw = raw;
    this.selector = replaceAll(this.raw, 'pchat:', 'c-pchat-');
    this.selector = replaceAll(this.selector, 'chat:', 'c-chat-');
    this.selector = replaceAll(this.selector, 'server:', 'c-server-');
    this.selector = replaceAll(this.selector, ':', '-');
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
        '</span>'+content+'</li>'
    );
    
    var ch = this;
    
    //setTimeout( function(  ) {
        ch.scroll();
    //}, 100 );
    
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
