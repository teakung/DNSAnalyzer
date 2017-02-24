var fs = require('fs');

var logPath = "./log/";
var buf = '';
//console.log(fileList);
function monitorLogfolder(){
	var fileList = [];
	fileList = fs.readdirSync(logPath);
	analyzeList(fileList)
}

function analyzeList(fileList){
	for(i = 0; i < fileList.length; i++){
		//console.log(fileList[i]);
		var currentDate = new Date();

		var dates = parseInt(fileList[i].substr(0,2));
	    var months = parseInt(fileList[i].substr(3,2))-1;
	    var years = parseInt(fileList[i].substr(6,4));
	    var hours = parseInt(fileList[i].substr(11,2));
	    var minutes = parseInt(fileList[i].substr(14,2));
	    var fileDate = new Date(years,months,dates,hours,minutes,0);
	    //console.log(fileDate.toLocaleString());
	    //console.log(fileDate.getTime());
	    //console.log(minutes);
	    if((currentDate.getTime()-fileDate.getTime())>60000){
	    	processLogFile(fileList[i]);
	    }
	}
}

function processLogFile(logName){
	//console.log(logName);
	buf = '';
	var stream = fs.createReadStream('./log/'+logName, {flags: 'r', encoding: 'utf-8'});
	stream.on('readable', () => {
		//console.log(typeof(stream.read()));
	    buf += stream.read(); // when data is read, stash it in a string buffer
	    //console.log('readable:', stream.read());
	    pump(logName); // then process the buffer
	});
}
function pump(logName) {
    var pos;
    var analyzeData = { "countDns":0,"countTimeoutDns":0,"countIpv4":0,"countIpv6":0,"countEdns":0,"countOpcode":{ "AA":0,"TC":0,"RD":0,"RA":0,"CD":0,"AD":0,"QR":0},"countNoerror":0,"countNxdomain":0,"countQtype":{ "A":0,"NS":0,"CNAME":0,"SOA":0,"WKS":0,"PTR":0,"MX":0,"SRV":0,"AAAA":0,"ANY":0},"countQclass":{ "IN":0},"countDomainnames":{ "Domainname":0},"countIpsource":{ "IP":0 }};
    while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
        if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
            buf = buf.slice(1); // discard it
            continue; // so that the next iteration will start with data
        }
        analyzeData =  processLine(buf.slice(0,pos),analyzeData); // hand off the line
        buf = buf.slice(pos+1); // and slice the processed data off the buffer
        
    }
 
    //console.log("done for" + logName)
}

function processLine(line,analyzeData) { // here's where we do something with a line

    if (line[line.length-1] == '\r') line=line.substr(0,line.length-1); // discard CR (0x0D)

    if (line.length > 0) { // ignore empty lines

        var obj = JSON.parse(line);
        analyzeData.countDns +=1;
        console.log(analyzeData.countDns);
        //console.log(obj); // do something with the data here!
    }
    return analyzeData;
}

function getFormattedTimeString(date){
    var dates = "0" +date.getDate();
    var months = "0" + (date.getMonth() + 1);
    var years = date.getFullYear();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();

    var res = dates.substr(-2) + '-' + months.substr(-2) + '-' + years + '+' + hours + ':' + minutes.substr(-2) + ':00.json'

    return res
}

monitorLogfolder();
//setInterval(monitorLogfolder, 1*1000);