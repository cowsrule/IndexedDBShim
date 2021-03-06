/*jshint globalstrict: true*/
'use strict';
(function(window, idbModules){
    if (typeof window.openDatabase !== "undefined") {
        window.shimIndexedDB = idbModules.shimIndexedDB;
        if (window.shimIndexedDB) {
            window.shimIndexedDB.__useShim = function(){
                try
                {
                    console.log('---- Using SQL Shim ----');
                    idbModules.shimIndexedDB.loadShim();

                    window.dbProvider = idbModules.shimIndexedDB;

                    window.IDBDatabase = idbModules.IDBDatabase;
                    window.IDBTransaction = idbModules.IDBTransaction;
                    window.IDBCursor = idbModules.IDBCursor;
                    window.IDBKeyRange = idbModules.IDBKeyRange;
                    // On some browsers the assignment fails, overwrite with the defineProperty method
                    if (window.dbProvider !== idbModules.shimIndexedDB && Object.defineProperty) {
                        Object.defineProperty(window, 'dbProvider', {
                            value: idbModules.shimIndexedDB
                        });
                    }
                }
                catch (err)
                {
                    console.log('Error loading SQL shim');
                }
            };
            window.shimIndexedDB.__debug = function(val){
                idbModules.DEBUG = val;
            };
        }
    }

    window.dbProvider = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;

    /*
    detect browsers with known IndexedDb issues (e.g. Android pre-4.4)
    */
    var poorIndexedDbSupport = false;
    if (navigator.userAgent.match(/Android 2/) || navigator.userAgent.match(/Android 3/) || navigator.userAgent.match(/Android 4\.[0-3]/)) {
        /* Chrome is an exception. It supports IndexedDb */
        if (!navigator.userAgent.match(/Chrome/)) {
            poorIndexedDbSupport = true;
        }
    }

    var forceSQL = window.location.hash.indexOf('forcesql=true') >= 0;

    if (forceSQL || ((typeof window.indexedDB === "undefined" || window.indexedDB === null || poorIndexedDbSupport) && typeof window.openDatabase !== "undefined")) {
        window.shimIndexedDB.__useShim();
    } else {
        window.IDBDatabase = window.IDBDatabase || window.webkitIDBDatabase;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
        window.IDBCursor = window.IDBCursor || window.webkitIDBCursor;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
        if(!window.IDBTransaction){
            window.IDBTransaction = {};
        }
        /* Some browsers (e.g. Chrome 18 on Android) support IndexedDb but do not allow writing of these properties */
        try {
            window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || "readonly";
            window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || "readwrite";
        } catch (e) {}
    }
    
}(window, idbModules));
