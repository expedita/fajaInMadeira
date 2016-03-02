//<script language="javascript">
/*Ready State*/
if (!window.attachEvent) {
    window.attachEvent = function (event, pDisp) { addEventListener(event, pDisp, true); }
}

try {
	Document.prototype.readyState= "loading";
	//alert(Document.prototype.load);
	addLoadEvent(_Document_load,this);
	//addLoadEvent(alertReadyState,this);
	//Document.prototype.__load__ = Document.load;
	//Document.prototype.load = _Document_load;
} catch (ex) {

}

function alertReadyState(){
		alert(document.readyState);
}

function _Document_load() {
		//change the readyState
		document.readyState = "complete";
		
}

/*fim ready state*/

/*status*/
try {
	HTMLTableCellElement.prototype.status=0;
} catch(ex) {
}

/*fim status*/



//*************String AddOns***************
//Implementação do método String.Format(text[, arg0[, argN]])
//--retorna a substituição de {0}..{N} pelos respectivos argumentos
function string_format( text ) {
    //check: if there are not 2 or more arguments there’s nothing to replace just return the original text
    if(arguments.length <= 1){ return text; }
	//decrement to move to the second argument in the array
	var tokenCount = arguments.length - 2;
	for(var token=0;token<=tokenCount;token++){
		//iterate through the tokens and replace their placeholders from the original text in order
		text = text.replace(new RegExp("\\{"+token+"\\}", "gi"), arguments[token + 1] );
	}
    return text;
};
String.prototype.format  = string_format;
String.format			 = String.prototype.format;


//implementação do método padL
//--retorna uma string com [pLen] vezes o caracter [pChar]
function string_padLeft(pLen, pChar){
  var lvLen=pLen-this.length, lvStr=String(this);
  for (var lvI=0;lvI<lvLen;lvI++) lvStr = pChar + lvStr;
  return lvStr;
}
String.prototype.padL  = string_padLeft;
//implementação do método trimL
//--retorna uma string sem espaços no inicio
function string_LeftTrim(){
    var lvIndexNS = this.search(/\S/);
    if (lvIndexNS<0) lvIndexNS=0;
    return this.substring(lvIndexNS, this.length);
}
String.prototype.trimL = string_LeftTrim;
//implementação do mvtodo trimR
//--retorna uma string sem espaços no inicio
function string_RightTrim(){
    var lvEnd = 0;	
    for (var lvI=this.length;lvI>0;lvI--){
	    if (this.charAt(lvI-1)!=" "){lvEnd=lvI;break;} 
    }
    return (lvEnd==0 ? "" : this.substring(0, lvEnd));
}
String.prototype.trimR = string_RightTrim;
//implementação do método trim
//--retorna uma string sem espaços no inicio e fim
function string_Trim(){
	return (this.trimL()).trimR();
}
String.prototype.trim = string_Trim;

//implementação do método validateNumber
//--retorna uma string sem espaços no inicio e fim
function string_validateNumber(){
	//return parseFloat(this); ->  funciona com 1.a3 mas não com a1.3
	var lvArr   = this.trim().split(".");
    var lvSinal = (lvArr[0].substr(0,1)=="-" ? "-" : "");
    var lvLengthDecimal = 0;
	lvArr[0] = lvArr[0].replace(/\D/g,"")*1;
	if (lvArr.length>1){
		//nao pode fazer isto, pq se for por exemplo, 1.06 vai colocar 1.6
		//lvArr[1] = lvArr[1].replace(/\D/g,"")*1;
		lvLengthDecimal = lvArr[1].length;
		lvArr[1] = lvArr[1].replace(/\D/g,"")*1;
		lvArr[1] = (lvArr[1]+"").padL(lvLengthDecimal,"0");
		return lvSinal + lvArr[0] + "." + lvArr[1];
	}else{
		return lvSinal + lvArr[0];
	}
}
String.prototype.validateNumber = string_validateNumber;
//*****************************************
//implementação do método formatNumber
//--retorna uma string formatada: x nº casa decimais, .... 
function string_formatNumber(pCasaDecimais){
	var lvVal = this.validateNumber();
	if (pCasaDecimais>0) lvVal = parseFloat(lvVal).toFixed(pCasaDecimais);
	return lvVal;
}
String.prototype.formatNumber = string_formatNumber;

    
function string_GetSiblingsControlo(pIdSibling){
    var lvArr11   = this.split("_");
    var lvArr35   = this.split("$");
    var lvS       = (lvArr11.length>lvArr35.length ? "_" : "$");
    var lvArrId   = this.split(lvS); lvArrId[lvArrId.length-1]= "";
    var lvIdGeral = lvArrId.join(lvS);
    return document.getElementById(lvIdGeral + pIdSibling);
}
String.prototype.getSibCtl = string_GetSiblingsControlo;

//*************Number AddOns***************
//implementação do método FormatNumber
//--retorna uma string formatada: x nº casa decimais, .... 
function numer_formatNumber(pCasaDecimais){
	return this.toFixed(pCasaDecimais);
}
Number.prototype.formatNumber = numer_formatNumber;

//*************Date AddOns***************
function date_JSDateDiff(pDate){
	var lvDI = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate(),0,0,0,0);
	var lvDF = new Date(this.getFullYear(),  this.getMonth(),  this.getDate(),0,0,0,0);
	return Math.round((lvDF-lvDI)/(24*60*60*1000))+1;
}
Date.prototype.dateDiff = date_JSDateDiff;
//</script>
    
function string_GetSiblingsControlo(pIdSibling){
    var lvArr11   = this.split("_");
    var lvArr35   = this.split("$");
    var lvS       = (lvArr11.length>lvArr35.length ? "_" : "$");
    var lvArrId   = this.split(lvS); lvArrId[lvArrId.length-1]= "";
    var lvIdGeral = lvArrId.join(lvS);
    return document.getElementById(lvIdGeral + pIdSibling);
}
String.prototype.getSibCtl = string_GetSiblingsControlo;


//*************Array AddOns***************
//--retorna um valor da posicao no array de dado valo, ou -1
function array_indexOf(pVal){
	for(var i=0; i<this.length ; i++){
		if(this[i] == pVal) return i;
	}
	return -1;
}
Array.prototype.indexOf = array_indexOf;

//-- 
function array_lastIndexOf(pVal){
	for(var i=this.length-1; i>-1; i--){
		if(this[i] == pVal) return i;
	}
	return -1;
}
Array.prototype.lastIndexOf = array_lastIndexOf;

//não é bem um prototype 
function gfIsIEBrowser(){
    return (window.navigator.appName.toLowerCase().indexOf("microsoft")>-1);    
}
