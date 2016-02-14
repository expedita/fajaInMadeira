var maxStep = 7, gvToken = "";
var gvEntity      = "fpadres";
var gvUser        = "pfernandes";
var gvPassword    = "";
var gvIsoLingua   = "PT";
var gvIdServico   = 108;//86";//
var gvBtnDiaS     = null;
var gvBtnPrdS     = null;
var gvMapDadosDia = new Array();
var gvInfoPSel = "";

var gvWeekDays  = {
    PT: ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sabado-Feira'],
    EN: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    getText: function (pIdx, pMaxLen) {return this[gvIsoLingua][pIdx].substr(0, pMaxLen);}
};

var gvMonths = {
    PT: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    EN: ['Janyary', 'February', 'March', 'April', 'Mai', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December'],
    getText: function (pIdx, pMaxLen) {return this[gvIsoLingua][pIdx].substr(0, pMaxLen);}
};


function doCall(ws, method, params, functSuccess) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "http://fo.qualidade.inmadeira.com/rest/" + ws + "/" + method,
        data: "{" + params + "}",
        dataType: "json",
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR.responseText);
        },
        success: functSuccess
    });
}

function generic(data) {
    alert(data.d);
}

function isValidMD5(pToken) {
    var lvRegExp = new RegExp(/^[a-fA-F0-9]{32}$/);
    return lvRegExp.test(pToken);
}

function setStepState(pStep) {
    var lvTRL  = document.getElementById("trAreaLogin");
    var lvTRHD = document.getElementById("trHdrDias");
    var lvTRD  = document.getElementById("trDias");
    var lvTRHP = document.getElementById("trHdrProds");
    var lvTRP  = document.getElementById("trProds");
    var lvTRHT = document.getElementById("trHdrTars");
    var lvTRT  = document.getElementById("trTars");
    var lvTRHC = document.getElementById("trHdrCli");
    var lvTRC  = document.getElementById("trCli");
    lvTRL.style.display  = "none";
    switch (pStep) {
        case "L":
            lvTRL.style.display  = "";
            lvTRHD.style.display = "none";
            lvTRD.style.display  = "none";
            lvTRHP.style.display = "none";
            lvTRP.style.display  = "none";
            lvTRHT.style.display = "none";
            lvTRT.style.display  = "none";
            lvTRHC.style.display = "none";
            lvTRC.style.display  = "none";
       break; case "D":
            lvTRHD.style.display = "";
            lvTRD.style.display  = "";
            lvTRHP.style.display = "none";
            lvTRP.style.display  = "none";
            lvTRHT.style.display = "none";
            lvTRT.style.display = "none";
            lvTRHC.style.display = "none";
            lvTRC.style.display  = "none";
        break; case "P":
            lvTRHP.style.display = "";
            lvTRP.style.display  = "";
            lvTRHT.style.display = "none";
            lvTRT.style.display  = "none";
            lvTRHC.style.display = "none";
            lvTRC.style.display  = "none";
        break; case "T":
            lvTRHT.style.display = "";
            lvTRT.style.display  = "";
            lvTRHC.style.display = "none";
            lvTRC.style.display  = "none";
        break; case "C":
            lvTRHC.style.display = "";
            lvTRC.style.display  = "";
    }
}

//login to user in entity demo -----------------------------------------------
function step1() {
    gvPassword = document.getElementById('password').value;
    doCall('authentication.asmx', 'login', 'Entity:\'' + gvEntity + '\', User:\'' + gvUser + '\', Password:\'' + gvPassword + '\'', step1_process);
    /*
    for (j = 2; j <= maxStep; j++) {
        document.getElementById("step_" + j.toString()).style.visibility = 'hidden';
    };
    */
}

function step1_process(data) {
    if (isValidMD5(data.d)) {
        document.getElementById('step1td').innerHTML = 'user ' + data.d;
        //document.getElementById("step_2").style.visibility = 'visible';
        gvToken = data.d;

        window.localStorage.setItem("password", gvPassword);

        doCall("timetable.asmx", "ListWeek", "ServiceId:" + gvIdServico + ", ProductCode:''", step4_process);

    }
    else {
        alert(data.d);
    }
}

//list classifications ------------------------------------------------------
function step2() {
    doCall('catalog.asmx', 'ListTypeByLocation', 'Language:"' + gvIsoLingua + '"', step2_process);

    document.getElementById('selLocation').options.length = 0;
    document.getElementById('selType').options.length = 0;

    for (j = 3; j <= maxStep; j++) {
        document.getElementById("step_" + j.toString()).style.visibility = 'hidden';
    };
}

