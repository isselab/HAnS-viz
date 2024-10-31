/*
Copyright 2024 David Stechow & Philipp Kusmierz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const chartDom = document.getElementById('main');

const body = document.querySelector(".box");
/* nav elements */
const nav = document.querySelector(".nav"),
    searchIcon = document.querySelector("#searchIcon"),
    navOpenBtn = document.querySelector(".navOpenBtn"),
    navCloseBtn = document.querySelector(".navCloseBtn"),
    settingsBtn = document.querySelector(".settings"),
    refreshBtn = document.getElementById("refresh-button");

/* search elements */
const searchBox = document.querySelector(".search-box"),
    searchSettingsToggle = document.querySelector("#search-settings"),
    searchBoxSettings = document.querySelector(".search-box-settings"),
    closeSearchBtn = document.querySelector("#close-search"),
    innerSearchIcon = document.querySelector("#inner-search-icon"),
    searchbar = document.getElementById("searchbar"),
    regExCheckBox = document.getElementById("regExCheckBox"),
    incSearchCheckBox = document.getElementById("incrementalSearchCheckBox"),
    exactMatchCheckBox = document.getElementById("exactMatchCheckBox"),
    caseSensitiveCheckBox = document.getElementById("caseSensitiveCheckBox");

/* last Fetch Timestamp */
const lastFetchTimestamp = document.querySelector(".last-fetch-timestamp");

/* feature info window elements */
const featureInfoBtn = document.querySelector(".feature-info-button"),
    featureInfoPanel = document.querySelector(".feature-info-panel"),
    featureInfoWindow = document.querySelector(".feature-info-window"),
    featureInfoSideBar = document.querySelector("#toggleFeatureWindowDiv");

const fullPathBox = document.querySelector(".show-full-path");

const showScattering = document.querySelector(".show-scattering"),
    scatteringWindow = document.querySelector(".scattering-window"),
    hideScatteringWindow = document.querySelector(".hide-scattering");


/* settings */
const settingsBox = document.querySelector(".settings-box");

/* settings toggle elements */
const automatedFetchToggle = document.querySelector("#automated-fetch-toggle"),
    darkModeToggle = document.querySelector("#dark-mode-toggle"),
    lpqNameToggle = document.querySelector("#lpq-name-toggle"),
    circularTanglingToggle = document.querySelector("#circular-tangling-toggle")

/* settings helper */
const fetchingIntervalRange = document.querySelector("#automated-fetch-range"),
    fetchingIntervalValue = document.querySelector("#fetching-interval-value"),
    fetchingIntervalGetter = document.querySelector("#fetching-interval");

const state = {
    isInitialized: false,
    currentChart: 0,
    treeChart: 0,
    treeMapChart: 1,
    tanglingChart: 2,
    isDarkmode: false,
    isNav: false,
    isFeatureWindow: false,
    isFetching: false,
    showLpqNames: true,
    showTanglingAsNormalGraph: false,
    isAutoFetch: false,
    fetchIntervall: 600000,
    isSwitching: false,
    featureTimelineView: 3,   // New identifier for Features Timeline View
    deletedFeaturesView: 4,   // New identifier for Deleted Features View
    timelineChart: null,
    resizeListenerAdded: false,
}

const intervallFunctions = {
    fetch: null,
    updateTimestamp: null,
}

const jsonData = {
    tanglingData: "",
    treeData: "",
    featureHistoryData: "",
    deletedFeaturesData: ""
}

// Initialize dark mode here
darkModeToggle.classList.toggle("active", state.isDarkmode);
body.classList.toggle("dark-mode", state.isDarkmode);
lastFetchTimestamp.classList.toggle("dark-mode", state.isDarkmode);
chartDom.classList.toggle("dark-mode", state.isDarkmode);

//automatedFetchToggle.classList.toggle("active", state.isAutoFetch);
lpqNameToggle.classList.toggle("active", state.showLpqNames);
circularTanglingToggle.classList.toggle("active", state.showTanglingAsNormalGraph);

//TODO THESIS:
// get IDE theme and set it to state.isDarkmode before the following lines
var myChart = echarts.init(chartDom, state.isDarkmode ? "dark" : "");
var scatteringChart = echarts.init(scatteringWindow, state.isDarkmode ? "dark" : "");


var timestamp = new Date();

var option;


/* init eventlisteners */

/* navigation bar */
searchIcon.addEventListener("click", () => {
    searchBox.classList.toggle("openSearch");
    searchIcon.classList.add("openSearch");

    searchbar.focus();
    searchIcon.textContent = "search";
    searchBoxSettings.classList.remove("openSettings");

    if(searchbar.value !== "")
        highlightItem(searchbar.value);

});
navOpenBtn.addEventListener("click", () => {
    nav.classList.add("openNav");
    nav.classList.remove("openSearch");
    searchIcon.classList.replace("uil-times", "uil-search");
    chartDom.classList.add("dumb");
    settingsBox.classList.remove("active");
});
navCloseBtn.addEventListener("click", () => {
    nav.classList.remove("openNav");
    chartDom.classList.remove("dumb");
});
refreshBtn.addEventListener("click", () => {
    refreshData();
});
settingsBtn.addEventListener("click", () => {
    settingsBox.classList.toggle("active");
});

/* settings */
/* dark mode */
darkModeToggle.addEventListener("click", () => {
    toggleTheme();
    darkModeToggle.classList.toggle('active');
});

/* hide LPQ names */
lpqNameToggle.addEventListener("click", () => {
    toggleHideLpq();
});

circularTanglingToggle.addEventListener("click", () => {
    toggleTanglingGraphMode();
})

/* automated fetch */
automatedFetchToggle.addEventListener("click", () => {
    fetchingIntervalRange.classList.toggle("automated-fetch-disabled");
    automatedFetchToggle.classList.toggle('active');
    state.isAutoFetch = automatedFetchToggle.classList.contains("active");
    if(state.isAutoFetch){
        updateFetchIntervall();
    }
    else{
        //clear old fetch functions
        if(intervallFunctions.fetch != null) {
            clearInterval(intervallFunctions.fetch)
            intervallFunctions.fetch = null;
        }
    }
});
fetchingIntervalGetter.addEventListener("input", () => {
    let value = fetchingIntervalGetter.value;
    if(value <10){
        fetchingIntervalValue.textContent = " 0" + value + " min";
    }
    else fetchingIntervalValue.textContent = " " + value + " min";
});
fetchingIntervalGetter.addEventListener("change", () => {
    let value = fetchingIntervalGetter.value;
    updateFetchIntervall(value);
});

lpqNameToggle.addEventListener("click", () => {
    lpqNameToggle.classList.toggle('active');
})
circularTanglingToggle.addEventListener("click", () => {
    circularTanglingToggle.classList.toggle('active');
})

/* search */
searchSettingsToggle.addEventListener("click", () => {
    searchBoxSettings.classList.toggle("openSettings");
});
searchbar.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        let input = searchbar.value;
        highlightItem(input);
    }
});
searchbar.onkeyup = function () {
    if (searchbar.value === "") {
        highlightItem("");
    }
    else if(incSearchCheckBox.checked){
        highlightItem(searchbar.value);
    }
}
closeSearchBtn.addEventListener("click", () => {
    searchBox.classList.remove("openSearch");
    searchIcon.classList.remove("openSearch");
    searchBoxSettings.classList.remove("openSettings");
    highlightItem("");
});

/* feature info window */
// &begin[FeatureInfoWindow]
featureInfoSideBar.addEventListener("click", () => {
    featureInfoWindow.classList.toggle("openFeatureWindow");
    if(featureInfoWindow.classList.contains("openFeatureWindow")) {
        featureInfoBtn.textContent = "keyboard_double_arrow_left";
    }
    else {
        featureInfoBtn.textContent = "keyboard_double_arrow_right";
    }

});
// &end[FeatureInfoWindow]
// &begin[Scattering]
showScattering.addEventListener("click", () => {
    openScattering();
});
hideScatteringWindow.addEventListener("click", () => {
    closeScattering();
})
// &end[Scattering]

