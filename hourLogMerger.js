var elasticsearch = require('elasticsearch');
var fs = require('fs')
var rangeCheck = require('range_check')

/*var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});*/

var minLogPath = "./minuteFile/"
var hourLogPath = "./hourFile/"
var buf = ''

function monitorLogfolder(){
	var fileList = fs.readdirSync(minLogPath)
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
	    var fileNameDateHours = getFormattedTimeString(fileDateHours)
	    //console.log(fileDate.toLocaleString())
	    //console.log(fileDate.getTime())
	    //console.log(fileDateHours.toLocaleString())
	    //console.log(fileDateHours.getTime())

	    var hourFileName = hourLogPath+fileNameDateHours
		if(!processedLog.includes(fileDate.getTime())){
			if((currentDate.getTime()-fileDate.getTime())>3600000){
				processedLog.push(fileDate.getTime())
	    		processLogFile(fileList[i],fileDateHours)
	    	}
	    }
	}
}

function processLogFile(logName,fileDateHours){
	//console.log(logName)
	//console.log(fileDateHours)

	
/*	buf = ''
	var stream = fs.createReadStream(minLogPath+logName, {flags: 'r', encoding: 'utf-8'})
	var minuteData
	readData(stream,function(result){
		minuteData = result
		console.log(result)
	})*/
	var obj1 = JSON.parse(fs.readFileSync('../minuteFile/01-03-2017+16:36:00.json').toString())
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

function writeToTimefile(obj,filename){

	var writeLogPath = './minuteFile/'+filename;
	//console.log(writeLogPath)
	fs.appendFile(writeLogPath, JSON.stringify(obj)+'\n', (err) => {
	  if (err) throw err;
	}); //we can have sync version if we want.
}

function checkStringPosition(array,hostname){
	//if not found fucntion will return -1

	//obj[i].code == needle

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
    var hours = date.getHours()
    var minutes = "0" + date.getMinutes()

    var res = dates.substr(-2) + '-' + months.substr(-2) + '-' + years + '+' + hours + ':' + minutes.substr(-2) + ':00.json'

    return res
}

monitorLogfolder()
//setInterval(monitorLogfolder, 5*1000)