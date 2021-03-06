// Copyright 2014-2015, University of Colorado Boulder

/**
 * This minimalistic profiler is meant to help understand the time spent in running a PhET simulation.
 * It was designed to be minimally invasive, so it won't alter the simulation's performance significantly.
 * Note: just showing the average FPS or ms/frame is not sufficient, since we need to see when garbage collections
 * happen, which are typically a spike in a single frame.  Hence, the data is shown as a histogram.  After the first
 * 30ms slots, there is a ++= showing the times of longer frames (in ms)
 *
 * TODO: Could take further steps to helping identify the time spent in render vs input handling vs model, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );

  /**
   * Construct a Profiler
   * @constructor
   */
  function Profiler() {

    // These data structured were chosen to minimize CPU time.
    // TODO: Now that profiler is buried under a query parameter, we could use more sensible/flexible data structures
    // here.
    this.histogram = []; // @private
    this.longTimes = []; // @private
    this.allTimes = [];  // @private
    this.frameCount = 0; // @private
    for ( var i = 0; i < 30; i++ ) {
      this.histogram.push( 0 );
    }
    $( 'body' ).append( '<div style="z-index: 99999999;position: absolute;color:red" id="trace" ></div>' );
  }

  joist.register( 'Profiler', Profiler );

  return inherit( Object, Profiler, {

    // @private
    frameStarted: function() {
      this.frameStartTime = Date.now();
      this.frameCount++;
    },

    // @private
    frameEnded: function() {

      var timeBetweenFrames = this.frameStartTime - this.lastFrameStartTime;
      if ( this.frameCount % 60 === 0 ) {
        var totalTime = 0;
        for ( var i = 0; i < this.allTimes.length; i++ ) {
          totalTime += this.allTimes[ i ];
        }
        var averageFrameTime = Math.round( totalTime / this.allTimes.length );
        var averageFPS = Math.round( 1000 / (totalTime / this.allTimes.length) );

        var text = '' + averageFPS + ' FPS, ' + averageFrameTime + 'ms/frame, ';
        text = text + this.histogram;
        if ( this.longTimes.length ) {
          text = text + ', +++ = ' + this.longTimes;
        }
        $( '#trace' ).html( text );
        for ( i = 0; i < 30; i++ ) {
          this.histogram[ i ] = 0;
        }
        this.longTimes.length = 0;
        this.allTimes.length = 0;
      }
      else {
        var key = timeBetweenFrames;
        if ( key < 30 ) {
          this.histogram[ key ]++;
        }
        else {
          this.longTimes.push( key );
        }
        this.allTimes.push( key );
      }
      this.lastFrameStartTime = this.frameStartTime;
    }
  }, {

    // @public
    start: function( sim ) {
      var profiler = new Profiler();
      sim.on( 'frameStarted', function() {
        profiler.frameStarted();
      } );
      sim.on( 'frameCompleted', function() {
        profiler.frameEnded();
      } );
    }
  } );
} );