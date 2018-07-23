(function() {

  var width = 960,
      height = 160,
      legendWidth = 300,
      legendHeight = 50,
      cellSize = 17,
      percentFormat = d3.format(".1%"),
      dateFormat = d3.timeFormat("%Y-%m-%d");

  var maxcount;

  var color = d3.scaleLinear()
    .range(["#e1eef6", "#004e66"])
    .domain([0.5,1]);

  var date = d3.select("#header")
    .append("div")
    .attr("class", "date");

  var years = [2013, 2014, 2015, 2016, 2017];
  var svg_year = {2013: {}, 2014: {}, 2015: {}, 2016: {}, 2017: {}};

  years.forEach(function(year, i) {

    var key = d3.select('#legend_' + year.toString())
      .append("svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight)

    var legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#e1eef6")
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#004e66")
      .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight - 30)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,10)");

    key.append("text")
      .attr("transform", "translate(0, 45)")
      .attr("class", "text-legend")
      .text("Less Crime");

    key.append("text")
      .attr("transform", "translate(" + (legendWidth - 58) + ", 45)")
      .attr("class", "text-legend")
      .text("More Crime");


    var svg = d3.select("#crime_calendar_" + year.toString())
      .selectAll("svg")
      .data([year])
      .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    svg_year[year] = svg;

    svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });

    var rect = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
      .selectAll("rect")
      .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("rect")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
        .attr("y", function(d) { return d.getDay() * cellSize; })
        .on("mouseover",showDate)
        .on("mouseout",hideDate)
        .datum(dateFormat);

    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
      .selectAll("path")
      .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("d", pathMonth);

    d3.csv("data/crime_calendar_" + year.toString() + ".csv", function(error, csv) {
      if (error) throw error;

      csv.forEach(function(d) {
        d.count = parseInt(d.count);
      });

      max_count = d3.max(csv, function(d) { return d.count; });

      var data = d3.nest()
        .key(function(d) { return d.date; })
        .rollup(function(d) { return Math.sqrt(d[0].count / max_count); })
        .object(csv);

      rect.filter(function(d) { return d in data; })
          .attr("fill", function(d) { return color(data[d]); });
    });
  });

  drawAnnotation();

  function pathMonth(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
      d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
  }

  function showDate(d) {
    date.append("text")
        .html("Date: " + d);
  }

  function hideDate() {
    date.selectAll("text").remove();
  }

  function drawAnnotation() {
    svg_year["2013"].append("g")
      .selectAll("circle")
      .data([new Date("2013-12-26")])
      .enter().append("circle")
        .attr("r", cellSize/1.2)
        .attr("cx", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize + cellSize/2; })
        .attr("cy", function(d) { return d.getDay() * cellSize + cellSize/2; })
        .attr("class", "circle_annotation")
        .datum(dateFormat);

    svg_year["2013"].append("g")
      .selectAll("polyline")
      .data([new Date("2013-12-26")])
      .enter().append("polyline")
        .attr("points", function(d) { return getX(d) + "," + getY(d, -cellSize/1.2)
                                    + " " + getX(d) + "," + getY(d, -75)
                                    + " " + getX(d, -120) + "," + getY(d, -75); })
        .attr("class", "line_annotation")
        .datum(dateFormat);

    svg_year["2013"].append("g")
      .selectAll("text")
      .data([new Date("2013-12-26")])
      .enter().append("text")
        .attr("transform", function(d) { return "translate(" + getX(d, -120) + "," + getY(d, -75 - 5) + ")"; })
        .attr("class", "text_annotation")
        .text("Christmas Day")
        .datum(dateFormat);

    svg_year["2014"].append("g")
      .selectAll("circle")
      .data([new Date("2014-12-26")])
      .enter().append("circle")
        .attr("r", cellSize/1.2)
        .attr("cx", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize + cellSize/2; })
        .attr("cy", function(d) { return d.getDay() * cellSize + cellSize/2; })
        .attr("class", "circle_annotation")
        .datum(dateFormat);

    svg_year["2014"].append("g")
      .selectAll("polyline")
      .data([new Date("2014-12-26")])
      .enter().append("polyline")
        .attr("points", function(d) { return getX(d) + "," + getY(d, -cellSize/1.2)
                                    + " " + getX(d) + "," + getY(d, -92)
                                    + " " + getX(d, -120) + "," + getY(d, -92); })
        .attr("class", "line_annotation")
        .datum(dateFormat);

    svg_year["2014"].append("g")
      .selectAll("text")
      .data([new Date("2014-12-26")])
      .enter().append("text")
        .attr("transform", function(d) { return "translate(" + getX(d, -120) + "," + getY(d, -92 - 5) + ")"; })
        .attr("class", "text_annotation")
        .text("Christmas Day")
        .datum(dateFormat);

    svg_year["2017"].append("g")
      .selectAll("circle")
      .data([new Date("2017-11-24")])
      .enter().append("circle")
        .attr("r", cellSize/1.2)
        .attr("cx", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize + cellSize/2; })
        .attr("cy", function(d) { return d.getDay() * cellSize + cellSize/2; })
        .attr("class", "circle_annotation")
        .datum(dateFormat);

    svg_year["2017"].append("g")
      .selectAll("polyline")
      .data([new Date("2017-11-24")])
      .enter().append("polyline")
        .attr("points", function(d) { return getX(d) + "," + getY(d, -cellSize/1.2)
                                    + " " + getX(d) + "," + getY(d, -92)
                                    + " " + getX(d, -140) + "," + getY(d, -92); })
        .attr("class", "line_annotation")
        .datum(dateFormat);

    svg_year["2017"].append("g")
      .selectAll("text")
      .data([new Date("2017-11-24")])
      .enter().append("text")
        .attr("transform", function(d) { return "translate(" + getX(d, -140) + "," + getY(d, -92 - 5) + ")"; })
        .attr("class", "text_annotation")
        .text("Thanksgiving Day")
        .datum(dateFormat);
  }

  function getX(d, dx=0) {
    var x = d3.timeWeek.count(d3.timeYear(d), d) * cellSize + cellSize/2 + dx;
    return x.toString();
  }

  function getY(d, dy=0) {
    var y = d.getDay() * cellSize + cellSize/2 + dy;
    return y.toString();
  }

})();
