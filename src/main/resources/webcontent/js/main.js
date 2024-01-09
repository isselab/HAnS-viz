/*var testButton = document.getElementById("testButton");*/
var chartDom = document.getElementById('main');
var searchbar = document.getElementById("searchbar");
var refreshBtn = document.getElementById("refresh-button");
var regExCheckBox = document.getElementById("regExCheckBox");
var incSearchCheckBox = document.getElementById("incrementalSearchCheckBox");
var exactMatchCheckBox = document.getElementById("exactMatchCheckBox");
var caseSensitiveCheckBox = document.getElementById("caseSensitiveCheckBox");


const nav = document.querySelector(".nav"),
    searchIcon = document.querySelector("#searchIcon"),
    navOpenBtn = document.querySelector(".navOpenBtn"),
    navCloseBtn = document.querySelector(".navCloseBtn");
    searchSettingsToggle = document.querySelector("#search-settings");
    searchBoxSettings = document.querySelector(".search-box-settings");
    darkModeToggle = document.querySelector(".dark-mode-toggle");
    innerSearchIcon = document.querySelector("#inner-search-icon");
    featureInfoBtn = document.querySelector(".feature-info-button");
    featureInfoPanel = document.querySelector(".feature-info-panel");
    featureInfoWindow = document.querySelector(".feature-info-window");
    lastFetchTimestamp = document.querySelector(".last-fetch-timestamp");

const state = {
    isInitialized: false,
    currentChart: 0,
    treeChart: 0,
    treeMapChart: 1,
    tanglingChart: 2,
    isDarkmode: true,
    isNav: false,
    isFeatureWindow: false,
    isFetching: false
}

const jsonData = {
    tanglingData: "",
    treeData: ""
}

const searchOptions = {
    RegEx: 1,
    Incremental: 2,
    ExactMatch: 4,
    CaseSensitive: 8
}

var myChart = echarts.init(chartDom, state.isDarkmode ? "dark" : "");

var timestamp = new Date();

var option;


//initialize first view
myChart.showLoading({text: "Wait for indexing to finish"});

// Handle click event
myChart.on('click', function (params) {
    onFeatureSelect(params);
});

myChart.on("contextmenu", function (params) {
    if (params.dataType !== "node")
        return;
    console.log("opened console menu for " + params.data);
})

// Handle resize event
window.addEventListener('resize', function () {
    // Resize the chart when the window size changes
    searchBoxSettings.classList.remove("openSettings");
    nav.classList.remove("openSearch");
    searchIcon.textContent = "search";
    myChart.resize();
});
darkModeToggle.addEventListener("click", toggleTheme);
searchIcon.addEventListener("click", () => {
  //TODO THESIS focus searchbar on open
  nav.classList.toggle("openSearch");
  nav.classList.remove("openNav");
  if (nav.classList.contains("openSearch")) {
    // searchIcon.classList.replace("uil-search", "uil-times");
    searchIcon.textContent = "close";
    searchbar.focus();
    return;

    }
    searchIcon.textContent = "search";
    searchBoxSettings.classList.remove("openSettings");
});
searchSettingsToggle.addEventListener("click", () => {
    getSearchPos();
    searchBoxSettings.classList.toggle("openSettings");
});
function getSearchPos(){
    var rect = innerSearchIcon.getBoundingClientRect();
    var x = rect.left + window.scrollX;
    var xPx = x +"px"
    searchBoxSettings.style.left = xPx;
}
featureInfoBtn.addEventListener("click", () => {
    featureInfoWindow.classList.toggle("openFeatureWindow");
    if(featureInfoWindow.classList.contains("openFeatureWindow")) {
        featureInfoBtn.textContent = "keyboard_double_arrow_left";
    }
    else {
        featureInfoBtn.textContent = "keyboard_double_arrow_right";
    }
    
});
navOpenBtn.addEventListener("click", () => {
    nav.classList.add("openNav");
    nav.classList.remove("openSearch");
    searchIcon.classList.replace("uil-times", "uil-search");
    chartDom.classList.add("dumb");
});
navCloseBtn.addEventListener("click", () => {
    nav.classList.remove("openNav");
    chartDom.classList.remove("dumb");
});

refreshBtn.addEventListener("click", () => {
    state.isFetching = true;
    updateTimestamp();
    fetchAllData(refresh);
})

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


