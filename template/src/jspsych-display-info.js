/*************************************************************
 * jspsych-display-info.js
 *
 * A jsPsych plugin that displays information, such as
 * instructions or break pages.
 *
 * Last modified: January 28, 2017
 *
 * © Copyright 2017 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

var instructionsTemplate = require("../templates/instructions.html");
// var preTrialBreakTemplate = require("../templates/preTrialBreak.html");
// var midTrialBreakOneTemplate = require("../templates/midTrialBreakOne.html");
// var midTrialBreakTwoTemplate = require("../templates/midTrialBreakTwo.html");
// var midTrialBreakThreeTemplate = require("../templates/midTrialBreakThree.html");

module.exports = jsPsych.plugins["display-info"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    if (trial.name === "instructions") {
      $("#instructions").html(instructionsTemplate({
        content: trial.content,
        withTouch: trial.withTouch
      }));

      LITW.utils.showNextButton(function() {
        display_element.empty();
        jsPsych.finishTrial();
      });

      LITW.utils.showSlide("instructions");
    // } else if (trial.name === "preTrialBreak") {
    //   $("#break").html(preTrialBreakTemplate({
    //     content: trial.content,
    //     withTouch: trial.withTouch
    //   }));
    //
    //   LITW.utils.showSlide("break");
    //   LITW.utils.showNextButton(function() {
    //     display_element.empty();
    //     jsPsych.finishTrial();
    //   });

    } else if (trial.name === "midTrialBreakOne") {
      // $("#breakOne").html(midTrialBreakOneTemplate(trial.content));
      // LITW.utils.showSlide("breakOne");
      // LITW.utils.showNextButton(function() {
      //   display_element.empty();
      //   jsPsych.finishTrial();
      // });
    } 
    else if (trial.name === "midTrialBreakTwo") {
      // $("#breakTwo").html(midTrialBreakTwoTemplate(trial.content));
      // LITW.utils.showSlide("breakTwo");
      // LITW.utils.showNextButton(function() {
      //   display_element.empty();
      //   jsPsych.finishTrial();
      // });
    }
    else if (trial.name === "midTrialBreakThree") {
      // $("#breakThree").html(midTrialBreakThreeTemplate(trial.content));
      // LITW.utils.showSlide("breakThree");
      // LITW.utils.showNextButton(function() {
      //   display_element.empty();
      //   jsPsych.finishTrial();
      // });
    }
  };

  return plugin;

})();
