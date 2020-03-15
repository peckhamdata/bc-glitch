const Voronoi = require("voronoi");
const bresenham = require("bresenham");
const hp = require("harry-plotter");
const Bezier = require('bezier-js');
const Jimp = require('jimp');

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

var plotter = new hp.JimpPlotter('./demo.png', 1364, num_v * 2);
var prev_curve_points 
var sid = 0

function street_id() {
  sid++
  return sid
}

Jimp.read('background.png')
  .then(image => { 
    // At this point we have the image
    plotter.jimp = image

    var i = 0
    var j = 0
    var colour = {red: 0, green: 100, blue: 0} 
    var rotation = 512
    for (j=0; j < rotation; j++) {
      var colour = {red: reds[1], 
                    green: greens[1],
                    blue: blues[1]} 
    
      var curves = []
    
      for (i=0; i < num_c; i++) {
        var curve = new Bezier(nums[i]+j, 0, 
                               num_v , num_v * 2,
                               num_v+nums[i]-j, 0);
        var curve_points = curve.getLUT(curve_num_points * 2)
        plotter.plot_points(curve_points, colour)
        curves.push(curve)
      }

      // Curves of Doom
      var cols = []

      lines_of_doom()
      // curves_of_doom()
      fill()

      var filename = ('0000'+ j).slice(-4);
      plotter.img_path = filename + '.png'
      plotter.write();

      for (i=0; i < num_c; i++) {
        var curve = new Bezier(nums[i]+j, 0, 
                               num_v , num_v * 2,
                               num_v+nums[i]-j, 0);
        var curve_points = curve.getLUT(curve_num_points * 2)
        plotter.plot_points(curve_points, {red: 0, green: 0, blue: 0} )

      }

    }


    function curves_of_doom() {
      for (i=2; i < curves.length; i++) {
        var lines = []
        for (j=0; j < line_nums.length; j+=1) {
          var k=Math.floor(line_nums[j] * 4);
          var offset=Math.floor(offset_nums[j] * 4);
          var curve_points = curves[i].getLUT(curve_num_points)
          var prev_curve_points = curves[i-2].getLUT(curve_num_points)
          var curve = new Bezier(curve_points[k].x, 
                                 curve_points[k].y,
                                 prev_curve_points[k+Math.floor(k/2)].x, 
                                 prev_curve_points[k+Math.floor(k/2)].y,
                                 prev_curve_points[k+offset].x, 
                                 prev_curve_points[k+offset].y)
          plotter.plot_points(curve.getLUT(100), colour);
        }

      }
    }

    function lines_of_doom() {
      var i
      var j
      for (i=1; i < curves.length; i++) {
        var lines = []
        for (j=0; j < curve_num_points - 100; j+=50) {
          var k=j // Math.floor(line_nums[j]);
          var offset=100; // Math.floor(offset_nums[j]);
          var curve_points = curves[i].getLUT(curve_num_points)
          var prev_curve_points = curves[i-1].getLUT(curve_num_points)
          var line = bresenham(curve_points[k].x, 
                               curve_points[k].y,
                               prev_curve_points[k+offset].x, 
                               prev_curve_points[k+offset].y)
          plotter.plot_points(line, colour);
          lines.push(line)
        }
        cols.push(lines)
      }
    }

    function fill() {
      var c = 0    
      var counter = 0;
      var colour_index = 0;
      for (c=1; c < cols.length; c++) {
        var col = cols[c];
        var l = 0;
        for (l=1; l < 19; l++) {

          var line = col[l]
          var prev_line = col[l-1]

          var p = 0;
          for(p=0; p < prev_line.length; p++) {
            var match = line.find(function(e) {
              if (Math.floor(prev_line[p].y) === Math.floor(e.y)) {
                return true
              } else {
                return false
              }
            })
            if (typeof match === 'undefined') {
              // Look for a match in the next curve
              var match = curves[c-1].getLUT(curve_num_points).find(function(e) {
                    if (Math.floor(prev_line[p].y) === Math.floor(e.y)) {
                      return true
                    } else {
                      return false
                    }
              })
            }
            if (typeof match !== 'undefined') {
              var colour = {red: reds[colour_index], 
                                 green: greens[colour_index],
                                 blue: blues[colour_index]} 
              plotter.plot_points(bresenham(match.x, 
                                            match.y,
                                            prev_line[p].x, 
                                            prev_line[p].y), colour);
            }
          }
            colour_index++

        }
      }
    } 

  })

// })
