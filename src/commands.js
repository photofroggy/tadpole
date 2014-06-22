
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