/* ECharts */
// Handle click event

addMainChartListener();
addScatteringChartListener();


// Handle resize event
window.addEventListener('resize', function () {
    // Resize the chart when the window size changes
    searchBoxSettings.classList.remove("openSettings");
    nav.classList.remove("openSearch");
    searchIcon.textContent = "search";
    myChart.resize();
    scatteringChart.resize();
});


//initialize first view
myChart.showLoading({text: "Loading..."});


/* functions */
/* UI helper functions */

/* Feature Info Window */

// &begin[FeatureInfoWindow]
function toggleFeatureWindow() {
    let featureWindow = document.getElementById("featureInfoDiv");
    state.isFeatureWindow = !state.isFeatureWindow;
    if (state.isFeatureWindow) {
        featureWindow.style.height = "40%"
        featureWindow.style.overflow = "auto";
    } else {
        featureWindow.style.height = "3%";
        featureWindow.style.overflow = "hidden";
    }
}

// &end[FeatureInfoWindow]

// &begin[FeatureInfoWindow]
function showFeatureInWindow(featureLpq) {
    var lpqNameText = document.getElementById("featureLpqNameText");
    var nameText = document.getElementById("featureNameText");
    var tanglingText = document.getElementById("tanglingText");
    var scatteringText = document.getElementById("scatteringText");
    var locationList = document.getElementById("featureLocationList");

    var featureData = getFeatureData(featureLpq);
    lpqNameText.innerText = featureData.id;
    nameText.innerText = featureData.name;
    tanglingText.innerText = featureData.tanglingDegree;
    scatteringText.innerText = featureData.scatteringDegree;

    while (locationList.firstChild) {
        locationList.removeChild(locationList.firstChild);
    }

    let listElements = [];
    for (const location of featureData.locations) {
        var listElement = document.createElement("li");
        //add path
        let pathName = document.createElement("p");
        pathName.addEventListener("mouseover", showFullPath);
        pathName.addEventListener("mouseout", disableFullPath);
        pathName.addEventListener("click", openPath);
        pathName.innerText = location.fileName;
        pathName.title = location.path;
        pathName.classList.add("pathName");
        pathName.classList.add("clickable");

        listElement.appendChild(pathName);

        //add blocks
        let blocks = [];
        for (const block of location.blocks) {
            let subListElement = document.createElement("li");
            let lines = document.createElement("p");
            lines.classList.add("line")
            lines.classList.add("clickable")
            lines.dataset.startOffset = block.start;
            lines.dataset.endOffset = block.end;
            lines.dataset.path = location.path;
            if(block.type === "file") {
                lines.innerText = "   Feature file";
                lines.addEventListener("click", ()=>{
                    requestData("openPath" + "," + lines.dataset.path, function(){}, false);
                });
            }
            else{

                if(block.start === block.end) lines.innerText = "   Line: " + (block.start + 1); // the \xa0 is just a whitespace to align the lines
                else lines.innerText = "  Line: " + (block.start + 1) + " - " + (block.end + 1);
                lines.addEventListener("click", ()=>{
                    requestData("openPath" + "," + lines.dataset.path + "," + lines.dataset.startOffset + "," + lines.dataset.endOffset, function(){}, false);
                })
            }


            subListElement.appendChild(lines);
            blocks.push(subListElement);
        }

        //sort blocks by starting line
        blocks.sort(function(liA, liB) {
            let lineA = liA.getElementsByTagName("p")[0].dataset.startOffset;
            let lineB = liB.getElementsByTagName("p")[0].dataset.startOffset;

            return lineA - lineB;
        })

        //add blocks to path
        for(let elem of blocks){
            listElement.appendChild(elem);
        }
        listElements.push(listElement);
    }

    //sort list elements
    listElements.sort(function(a, b) {
        let textA = a.getElementsByClassName("pathName")[0].innerText;
        let textB = b.getElementsByClassName("pathName")[0].innerText;

        return textA.toString().localeCompare(textB.toString());
    })
    //append each list element to main
    for(let elem of listElements){
        locationList.appendChild(elem);
    }
}

// &end[FeatureInfoWindow]

function showFullPath(e){
    var object = e.target;
    var rect = object.getBoundingClientRect();
    //
    fullPathBox.innerText = object.title;
    object.title = '';
    fullPathBox.style.left = (rect.x)+'px';
    fullPathBox.style.top = (rect.y-30)+'px';
    fullPathBox.classList.add("active");
}
function disableFullPath(e){
    fullPathBox.classList.remove("active");
    e.target.title = fullPathBox.innerText;
}
function openPath(e){
    requestData("openPath" + "," + fullPathBox.innerText, function(){}, false);
}

function addMainChartListener(){
    myChart.on('click', function (params) {
        onFeatureSelect(params);
    });

    myChart.on("contextmenu", function (params) {
        if(params.dataType !== "node" && params.dataType !== "main")
            return;
        requestData("highlightFeature," + params.data.id, myChart.hideLoading(), false);
        onFeatureSelect(params);
    })

    myChart.on("finished", function() {
        if(!state.isSwitching)
            return;
        state.isSwitching = false;
        if(searchbar.value !== "" && searchIcon.classList.contains("openSearch"))
            highlightItem(searchbar.value);
    })

    myChart.on("dblclick", function(params) {
        if(params.dataType !== "node" && params.dataType !== "main")
            return;
        openScattering();
    })
}

function addScatteringChartListener(){
    scatteringChart.on("click", function(params){
        if(params.dataType !== "node") return;
        requestData("openPath,"+params.data.id,function(){},false);

    })

    scatteringChart.on("contextmenu", function(params){
        if(params.dataType !== "node") return;
        requestData("highlightFeature," + params.data.id, scatteringChart.hideLoading(), false);

    })
}

