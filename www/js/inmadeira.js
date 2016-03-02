var gvInDbgMode    = false;//modo debug
var maxStep = 7, gvToken = "";
var gvEntity      = "fpadres";
var gvUser        = "pfernandes";
var gvPassword    = "";
var gvIsoLingua   = "PT";
var gvIdServico   = 108;//86";//
var gvCurStep       = "L"; //login
var gvBtnDiaS     = null;
var gvBtnPrdS     = null;
var gvMapDadosDia = new Array();
var gvInfoPSel = "";
var gvInfoTSel      = "";
var gvTotalReserva  = 0.00;
var gvModdosPag     = [{id:"1", nome:"Numerário"}, {id:"16", nome:"Pagamento Diferido"}, {id:"3", nome:"Cartão Credito"}] 
var gvBtnModPagS    = null;
var gvIdModPagS     = -1;
var gvBookNumber    = 0;
var gvTkSlipPrintOK = false; 
var gvA4TkPrintOK   = false; 
var gvA4RsPrintOK   = false; 

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

function doPageOnload() {
    $.blockUI.defaults.css = {};
    $.blockUI.defaults.overlayCSS.backgroundColor = '#888888';
    if (gvInDbgMode){
        //*** debug lista bilhetes reserva *** 
        document.getElementById("btnDebug").style.display   = "";
        //document.getElementById("btnDebug").value            = "Lista Prds Reserva";
        document.getElementById("btnDebug").value            = "Set for Print";
        document.getElementById("trAreaLogin").style.display = "";
    }
}

function doDebugStep(){
    //gvInfoPSel = SrvId«;»PrdId«;»AvaId«;»CPrdId«;»DPrdId«;»Day«;»prod«;»hora;
    gvInfoPSel   = "86«;»433«;»1621«;»5045«;»9958«;»2016-02-19«;»RA_BT_11«;»19:00";
    //*** debug lista bilhetes reserva *** 
    setStepState("I"); gvBookNumber = "224443";
    //step8();
}

function showLoading(pShow, pTexto) {
    if (pShow){
        var  lvImg = "<br/><img src='./img/preload.gif' border='0' style='margin-top:4px'>";
        if (pTexto == ""){
            $("div[id$='divMainForm']").block({ message: "<div class='blockUIText'>Aguarde por favor" + lvImg + "</div>" });
        } else {
            $("div[id$='divMainForm']").block({ message: "<div class='blockUIText'>" + pTexto + "<span class='subtext'><br/>Aguarde por favor" + lvImg + "</span</div>" });
        }
    } else {
        $("div[id$='divMainForm']").unblock();
    }
}


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

var gvArrCtl    = ["trAreaLogin", "trHdrDias", "trDias", "trHdrProds", "trProds", "trHdrTars", "trTars", "trHdrRes", "trRes", "step_6", "trPrint", "trCheckinList"];
var gvMapStepCs = {
    "L":["trAreaLogin"],
    "D":["trHdrDias", "trDias"], 
    "P":["trHdrDias", "trDias", "trHdrProds", "trProds"], 
    "T":["trHdrDias", "trDias", "trHdrProds", "trProds", "trHdrTars", "trTars", "step_6"], 
    "C":["trHdrRes",  "trRes"], 
    "I":["trPrint", "trCheckinList"]
}

function setStepState(pStep) {
    if (pStep == ""){pStep = gvCurStep}else{gvCurStep = pStep};
    var lvMapSowC = new Array();
    var lvArrC    = gvMapStepCs[pStep];
    for (var lvI=0;lvI < lvArrC.length;lvI++){lvMapSowC[lvArrC[lvI]] = "ok";}
    for (var lvI=0;lvI < gvArrCtl.length;lvI++){
        document.getElementById(gvArrCtl[lvI]).style.display = (lvMapSowC[gvArrCtl[lvI]] == "ok" ? "" : "none");
    }
    if (pStep == "I"){
        gvTkSlipPrintOK = false; 
        gvA4TkPrintOK   = false; 
        gvA4RsPrintOK   = false; 
    }
}

//login to user in entity demo -----------------------------------------------
function step1() {
    showLoading(true, "Confirmando o login");
    gvPassword = document.getElementById('password').value;
    doCall('authentication.asmx', 'login', 'Entity:\'' + gvEntity + '\', User:\'' + gvUser + '\', Password:\'' + gvPassword + '\'', step1_process);
    /*
    for (j = 2; j <= maxStep; j++) {
        document.getElementById("step_" + j.toString()).style.visibility = 'hidden';
    };
    */
}

