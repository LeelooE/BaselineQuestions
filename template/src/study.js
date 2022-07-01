/*************************************************************
* test.js
*
* Main experiment file for the LITW Wikipedia Images study.
*
* Author: Maria Tracy
* Template code authors: Trevor Croxson & Nigini A. Oliveira
*
* Last Modified: August 13, 2020
*
* © Copyright 2020 LabintheWild.
* For questions about this file and permission to use
* the code, contact us at info@labinthewild.org
*************************************************************/

// load webpack modules
window.$ = window.jQuery = require("jquery");
require("bootstrap");
require("jquery-ui-bundle");
var LITW_STUDY_CONTENT = require("./data");
var Handlebars = require('handlebars/runtime')['default'];
var irbTemplate = require("../templates/irb.html");
var knowledgeQTemplate = require("../templates/knowledgeQ.html");
var nonVisualQuestionTemplate = require("../templates/nonVisualQuestion.html")
var visualQuestionTemplate = require("../templates/visualQuestion.html")
var imageQuestionTemplate = require("../templates/imageQuestion.html")
var finalResultsTemplate = require("../templates/resultScore.html")
var loadingTemplate = require("../templates/loading.html");
var progressTemplate = require("../templates/progress.html");
var prolificTemplate = require("../templates/prolificId.html");
var i18n = require("../js/i18n");
require("./jspsych-display-info");
require("./jspsych-display-slide");