function openScattering(){
    //get current feature lpq
    let lpqName = document.getElementById("featureLpqNameText").innerText;
    let feature = getFeatureData(lpqName);
    if(lpqName == "-")
        return;

    scatteringWindow.classList.add("active");
    let body = document.getElementById(" mainBody");
    body.classList.add("applyBackdrop");
    hideScatteringWindow.classList.add("active");
    // &begin[Scattering]
    scatteringChart.clear();
    let plotData = [];
    let links = [];
    plotData.push({
        id: feature.id,
        name: feature.name,
        type: "feature",
        scatteringDegree: feature.scatteringDegree,
        symbol: "image://./img/pluginIcon_bg_2.png",
        totalLines: feature.totalLines,
        lines: feature.lines,
    });

    for(let location of feature.locations){
        let counter = 0;
        for(let block of location.blocks){
            counter += block.end - block.start + 1;
        }

        let entry = {
            id: location.path,
            type: "location",
            name: location.fileName,
            blocks : location.blocks,
            /*TODO: lines does not work and always return 0 */
            symbol: "path://M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h287q16 0 30.5 6t25.5 17l194 194q11 11 17 25.5t6 30.5v447q0 33-23.5 56.5T720-80H240Zm280-560q0 17 11.5 28.5T560-600h160L520-800v160Z",
            lines: location.lines,
            coverage: location.lines / feature.lines
        }
        plotData.push(entry);

        links.push({
            source: feature.id,
            target: location.path,
            coverage: entry.coverage
        })
    }
    let size = 60;
    let scatterChartOptions = {
        title: {
            text: 'Scattering',
            subtext: 'Circular layout',
            top: 'bottom',
            left: '50%',
            textAlign: 'center'
        },
        tooltip: {
            show: true,
            position: function (pos, params, dom, rect, size) {
                // tooltip will be fixed on the right if mouse hovering on the left,
                // and on the left if hovering on the right.

                var obj = {bottom: window.getComputedStyle(scatteringWindow).getPropertyValue("border-radius")};
                obj['left'] = 5;
                return obj;
            },
            formatter: function (params) {
                /*TODO: show line locations on file hover*/
                if (params.dataType === "node") {
                    if(params.data.type === "feature")
                        return `${params.marker}${params.data.name}<br>Scattering Degree: ${params.data.scatteringDegree}<br>Total Lines: ${params.data.totalLines}`;
                    else
                        return `${params.marker}${params.data.id}<br>Feature Lines: ${params.data.lines}<br>Feature coverage: ${(params.data.coverage * 100).toFixed(2)}%`;

                } else {
                    let pathName = params.data.source === feature.id ? params.data.target : params.data.source;
                    return `Feature coverage: ${(params.data.coverage * 100).toFixed(2)}%<br>File:${pathName}:<br> `;
                }
            }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: '',
                type: 'graph',
                layout: "force",
                circular: {
                    rotateLabel: true
                },
                force: {
                    initLayout: "circular",
                    layoutAnimation: false,
                    repulsion: 700,
                    /*TODO: adjust edge length to size of nodes*/
                    edgeLength: [30, 100],
                },
                data: plotData.map(entry => {
                    if(entry.lines === feature.lines)
                        entry["symbolSize"] = size;
                    else
                        entry["symbolSize"] = [0.8 * size, size];
                    return entry;
                }),
                links: links.map(function (link) {
                    link.lineStyle = {
                        color: mixColors(stringToColour(link.source), stringToColour(link.target)),
                        width: link.coverage * size * 0.5 + 1,
                    }
                    return link;
                }),
                roam: true,
                label: {
                    show: true, // Show label by default
                    position: 'top',
                    formatter: function(params) {
                        if(state.showLpqNames && params.dataType === "node")
                            return `${params.data.id}`;
                        else
                            return`${params.data.name}`;
                    }
                },
                itemStyle: {
                    color: function (params) {
                        // Generate a random color
                        return stringToColour(params.data.id);
                    }
                },
                lineStyle: {
                    curveness: 0.3,
                    width: state.showTanglingAsNormalGraph ? 5 : 2
                },
                zoom: 0.7,
                emphasis: {
                    focus: 'adjacency',
                    label: {
                        position: 'top',
                        show: true,
                        fontSize: 30,
                        color: "#ffffff",
                        textBorderColor: "rebeccapurple",
                        textBorderWidth: 10,
                    }
                }
            }
        ]
    };
    scatterChartOptions && scatteringChart.setOption(scatterChartOptions);
    scatteringChart.resize();
    // &end[Scattering]
}
function closeScattering() {
    scatteringWindow.classList.remove("active");
    hideScatteringWindow.classList.remove("active");
    let body = document.getElementById(" mainBody");
    body.classList.remove("applyBackdrop");
}
function showInEditor(){
    var lpqNameText = document.getElementById("featureLpqNameText");
    requestData("highlightPsiElement" + "," + lpqNameText.innerText, function(){});
}

function toggleNav() {
    state.isNav ? closeNav() : openNav();
}

function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
    state.isNav = true;
}

function closeNav() {
    document.getElementById("mySidepanel").style.width = "0px";
    state.isNav = false;
}


/* toggle Theme -> dark mode -> light mode */
function toggleTheme() {
    //apply darkmode to the chart container
    var elem = document.getElementById("main");
    body.classList.toggle("dark-mode");
    elem.classList.toggle("dark-mode");

    state.isDarkmode = !state.isDarkmode;
    echarts.dispose(myChart);
    myChart = echarts.init(chartDom, state.isDarkmode ? "dark" : "");
    echarts.dispose(scatteringChart);
    scatteringChart = echarts.init(scatteringWindow, state.isDarkmode ? "dark" : "");


    // Handle click event
    addMainChartListener();
    addScatteringChartListener();

    switch (state.currentChart) {
        case state.treeChart: {
            toggleChart(state.treeChart, true);
            break;
        }
        case state.treeMapChart: {
            toggleChart(state.treeMapChart, true);
            break;
        }
        case state.tanglingChart: {
            toggleChart(state.tanglingChart, true);
            break;
        }
        case state.featureHistoryView: {
            toggleChart(state.featureHistoryView, true);
            break;
        }
        case state.featureTimelineView: {
            toggleChart(state.featureTimelineView, true);
            break;
        }
        case state.deletedFeaturesView: {
            toggleChart(state.deletedFeaturesView, true);
            break;
        }
        default:
            toggleChart(state.treeChart, true);
    }
}
/* Refresh after fetching new data */
function refresh() {
    myChart.showLoading();
    switch (state.currentChart) {
        case state.treeChart: {
            toggleChart(state.treeChart, true);
            break;
        }
        case state.treeMapChart: {
            toggleChart(state.treeMapChart, true);
            break;
        }
        case state.tanglingChart: {
            toggleChart(state.tanglingChart, true);
            break;
        }
        case state.featureTimelineView: {
            toggleChart(state.featureTimelineView, true);
            break;
        }
        case state.deletedFeaturesView: {
            toggleChart(state.deletedFeaturesView, true);
            break;
        }
        default:
            toggleChart(state.treeChart, true);
    }
    myChart.hideLoading();
    state.isFetching = false;
    timestamp = new Date();
    updateTimestamp();
    // getFeatureIndicesByString("File");
}

/* toggle hide LPQ for tangling chart */
function toggleHideLpq(){
    let before = state.showLpqNames;
    state.showLpqNames = !lpqNameToggle.classList.contains("active");
    //reload if it has changed and current chart is the tangling view
    if(before !== state.showLpqNames && state.currentChart === state.tanglingChart)
        toggleChart(state.tanglingChart, true);
}
/* toggles the tangling graph to either circular or non-circular graph*/
function toggleTanglingGraphMode(){
    let before = state.showTanglingAsNormalGraph;
    state.showTanglingAsNormalGraph = !circularTanglingToggle.classList.contains("active");
    //reload if it has changed and current chart is the tangling view
    if(before !== state.showTanglingAsNormalGraph && state.currentChart === state.tanglingChart)
        toggleChart(state.tanglingChart, true);
}

function updateTimestamp() {
    if(state.isFetching) {
        lastFetchTimestamp.textContent = "fetching...";
        return;
    }
    var currentTime = new Date();
    var timeDifference = currentTime - timestamp;
    if(timeDifference < 60000) {
        lastFetchTimestamp.textContent = "Last fetch few seconds ago";
    }
    else if(timeDifference >= 60000) {
        minutes = timeDifference / 60000;
        if(minutes<2) {
            lastFetchTimestamp.textContent = "Last fetch 1 minute ago";
        }
        else {
            lastFetchTimestamp.textContent = "Last fetch " + parseInt(minutes) + " minutes ago";
        }
    }
}

/* ECharts helper functions */
function toggleChart(chart, forceReload = false){
    if(!forceReload && chart === state.currentChart){
        return;
    }
    // Get references to the main and feature history content divs
    const mainDiv = document.getElementById('main');
    const featureHistoryContent = document.getElementById('featureHistoryContent');

    // Hide both divs initially
    mainDiv.style.display = 'none';
    featureHistoryContent.style.display = 'none';

    switch(chart){
        case state.treeMapChart:{
            mainDiv.style.display = 'block';
            openTreemapView();
            state.currentChart = state.treeMapChart;
            break;
        }
        case state.treeChart:{
            mainDiv.style.display = 'block';
            openTreeView();
            state.currentChart = state.treeChart;
            break;
        }
        case state.tanglingChart:{
            mainDiv.style.display = 'block';
            openTanglingView();
            state.currentChart = state.tanglingChart;
            break;
        }
        case state.featureTimelineView: {
            featureHistoryContent.style.display = 'block';
            openFeatureTimelineView();
            state.currentChart = state.featureTimelineView;
            break;
        }
        case state.deletedFeaturesView: {
            featureHistoryContent.style.display = 'block';
            openDeletedFeaturesView();
            state.currentChart = state.deletedFeaturesView;
            break;
        }
    }
    state.isSwitching = true;
}