function step1_process(data) {
    showLoading(false, "");
    if (isValidMD5(data.d)) {
        document.getElementById('step1td').innerHTML = 'user ' + data.d;
        gvToken = data.d;

        showLoading(true, "Procurando dias disponiveis");
        window.localStorage.setItem("password", gvPassword);

        doCall("timetable.asmx", "ListWeek", "ServiceId:" + gvIdServico + ", ProductCode:''", step4_process);

    }
    else {
        alert(data.d);
    }
}

//list classifications ------------------------------------------------------
function step2() {
    showLoading(true);
    doCall('catalog.asmx', 'ListTypeByLocation', 'Language:"' + gvIsoLingua + '"', step2_process);

    document.getElementById('selLocation').options.length = 0;
    document.getElementById('selType').options.length = 0;
}

function step2_process(data) {
    showLoading(false, "");
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
    showLoading(true);
    document.getElementById('selService').options.length = 0;
    var selected = document.getElementById('selType').value.split('::');
    doCall("catalog.asmx", "GetServices", "Location:'" + selected[0] + "', Type:'" + selected[1] + "', Token:'" + gvToken + "', Language:'PT'", step3_process);
}

function step3_process(data) {
    showLoading(false, "");
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
}

//list day availability -------------------------------------------------------------
function step4() {
    showLoading(true);
    document.getElementById('selDay').options.length = 0;
    document.getElementById('selTime').options.length = 0;
    var selected = document.getElementById('selService').value;
    doCall("timetable.asmx", "ListWeek", "ServiceId:" + selected + ", ProductCode:''", step4_process);
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]); // padding
};

function step4_process(data) {
    showLoading(false, "Verificando dias disponiveis");
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
                    lvCss = "divDiaSemana centrar " + (lvIsWE == "1" ? "diaFimSemanaNotSelected" : "diaSemanaNotSelected");
                } else {
                    lvCss = "divDiaSemana centrar " + (lvIsWE == "1" ? "diaFimSemanaDisabled" : "diaSemanaDisabled");
                }

                var lvTxt = "<div class='ds'>" + lvWeek.toUpperCase() + "<br/><font>" + day.getDate() + " " + gvMonths.getText(day.getMonth(), 3) + "</font></div>";
                lvHtmDias += "<div isHoje='0' class='" + lvCss + "' day='" + day.yyyymmdd() + "' isWE='" + lvIsWE + "' onclick='step4_day(this)'>" + lvTxt + "</div>";
            }
        }
    }
    var lvTxtHoje = "<div class='ds'>HOJE<br/><font>" + lvHoje.getDate() + " " + gvMonths.getText(lvHoje.getMonth(), 3) + "</font></div>";
    var lvCss     = "divDiaHoje centrar "  + (lvHojeOK ? "diaHojeNotSelected" : "diaHojeDisabled")
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
            var lvTxtP     = "<div class='pr'>" + data[i].productName.toUpperCase() + "<br/><font>(" + data[i].startTime + ' às ' + data[i].endTime + ")</font></div>";
            var lvInfoPSel = data[i].serviceId.toString() + '«;»' + data[i].productId.toString() + '«;»' + data[i].availabilityId.toString() + '«;»' + data[i].consumptionPeriodId.toString() + '«;»' + data[i].dayPerioId.toString() + '«;»' + lvDia + '«;»' + data[i].productName + '«;»' + data[i].startTime + ' às ' + data[i].endTime;
            lvHtmP += "<div class='prod centrar prodNotSelected' value='" + lvInfoPSel + "' onclick='step5(this)'>" + lvTxtP + "</div>"
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
    setStepState("P");
    //                 0       1       2       3        4        5     6      7
    //pBtnProd.value = SrvId«;»PrdId«;»AvaId«;»CPrdId«;»DPrdId«;»Day«;»prod«;»hora;
    gvInfoPSel = pBtnProd.getAttribute("value");
    gvInfoTSel   = "";
    var lvArrInf = gvInfoPSel.split("«;»");

    if (gvBtnPrdS != null) { $(gvBtnPrdS).removeClass("prodSelected").addClass("prodNotSelected"); }
    $(pBtnProd).removeClass("prodNotSelected").addClass("prodSelected");
    gvBtnPrdS = null; gvBtnPrdS = pBtnProd;

    showLoading(true, "Carregando tarifas");
    doCall("pricetable.asmx", "ListByDate", "ProductId:" + lvArrInf[1] + ",PeriodId:" + lvArrInf[3] + ",BookDate:'" + lvArrInf[5] + "', Token:'" + gvToken + "'", step5_process);
}

