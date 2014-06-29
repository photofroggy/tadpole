
/**
 * Default commands for tadpole.
 * @class tadpole.Commands
 * @constructor
 */
tadpole.Commands = function( client, ui ) {

    var api = {};
    var settings = {};
    api.away = {};
    ui.storage = client.storage.folder( 'tadpole' );
    api.storage = ui.storage;
    settings.theme = ui.options.default_theme;
    
    api.save = function(  ) {
    
        api.storage.set( 'theme', settings.theme );
    
    };
    
    api.load = function(  ) {
    
        settings.theme = api.storage.get( 'theme', settings.theme );
    
    };
    
    api.load();
    
    var init = function(  ) {
        
        // MENU COMMANDS
        ui.menu.commands.add( 'join', 'joinchannel', 'Join Channel', function( event ) {
        
            cmdarr.reveal('joinchannel');
        
        } );
        
        api.away.button = ui.menu.commands.add( 'away', 'away', 'Set Away', function( event ) {
        
            if( !client.ext.defaults.away.on ) {
                cmdarr.reveal('set-away');
                return;
            }
            
            client.ext.defaults.away.back();
            api.away.button.button.text('Set Away');
        
        } );
        
        ui.menu.commands.add( 'ignore', 'ignoreuser', 'Ignore User', function( event ) {
        
            ui.menu.show_users(
                function( list, user ) {
                
                    client.ext.defaults.ignore.add(user.name, true);
                    ui.menu.toggle();
                
                }
            );
        
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
        
        // SETTINGS PAGES
        ui.menu.settings.add( 'themes', 'Theme', function( event ) {
        
            settings_page.reveal('theme');
        
        } );
        
        ui.menu.settings.add( 'aj', 'Autojoin', function( event ) {
        
            autojoin.update();
            settings_page.reveal('aj');
        
        } );
        
        ui.menu.settings.add( 'ignore', 'Ignores', function( event ) {
        
            ignore.update();
            settings_page.reveal('ignore');
        
        } );
    };
    
    var cmdarr = ui.menu.commanditems;
    var settings_page = ui.menu.settings.page;
    tadpole.Commands.JoinChannel( client, ui, cmdarr );
    var autojoin = tadpole.Commands.Autojoin( client, ui, settings_page );
    var away = tadpole.Commands.Away( client, ui, cmdarr, api );
    var ignore = tadpole.Commands.Ignore( client, ui, settings_page );
    tadpole.Commands.Theme( client, ui, settings_page, api, settings );
    
    init();
    
    return api;

};


/**
 * Theme selection overlay.
 */
tadpole.Commands.Theme = function( client, ui, pages, api, settings ) {

    api.theme = {};
    
    var page = pages.add('theme');
    var view = page.overlay.view;
    var themeb = {};
    
    view.append(
        '<nav><ul></ul></nav>'
    );
    
    var ul = view.find('ul');
    
    new tadpole.MenuButton( ul, 'back', '', 'Theme', function( event ) {
        page.overlay.hide();
        page.hide();
    }, 'left-open' );
    
    api.theme.add = function( name, selector ) {
        
        if( !ui.options.themes.hasOwnProperty( name ) )
            ui.options.themes[name] = selector;
        
        var item = new tadpole.MenuButton( ul, 'theme', selector, name, function( event ) {
            api.theme.select( name );
        } );
        
        themeb[name] = item;
        
    };
    
    api.theme.deselect = function( name ) {
    
        if( !themeb.hasOwnProperty( name ) )
            return;
        
        themeb[name].unhighlight();
        
        if( ui.view.hasClass( ui.options.themes[name] ) ) {
            ui.view.removeClass( ui.options.themes[name] );
        }
        
        settings.theme = '';
    
    };
    
    api.theme.select = function( name ) {
    
        if( !themeb.hasOwnProperty( name ) )
            return;
        
        api.theme.deselect( settings.theme );
        themeb[name].highlight();
        
        if( !ui.view.hasClass( ui.options.themes[name] ) )
            ui.view.addClass( ui.options.themes[name] );
        
        settings.theme = name;
        api.save();
    
    };
    
    for( var name in ui.options.themes ) {
    
        if( !ui.options.themes.hasOwnProperty( name ) )
            continue;
        
        api.theme.add( name, ui.options.themes[name] );
    
    }
    
    api.theme.select( settings.theme );

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
        +'  <span class="icon-left-open"></span>Join Channel'
        +'  </a>'
        +'</li></ul></nav><div class="section border">'
        +'  <p>Enter the name of a channel to join.</p>'
        +'  <form><input class="join" type="text" /></form>'
        +'  <p>Or tap a channel from the list below.</p></div>'
        +'<nav class="channels"><ul>'
        +'  <li><a href="#" class="button cltitle">'
        +'      <span class="icon-comment"></span>Channels</a></li>'
        +'</ul></nav>'
    );
    
    var back = view.find('nav ul li a.button');
    var field = view.find('input.join');
    var form = view.find('form');
    var ul = view.find('nav.channels ul');
    var ult = ul.find('.button.cltitle');
    
    back.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        item.overlay.hide();
    
    } );
    
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
    
    var channels = [];
    
    var api = {
    
        add: function( channel ) {
        
            var chan = new tadpole.MenuButton( ul, 'channel',
                replaceAll(client.format_ns(channel.chatname), ':', '-'),
                channel.chatname,
                function( event ) {
                
                    client.join(channel.chatname);
                    ui.menu.toggle();
                
                });
    
            chan.button.append(
                ' <span class="faint">'
                +channel.usercount + ' users</span>'
                +'<span class="button right green join icon-plus"></span>'
                +'<p>' + channel.description + '</p>'
            );
            
            channels.push(chan);
            return chan;
        
        },
        
        clear: function(  ) {
        
            while( channels.length > 0 ) {
            
                channels.pop().remove();
            
            }
        
        },
        
        update: function(  ) {
        
            api.clear();
            
            $.getJSON( window.location.origin + '/api/chat/channels', function( data ) {
            
                data = data.chats.slice(0, 50);
                for( var i in data ) {
                
                    api.add( data[i] );
                
                }
            
            } );
            
            setTimeout( api.update, 330000 );
        
        }
    
    };
    
    api.update();

};


