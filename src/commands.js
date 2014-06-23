
/**
 * Default commands for tadpole.
 * @class tadpole.Commands
 * @constructor
 */
tadpole.Commands = function( client, ui ) {

    var api = {};
    
    var init = function(  ) {
        
        // MENU COMMANDS
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
        
        // SETTINGS PAGES
        ui.menu.settings.add( 'aj', 'Autojoin', function( event ) {
        
            autojoin.update();
            settings_page.reveal('aj');
        
        } );
    };
    
    var cmdarr = ui.menu.commanditems;
    var settings_page = ui.menu.settings.page;
    tadpole.Commands.JoinChannel( client, ui, cmdarr );
    var autojoin = tadpole.Commands.Autojoin( client, ui, settings_page );
    
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
        
            for( var i in channels ) {
            
                channels[i].remove();
            
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
        
            for( var i in channels ) {
            
                channels[i].remove();
            
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

