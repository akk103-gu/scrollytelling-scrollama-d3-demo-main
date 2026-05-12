// using d3 for convenience
var main = d3.select("main");
var scrolly = main.select("#scrolly1");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// Select all scrolly images for activation
const images = document.querySelectorAll('.scrolly-image');

function showImage(imageId) {
    images.forEach(img => {
        img.classList.toggle('active', img.id === imageId);
    });
}

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
    // 1. update height of step elements
    var stepH = Math.floor(window.innerHeight * 0.75);
    step.style("min-height", stepH + "px");

    // 3. tell scrollama to update new element dimensions
    scroller.resize();
}

// scrollama event handlers

var toolTipState = 'title';

/*
scrollama magic happens here:
- based on the index, trigger a certiain function from d3-animations.js
- sometimes only fire an event when going down or up in the story
*/ 
function handleStepEnter(response) {
    console.log(response);
    // response = { element, direction, index }
    let currentIndex = response.index;
    let currentDirection = response.direction;

    // add color to current step only
    step.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // Show image if data-image attribute is present
    const imageId = response.element.getAttribute('data-image');
    if (imageId) {
        showImage(imageId);
    }

}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function() {
        Stickyfill.add(this);
    });
}

function init() {
    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();

    // 2. setup the scroller passing options
    // 		this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly1 article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // setup resize event
    window.addEventListener("resize", handleResize);
}

var unemploymentSteps = d3.selectAll("#scrolly-unemployment article .step");
var scrollerUnemployment = scrollama();
scrollerUnemployment
    .setup({ step: "#scrolly-unemployment article .step", offset: 0.5 })
    .onStepEnter(function(response) {
        unemploymentSteps.classed("is-active", function(d, i) {
            return i === response.index;
        });
        const stepName = response.element.getAttribute("data-step");
        if (stepName) updateUnemployment(stepName);
    });

var wagesSteps = d3.selectAll("#scrolly-wages article .step");
var scrollerWages = scrollama();
scrollerWages
    .setup({ step: "#scrolly-wages article .step", offset: 0.5 })
    .onStepEnter(function(response) {
        wagesSteps.classed("is-active", function(d, i) {
            return i === response.index;
        });
        const stepName = response.element.getAttribute("data-step");
        if (stepName) updateWages(stepName);
    });

// kick things off
init();