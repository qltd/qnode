require.config({
    paths: {
        jquery: '../components/jquery/jquery'
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