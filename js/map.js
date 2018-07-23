(function() {
  var width = 650,
      mapHeight = 350,
      margin = {top:10, right:200, bottom:10, left:200},
      sliderHeight = 100 - margin.top - margin.bottom,
      sliderWidth = width - margin.right - margin.left;

  var globalData;
  var radius = 5;
  var stroke = 1;

  var startYear = 2013,
      endYear = 2017;

  var map = d3.select("#map_container")
    .append("svg")
    .attr("id", "map_svg")
    .attr("width", width)
    .attr("height", mapHeight);

  var slider = d3.select("#slider_container")
    .append("svg")
      .attr("width", sliderWidth + margin.left + margin.right)
      .attr("height", sliderHeight)
    .append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + sliderHeight / 2 + ")");

  var x = d3.scaleLinear()
    .domain([startYear, endYear])
    .range([0, sliderWidth])
    .clamp(true);

  slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() { update(x.invert(d3.event.x)); }));

  slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
      .data(x.ticks(5))
      .enter()
      .append("text")
      .attr("x", x)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });

  var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

  var label = slider.append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .text(startYear)
      .attr("transform", "translate(0," + (-25) + ")");

  var projection = d3.geoMercator()
    .scale(45000)
    .center([-104.85475249999999, 39.76442327445411])
    .translate([width/2, mapHeight/2]);

  var path = d3.geoPath().projection(projection);

  var features = map.append("g")
    .attr("class", "features");

  var zoom = d3.zoom()
      .scaleExtent([1, 10000])
      .on("zoom",zoomed);

  var tooltip = d3.select("#map_container")
    .append("div").attr("class","tooltip");

  var color = d3.scaleOrdinal(d3.schemeCategory20c);

  map.call(zoom);

  d3.json("data/denver.json", function(error, denver) {
    if (error) return console.error(error);

    features.selectAll("path")
      .data(topojson.feature(denver, denver.objects.denver).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", "city-boundary");

      d3.csv("data/murder.csv", function(error, murder) {
        if (error) return console.error(error);

        globalData = murder.sort(function(a,b) {
            return d3.ascending(a.YEAR, b.YEAR);
          });

        drawEvents(murder.filter(function(d) {
          return d.YEAR <= 2013
        }));
      });
  });

  function drawEvents(data){
    var events = features.selectAll(".event")
      .data(data);

    events.enter()
      .append("circle")
      .attr("cx", function (d) { return projection([d.GEO_LON, d.GEO_LAT])[0]; })
      .attr("cy", function (d) { return projection([d.GEO_LON, d.GEO_LAT])[1]; })
      .attr("class", "event")
      .style("stroke-width", stroke + "px")
      .on("mouseover",showTooltip)
      .on("mousemove",moveTooltip)
      .on("mouseout",hideTooltip)
      .attr("r", radius/2 + "px")
        .transition().duration(400)
          .attr("r", radius + "px");

    events.exit()
      .transition().duration(400)
        .attr("r", radius/4 + "px")
          .remove();
  }

  function update(hx){

    if(hx % 1 != 0){
      hx = Math.round(hx)
    }

    handle.attr("cx", x(hx));
    label.attr("x", x(hx)).text(Math.floor(hx));

    var newData = globalData.filter(function(d) {
      return d.YEAR <= hx;
    });

    drawEvents(newData);
  }

  function zoomed() {
    radius = 5 / d3.event.transform.k;
    stroke = 1 /d3.event.transform.k;

    features.attr("transform", d3.event.transform)
      .selectAll("path")
      .style("stroke-width", 1 / d3.event.transform.k + "px");

    features.attr("transform", d3.event.transform)
      .selectAll("circle")
      .attr("r", radius + "px")
      .style("stroke-width", stroke + "px");
  }

  var tooltipOffset = {x: 10, y: -55};

  function showTooltip(d) {
    moveTooltip();

    tooltip.style("display","block")
      .append("text")
        .html("Neighborhood: " + d.NEIGHBORHOOD_ID + "<br>" + "Year: " + d.YEAR);
  }

  function moveTooltip() {
    tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
        .style("left",(d3.event.pageX+tooltipOffset.x)+"px");
  }

  function hideTooltip() {
    tooltip.style("display","none");
    tooltip.selectAll("text").remove();
  }
})();
