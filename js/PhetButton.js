// Copyright 2013-2015, University of Colorado Boulder

/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AdaptedFromText = require( 'JOIST/AdaptedFromText' );
  var Brand = require( 'BRAND/Brand' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Property = require( 'AXON/Property' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var TransformTracker = require( 'SCENERY/util/TransformTracker' );
  var joist = require( 'JOIST/joist' );

  // images
  // The logo images are loaded from the brand which is selected via query parameter (during requirejs mode)
  // or a grunt option (during the build), please see initialize-globals.js window.phet.chipper.brand for more
  // details
  var brightLogoMipmap = require( 'mipmap!BRAND/logo.png' ); // on a black navbar
  var darkLogoMipmap = require( 'mipmap!BRAND/logo-on-white.png' ); // on a white navbar

  // strings
  var phetButtonNameString = require( 'string!JOIST/PhetButton.name' );

  // Accommodate logos of any height by scaling them down proportionately.
  // The primary logo is 108px high and we have been scaling it at 0.28 to make it look good even on higher resolution
  // displays.  The following math scales up the logo to 108px high so the rest of the layout code will work smoothly
  // Scale to the same height as the PhET logo, so that layout code works correctly.
  var PHET_LOGO_HEIGHT = 108;  // height of the PhET logo, brand/phet/images/logo.png
  var PHET_LOGO_SCALE = 0.28;  // scale applied to the PhET logo
  assert && assert( brightLogoMipmap instanceof Array, 'logo must be a mipmap' );
  var LOGO_SCALE = PHET_LOGO_SCALE / brightLogoMipmap[ 0 ].height * PHET_LOGO_HEIGHT;

  /**
   * @param {Sim} sim
   * @param {Property.<Color|string>} backgroundFillProperty
   * @param {Property.<Color|string>} textFillProperty
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function PhetButton( sim, backgroundFillProperty, textFillProperty, options ) {

    options = _.extend( {
      textDescription: 'PhET Menu Button',
      highlightExtensionWidth: 6,
      highlightExtensionHeight: 5,
      highlightCenterOffsetY: 4,
      tandem: null,
      listener: function() {

        var phetMenu = new PhetMenu( sim, {
          showSaveAndLoad: sim.options.showSaveAndLoad,
          tandem: options.tandem && options.tandem.createTandem( 'phetMenu' ),
          closeCallback: function() {
            // hides the popup and barrier background
            sim.hidePopup( phetMenu, true );
            phetMenu.dispose();
          }
        } );

        /**
         * Sim.js handles scaling the popup menu.  This code sets the position of the popup menu.
         * @param {Bounds2} bounds - the size of the window.innerWidth and window.innerHeight, which depends on the scale
         * @param {Bounds2} screenBounds - subtracts off the size of the navbar from the height
         * @param {number} scale - the overall scaling factor for elements in the view
         */
        function onResize( bounds, screenBounds, scale ) {
          phetMenu.right = bounds.right / scale - 2 / scale;
          var navBarHeight = bounds.height - screenBounds.height;
          phetMenu.bottom = screenBounds.bottom / scale + navBarHeight / 2 / scale;
        }

        sim.on( 'resized', onResize );
        onResize( sim.bounds, sim.screenBounds, sim.scale );

        phetMenu.show();
      }
    }, options );

    // The PhET Label, which is the PhET logo
    var logoImage = new Image( brightLogoMipmap, {
      scale: LOGO_SCALE,
      pickable: false
    } );

    var optionsButton = new FontAwesomeNode( 'reorder', {
      scale: 0.6,
      left: logoImage.width + 10,
      bottom: logoImage.bottom - 1.5,
      pickable: false
    } );

    // The icon combines the PhET label and the thre horizontal bars in the right relative positions
    var icon = new Node( { children: [ logoImage, optionsButton ] } );

    JoistButton.call( this, icon, backgroundFillProperty, options );

    // If this is an "adapted from PhET" brand, decorate the PhET button with "adapted from" text.
    if ( Brand.id === 'adapted-from-phet' ) {
      this.addChild( new AdaptedFromText( textFillProperty, {
        pickable: false,
        right: icon.left - 10,
        centerY: icon.centerY
      } ) );
    }

    Property.multilink( [ backgroundFillProperty, sim.showHomeScreenProperty, UpdateCheck.stateProperty ],
      function( backgroundFill, showHomeScreen, updateState ) {
        var backgroundIsWhite = backgroundFill !== 'black' && !showHomeScreen;
        var outOfDate = updateState === 'out-of-date';
        optionsButton.fill = backgroundIsWhite ? ( outOfDate ? '#0a0' : '#222' ) : ( outOfDate ? '#3F3' : 'white' );
        logoImage.image = backgroundIsWhite ? darkLogoMipmap : brightLogoMipmap;
      } );
  }

  joist.register( 'PhetButton', PhetButton );

  inherit( JoistButton, PhetButton, {}, {
      // @public - How much space between the PhetButton and the right side of the screen.
      HORIZONTAL_INSET: 5,

      // @ public - How much space between the PhetButton and the bottom of the screen
      VERTICAL_INSET: 0,

      /**
       * Ensures that the home-screen's phet button will have the same global transform as the navbar's phet button.
       * Listens to both sides (the navbar button, and the home-screen's button's parent) so that when either changes,
       * the transforms are synchronized by changing the home-screen's button position.
       * See https://github.com/phetsims/joist/issues/304.
       * @public (joist-internal)
       *
       * @param {HomeScreenView} homeScreen - The home screen view, where we will position the phet button.
       * @param {NavigationBar} navigationBar - The main navigation bar
       * @param {Node} rootNode - The root of the Display's node tree
       */
      linkPhetButtonTransform: function( homeScreen, navigationBar, rootNode ) {
        var homeScreenButton = homeScreen.view.phetButton;

        var navBarButtonTracker = new TransformTracker( navigationBar.phetButton.getUniqueTrailTo( rootNode ), {
          isStatic: true // our listener won't change any listeners - TODO: replace with emitter?
        } );
        var homeScreenTracker = new TransformTracker( homeScreenButton.getParent().getUniqueTrailTo( rootNode ), {
          isStatic: true // our listener won't change any listeners - TODO: replace with emitter?
        } );
        function transformPhetButton() {
          // Ensure transform equality: navBarButton(global) = homeScreen(global) * homeScreenButton(self)
          homeScreenButton.matrix = homeScreenTracker.matrix.inverted().timesMatrix( navBarButtonTracker.matrix );
        }

        // hook up listeners
        navBarButtonTracker.addListener( transformPhetButton );
        homeScreenTracker.addListener( transformPhetButton );

        // synchronize immediately, in case there are no more transform changes before display
        transformPhetButton();
      }
    }
  );

  /**
   * An accessible peer for creating a check box element in the Parallel DOM.
   * See https://github.com/phetsims/scenery/issues/461
   *
   * @param {AccessibleInstance} accessibleInstance
   * @param {function} listener - listener function fired by this checkbox
   * @public (accessibility)
   */
  function PhetButtonAccessiblePeer( accessibleInstance, listener ) {
    this.initialize( accessibleInstance, listener );
  }

  inherit( AccessiblePeer, PhetButtonAccessiblePeer, {

    /**
     * Create the dom element and its attributes for an accessible PhETButton in the parallel DOM.
     *
     * @param {AccessibleInstance} accessibleInstance
     * @param {function} listener - listener function fired by this checkbox
     * @param {string} ion - invisible string description provided to accessible technologies
     * @public (accessibility)
     */
    initialize: function( accessibleInstance, listener ) {
      // will look like <input id="phetButtonId" value="Phet Button" type="button">

      this.domElement = document.createElement( 'input' ); // @private
      this.domElement.type = 'button';
      this.domElement.value = phetButtonNameString;
      this.domElement.tabIndex = '0';
      this.domElement.className = 'PhetButton';

      this.initializeAccessiblePeer( accessibleInstance, this.domElement );
      this.domElement.addEventListener( 'click', function() {
        // use hidden on all screenView elements and this button to quickly pull out of the navigation order
        this.hidden = true;
        var screenViewElements = document.getElementsByClassName( 'screenView' );
        _.each( screenViewElements, function( element ) {
          element.hidden = true;
        } );

        // fire the listener, instantiating all menu items.
        listener();

        // set focus to the first element item.
        document.getElementsByClassName( 'phetMenuItem' )[ 0 ].focus();
      } );
    },

    /**
     * Dispose function for the accessible check box.
     * @public (accessibility)
     */
    dispose: function() {
      // TODO
    }

  } );

  return PhetButton;
} );