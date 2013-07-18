/*
 * QtWebKit-powered headless test runner using PhantomJS
 *
 * PhantomJS binaries: http://phantomjs.org/download.html
 * Requires PhantomJS 1.6+ (1.7+ recommended)
 *
 * Run with:
 *   phantomjs runner.js [url-of-your-qunit-testsuite]
 *
 * e.g.
 *   phantomjs runner.js http://localhost/qunit/test/index.html
 *//*jshint latedef:false *//*global phantom:false, require:false, console:false, window:false, QUnit:false */(function(){"use strict";function r(){window.document.addEventListener("DOMContentLoaded",function(){var e=[];QUnit.log(function(t){var n;if(t.result)return;n=t.message||"";if(typeof t.expected!="undefined"){n&&(n+=", ");n+="expected: "+t.expected+", but was: "+t.actual;t.source&&(n+="\n"+t.source)}e.push("Failed assertion: "+n)});QUnit.testDone(function(t){var n,r,i=t.module+": "+t.name;if(t.failed){console.log("Test failed: "+i);for(n=0,r=e.length;n<r;n++)console.log("    "+e[n])}e.length=0});QUnit.done(function(e){console.log("Took "+e.runtime+"ms to run "+e.total+" tests. "+e.passed+" passed, "+e.failed+" failed.");typeof window.callPhantom=="function"&&window.callPhantom({name:"QUnit.done",data:e})})},!1)}var e=require("system").args;if(e.length!==2){console.error("Usage:\n  phantomjs runner.js [url-of-your-qunit-testsuite]");phantom.exit(1)}var t=e[1],n=require("webpage").create();n.onConsoleMessage=function(e){console.log(e)};n.onInitialized=function(){n.evaluate(r)};n.onCallback=function(e){var t,n;if(e&&e.name==="QUnit.done"){t=e.data;n=!t||t.failed;phantom.exit(n?1:0)}};n.open(t,function(e){if(e!=="success"){console.error("Unable to access network: "+e);phantom.exit(1)}else{var t=n.evaluate(function(){return typeof QUnit=="undefined"||!QUnit});if(t){console.error("The `QUnit` object is not present on this page.");phantom.exit(1)}}})})();