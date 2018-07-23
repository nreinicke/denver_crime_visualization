(function() {
  var barChart = d3.select("#overview_svg"),
      margin = {top: 20, right: 20, bottom: 120, left: 40},
      chartWidth = +barChart.attr("width") - margin.left - margin.right,
      chartHeight = +barChart.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([10, chartWidth]).padding(0.2),
      y = d3.scaleLinear().rangeRound([chartHeight, 0]);

  var g = barChart.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3.select("#crime_by_type_chart")
      .append("div").attr("class","tooltip");

  d3.csv("data/overview.csv", function(d) {
    d.count = +d.count;
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(data.map(function(d) { return d.offense; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );;

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10))
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Count");

    g.append("g")
          .attr("class","grid")
          .attr("transform","translate(0," + chartHeight + ")")
          .style("stroke-dasharray",("3,3"))
          .call(make_x_gridlines()
                .tickSize(-chartHeight)
                .tickFormat("")
             );

    g.append("g")
        .attr("class","grid")
        .style("stroke-dasharray",("3,3"))
        .call(make_y_gridlines()
              .tickSize(-chartWidth)
              .tickFormat("")
           );

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .on("mouseover",showTooltip)
        .on("mousemove",moveTooltip)
        .on("mouseout",hideTooltip)
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.offense); })
        .attr("y", function(d) { return y(d.count); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return chartHeight - y(d.count); });

    function make_x_gridlines() {
        return d3.axisBottom(x)
        	.ticks(13)
    }

    function make_y_gridlines() {
      return d3.axisLeft(y)
      	.ticks(10)
    }

    var tooltipOffset = {x: 5, y: -35};

    function showTooltip(d) {
      moveTooltip();

      tooltip.style("display","block")
        .append("text")
          .html("Count: " + d.count);
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
