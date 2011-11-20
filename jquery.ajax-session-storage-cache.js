//  jQuery Ajax Session Storage Cache Library v1.0
//  https://github.com/alexfarrill
//  Copyright 2011, Alex Farrill
 
(function($) {
  $.AjaxSessionStorageCache = function(options) {
    if (!options.key || !options.ajax_options || !options.ajax_options.url) {
      alert("ajax_session_storage_cache: missing required options");
      return;
    }
    
    this.key = options.key;
    this.expires_key = this.key + "-expires";
    this.minutes_to_expiration = options.minutes_to_expiration;
    this.ajax_options = $.extend({}, options.ajax_options, { context: this, success: [ options.ajax_options.success, this.cacheResponse ] });
    
    var cache_value = this.getSessionStorageCache(this.key);
    
    if (cache_value) {
      ($.proxy( options.ajax_options.success, this ))(cache_value);
    } else {
      $.ajax(this.ajax_options);
    }
  }
  
  $.AjaxSessionStorageCache.prototype.supportsSessionStorage = function() {
    try {
      return !!sessionStorage.getItem;
    } catch(e) {
      return false;
    }
  }
  
  $.AjaxSessionStorageCache.prototype.cacheResponse = function(data) {
    this.setSessionStorageCache(data);
  }
  
  $.AjaxSessionStorageCache.prototype.getSessionStorageCache = function(name) {
    if (this.supportsSessionStorage()) {
      var expires_at = sessionStorage.getItem(this.expires_key),
          now = (new Date).getTime();
      if (Math.floor(expires_at) > now) {
        return sessionStorage.getItem(this.key);
      } else {
        return null;
      }
    } else {
      return false;
    }
  }
  
  $.AjaxSessionStorageCache.prototype.setSessionStorageCache = function(value) {
    var expires_at = (new Date).getTime() + (60000 * parseFloat(this.minutes_to_expiration));
    
    sessionStorage.setItem(this.expires_key, expires_at);
    sessionStorage.setItem(this.key, value);
  }
  
  $.ajax_session_storage_cache = function(options) {
    var o = $.extend({}, $.ajax_session_storage_cache.defaults, options);
    new $.AjaxSessionStorageCache(o);
    return;
  }
  
  $.ajax_session_storage_cache.defaults = {
    minutes_to_expiration: 5
  }
  
})( jQuery );