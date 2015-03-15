//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Together.js provides an API for accessing the simulation for enhanced features.  This file defines common data types
 * that appear in the simulation-specific files.
 *
 * I wasn't sure whether this file belonged in (a) chipper, (b) joist, (c) a new together-api repo, or (d) the together repo.
 * or (e) within the repo where each thing is defined (Color in scenery, Vector2 in dot, etc).  Or (f) one togetherAPI file
 * per repo???  (d) seemed contraindicated since it is under different licensing, but it would be advantageous to develop
 * each sim API with the sim itself, so it needs to have appropriate licensing.
 * Keeping it all consolidated seems like that would make it very easy to identify API changes.
 * Putting it in joist means we don't need to change any sim config files, since everyting imports Joist.
 * Let's discuss it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var Node = {
    name: 'Node',
    visible: {
      type: 'boolean'
    },

    // Just for demonstration purposes, we may not really want these in the public API
    left: {
      type: 'number'
    },
    right: {
      type: 'number'
    },
    top: {
      type: 'number'
    },
    bottom: {
      type: 'number'
    },
    rotation: {
      type: 'number'
    }
  };

  var Button = {
    name: 'Button',
    parent: Node
  };

  var ResetAllButton = {
    name: 'ResetAllButton',
    parent: Button
  };

  var Faucet = {
    name: 'Faucet',
    parent: Node
  };

  var ComboBox = {
    name: 'ComboBox',
    parent: Node // not exactly a button, see implementation
  };

  var ComboBoxListItem = {
    name: 'ComboBoxButton',
    parent: Button // Also a special case
  };

  var RadioButton = {
    name: 'RadioButton',
    parent: Button
  };

  var Boolean = {
    name: 'boolean'
  };

  var Color = {
    name: 'Color'
  };

  // TODO: I would like this to be capitalized since it is a type, but jshint complains
  // TODO: and I'd prefer not to use new().  Perhaps a JSHint ignore?
  /**
   * Parameterized type for Properties
   * @param type
   * @returns {{name: string, value: {type: *}}}
   * @constructor
   */
  var property = function( type ) {
    return {
      name: 'Property',
      value: {
        type: type
      }
    };
  };

  var Sim = {
    name: 'Sim'
  };

  var Vector2 = {
    name: 'Vector2'
  };

  var Slider = {
    name: 'Slider',
    parent: Node
  };

  var PhetButton = {
    name: 'PhetButton',
    parent: Button
  };

  var MenuItem = {
    name: 'MenuItem',
    parent: Button
  };

  return {
    Node: Node,
    ResetAllButton: ResetAllButton,
    Button: Button,
    Faucet: Faucet,
    property: property,
    ComboBox: ComboBox,
    ComboBoxListItem: ComboBoxListItem,
    RadioButton: RadioButton,
    Boolean: Boolean,
    Color: Color,
    Sim: Sim,
    Vector2: Vector2,
    Slider: Slider,
    PhetButton: PhetButton,
    MenuItem: MenuItem
  };
} );