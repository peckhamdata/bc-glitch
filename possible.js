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

// var sites = [];
// var i = 0;
// for (i = 0; i < num_v; i++) {
//     sites.push({x:xes[i], y:yes[i]});
// }

// var bbox = {xl: 0, xr: num_v, yt: 0, yb: num_v}; 
// var diagram = voronoi.compute(sites, bbox);

var plotter = new hp.JimpPlotter('./demo.png', num_v * 2);
var prev_curve_points 
plotter.init(function() {

  var i = 0
  var j = 0
  var colour = {red: 0, green: 100, blue: 0} 

  var curves = []
  for (i=0; i < num_c; i++) {
    var curve = new Bezier(nums[i], 0, 
                           num_v , num_v * 2,
                           num_v+nums[i], 0);
    var curve_points = curve.getLUT(curve_num_points)
    plotter.plot_points(curve_points, colour);        
    curves.push(curve)
  }

  // Curves of Doom
  var cols = []

  lines_of_doom()
  // curves_of_doom()
  fill()

  plotter.write();

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
    var r = 0
    var colour_index = 0;
    for (r=1; r < cols.length; r++) {
      var col = cols[r];
      var l = 0;
      for (l=0; l < col.length; l++) {
        var line = col[l]

          // For each point in the line
          // 
                colour_index = (r * 19) + l 
                var colour = {red: reds[colour_index], 
                              green: greens[colour_index],
                              blue: blues[colour_index]} 
                plotter.plot_points(line, colour);
                plotter.img_path = colour_index + '.png'
                plotter.write()


        // line.forEach(function(point) {
        //       // console.log(point)

        //       var foo = curves[l-1].getLUT(curve_num_points).find(function(e) {
        //           // console.log(Math.floor(point.y), Math.floor(e.y))
        //           if (Math.floor(point.y) === Math.floor(e.y)) {
        //             return true
        //           } else {
        //             return false
        //           }
        //       })
        //       if (typeof foo !== 'undefined') {
        //         colour_index = (r * num_c) + l 
        //         var colour = {red: reds[colour_index], 
        //                       green: greens[colour_index],
        //                       blue: blues[colour_index]} 
        //         var line = bresenham(foo.x, 
        //                              foo.y,
        //                              point.x, 
        //                              point.y)
        //         plotter.plot_points(line, colour);
        //         plotter.img_path = colour_index + '.png'
        //         plotter.write()

        //         } 
        //   })


      }
    }
  }
})
      // For each Y in line
      // Get corresponding Y in line i=1
      // Draw line from corresponding X to X in line
      // for (i=1; i < 2; i++) {
      //   console.log(row)
        // row.forEach(function(point) {
        //       // console.log(point)

        //       var foo = curves[i-1].getLUT(curve_num_points).find(function(e) {
        //           // console.log(Math.floor(point.y), Math.floor(e.y))
        //           if (Math.floor(point.y) === Math.floor(e.y)) {
        //             return true
        //           } else {
        //             return false
        //           }
        //       })
        //       if (typeof foo !== 'undefined') {
        //         colour_index = (v * num_c) + i 
        //         var colour = {red: reds[colour_index], 
        //                       green: greens[colour_index],
        //                       blue: blues[colour_index]} 
        //         var line = bresenham(foo.x, 
        //                              foo.y,
        //                              point.x, 
        //                              point.y)
        //         plotter.plot_points(line, colour);
        //         plotter.img_path = colour_index + '.png'
        //         plotter.write()

        //         } else {
        //           console.log(foo)
        //         }
        //   })
//       }
//     }
//   }
// })

























  //   diagram.edges.forEach(function(edge, i){
  //       var line = bresenham(edge.va.x, edge.va.y, edge.vb.x, edge.vb.y);
  //       var colour = {red: 0, green: 100, blue: 0} 
  //           plotter.plot_points(line, colour);
  //   })

  // var colour = {red: 0, green: 100, blue: 0} 
  // sites.forEach(function(site, i) {
  //   if (i < sites.length-1) {
  //     var midx
  //     var midy
  //     if (site.x > sites[i+1].x) {
  //       midx = site.x - ((site.x - sites[i+1].x/2))
  //     } else {
  //       midx = site.x + ((site.x - sites[i+1].x/2))
  //     }

  //     if (site.y > sites[i+1].y) {
  //       midy = site.y - ((site.y - sites[i+1].y/2))
  //     } else {
  //       midy = site.y + ((site.y - sites[i+1].y/2))
  //     }

  //     var curve = new Bezier(site.x, site.y, 
  //                            midx, midy,
  //                            sites[i+1].x, sites[i+1].y);
  //     var colour = {red: 0, green: 100, blue: 0} 
  //     var curve_points = curve.getLUT(1024)
  //     plotter.plot_points(curve_points, colour);
  //   }
  // });  
  // plotter.write();
  // diagram.edges.forEach(function(edge){
  //     var line = bresenham(edge.va.x, edge.va.y, edge.vb.x, edge.vb.y);
  //     var colour = {red: 0, green: 100, blue: 0} 
  //     plotter.plot_points(line, colour);
  // })

  // for (i=0; i < num_v/2; i++) {
  //     var curve = new Bezier(sites[i].x, sites[i].y, 
  //                            sites[num_v-1].x, sites[num_v-1].y,
  //                            sites[num_v-1-i].x, sites[num_v-1-i].y);
  //     var colour = {red: 0, green: 100, blue: 0} 
  //     var curve_points = curve.getLUT(1024)
  //     plotter.plot_points(curve_points, colour);        
  // }
  // diagram.edges.forEach(function(edge, i){
  //     if (i > 1 && i < 20) {
  //         var curve = new Bezier(edge.va.x, edge.va.y, edge.lSite.x, edge.lSite.y, edge.vb.x, edge.vb.y);
  //         var colour = {red: 0, green: 100, blue: 0} 
  //         var curve_points = curve.getLUT(1024)
  //         plotter.plot_points(curve_points, colour);
  //         var line = bresenham(curve_points[0].x, 
  //                              curve_points[0].y,
  //                              curve_points[curve_points.length/2].x,
  //                              curve_points[curve_points.length/2].y)
          // plotter.plot_points(line, colour);
  //     }
  // })