/**
 * Construct a settings page for autojoin.
 */
tadpole.Commands.Autojoin = function( client, ui, pages ) {

    var page = pages.add('aj');
    var view = page.overlay.view;
    
    view.append(
        '<nav><ul><li>'
        +'<a href="#" class="button back">'
        +'  <span class="icon-left-open"></span>Autojoin'
        +'  </a>'
        +'</li><li><a href="#" class="button switch off">'
        +'  <span class="icon-cancel"></span>Off'
        +'  </a>'
        +'</li></ul></nav><div class="section border">'
        +'  <p>Add channels to your autojoin list.</p>'
        +'  <form><input class="join" type="text" /></form></div>'
        +'<nav class="channels"><ul><li>'
        +'<a href="#" class="button ajtitle">'
        +'  <span class="icon-comment"></span>Channels'
        +'  </a>'
        +'</li></ul></nav>'
    );
    
    var button = {
        back: view.find('.button.back'),
        toggle: view.find('.button.switch'),
        ajtitle: view.find('.button.ajtitle')
    }
    
    var form = view.find('form');
    var field = form.find('input');
    var ul = view.find('nav.channels ul');
    var channels = [];
    
    button.back.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        page.overlay.hide();
    
    } );
    
    var tcb = function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        client.ext.defaults.autojoin.on = !client.ext.defaults.autojoin.on;
        client.ext.defaults.autojoin.save();
        api.update_toggle();
    
    };
    
    button.toggle.on( 'click', tcb );
    
    button.ajtitle.on( 'click', function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
    
    } );
    
    form.submit( function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        
        var data = field.val();
        field.val('');
        
        data = data.split(' ');
        
        for( var i in data ) {
        
            client.ext.defaults.autojoin.add(
                client.deform_ns(data[i]).toLowerCase());
        
        }
        
        client.ext.defaults.autojoin.save();
        api.update_list();
    
    } );
    
    var api = {
    
        add: function( ns ) {
        
            var chan = new tadpole.MenuButton( ul, 'channel',
                replaceAll(client.format_ns(ns), ':', '-'), ns,
                function( event ) {});
    
            chan.button.append('<span class="button right red close icon-cancel"></span>');
            var close = chan.view.find('.button.close');
            
            close.on( 'click', function( event ) {
            
                event.preventDefault();
                event.stopPropagation();
                client.ext.defaults.autojoin.remove(ns);
                client.ext.defaults.autojoin.save();
                chan.remove();
            
            } );
            
            channels.push(chan);
            return chan;
        
        },
        
        clear: function(  ) {
        
            while( channels.length > 0 ) {
            
                channels.pop().remove();
            
            }
        
        },
        
        update: function(  ) {
        
            api.update_toggle();
            api.update_list();
        
        },
        
        update_toggle: function(  ) {
        
            if( client.ext.defaults.autojoin.on ) {
                button.toggle.html(
                    '<span class="green icon-ok"></span>On <span class="faint">'
                    +'tap to turn off</span>'
                );
            } else {
                button.toggle.html(
                    '<span class="red icon-cancel"></span>Off <span class="faint">'
                    +'tap to turn on</span>'
                );
            }
        
        },
        
        update_list: function(  ) {
        
            api.clear();
            
            for( var i in client.ext.defaults.autojoin.channel ) {
            
                api.add(client.ext.defaults.autojoin.channel[i]);
            
            }
        
        }
    
    };
    
    api.update();
    
    return api;

};


