

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
    this.tabc = 0;
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
    this.unhighlight();

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
tadpole.Channel.prototype.log = function( event ) {

    var date = new Date();
    var chan = this;
    var content = event.html;
    
    this.manager.cascade( 'ns.log', function( data, done ) {
        chan.logview.append(
            '<li id="'+data.ms+'"><span class="timestamp">'+data.ts+
            '</span>'+data.content+'</li>'
        );
        
        chan.scroll();
        
        var item = chan.logview.find('li#'+data.ms).last();
        
        chan.manager.emit('ns.log.after', {
            channel: chan,
            item: item,
            data: data,
            event: data.event
        });
    }, {
        channel: this,
        date: date,
        ts: formatTime('{HH}:{mm}:{ss}', date),
        ms: date.getTime(),
        content: content,
        event: event
    } );

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

/**
 * Indicate that the user has been highlighted in here.
 * @method highlight
 */
tadpole.Channel.prototype.highlight = function(  ) {

    if( this.visible && !this.ui.menu.menu.overlay.visible )
        return;
    
    if( this.hidden )
        return;
    
    this.tabc++;
    this.manager.top.tab(1);
    this.tab.highlight();

};

/**
 * Messages checked wooo.
 * @method unhighlight
 */
tadpole.Channel.prototype.unhighlight = function(  ) {

    this.manager.top.untab(this.tabc);
    this.tab.unhighlight();
    this.tabc = 0;

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

