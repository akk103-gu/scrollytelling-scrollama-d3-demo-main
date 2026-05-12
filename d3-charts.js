const margin = { top: 65, right: 30, bottom: 40, left: 50 };

function makeDims(containerId) {
    const el = document.getElementById(containerId);
    const totalW = el.clientWidth || 700;
    const totalH = Math.round(totalW * 0.75);
    const w = totalW - margin.left - margin.right;
    const h = totalH - margin.top - margin.bottom;
    return { w, h };
}

// ---- MANUFACTURING SHARE CHART ----
(function() {
    const { w, h } = makeDims("unemployment-viz");
    const parseDate = d3.timeParse("%Y-%m-%d");

    const svg = d3.select("#unemployment-viz").append("svg")
        .attr("viewBox", `0 0 ${w + margin.left + margin.right} ${h + margin.top + margin.bottom}`)
        .attr("width", "100%")

    svg.append("text")
        .attr("x", (w + margin.left + margin.right) / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#f2e8dc")
        .attr("font-size", "20px")
        .text("Manufacturing as Share of Total Employment");

    svg.append("text")
        .attr("class", "chart-subtitle")
        .attr("x", (w + margin.left + margin.right) / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#f2e8dc")
        .attr("font-size", "14px")
        .attr("opacity", 0.65)
        .text("Represents jobs in manufacturing as a percentage of the total workforce.");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(manufacturingShareData, d => parseDate(d.date)))
        .range([0, w]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(manufacturingShareData, d => d.value) * 1.1])
        .range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + "%"));

    const line = d3.line()
        .x(d => x(parseDate(d.date)))
        .y(d => y(d.value));

    g.append("path")
        .datum(manufacturingShareData)
        .attr("class", "unemployment-line")
        .attr("fill", "none")
        .attr("stroke", "#f2e8dc")
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("opacity", 0);

    window.updateUnemployment = function(stepName) {
        if (stepName === "baseline") {
            g.select(".unemployment-line")
                .transition().duration(800).attr("opacity", 1);
        }
    };
})();

// ---- WAGES COMPARISON CHART ----
(function() {
    const { w, h } = makeDims("wages-viz");
    const parseDate = d3.timeParse("%Y-%m-%d");

    const svg = d3.select("#wages-viz").append("svg")
        .attr("viewBox", `0 0 ${w + margin.left + margin.right} ${h + margin.top + margin.bottom}`)
        .attr("width", "100%");

    svg.append("text")
        .attr("x", (w + margin.left + margin.right) / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#f2e8dc")
        .attr("font-size", "20px")
        .text("Real Hourly Wages: Manufacturing vs. All Private Industries");

    svg.append("text")
        .attr("class", "chart-subtitle")
        .attr("x", (w + margin.left + margin.right) / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#f2e8dc")
        .attr("font-size", "14px")
        .attr("opacity", 0.65)
        .text("Adjusted for inflation. White = average manufacturing worker wages, Red = average of all non-supervisory wages.");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(wagesData, d => parseDate(d.date)))
        .range([0, w]);

    const yMin = d3.min(wagesData, d => Math.min(d.manufacturing, d.all)) * 0.95;
    const yMax = d3.max(wagesData, d => Math.max(d.manufacturing, d.all)) * 1.05;

    const y = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => "$" + d));

    const lineMfg = d3.line()
        .x(d => x(parseDate(d.date)))
        .y(d => y(d.manufacturing));

    const lineAll = d3.line()
        .x(d => x(parseDate(d.date)))
        .y(d => y(d.all));

    g.append("path")
        .datum(wagesData)
        .attr("class", "wages-mfg-line")
        .attr("fill", "none")
        .attr("stroke", "#f2e8dc")
        .attr("stroke-width", 2)
        .attr("d", lineMfg)
        .attr("opacity", 0);

    g.append("path")
        .datum(wagesData)
        .attr("class", "wages-all-line")
        .attr("fill", "none")
        .attr("stroke", "#A6055D")
        .attr("stroke-width", 2)
        .attr("d", lineAll)
        .attr("opacity", 0);

    // Manufacturing breakpoints (3rd text box)
    const mfgBreakData = [85, 285, 625, 721]
        .filter(i => i < wagesData.length)
        .map(i => wagesData[i]);

    g.selectAll(".break-mfg-rule")
        .data(mfgBreakData)
        .enter().append("line")
        .attr("class", "break-mfg-rule")
        .attr("x1", d => x(parseDate(d.date)))
        .attr("x2", d => x(parseDate(d.date)))
        .attr("y1", d => y(d.manufacturing))
        .attr("y2", h)
        .attr("stroke", "#f2e8dc")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 3")
        .attr("opacity", 0);

    g.selectAll(".break-mfg")
        .data(mfgBreakData)
        .enter().append("circle")
        .attr("class", "break-mfg")
        .attr("cx", d => x(parseDate(d.date)))
        .attr("cy", d => y(d.manufacturing))
        .attr("r", 6)
        .attr("fill", "#f2e8dc")
        .attr("opacity", 0);

    // All-industry breakpoints (4th text box)
    const allBreakData = [50, 190, 300, 415, 540, 660, 721]
        .filter(i => i < wagesData.length)
        .map(i => wagesData[i]);

    g.selectAll(".break-all-rule")
        .data(allBreakData)
        .enter().append("line")
        .attr("class", "break-all-rule")
        .attr("x1", d => x(parseDate(d.date)))
        .attr("x2", d => x(parseDate(d.date)))
        .attr("y1", d => y(d.all))
        .attr("y2", h)
        .attr("stroke", "#A6055D")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 3")
        .attr("opacity", 0);

    g.selectAll(".break-all")
        .data(allBreakData)
        .enter().append("circle")
        .attr("class", "break-all")
        .attr("cx", d => x(parseDate(d.date)))
        .attr("cy", d => y(d.all))
        .attr("r", 6)
        .attr("fill", "#A6055D")
        .attr("opacity", 0);

    window.updateWages = function(stepName) {
        if (stepName === "baseline") {
            g.select(".wages-mfg-line")
                .transition().duration(800).attr("opacity", 1);
        }
        if (stepName === "step1") {
            g.select(".wages-all-line")
                .transition().duration(800).attr("opacity", 1);
        }
        if (stepName === "mfg-breaks") {
            g.selectAll(".break-mfg-rule, .break-mfg")
                .transition().duration(600).attr("opacity", 1);
        }
        if (stepName === "all-breaks") {
            g.selectAll(".break-all-rule, .break-all")
                .transition().duration(600).attr("opacity", 1);
        }
    };
})();
