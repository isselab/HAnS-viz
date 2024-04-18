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
    editBtn = document.getElementById("edit-button"),
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

/* edit feature model */
const featureModificationBox = document.querySelector(".feature-modification-box");
const addFeatureBtn = document.getElementById("feature-modification-add-btn");
const moveFeatureBtn = document.getElementById("feature-modification-move-btn");
const renameFeatureBtn = document.getElementById("feature-modification-rename-btn");
const deleteFeatureBtn = document.getElementById("feature-modification-delete-btn");
const dropFeatureBtn = document.getElementById("feature-modification-drop-btn");


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
    isSwitching: false
}

const intervallFunctions = {
    fetch: null,
    updateTimestamp: null,
}

const jsonData = {
    tanglingData: "",
    treeData: ""
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
    featureModificationBox.classList.remove("active");
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
    featureModificationBox.classList.remove("active");
});
editBtn.addEventListener("click", () => {
    featureModificationBox.classList.toggle("active");
    settingsBox.classList.remove("active");
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

/* edit feature model */
var currentEditListener = null;
var currentNotifPopup = null;
function editFeatureModelSetup() {
    if (currentEditListener != null) {
        if (currentEditListener == moveFeatureListener) { moveFeatureSetup(); }
        myChart.off('click', currentEditListener);
    }
    if (currentNotifPopup != null) {currentNotifPopup.remove();}
    
    currentEditListener = null;
    currentNotifPopup = null;
}
addFeatureBtn.addEventListener("click", () => {
    editFeatureModelSetup();
    var notification = createNotification("Select the parent feature where you'd like to add new feature.", addFeatureListener);  
    currentEditListener = addFeatureListener;
    currentNotifPopup = notification;
    myChart.on('click', addFeatureListener);
});
moveFeatureBtn.addEventListener("click", () => {
    editFeatureModelSetup();
    var notification = createNotification("Choose the target feature you'd like to move and the destination where you want to move it.", moveFeatureListener);
    currentEditListener = moveFeatureListener;
    currentNotifPopup = notification;
    myChart.on('click', moveFeatureListener);
});
renameFeatureBtn.addEventListener("click", () => {
    editFeatureModelSetup();
    var notification = createNotification("Select feature you'd like to rename", renameFeatureListener);
    currentEditListener = renameFeatureListener;
    currentNotifPopup = notification;
    myChart.on('click', renameFeatureListener);
});
deleteFeatureBtn.addEventListener("click", () => {
    editFeatureModelSetup();
    var notification = createNotification("Select feature you'd like to delete", deleteFeatureListener);
    currentEditListener = deleteFeatureListener;
    currentNotifPopup = notification;
    myChart.on('click', deleteFeatureListener);
});
dropFeatureBtn.addEventListener("click", () => {
    editFeatureModelSetup();
    var notification = createNotification("Select feature you'd like to drop", dropFeatureListener);
    currentEditListener = dropFeatureListener;
    currentNotifPopup = notification;
    myChart.on('click', dropFeatureListener);
});

function editFeatureBoxSetup() {
    if (myChart.getOption().series[0].type === 'tree') {
        addFeatureBtn.disabled = false;
        moveFeatureBtn.disabled = false;
        renameFeatureBtn.disabled = false;
        deleteFeatureBtn.disabled = false;
        dropFeatureBtn.disabled = false;
    } else {
        addFeatureBtn.disabled = true;
        moveFeatureBtn.disabled = true;
        renameFeatureBtn.disabled = true;
        deleteFeatureBtn.disabled = true;
        dropFeatureBtn.disabled = true;
    }
}

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
    let body = document.getElementById("mainBody");
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
    let body = document.getElementById("mainBody");
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
    switch(chart){
        case state.treeMapChart:{
            openTreemapView();
            state.currentChart = state.treeMapChart;
            editFeatureBoxSetup();
            break;
        }
        case state.treeChart:{
            openTreeView();
            state.currentChart = state.treeChart;
            editFeatureBoxSetup();
            break;
        }
        case state.tanglingChart:{
            openTanglingView();
            state.currentChart = state.tanglingChart;
            editFeatureBoxSetup();
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
            if (callback == null) {
               alert("could not retrieve data for " + option + "  " + error_code + "  " + error_message)
            }
            if (callback != null && error_code != undefined && error_message != undefined) {
                callback(error_code, error_message);
            }
            console.log(error_code, error_message);
            myChart.hideLoading();
        }
    })
}
// &end[Request]

