conga-browserify
================

Overview
--------

This is a bundle for the [Conga.js](https://github.com/congajs/conga) framework which 
uses [browserify](https://github.com/substack/node-browserify) to allow you to expose
modules within your application to the browser.

Configuration
-------------

    # config.yml
    browserify:

        # bundles to create
        bundles:

            mybundle:
                path: js/user.js
                expose: user
                src:
                    - demo-bundle:model/user

Usage
-----

Jade example:

    // layout.jade
    script(src='/js/user.js')