function updateFetchIntervall(newIntervall){
    if(newIntervall !== undefined){
        //convert min to ms
        state.fetchIntervall = newIntervall * 60 * 1000;
    }
    if(state.isAutoFetch){
        //clear old intervall functions
        if(intervallFunctions.fetch !== null){
            clearInterval(intervallFunctions.fetch);
        }
        //set new intervall functions
        intervallFunctions.fetch = setInterval(refreshData, state.fetchIntervall);
    }

}
function waitForIndexing(){
    myChart.showLoading({text: "Wait for Indexing..."});
    lastFetchTimestamp.textContent = "Wait for Indexing...";
}


// &begin[DumbModeHandler]
function startPlotting() {
    if (state.isInitialized) {
        return;
    }
    state.isInitialized = true;
    state.isFetching = true;
    lastFetchTimestamp.textContent = "fetching..."
    //get latest data
    fetchAllData(function (code) {
        if (code === 0) {    //open start page
            state.isFetching = false;
            timestamp = new Date();
            updateTimestamp();
            // Timestamp refreshing interval
            intervallFunctions.updateTimestamp = setInterval(updateTimestamp, 10000);
            if(state.isAutoFetch)
                updateFetchIntervall()
            toggleChart(state.treeChart, true);
            myChart.hideLoading();
        } else {
            state.isFetching = false;
            alert("could not fetch data " + code)
        }
    });
}
// &end[DumbModeHandler]

/**
 * Fetches data from the BrowserResourceHandler
 * @param callback function which should be called after onSuccess
 */
function fetchAllData(callback) {
    //use callback function only in the last requestData
    requestData("tangling");
    requestData("tree", callback);
}

function refreshData(){
    state.isFetching = true;
    updateTimestamp();
    fetchAllData(refresh);
}

function onFeatureSelect(params) {
    //check type of clicked element
    var clickedNode = params.data;
    console.log('Clicked node:', clickedNode);
    showFeatureInWindow(clickedNode.id);
    //open window to show information about the clicked node
}

function highlightItem(input) {

    myChart.dispatchAction({
        type: "downplay",
        seriesIndex: 0
    });

    if (input === "")
        return;

    let isRegEx = regExCheckBox.checked;
    let isExact = exactMatchCheckBox.checked;
    let isCase = caseSensitiveCheckBox.checked;

    let indices = getFeatureIndicesByString(input, isRegEx, isExact, isCase);

    if(state.currentChart === state.treeChart || state.currentChart === state.treeMapChart){
        myChart.dispatchAction({
            type: "highlight",
            dataIndex: indices.hierarchical
        })
    }
    else {
        myChart.dispatchAction({
            type: "highlight",
            dataIndex: indices.nonHierarchical
        })
    }
}

function toggleSearchSettings(string){
    switch(string){
        case "incrementalSearch":{
            incSearchCheckBox.checked = !incSearchCheckBox.checked;
            break;
        }
        case "regEx":{
            regExCheckBox.checked = !regExCheckBox.checked;
            break;
        }
        case "exactMatch":{
            exactMatchCheckBox.checked = !exactMatchCheckBox.checked;
            break;
        }
        case "caseSensitive":{
            caseSensitiveCheckBox.checked = !caseSensitiveCheckBox.checked;
            break;
        }
    }
    triggerSearchSettingsChanged();
}

function triggerSearchSettingsChanged(){
    highlightItem(searchbar.value);
}

function getFeatureIndicesByString(string, isRegEx, isExactMatch, isCaseSensitive) {
    let result = {
        hierarchical: [],
        nonHierarchical: []
    }

    //get hierarchical indices
    for(const [index, feature] of jsonData.tanglingData.features.entries()){
        let featureName = feature.name.toString();

        //if current chart is a tree-like-chart then dont check for the lpq
        let featureLpq = (state.currentChart === state.treeChart || state.currentChart === state.treeMapChart) ? "" : feature.id.toString();
        let checkPattern = string.toString();

        //check reges
        if(isRegEx){
            let regEx = RegExp(checkPattern,
                isCaseSensitive ? "" : "i"
            )

            if(featureName.match(regEx) || featureLpq.match(regEx)){
                result.nonHierarchical.push(index);
                result.hierarchical.push(index + 1);
            }
        }
        //normal search
        else{
            if(!state.showLpqNames)
                featureLpq = "";
            if(!isCaseSensitive){
                featureName = featureName.toLowerCase();
                featureLpq = featureLpq.toLowerCase();
                checkPattern = checkPattern.toLowerCase();
            }

            if(isExactMatch){
                if (featureName === checkPattern || featureLpq === checkPattern) {
                    result.nonHierarchical.push(index);
                    result.hierarchical.push(index + 1);
                }
            }
            else{
                if(featureName.includes(checkPattern) || featureLpq.includes(checkPattern)){
                    result.nonHierarchical.push(index);
                    result.hierarchical.push(index + 1);
                }
            }
        }
    }

    return result;
}

function getTextColor(getInverse = false) {
    let light = "#17142c";
    let dark = "#ffffff"

    if (getInverse) {
        return state.isDarkmode ? light : dark;
    }
    return state.isDarkmode ? dark : light;
}
function getFeatureData(featureLpq) {
    return jsonData.tanglingData.features.find((feature) => {
        return feature.id === featureLpq;
    })

}



/* interface to Java-Code in HAnS-Viz */

// &begin[Request]
/**
 * requests data from the BrowserResourceHandler and calls handleData on success.
 * the callback function gets called with the status code  of 0 if success - otherwise it gets called with the error_code
 * @param option
 * @param callback function which should be called after request
 */
function requestData(option, callback, showLoading = true) {
    if(showLoading)
        myChart.showLoading({text: "fetching data"});
    window.java({
        request: option,
        persistent: false,
        onSuccess: function (response) {
            // response should contain JSON
            handleData(option, response);
            if (callback != null) {
                callback(0);
            }
        },
        onFailure: function (error_code, error_message) {
            alert("could not retrieve data for " + option + "  " + error_code + "  " + error_message)
            if (callback != null) {
                callback(error_code)
            }
            console.log(error_code, error_message);
            myChart.hideLoading();
        }
    })
}
// &end[Request]

// &begin[Request]
function handleData(option, response) {
    const data = JSON.parse(response);
    switch (option) {
        case "refresh":
            // handle refresh data
            break;
        case "tanglingdegree":
            // handle tangling degree data
            break;
        case "tangling":
            jsonData.tanglingData = JSON.parse(response);
            break;
        case "tree":
        case "treeMap":
            jsonData.treeData = JSON.parse(response);
            break;
        case "featureHistory":
            jsonData.featureHistoryData = JSON.parse(response);  // Parsed data stored here
            jsonData.deletedFeaturesData = JSON.parse(response).deletedFeatures; // Store deleted features data
            break;
    }

}

// &end[Request]

/* ECharts plotting functions */
// &begin[Coloring]
/**
 * String to color hashfunction to create consistent colors for features to make it not to random
 * @param str
 * @returns {string} colorcode which can be used
 */
const stringToColour = (str) => {
    let hash = 0;
    str.split('').forEach(char => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = '#'
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff
        colour += value.toString(16).padStart(2, '0')
    }
    return colour
}
// &end[Coloring]

// &begin[Coloring]
/**
 * Function that takes the average of two given colors
 * @param colorA
 * @param colorB
 * @param amount
 * @returns {string} average of both given colors
 */
function mixColors(colorA, colorB, amount = 0.5) {
    const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
    return '#' + r + g + b;
}

// &end[Coloring]

/**
 * Helperfunction to change properties to fit with echarts
 * @param feature
 * @returns {{children: *, name, locations, id, value}}
 */
