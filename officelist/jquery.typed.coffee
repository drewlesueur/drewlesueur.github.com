# simple autosave deal for jquery
(() ->
  $.fn.typed = (settings) ->
    config = 
      callback: () ->
      wait: 750
    if settings
      $.extend config, settings
    this.each () ->
      $(this).attr 'old-val', $(this).val()
      that = this
      save = () ->
        val = $(that).val()
        old_val = $(that).attr "old-val"
        if val isnt old_val
          config.callback.call that
          $(that).attr "old-val", val
      t = ""
      $(this).keydown () ->
        clearTimeout t
      $(this).keyup () ->
        t = setTimeout save, config.wait
    return this
)(jQuery)