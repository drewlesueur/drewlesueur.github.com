_.mixin
  do_these: (things, final_ret) ->
    # an easy abstraction for doing more that one thing at once and then returning when they are all done
    dones = []
    done_ids = {}
    make_done = (id) ->
      return (ret) ->
        dones[id] = ret
        done_ids[id] = true
        all_done = true
        _.each things, (func, id) ->
          if not(id of done_ids)
            all_done = false
            _.breakLoop()
        if all_done is true
          final_ret(dones)
    _.each things, (func, id) ->
      func(make_done(id))