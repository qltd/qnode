//Use a property on require so if the test runs in node, it is visible.
//Remove it when done with the test.
require.relativeBaseUrlCounter=0;require({baseUrl:requirejs.isBrowser?"./":"./relative/"},["./top","top"],function(e,t){doh.register("relativeBaseUrl",[function(r){r.is(e.id,t.id);r.is(1,require.relativeBaseUrlCounter);delete require.relativeBaseUrlCounter}]);doh.run()});