function step5_process(data) {
    showLoading(false, "");
    var lvDivTarifas = document.getElementById('divTarifas');
    var tarSelector = document.getElementById('selTariff');

    var tarArray = data.d.tariffs;
    var lvHtm    = "";
    for (i = 0; i < tarArray.length; i++) {
        var lvTBox  = "<select  class='tb' id='" + tarArray[i].tariffId + "' value='0' tarName='" + tarArray[i].name + "' tarPrice='" + tarArray[i].value.toString() + "'  tarCoin='" + tarArray[i].coin + "'>";
        lvTBox     += "<option value='0'>00</option><option value='1'>01</option><option value='2'>02</option>";
        lvTBox     += "<option value='3'>03</option><option value='4'>04</option><option value='5'>05</option>";
        lvTBox     += "<option value='6'>06</option><option value='7'>07</option><option value='8'>08</option>";
        lvTBox     += "<option value='9'>09</option><option value='10'>10</option>";
        lvTBox     += "</select>";
        var lvTxtP = "&nbsp;<div class='tr'>" + tarArray[i].name.toUpperCase() + " <font>" + tarArray[i].value.toString() + ' ' + tarArray[i].coin + "</font></div>";
        lvHtm      += "<div class='tar centrar tarNotSelected'>" + lvTBox + lvTxtP + "</div>"
    }
    lvDivTarifas.innerHTML = lvHtm;
    setStepState("T");
}

//book services -----------------------------------------------------------
function step6() {
    //             0       1       2       3        4        5     6      7
    //gvInfoPSel = SrvId«;»PrdId«;»AvaId«;»CPrdId«;»DPrdId«;»Day«;»prod«;»hora;
    var period      = gvInfoPSel.split("«;»");
    var day         = period[5];
    var tarSelector = document.getElementById("divTarifas").getElementsByTagName("select");

    var clients     = "";
    gvTotalReserva  = 0.00;
    gvInfoTSel      = "";

    for (i = 0; i < tarSelector.length; i++) {
        var lvInput = tarSelector[i];
        if (parseInt(lvInput.value, 0) > 0) {
            clients += "|" + lvInput.id + "$" + lvInput.value;
            if (gvInfoTSel != "") gvInfoTSel += "«;»";
            gvInfoTSel     += lvInput.value + " x " + lvInput.getAttribute("tarName") + " <span>" + (lvInput.getAttribute("tarPrice")*1).toFixed(2)+ ' ' + lvInput.getAttribute("tarCoin") + "</span>";
            gvTotalReserva += lvInput.getAttribute("tarPrice").replace(/,/g, ".")*1;
        }
    }

    if (clients != "") {
        clients = clients.substr(1, clients.length - 1);
        showLoading(true, "Efectuando a Reserva");
        doCall("quickbook.asmx", "simple", "BookDate:'" + day + "',Period:" + period[4] + ",Clients:'" + clients + "', Token:'" + gvToken + "'", step6_process);
    }
}

function step6_process(data) {
    showLoading(false, "");
    var lvTblRes = document.getElementById("detalhesReserva");
    var lvErrRes   = document.getElementById("spErroReserva");
    var lvFDescRes = document.getElementById("fDescErroReserva");

    if (data.d.code * 1 <= 0) {
        lvTblRes.style.display = "none";
        lvErrRes.style.display = "";
        lvFDescRes.innerHTML = data.d.errorDescription;
    } else {
        var lvHtml = "";
        for (var lvI = 0; lvI < gvModdosPag.length; lvI++) {
            var lvMP = gvModdosPag[lvI];
            lvHtml += "<div class='divModPag centrar modPagNotSelected' value=" + lvMP.id + " onclick='setModoPag(this)'>" + lvMP.nome + "</div>";
        }
        document.getElementById("divModsPag").innerHTML     = lvHtml;
        document.getElementById("spIdReserva").innerHTML    = "Nº " + data.d.code;
        lvTblRes.style.display                              = "";
        lvErrRes.style.display                              = "none";
        gvBookNumber                                        = data.d.code;


        //             0       1       2       3        4        5     6      7
        //gvInfoPSel = SrvId«;»PrdId«;»AvaId«;»CPrdId«;»DPrdId«;»Day«;»prod«;»hora;
        var lvArrIP = gvInfoPSel.split("«;»");
        document.getElementById("divPrdDR").innerHTML = lvArrIP[6];
        document.getElementById("divDatDR").innerHTML = getFullDateText(lvArrIP[5]) + " das " + lvArrIP[7];
        document.getElementById("divTarDR").innerHTML = gvInfoTSel.replace(/«;»/g, "<br/>");
        document.getElementById("spValVDR").innerHTML = gvTotalReserva.toFixed(2);
    }

    setStepState("C");
}

