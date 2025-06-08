// D3LineChart.js
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const D3LineChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const x = d3.scalePoint().domain(Object.keys(data)).range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(data))])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chart
      .append("path")
      .datum(Object.entries(data))
      .attr("fill", "none")
      .attr("stroke", "#ff9900")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    chart.append("g").call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={ref} width={500} height={300} />;
};

export default D3LineChart;
