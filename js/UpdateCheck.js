// Copyright 2002-2013, University of Colorado Boulder

/**
 * A singleton type/object for handling checking whether our simulation is up-to-date, or whether there is an
 * updated version. See https://github.com/phetsims/joist/issues/189
 *
 * It exposes its current state (for UIs to hook into), and a check() function used to start checking the version.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var packageString = require( 'text!REPOSITORY/package.json' );
  var SimVersion = require( 'JOIST/SimVersion' );

  // parse name/version out of the package.json
  var packageJSON = JSON.parse( packageString );
  var simName = packageJSON.name;
  var simVersion = SimVersion.parse( packageJSON.version, phet.chipper.buildTimestamp );

  // NOTE: singleton type!
  function UpdateCheck() {
    PropertySet.call( this, {
      /*
       * Descriptions of states:
       *
       * up-to-date: Simulation version is equal to or greater than the currently published version.
       * out-of-date: Simulation version is less than currently published version (or equal but has a suffix)
       * checking: Request to server sent out, has not processed reply yet.
       * offline: Last attempt to check failed, most likely offline
       * unchecked: No attempt as been made to check the version against the latest online.
       */
      state: 'unchecked', // @public {string}, one of 'up-to-date', 'out-of-date', 'checking', 'offline', 'unchecked'

      latestVersion: null // {SimVersion} will be filled in by check() if applicable
    } );

    this.ourVersion = simVersion; // {SimVersion}

    this.timeoutCallback = this.timeout.bind( this );
  }

  inherit( PropertySet, UpdateCheck, {
    // @public - Whether we actually allow checking for updates, or showing any update-related UIs.
    areUpdatesChecked: !window.together,

    // @public - The URL to be used for "New version available" clicks
    updateURL: 'http://phet.colorado.edu/html-sim-update' +
               '?simulation=' + encodeURIComponent( simName ) +
               '&version=' + encodeURIComponent( simVersion.toString() ) +
               '&buildTimestamp=' + encodeURIComponent( '' + phet.chipper.buildTimestamp ),

    // @private - Valid only if state === 'checking', the timeout ID of our timeout listener
    timeoutId: -1,

    // @private - How many ms before we time out (set to 'offline')
    timeoutMilliseconds: 15000,

    // @private - Clears our timeout listener.
    clearTimeout: function() {
      window.clearTimeout( this.timeoutId );
    },

    // @private - Sets our timeout listener.
    setTimeout: function() {
      this.timeoutId = window.setTimeout( this.timeoutCallback, this.timeoutMilliseconds );
    },

    // @public - If we are checking, it resets our timeout timer to timeoutMilliseconds
    resetTimeout: function() {
      if ( this.state === 'checking' ) {
        this.clearTimeout();
        this.setTimeout();
      }
    },

    // @private - What happens when we actually time out.
    timeout: function() {
      this.state = 'offline';
    },

    /**
     * @public - Kicks off the version checking request (if able), resulting in state changes.
     */
    check: function() {
      var self = this;

      if ( !this.areUpdatesChecked || ( self.state !== 'unchecked' && self.state !== 'offline' ) ) {
        return;
      }

      // If our sim's version indicates it hasn't been published, don't attempt to send a request for now
      if ( this.ourVersion.isSimNotPublished ) {
        self.state = 'up-to-date';
        return;
      }

      var req = new XMLHttpRequest();

      if ( 'withCredentials' in req ) {
        // we'll be able to send the proper type of request, so we mark ourself as checking
        self.state = 'checking';

        self.setTimeout();

        req.onload = function() {
          self.clearTimeout();

          try {
            var data = JSON.parse( req.responseText );

            // like "# wave-on-a-string 1.0.0 Thu Sep 18 2014 16:01:13 GMT-0600 (Mountain Daylight Time)"
            var comment = data.comment;
            assert && assert( comment.substring( 2, simName.length + 2 ) === simName,
              'Sim name mismatch for UpdateCheck: ' + simName + ' for ' + comment );

            // extract the version string
            var versionString = comment.substring( simName.length + 3 );
            versionString = versionString.substring( 0, versionString.indexOf( ' ' ) );

            var latestVersion = SimVersion.parse( versionString );
            self.latestVersion = latestVersion;

            // Check to see if our version is definitively before the latest version, assuming version+suffix is
            // before a version without a suffix.
            var comparison = self.ourVersion.compare( latestVersion );
            if ( comparison === -1 || ( comparison === 0 && self.ourVersion.suffix ) ) {
              self.state = 'out-of-date';
            }
            else {
              self.state = 'up-to-date';
            }
          }
          catch ( e ) {
            self.state = 'offline';
          }
        };
        req.onerror = function() {
          self.clearTimeout();

          self.state = 'offline';
        };
        req.open( 'get', 'http://phet.colorado.edu/sims/html/' + simName + '/latest/dependencies.json', true ); // enable CORS
        req.send();
      }
    }
  } );

  return new UpdateCheck();
} );