require.config({
    paths: {
        "jquery": '../vendor/jquery/jquery',
        "underscore": '../vendor/underscore-amd/underscore',
        "backbone": '../vendor/backbone-amd/backbone'
    },
    shim: {
    }
});

require(['app', 'jquery'], function (app, $) {
    'use strict';
    // use app here
    console.log(app);
    console.log('Running jQuery %s', $().jquery);
});