var elasticsearch = require('elasticsearch');
var fs = require('fs')
var rangeCheck = require('range_check')

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

var analyzedMinuteFolder = './analyzedMinute/'
var analyzedHourFolder = "./analyzedHour/"
var buf = ''

function monitorLogfolder(){
	var fileList = fs.readdirSync(analyzedMinuteFolder)
	analyzeList(fileList)
}

function analyzeList(fileList){
	var processedLog = []
	for(i = 0 ; i < fileList.length ; i++){
		//console.log("filename: "+fileList[i])

		var currentDate = new Date()

		var dates = parseInt(fileList[i].substr(0,2))
	    var months = parseInt(fileList[i].substr(3,2))-1
	    var years = parseInt(fileList[i].substr(6,4))
	    var hours = parseInt(fileList[i].substr(11,2))
	    var minutes = parseInt(fileList[i].substr(14,2))
	    var fileDate = new Date(years,months,dates,hours,minutes,0)

	    var fileDateHours = new Date(years,months,dates,hours,0,0)
	    var fileNameHours = getFormattedTimeString(fileDateHours)
	    //console.log(fileDate.toLocaleString())
	    //console.log(fileDate.getTime())
	    //console.log(fileDateHours.toLocaleString())
	    //console.log(fileDateHours.getTime())

		if(!processedLog.includes(fileDate.getTime())){
			if((currentDate.getTime()-fileDate.getTime())>3600000){
				processedLog.push(fileDate.getTime())
	    		//processLogFile(fileList[i],fileDateHours)
	    		var minuteData = JSON.parse(fs.readFileSync(analyzedMinuteFolder+fileList[i]).toString())
	    		if (fs.existsSync(analyzedHourFolder+fileNameHours)) {
					//console.log('File exists');
					var hourData = JSON.parse(fs.readFileSync(analyzedHourFolder+fileNameHours).toString())
				}
				else{
					//todo: write starter file
					var blankData = {"timestamp_s":fileDate.getTime()/1000+'',"countDns":0,"countTimeoutDns":0,"countIpv4":0,"countIpv6":0,"countTcp":0,"countUdp":0,"countEdns":0,"countOpcode":{ "AA":0,"TC":0,"RD":0,"RA":0,"CD":0,"AD":0,"QR":0},"countNoerror":0,"countNxdomain":0,"countQtype":{ "A":0,"NS":0,"CNAME":0,"SOA":0,"WKS":0,"PTR":0,"MX":0,"SRV":0,"AAAA":0,"ANY":0},"countQclass":{ "IN":0},"countQuery":[],"countIpsource":[]}
					fs.writeFileSync(analyzedHourFolder+fileNameHours, JSON.stringify(blankData))
					var hourData = JSON.parse(fs.readFileSync(analyzedHourFolder+fileNameHours).toString())
				}
	    	}
	    }

	    //console.log(minuteData)
	    //console.log(hourData)
	    var result = sumanalyzedData(hourData,minuteData)
	    //console.log(result)
	    writeToFile(analyzedHourFolder+fileNameHours,result)
	    
	    sendToElastic('dnsanalyzer','analyzedhour',result)
	}
}

function sumanalyzedData(hourData,minuteData){
	var res = hourData
	res.countDns += minuteData.countDns
	res.countTimeoutDns += minuteData.countTimeoutDns
	res.countIpv4 += minuteData.countIpv4
	res.countIpv6 += minuteData.countIpv6
	res.countTcp += minuteData.countTcp
	res.countUdp += minuteData.countUdp
	res.countEdns += minuteData.countEdns

	res.countOpcode.AA += minuteData.countOpcode.AA
	res.countOpcode.TC += minuteData.countOpcode.TC
	res.countOpcode.RD += minuteData.countOpcode.RD
	res.countOpcode.RA += minuteData.countOpcode.RA
	res.countOpcode.CD += minuteData.countOpcode.CD
	res.countOpcode.AD += minuteData.countOpcode.AD
	res.countOpcode.QR += minuteData.countOpcode.QR

	res.countNoerror += minuteData.countNoerror
	res.countNxdomain += minuteData.countNxdomain

	res.countQtype.A += minuteData.countQtype.A
	res.countQtype.NS += minuteData.countQtype.NS
	res.countQtype.CNAME += minuteData.countQtype.CNAME
	res.countQtype.SOA += minuteData.countQtype.SOA
	res.countQtype.WKS += minuteData.countQtype.WKS
	res.countQtype.PTR += minuteData.countQtype.PTR
	res.countQtype.MX += minuteData.countQtype.MX
	res.countQtype.SRV += minuteData.countQtype.SRV
	res.countQtype.AAAA += minuteData.countQtype.AAAA
	res.countQtype.ANY += minuteData.countQtype.ANY

	res.countQclass.IN += minuteData.countQclass.IN

	res.countQuery = mergeJsonArray(res.countQuery,minuteData.countQuery)
	res.countIpsource = mergeJsonArray(res.countIpsource,minuteData.countIpsource)

	return res
}

function mergeJsonArray(a1,a2){
	var res = a1
	var nameExist = false

	for (var i = 0; i < a2.length; i++){
		nameExist = false
		for(var j = 0;j < res.length; j++){
			if (res[j].hostname == a2[i].hostname){
				nameExist = true
				res[j].count += a2[i].count;
			}
		}
		if(!nameExist){
			res.push(a2[i])
		}
	}
	return res
}

function sendToElastic(indexIn,typeIn,obj){
	var param = { index: indexIn, type: typeIn, body : JSON.stringify(obj)};
    client.index(param,  function (error, response) {console.log(error)});
}

function writeToFile(filename,obj){
	fs.writeFileSync(filename, JSON.stringify(obj))
}

function sendToElastic(indexIn,typeIn,obj){
	var param = { index: indexIn, type: typeIn, body : JSON.stringify(obj)};
    client.index(param,  function (error, response) {console.log(error)});
}

function processLogFile(logName,fileDateHours){
	//console.log(logName)
	//console.log(fileDateHours)

	
/*	buf = ''
	var stream = fs.createReadStream(analyzedMinuteFolder+logName, {flags: 'r', encoding: 'utf-8'})
	var minuteData
	readData(stream,function(result){
		minuteData = result
		console.log(result)
	})*/
	
	//var obj1 = JSON.parse(fs.readFileSync('../minuteFile/01-03-2017+16:36:00.json').toString())

}

/*function readData(stream,callback){
	stream.on('data', function(d) {
	    buf += d.toString() // when data is read, stash it in a string buffer
	    var pos
	    while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
	        if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
	            buf = buf.slice(1) // discard it
	            continue // so that the next iteration will start with data
	        }
	        var res = JSON.parse(buf.slice(0,pos)) // hand off the line
	        buf = buf.slice(pos+1) // and slice the processed data off the buffer
	    }
	    callback(res)
	})
}*/


/*function processLine(line) { // here's where we do something with a line
	console.log(JSON.parse(line))
}*/


function getFormattedTimeString(date){
    var dates = "0" +date.getDate()
    var months = "0" + (date.getMonth() + 1)
    var years = date.getFullYear()
    var hours = date.getHours()
    var minutes = "0" + date.getMinutes()

    var res = dates.substr(-2) + '-' + months.substr(-2) + '-' + years + '+' + hours + ':' + minutes.substr(-2) + ':00.json'

    return res
}

//monitorLogfolder()
setInterval(monitorLogfolder, 5*1000)