

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

