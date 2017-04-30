var fs = require('fs')
var rangeCheck = require('range_check')
var lineByLine = require('n-readlines');

var minuteFileFolder = './dnslog/minuteFile/'
var analyzedMinuteFolder = './dnslog/analyzedMinute/'
var buf = ''

function monitorLogfolder(){
	var fileList = fs.readdirSync(minuteFileFolder)
	analyzeList(fileList)
}

function analyzeList(fileList){
	for(i = 0 ; i < fileList.length ; i++){
		//console.log(fileList[i])
		var currentDate = new Date()

		var dates = parseInt(fileList[i].substr(0,2))
	    var months = parseInt(fileList[i].substr(3,2))-1
	    var years = parseInt(fileList[i].substr(6,4))
	    var hours = parseInt(fileList[i].substr(11,2))
	    var minutes = parseInt(fileList[i].substr(14,2))
	    var fileDate = new Date(years,months,dates,hours,minutes,0)
	    //console.log(fileDate.toLocaleString())
	    //console.log(fileDate.getTime())
	    //console.log(minutes)

	    var analyzedMinuteName = analyzedMinuteFolder+fileList[i]


	    if (fs.existsSync(analyzedMinuteName)) {
    		console.log('File exists');
		}
		else{
			if((currentDate.getTime()-fileDate.getTime())>60000){
	    		processLogFile(fileList[i],fileDate)
	    		console.log(fileList[i])
	    	}
		}
	}
}

function processLogFile(logName,fileDate){
	//console.log(logName)
	var analyzeData = {"timestamp_s":fileDate.getTime()/1000+'',"countDns":0,"countTimeoutDns":0,"countIpv4":0,"countIpv6":0,"countTcp":0,"countUdp":0,"countEdns":0,"countOpcode":{ "AA":0,"TC":0,"RD":0,"RA":0,"CD":0,"AD":0,"QR":0},"countNoerror":0,"countNxdomain":0,"countQtype":{ "A":0,"NS":0,"CNAME":0,"SOA":0,"WKS":0,"PTR":0,"MX":0,"SRV":0,"AAAA":0,"ANY":0},"countQclass":{ "IN":0},"countQuery":[],"countIpsource":[]}
	
	var liner = new lineByLine(minuteFileFolder+logName);
	var line;
	var lineNumber = 0;
	while (line = liner.next()) {
    	//console.log('Line ' + lineNumber);
    	lineNumber++;
    	analyzeData = processLine(line,analyzeData)
	}
	appendToFile(analyzeData,logName);
}

function processLine(line,analyzeData) { // here's where we do something with a line

        var dnsReq = JSON.parse(line);

        //console.log(dnsReq); // do something with the data here!
        analyzeData.countDns +=1;
        //console.log(rangeCheck.ver(dnsReq.client)) 
		switch(rangeCheck.ver(dnsReq.client)) {
		    case 4:
		        analyzeData.countIpv4 += 1
		        break
		    case 6:
		        analyzeData.countIpv6 += 1
		        break
		    default:
		}
		switch(dnsReq.proto) {
		    case 'tcp':
		        analyzeData.countTcp += 1
		        break
		    case 'udp':
		        analyzeData.countUdp += 1
		        break
		    default:
		}
		switch(dnsReq.type) {
		    case 'A':
		        analyzeData.countQtype.A += 1
		        break
		    case 'NS':
		        analyzeData.countQtype.NS += 1
		        break
		    case 'CNAME':
		        analyzeData.countQtype.CNAME += 1
		        break
		    case 'SOA':
		        analyzeData.countQtype.SOA += 1
		        break
		    case 'WKS':
		        analyzeData.countQtype.WKS += 1
		        break
		    case 'PTR':
		        analyzeData.countQtype.PTR += 1
		        break
		    case 'MX':
		        analyzeData.countQtype.MX += 1
		        break
		    case 'SRV':
		        analyzeData.countQtype.SRV += 1
		        break
		    case 'AAAA':
		        analyzeData.countQtype.AAAA += 1
		        break
		    case 'ANY':
		        analyzeData.countQtype.ANY += 1
		        break
		    default:
		}
		switch(dnsReq.class) {
		    case 'IN':
		        analyzeData.countQclass.IN += 1
		        break
		    case 'udp':
		        analyzeData.countUdp += 1
		        break
		    default:
		}
		switch(dnsReq.query) {
		    default:
		    	var hostname = dnsReq.query
		    	//console.log(typeof(hostname))
		    	//console.log(analyzeData.countQuery.hasOwnProperty(hostname))

		    	var hostnamePosition = checkStringPosition(analyzeData.countQuery,hostname)
		    	if(hostnamePosition === -1){
		    		var obj = {"hostname":hostname,"count":1}
			    	analyzeData.countQuery.push(obj)
		    	}
		    	else{
		    		analyzeData.countQuery[hostnamePosition].count += 1
		    	}
		    	break
		}
		switch(dnsReq.answer) {
		    case 'NXDOMAIN':
		        analyzeData.countNxdomain += 1
		        break
		    case 'REFUSED' :
		    	
		    	break
		    default:
		    	analyzeData.countNoerror += 1
		    	break
		}
		switch(dnsReq.client) {
		    default:
		    	var hostname = dnsReq.client
		    	//console.log(typeof(hostname))
		    	//console.log(analyzeData.countQuery.hasOwnProperty(hostname))
		    	var hostnamePosition = checkStringPosition(analyzeData.countIpsource,hostname)
		    	if(hostnamePosition === -1){
		    		var obj = {"hostname":hostname,"count":1}
			    	analyzeData.countIpsource.push(obj)
		    	}
		    	else{
		    		analyzeData.countIpsource[hostnamePosition].count += 1
		    	}
		    	break
		}
    return analyzeData
}

function appendToFile(obj,filename){

	var writeLogPath = analyzedMinuteFolder+filename;
	//console.log(writeLogPath)
/*	fs.appendFile(writeLogPath, JSON.stringify(obj)+'\n', (err) => {
	  if (err) throw err;
	}); //we can have sync version if we want.*/
	fs.appendFileSync(writeLogPath,JSON.stringify(obj)+'\n')
}

function checkStringPosition(array,hostname){
	//if not found fucntion will return -1
	for (var i = 0; i < array.length; i++){
		array[i].hostname == hostname
		if (array[i].hostname == hostname){
			return i
		}
	}
	return -1
}

function getFormattedTimeString(date){
    var dates = "0" +date.getDate()
    var months = "0" + (date.getMonth() + 1)
    var years = date.getFullYear()
    var hours = "0" + date.getHours()
    var minutes = "0" + date.getMinutes()

    var res = dates.substr(-2) + '-' + months.substr(-2) + '-' + years + '+' + hours.substr(-2) + ':' + minutes.substr(-2) + ':00.json'

    return res
}

monitorLogfolder()
//setInterval(monitorLogfolder, 5*1000)