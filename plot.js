
var width = 1900,
height = 1000;


// window.onresize = function () {
//     size = window.innerWidth / 2;
//     var scale = size / 500;
//     d3.select("svg").attr("width", size * 2).attr("height", size + 10).style("width", size * 2 + "px").style("height", size * 2 + "px");
//     d3.select("#map").attr("transform","scale(" + scale + ")");
// };


d3.json("neighborhoods.json", function(data) {
let neighborhoods_json = data;
var svg = d3.select('body')
.append('svg')
.attr('width', width)
.attr('height', height);

var neighborhoods = svg.append('g');

var albersProjection = d3.geoAlbers()
.scale(290000)
.rotate([71.057, 0])
.center([0, 42.313])
.translate([1100, height/2]);

var geoPath = d3.geoPath()
.projection(albersProjection);

var points = svg.append( "g" ).attr( "id", "points" );

neighborhoods.selectAll('path')
.data(neighborhoods_json.features)
.enter()
.append('path')
.attr('fill', 'grey')
.attr('d', geoPath);


d3.json('points.json', function(data){
let points_json = data
console.log(points_json.features[0].geometry.coordinates);
points.selectAll( "point" )
  .data( points_json.features )
  .enter()
  .append('circle')
  .attr( "cx", function(d){
    return albersProjection( d.geometry.coordinates )[0];
  })
  .attr( "cy", function(d){
    return albersProjection( d.geometry.coordinates )[1];
  })
  .attr("r",7)
  .attr('fill', 'red')
  });


});

const m = {
    width: 800,
    height: 600
}



const svg = d3.select("body").append('svg')
    .attr('width', m.width)
    .attr('height', m.height)

const g = svg.append('g')

d3.json('neighborhoods.json').then((data) => {

    const albersProj = d3.geoAlbers()
        .scale(190000)
        .rotate([71.057, 0])
        .center([0, 42.313])
        .translate([m.width/2, m.height/2]);

    const geoPath = d3.geoPath()
    .projection(albersProj)

    

    g.selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
        .attr('fill', '#ccc')
        .attr('d', geoPath)

    d3.json('points.json').then((pointData) => {
        g.selectAll('circle').data(pointData.features)
            .enter()
            .append('path')
                .attr('class', 'coord')
                .attr('fill', 'red')
                .attr('d', geoPath)
        
        const links = [];
        for (let i = 0; i < pointData.features.length - 1; i++) {
            const start = albersProj(pointData.features[i].geometry.coordinates)
            const end = albersProj(pointData.features[i + 1].geometry.coordinates)
            links.push({
                type: "LineString",
                coordinates: [
                    [start[0], start[1]],
                    [end[0], end[1]]
                ]
            })
        }

        const lines = svg.append('g');
        lines.selectAll('line')
            .data(links)
            .enter()
            .append('line')
                .attr("x1", d=>d.coordinates[0][0])
                .attr("y1", d=>d.coordinates[0][1])
                .attr("x2", d=>d.coordinates[1][0])
                .attr("y2", d=>d.coordinates[1][1])
                .attr("id", function(d, i) { return "line" + i})
                .attr("stroke", "steelblue")

        lines.selectAll('line').style('opacity', 0)

        d3.selectAll("line").style("opacity", "1")
        d3.selectAll("line").each(function(d, i) {
            let totalLength = d3.select("#line" + i).node().getTotalLength();
            d3.select("#line" + i).attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(500)
                .delay(220*i)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .style("stroke-width", 3)
        })

        

    })

    
})