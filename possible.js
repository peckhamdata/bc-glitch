const Voronoi = require("voronoi");
const bresenham = require("bresenham");
const hp = require("harry-plotter");
const Bezier = require('bezier-js');

var voronoi = new Voronoi();

var num_v = 512
var num_c = 20

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
console.log(nums)
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
                           num_v , num_v * 1.5,
                           num_v+nums[i], 0);
    var curve_points = curve.getLUT(100)
    plotter.plot_points(curve_points, colour);        
    curves.push(curve)
  }
  var k = 10

  for (i=1; i < curves.length; i++) {
    var curve_points = curves[i].getLUT(100)
    var prev_curve_points = curves[i-1].getLUT(100)
    console.log(curve_points[k], prev_curve_points[k])
    var line = bresenham(curve_points[k].x, 
                         curve_points[k].y,
                         prev_curve_points[k].x, 
                         prev_curve_points[k].y)
    plotter.plot_points(line, colour);
    k+=1;
    // lines.push(line)
  }

  plotter.write();

  // var i = 2; 
  // for (j=0; j < rows[i].length; j++) {
  //   var line_2 = bresenham(rows[i][j][0].x, rows[i][j][0].y,
  //                          rows[i][j][rows[i][j].length-1].x, 
  //                          rows[i][j][rows[i][j].length-1].y)
  //   var colour_2 = {red: 100, green: 0, blue: 0} 
  //   plotter.plot_points(line_2, colour_2);
  // }
  // plotter.write();

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

})