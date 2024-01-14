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
    featureInfoSideBar = document.querySelector("#toggleFeatureWindowDiv"),
    showScattering = document.querySelector(".show-scattering"),
    scatteringWindow = document.querySelector(".scattering-window");

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
    isDarkmode: true,
    isNav: false,
    isFeatureWindow: false,
    isFetching: false,
    showLpqNames: false,
    showTanglingAsNormalGraph: false,
    isAutoFetch: false,
    fetchIntervall: 600000,
}

const intervallFunctions = {
    fetch: null,
    updateTimestamp: null,
}

const jsonData = {
    tanglingData: "",
    treeData: ""
}

var myChart = echarts.init(chartDom, state.isDarkmode ? "dark" : "");

var timestamp = new Date();

var option;


/* init eventlisteners */

document.addEventListener("click", documentClickHandler);
/* navigation bar */
searchIcon.addEventListener("click", () => {
    searchBox.classList.toggle("openSearch");
    searchIcon.classList.add("openSearch");

    searchbar.focus();
    searchIcon.textContent = "search";
    searchBoxSettings.classList.remove("openSettings");
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
});

/* feature info window */
featureInfoSideBar.addEventListener("click", () => {
    featureInfoWindow.classList.toggle("openFeatureWindow");
    if(featureInfoWindow.classList.contains("openFeatureWindow")) {
        featureInfoBtn.textContent = "keyboard_double_arrow_left";
    }
    else {
        featureInfoBtn.textContent = "keyboard_double_arrow_right";
    }
    
});
showScattering.addEventListener("click", () => {
    openScattering();
});

/* ECharts */
// Handle click event
myChart.on('click', function (params) {
    onFeatureSelect(params);
});
myChart.on("contextmenu", function (params) {
    if (params.dataType !== "node")
        return;
    console.log("opened console menu for " + params.data);
})

myChart.on("finished", function() {
    if(searchbar.value !== "")
        highlightItem(searchbar.value);
})
// Handle resize event
window.addEventListener('resize', function () {
    // Resize the chart when the window size changes
    searchBoxSettings.classList.remove("openSettings");
    nav.classList.remove("openSearch");
    searchIcon.textContent = "search";
    myChart.resize();
});


//initialize first view
myChart.showLoading({text: "Loading..."});


/* functions */
/* UI helper functions */

