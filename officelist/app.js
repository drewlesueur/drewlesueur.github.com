(function() {
  var Listing, adding_markers, body, bubbles, get_location, listing, listings, map, render, server, set, set_current_listing;
  map = "";
  body = $("body");
  window.map = map;
  window.body = body;
  render = "";
  adding_markers = [];
  bubbles = [];
  get_location = function(wherethe, callback) {
    var geocoder;
    geocoder = new google.maps.Geocoder();
    return geocoder.geocode({
      address: wherethe
    }, function(results, status) {
      return status === google.maps.GeocoderStatus.OK ? callback(results[0].geometry.location) : alert("there was a looking up problem");
    });
  };
  listings = [];
  window.lisitngs = listings;
  listing = {
    is_new: true,
    _user: "",
    size: "",
    price: "",
    desc: "",
    _type: "listing"
  };
  window.listing = listing;
  set_current_listing = function(my_listing) {
    listing = my_listing;
    $("#location").val(listing.location);
    $("#size").val(listing.size);
    $("#price").val(listing.price);
    $("#desc").val(listing.desc);
    return (window.listing = listing);
  };
  server = "";
  set = function(obj, vals) {
    var _a, type;
    _.extend(obj, vals);
    type = _.capitalize(obj._type);
    return (typeof (_a = window[type]) !== "undefined" && _a !== null) && window[type].set ? window[type].set(obj, vals) : console.log(obj, type, window[type]);
  };
  Listing = {
    set: function(listing, vals) {
      return _.each(vals, function(v, k) {
        var loc;
        listing[k] = v;
        if (k === "location") {
          loc = get_location(v, function(loc) {
            listing.lat = loc.lat();
            listing.lng = loc.lng();
            render.add_google_map_marker(listing);
            return map.setCenter(loc);
          });
        }
        return listing.bubble && listing.bubble.view ? $(".bubble." + (k)).text(v) : null;
      });
    },
    save: function(listing, callback) {
      var old_bubble;
      if (listing.bubble) {
        old_bubble = listing.bubble;
        delete listing.bubble;
        delete listing.is_new;
      }
      return server("addedit", listing, function() {
        listing.bubble = old_bubble;
        return callback();
      });
    }
  };
  window.Listing = Listing;
  $(window).load(function() {
    var add_listing_form, go, html;
    go = function() {
      window.username = "fix thiss";
      server.get_all_listings(function(listings) {
        var _a, _b, _c, _d;
        _a = []; _c = listings;
        for (_b = 0, _d = _c.length; _b < _d; _b++) {
          listing = _c[_b];
          _a.push(render.add_google_map_marker(listing));
        }
        return _a;
      });
      Severus.ajax({
        type: "GET",
        url: "json",
        success: function(data) {
          return console.log(data);
        },
        error: function(data) {
          return console.log("error");
        }
      });
      return render.main();
    };
    Severus.initialize("http://severus.the.tl/severus.html", go);
    server = Severus.server;
    server.get_all_listings = function(callback) {
      return server("find", {
        "_type": "listing"
      }, callback);
    };
    render = {
      main: function() {
        var add_listing, map_div;
        map_div = render.google_map();
        add_listing = html.add_listing();
        body.append(add_listing);
        return body.append($("<!--<a href=\"javascript:$('iframe').attr('src','http://severus.the.tl/auth/twitter');void(0);\">Login with Twitter</a>-->\n\n<a href=\"javascript:Severus.login()\">Login with facebook</a>"));
      },
      google_map: function() {
        var div_map, latlng, myOptions;
        div_map = html.div().attr("id", "map").css({
          width: 800,
          height: 500,
          position: 'absolute',
          left: 300,
          top: 0
        });
        body.append(div_map);
        latlng = new google.maps.LatLng(33.4222685, -111.8226402);
        myOptions = {
          zoom: 11,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        return (map = new google.maps.Map(document.getElementById("map"), myOptions));
      },
      remove_adding_markers: function() {
        var _a, _b, _c, _d, i;
        _a = []; _c = adding_markers;
        for (_b = 0, _d = _c.length; _b < _d; _b++) {
          i = _c[_b];
          _a.push(i.setMap(null));
        }
        return _a;
      },
      add_google_map_marker: function(my_listing, callback) {
        var bubble_open, handle_marker_click, loc, marker, marker_options;
        loc = new google.maps.LatLng(my_listing.lat, my_listing.lng);
        marker_options = {
          position: loc,
          map: map,
          title: "hello world"
        };
        if (my_listing._user === username) {
          marker_options.draggable = true;
          marker_options.icon = "apartment.png";
        }
        marker = new google.maps.Marker(marker_options);
        if (my_listing.is_new === true) {
          render.remove_adding_markers();
          adding_markers.push(marker);
        }
        bubble_open = function() {
          var _a, _b, _c, blubbles, bubble, bubbly, info;
          info = ("<pre>\n<span class=\"bubble location\">" + (my_listing.location) + "</span>\n<span class=\"bubble size\">" + (my_listing.size) + "</span>\n<span class=\"bubble price\">" + (my_listing.price) + "</span>\n<span class=\"bubble desc\">" + (my_listing.desc) + "</span>\n</pre>");
          bubble = new google.maps.InfoWindow({
            content: info
          });
          _b = bubbles;
          for (_a = 0, _c = _b.length; _a < _c; _a++) {
            bubbly = _b[_a];
            bubbly.close();
          }
          blubbles = [];
          bubbles.push(bubble);
          bubble.open(map, marker);
          return (my_listing.bubble = bubble);
        };
        handle_marker_click = function() {
          bubble_open();
          console.log(my_listing);
          return my_listing._user === username ? set_current_listing(my_listing) : null;
        };
        google.maps.event.addListener(marker, "click", handle_marker_click);
        return my_listing.is_new === true ? bubble_open() : null;
      }
    };
    return (html = {
      div: function() {
        return $("<div><" + "/div>");
      },
      input: function() {
        return $("<input />");
      },
      br: function() {
        return $("<br />");
      },
      span: function() {
        return $("<span><\/span>");
      },
      button: function() {
        return $('<input type="button" />');
      },
      add_listing: function() {
        var listing_div, save_listing_button;
        listing_div = add_listing_form();
        save_listing_button = listing_div.find("#save_listing");
        listing_div.find("#location").typed({
          wait: 2000,
          callback: function(text) {
            var updater;
            updater = {};
            updater[$(this).attr("id")] = $(this).val();
            return set(listing, updater);
          }
        });
        listing_div.find("input[type='text'], textarea").keyup(function(e) {
          var updater;
          if ($(this).attr("id") !== "location") {
            updater = {};
            updater[$(this).attr("id")] = $(this).val();
            return set(listing, updater);
          }
        });
        save_listing_button.click(function() {
          var location, price;
          location = $(".add.location").val();
          price = $(".add.location").val();
          return Listing.save(listing, function(ret) {
            listing._id = ret;
            return listing.bubble.close();
          });
        });
        return listing_div;
      },
      add_listing_form: (add_listing_form = function() {
        return $("<pre>\n<select id=\"for_lease\">\n  <option>For Lease</option>\n  <option>For Purchase</option>\n</select>\nLocation\n<input id=\"location\" type=\"text\">\nSize\n<input id=\"size\" type=\"text\">\nPrice\n<input id=\"price\" type=\"text\">\nDescription\n<textarea id=\"desc\"></textarea>\n<select id=\"built_out\">\n  <option>Built out</option>\n  <option>Not built out</option>\n</select>\nYoutube Video\n<input id=\"youtube\" />\n<a href=\"#\">Add another youtube video</a>\n<input type=\"button\" id=\"save_listing\" value=\"Save\"/>\n</pre>");
      })
    });
  });
})();
