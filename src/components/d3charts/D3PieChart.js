// D3PieChart.js
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const D3PieChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 300,
      height = 300,
      radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value((d) => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const chart = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    chart
      .selectAll("path")
      .data(pie(Object.entries(data)))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "white")
      .style("stroke-width", "2px");
  }, [data]);

  return <svg ref={ref}></svg>;
};

export default D3PieChart;
