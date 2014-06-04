/**
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
            template: '<p><strong class="event">** Connected to llama {version} *</strong></p>',
            global: true
        },
        'dAmnServer': {
            keys: [ 'version' ],
            template: '<p><strong class="event">** Connected to dAmnServer {version} *</strong></p>',
            global: true
        },
        'login': {
            keys: [ 'username', 'e', 'data' ],
            template: '<p><strong class="event">** Login as {username}: "{e}" *</strong></p>',
            global: true
        },
        'join': {
            keys: [ 'ns', 'e' ],
            template: '<p><strong class="event">** Join {ns}: "{e}" *</strong></p>',
            monitor: true
        },
        'part': {
            keys: [ 'ns', 'e', 'r' ],
            template: '<p><strong class="event">** Part {ns}: "{e}" * </strong><em>{r}</em></p>',
            monitor: true
        },
        'property': {
            keys: [ 'ns', 'p', 'by', 'ts', 'value' ],
            template: '<p><strong class="event">** Got {p} for {ns} *</strong></p>',
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
            template: '<p class="background"><strong class="event join">** {user} joined *</strong></p>',
        },
        'recv_part': {
            keys: [ 'user', 'r' ],
            template: '<p class="background"><strong class="event join">** {user} has left *</strong> {r}</p>'
        },
        'recv_privchg': {
            keys: [ 'user', 's', 'by', 'pc' ],
            template: '<p><strong class="event">** {user} has been made a member of {pc} by {by} *</strong></p>'
        },
        'recv_kicked': {
            keys: [ 'user', 's', 'by', 'r' ],
            template: '<p><strong class="event">** {user} has been kicked by {by} * </strong><em>{r}</em></p>'
        },
        'recv_admin_create': {
            keys: [ 'p', 'user', 'pc', 'privs' ],
            template: '<p><strong class="event">** Privilege class {pc} has been created by {user} * </strong><em>{privs}</em></p>'
        },
        'recv_admin_update': {
            keys: [ 'p', 'user', 'pc', 'privs' ],
            template: '<p><strong class="event">** Privilege class {pc} has been updated by {user} * </strong><em>{privs}</em></p>'
        },
        'recv_admin_rename': {
            keys: [ 'p', 'user', 'prev', 'pc' ],
            template: '<p><strong class="event">** Privilege class {prev} has been renamed to {pc} by {user} *</strong></p>'
        },
        'recv_admin_move': {
            keys: [ 'p', 'user', 'prev', 'pc', 'affected' ],
            template: '<p><strong class="event">** All members of {prev} have been moved to {pc} by {user} * </strong><em>{affected} affected user(s)</em></p>'
        },
        'recv_admin_remove': {
            keys: [ 'p', 'user', 'pc', 'affected' ],
            template: '<p><strong class="event">** Privilege class {pc} has been removed by {user} * </strong><em>{affected} affected user(s)</em></p>'
        },
        'recv_admin_show': null,
        'recv_admin_showverbose': null,
        'recv_admin_privclass': {
            keys: [ 'p', 'e', 'command' ],
            template: '<p><strong class="event">** Admin command "{command}" failed * </strong><em>{e}</em></p>'
        },
        'kicked': {
            keys: [ 'ns', 'user', 'r' ],
            template: '<p><strong class="event">** You have been kicked by {user} * </strong><em>{r}</em></p>'
        },
        'ping': null, //['<p><strong class="event">** Ping...</strong></p>', true],
        'disconnect': {
           keys: [ 'e' ],
           template: '<p><strong class="event">** You have been disconnected * </strong><em>{e}</em></p>',
           global: true
        },
        // Stuff here is errors, yes?
        'send': {
            keys: [ 'ns', 'e' ],
            template: '<p><strong class="event">** Send error: <em>{e}</em></p>'
        },
        'kick': {
            keys: [ 'ns', 'user', 'e' ],
            template: '<p><strong class="event">** Could not kick {user} * </strong><em>{e}</em></p>'
        },
        'get': {
            keys: [ 'ns', 'p', 'e' ],
            template: '<p><strong class="event">** Could not get {p} info for {ns} * </strong><em>{e}</em></p>'
        },
        'set': {
            keys: [ 'ns', 'p', 'e' ],
            template: '<p><strong class="event">** Could not set {p} * </strong><em>{e}</em></p>'
        },
        'kill': {
            keys: [ 'ns', 'e' ],
            template: '<p><strong class="event">** Kill error * </strong><em>{e}</em></p>'
        },
        'log': {
            keys: [ 'ns', 'msg', 'info' ],
            template: '<p><strong class="event">** {msg} * </strong><em>{info}</em></p>'
        },
        'unknown': {
            keys: [ 'ns', 'packet' ],
            template: '<p><strong class="event">** Received unknown packet in {ns} * </strong><em>{packet}</em></p>',
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
