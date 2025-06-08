// D3BarChart.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const D3BarChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(Object.keys(data))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(data))])
      .nice()
      .range([height, 0]);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chart
      .append("g")
      .selectAll("rect")
      .data(Object.entries(data))
      .join("rect")
      .attr("x", (d) => x(d[0]))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => height - y(d[1]))
      .attr("width", x.bandwidth())
      .attr("fill", "steelblue");

    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    chart.append("g").call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={ref} width={500} height={300} />;
};

export default D3BarChart;