function convertLineCountToValue(feature) {
    return {
        id: feature.id,
        name: feature.name,
        value: feature.totalLines,
        locations: feature.locations,
        children: feature.children.map(child => convertLineCountToValue(child)),
    }
}


// options for the tangling view
// &begin[Tangling]
function openTanglingView() {
    if (!state.isInitialized)
        return;
    myChart.clear();
    option = {
        title: {
            text: 'Tangling Degree',
            subtext: 'Circular layout',
            top: 'bottom',
            left: 'right'
        },
        tooltip: {
            show: true,
            formatter: function (params) {
                if (params.dataType === "node") {
                    return `${params.marker}${params.data.id}<br>Tangling Degree: ${params.data.tanglingDegree}<br>Scattering Degree: ${params.data.scatteringDegree}<br>Total Lines: ${params.data.totalLines}`;
                } else {
                    return `${params.data.source} > ${params.data.target}`;
                }
            }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: 'Tangling Degree',
                type: 'graph',
                layout: state.showTanglingAsNormalGraph ? "force" : "circular",
                circular: {
                    rotateLabel: true
                },
                force: {
                    initLayout: "circular",
                    layoutAnimation: false,
                    repulsion: 700,
                    edgeLength: [60, 200],
                },
                data: jsonData.tanglingData.features.map(node => {
                    node["symbolSize"] = Math.max(25 * Math.log2(node.tanglingDegree + 1), 10);
                    return node;
                }),
                links: jsonData.tanglingData.tanglingLinks.map(function (link) {
                    link.lineStyle = {
                        color: mixColors(stringToColour(link.source), stringToColour(link.target))
                    }
                    return link;
                }),
                roam: true,
                label: {
                    show: true, // Show label by default
                    position: 'top',
                    formatter: function(params) {
                        if(state.showLpqNames)
                            return `${params.data.id}`;
                        else
                            return`${params.data.name}`;
                    }
                },
                itemStyle: {
                    color: function (params) {
                        // Generate a random color
                        return stringToColour(params.data.id);
                    }
                },
                lineStyle: {
                    curveness: 0.3,
                    width: state.showTanglingAsNormalGraph ? 5 : 2
                },
                zoom: 0.7,
                emphasis: {
                    focus: 'adjacency',
                    label: {
                        position: 'top',
                        show: true,
                        fontSize: 30,
                        color: "#ffffff",
                        textBorderColor: "rebeccapurple",
                        textBorderWidth: 10,
                    }
                }
            }
        ]
    };
    option && myChart.setOption(option);
}

// &end[Tangling]

//options for the treemap view
// &begin[TreeMap]
function openTreemapView() {
    if (!state.isInitialized)
        return;
    myChart.clear();

    option = {
        title: {
            text: 'Feature Line Count',
            left: 'center'
        },
        tooltip: {
            formatter: function (info) {
                var value = info.value;
                var treePathInfo = info.treePathInfo;
                var treePath = [];
                for (var i = 1; i < treePathInfo.length; i++) {
                    treePath.push(treePathInfo[i].name);
                }
                return [
                    '<div class="tooltip-title">' +
                    echarts.format.encodeHTML(treePath.join('/')) +
                    '</div>',
                    '' + echarts.format.addCommas(value) + ' Lines'
                ].join('');
            }
        },
        series: [
            {
                name: 'Line-count',
                type: 'treemap',
                visibleMin: 300,
                label: {
                    show: true,
                    formatter: '{b}'
                },
                upperLabel: {
                    show: true,
                    height: 30
                },
                itemStyle: {
                    borderWidth: 5,
                    emphasis: {
                        borderColor: '#fafafa',
                    }
                },
                levels: getLevelOption(),
                data: jsonData.treeData.features.map(feature => convertLineCountToValue(feature)),
            }
        ]
    };
    option && myChart.setOption(option);
}

// &end[TreeMap]

//options for the tree view
// &begin[Tree]
function openTreeView() {
    if (!state.isInitialized)
        return;
    myChart.clear();
    option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
        series: [
            {
                type: 'tree',
                id: 0,
                name: 'tree1',
                data: jsonData.treeData.features,
                top: '10%',
                left: '20%',
                bottom: '22%',
                right: '20%',
                symbolSize: 7,
                edgeShape: 'polyline',
                edgeForkPosition: '63%',
                initialTreeDepth: 3,
                lineStyle: {
                    width: 2
                },
                itemStyle: {
                    color: "#483d8b"
                },
                label: {
                    backgroundColor: getTextColor(true),
                    color: getTextColor(),
                    position: 'left',
                    verticalAlign: 'middle',
                    align: 'right'
                },
                leaves: {
                    label: {
                        position: 'right',
                        verticalAlign: 'middle',
                        align: 'left'
                    }
                },
                emphasis: {
                    focus: 'self'
                },
                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750
            }
        ]
    };
    option && myChart.setOption(option);
}
// &end[Tree]

// &begin[FeatureHistory]

let allSeriesData = [];   // Copy of all data points for filtering
let codeAnnotationsData = [];
let fileMappingsData = [];
let folderMappingsData = [];
const MAX_FEATURES_DISPLAYED = 15; // Maximum number of features to display

function toggleSubmenu(event) {
    event.preventDefault();
    const submenu = event.currentTarget.parentElement;
    submenu.classList.toggle('active');
}

// Debounce Function: Prevents a function from being called repeatedly within a short time
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Logic to build and display the Feature History view
function openFeatureTimelineView() {
    if (!state.isInitialized) return;

    const contentDiv = document.getElementById('featureHistoryContent');
    contentDiv.innerHTML = `
        <!-- Feature Filter Panel -->
        <div id="featureFilterPanel" class="feature-filter-panel">
            <button id="toggleFilterPanel" class="toggle-filter-button">☰ Select Features</button>
            <div id="filterContent" class="filter-content hide">
                <h4>Select Features</h4>
                <div id="featureCheckboxes" class="feature-checkboxes">
                </div>
                <div id="selectionWarning" class="selection-warning" style="display: none; color: red; margin-top: 10px;">
                    You can select up to ${MAX_FEATURES_DISPLAYED} features only.
                </div>
            </div>
        </div>
        <!-- Timeline Chart -->
       <div id="timelineChart" style="width: 100%; height: 100vh;"></div>
       <!-- Commit Filter Panel -->
    `;

    requestData('featureHistory', function () {
        handleFeatureHistoryData();  // Renders the timeline chart
        state.currentChart = state.featureTimelineView;
    });
}

function openDeletedFeaturesView() {
    if (!state.isInitialized) return;
    const contentDiv = document.getElementById('featureHistoryContent');
    contentDiv.innerHTML = ''; // Clear previous content
    requestData('featureHistory', function () {
        handleDeletedFeaturesData(); // Renders the deleted features table
        state.currentChart = state.deletedFeaturesView;
    });
}