function step2_process(data) {
    var locSelector = document.getElementById('selLocation');
    var typeSelector = document.getElementById('selType');

    document.getElementById('selService').options.length = 0;
    var option = document.createElement("option");
    option.text = 'all';
    option.value = "";
    locSelector.add(option);

    var locArray = data.d;
    for (i = 0; i < locArray.length; i++) {
        var option = document.createElement("option");
        option.text = locArray[i].name;
        option.value = locArray[i].name;
        locSelector.add(option);

        var typeArray = locArray[i].types;
        for (j = 0; j < typeArray.length; j++) {
            var option2 = document.createElement("option");
            option2.text = locArray[i].name + ' - ' + typeArray[j].name;
            option2.value = locArray[i].id + '::' + typeArray[j].id;
            typeSelector.add(option2);
        };
    }
    document.getElementById("step_3").style.visibility = 'visible';
}

function step2_location() {
    var locSelector = document.getElementById("selLocation");
    var typeSelector = document.getElementById("selType");
    var selected = locSelector.value;

    for (i = 0; i < typeSelector.options.length; i++) {
        if (typeSelector.options[i].text.indexOf(selected) >= 0) {
            typeSelector.options[i].disabled = false;
            typeSelector.options[i].style.display = "";
        } else {
            typeSelector.options[i].disabled = true;
            typeSelector.options[i].style.display = "none";
        }
    }
}

//list services -------------------------------------------------------------
function step3() {
    document.getElementById('selService').options.length = 0;
    var selected = document.getElementById('selType').value.split('::');
    doCall("catalog.asmx", "GetServices", "Location:'" + selected[0] + "', Type:'" + selected[1] + "', Token:'" + gvToken + "', Language:'PT'", step3_process);
    for (j = 4; j <= maxStep; j++) {
        document.getElementById("step_" + j.toString()).style.visibility = 'hidden';
    };
}

function step3_process(data) {
    var servSelector = document.getElementById('selService');
    document.getElementById('selDay').options.length = 0;

    var serArray = data.d;
    for (i = 0; i < serArray.length; i++) {
        var option = document.createElement("option");
        option.text = serArray[i].name;
        option.value = serArray[i].id;

        var prop = document.createAttribute('image');
        prop.value = serArray[i].image;
        option.attributes.setNamedItem(prop);

        servSelector.add(option);
    }
    document.getElementById("step_4").style.visibility = 'visible';
}

//list day availability -------------------------------------------------------------
function step4() {
    document.getElementById('selDay').options.length = 0;
    document.getElementById('selTime').options.length = 0;
    var selected = document.getElementById('selService').value;
    doCall("timetable.asmx", "ListWeek", "ServiceId:" + selected + ", ProductCode:''", step4_process);
    for (j = 5; j <= maxStep; j++) {
        document.getElementById("step_" + j.toString()).style.visibility = 'hidden';
    };
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]); // padding
};

function step4_process(data) {
    gvMapDadosDia                    = new Array();
    gvBtnDiaS                        = null;
    var lvHoje                       = new Date();
    var lvHojeOK                     = false;
    var dayArray                     = data.d.dayList;
    var lvDivDias                    = document.getElementById('divDias');
    var lvHtmDias                    = "", lvValHoje = "";
    gvMapDadosDia[lvHoje.yyyymmdd()] = "";

    for (i = 0; i < dayArray.length; i++) {
        if (i<15){
            var day    = new Date(parseInt(dayArray[i].day.match(/(\d+)/)[1], 10));
            var lvWD   = day.getDay();
            var lvIsWE = (lvWD == 0 || lvWD == 6 ? "1" : "0");
            if (lvHoje.yyyymmdd() == day.yyyymmdd()) {
                lvHojeOK                         = true;
                lvValHoje                        = JSON.stringify(dayArray[i].events);
                gvMapDadosDia[lvHoje.yyyymmdd()] = lvValHoje
            }else{
                var lvWeek                    = gvWeekDays.getText(day.getDay(), 3) + ".";
                var lvDiaOk                   = false;
                var lvCss;
                gvMapDadosDia[day.yyyymmdd()] = "";

                if (day.getFullYear() == (new Date()).getFullYear()) {
                    lvDiaOk                       = true;
                    gvMapDadosDia[day.yyyymmdd()] = JSON.stringify(dayArray[i].events)
                }
                //if (day.getDate() == 17) lvDiaOk = false;

                if (lvDiaOk) {
                    lvCss = "divDiaSemana " + (lvIsWE == "1" ? "diaFimSemanaNotSelected" : "diaSemanaNotSelected");
                } else {
                    lvCss = "divDiaSemana " + (lvIsWE == "1" ? "diaFimSemanaDisabled" : "diaSemanaDisabled");
                }

                var lvTxt = "<div class='ds'>" + lvWeek.toUpperCase() + "<br/><font>" + day.getDate() + " " + gvMonths.getText(day.getMonth(), 3) + "</font></div>";
                lvHtmDias += "<div isHoje='0' class='" + lvCss + "' day='" + day.yyyymmdd() + "' isWE='" + lvIsWE + "' onclick='step4_day(this)'>" + lvTxt + "</div>";
            }
        }
    }
    var lvTxtHoje = "<div class='ds'>HOJE<br/><font>" + lvHoje.getDate() + " " + gvMonths.getText(lvHoje.getMonth(), 3) + "</font></div>";
    var lvCss     = "divDiaHoje "  + (lvHojeOK ? "diaHojeNotSelected" : "diaHojeDisabled")
    var lvIsWE    = (day.getDay() == 0 || day.getDay() == 6 ? "1" : "0");
    lvHtmDias     = "<div class='" + lvCss + "' isHoje='1' day='" + lvHoje.yyyymmdd() + "' isWE='" + lvIsWE + "' onclick='step4_day(this)'>" + lvTxtHoje + "</div>" + lvHtmDias;
    var lvDivDias = document.getElementById('divDias');
    lvDivDias.innerHTML = lvHtmDias;

    setStepState("D");
}


