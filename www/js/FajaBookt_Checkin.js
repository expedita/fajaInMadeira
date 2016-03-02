var gvInDbgMode    = false;//modo debug
var maxStep = 7, gvToken = "";
var gvEntity       = "fpadres";
var gvUser         = "pfernandes";
var gvPassword     = "";
var gvIsoLingua    = "PT";
var gvIdServico    = 108;//112;  //
var gvCurStep      = "L"; //login

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
    var lvDDLD = document.getElementById("ddDays");
    var lvHj = new Date();
    var lvOt = new Date(lvHj.getFullYear(), lvHj.getMonth(), lvHj.getDate()-1);
    var lvAO = new Date(lvHj.getFullYear(), lvHj.getMonth(), lvHj.getDate()-2);
    var lvAA = new Date(lvHj.getFullYear(), lvHj.getMonth(), lvHj.getDate()-3);
    var lvZZ = new Date(lvHj.getFullYear(), lvHj.getMonth(), lvHj.getDate()-4);
    lvDDLD.options[0] = new Option("--", "1900-01-01");
    lvDDLD.options[1] = new Option(getShortDT_Date(lvHj), getDateYYYYMMDD(lvHj));
    lvDDLD.options[2] = new Option(getShortDT_Date(lvOt), getDateYYYYMMDD(lvOt));
    lvDDLD.options[3] = new Option(getShortDT_Date(lvAO), getDateYYYYMMDD(lvAO));
    lvDDLD.options[4] = new Option(getShortDT_Date(lvAA), getDateYYYYMMDD(lvAA));
    lvDDLD.options[5] = new Option(getShortDT_Date(lvZZ), getDateYYYYMMDD(lvZZ));
    ddDays.value = lvDDLD.options[1].value;
}

function showLoading(pShow, pTexto) {
    if (pShow){
        var lvImg = "<br/><img src='./img/preload.gif' border='0' style='margin-top:4px'>";
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

var gvArrCtl    = ["trAreaLogin", "trCheckinList", "trCheckinListFilter"];
var gvMapStepCs = {
    "L":["trAreaLogin"],
    "C":["trCheckinList", "trCheckinListFilter"]
}

function setStepState(pStep) {
    if (pStep == ""){pStep = gvCurStep}else{gvCurStep = pStep};
    var lvMapSowC = new Array();
    var lvArrC    = gvMapStepCs[pStep];
    for (var lvI=0;lvI < lvArrC.length;lvI++){lvMapSowC[lvArrC[lvI]] = "ok";}
    for (var lvI=0;lvI < gvArrCtl.length;lvI++){
        document.getElementById(gvArrCtl[lvI]).style.display = (lvMapSowC[gvArrCtl[lvI]] == "ok" ? "" : "none");
    }
}

//login to user in entity demo -----------------------------------------------
function step1() {
    showLoading(true, "Confirmando o login");
    doCall('authentication.asmx', 'login', 'Entity:\'' + gvEntity + '\', User:\'' + gvUser + '\', Password:\'' + gvPassword + '\'', step1_process);
}

function step1_process(data) {
    showLoading(false, "");
    if (isValidMD5(data.d)) {
        setStepState("C");
    }else{
        alert(data.d);
    }
}

//post book services -----------------------------------------------------------
//-------------------------------------------------------------------------

//----- list checkin -----------------------------------------------------------
function step8() {
    var lvDt = document.getElementById("ddDays").value; //"1900-01-01"
    var lvBC = document.getElementById("bookingCode").value.trim();
    var lvTN = document.getElementById("ticketNumber").value.trim();
    var lvCN = document.getElementById("clienteName").value.trim();
    if (lvDt == "1900-01-01" && lvBC == "" && lvTN == ""){
        alert("É necessário indicar pelo menos um dos seguintes filtros: \n - 'Dia',  \n - 'Nº da Reserva', \n - 'Nº do Bilhete'.");
        return false;
    }

    showLoading(true, "Listando bilhetes reserva");
    doCall("checkin.asmx", "ListTickets", "pServiceCode:'" + gvIdServico + "', pConsumptionDate:'" + lvDt + "', pBookingCode:'" + lvBC + "', pTicketNumber:'" + lvTN + "', pClienteName:'" + lvCN + "', pIsoLingua:'" + gvIsoLingua + "', Token:'" + gvToken + "'", step8_process);
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
            lvTkC.innerHTML += "<span class='dt'>(" + getShortDateText(lvTk.consumptionDate, 2) + (lvTk.startTime.trim()=="00:00" ? "" : " " + lvTk.startTime) + ")</span><br/>";//(2 Fev às 11:00)
            //product
            var lvPrC        = lvR.insertCell();
            lvPrC.innerHTML  = "<span class='prd'>" + lvTk.product + (lvTk.cliente.replace(/anónimo/gi,"z").trim() == "" ? "" : "</br>(" + lvTk.cliente + ")") + "</span><br/>";
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

function getDateYYYYMMDD(pDate){
    var lvD = pDate.getDate(); 
    var lvM = pDate.getMonth() + 1;
    if (lvD < 10) lvD = "0" + lvD; 
    if (lvM < 10) lvM = "0" + lvM; 
    return pDate.getFullYear() + "-" + lvM + "-" + lvD; 
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



function getShortDateText(pStrDate, pLevel){
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
            if (pLevel==1){
	    		lvText = lvArrD[2]*1 + " de " + lvMonth;
            }else{
    			lvText = lvArrD[2]*1 + " " + lvMonth;
            }
	}
	return lvText;
}

function getShortDT_Date(pDate){
    var lvStrD = getDateYYYYMMDD(pDate);
    return getShortDateText(lvStrD, 2);
}
