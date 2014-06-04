

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