function step4_day(pBtnDia) {
    var lvDia    = pBtnDia.getAttribute("day");
    var lvInfDia = gvMapDadosDia[lvDia];
    if (lvInfDia != null && lvInfDia != ""){
        var data   = JSON.parse(lvInfDia);
        var lvHtmP = "";
        for (i = 0; i < data.length; i++) {
            var lvTxtP     = "<div class='pr'>" + data[i].productName.toUpperCase() + "<br/><font>(" + data[i].startTime + ' as ' + data[i].endTime + ")</font></div>";
            var lvInfoPSel = data[i].serviceId.toString() + ':' + data[i].productId.toString() + ':' + data[i].availabilityId.toString() + ':' + data[i].consumptionPeriodId.toString() + ':' + data[i].dayPerioId.toString() + ':' + lvDia;
            lvHtmP += "<div class='prod prodNotSelected' value='" + lvInfoPSel + "' onclick='step5(this)'>" + lvTxtP + "</div>"
        }
        var lvDivProds       = document.getElementById('divProds');
        lvDivProds.innerHTML = lvHtmP;
    }

    setEstadoDia(gvBtnDiaS, false);
    setEstadoDia(pBtnDia,   true);
    gvBtnDiaS = null;
    gvBtnDiaS = pBtnDia;
    setStepState("P");
}

function setEstadoDia(pBtn, pSeleccionar){
    if (pBtn == null) return;
    var lvIsH = (pBtn.getAttribute("isHoje") * 1 == 1);
    var lvCssOld, lvCssNew;

    if (lvIsH) {
        lvCssOld = (pSeleccionar ? "diaHojeNotSelected" : "diaHojeSelected");
        lvCssNew = (pSeleccionar ? "diaHojeSelected"    : "diaHojeNotSelected");
    } else {
        var lvIsWE = (pBtn.getAttribute("isWE") * 1 == 1);
        if (lvIsWE) {
            lvCssOld = (pSeleccionar ? "diaFimSemanaNotSelected" : "diaSemanaSelected");
            lvCssNew = (pSeleccionar ? "diaSemanaSelected"    : "diaFimSemanaNotSelected");
        } else {
            lvCssOld = (pSeleccionar ? "diaSemanaNotSelected" : "diaSemanaSelected");
            lvCssNew = (pSeleccionar ? "diaSemanaSelected"    : "diaSemanaNotSelected");
        }
    }
    $(pBtn).removeClass(lvCssOld).addClass(lvCssNew);
}

//list tariffs -------------------------------------------------------------
function step5(pBtnProd) {
    //                 0     1     2     3      4      5
    //pBtnProd.value = SrvId:PrdId:AvaId:CPrdId:DPrdId:Day;
    gvInfoPSel = pBtnProd.getAttribute("value");
    var lvArrInf = gvInfoPSel.split(":");

    if (gvBtnPrdS != null) { $(gvBtnPrdS).removeClass("prodSelected").addClass("prodNotSelected"); }
    $(pBtnProd).removeClass("prodNotSelected").addClass("prodSelected");
    gvBtnPrdS = null; gvBtnPrdS = pBtnProd;

    doCall("pricetable.asmx", "ListByDate", "ProductId:" + lvArrInf[1] + ",PeriodId:" + lvArrInf[3] + ",BookDate:'" + lvArrInf[5] + "', Token:'" + gvToken + "'", step5_process);
}

