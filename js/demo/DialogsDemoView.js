// Copyright 2015, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Dialog = require( 'JOIST/Dialog' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var joist = require( 'JOIST/joist' );

  // constants
  var BUTTON_FONT = new PhetFont( { size: 20 } );

  /**
   * @constructor
   */
  function DialogsDemoView() {

    ScreenView.call( this );

    var modalDialogButton = new RectangularPushButton( {
      content: new Text( 'modal dialog', { font: BUTTON_FONT } ),
      listener: function() {
        createDialog( true ).show();
      },
      left: this.layoutBounds.left + 100,
      top: this.layoutBounds.top + 100
    } );
    this.addChild( modalDialogButton );

    var nonModalDialogButton = new RectangularPushButton( {
      content: new Text( 'non-modal dialog', { font: BUTTON_FONT } ),
      listener: function() {
        createDialog( false ).show();
      },
      left: modalDialogButton.right + 20,
      top: modalDialogButton.top
    } );
    this.addChild( nonModalDialogButton );
  }

  joist.register( 'DialogsDemoView', DialogsDemoView );

  /**
   * Creates a model or non-modal dialog
   * @param {boolean} modal
   * @returns {Dialog}
   */
  var createDialog = function( modal ) {
    var contentNode = new Text( modal ? 'modal dialog' : 'non-modal dialog', {
      font: new PhetFont( 20 )
    } );
    return new Dialog( contentNode, {
      modal: modal,
      hasCloseButton: !modal
    } );
  };

  return inherit( ScreenView, DialogsDemoView );
} );