// Function to handle the feature history data and render the chart
function handleFeatureHistoryData() {
    data = jsonData.featureHistoryData;
    features = data.features;
    commits = data.commits;

    processCodeAnnotations(data.codeAnnotations, features, commits);
    processFileMappings(data.fileMappings, features, commits);
    processFolderMappings(data.folderMappings, features, commits);

    allSeriesData = [...codeAnnotationsData, ...fileMappingsData, ...folderMappingsData];
    // Determine default selected features
    const defaultSelectedFeatures = features.slice(0, MAX_FEATURES_DISPLAYED);

    // Filter and remap data based on default selection
    const { filteredFeatures, remappedCodeAnnotationsData,
        remappedFileMappingsData, remappedFolderMappingsData } = getFilteredAndRemappedData(defaultSelectedFeatures);

    // Create the series options with the filtered and remapped data
    const series = [
        {
            name: 'Code Annotations',
            type: 'scatter',
            data: remappedCodeAnnotationsData,
            large: true,
            largeThreshold: 2000,
            symbolOffset: [0, 0],
            selectedMode: 'single',
            symbolSize: 10,
            emphasis: getEmphasisOptions(),
            tooltip: {
                formatter: params => {
                    const data = params.data;
                    const featureName = data.name;
                    return `Feature: ${featureName}<br/>
                        Commit Time: ${data.commitTime}<br/>
                        Commit Message: ${escapeHtml(data.commitMessage)}<br/>
                        Author: ${data.commitAuthor}<br/>
                        <span style="color: #8A00C4; font-weight: bold;">Click to copy commit hash</span>`;
                }
            }
        },
        {
            name: 'File Mappings',
            type: 'scatter',
            data: remappedFileMappingsData,
            large: true,
            symbolOffset: [10, 0],
            selectedMode: 'single',
            symbolSize: 10,
            emphasis: getEmphasisOptions(),
            tooltip: {
                formatter: params => {
                    const data = params.data;
                    const featureName = data.name;
                    return `Feature: ${featureName}<br/>
                        Commit Time: ${data.commitTime}<br/>
                        File: ${data.entityName}<br/>
                        <span style="color: #8A00C4; font-weight: bold;">Click to copy commit hash</span>`;
                }
            }
        },
        {
            name: 'Folder Mappings',
            type: 'scatter',
            data: remappedFolderMappingsData,
            large: true,
            symbolOffset: [-10, 0],
            selectedMode: 'single',
            symbolSize: 12,
            emphasis: getEmphasisOptions(),
            tooltip: {
                formatter: params => {
                    const data = params.data;
                    const featureName = data.name;
                    return `Feature: ${featureName}<br/>
                        Commit Time: ${data.commitTime}<br/>
                        Folder: ${data.entityName}<br/>
                        <span style="color: #8A00C4; font-weight: bold;">Click to copy commit hash</span>`;
                }
            }
        }
    ];

    // Initialize the chart and store it in state
    const chartDom = document.getElementById('timelineChart');
    state.timelineChart = echarts.init(chartDom, 'customTheme');

    const options = {
        backgroundColor: customTheme.backgroundColor,
        color: customTheme.color,
        title: {
            text: 'Feature History Timeline',
            left: 'center',
            textStyle: customTheme.title.textStyle
        },
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
        },
        legend: getLegendOptions(),
        grid: {
            left: 150,
            right: 60,
            bottom: 200,
            top: 80,
        },
        xAxis: {
            type: 'category',
            name: 'Features',
            data: filteredFeatures,
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 12,
                color: customTheme.textStyle.color,
            },
            axisLine: {
                lineStyle: { color: customTheme.grid.borderColor }
            }
        },
        yAxis: {
            type: 'category',
            name: 'Commits',
            data: commits,
            axisLabel: {
                formatter: function (value) {
                    return value;
                },
                fontSize: 12,
                color: customTheme.textStyle.color,
            },
            axisLine: {
                lineStyle: { color: customTheme.grid.borderColor }
            }
        },
        series: series,
        dataZoom: getDataZoomOptions(),
        graphic: [
            {
                id: 'verticalLine',
                type: 'line',
                shape: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: state.timelineChart.getHeight()
                },
                style: {
                    stroke: '#5E42A6',
                    lineWidth: 1,
                    lineDash: [5, 5]
                },
                invisible: true // Initially hide the line
            },
            {
                id: 'horizontalLine',
                type: 'line',
                shape: {
                    x1: 0,
                    y1: 0,
                    x2: state.timelineChart.getWidth(),
                    y2: 0
                },
                style: {
                    stroke: '#5E42A6',
                    lineWidth: 1,
                    lineDash: [5, 5]
                },
                invisible: true
            },
            {
                id: 'xLabel',
                type: 'text',
                style: {
                    text: '', // Will be set dynamically
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    textFill: '#000',
                    font: 'bold 12px sans-serif',
                    textBackgroundColor: 'rgb(128, 128, 128)',
                    textPadding: [3, 5], // Padding around the text
                    textBorderRadius: 3,   // Rounded corners
                    opacity: 3
                },


                invisible: true
            },
            {
                id: 'yLabel',
                type: 'text',
                style: {
                    text: '',
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    textFill: '#000',
                    font: 'bold 12px sans-serif',
                    textBackgroundColor: 'rgb(128, 128, 128)',
                    textPadding: [3, 5],
                    textBorderRadius: 3,
                    opacity: 3
                },

                invisible: true
            }
        ]
    };
    state.timelineChart.setOption(options);

    // Add event listener for the Apply Filter button
    //document.getElementById('applyCommitFilter').addEventListener('click', handleCommitFilter);

    // Initialize crosshair event listeners
    function updateCrosshair(event) {
        const grid = state.timelineChart.getModel().getComponent('grid', 0).coordinateSystem.getRect();
        const xLabelY = grid.y + grid.height + 5; // Slightly above the x-axis
        const [mouseX, mouseY] = [event.offsetX, event.offsetY];
        const pointInGrid = state.timelineChart.convertFromPixel({ seriesIndex: 0 }, [mouseX, mouseY]);

        if (pointInGrid) {
            const [featureIndex, commitIndex] = pointInGrid;
            const features = state.timelineChart.getOption().xAxis[0].data; // Use the currently displayed features
            const commits = state.timelineChart.getOption().yAxis[0].data;

            // Snapping logic: Find the closest feature and commit index
            let nextFeatureIndex = Math.ceil(featureIndex);
            if (nextFeatureIndex >= features.length) {
                nextFeatureIndex = features.length - 1;
            }

            // Get the x-coordinate of the next feature
            const snappedX = state.timelineChart.convertToPixel({ xAxisIndex: 0 }, nextFeatureIndex);

            // Update the crosshair lines and labels
            state.timelineChart.setOption({
                graphic: [
                    {
                        id: 'verticalLine',
                        invisible: false,
                        shape: {
                            x1: snappedX,
                            y1: state.timelineChart.getHeight(),
                            x2: snappedX,
                            y2: 0
                        }
                    },
                    {
                        id: 'horizontalLine',
                        invisible: false,
                        shape: {
                            x1: 0,
                            y1: mouseY,
                            x2: state.timelineChart.getWidth(),
                            y2: mouseY
                        }
                    },
                    {
                        id: 'xLabel',
                        invisible: false,
                        position: [snappedX, xLabelY],
                        style: {
                            text: features[nextFeatureIndex],
                            textAlign: 'center',
                            textVerticalAlign: 'top'
                        }
                    },
                    {
                        id: 'yLabel',
                        invisible: false,
                        position: [5, mouseY],
                        style: {
                            text: commits[Math.round(commitIndex)],
                            textAlign: 'left',
                            textVerticalAlign: 'middle'
                        }
                    }
                ]
            });
        } else {
            hideCrosshair();
        }
    }

    function hideCrosshair() {
        state.timelineChart.setOption({
            graphic: [
                { id: 'verticalLine', invisible: true },
                { id: 'horizontalLine', invisible: true },
                { id: 'xLabel', invisible: true },
                { id: 'yLabel', invisible: true }
            ]
        });
    }
    state.timelineChart.getZr().on('mousemove', function (event) {
        updateCrosshair(event);
    });

    state.timelineChart.getZr().on('mouseout', function () {
        hideCrosshair();
    });

    createFeatureFilterPanel(features);
    initializeFeatureFilterPanel();

    // Click Event Handler with Debouncing (400ms delay)
    state.timelineChart.on('click', debounce(function (params) {
        if (params.componentType === 'series') {
            const commitHash = params.data.commitHash;

            if (commitHash && commitHash !== "Unknown Commit Hash") {
                copyToClipboard(commitHash);
                showNotification('Commit hash copied to clipboard!');
            } else {
                showNotification('Commit hash is undefined.');
            }
        }
    }, 400));


    if (!state.resizeListenerAdded) {
        window.addEventListener('resize', function () {
            state.timelineChart.resize();
        });
        state.resizeListenerAdded = true; // Prevent adding multiple listeners
    }
}