function step5_process(data) {
    var lvDivTarifas = document.getElementById('divTarifas');
    var tarSelector = document.getElementById('selTariff');

    var tarArray = data.d.tariffs;
    var lvHtm    = "";
    for (i = 0; i < tarArray.length; i++) {
        var lvTBox  = "<select  class='tb' id='" + tarArray[i].tariffId + "' value='0'>";
        lvTBox     += "<option value='0'>00</option><option value='1'>01</option><option value='2'>02</option>";
        lvTBox     += "<option value='3'>03</option><option value='4'>04</option><option value='5'>05</option>";
        lvTBox     += "<option value='6'>06</option><option value='7'>07</option><option value='8'>08</option>";
        lvTBox     += "<option value='9'>09</option><option value='10'>10</option>";
        lvTBox     += "</select>";
        var lvTxtP = "&nbsp;<div class='tr'>" + tarArray[i].name.toUpperCase() + " <font>" + tarArray[i].value.toString() + ' ' + tarArray[i].coin + "</font></div>";
        lvHtm      += "<div class='tar tarNotSelected'>" + lvTBox + lvTxtP + "</div>"
    }
    lvDivTarifas.innerHTML = lvHtm;
    document.getElementById("step_6").style.visibility = 'visible';
    setStepState("T");
}

//book services -----------------------------------------------------------
function step6() {
    //             0     1     2     3      4      5
    //gvInfoPSel = SrvId:PrdId:AvaId:CPrdId:DPrdId:Day;
    var period      = gvInfoPSel.split(":");
    var day         = period[5];
    var tarSelector = document.getElementById("divTarifas").getElementsByTagName("select");

    var clients     = "";
    for (i = 0; i < tarSelector.length; i++) {
        var lvInput = tarSelector[i];
        if (parseInt(lvInput.value, 0) > 0) {
            clients += "|" + lvInput.id + "$" + lvInput.value;
        }
    }

    if (clients != "") {
        clients = clients.substr(1, clients.length - 1);
        doCall("quickbook.asmx", "simple", "BookDate:'" + day.nodeValue + "',Period:" + period[4] + ",Clients:'" + clients + "', Token:'" + gvToken + "'", step6_process);
    }

    for (j = 7; j <= maxStep; j++) {
        document.getElementById("step_" + j.toString()).style.visibility = 'hidden';
    };
}

var bookNumber = 0;
function step6_process(data) {
    //alert(data.d);
    var td = document.getElementById("step6td");
    td.innerHTML = "BOOKING NUMBER : " + data.d.code;
    bookNumber = data.d.code;

    document.getElementById("step_7").style.visibility = 'visible';
    setStepState("C");
}

//confirm reservation
function step7() {
    var lvClient = document.getElementById('firstName').value;
    lvClient += "$" + document.getElementById('lastName').value;
    lvClient += "$" + document.getElementById('phone').value;
    lvClient += "$" + document.getElementById('email').value;
    lvClient += "$" + document.getElementById('hotel').value;
    lvClient += "$" + document.getElementById('room').value;
    lvClient += "$" + document.getElementById('nationality').value;

    doCall("quickbook.asmx", "confirmReservation", "Code:" + bookNumber + ",Identity:'" + lvClient + "', Token:'" + gvToken + "'", step7_process);
}

function step7_process(data) {
    alert(data.d);
}

// COMPLEMENTARY INFORMATION ===========================================================
function loadService() {
    var selected = document.getElementById('selService').value;
    var xmlurl = "../DesktopContexts/recursos/xml.aspx?id=" + selected;

    $.ajax({ type: "GET", url: xmlurl, dataType: "xml", success: function (xml) { readservicexml(xml); } });
}

function readservicexml(xml) {
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "<font color='red'>D</font>";
    weekday[1] = "S";
    weekday[2] = "T";
    weekday[3] = "Q";
    weekday[4] = "Q";
    weekday[5] = "S";
    weekday[6] = "<font color='red'>S</font>";

    $(xml).find('service').each(function () {
        var name = $(this).find('name:first').text();
        var desc = $(this).find('description').html();
        var cond = $(this).find('conditions').html();
        var prods = '<span style="font-family:monospace;font-size:14px;letter-spacing:2px;">';
        var newDate = new Date();
        for (i = 0; i < 15; i++) {
            newDate.setTime(d.getTime() + i * 24 * 60 * 60 * 1000);
            prods += weekday[newDate.getDay()];
        }
        prods += "</span><br />";
        $(this).find('product').each(function () {
            prods += '<span style="font-family:monospace;font-size:14px;letter-spacing:2px;">' +
               $(this).find('availability').text().replace(/X/gi, '&#8226;').replace(/_/gi, '&nbsp;') +
               '</span> ' + $(this).find('name').text() + '<br />';
        });

        var output = document.getElementById("col2top");
        output.innerHTML = "<h1>" + name + "</h1>";
        output.innerHTML += "<p>" + desc + "</p>";
        output.innerHTML += "<h2>Produtos</h2>";
        output.innerHTML += "<p>" + prods + "</p>";
        output.innerHTML += "<h2>Condições de Reserva</h2>";
        output.innerHTML += "<p>" + cond + "</p>";
    });
}