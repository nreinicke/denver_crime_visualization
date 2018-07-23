(function() {
  var svg = d3.select("#crime_over_time_svg"),
    margin = {top: 20, right: 20, bottom: 20, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear()
    .rangeRound([25, width]);

  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  var line = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.crime_per_person); })

  var tooltip = d3.select("#crime_over_time_chart")
      .append("div").attr("class","tooltip");

  d3.csv("data/crime_over_time.csv", function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.year; }));
    y.domain(d3.extent(data, function(d) { return d.crime_per_person; })).nice();

    g.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

    g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "translate(200,50)")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Crime Incidents Per Person");

    g.append("g")
          .attr("class","grid")
          .attr("transform","translate(0," + height + ")")
          .style("stroke-dasharray",("3,3"))
          .call(make_x_gridlines()
                .tickSize(-height)
                .tickFormat("")
             );

    g.append("g")
        .attr("class","grid")
        .style("stroke-dasharray",("3,3"))
        .call(make_y_gridlines()
              .tickSize(-width)
              .tickFormat("")
           );

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#004e66")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    g.selectAll("circle")
      .data(data)
      .enter().append("circle")
        .on("mouseover",showTooltip)
        .on("mousemove",moveTooltip)
        .on("mouseout",hideTooltip)
        .attr("fill", "#004e66")
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return y(d.crime_per_person); })
        .attr("r", 5);

    function make_x_gridlines() {
        return d3.axisBottom(x)
        	.ticks(5)
    }

    function make_y_gridlines() {
      return d3.axisLeft(y)
    }

    var tooltipOffset = {x: 5, y: -35};

    function showTooltip(d) {
      moveTooltip();

      tooltip.style("display","block")
        .append("text")
          .html("Incidents Per Person: " + d.crime_per_person);
    }

    function moveTooltip() {
      tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
          .style("left",(d3.event.pageX+tooltipOffset.x)+"px");
    }

    function hideTooltip() {
      tooltip.style("display","none");
      tooltip.selectAll("text").remove();
    }

  });
})();
