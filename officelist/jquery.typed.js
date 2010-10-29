(function() {
  (function() {
    return ($.fn.typed = function(settings) {
      var config;
      config = {
        callback: function() {},
        wait: 750
      };
      if (settings) {
        $.extend(config, settings);
      }
      this.each(function() {
        var save, t, that;
        $(this).attr('old-val', $(this).val());
        that = this;
        save = function() {
          var old_val, val;
          val = $(that).val();
          old_val = $(that).attr("old-val");
          if (val !== old_val) {
            config.callback.call(that);
            return $(that).attr("old-val", val);
          }
        };
        t = "";
        $(this).keydown(function() {
          return clearTimeout(t);
        });
        return $(this).keyup(function() {
          return (t = setTimeout(save, config.wait));
        });
      });
      return this;
    });
  })(jQuery);
})();
