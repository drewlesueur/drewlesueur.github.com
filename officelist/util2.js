(function() {
  _.mixin({
    do_these: function(things, final_ret) {
      var done_ids, dones, make_done;
      dones = [];
      done_ids = {};
      make_done = function(id) {
        return function(ret) {
          var all_done;
          dones[id] = ret;
          done_ids[id] = true;
          all_done = true;
          _.each(things, function(func, id) {
            if (!(id in done_ids)) {
              all_done = false;
              return _.breakLoop();
            }
          });
          return all_done === true ? final_ret(dones) : null;
        };
      };
      return _.each(things, function(func, id) {
        return func(make_done(id));
      });
    }
  });
})();