function setModoPag(pBtnModPag){
    if (gvBtnModPagS != null) { $(gvBtnModPagS).removeClass("modPagSelected").addClass("modPagNotSelected"); }
    $(pBtnModPag).removeClass("modPagNotSelected").addClass("modPagSelected");
    gvBtnModPagS = null; gvBtnModPagS = pBtnModPag;
    gvIdModPagS  = pBtnModPag.getAttribute("value")*1;
}

//confirm reservation
function step7() {
    var lvNC     = document.getElementById('firstName').value.trim();
    var lvAC     = document.getElementById('lastName').value.trim();
    var lvNumC   = document.getElementById('contribuinte').value.trim();
    var lvNCF    = (lvNC + " " + lvAC).trim();
    if (lvNCF=="")  lvNCF = "Cliente Final";
    if (lvNumC=="") lvNCF = "999999999";

    var lvClient = lvNC;
    lvClient    += "$" + lvAC;
    lvClient += "$" + document.getElementById('phone').value;
    lvClient += "$" + document.getElementById('email').value;
    lvClient += "$" + document.getElementById('hotel').value;
    lvClient += "$" + document.getElementById('room').value;
    lvClient += "$" + document.getElementById('nationality').value;
    lvClient    += "$" + lvNCF;
    lvClient    += "$" + lvNumC;
    lvClient    += "$" + document.getElementById('cpostal').value;
    lvClient    += "$" + document.getElementById('morada').value;

    showLoading(true, "Concluindo a Reserva");
    doCall("quickbook.asmx", "confirmReservation", "Code:" + gvBookNumber + ",Identity:'" + lvClient + "', Token:'" + gvToken + "'", step7_process);
}

