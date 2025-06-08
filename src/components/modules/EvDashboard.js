import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import BarChart from "../charts/BarChart";
import PieChart from "../charts/PieChart";
import LineChart from "../charts/LineChart";
import D3BarChart from "../d3charts/D3BarChart";
import D3LineChart from "../d3charts/D3LineChart";
import D3PieChart from "../d3charts/D3PieChart";
import "../styles/EvDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faPlug,
  faBatteryFull,
  faIndustry,
  faTachometerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Form } from "react-bootstrap";

const EvDashboard = () => {
  const [evData, setEvData] = useState([]);
  const [error, setError] = useState(null);
  const [useD3, setUseD3] = useState(false);
  const [evByYear, setEvByYear] = useState({});
  const [evByType, setEvByType] = useState({});
  const [evByMake, setEvByMake] = useState({});
  const [evByCounty, setEvByCounty] = useState({});
  const [evByUtility, setEvByUtility] = useState({});
  const [evByPriceRange, setEvByPriceRange] = useState({});
  const [summary, setSummary] = useState({
    total: 0,
    popularMake: "",
    avgRange: 0,
    bevs: 0,
    phevs: 0,
  });

  const toggleChartLibrary = () => {
    setUseD3((prev) => !prev);
  };

  useEffect(() => {
    Papa.parse(
      `${process.env.PUBLIC_URL}/Electric_Vehicle_Population_Data.csv`,
      {
        download: true,
        header: true,
        delimiter: ",",
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("Parsing errors:", results.errors);
            setError("Error parsing CSV data.");
          } else {
            const rawData = results.data;
            const cleanedData = rawData.filter(
              (row) =>
                row["Make"] &&
                row["Electric Range"] &&
                row["Model Year"] &&
                row["Base MSRP"]
            );
            const totalEVs = cleanedData.length;

            const { bevs, phevs } = cleanedData.reduce(
              (acc, row) => {
                if (
                  row["Electric Vehicle Type"] ===
                  "Battery Electric Vehicle (BEV)"
                )
                  acc.bevs += 1;
                if (
                  row["Electric Vehicle Type"] ===
                  "Plug-in Hybrid Electric Vehicle (PHEV)"
                )
                  acc.phevs += 1;
                return acc;
              },
              { bevs: 0, phevs: 0 }
            );

            const popularMake = cleanedData.reduce((acc, row) => {
              acc[row["Make"]] = (acc[row["Make"]] || 0) + 1;
              return acc;
            }, {});
            const topMake = Object.keys(popularMake).reduce((a, b) =>
              popularMake[a] > popularMake[b] ? a : b
            );

            const avgRange =
              cleanedData.reduce(
                (sum, row) => sum + parseInt(row["Electric Range"] || 0, 10),
                0
              ) / totalEVs;

            setSummary({
              total: totalEVs,
              popularMake: topMake,
              avgRange: avgRange.toFixed(2),
              bevs: bevs,
              phevs: phevs,
            });

            setEvByYear(
              cleanedData.reduce((acc, row) => {
                acc[row["Model Year"]] = (acc[row["Model Year"]] || 0) + 1;
                return acc;
              }, {})
            );

            setEvByType(
              cleanedData.reduce((acc, row) => {
                acc[row["Electric Vehicle Type"]] =
                  (acc[row["Electric Vehicle Type"]] || 0) + 1;
                return acc;
              }, {})
            );

            setEvByMake(
              cleanedData.reduce((acc, row) => {
                acc[row["Make"]] = (acc[row["Make"]] || 0) + 1;
                return acc;
              }, {})
            );

            setEvByCounty(
              cleanedData.reduce((acc, row) => {
                acc[row["County"]] = (acc[row["County"]] || 0) + 1;
                return acc;
              }, {})
            );

            setEvByUtility(
              cleanedData.reduce((acc, row) => {
                acc[row["Electric Utility"]] =
                  (acc[row["Electric Utility"]] || 0) + 1;
                return acc;
              }, {})
            );

            const priceData = cleanedData.map((row) =>
              parseFloat(row["Base MSRP"])
            );
            const maxPrice = Math.max(...priceData);
            const startPrice = 30000;
            const rangeStep = 5000;
            const priceRanges = {};

            for (let i = startPrice; i <= maxPrice; i += rangeStep) {
              const rangeLabel = `$${i}-${i + rangeStep}`;
              priceRanges[rangeLabel] = 0;
            }

            cleanedData.forEach((row) => {
              const baseMSRP = parseFloat(row["Base MSRP"]);
              const rangeStart =
                Math.floor((baseMSRP - startPrice) / rangeStep) * rangeStep +
                startPrice;
              const rangeLabel = `$${rangeStart}-${rangeStart + rangeStep}`;
              if (priceRanges[rangeLabel] !== undefined) {
                priceRanges[rangeLabel] += 1;
              }
            });

            setEvByPriceRange(priceRanges);
          }
        },
        error: (err) => {
          console.error("PapaParse Error:", err);
          setError("Error fetching CSV file.");
        },
      }
    );
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ev-dashboard container">
      <h1 className="text-warning">Electric Vehicle Dashboard</h1>

      <div className="card-header text-success text-center">
        <h2>Summary Statistics</h2>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <p>
            <FontAwesomeIcon icon={faCar} className="me-2 text-primary" />
            <strong>Total EVs:</strong> {summary.total}
          </p>
        </div>
        <div className="col-md-4 mb-3">
          <p>
            <FontAwesomeIcon
              icon={faBatteryFull}
              className="me-2 text-success"
            />
            <strong>BEVs:</strong> {summary.bevs}
          </p>
        </div>
        <div className="col-md-4 mb-3">
          <p>
            <FontAwesomeIcon icon={faPlug} className="me-2 text-warning" />
            <strong>PHEVs:</strong> {summary.phevs}
          </p>
        </div>
        <div className="col-md-4 mb-3">
          <p>
            <FontAwesomeIcon icon={faIndustry} className="me-2 text-info" />
            <strong>Most Popular Manufacturer:</strong> {summary.popularMake}
          </p>
        </div>
        <div className="col-md-4 mb-3">
          <p>
            <FontAwesomeIcon
              icon={faTachometerAlt}
              className="me-2 text-dark"
            />
            <strong>Average Electric Range:</strong> {summary.avgRange} miles
          </p>
        </div>
      </div>

      <div className="d-flex justify-content-end align-items-center mb-3">
        <div className="text-end">
          <Form.Check
            type="switch"
            id="chart-library-switch"
            label={useD3 ? "Showing D3.js Charts" : "Showing Chart.js Charts"}
            checked={useD3}
            onChange={toggleChartLibrary}
          />
          <small className="text-primary">
            Switch to view charts using {useD3 ? "Chart.js" : "D3.js"}
          </small>
        </div>
      </div>

      {/* Chart Sections with toggle support */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0 text-center">
                Electric Vehicles by Year
              </h5>
            </div>
            <div className="card-body">
              {useD3 ? (
                <D3LineChart data={evByYear} />
              ) : (
                <LineChart data={evByYear} />
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">
                Electric Vehicle Types Distribution
              </h5>
            </div>
            <div className="card-body">
              {useD3 ? (
                <D3PieChart
                  data={evByType}
                  title="Electric Vehicle Types Distribution"
                />
              ) : (
                <PieChart
                  data={evByType}
                  title="Electric Vehicle Types Distribution"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">Electric Vehicles by Make</h5>
            </div>
            <div className="card-body">
              {useD3 ? (
                <D3BarChart
                  data={evByMake}
                  xAxisLabel="Car Make"
                  yAxisLabel="Number of EVs"
                  title="Electric Vehicles by Manufacturer"
                />
              ) : (
                <BarChart
                  data={evByMake}
                  xAxisLabel="Car Make"
                  yAxisLabel="Number of EVs"
                  title="Electric Vehicles by Manufacturer"
                />
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">Electric Vehicles by County</h5>
            </div>
            <div className="card-body">
              {useD3 ? (
                <D3BarChart
                  data={evByCounty}
                  xAxisLabel="County"
                  yAxisLabel="Number of EVs"
                  title="Electric Vehicles by County"
                />
              ) : (
                <BarChart
                  data={evByCounty}
                  xAxisLabel="County"
                  yAxisLabel="Number of EVs"
                  title="Electric Vehicles by County"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">
                Electric Vehicles by Utility Provider
              </h5>
            </div>
            <div className="card-body">
              {useD3 ? (
                <D3PieChart
                  data={evByUtility}
                  title="Electric Vehicles by Utility Provider"
                />
              ) : (
                <PieChart
                  data={evByUtility}
                  title="Electric Vehicles by Utility Provider"
                />
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">
                Electric Vehicles by Price Range
              </h5>
            </div>
            <div className="card-body">
              {useD3 ? (
                <D3BarChart
                  data={evByPriceRange}
                  xAxisLabel="Price Range"
                  yAxisLabel="Number of EVs"
                  title="Electric Vehicles by Price Range"
                />
              ) : (
                <BarChart
                  data={evByPriceRange}
                  xAxisLabel="Price Range"
                  yAxisLabel="Number of EVs"
                  title="Electric Vehicles by Price Range"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvDashboard;