module.exports = (function() {

  Handlebars.registerHelper('if_eq', function(a, b, opts) {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
  });

  window.litwWithTouch = false;

  var timeline = [],
  self = this,
  C,
  params = {
    wikiArticleSamples: [],
    questions: [],
    currentProgress: 0
  },

  // Show Informed Consent Form
  irb = function() {
    LITW.tracking.recordCheckpoint("irb");
    $("#irb").html(irbTemplate());
    $("#irb").i18n();
    LITW.utils.showSlide("irb");
    $("#agree-to-study").on("click", function() {
      if ($(this).prop("checked")) {
        LITW.utils.showNextButton(startTrials);
        $("#approve-irb").hide();
      } else {
        LITW.utils.hideNextButton();
        $("#approve-irb").show();
      }
      var sBrowser = null

      // collection user information
      var sUsrAg = navigator.userAgent;

      if (sUsrAg.indexOf("Firefox") > -1) {
        sBrowser = "Mozilla Firefox";
        // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
      } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
        sBrowser = "Opera";
        //"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
      } else if (sUsrAg.indexOf("Trident") > -1) {
        sBrowser = "Microsoft Internet Explorer";
        // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
      } else if (sUsrAg.indexOf("Edge") > -1) {
        sBrowser = "Microsoft Edge";
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
      } else if (sUsrAg.indexOf("Chrome") > -1) {
        sBrowser = "Google Chrome or Chromium";
        // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
      } else if (sUsrAg.indexOf("Safari") > -1) {
        sBrowser = "Apple Safari";
        // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
      } else {
        sBrowser = "unknown";
      }
      //that is what we want to submit! - try to separate device/browser
      var start = new Date().getTime()
      jsPsych.data.addProperties({studyStartTime: start});
      jsPsych.data.addProperties({userBrowser: sBrowser});
      jsPsych.data.addProperties({userDeviceSm: navigator.userAgent.substr(navigator.userAgent.indexOf('('), navigator.userAgent.indexOf(';'))});
      jsPsych.data.addProperties({mobile: /Mobi|Android/i.test(navigator.userAgent)});
      jsPsych.data.addProperties({prevPID: LITW.data.getURLparams()});
      uuid = LITW.data.getParticipantId();
      prevPID = LITW.data.getURLparams()["LITW_PID"]
      LITW.data.submitStudyData({
        irbComplete: true,
        studyStartTime: start,
        userBrowser: sBrowser,
        userDeviceSm: navigator.userAgent.substr(navigator.userAgent.indexOf('('), navigator.userAgent.indexOf(';')),
        mobile: /Mobi|Android/i.test(navigator.userAgent),
        prevPID: prevPID,
        uuid: uuid
      });
    });
  },

  // Show Demographics Questionnaire
  demographics = function() {
    LITW.tracking.recordCheckpoint("demographics");
    LITW.forms.newForm("demographics", {
      autocomplete: true
    })
    .add("retake", {
      required: true
    })
    .add("country")
    .add("language")
    .add("proficiency")
    .add("age", {
      style: "numericalFreeText",
      prompt: "How old are you? (Please type a number)",
      boundsMessage: "Are you really %s years old? If not, please make sure to enter the correct age so that your data contributes to our research.",
      minValue: 6,
      maxValue: 99
    })
    .add("gender")
    .add("education")
    .render(comments)

    LITW.utils.showSlide("demographics");
    $(".last_button").css("visibility", "visible")
  },

  initJsPsych = function() {
    // ******* BEGIN STUDY PROGRESSION ******** //

    // A few articles for results page
    
    // shuffle the given articles
    wikiArticles = LITW.utils.shuffleArrays(params.wikiArticleSamples);
    titles = params.summary.titles;
    index0 = 0;
    index1 = 1;
    if(titles.length > 0){
      while(true && index1 < 94){
        if(titles.includes(wikiArticles[index1][1].pageTitle)){
          index1 = index1 + 1;
        } else {
          break;
        }
      }
      while(true && index0 < 93){
        if(titles.includes(wikiArticles[index0][1].pageTitle)){
          index0 = index0 + 1;
        }else {
          break;
        }
      }
    }
    // grab the article
    var article0 = wikiArticles[index0][1];
    var article1 = wikiArticles[index1][1];
    
    // get the page titles for all three articles
    var pageTitle0 = article0.pageTitle;
    var pageTitle1 = article1.pageTitle;

    // get the question objects for all three articles
    var qs0 = null;
    var qs1 = null;
    for (var j = 0; j < params.questions.length; j++){
      var arr = params.questions[j][1]
      if (arr.pageTitle == pageTitle0) {
        qs0 = arr
      } else if (arr.pageTitle == pageTitle1) {
        qs1 = arr
      }
    }

    // getting all the possible answers for each question type 
    // and combining them together in one array

    var distractorsNonVisualDraft01 = qs0["distractors" + '1'].split(", ")
    distractorsNonVisualDraft01.push(qs0["answer" + '1']);
    var distractorsNonVisualDraft02 = qs0["distractors" + '2'].split(", ");
    distractorsNonVisualDraft02.push(qs0["answer" + '2']);

    var distractorsVisualDraft03 = qs0["distractors" + '3'].split(", ");
    distractorsVisualDraft03.push(qs0["answer" + '3']);
    var distractorsVisualDraft04 = qs0["distractors" + '4'].split(", ");
    distractorsVisualDraft04.push(qs0["answer" + '4']);

    var distractorsNonVisualDraft11 = qs1["distractors" + '1'].split(", ")
    distractorsNonVisualDraft11.push(qs1["answer" + '1']);
    var distractorsNonVisualDraft12 = qs1["distractors" + '2'].split(", ");
    distractorsNonVisualDraft12.push(qs1["answer" + '2']);

    var distractorsVisualDraft13 = qs1["distractors" + '3'].split(", ");
    distractorsVisualDraft13.push(qs1["answer" + '3']);
    var distractorsVisualDraft14 = qs1["distractors" + '4'].split(", ");
    distractorsVisualDraft14.push(qs1["answer" + '4']);


    var distractorsImageDraft0 = [qs0.imageDistractor1, qs0.imageDistractor2, qs0.imageDistractor3, qs0.imageAnswerURL]
    var distractorsImageDraft1 = [qs1.imageDistractor1, qs1.imageDistractor2, qs1.imageDistractor3, qs1.imageAnswerURL]


    var mainImageWidth0 = '230px';
    var mainImageWidth1 = '230px';
    for (var h = 0; h < params.widths.length; h++){
      var key = Object.entries(params.widths[h][1])[0][0]
      var value = Object.entries(params.widths[h][1])[0][1]
      if (key == pageTitle0) {
        mainImageWidth0 = value + 'px'
      } else if (key == pageTitle1) {
        mainImageWidth1 = value + 'px'
      }
    }


    // randomizing the question answers
    function shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i].trim();
          a[i] = a[j].trim();
          a[j] = x;
      }
      return a;
  }
  var distractorsNonVisual01 = shuffle(distractorsNonVisualDraft01)
  var distractorsNonVisual02 = shuffle(distractorsNonVisualDraft02)
  var distractorsVisual03 = shuffle(distractorsVisualDraft03)
  var distractorsVisual04 = shuffle(distractorsVisualDraft04)
  var distractorsImage0 = shuffle(distractorsImageDraft0)

  var distractorsNonVisual11 = shuffle(distractorsNonVisualDraft11)
  var distractorsNonVisual12 = shuffle(distractorsNonVisualDraft12)
  var distractorsVisual13 = shuffle(distractorsVisualDraft13)
  var distractorsVisual14 = shuffle(distractorsVisualDraft14)
  var distractorsImage1 = shuffle(distractorsImageDraft1)
  
  // getting the index of the right answer for each question for later use
  var nonVisualAnswerTitle01 = qs0["answer" + '1'].trim()
  var actualIndexNonVisual01 = distractorsNonVisual01.indexOf(nonVisualAnswerTitle01)
  var nonVisualAnswer01 = distractorsNonVisual01[actualIndexNonVisual01]

  var nonVisualAnswerTitle02 = qs0["answer" + '2'].trim()
  var actualIndexNonVisual02 = distractorsNonVisual02.indexOf(nonVisualAnswerTitle02)
  var nonVisualAnswer02 = distractorsNonVisual02[actualIndexNonVisual02]


  var visualAnswerTitle03 = qs0["answer" + '3'].trim()
  var actualIndexVisual03 = distractorsVisual03.indexOf(visualAnswerTitle03)
  var visualAnswer03 = distractorsVisual03[actualIndexVisual03]

  var visualAnswerTitle04 = qs0["answer" + '4'].trim()
  var actualIndexVisual04 = distractorsVisual04.indexOf(visualAnswerTitle04)
  var visualAnswer04 = distractorsVisual04[actualIndexVisual04]

  var nonVisualAnswerTitle11 = qs1["answer" + '1'].trim()
  var actualIndexNonVisual11 = distractorsNonVisual11.indexOf(nonVisualAnswerTitle11)
  var nonVisualAnswer11 = distractorsNonVisual11[actualIndexNonVisual11]

  var nonVisualAnswerTitle12 = qs1["answer" + '2'].trim()
  var actualIndexNonVisual12 = distractorsNonVisual12.indexOf(nonVisualAnswerTitle12)
  var nonVisualAnswer12 = distractorsNonVisual12[actualIndexNonVisual12]


  var visualAnswerTitle13 = qs1["answer" + '3'].trim()
  var actualIndexVisual13 = distractorsVisual13.indexOf(visualAnswerTitle13)
  var visualAnswer13 = distractorsVisual13[actualIndexVisual13]

  var visualAnswerTitle14 = qs1["answer" + '4'].trim()
  var actualIndexVisual14 = distractorsVisual14.indexOf(visualAnswerTitle14)
  var visualAnswer14 = distractorsVisual14[actualIndexVisual14]

  timeline.push({
    type: "display-slide",
    display_element: $("#prolific"),
    name: "prolific",
    template: prolificTemplate({
      pageTitle: article1.pageTitle
    }),
    finish: function() {
      jsPsych.data.addProperties({prolificID: $("input[name=prolificID]").val()});
      LITW.data.submitStudyData({
        prolificID: $("input[name=prolificID]").val(),
      });
      console.log($("input[name=prolificID]").val());
    }
  });

  // progress counter 1
  timeline.push({
    type: "call-function",
    func: function() {
      $("#progress-header").html(progressTemplate({
        msg: C.progressMsg,
        progress: ++params.currentProgress,
        total: 11
      }))
      .show();
      LITW.utils.showSlide("trials");
    }
  });

    // BASELINE QUESTION

    // Knowledge of article

    timeline.push({
      type: "display-slide",
      display_element: $("#knowledgeQ"),
      name: "knowledgeQuestion",
      template: knowledgeQTemplate({pageTitle: article0.pageTitle}),
      finish: function() {
        jsPsych.data.addProperties({answersNonVisual1: nonVisualAnswer01});
        jsPsych.data.addProperties({answersNonVisual2: nonVisualAnswer02});
        jsPsych.data.addProperties({answersVisual3: visualAnswer03});
        jsPsych.data.addProperties({answersVisual4: visualAnswer04});
        jsPsych.data.addProperties({answersImage: qs0.imageAnswerURL});
        jsPsych.data.addProperties({knowledgeOfArticle: $("input[name=knowledge]:checked").val()});
        jsPsych.data.addProperties({titleOfArticle: article0.pageTitle});
        jsPsych.data.addProperties({titlesSeen: titles});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({knowledgeOfArticleTime: currentTime});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          knowledgeOfArticle0Time: currentTime, 
          knowledgeofArticle0Complete: true,
          answersNonVisual01: nonVisualAnswer01,
          answersNonVisual02: nonVisualAnswer02,
          answersVisual03: visualAnswer03,
          answersVisual04: visualAnswer04,
          answersImage: qs0.imageAnswerURL,
          knowledgeOfArticle0: $("input[name=knowledge]:checked").val(),
          titleOfArticle0: article0.pageTitle,
          uuid: uuid,
          titlesSeen: titles
        });
      }
    });

    // progress counter 3
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    //) NonVisual Question

    timeline.push({
      type: "display-slide",
      display_element: $("#nonVisualQuestion"),
      name: "nonVisualQuestion",
      template: nonVisualQuestionTemplate({
        pageTitle: qs0.pageTitle,
        nonVisualQ: qs0["question" + '1'],
        nonVisual1: distractorsNonVisual01[0],
        nonVisual2: distractorsNonVisual01[1],
        nonVisual3: distractorsNonVisual01[2],
        nonVisual4: distractorsNonVisual01[3],
        rightAnswer: actualIndexNonVisual01
      }),
      finish: function() {
        jsPsych.data.addProperties({nonVisualQuestion01: qs0["question" +'1']});
        jsPsych.data.addProperties({nonVisualQuestion01Responce: distractorsNonVisual01[parseInt($("input[name=nonVisual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({nonVisualQuestion01FinishTime: currentTime});
        var testScore = 0
        if (distractorsNonVisual01[parseInt($("input[name=nonVisual]:checked").val()) - 1] == qs0["answer" + '1']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({nonVisualQuestion01Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          nonVisualQuestion01Complete: true, 
          nonVisualQuestion01: qs0["question" + '1'],
          nonVisualQuestion01Responce: distractorsNonVisual01[parseInt($("input[name=nonVisual]:checked").val()) - 1],
          nonVisualQuestion01FinishTime: currentTime,
          nonVisualQuestion01Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 5
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

     //) NonVisual Question

     timeline.push({
      type: "display-slide",
      display_element: $("#nonVisualQuestion"),
      name: "nonVisualQuestion",
      template: nonVisualQuestionTemplate({
        pageTitle: qs0.pageTitle,
        nonVisualQ: qs0["question" + '2'],
        nonVisual1: distractorsNonVisual02[0],
        nonVisual2: distractorsNonVisual02[1],
        nonVisual3: distractorsNonVisual02[2],
        nonVisual4: distractorsNonVisual02[3],
        rightAnswer: actualIndexNonVisual02
      }),
      finish: function() {
        jsPsych.data.addProperties({nonVisualQuestion02: qs0["question" +'2']});
        jsPsych.data.addProperties({nonVisualQuestion02Responce: distractorsNonVisual02[parseInt($("input[name=nonVisual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({nonVisualQuestion02FinishTime: currentTime});
        var testScore = 0
        if (distractorsNonVisual02[parseInt($("input[name=nonVisual]:checked").val()) - 1] == qs0["answer" + '2']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({nonVisualQuestion02Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          nonVisualQuestion02Complete: true, 
          nonVisualQuestion02: qs0["question" + '2'],
          nonVisualQuestion02Responce: distractorsNonVisual02[parseInt($("input[name=nonVisual]:checked").val()) - 1],
          nonVisualQuestion02FinishTime: currentTime,
          nonVisualQuestion02Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 5
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    //Visual Question

    timeline.push({
      type: "display-slide",
      display_element: $("#visualQuestion"),
      name: "visualQuestion",
      template: visualQuestionTemplate({
        pageTitle: qs0.pageTitle,
        visualQ: qs0["question" + '3'] ,
        visual1: distractorsVisual03[0],
        visual2: distractorsVisual03[1],
        visual3: distractorsVisual03[2],
        visual4: distractorsVisual03[3],
        rightAnswer: actualIndexVisual03
      }),
      finish: function() {
        jsPsych.data.addProperties({visualQuestion03: qs0["question" + '3']});
        jsPsych.data.addProperties({visualQuestion03Responce: distractorsVisual03[parseInt($("input[name=visual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({visualQuestion03FinishTime: currentTime});
        var testScore = 0
        if (distractorsVisual03[parseInt($("input[name=visual]:checked").val()) - 1] == qs0["answer" + '3']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({visualQuestion03Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          visualQuestion03Complete: true, 
          visualQuestion03: qs0["question" + '3'],
          visualQuestion03Responce: distractorsVisual03[parseInt($("input[name=visual]:checked").val()) - 1],
          visualQuestion03FinishTime: currentTime,
          visualQuestion03Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 6
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    //Visual Question

    timeline.push({
      type: "display-slide",
      display_element: $("#visualQuestion"),
      name: "visualQuestion",
      template: visualQuestionTemplate({
        pageTitle: qs0.pageTitle,
        visualQ: qs0["question" + '4'] ,
        visual1: distractorsVisual04[0],
        visual2: distractorsVisual04[1],
        visual3: distractorsVisual04[2],
        visual4: distractorsVisual04[3],
        rightAnswer: actualIndexVisual04
      }),
      finish: function() {
        jsPsych.data.addProperties({visualQuestion04: qs0["question" + '4']});
        jsPsych.data.addProperties({visualQuestion04Responce: distractorsVisual04[parseInt($("input[name=visual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({visualQuestion04FinishTime: currentTime});
        var testScore = 0
        if (distractorsVisual04[parseInt($("input[name=visual]:checked").val()) - 1] == qs0["answer" + '4']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({visualQuestion04Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          visualQuestion04Complete: true, 
          visualQuestion04: qs0["question" + '4'],
          visualQuestion04Responce: distractorsVisual04[parseInt($("input[name=visual]:checked").val()) - 1],
          visualQuestion04FinishTime: currentTime,
          visualQuestion04Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 6
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    timeline.push({
      type: "display-slide",
      display_element: $("#imageQuestion"),
      name: "imageQuestion",
      template: imageQuestionTemplate({
        imageDistractor1: distractorsImage0[0],
        imageDistractor2: distractorsImage0[1],
        imageDistractor3: distractorsImage0[2],
        imageDistractor4: distractorsImage0[3],
        imageQuestion: qs0.imageQuestion,
        pageTitle: qs0.pageTitle,
        distractorWidth: mainImageWidth0,
        rightAnswer: qs0.imageAnswerURL
      }),
      finish: function() {
        jsPsych.data.addProperties({imageQuestion0Responce: distractorsImage0[parseInt($("input[name=image]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({imageQuestion0FinishTime: currentTime});
        var testScore = 0
        if (distractorsImage0[parseInt($("input[name=image]:checked").val()) - 1] == qs0.imageAnswerURL) {
          testScore = 1
        }
        jsPsych.data.addProperties({imageQuestion0Score: testScore});
        jsPsych.data.addProperties({imageQuestion0: qs0.imageQuestion});

        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          imageQuestion0Complete: true, 
          imageQuestion0Responce: distractorsImage0[parseInt($("input[name=image]:checked").val()) - 1],
          imageQuestion0FinishTime: currentTime,
          imageQuestion0Score: testScore,
          imageQuestion0: qs0.imageQuestion,
          uuid: uuid
        });
      }
    });


    timeline.push({
      type: "display-slide",
      display_element: $("#knowledgeQ"),
      name: "knowledgeQuestion",
      template: knowledgeQTemplate({pageTitle: article1.pageTitle}),
      finish: function() {
        jsPsych.data.addProperties({answersNonVisual11: nonVisualAnswer11});
        jsPsych.data.addProperties({answersNonVisual12: nonVisualAnswer12});
        jsPsych.data.addProperties({answersVisual13: visualAnswer13});
        jsPsych.data.addProperties({answersVisual14: visualAnswer14});
        jsPsych.data.addProperties({answersImage1: qs1.imageAnswerURL});
        jsPsych.data.addProperties({knowledgeOfArticle1: $("input[name=knowledge]:checked").val()});
        jsPsych.data.addProperties({titleOfArticle1: article1.pageTitle});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({knowledgeOfArticleTime1: currentTime});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          knowledgeOfArticle1Time: currentTime, 
          knowledgeofArticle1Complete: true,
          answersNonVisual11: nonVisualAnswer11,
          answersNonVisual12: nonVisualAnswer12,
          answersVisual13: visualAnswer13,
          answersVisual14: visualAnswer14,
          answersImage1: qs1.imageAnswerURL,
          knowledgeOfArticle1: $("input[name=knowledge]:checked").val(),
          titleOfArticle1: article1.pageTitle,
          uuid: uuid
        });
      }
    });

    // progress counter 3
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    //) NonVisual Question

    timeline.push({
      type: "display-slide",
      display_element: $("#nonVisualQuestion"),
      name: "nonVisualQuestion",
      template: nonVisualQuestionTemplate({
        pageTitle: qs1.pageTitle,
        nonVisualQ: qs1["question" + '1'],
        nonVisual1: distractorsNonVisual11[0],
        nonVisual2: distractorsNonVisual11[1],
        nonVisual3: distractorsNonVisual11[2],
        nonVisual4: distractorsNonVisual11[3],
        rightAnswer: actualIndexNonVisual11
      }),
      finish: function() {
        jsPsych.data.addProperties({nonVisualQuestion11: qs1["question" +'1']});
        jsPsych.data.addProperties({nonVisualQuestion11Responce: distractorsNonVisual11[parseInt($("input[name=nonVisual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({nonVisualQuestion11FinishTime: currentTime});
        var testScore = 0
        if (distractorsNonVisual11[parseInt($("input[name=nonVisual]:checked").val()) - 1] == qs1["answer" + '1']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({nonVisualQuestion11Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          nonVisualQuestion11Complete: true, 
          nonVisualQuestion11: qs1["question" + '1'],
          nonVisualQuestion11Responce: distractorsNonVisual11[parseInt($("input[name=nonVisual]:checked").val()) - 1],
          nonVisualQuestion11FinishTime: currentTime,
          nonVisualQuestion11Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 5
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

     //) NonVisual Question

     timeline.push({
      type: "display-slide",
      display_element: $("#nonVisualQuestion"),
      name: "nonVisualQuestion",
      template: nonVisualQuestionTemplate({
        pageTitle: qs1.pageTitle,
        nonVisualQ: qs1["question" + '2'],
        nonVisual1: distractorsNonVisual12[0],
        nonVisual2: distractorsNonVisual12[1],
        nonVisual3: distractorsNonVisual12[2],
        nonVisual4: distractorsNonVisual12[3],
        rightAnswer: actualIndexNonVisual12
      }),
      finish: function() {
        jsPsych.data.addProperties({nonVisualQuestion12: qs1["question" +'2']});
        jsPsych.data.addProperties({nonVisualQuestion12Responce: distractorsNonVisual12[parseInt($("input[name=nonVisual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({nonVisualQuestion12FinishTime: currentTime});
        var testScore = 0
        if (distractorsNonVisual12[parseInt($("input[name=nonVisual]:checked").val()) - 1] == qs1["answer" + '2']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({nonVisualQuestion12Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          nonVisualQuestion12Complete: true, 
          nonVisualQuestion12: qs1["question" + '2'],
          nonVisualQuestion12Responce: distractorsNonVisual12[parseInt($("input[name=nonVisual]:checked").val()) - 1],
          nonVisualQuestion12FinishTime: currentTime,
          nonVisualQuestion12Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 5
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    //Visual Question

    timeline.push({
      type: "display-slide",
      display_element: $("#visualQuestion"),
      name: "visualQuestion",
      template: visualQuestionTemplate({
        pageTitle: qs1.pageTitle,
        visualQ: qs1["question" + '3'] ,
        visual1: distractorsVisual13[0],
        visual2: distractorsVisual13[1],
        visual3: distractorsVisual13[2],
        visual4: distractorsVisual13[3],
        rightAnswer: actualIndexVisual13
      }),
      finish: function() {
        jsPsych.data.addProperties({visualQuestion13: qs1["question" + '3']});
        jsPsych.data.addProperties({visualQuestion13Responce: distractorsVisual13[parseInt($("input[name=visual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({visualQuestion13FinishTime: currentTime});
        var testScore = 0
        if (distractorsVisual13[parseInt($("input[name=visual]:checked").val()) - 1] == qs1["answer" + '3']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({visualQuestion13Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          visualQuestion13Complete: true, 
          visualQuestion13: qs1["question" + '3'],
          visualQuestion13Responce: distractorsVisual13[parseInt($("input[name=visual]:checked").val()) - 1],
          visualQuestion13FinishTime: currentTime,
          visualQuestion13Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 6
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    //Visual Question

    timeline.push({
      type: "display-slide",
      display_element: $("#visualQuestion"),
      name: "visualQuestion",
      template: visualQuestionTemplate({
        pageTitle: qs1.pageTitle,
        visualQ: qs1["question" + '4'] ,
        visual1: distractorsVisual14[0],
        visual2: distractorsVisual14[1],
        visual3: distractorsVisual14[2],
        visual4: distractorsVisual14[3],
        rightAnswer: actualIndexVisual14
      }),
      finish: function() {
        jsPsych.data.addProperties({visualQuestion14: qs1["question" + '4']});
        jsPsych.data.addProperties({visualQuestion14Responce: distractorsVisual14[parseInt($("input[name=visual]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({visualQuestion14FinishTime: currentTime});
        var testScore = 0
        if (distractorsVisual14[parseInt($("input[name=visual]:checked").val()) - 1] == qs1["answer" + '4']) {
          testScore = 1
        } 
        jsPsych.data.addProperties({visualQuestion14Score: testScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          visualQuestion14Complete: true, 
          visualQuestion14: qs1["question" + '4'],
          visualQuestion14Responce: distractorsVisual14[parseInt($("input[name=visual]:checked").val()) - 1],
          visualQuestion14FinishTime: currentTime,
          visualQuestion4Score: testScore,
          uuid: uuid
        });
      }
    });

    // progress counter 6
    timeline.push({
      type: "call-function",
      func: function() {
        $("#progress-header").html(progressTemplate({
          msg: C.progressMsg,
          progress: ++params.currentProgress,
          total: 11
        }))
        .show();
      }
    });

    timeline.push({
      type: "display-slide",
      display_element: $("#imageQuestion"),
      name: "imageQuestion",
      template: imageQuestionTemplate({
        imageDistractor1: distractorsImage1[0],
        imageDistractor2: distractorsImage1[1],
        imageDistractor3: distractorsImage1[2],
        imageDistractor4: distractorsImage1[3],
        imageQuestion: qs1.imageQuestion,
        pageTitle: qs1.pageTitle,
        distractorWidth: mainImageWidth1,
        rightAnswer: qs1.imageAnswerURL
      }),
      finish: function() {
        jsPsych.data.addProperties({imageQuestionResponce1: distractorsImage1[parseInt($("input[name=image]:checked").val()) - 1]});
        var currentTime = new Date().getTime()
        jsPsych.data.addProperties({imageQuestionFinishTime1: currentTime});
        var testScore = 0
        if (distractorsImage1[parseInt($("input[name=image]:checked").val()) - 1] == qs1.imageAnswerURL) {
          testScore = 1
        }
        jsPsych.data.addProperties({imageQuestionScore1: testScore});
        jsPsych.data.addProperties({imageQuestion1: qs1.imageQuestion});

        var studyData1 = jsPsych.data.getLastTrialData()
        var surveyTotalTime = (currentTime - studyData1.studyStartTime)
        surveyTotalTime = ((surveyTotalTime / 1000 ) / 60)
        surveyTotalTime = Math.round(surveyTotalTime * 10) / 10
        var totalScore = studyData1.imageQuestionScore1 + studyData1.visualQuestion14Score + studyData1.visualQuestion13Score + studyData1.nonVisualQuestion11Score + studyData1.nonVisualQuestion12Score +
                          studyData1.imageQuestionScore0 + studyData1.visualQuestion04Score + studyData1.visualQuestion03Score + studyData1.nonVisualQuestion01Score + studyData1.nonVisualQuestion02Score;
        jsPsych.data.addProperties({'surveyTimeTotal': surveyTotalTime});
        jsPsych.data.addProperties({'totalScore': totalScore});
        uuid = LITW.data.getParticipantId();
        LITW.data.submitStudyData({
          imageQuestionComplete1: true, 
          imageQuestionResponce1: distractorsImage1[parseInt($("input[name=image]:checked").val()) - 1],
          imageQuestionFinishTime1: currentTime,
          imageQuestionScore1: testScore,
          imageQuestion1: qs1.imageQuestion,
          surveyTimeTotal: surveyTotalTime,
          totalScore: totalScore,
          uuid: uuid
        });
      }
    });

    // record tracking information
    timeline.push({
      type: "call-function",
      func: function() {
        LITW.utils.showSlide("trials");
      }
    });

    // register a function to submit data as soon
    // as this trial is completed
    timeline.push({
      type: "call-function",
      func: submitData
    });

    // ******* END STUDY PROGRESSION ******** //
  },

  submitData = function() {
    LITW.data.submitStudyData(jsPsych.data.getLastTrialData());
  },

  startTrials = function() {
    LITW.utils.showSlide("trials");
    jsPsych.init({
      timeline: timeline,
      on_finish: demographics,
      display_element: $("#trials")
    });
  },

  comments = function(demographicsData) {
    // send demographics data to the server
    LITW.data.submitDemographics(demographicsData);

    $("#progress-header").hide();
    LITW.utils.showSlide("comments");
    LITW.comments.showCommentsPage(results);
  },

  results = function(commentsData) {

    LITW.data.submitComments(commentsData);

    var studyData1 = jsPsych.data.getLastTrialData()
    console.log(studyData1)
    
    pid = LITW.data.getParticipantId()
    //twitterText = "I got a WikiKnowledgeScore of " + resultScore + "! See what score you can get and maybe you'll learn something new!"
    LITW.utils.showSlide("results");
    $("#results").html(finalResultsTemplate({
      id: pid,
    }));
    //LITW.results.insertFooter(twitterText);
  };

  summaryInitialData = function(json_data){
    var summary = {};
    for (count in json_data) {
      var country = json_data[count].country;
      if( country in summary){
        summary[country] = summary[country]+1;
      } else {
        summary[country] = 1;
      }
    };
    var data = {summary : true};
    data.data = summary;
    LITW.data.submitStudyData(data);
  }

  readSummaryData = function(obj) {
    $.ajax({
      url: "summary.json",
      dataType: "json",
      async: false,
      success: function(data){
        obj["summary"] = data
      }
    })
  }

  loadNeededData = function (params) {
    // load wikipedia articles available
    wikiArticles = [];
    // load wikiArticles array with WikipediaArticles.json data
    $.ajax({
      url: "WikipediaArticles.json",
      dataType: "json",
      async: false,
      success: function(data){
        for (var i in data) {
          wikiArticles.push([i, data[i]]);
        }
      }
    })
    articleQuestions = []
    $.ajax({
      url: "WorldKnowledgeQs.json",
      dataType: "json",
      async: false,
      success: function(data){
        for (var i in data) {
          articleQuestions.push([i, data[i]]);
        }
      }
    })

    imageWidths = []
    $.ajax({
      url: "ArticleImageWidths.json",
      dataType: "json",
      async: false,
      success: function(data){
        for (var j in data) {
          imageWidths.push([j, data[j]]);
        }
      }
    })
    funFacts = []
    $.ajax({
      url: "facts.json",
      dataType: "json",
      async: false,
      success: function(data){
        for (var i in data) {
          funFacts.push([i, data[i]]);
        }
      }
    })

    params.wikiArticleSamples = wikiArticles;
    params.questions = articleQuestions;
    params.widths = imageWidths;
    params.funFacts = funFacts;
    params.randomArticles = [
      {
        url: "https://en.wikipedia.org/wiki/Tardigrade",
        img: "https://upload.wikimedia.org/wikipedia/commons/0/09/201703_tardigrade.svg",
        title: "Tardigrade"
      },
      {
        url: "https://en.wikipedia.org/wiki/Colors_of_noise",
        img: "https://upload.wikimedia.org/wikipedia/commons/6/6c/The_Colors_of_Noise.png",
        title: "Colors of noise"
      },
      {
        url: "https://en.wikipedia.org/wiki/Buttered_cat_paradox",
        img: "https://upload.wikimedia.org/wikipedia/commons/2/20/Buttered_cat.png",
        title: "Buttered cat paradox"
      }
    ]
  }

  // when the page is loaded, start the study!
  $(document).ready(function() {

    // detect touch devices
    window.litwWithTouch = ("ontouchstart" in window);

    // determine and set the study language
    $.i18n().locale = i18n.getLocale();

    $.i18n().load(
      {
        'en': 'src/i18n/en.json',
        'pt-BR': 'src/i18n/pt-br.json'
      }
    ).done(
      function(){
        $('head').i18n();
        $('body').i18n();
      }
    );

    // generate unique participant id and geolocate participant
    LITW.data.initialize();
    LITW.share.makeButtons("#header-share", "What percentage of Wikipedia do you know?");

    // shortcut to access study content
    C = LITW_STUDY_CONTENT;

    loadNeededData(params);
    // get initial data from database (maybe needed for the results page!?)
    readSummaryData(params);

    // sample 3 pages from wikiArticles without replacement
    // and assign to params.wikiArticleSamples
    // samples = [];
    // samples = jsPsych.randomization.sample(wikiArticles, 3, false);
    // params.wikiArticleSamples = samples;

    LITW.utils.showSlide("img-loading");

    // 1. preload images
    // 2. initialize the jsPsych timeline and
    // 3. proceed to IRB page when loading has finished
    jsPsych.pluginAPI.preloadImages(
      ["img/btn-next.png","img/btn-next-active.png","img/ajax-loader.gif"],
      function() {
        initJsPsych();
        irb();
      },

      // update loading indicator as stims preload
      function(numLoaded) {
        $("#img-loading").html(loadingTemplate({
          msg: C.loadingMsg,
          numLoaded: numLoaded,
          total: 3
        }));
      }
    );
  });
})();