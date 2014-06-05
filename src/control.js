

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

