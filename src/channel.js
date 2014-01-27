

/**
 * Channel object.
 * Manage a channel view.
 * @class tadpole.Channel
 * @contructor
 */
tadpole.Channel = function( ns, raw, ui, book ) {

    this.manager = ui;
    this.book = book;
    this.ns = ns;
    this.raw = raw;
    this.hidden = true;
    this.background = false;
    this.build();

};


/**
 * Place the channel on the screen.
 * @method build
 */
tadpole.Channel.prototype.build = function(  ) {

    this.book.view.append('<div class="channel" id="'+this.raw+'"><ul class="log"></ul></div>');
    this.view = this.book.view.find('div.channel#'+this.raw);
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
    
    this.logview.append('<li id="'+date+'"><span class="content">'+
        content+'</span><span class="timestamp">'+ts+
        '</span></li>');

};


/**
 * Display a chat message.
 * @method message
 * @param user {String} Username of the person who sent the message
 * @param message {String} Message to display
 */
tadpole.Channel.prototype.message = function( user, message ) {

    this.log('<h2>'+user+'</h2><p>'+message+'</p>');

};