// TODO THESIS: This function gets called by HAnsDumbModeListener after finishing indexing. display style from main should be changed
function startPlotting() {
    if (state.isInitialized) {
        return;
    }


    //TODO prevent onClick from loading
    state.isInitialized = true;


    // testButton.addEventListener("click", highlightItem);
    /*testButton.addEventListener("click", () => {
    fetchAllData();
  });*/
    state.isFetching = true;
    //get latest data
    fetchAllData(function (code) {
        if (code === 0) {    //open start page
            openTreeView();
            myChart.hideLoading();
            timestamp = new Date();
            updateTimestamp();
        } else {
            alert("could not fetch data " + code)
        }
        state.isFetching = false;
    });
}

//TODO THESIS
// the callback is just for testing purposes.  can be removed later but we need another way of calling something after every request is done within fetch
function fetchAllData(callback) {
    requestData("tangling");
    requestData("tree", callback);
}

function onFeatureSelect(params) {
    //check type of clicked element
    var clickedNode = params.data;
    console.log('Clicked node:', clickedNode);
    showFeatureInWindow(clickedNode.id);
    //open window to show information about the clicked node

}

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

setInterval(updateTimestamp, 10000);

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

// TODO THESIS: requestData(option)
function requestData(option, callback) {
    myChart.showLoading({text: "fetching data"});
    window.java({
        request: option,
        persistent: false,
        onSuccess: function (response) {
            // response should contain JSON
            //alert("response is there!");
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

    //TODO THESIS
    // refresh current chart

}


function getTextColor(getInverse = false) {
    let light = "#17142c";
    let dark = "#ffffff"

    if (getInverse) {
        return state.isDarkmode ? light : dark;
    }
    return state.isDarkmode ? dark : light;
}

function getFeatureIndicesByString(string, isRegEx, isExactMatch, isCaseSensitive) {
    let result = {
        hierarchical: [],
        nonHierarchical: []
    }

    //get hierarchical indices
    for(const [index, feature] of jsonData.tanglingData.features.entries()){
        let featureName = feature.name.toString();
        //TODO THESIS
        // maybe change the invalid string to something more reliable
        //if current chart is a tree-like-chart then dont check for the lpq
        let featureLpq = (state.currentChart === state.treeChart || state.currentChart === state.treeMapChart) ? "$INVALID%_%HAnS%_%String$" : feature.id.toString();
        let checkPattern = string.toString();

        //check reges
        if(isRegEx){
            //TODO THESIS add regex
            let regEx = RegExp(checkPattern,
                isCaseSensitive ? "" : "i",
                isExactMatch ? "" : "g"
                )

            if(featureName.match(regEx) || featureLpq.match(regEx)){
                result.nonHierarchical.push(index);
                result.hierarchical.push(index + 1);
            }
        }
        //normal search
        else{
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


function getFeatureData(featureLpq) {
    let result = jsonData.tanglingData.features.find((feature) => {
        return feature.id === featureLpq;
    })
    return result;
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

function toggleTheme() {
    //apply darkmode to the chart container
    var elem = document.getElementById("main");
    elem.classList.toggle("dark-mode");
    featureInfoWindow.classList.toggle("dark-mode");
    lastFetchTimestamp.classList.toggle("dark-mode");

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

//TODO THESIS
// function to search for feature name and lpq to highlight


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
        children: feature.children.map(child => convertLineCountToValue(child))
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
                layout: 'circular',
                circular: {
                    rotateLabel: true
                },
                data: jsonData.tanglingData.features.map(node => {
                    /*TODO THESIS dont grow linear*/
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
                    position: 'right',
                    formatter: '{b}'
                },
                itemStyle: {
                    color: function (params) {
                        // Generate a random color
                        return stringToColour(params.data.id);
                    }
                },
                lineStyle: {
                    curveness: 0.3
                },
                zoom: 0.7,
                emphasis: {
                    focus: 'adjacency',
                    label: {
                        position: 'right',
                        show: true,
                        fontSize: 30,
                        color: getTextColor()
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
                    borderColor: 'transparent',
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
                borderWidth: 0,
                gapWidth: 1
            },
            upperLabel: {
                show: false
            }
        },
        {
            itemStyle: {
                borderColor: '#555',
                borderWidth: 5,
                gapWidth: 1
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
                borderColorSaturation: 0.6
            }
        }
    ];
}
