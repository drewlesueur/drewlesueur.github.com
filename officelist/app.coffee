map = ""
body = $ "body"
window.map = map
window.body = body
render = ""
adding_markers = []
bubbles = []
get_location = (wherethe, callback) ->
  geocoder = new google.maps.Geocoder()
  geocoder.geocode address: wherethe, (results, status) ->
    if status is google.maps.GeocoderStatus.OK
      callback(results[0].geometry.location)
    else
      alert "there was a looking up problem"

listings = []
window.lisitngs = listings

listing =  # the listing you are adding
  is_new: true
  _user: ""
  size: ""
  price: ""
  desc: ""
  _type: "listing"
  
window.listing = listing

set_current_listing = (my_listing) ->
  listing = my_listing
  $("#location").val listing.location
  $("#size").val listing.size
  $("#price").val listing.price
  $("#desc").val listing.desc
  window.listing = listing
  
server = ""

set = (obj, vals) ->
  _.extend obj, vals
  type = _.capitalize obj._type
  if window[type]? and window[type].set
    window[type].set obj, vals
  else
    console.log obj, type, window[type]




Listing = 
  set: (listing, vals) ->
    _.each vals, (v, k) ->
      listing[k] = v #whatever the global listing is now
      if k is "location"
        loc = get_location v, (loc) ->
          listing.lat = loc.lat()
          listing.lng = loc.lng()
          render.add_google_map_marker listing
          map.setCenter loc
      if listing.bubble && listing.bubble.view
        $(".bubble.#{k}").text v

  save: (listing, callback) ->
    if listing.bubble
      old_bubble = listing.bubble
      delete listing.bubble
      delete listing.is_new
    #server "update", {va: listing, wh: {id: listing._id}, "upsert" : true }, callback
    server "addedit", listing, () ->
      listing.bubble = old_bubble
      callback()
  
window.Listing = Listing

$(window).load () ->
  go = () ->
    window.username = "fix thiss"
    #listing._user = username or "what"
    server.get_all_listings (listings) ->
      for listing in listings
        render.add_google_map_marker listing
      
    Severus.ajax
      type: "GET",
      url: "json"
      success: (data) ->
        console.log data
      error: (data) ->
        console.log "error"
       
    
    render.main()
        
   
  #Severus.initialize("http://localhost:86/severus.html", go)
  Severus.initialize("http://severus.the.tl/severus.html", go)
  #Severus.initialize("http://apidoc.the.tl", go)
  server = Severus.server
  
  server.get_all_listings = (callback) ->
    server "find", {"_type": "listing"}, callback

  render =
    main: () ->
      map_div = render.google_map()
      add_listing = html.add_listing()
      
      body.append add_listing
      body.append $ """
      <!--<a href="javascript:$('iframe').attr('src','http://severus.the.tl/auth/twitter');void(0);">Login with Twitter</a>-->
      
      <a href="javascript:Severus.login()">Login with facebook</a>
      """
      
    google_map: () ->
      div_map = html.div().attr("id", "map").css
        width: 800
        height: 500
        position: 'absolute'
        left: 300
        top: 0
      body.append div_map
      
      latlng = new google.maps.LatLng(33.4222685, -111.8226402)
      myOptions = {
        zoom: 11,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById("map"),myOptions)
    
    remove_adding_markers: () ->
      for i in adding_markers
        i.setMap null 

    add_google_map_marker: (my_listing, callback) ->
      loc = new google.maps.LatLng my_listing.lat, my_listing.lng
      marker_options = 
        position: loc
        map: map
        title: "hello world"
        
      
      if my_listing._user is username
        marker_options.draggable = true
        marker_options.icon = "apartment.png"
      marker = new google.maps.Marker marker_options
       
      if my_listing.is_new is true
        render.remove_adding_markers()
        adding_markers.push marker
      
      bubble_open = () ->
        info = """
        <pre>
        <span class="bubble location">#{my_listing.location}</span>
        <span class="bubble size">#{my_listing.size}</span>
        <span class="bubble price">#{my_listing.price}</span>
        <span class="bubble desc">#{my_listing.desc}</span>
        </pre>
        """ 
        bubble = new google.maps.InfoWindow
          content: info
        for bubbly in bubbles
          bubbly.close()
        blubbles = []
        bubbles.push bubble
        bubble.open map, marker
        my_listing.bubble = bubble
        
      handle_marker_click = () ->
        bubble_open()
        console.log my_listing
        if my_listing._user is username
          set_current_listing my_listing
      google.maps.event.addListener marker, "click", handle_marker_click   
      if my_listing.is_new is true
        bubble_open()

    
      
      
  html = 
    div : () ->
      $("<div><"+"/div>")
    input: () ->
      $("<input />")
    br: ->
      $("<br />")
    span:  ->
      $("<span><\/span>")
    button: () ->
      $('<input type="button" />')
    
    add_listing: () ->
      listing_div = add_listing_form()
      save_listing_button =listing_div.find "#save_listing"
      
      listing_div.find("#location").typed
        wait: 2000
        callback: (text) ->
          updater = {}
          updater[$(this).attr("id")] = $(this).val()
          set listing, updater
      listing_div.find("input[type='text'], textarea").keyup (e) ->
        if $(this).attr("id") != "location"
          updater = {}
          updater[$(this).attr("id")] = $(this).val()
          set listing, updater
          
      save_listing_button.click () ->
        location = $(".add.location").val()
        price = $(".add.location").val()
        Listing.save listing, (ret) ->
          listing._id = ret
          listing.bubble.close()
      return listing_div
    
    add_listing_form: add_listing_form = () ->
      $("""
      <pre>
      <select id="for_lease">
        <option>For Lease</option>
        <option>For Purchase</option>
      </select>
      Location
      <input id="location" type="text">
      Size
      <input id="size" type="text">
      Price
      <input id="price" type="text">
      Description
      <textarea id="desc"></textarea>
      <select id="built_out">
        <option>Built out</option>
        <option>Not built out</option>
      </select>
      Youtube Video
      <input id="youtube" />
      <a href="#">Add another youtube video</a>
      <input type="button" id="save_listing" value="Save"/>
      </pre>
      """)
    