

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

    this.manager.view.append('<div class="control"><input type="text" class="msg"></input></div>');
    this.view = this.manager.view.find('div.control');
    this.input = this.view.find('input');
    this.input.width(this.view.width() - 20);

};