/**
 * Away command overlay.
 * @class tadpole.Commands.Away
 * @constructor
 */
tadpole.Commands.Away = function( client, ui, cmd_array, api ) {

    var item = cmd_array.add( 'set-away' );
    var view = item.overlay.view;
    view.append(
        '<nav><ul></ul></nav>'
    );
    
    var ul = view.find('nav ul');
    
    new tadpole.MenuButton( ul, 'back', '', 'Set Away', function( event ) {
        item.overlay.hide();
        item.hide();
    }, 'left-open' );
    
    new tadpole.MenuButton( ul, 'silent', '', 'Silent Away', function( event ) {
        client.ext.defaults.away.away();
        api.away.button.button.text('Set Back');
        ui.menu.toggle();
    } );
    
    var away = new tadpole.MenuButton( ul, 'awayr', '', 'Reason',
        function( event ) {} );
    
    away.button.append(
        '<p>Leave a message to show people who try and talk to you while'
        +' you\'re away.</p>'
        +'<form><input class="reason" type="text" /></form>'
    );
    
    var form = away.view.find('form');
    var field = form.find('input');
    
    form.submit( function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        var r = field.val();
        client.ext.defaults.away.away(r);
        api.away.button.button.text('Set Back');
        ui.menu.toggle();
        field.val('');
    
    } );

};


/**
 * Construct a settings page for ignore.
 */
tadpole.Commands.Ignore = function( client, ui, pages ) {

    var page = pages.add('ignore');
    var view = page.overlay.view;
    
    view.append(
        '<nav class="ignores"><ul></ul></nav>'
    );
    
    var ul = view.find('nav.ignores ul');
    
    new tadpole.MenuButton( ul, 'back', '', 'Ignore', function( event ) {
        page.overlay.hide();
        page.hide();
    }, 'left-open' );
    
    var additem = new tadpole.MenuButton( ul, 'add', '', 'Add User', function( event ) {
        ui.menu.show_users(
            function( list, user ) {
                client.ext.defaults.ignore.add(user.name, true);
                ui.menu.users.hide();
            }
        );
    }, 'plus' );
    
    additem.button.append(
        '<p>Select "Add User" or enter a username below.</p>'
        +'<form><input type="text" /></form>'
    );
    
    var form = additem.button.find('form');
    var field = form.find('input');
    
    new tadpole.MenuButton( ul, 'ilist', '', 'Ignored Users',
        function( event ) {}, 'user' );
    
    var users = [];
    
    form.submit( function( event ) {
    
        event.preventDefault();
        event.stopPropagation();
        var u = field.val();
        field.val('');
        u = u.split(' ');
        
        for( var i in u ) {
            client.ext.defaults.ignore.add(u[i]);
        };
    
    } );
    
    form.on( 'click', function( event ) {
        event.preventDefault();
        event.stopPropagation();
    } );
    
    var api = {
    
        add: function( username ) {
        
            var user = new tadpole.MenuButton( ul, 'user',
                username, username,
                function( event ) {});
    
            user.button.append('<span class="button right red close icon-cancel"></span>');
            var close = user.view.find('.button.close');
            
            close.on( 'click', function( event ) {
            
                event.preventDefault();
                event.stopPropagation();
                client.ext.defaults.ignore.remove(username);
            
            } );
            
            users.push(user);
            return user;
        
        },
        
        clear: function(  ) {
        
            while( users.length > 0 ) {
            
                users.pop().remove();
            
            }
        
        },
        
        update: function(  ) {
        
            api.clear();
            
            for( var i in client.ext.defaults.ignore.ignored ) {
            
                api.add(client.ext.defaults.ignore.ignored[i]);
            
            }
        
        }
    
    };
    
    api.update();
    client.bind('ignore.load', api.update);
    client.bind('ignore.add', api.update);
    client.bind('ignore.remove', api.update);
    
    return api;

};