function documentClickHandler(event){
    /* TODO: prevent events during initialization */
    /* TODO: if the scattering window contains a chart then it does not recognize the click and still closes itself*/
    if(!event.target.matches(".scattering-window") && !event.target.matches(".show-scattering")) {
        if(scatteringWindow.classList.contains("active")){
            scatteringWindow.classList.remove("active");
            let body = document.getElementById(" mainBody");
            body.classList.remove("applyBackdrop");
        }
    }
}
/* Feature Info Window */
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

    for (const location of featureData.locations) {
        var listElement = document.createElement("li");
        //add path
        let pathName = document.createElement("p");
        pathName.innerText = location.path;
        pathName.classList.add("pathName");
        listElement.appendChild(pathName);
        //add blocks
        for (const block of location.blocks) {
            let subListElement = document.createElement("li");
            let lines = document.createElement("p");
            lines.innerText = "  Lines: " + (block.start + 1) + " - " + (block.end + 1);
            subListElement.appendChild(lines);
            listElement.appendChild(subListElement);
        }
        locationList.appendChild(listElement);
    }
}
function openScattering(){
    /*TODO: adjust size to make chart fit into window */
    /*TODO: resize window at resize event*/
    //get current feature lpq
    let lpqName = document.getElementById("featureLpqNameText").innerText;
    let feature = getFeatureData(lpqName);

    scatteringWindow.classList.toggle("active");
    let body = document.getElementById(" mainBody");
    body.classList.add("applyBackdrop");
    /* TODO: dispose before opening a new chart for theme */
    let scatteringChart = echarts.init(scatteringWindow, state.isDarkmode ? "dark" : "");
    scatteringChart.clear();

    let plotData = [];
    let links = [];
    plotData.push({
        id: feature.id,
        name: feature.name,
        type: "feature",
        scatteringDegree: feature.scatteringDegree,
        totalLines: feature.totalLines,
        lines: feature.lines,
    });

    for(let location of feature.locations){
        let counter = 0;
        for(let block of location.blocks){
            counter += block.end - block.start + 1;
        }
        let coverage = counter / feature.lines;
        let entry = {
            id: location.path,
            type: "location",
            name: location.path,
            blocks : location.blocks,
            /*TODO: lines does not work and always return 0 */
            /*lines: location.lines*/
            lines: counter,
            coverage: coverage
        }
        plotData.push(entry);

        links.push({
            source: feature.id,
            target: location.path,
            coverage: coverage
        })
    }

    let scatterChartOptions = {
        title: {
            text: 'Scattering',
            subtext: 'Circular layout',
            top: 'bottom',
            left: 'right'
        },
        tooltip: {
            show: true,
            formatter: function (params) {
                /*TODO: show line locations on file hover*/
                if (params.dataType === "node") {
                    if(params.data.type === "feature")
                        return `${params.marker}${params.data.name}<br>Scattering Degree: ${params.data.scatteringDegree}<br>Total Lines: ${params.data.totalLines}`;
                    else
                        return `${params.marker}${params.data.name}<br>Feature Lines: ${params.data.lines}<br>Coverage: ${(params.data.coverage * 100).toFixed(2)}%`;

                } else {
                    let pathName = params.data.source === feature.id ? params.data.target : params.data.source;
                    return `Feature coverage:<br>File:${pathName}:<br>${(params.data.coverage * 100).toFixed(2)}% `;
                }
            }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: '',
                type: 'graph',
                /*layout: state.showTanglingAsNormalGraph ? "force" : "circular",*/
                layout: "force",
                circular: {
                    rotateLabel: true
                },
                force: {
                    initLayout: "circular",
                    repulsion: 700,
                    /*TODO: adjust edge length to size of nodes*/
                    edgeLength: [30, 100],
                },
                data: plotData.map(entry => {
                    let size = 60;
                    if(entry.lines === feature.lines)
                        entry["symbolSize"] = size;
                    else
                        entry["symbolSize"] = Math.min((entry.lines / feature.lines) * size * 2, size);
                    return entry;
                }),
                links: links.map(function (link) {
                    link.lineStyle = {
                        color: mixColors(stringToColour(link.source), stringToColour(link.target)),
                        width: link.coverage * 70 + 1,
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
    scatterChartOptions && scatteringChart.setOption(scatterChartOptions);

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

    // Handle click event
    myChart.on('click', function (params) {
        onFeatureSelect(params);
    });

    myChart.on("contextmenu", function (params) {
        if (params.dataType !== "node")
            return;
        console.log("opened console menu for " + params.data);
    })

    switch (state.currentChart) {
        case state.treeChart: {
            openTreeView();
            break;
        }
        case state.treeMapChart: {
            openTreemapView();
            break;
        }
        case state.tanglingChart: {
            openTanglingView();
            break;
        }
        default:
            openTreeView();
    }
}
/* Refresh after fetching new data */
function refresh() {
    myChart.showLoading();
    switch (state.currentChart) {
        case state.treeChart: {
            openTreeView();
            break;
        }
        case state.treeMapChart: {
            openTreemapView();
            break;
        }
        case state.tanglingChart: {
            openTanglingView();
            break;
        }
        default:
            openTreeView();
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
        toggleChart(state.tanglingChart);
}
/* toggles the tangling graph to either circular or non-circular graph*/
function toggleTanglingGraphMode(){
    let before = state.showTanglingAsNormalGraph;
    state.showTanglingAsNormalGraph = !circularTanglingToggle.classList.contains("active");
    //reload if it has changed and current chart is the tangling view
    if(before !== state.showTanglingAsNormalGraph && state.currentChart === state.tanglingChart)
        toggleChart(state.tanglingChart);
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
function toggleChart(chart){
    switch(chart){
        case state.treeMapChart:{
            openTreemapView();
            break;
        }
        case state.treeChart:{
            openTreeView();
            break;
        }
        case state.tanglingChart:{
            openTanglingView();
            break;
        }
    }
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
            openTreeView();
            myChart.hideLoading();
        } else {
            state.isFetching = false;
            alert("could not fetch data " + code)
        }
    });
}

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
function getFeatureIndicesByString(string, isRegEx, isExactMatch, isCaseSensitive) {
    let result = {
        hierarchical: [],
        nonHierarchical: []
    }

    //get hierarchical indices
    for(const [index, feature] of jsonData.tanglingData.features.entries()){
        let featureName = feature.name.toString();

        //if current chart is a tree-like-chart then dont check for the lpq
        let featureLpq = (state.currentChart === state.treeChart || state.currentChart === state.treeMapChart) ? "$INVALID%_%HAnS%_%String_1$" : feature.id.toString();
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
                featureLpq = "$INVALID%_%HAnS%_%String_1$";
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
    let result = jsonData.tanglingData.features.find((feature) => {
        return feature.id === featureLpq;
    })
    return result;
}



/* interface to Java-Code in HAnS-Viz */

/**
 * requests data from the BrowserResourceHandler and calls handleData on success.
 * the callback function gets called with the status code  of 0 if success - otherwise it gets called with the error_code
 * @param option
 * @param callback function which should be called after request
 */
function requestData(option, callback) {
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
            callback(error_code)
            console.log(error_code, error_message);
            myChart.hideLoading();
        }
    })
}

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
    }
}

/* ECharts plotting functions */
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
                    return `${params.marker}${params.data.name}<br>Tangling Degree: ${params.data.tanglingDegree}<br>Scattering Degree: ${params.data.scatteringDegree}<br>Total Lines: ${params.data.totalLines}`;
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
    state.currentChart = state.tanglingChart;
}

//options for the treemap view
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
    state.currentChart = state.treeMapChart;
}

//options for the tree view
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
    state.currentChart = state.treeChart;
}

//helper function for the treemap
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