/*
function handleCommitFilter() {
    const authorFilterValue = document.getElementById('authorFilter').value.toLowerCase().trim();
    const messageFilterValue = document.getElementById('messageFilter').value.toLowerCase().trim();

    // Filter the data points directly
    const filterDataPoints = (dataPoints) => {
        return dataPoints.filter(point => {
            const authorMatch = authorFilterValue ? point.commitAuthor.toLowerCase().includes(authorFilterValue) : true;
            const messageMatch = messageFilterValue ? point.commitMessage.toLowerCase().includes(messageFilterValue) : true;
            return authorMatch && messageMatch;
        });
    };

    const updatedCodeAnnotationsData = filterDataPoints(codeAnnotationsData);
    const updatedFileMappingsData = filterDataPoints(fileMappingsData);
    const updatedFolderMappingsData = filterDataPoints(folderMappingsData);

    // Collect all commits from the filtered data points
    const allCommitIndices = new Set();
    [...updatedCodeAnnotationsData, ...updatedFileMappingsData, ...updatedFolderMappingsData].forEach(point => {
        allCommitIndices.add(point.value[1]); // commitIndex
    });

    // Build updated yAxis data
    const updatedYAxisData = Array.from(allCommitIndices).sort((a, b) => a - b).map(commitIndex => {
        const point = codeAnnotationsData.find(p => p.value[1] === commitIndex) ||
            fileMappingsData.find(p => p.value[1] === commitIndex) ||
            folderMappingsData.find(p => p.value[1] === commitIndex);
        return `${point.commitTime} (${point.commitAuthor})`;
    });

    // Create a mapping from old commit indices to new indices
    const oldToNewCommitIndexMap = {};
    Array.from(allCommitIndices).sort((a, b) => a - b).forEach((commitIndex, newIndex) => {
        oldToNewCommitIndexMap[commitIndex] = newIndex;
    });

    // Update data points with new commit indices
    const remapDataPoints = (dataPoints) => {
        return dataPoints.map(point => ({
            ...point,
            value: [point.value[0], oldToNewCommitIndexMap[point.value[1]]]
        }));
    };

    const finalCodeAnnotationsData = remapDataPoints(updatedCodeAnnotationsData);
    const finalFileMappingsData = remapDataPoints(updatedFileMappingsData);
    const finalFolderMappingsData = remapDataPoints(updatedFolderMappingsData);

    // Update the chart options
    state.timelineChart.setOption({
        yAxis: {
            data: updatedYAxisData
        },
        series: [
            { data: finalCodeAnnotationsData },
            { data: finalFileMappingsData },
            { data: finalFolderMappingsData }
        ]
    });
}

 */


