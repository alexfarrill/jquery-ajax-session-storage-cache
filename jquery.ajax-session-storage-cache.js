//  jQuery Ajax Session Storage Cache Library v1.1
//  https://github.com/alexfarrill
//  Copyright 2011, Alex Farrill
 
(function($) {
  $.AjaxSessionStorageCache = function(options) {
    if (!options.key || !options.ajax_options || !options.ajax_options.url) {
      alert("ajax_session_storage_cache: missing required options");
      return;
    }
    
    if (typeof JSON === "undefined") {
      alert("Some JSON implementation is required");
      return;
    }
    
    // Override namespace in your applicatin code
    var global_options = $.AjaxSessionStorageCache.options || {},
        namespace = global_options.namespace || "session-cache",
        skip_cache = global_options.skip_cache || !!options.skip_cache,
        cache_value;
    
    this.ajax_options = $.extend({}, options.ajax_options, { context: this, success: [ options.ajax_options.success, this.cacheResponse ] });
    this.debug = !!global_options.debug;
    
    if (skip_cache) {
      this.performAjax();
    } else {
      this.key = namespace + "-" + options.key;
      this.minutes_to_expiration = options.minutes_to_expiration;
      
      cache_value = this.getSessionStorageCache(this.key);
      
      if (cache_value === false) {
        this.performAjax();
      } else {
        ($.proxy( options.ajax_options.success, this ))(cache_value);
      }
    }
  }
  
  $.AjaxSessionStorageCache.prototype.performAjax = function() {
    if (this.debug) console.log("jassCache: performed ajax for " + this.ajax_options.url);
    $.ajax(this.ajax_options);
  }
  
  $.AjaxSessionStorageCache.prototype.supportsSessionStorage = function() {
    try {
      return !!sessionStorage.getItem;
    } catch(e) {
      return false;
    }
  }
  
  $.AjaxSessionStorageCache.prototype.cacheResponse = function(data, textStatus, jqXHR) {
    var expires_at = (new Date).getTime() + (60000 * parseFloat(this.minutes_to_expiration)),
        json_string = JSON.stringify({
          responseText: jqXHR.responseText,
          expires_at: expires_at
        });
      
    this.setSessionStorageCache(json_string);
  }
  
  $.AjaxSessionStorageCache.prototype.getSessionStorageCache = function(name) {
    if (this.supportsSessionStorage()) {
      var json_string = sessionStorage.getItem(this.key),
          json_object,
          expires_at,
          now = (new Date).getTime();
      
      if (json_string) {
        json_object = JSON.parse(json_string);
        expires_at = json_object.expires_at;
        
        if (Math.floor(expires_at) > now) {
          if (this.ajax_options.dataType === "json") {
            return JSON.parse(json_object.responseText);
          } else {
            return json_object.responseText;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  
  $.AjaxSessionStorageCache.prototype.setSessionStorageCache = function(value) {
    if (this.supportsSessionStorage()) {
      sessionStorage.setItem(this.key, value);
    }
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