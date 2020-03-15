const Voronoi = require("voronoi");
const bresenham = require("bresenham");
const hp = require("harry-plotter");
const Bezier = require('bezier-js');

var voronoi = new Voronoi();

var num_v = 512
var num_c = 16
var curve_num_points = 1024

lcg_sequence = function(seed, max, min, length) {
    max = max || 1;
    min = min || 0;
    var result = []
    var i=0;
    for (i=0; i < length; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;
     
        result.push(min + rnd * (max - min));
        seed++
    }
    return result;
 
}

var nums = lcg_sequence(num_v, num_v, 0, num_v).slice(0, num_c).sort((a, b) => a - b);
var line_nums = lcg_sequence(num_v, curve_num_points / 2, 0, curve_num_points).slice(0, num_v).sort((a, b) => a - b);
var offset_nums = lcg_sequence(num_v, curve_num_points / 2, 10, curve_num_points);

var reds = lcg_sequence(num_v, 0, 255, num_v)
var greens = lcg_sequence(num_c, 0, 255, num_v)
var blues = lcg_sequence(curve_num_points, 0, 255, num_v)

var plotter = new hp.JimpPlotter('./demo.png', num_v * 2, num_v * 2);
var prev_curve_points 
var sid = 0

function street_id() {
  sid++
  return sid
}

plotter.init(function() {

  var i = 0
  var j = 0
  var colour = {red: 0, green: 100, blue: 0} 
  var streets = []
  for (i=0; i < num_c; i++) {
    var curve = new Bezier(nums[i], 0, 
                           num_v , num_v * 2,
                           num_v+nums[i], 0);
    var curve_points = curve.getLUT(curve_num_points * 2)
    streets.push({id: street_id(),
                  type: 'bezier',
                  geometry: curve,
                  junctions: []})
  }

  var explored = []

  var cols = []

  lines_of_doom()
  across()
  explore(streets, 1)
  plotter.write();

  function lines_of_doom() {
    for (i=1; i < num_c; i++) {
      var lines = []
      for (j=0; j < curve_num_points - 100; j+=50) {
        var k=j // Math.floor(line_nums[j]);
        var offset=100; // Math.floor(offset_nums[j]);
        var curve_points = streets[i].geometry.getLUT(curve_num_points)
        var prev_curve_points = streets[i-1].geometry.getLUT(curve_num_points)
        var street = {id: street_id(),
                      type: 'bresenham',
                      junctions: [{id: streets[i].id, address: k},
                                  {id: streets[i-1].id, address: k+offset}],
                      geometry: {start: {x: curve_points[k].x,
                                         y: curve_points[k].y},
                                 end:   {x: prev_curve_points[k+offset].x,
                                         y: prev_curve_points[k+offset].y}}}
        // Join to existing curve streets
        streets[i].junctions.push({id: street.id, address: k})
        streets[i-1].junctions.push({id: street.id, address: k+offset})
        streets.push(street)
        var line = bresenham(street.geometry.start.x, 
                             street.geometry.start.y,
                             street.geometry.end.x, 
                             street.geometry.end.y)
        lines.push(street)
      }
      cols.push(lines)
    }
  }

  function across() {

    var c = 0
    var counter = 0;
    var colour_index = 0;
    for (c=1; c < cols.length; c++) {
      var col = cols[c];
      var col_p = cols[c-1];
      var l = 0;
      for (l=0; l < col.length; l++) {
        // var colour = {red: reds[colour_index], 
        //               green: greens[colour_index],
        //               blue: blues[colour_index]} 
       var street = {id: street_id(),
                    type: 'bresenham',
                    junctions: [{id: col_p[l].id, address: 0}, 
                                {id: col[l].id, address: -1}], 
                    geometry: {start: {x: col_p[l].geometry.start.x,
                                       y: col_p[l].geometry.start.y},
                               end:   {x: col[l].geometry.start.x,
                                       y: col[l].geometry.start.y}}}

       streets.push(street)
      }
      var final = col_p[l-1].length
       var final_street = {id: street_id(),
                    type: 'bresenham',
                    junctions: [{id: col_p[l-1].id, address: 0}, 
                                {id: col[l-1].id, address: -1}], 
                    geometry: {start: {x: col_p[l-1].geometry.end.x,
                                       y: col_p[l-1].geometry.end.y},
                               end:   {x: col[l-1].geometry.end.x,
                                       y: col[l-1].geometry.end.y}}}
       streets.push(final_street)

    }
  } 

function explore(streets, street_id) {
  if (explored.includes(street_id)) {
    return
  }
  var match = streets.find(function(s) {
    if (s.id == street_id) {
      return true
    } else {
      return false
    }
  })
    if (typeof match !== 'undefined') {
      render(match)
      explored.push(match.id)
      match.junctions.forEach(junction => explore(streets, junction.id))
    }
}

function render(street) {
    var points
    if (street.type === 'bezier') {
      points = street.geometry.getLUT(curve_num_points * 2)
    } else {
      console.log('street', street)
      points = bresenham(street.geometry.start.x,
                         street.geometry.start.y,
                         street.geometry.end.x,
                         street.geometry.end.y)
    }
    plotter.plot_points(points, colour);        
}

function render_all(streets) {
  streets.forEach(street => render(street))
}

})