/// Function to create the filter panel UI
function createFeatureFilterPanel(features) {
    const featureCheckboxesDiv = document.getElementById('featureCheckboxes');
    const selectionWarning = document.getElementById('selectionWarning');
    let selectedCount = 0;

    features.forEach((feature, index) => {
        const checkboxId = `featureCheckbox_${index}`;
        const label = document.createElement('label');
        label.setAttribute('for', checkboxId);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = feature;

        // Check only the first MAX_FEATURES_DISPLAYED features by default
        if (index < MAX_FEATURES_DISPLAYED) {
            checkbox.checked = true;
            selectedCount++;
        } else {
            checkbox.checked = false;
        }

        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                selectedCount++;
                if (selectedCount > MAX_FEATURES_DISPLAYED) {
                    // Prevent checking this box
                    checkbox.checked = false;
                    selectedCount--;
                    // Show warning message
                    selectionWarning.style.display = 'block';
                } else if (selectedCount === MAX_FEATURES_DISPLAYED) {
                    // Disable all unchecked checkboxes
                    const allCheckboxes = document.querySelectorAll('#featureCheckboxes input[type="checkbox"]');
                    allCheckboxes.forEach(cb => {
                        if (!cb.checked) {
                            cb.disabled = true;
                            cb.parentElement.classList.add('disabled');
                        }
                    });
                    // Show warning message
                    selectionWarning.style.display = 'block';
                }
            } else {
                selectedCount--;
                if (selectedCount < MAX_FEATURES_DISPLAYED) {
                    // Enable all checkboxes
                    const allCheckboxes = document.querySelectorAll('#featureCheckboxes input[type="checkbox"]');
                    allCheckboxes.forEach(cb => {
                        cb.disabled = false;
                        cb.parentElement.classList.remove('disabled');
                    });
                    // Hide warning message
                    selectionWarning.style.display = 'none';
                }
            }
            handleFilterChange();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${feature}`));
        featureCheckboxesDiv.appendChild(label);
    });
}

// Function to initialize event listeners for the filter panel
function initializeFeatureFilterPanel() {
    // Toggle Filter Panel Visibility
    const toggleButton = document.getElementById('toggleFilterPanel');
    const filterContent = document.getElementById('filterContent');
    toggleButton.addEventListener('click', () => {
        if (filterContent.classList.contains('show')) {
            filterContent.classList.remove('show');
            filterContent.classList.add('hide');
        } else {
            filterContent.classList.remove('hide');
            filterContent.classList.add('show');
        }
    });

    // Initially hide the selection warning
    const selectionWarning = document.getElementById('selectionWarning');
    selectionWarning.style.display = 'none';
}

function processCodeAnnotations(annotations, features) {
    const [primaryColor] = customTheme.color;
    codeAnnotationsData = annotations.map(point => {
        return {
            value: [point.featureIndex, point.commitIndex],
            name: features[point.featureIndex],
            commitTime: commits[point.commitIndex],
            commitHash: point.commitHash,
            commitMessage: point.commitMessage,
            commitAuthor: point.commitAuthor,
            type: 'codeAnnotation',
            symbol: 'circle',
            itemStyle: { color: primaryColor }
        };
    });
}

function processFileMappings(fileMappings, features, commits) {
    const [, , , , , , , ,neonBlue] = customTheme.color;
    fileMappingsData = fileMappings.map(point => ({
        value: [point.featureIndex, point.commitIndex],
        name: features[point.featureIndex],
        commitHash: point.commitHash,
        commitTime: point.commitTime,
        commitMessage: point.commitMessage,
        commitAuthor: point.commitAuthor,
        entityName: point.entityName,
        type: 'fileMapping',
        symbol: 'rect',
        itemStyle: { color: neonBlue }
    }));
}

function processFolderMappings(folderMappings, features, commits) {
    const [, , , , , , , , , neonPink] = customTheme.color;
    folderMappingsData = folderMappings.map(point => ({
        value: [point.featureIndex, point.commitIndex],
        name: features[point.featureIndex],
        commitHash: point.commitHash,
        commitTime: point.commitTime,
        commitMessage: point.commitMessage,
        commitAuthor: point.commitAuthor,
        entityName: point.entityName,
        type: 'folderMapping',
        symbol: 'diamond',
        itemStyle: { color: neonPink }
    }));
}


function getLegendOptions() {
    const [primaryColor, , , , , , , ,neonBlue, neonPink] = customTheme.color;
    return {
        data: [
            { name: 'Code Annotations', icon: 'circle', itemStyle: { color: primaryColor } },
            { name: 'File Mappings', icon: 'rect', itemStyle: { color: neonBlue } },
            { name: 'Folder Mappings', icon: 'diamond', itemStyle: { color: neonPink } }
        ],
        bottom: '7%',
        left: 'center',
        orient: 'horizontal',
        textStyle: { color: customTheme.textStyle.color }
    };
}

function getDataZoomOptions() {
    return [
        {
            type: 'slider',
            xAxisIndex: 0,
            start: 0,
            end: 100,
            bottom: 1,
            height: 20,
        },
        {
            type: 'slider',
            yAxisIndex: 0,
            start: 0,
            end: 100,
            right: 20,
            width: 20,
            top: 30,
            orient: 'vertical'
        },
        { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
        { type: 'inside', yAxisIndex: 0, start: 0, end: 100 }
    ];
}

function getEmphasisOptions() {
    return {
        focus: 'self',
        label: {
            show: true,
            formatter: '{b}',
            fontSize: 14,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 4,
            padding: [2, 4]
        },
        itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.5)'
        }
    };
}
// Function to get filtered and remapped data based on selected features
function getFilteredAndRemappedData(selectedFeatures) {
    const features = jsonData.featureHistoryData.features;
    const commits = jsonData.featureHistoryData.commits;

    // Filter the allSeriesData to include only selected features
    const filteredData = allSeriesData.filter(point =>
        selectedFeatures.includes(point.name)
    );

    // Extract data for each annotation type
    const filteredCodeAnnotationsData = filteredData.filter(point => point.type === 'codeAnnotation');
    const filteredFileMappingsData = filteredData.filter(point => point.type === 'fileMapping');
    const filteredFolderMappingsData = filteredData.filter(point => point.type === 'folderMapping');

    // Create a mapping from old featureIndex to new featureIndex
    const oldToNewIndexMap = {};
    selectedFeatures.forEach((feature, newIndex) => {
        const oldIndex = features.indexOf(feature);
        oldToNewIndexMap[oldIndex] = newIndex;
    });

    // Helper function to remap feature indices
    function remapFeatureIndex(point) {
        const oldFeatureIndex = point.value[0];
        const newFeatureIndex = oldToNewIndexMap[oldFeatureIndex];
        return {
            ...point,
            value: [newFeatureIndex, point.value[1]] // Update feature index
        };
    }

    // Remap feature indices
    const remappedCodeAnnotationsData = filteredCodeAnnotationsData.map(remapFeatureIndex);
    const remappedFileMappingsData = filteredFileMappingsData.map(remapFeatureIndex);
    const remappedFolderMappingsData = filteredFolderMappingsData.map(remapFeatureIndex);

    return {
        filteredFeatures: selectedFeatures,
        remappedCodeAnnotationsData,
        remappedFileMappingsData,
        remappedFolderMappingsData
    };
}
//  handle annotation type selection changes
function handleFilterChange() {
    const selectedFeatures = getSelectedFeatures();
    filterFeatures(selectedFeatures);
}

// Get list of selected features
function getSelectedFeatures() {
    const checkboxes = document.querySelectorAll('#featureCheckboxes input[type="checkbox"]');
    const selected = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    return selected;
}

// Filter features and update the chart
function filterFeatures(selectedFeatures) {
    if (selectedFeatures.length === 0) {
        // If no features are selected, clear the chart
        state.timelineChart.setOption({
            xAxis: {
                data: []
            },
            series: [
                { data: [] }, // Code Annotations
                { data: [] }, // File Mappings
                { data: [] }  // Folder Mappings
            ]
        });
        return;
    }

    // Get filtered and remapped data based on selected features
    const { filteredFeatures, remappedCodeAnnotationsData,
        remappedFileMappingsData, remappedFolderMappingsData } = getFilteredAndRemappedData(selectedFeatures);

    // Update the series data with filtered and remapped data
    const series = [
        {
            name: 'Code Annotations',
            data: remappedCodeAnnotationsData
        },
        {
            name: 'File Mappings',
            data: remappedFileMappingsData
        },
        {
            name: 'Folder Mappings',
            data: remappedFolderMappingsData
        }
    ];

    // Update the chart's xAxis and series data
    state.timelineChart.setOption({
        xAxis: {
            data: filteredFeatures
        },
        series: series
    });
}

// handle the deleted features data and render the table
function handleDeletedFeaturesData() {
    const deletedFeatures = jsonData.deletedFeaturesData;
    // Build HTML content
    const deletedFeaturesDiv = document.getElementById('featureHistoryContent');
    let htmlContent = '<h2>Deleted Features</h2>';
    htmlContent += '<table class="deleted-features-table">';
    htmlContent += '<tr><th>Feature Name</th><th>Last Commit Time</th><th>Commit Hash</th></tr>';
    deletedFeatures.forEach(feature => {
        const fullHash = feature.commitHash;
        const truncatedHash = fullHash.substring(0, 7); // Shorten hash for display
        const lastCommitTime = feature.lastCommitTime;

        // Add the HTML content for this feature
        htmlContent += `
            <tr>
                <td>${feature.featureName}</td>
                <td>${lastCommitTime}</td>
                <td title="Click to copy full hash" onclick="copyToClipboard('${fullHash}')">${truncatedHash}</td>
            </tr>`;
    });
    htmlContent += '</table>';
    deletedFeaturesDiv.innerHTML = htmlContent;
}

// Define the custom theme
const customTheme = {
    color: [
        '#5E42A6', // Primary color
        '#8367D7', // Light Purple
        '#3B2A60', // Dark Purple
        '#A08CF8', // Lavender
        '#BFA5FF' , // Soft Purple
        '#333',    //black
        '#4d7b93', // green
        '#3878e2' , //blue
        '#11ffe3', //neon blue
        '#FF13F0'  //neon pink
    ],
    backgroundColor: '#ffffff', // Light background
    textStyle: {
        fontFamily: 'Arial, sans-serif',
        color: '#333' // Default text color
    },
    title: {
        textStyle: {
            color: '#5E42A6',
            fontSize: 18,
            fontWeight: 'bold'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#5E42A6',
        borderWidth: 1,
        textStyle: {
            color: '#333'
        }
    },
    legend: {
        textStyle: {
            color: '#333'
        },
        icon: 'circle'
    },
    grid: {
        borderColor: '#ddd'
    },
    toolbox: {
        iconStyle: {
            borderColor: '#5E42A6'
        }
    },
    dataZoom: {
        backgroundColor: '#f0f0f0',
        fillerColor: '#5E42A6',
        handleColor: '#8367D7'
    },
    axisPointer: {
        lineStyle: {
            color: '#5E42A6'
        },
        crossStyle: {
            color: '#5E42A6'
        },
        label: {
            backgroundColor: '#5E42A6'
        }
    },
};

// Register the custom theme with ECharts
echarts.registerTheme('customTheme', customTheme);

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Commit hash copied to clipboard');
        }, () => {
            showNotification('Failed to copy commit hash');
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback for older browsers
function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';  // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'Commit hash copied to clipboard' : 'Failed to copy commit hash';
        showNotification(msg);
    } catch (err) {
        showNotification('Failed to copy commit hash');
    }

    document.body.removeChild(textarea);
}

// show notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}

// Function to escape HTML characters in commit messages
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '`': '&#x60;'
    };
    return text.replace(/[&<>"'`]/g, function(m) { return map[m]; });
}

// &end[FeatureHistory]


//helper function for the treemap
// &begin[TreeMap]
function getLevelOption() {
    return [
        {
            itemStyle: {
                borderColor: '#777',
                borderWidth: 5,
                gapWidth: 1,
            },
            upperLabel: {
                show: false
            },
        },
        {
            color: ['#5470c6', '#91cc75', '#fac858',"#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
            itemStyle: {
                borderColor: '#555',
                borderWidth: 5,
                gapWidth: 1,
                borderColorSaturation: 0.6,
            },
            emphasis: {
                itemStyle: {
                    borderColor: '#ddd'
                }
            }
        },
        {
            colorSaturation: [0.35, 0.5],
            itemStyle: {
                borderWidth: 5,
                gapWidth: 1,
                borderColorSaturation: 0.5,
            }
        },
        {
            itemStyle: {
                borderColorSaturation: 0.4,
            }
        },
        {
            itemStyle: {
                borderColorSaturation: 0.3,
            }
        },
        {
            itemStyle: {
                borderColorSaturation: 0.2,
            }
        },
        {
            itemStyle: {
                borderColorSaturation: 0.1,
            }
        }
    ];
}

// &end[TreeMap]