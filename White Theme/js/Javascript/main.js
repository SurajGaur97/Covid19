(function ($) {
    "use strict";

    function jquerySortLib() {
        //Jquery official Code for sorting comma seperated string number.
        jQuery.extend(jQuery.fn.dataTableExt.oSort, {
            "formatted-num-pre": function (a) {
                a = (a === "-" || a === "") ? 0 : a.replace(/[^\d\-\.]/g, "");
                return parseFloat(a);
            },

            "formatted-num-asc": function (a, b) {
                return a - b;
            },

            "formatted-num-desc": function (a, b) {
                return b - a;
            }
        });
    }

    function getTwoDigitString(n) {
        return n < 10 && n > -1 ? "0" + n : "" + n;
    }

    function getUpdatedHours(rawDate) {
        var date = new Date(rawDate);
        var currDate = new Date();
        return getTwoDigitString(date.getHours()) + ":" + getTwoDigitString(date.getMinutes());
    }

    //Sorting Service order by decreasing.
    function sortItInDecrese(dataToBeSort, objName) {
        dataToBeSort.sort(function (a, b) {
            if (Number(a[objName]) > Number(b[objName])) {
                return -1;
            }
            else if (Number(a[objName]) < Number(b[objName])) {
                return 1;
            }
            else {
                return 0;
            }
        });
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    //Async method :-(. Fetching data from a text file.
    function setTextData(objectNm, file) {
        fetch(file).then(
                response => response.text()
            ).then(
                text => localStorage.setItem(objectNm, text)
            )
    }

    //India Data Api
    var settings = {
        "url": "https://api.covid19india.org/data.json",
        "method": "GET",
        "timeout": 0,
    };
    $.ajax(settings).done(function (data) {
        var tempState = data.statewise;
        var state = [];
        for (var i = 1; i < tempState.length; i++) {
            state.push(tempState[i]);
        }
        sortItInDecrese(state, 'confirmed');

        var dataRow = "";
        var rnk = 1;
        for (var i = 0; i < state.length; i++) {
            dataRow += "<tr align='center' class='rows'><td class='column1'>" + rnk + "</td><td style='text-align: left; padding-left: 1%; width: 28%;'><div class='tbodyInd-td-div2'>" + state[i].state + "</div></td><td class='column3 tooltip' style='color: #45b7cd'><label class='tooltiptexttop'>View State Cases</label>" + numberWithCommas(state[i].confirmed) + "</td><td class='column3 tooltip' style='color: red'><label class='tooltiptexttop'>View State Cases</label>" + numberWithCommas(state[i].deaths) + "</td><td class='column6 tooltip' style='color: green'><label class='tooltiptexttop'>View State Cases</label>" + numberWithCommas(state[i].recovered) + "</td></tr>";
            rnk++;
        }
        var tbody = "<tbody>" + dataRow + "</tbody>";
        $("#tblIndiaData").append(tbody);

        jquerySortLib();
        //DataTable, Jquery Library.
        $("#tblIndiaData").DataTable({
            order: [],
            columnDefs: [{
                type: 'formatted-num',
                targets: [0, 2, 3, 4],
            }, {
                targets: 1,
                orderable: false
            }
            ],
        });


        var indGlobal = tempState[0];
        var deathPer = ((indGlobal.deaths) * 100 / indGlobal.confirmed).toFixed(2) + "%";
        var rcvrdPer = ((indGlobal.recovered) * 100 / indGlobal.confirmed).toFixed(2) + "%";

        //India's Bar on top of Page
        $("#lblIndTr").text(numberWithCommas(indGlobal.confirmed));
        $("#spnTtlIndCnf").width("95%");
        $("#lblIndDt").text(numberWithCommas(indGlobal.deaths));
        $("#spnIndDth").width(deathPer);
        $("#lblIndRc").text(numberWithCommas(indGlobal.recovered));
        $("#spnindRcv").width(rcvrdPer);


        $('#divDstrct').hide();
        $("#divDstBar").hide();
        //District Details on Row Click.
        $("#tblIndiaData").on("click", "tr.rows", function (e) {
            var name = e.currentTarget.cells[1].innerText;
            $("#lblStsNm").text(name);
            localStorage.setItem("stsName", name);

            var settings = {
                "url": "https://api.covid19india.org/state_district_wise.json",
                "method": "GET",
                "timeout": 0,
            };
            $.ajax(settings).done(function (data) {
                $('#tblIndiaDistrict tbody').remove();      //Removing prev data before adding new.

                var district = data[name].districtData;
                var districtName = [];
                districtName.push(Object.keys(district));

                var dataRow = "";
                var srnum = 1;
                var cnfrm = 0;
                var dths = 0;
                var rcvr = 0;
                for (var i = 0; i < districtName[0].length; i++) {
                    dataRow += "<tr align='center' class='rows'><td class='column1'>" + srnum + "</td><td style='text-align: left; padding-left: 1%; width: 28%;'><div class='tbodyInd-td-div2'>" + districtName[0][i] + "</div></td><td class='column3 tooltip' style='color: #45b7cd'><label class='tooltiptexttop'>View District Details</label>" + numberWithCommas(district[districtName[0][i]].confirmed) + "</td><td class='column3 tooltip' style='color: red'><label class='tooltiptexttop'>View District Details</label>" + numberWithCommas(district[districtName[0][i]].deceased) + "</td><td class='column6 tooltip' style='color: green'><label class='tooltiptexttop'>View District Details</label>" + numberWithCommas(district[districtName[0][i]].recovered) + "</td></tr>";
                    srnum++;
                    cnfrm += Number(district[districtName[0][i]].confirmed);
                    dths += Number(district[districtName[0][i]].deceased);
                    rcvr += Number(district[districtName[0][i]].recovered);
                }
                var tbody = "<tbody>" + dataRow + "</tbody>";
                $("#tblIndiaDistrict").append(tbody);
                $('#divDstrct').show();

                //India's Bar on top of Page
                $("#lblStsTr").text(numberWithCommas(cnfrm));
                $("#spnTtlStsCnf").width("95%");
                $("#lblStsDt").text(numberWithCommas(dths));
                $("#spnStsDth").width(((dths) * 100 / cnfrm).toFixed(2) + "%");
                $("#lblStsRc").text(numberWithCommas(rcvr));
                $("#spnStsRcv").width(((rcvr) * 100 / cnfrm).toFixed(2) + "%");

                //DataTable Library.
                $("#tblIndiaDistrict").dataTable().fnDestroy();     //Distroying the current init.
                $("#tblIndiaDistrict").DataTable({
                    order: [],
                    columnDefs: [{
                        type: 'formatted-num',
                        targets: [0, 2, 3, 4],
                    }, {
                        targets: 1,
                        orderable: false
                    }
                    ],
                });

                $("#tblIndiaDistrict").on("click", "tr.rows", function (e) {
                    var dstName = e.currentTarget.cells[1].innerText;
                    $("#lblDstNm").text(dstName);
                    district = data[localStorage.getItem("stsName")].districtData;

                    $("#lblDstTc").text(numberWithCommas(district[dstName].confirmed));
                    $("#spnDstCnfrm").width("98%");
                    $("#lblDstTd").text(numberWithCommas(district[dstName].deceased));
                    $("#spnDstDth").width((Number(district[dstName].deceased) * 100 / Number(district[dstName].confirmed)).toFixed(2) + "%");
                    $("#lblDstTr").text(numberWithCommas(district[dstName].recovered));
                    $("#spnDstRcvr").width((Number(district[dstName].recovered) * 100 / Number(district[dstName].confirmed)).toFixed(2) + "%");
                    $("#lblDstAc").text(numberWithCommas(district[dstName].active));
                    $("#spnDstAc").width((Number(district[dstName].active) * 100 / Number(district[dstName].confirmed)).toFixed(2) + "%");

                    $("#divDstBar").show();
                });
            });
        });
    });


    var settings = {
        "url": "https://api.covid19api.com/summary",
        "method": "GET",
        "timeout": 0,
    };
    $.ajax(settings).done(function (data) {
        var country = data.Countries;
        //Soring data through Total Confirmed in decreasing order.
        sortItInDecrese(country, 'TotalConfirmed');

        let mapFlag = new Map();
        for (var i = 0; i < country.length; i++) {
            mapFlag.set(country[i].CountryCode, "https://www.countryflags.io/" + (country[i].CountryCode).toLowerCase() + "/shiny/64.png");
        }

        var dataRow = "";
        var rnk = 1;
        for (var i = 0; i < country.length; i++) {
            dataRow += "<tr align='center' class='rows'><td class='column1'>" + rnk + "</td><td style='text-align: left; padding-left: 1%; width: 28%;'><div class='tbody-td-div'><img src='" + mapFlag.get(country[i].CountryCode) + "' class='tbody-td-img' /></div><div class='tbody-td-div2'>" + country[i].Country + "</div></td><td class='column3 tooltip' style='color: #45b7cd'><label class='tooltiptexttop'>View History Graph</label>" + numberWithCommas(country[i].TotalConfirmed) + "</td><td class='column3 tooltip' style='color: red'><label class='tooltiptexttop'>View History Graph</label>" + numberWithCommas(country[i].TotalDeaths) + "</td><td class='column6 tooltip' style='color: green'><label class='tooltiptexttop'>View History Graph</label>" + numberWithCommas(country[i].TotalRecovered) + "</td></tr>";
            rnk++;
        }
        var tbody = "<tbody>" + dataRow + "</tbody>";
        $("#tblData").append(tbody);

        jquerySortLib();
        //DataTable Library.
        $("#tblData").DataTable({
            order: [],
            columnDefs: [{
                type: 'formatted-num',
                targets: [0, 2, 3, 4],
            }, {
                targets: 1,
                orderable: false
            }
            ],
        });

        var arrDif = getUpdatedHours(country[0].Date).split(':');
        $("#updtDtHr").text(arrDif[0]);
        $("#updtDtMin").text(arrDif[1]);

        //Global Values
        var global = data.Global;

        var nwConfrmPer = ((global.NewConfirmed) * 100 / global.TotalConfirmed).toFixed(2) + "%";
        var nwDeathsPer = ((global.NewDeaths) * 100 / global.TotalConfirmed).toFixed(2) + "%";
        var TttlDthPer = ((global.TotalDeaths) * 100 / global.TotalConfirmed).toFixed(2) + "%";
        var nwRcvrPer = ((global.NewRecovered) * 100 / global.TotalConfirmed).toFixed(2) + "%";
        var TtlRcvrPer = ((global.TotalRecovered) * 100 / global.TotalConfirmed).toFixed(2) + "%";

        var animation = $(".html");
        animation.css({ "0%": "width: 0%", "100%": "width: 80%" });

        //Side Bars
        $("#lblTc").text(numberWithCommas(global.TotalConfirmed));
        $("#spnTtlCnfrm").width("98%");
        $("#lblNc").text(numberWithCommas(global.NewConfirmed));
        $("#spnNwCnfrm").width(nwConfrmPer);
        $("#lblNd").text(numberWithCommas(global.NewDeaths));
        $("#spnNwDth").width(nwDeathsPer);
        $("#lblTd").text(numberWithCommas(global.TotalDeaths));
        $("#spnTtlDth").width(TttlDthPer);
        $("#lblNr").text(numberWithCommas(global.NewRecovered));
        $("#spnNwRcvr").width(nwRcvrPer);
        $("#lblTr").text(numberWithCommas(global.TotalRecovered));
        $("#spnTtlRcvr").width(TtlRcvrPer);

        //Global Bar on top of Page
        $("#lblTr1").text(numberWithCommas(global.TotalConfirmed));
        $("#spnTtlGbCnf").width("95%");
        $("#lblDt1").text(numberWithCommas(global.TotalDeaths));
        $("#spnGbDth").width(TttlDthPer);
        $("#lblRc1").text(numberWithCommas(global.TotalRecovered));
        $("#spnGbRcv").width(TtlRcvrPer);

        passCountryDetails(country);
    });

    var obCnfrmd = null;
    var obDth = null;
    var obRcvrd = null;
    var obTimeout = null;

    //India's API::::::
    var settings = {
        "url": "https://api.covid19api.com/country/india",
        "method": "GET",
        "timeout": 0,
    };
    $.ajax(settings).done(function (data) {
        function getFrmtDate(date) {
            var reqDt = new Date(date);
            var str = reqDt.toLocaleString('default', { month: 'long' }).substr(0, 3) + " " + reqDt.getDate();
            return str
        }

        var dates = [];
        var cnfrmd = [];
        var death = [];
        var rcvrd = [];
        for (var i = data.length - 1; i >= data.length - 30 ; i--) {
            dates.push(getFrmtDate(data[i].Date));
            cnfrmd.push(data[i].Confirmed);
            death.push(data[i].Deaths);
            rcvrd.push(data[i].Recovered);
        }

        var srtcnfrmd = cnfrmd.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
            else {
                return 0;
            }
        });
        var srtdeath = death.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
            else {
                return 0;
            }
        });
        var srtrcvrd = rcvrd.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
            else {
                return 0;
            }
        });

        angular.module('app', ['chart.js']);
        angular.module('app').controller('ConfirmedCase', function ($scope, $timeout) {
            obCnfrmd = $scope;
            obTimeout = $timeout;

            $scope.colors = ['#45b7cd'];
            $scope.labels = dates.reverse();
            $scope.series = ['Series A'];
            $scope.data = [
                srtcnfrmd
            ];

            var axis_ticks = {
                beginAtZero: true,
            };
            $scope.options = {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            color: '#54b0c1'
                        },
                        //interval: 4,
                        ticks: {
                            beginAtZero: 1,
                            maxTicksLimit: 10,
                            fontSize: 11,
                            fontColor: '#45b7cd',
                        }
                    }],
                    yAxes: [{
                        position: 'right',
                        ticks: {
                            callback: function (value) {
                                return Math.abs(value) > 999 ? Math.sign(value) * ((Math.abs(value) / 1000).toFixed(0)) + 'k' : Math.sign(value) * Math.abs(value)
                            },
                            maxTicksLimit: 7,
                            fontSize: 11,
                            fontColor: '#45b7cd',
                        },
                        gridLines: {
                            display: false,
                            color: '#54b0c1'
                        }
                    }]
                },
            };
        });

        //TotalDeath
        var maxCnfrmd = srtcnfrmd[srtcnfrmd.length - 1];
        angular.module('app').controller('DeathCase', function ($scope, $timeout) {
            obDth = $scope;

            $scope.colors = ['#ff0000'];
            $scope.labels = dates.reverse();
            $scope.series = ['Series A'];
            $scope.data = [
                srtdeath
            ];

            var axis_ticks = {
                beginAtZero: true,
            };
            $scope.options = {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            color: '#ad1616'
                        },
                        //interval: 4,
                        ticks: {
                            beginAtZero: 1,
                            maxTicksLimit: 10,
                            fontSize: 11,
                            fontColor: '#ff0000'
                        }
                    }],
                    yAxes: [{
                        position: 'right',
                        ticks: {
                            callback: function (value) {
                                return Math.abs(value) > 999 ? Math.sign(value) * ((Math.abs(value) / 1000).toFixed(0)) + 'k' : Math.sign(value) * Math.abs(value)
                            },
                            maxTicksLimit: 7,
                            fontSize: 11,
                            suggestedMin: 0,
                            suggestedMax: maxCnfrmd,
                            fontColor: '#ff0000'
                        },
                        gridLines: {
                            display: false,
                            color: '#ad1616'
                        }
                    }]
                },
            };
        });

        angular.module('app').controller('RecoveredCase', function ($scope, $timeout) {
            obRcvrd = $scope;

            $scope.colors = ['#33cc33'];
            $scope.labels = dates.reverse();
            $scope.series = ['Series A'];
            $scope.data = [
                srtrcvrd
            ];

            var axis_ticks = {
                beginAtZero: true,
            };
            $scope.options = {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            color: '#57c657'
                        },
                        ticks: {
                            beginAtZero: 1,
                            maxTicksLimit: 10,
                            fontSize: 11,
                            fontColor: '#33cc33'
                        }
                    }],
                    yAxes: [{
                        position: 'right',
                        ticks: {
                            callback: function (value) {
                                return Math.abs(value) > 999 ? Math.sign(value) * ((Math.abs(value) / 1000).toFixed(0)) + 'k' : Math.sign(value) * Math.abs(value)
                            },
                            maxTicksLimit: 7,
                            fontSize: 11,
                            suggestedMin: 0,
                            suggestedMax: maxCnfrmd,
                            fontColor: '#33cc33'
                        },
                        gridLines: {
                            display: false,
                            color: '#57c657'
                        }
                    }]
                },
            };
        });

        angular.element(document).ready(function () {
            angular.bootstrap(document, ['app']);
        });
    });

    function passCountryDetails(country) {
        $("#tblData").on("click", "tr.rows", function (e) {          //'td.column3' at the palce of 'tr.rows' used for td's row selection :when class name of td is 'column3'
            var indx;
            var name = e.currentTarget.cells[1].innerText;
            sortItInDecrese(country, 'TotalConfirmed');
            for (var i = 0; i < country.length; i++) {
                if (country[i].Country == name) {
                    indx = i;
                }
            }

            var countryNm = country[indx].Slug
            $("#hCntryNm").text(name);

            if (countryNm == "united-states") {
                var settings = {
                    "url": "https://corona.lmao.ninja/v2/historical/USA",
                    "method": "GET",
                    "timeout": 0
                };
                $.ajax(settings).done(function (data) {
                    var cnfrmd = [];
                    var death = [];
                    var rcvrd = [];

                    var dc1 = JSON.stringify(data.timeline.cases);
                    var dd1 = JSON.stringify(data.timeline.deaths);
                    var dr1 = JSON.stringify(data.timeline.recovered);

                    var dc2 = dc1.substr(2, dc1.length - 4).split(',');
                    var dd2 = dd1.substr(2, dd1.length - 4).split(',');
                    var dr2 = dr1.substr(2, dr1.length - 4).split(',');

                    for (var i = 0; i < dc2.length; i++) {
                        var temp1 = dc2[i].split(':');
                        var temp2 = dd2[i].split(':');
                        var temp3 = dr2[i].split(':');

                        cnfrmd.push(Number(temp1[1]));
                        death.push(Number(temp2[1]));
                        rcvrd.push(Number(temp3[1]));
                    }
                    updateGraph(cnfrmd, death, rcvrd);
                });
            }

            else {
                var settings = {
                    "url": "https://api.covid19api.com/country/" + countryNm,
                    "method": "GET",
                    "timeout": 0
                };
                $.ajax(settings).done(function (data) {
                    var cnfrmd = [];
                    var death = [];
                    var rcvrd = [];

                    if (data.length > 0) {
                        for (var i = data.length - 1; i >= data.length - 30 ; i--) {
                            cnfrmd.push(data[i].Confirmed);
                            death.push(data[i].Deaths);
                            rcvrd.push(data[i].Recovered);
                        }
                    }
                    else {
                        cnfrmd.push(0);
                        death.push(0);
                        rcvrd.push(0);
                    }
                    updateGraph(cnfrmd, death, rcvrd);
                });
            }

        });
    }

    //Update Graph Service.
    function updateGraph(cnfrmd, death, rcvrd) {
        var srtcnfrmd = cnfrmd.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
            else {
                return 0;
            }
        });
        var srtdeath = death.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
            else {
                return 0;
            }
        });
        var srtrcvrd = rcvrd.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
            else {
                return 0;
            }
        });

        //Limit for yAxes.
        var maxCnfrmd = srtcnfrmd[srtcnfrmd.length - 1];

        obTimeout(function () {
            obCnfrmd.data = [
                srtcnfrmd
            ];
            obCnfrmd.options = {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            color: '#54b0c1'
                        },
                        //interval: 4,
                        ticks: {
                            beginAtZero: 1,
                            maxTicksLimit: 10,
                            fontSize: 11,
                            fontColor: '#45b7cd'
                        }
                    }],
                    yAxes: [{
                        position: 'right',
                        ticks: {
                            callback: function (value) {
                                return Math.abs(value) > 999 ? Math.sign(value) * ((Math.abs(value) / 1000).toFixed(0)) + 'k' : Math.sign(value) * Math.abs(value)
                            },
                            maxTicksLimit: 7,
                            fontSize: 11,
                            fontColor: '#45b7cd'
                        },
                        gridLines: {
                            display: false,
                            color: '#54b0c1'
                        }
                    }]
                }
            }
        }, 0);

        obTimeout(function () {
            obDth.data = [
                srtdeath
            ];
            obDth.options = {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            color: '#ad1616'
                        },
                        //interval: 4,
                        ticks: {
                            beginAtZero: 1,
                            maxTicksLimit: 10,
                            fontSize: 11,
                            fontColor: '#ff0000'
                        }
                    }],
                    yAxes: [{
                        position: 'right',
                        ticks: {
                            callback: function (value) {
                                return Math.abs(value) > 999 ? Math.sign(value) * ((Math.abs(value) / 1000).toFixed(0)) + 'k' : Math.sign(value) * Math.abs(value)
                            },
                            maxTicksLimit: 7,
                            fontSize: 11,
                            suggestedMin: 0,
                            suggestedMax: maxCnfrmd,
                            fontColor: '#ff0000'
                        },
                        gridLines: {
                            display: false,
                            color: '#ad1616'
                        }
                    }]
                }
            }
        }, 0);

        obTimeout(function () {
            obRcvrd.data = [
                rcvrd
            ];
            obRcvrd.options = {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            color: '#57c657'
                        },
                        //interval: 4,
                        ticks: {
                            beginAtZero: 1,
                            maxTicksLimit: 10,
                            fontSize: 11,
                            fontColor: '#33cc33'
                        }
                    }],
                    yAxes: [{
                        position: 'right',
                        ticks: {
                            callback: function (value) {
                                return Math.abs(value) > 999 ? Math.sign(value) * ((Math.abs(value) / 1000).toFixed(0)) + 'k' : Math.sign(value) * Math.abs(value)
                            },
                            maxTicksLimit: 7,
                            fontSize: 11,
                            suggestedMin: 0,
                            suggestedMax: maxCnfrmd,
                            fontColor: '#33cc33'
                        },
                        gridLines: {
                            display: false,
                            color: '#57c657'
                        }
                    }]
                }
            }
        }, 0);
    }

})(jQuery);