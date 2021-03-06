function NativePageTransitions() {
}

NativePageTransitions.prototype.globalOptions =  {
  duration: 400,
  iosdelay: 60, // a number of milliseconds, or -1 (call executePendingTransition() when ready)
  androiddelay: 70, // a number of milliseconds, a function that takes an animate callback that will execute pending transition when invoked, or -1 to manually call executePendingTransition() when ready
  winphonedelay: 200,
  slowdownfactor: 4,
  fixedPixelsTop: 0,    // currently for slide left/right only
  fixedPixelsBottom: 0  // currently for slide left/right only
};

NativePageTransitions.prototype.executePendingTransition = executePendingTransition;

NativePageTransitions.prototype.slide = function (options, onSuccess, onError) {
  var opts = options || {};
  if (!this._validateHref(opts.href, onError)) {
    return;
  }
  opts.direction = opts.direction || "left";
  if (opts.duration == undefined || opts.duration == "null") {
    opts.duration = this.globalOptions.duration;
  }
  var delayCallbacks = setupDelayOptions(opts);
  if (opts.fixedPixelsTop == undefined || opts.fixedPixelsTop == "null") {
    opts.fixedPixelsTop = this.globalOptions.fixedPixelsTop;
  }
  if (opts.fixedPixelsBottom == undefined || opts.fixedPixelsBottom == "null") {
    opts.fixedPixelsBottom = this.globalOptions.fixedPixelsBottom;
  }
  // setting slowdownfactor > 1 makes the next page slide less pixels. Use 1 for side-by-side.
  opts.slowdownfactor = opts.slowdownfactor || this.globalOptions.slowdownfactor;
  cordova.exec(onSuccess, onError, "NativePageTransitions", "slide", [opts]);
  fireDelayCallbacks(delayCallbacks);
};

NativePageTransitions.prototype.drawer = function (options, onSuccess, onError) {
  var opts = options || {};
  if (!this._validateHref(opts.href, onError)) {
    return;
  }
  opts.origin = opts.origin || "left";
  opts.action = opts.action || "open";
  if (opts.duration == undefined || opts.duration == "null") {
    opts.duration = this.globalOptions.duration;
  }
  var delayCallbacks = setupDelayOptions(opts);
  cordova.exec(onSuccess, onError, "NativePageTransitions", "drawer", [opts]);
  fireDelayCallbacks(delayCallbacks);
};

NativePageTransitions.prototype.flip = function (options, onSuccess, onError) {
  var opts = options || {};
  if (!this._validateHref(opts.href, onError)) {
    return;
  }
  opts.direction = opts.direction || "right";
  if (opts.duration == undefined || opts.duration == "null") {
    opts.duration = this.globalOptions.duration;
  }
  var delayCallbacks = setupDelayOptions(opts);
  cordova.exec(onSuccess, onError, "NativePageTransitions", "flip", [opts]);
  fireDelayCallbacks(delayCallbacks);
};

NativePageTransitions.prototype.curl = function (options, onSuccess, onError) {
  var opts = options || {};
  if (!this._validateHref(opts.href, onError)) {
    return;
  }
  opts.direction = opts.direction || "up";
  if (opts.duration == undefined || opts.duration == "null") {
    opts.duration = this.globalOptions.duration;
  }
  var delayCallbacks = setupDelayOptions(opts, {android: false, winphone: false});
  cordova.exec(onSuccess, onError, "NativePageTransitions", "curl", [opts]);
  fireDelayCallbacks(delayCallbacks);
};

NativePageTransitions.prototype.fade = function (options, onSuccess, onError) {
  var opts = options || {};
  if (!this._validateHref(opts.href, onError)) {
    return;
  }
  if (opts.duration == undefined || opts.duration == "null") {
    opts.duration = this.globalOptions.duration;
  }
  var delayCallbacks = setupDelayOptions(opts, {winphone: false});
  cordova.exec(onSuccess, onError, "NativePageTransitions", "fade", [opts]);
  fireDelayCallbacks(delayCallbacks);
};

NativePageTransitions.prototype._validateHref = function (href, errCallback) {
  // if not contains www/ : dan zit je in een companion app..
  var hrf = window.location.href;
  var currentHref;
  if (hrf.indexOf('www/') == -1) {
    console.log('Probably running inside a companion app, your app may crash if your html file is not in the root!');
    // hrf is something like file:///data/.../index.html
    currentHref = hrf.substr(hrf.lastIndexOf('/')+1);
  } else {
    currentHref = hrf.substr(hrf.indexOf('www/')+4);
  }
  // if no href was passed the transition should always kick in
  if (href) {
    // if only hash nav, do it in JS for Android
    // (I'm a little reluctant to depend on 'device' only for this: device.platform == "Android")
    if (href.indexOf('#') == 0 && navigator.userAgent.indexOf("Android") > -1) {
      // starts with a #, so check if the current one has a hash with the same value
      if (currentHref.indexOf('#') > -1) {
        var file = currentHref.substr(0, currentHref.indexOf('#'));
        if (hrf.indexOf('www/') == -1) {
          var to = hrf.substr(0, hrf.lastIndexOf('/')+1);
          window.location.href = to+file+href;
        } else {
          window.location.href = "/android_asset/www/"+file+ href;
        }
      } else {
        // the current page has no #, so simply attach the href to current url
        if (hrf.indexOf('#') > -1) {
          hrf = hrf.substring(0, hrf.indexOf('#'));
        }
        window.location = hrf += href;
      }
    }
  }
  if (currentHref == href) {
    if (errCallback) {
      errCallback("The passed href is the same as the current");
    } else {
      console.log("The passed href is the same as the current");
    }
    return false;
  }
  return true;
};

NativePageTransitions.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }

  window.plugins.nativepagetransitions = new NativePageTransitions();
  return window.plugins.nativepagetransitions;
};

function setupDelayOptions(opts, whichOS) {
  whichOS = whichOS || {};
  whichOS = {
    android: whichOS.android !== false,
    ios: whichOS.ios !== false,
    winphone: whichOS.winphone !== false
  };
  var callbacks = [];
  var globalOptions = NativePageTransitions.prototype.globalOptions;
  if (whichOS.android) {
    if (opts.androiddelay == undefined || opts.androiddelay == "null") {
      opts.androiddelay = globalOptions.androiddelay;
    } else if (typeof opts.androiddelay == 'function') {
      callbacks.push(opts.androiddelay);
      opts.androiddelay = -1;
    }
  }
  if (whichOS.ios) {
    if (opts.iosdelay == undefined || opts.iosdelay == "null") {
      opts.iosdelay = globalOptions.iosdelay;
    } else if (typeof opts.iosdelay == 'function') {
      callbacks.push(opts.iosdelay);
      opts.iosdelay = -1;
    }
  }
  if (whichOS.winphone && (opts.winphonedelay == undefined || opts.winphonedelay == "null")) {
    opts.winphonedelay = globalOptions.winphonedelay;
  }
  return callbacks;
}

function animate(onSuccess, onError) {
  onSuccess = onSuccess || function() {};
  onError = onError || function() {};
  executePendingTransition(onSuccess, onError);
}

function fireDelayCallbacks(callbacks) {
  if (callbacks) {
    for (var i = 0; i < callbacks.length; i++) {
      var callback = callbacks[i];
      callback(animate);
    }
  }
}

function executePendingTransition(onSuccess, onError) {
  cordova.exec(onSuccess, onError, "NativePageTransitions", "executePendingTransition", []);
};

cordova.addConstructor(NativePageTransitions.install);