function step7_process(data) {
    showLoading(false, "");
    setStepState("I");
    step8();
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

//post book services -----------------------------------------------------------
//-------------------------------------------------------------------------

//----- list checkin -----------------------------------------------------------
function step8() {
    showLoading(true, "Listando bilhetes reserva");
    //             0       1       2       3        4        5     6      7
    //gvInfoPSel = SrvId«;»PrdId«;»AvaId«;»CPrdId«;»DPrdId«;»Day«;»prod«;»hora;
    var lvPrdInf = gvInfoPSel.split("«;»");
    doCall("checkin.asmx", "ListTickets", "pServiceCode:'" + lvPrdInf[0] + "', pConsumptionDate:'" + lvPrdInf[5] + "', pBookingCode:'" + gvBookNumber + "', pTicketNumber:'', pClienteName:'', pIsoLingua:'" + gvIsoLingua + "', Token:'" + gvToken + "'", step8_process);
}

function step8_process(pData) {
    /*
        pData.d = {
                     arrTickets:[{code, bookingCode, number, product, serviceCode, service, cliente, consumptionDate, startTime, endTime, state},
                     success,        
                     errorMessage   
                     errorStakeTrace
                  }
    */
    var lvTL = document.getElementById("tblBookingTicketList");
    while (lvTL.rows.length>1) lvTL.deleteRow(1);

    if (!pData.d.success){
        var lvR          = lvTL.insertRow();
        lvR.className    = "lineErr";
        var lvErrC       = lvR.insertCell();
        lvErrC.colSpan   = 4;
        lvErrC.innerHTML = "Não foi possivel listar os bilhetes da reserva";
    }else{
        var lvCountOKforCIN = 0;
        for (var lvI=0;lvI<pData.d.arrTickets.length;lvI++){
            var lvTk         = pData.d.arrTickets[lvI];
            var lvMapTS      = {"s-5":"st_cl", "s-4":"st_cl", "s-2":"st_cl", "s-1":"st_cl", "s1":"st_pc", "s2":"st_pc", "s3":"st_em", "s4":"st_ck", "s5":"st_pc", "s6":"st_pc", "s7":"st_cl", "s8":"st_pc"};
            var lvSKey       = "s" + lvTk.state;
            if (lvMapTS[lvSKey]==null) lvMapTS[lvSKey] = "st_cl"; 
            var lvState      = lvMapTS[lvSKey];

            var lvR          = lvTL.insertRow();
            lvR.className    = "line" + (lvI % 2 == 0 ? "1" : "0");

            //checkbox
            if (lvTk.state == 3) lvCountOKforCIN++;
            var lvIsOKForCIN = (lvTk.state == 3 ? " checked='true'" : " disabled style='visibility:hidden'");
            var lvCkC        = lvR.insertCell();
            lvCkC.innerHTML  = "<input type='checkbox' id='chkBilhete_" + lvTk.number.trim() + "' name='chkBilhete' class='checkboxList' value='" + lvTk.number + "' idR='" + lvTk.bookingCode + "' idS='" + lvTk.serviceCode + "' dia='" + lvTk.consumptionDate + "' hora='" + lvTk.startTime + "'" + lvIsOKForCIN + ">";
            //ticket number
            var lvTkC        = lvR.insertCell();
            lvTkC.innerHTML  = "<span class='blh'>" + (lvState=="st_pc" ? "--" : lvTk.number) + "</span><br/>"; 
            lvTkC.innerHTML += "<span class='dt'>(" + getShortDateText(lvTk.consumptionDate) + " às " + lvTk.startTime + ")</span><br/>";//(2 Fev às 11:00)
            //product
            var lvPrC        = lvR.insertCell();
            lvPrC.innerHTML  = "<span class='prd'>" + lvTk.product + "</span><br/>";
            //ticket state
            var lvStC        = lvR.insertCell();
            lvStC.innerHTML  = "<span id='spStatus_" + lvTk.number.trim() + "' class='" + lvMapTS["s" + lvTk.state] + "'>&nbsp;</span><br/>";
        }
    }
    var lvCkAll = document.getElementsByName("chkBilhetes")[0];
    if (lvCountOKforCIN==0){
        lvCkAll.disabled = true;
        //lvCkAll.style.visibility = "hidden";
    }else{
        lvCkAll.checked = true;
    }
    showLoading(false, "");
}

function checkAllCIN(pCk){
    var lvArrCkB = document.getElementsByName("chkBilhete");
    for (lvI = 0; lvI < lvArrCkB.length; lvI++) {
        var lvCK = lvArrCkB[lvI];
        if (!lvCK.disabled) lvCK.checked = pCk.checked;
    }

}

//----- checkin -----------------------------------------------------------
function step9() {
    var lvArrCkB   = document.getElementsByName("chkBilhete");
    var lvStrNumB  = "";
    var lvMapB     = new Array(); //lvMapB[IdS_Data_Hora] = "NumB1,NumB2,...."  por causa da reserva de pacotes
    var lvArrKeyMB = new Array();
    
    for (lvI = 0; lvI < lvArrCkB.length; lvI++) {
        var lvCK = lvArrCkB[lvI];
        if (lvCK.checked){
            var lvKey = lvCK.getAttribute("idS") + "$" + lvCK.getAttribute("dia") + "$"+ lvCK.getAttribute("hora");
            if (lvMapB[lvKey]==null){
                lvMapB[lvKey] = lvKey + "$" + lvCK.value;
                lvArrKeyMB.push(lvKey);
            }else{
                lvMapB[lvKey] += "," + lvCK.value;
            }
        }
    }

    //ByVal pStrTicketNumbers As String, ByVal pCheckinDate As Date, ByVal pCheckinHour As String, ByVal pServiceCode As Integer
    if (lvArrKeyMB.length > 0) {
        var lvTInf = ""; 
        for (lvI = 0; lvI < lvArrKeyMB.length; lvI++) {
            if (lvTInf != "") lvTInf += "||";
            lvTInf += lvMapB[lvArrKeyMB[lvI]];
        }
        showLoading(true, "Efectuando o checkin");
        doCall("checkin.asmx", "checkinTicketsForMultipleDates", "pTicketInformation:'" + lvTInf + "', Token:'" + gvToken + "'", step9_process);
    }
}

function step9_process(pData) {
    //pData.d = {arrTicketStatus:[{ticketNumber, success, erroMessage}, success, errorMessage, errorStakeTrace}
    if (!pData.d.success){
        alert("Não foi possivel efectuar com sucesso o checkin.");
    }else{
        for (var lvI=0;lvI<pData.d.arrTicketStatus.length;lvI++){
            var lvTkS = pData.d.arrTicketStatus[lvI];
            if (lvTkS.success){
                var lvCk = document.getElementById("chkBilhete_" + lvTkS.ticketNumber.trim());
                var lvSt = document.getElementById("spStatus_" + lvTkS.ticketNumber.trim());
                if (lvCk != null){
                    lvCk.checked          = false;
                    lvCk.disabled         = true;
                    lvCk.style.visibility = "hidden";
                }
                if (lvSt != null) lvSt.className = "st_ck";
            }
        }
    }
    showLoading(false, "");
}

function printTicketSlip() {
    var lvIFP = document.getElementById("ifPrintTicketSlip");
    if (gvTkSlipPrintOK){
        lvIFP.contentWindow.doPrint();
    }else{
        showLoading(true, "Preparando a impressão");
        lvIFP.src = "../desktopcontexts/reservas/edit/printqo/default.aspx?template=1&print=1&idreserva=" + gvBookNumber;
    }
}

function printTicketA4() {
    var lvIFP = document.getElementById("ifPrintTicketSlip");
    if (gvA4TkPrintOK){
        lvIFP.contentWindow.doPrint();
    }else{
        showLoading(true, "Preparando a impressão");
        lvIFP.src = "../desktopcontexts/reservas/edit/printqo/default.aspx?template=3&print=1&idreserva=" + gvBookNumber;
    }
}

function printResumeA4(){
    var lvIFP = document.getElementById("ifPrintTicketSlip");
    if (gvA4RsPrintOK){
        lvIFP.contentWindow.doPrint();
    }else{
        showLoading(true, "Preparando a impressão");
        lvIFP.src = "../desktopcontexts/reservas/edit/printResumo/printversion.aspx?Origem=DetalhesReserva&IsForClienteFinal=1&print=1&IdReserva=" + gvBookNumber;
    }
}

function notifyPrintLoaded(gvTemplateInUse){
    showLoading(false, "");
    if (gvTemplateInUse==1){
        gvTkSlipPrintOK = true; 
    }else if (gvTemplateInUse==3){
        gvA4TkPrintOK   = true; 
    }else{
        gvA4RsPrintOK   = true; 
    }
}

function getFullDateText(pStrDate){
    var lvArrD  = pStrDate.trim().split(" ")[0].trim().replace(/\//g, "-").split("-");
    var lvData  = new Date(lvArrD[0]*1, lvArrD[1]*1-1, lvArrD[2]*1);
	var lvDayW  = gvWeekDays.getText(lvData.getDay(), 3);
	var lvMonth = gvMonths.getText(lvArrD[1]*1-1, 100);
	var lvText = "";
	switch (gvIsoLingua) {
		case "EN":
			var lvD = "th";
			if (lvArrD[2]*1 == 1) {
				lvD = "st";
			} else if (lvArrD[2]*1 == 2) {
				lvD = "nd";
			} else if (lvArrD[2]*1 == 3) {
				lvD = "rd";
			}
			lvText = lvDayW + ", " + lvMonth + " " + lvArrD[2]*1 + lvD + ", " + lvArrD[0]*1;
		break;case "PT":
			lvText = lvDayW + ", " + lvArrD[2]*1 + " de " + lvMonth + " de " + lvArrD[0]*1;
	}
	return lvText;
}



function getShortDateText(pStrDate){
    var lvArrD  = pStrDate.trim().split(" ")[0].trim().replace(/\//g, "-").split("-");
    var lvData  = new Date(lvArrD[0]*1, lvArrD[1]*1-1, lvArrD[2]*1);
	var lvDayW  = gvWeekDays.getText(lvData.getDay(), 3);
	var lvMonth = gvMonths.getText(lvArrD[1]*1-1, 3);
	var lvText = "";
	switch (gvIsoLingua) {
		case "EN":
			var lvD = "th";
			if (lvArrD[2]*1 == 1) {
				lvD = "st";
			} else if (lvArrD[2]*1 == 2) {
				lvD = "nd";
			} else if (lvArrD[2]*1 == 3) {
				lvD = "rd";
			}
			//lvText = lvDayW + ", " + lvMonth + " " + lvArrD[2]*1 + lvD;
			lvText = lvMonth + " " + lvArrD[2]*1 + lvD;
		break;case "PT":
			//lvText = lvDayW + ", " + lvArrD[2]*1 + " de " + lvMonth;
			lvText = lvArrD[2]*1 + " de " + lvMonth;
	}
	return lvText;
}