// &begin[Request]
function handleData(option, response) {
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
        case "addFeature":
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


const featurePattern = /^([A-Z]+|[a-z]+|[0-9]+|'_'+|'\''+)*$/
            

function createAddRenamePopup(featureLpq, action) {
    const container = document.getElementById('modify-feature-rename-container');
    
    // Create the popup div
    const popup = document.createElement('div');
    popup.className = 'modify-feature-custom-popup';
    container.appendChild(popup);

    // Create popup content
    const content = document.createElement('div');
    content.className = 'modify-feature-popup-content';
    popup.appendChild(content);

    const message = document.createElement('p');
    message.className = 'popup-message';
    if (action == 'rename') {
        message.innerText = "Rename feature: " + featureLpq;
    } else if (action == 'add') {
        message.innerText = "Add new feature to " + featureLpq;
    }
    content.appendChild(message);

    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'popup-input'
    if (action == 'rename') {
        let splitStr = featureLpq.split("::");
        input.value = splitStr[splitStr.length-1]
    } // set old value
    content.appendChild(input);

    // Create error field
    const error = document.createElement('p');
    error.className = 'modify-feature-popup-error'

    // Create button
    const button = document.createElement('button');
    button.className = 'submit-btn';
    button.textContent = 'Submit';
    button.addEventListener('click', function() {
//        if (input.value.length == 0 || input.value.trim().length == 0 || !featurePattern.test(input.value.trim())) {
//            error.innerText = "Feature name incorrect";
//            content.appendChild(error);
//            setTimeout(() => {
//                content.removeChild(error);
//            }, 5000);
//            return;
//        }
        if (action == 'rename') {
            renameFeature(featureLpq, input.value);
        } else if (action == 'add') {
            addFeatureToTree(featureLpq, input.value);
        }

        popup.remove(); // Remove popup when button is clicked
        editFeatureModelSetup();
        
    });
    content.appendChild(button);

    const close = document.createElement('button');
    close.textContent = 'Close';
    close.className = 'close-btn';
    close.addEventListener('click', function() {
        popup.remove();
        editFeatureModelSetup();
    });
    content.appendChild(close);
}

const addFeatureListener = function(params) {
    const featureLpq = params.data.id;
    createAddRenamePopup(featureLpq, 'add');
};

var _clicks;
var _feature;
var _newParentFeature;
function moveFeatureSetup() {
    _clicks = 2;
    _feature = null;
    _newParentFeature = null;
}
moveFeatureSetup();

const moveFeatureListener = function(params) {
    if (_clicks == 2) {
        _feature = params.data;
        _clicks--;
    } else if (_clicks == 1) {
        _newParentFeature = params.data;
        createMoveDeleteDropPopup(_feature, 'move', _newParentFeature);
        moveFeatureSetup();
    }
};

const renameFeatureListener = function(params) {
    const featureLpq = params.data.id;
    createAddRenamePopup(featureLpq, 'rename');
}

function createMoveDeleteDropPopup(feature, action, newParentFeature=null) {
    let featureLpq = feature.id;
    newParentFeature = newParentFeature ? newParentFeature.id : null;
    const container = document.getElementById('modify-feature-delete-container');
    
    // Create the popup div
    const popup = document.createElement('div');
    popup.className = 'modify-feature-custom-popup';
    container.appendChild(popup);

    // Create popup content
    const content = document.createElement('div');
    content.className = 'modify-feature-popup-content';
    popup.appendChild(content);

    const message = document.createElement('p');
    message.className = 'popup-message';
    const button = document.createElement('button');
    button.className = 'submit-btn';
    if (action == 'delete') {
        message.innerText = "Are you sure you want to delete feature " + featureLpq + "?";
        button.textContent = 'Delete';
    } else if (action == 'drop') {
        message.innerText = "Are you sure you want to delete feature " + featureLpq + " with code ?";
        button.textContent = 'Drop';
    } else if (action == 'move') {
        message.innerText = "Are you sure you want to move feature " + featureLpq + " to " + newParentFeature + "?";
        button.textContent = 'Move';
    }
    content.appendChild(message);
    button.addEventListener('click', function() {
        popup.remove();
        if (action == 'delete') {
            deleteFeatureFromTree(featureLpq);
        } else if (action == 'drop') {
            dropFeatureFromTree(featureLpq);
        } else if (action == 'move') {
            moveFeatureInTree(featureLpq, newParentFeature);
        }
        editFeatureModelSetup();
    });
    content.appendChild(button);

    const close = document.createElement('button');
    close.textContent = 'Close';
    close.className = 'close-btn';
    close.addEventListener('click', function() {
        popup.remove();
        
        editFeatureModelSetup();
    });
    content.appendChild(close);

}

const deleteFeatureListener = function(params) {
    createMoveDeleteDropPopup(params.data, 'delete');
};


const dropFeatureListener = function(params) {
    createMoveDeleteDropPopup(params.data, 'drop');
};

function createNotification(notifText, handler) {
    const container = document.getElementById("modify-feature-notification-container");
    
    const popup = document.createElement('div');
    popup.className = 'modify-feature-notif';
    container.appendChild(popup);

    const content = document.createElement('div');
    content.className = 'modify-feature-notif-content';
    popup.appendChild(content);

    const notif = document.createElement('span');
    notif.innerText = notifText;
    notif.style.fontSize = '15px';
    content.appendChild(notif);

    const button = document.createElement('span');
    button.className = "material-symbols-outlined close";
    button.textContent = 'close';
    content.appendChild(button);

    button.addEventListener('click', function() {
        editFeatureModelSetup();
    });

    featureModificationBox.classList.remove('active');
    return popup;
}

function addFeatureToTree(parentLPQ, newFeatureLPQ) {
    let data = "addFeature" + "," + parentLPQ + "," + newFeatureLPQ;
    requestData(data, function(code, msg) {
        if (msg != undefined) {
            alert(msg);
        }
        refreshData();
    }, false);
}

function renameFeature(parentLPQ, newNameLPQ) {
    let data = "renameFeature" + "," + parentLPQ + "," + newNameLPQ;
    requestData(data, function(code, msg) {
        if (msg != undefined) {
            alert(msg);
        }
        refreshData();
    }, false);
}

function deleteFeatureFromTree(featureLPQ) {
    let data = "deleteFeature" + "," + featureLPQ;
    requestData(data, function() {
        refreshData();
    }, false);
}

function dropFeatureFromTree(featureLPQ) {
    let data = "dropFeature" + "," + featureLPQ;
    requestData(data, function() {
        refreshData();
    }, false);
}

function moveFeatureInTree(featureLPQ, newParentFeature) {
    let data = "moveFeature" + "," + featureLPQ + "," + newParentFeature;
    requestData(data, function(code, msg) {
        if (msg != undefined) {
            alert(msg);
        }
        refreshData();
    }, false);
}

