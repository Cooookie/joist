/**
 * This fort model implementation tracks the location of the pointer(s), if any, so they can be visualized during playback.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  "use strict";

  var Fort = require( 'FORT/Fort' );
  var Pointer = require( 'JOIST/share/Pointer' );

  var PointerModel = Fort.Collection.extend( {model: Pointer} );
  return PointerModel;
} );