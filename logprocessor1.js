var fs = require('fs');

//var dnsLogPath= "/home/blackcat/Desktop/dns preprocessor/passivedns.log";
var dnsLogPath= "/var/log/passivedns.log";


var buf = '';
var lineCount = 0;

function readLog(){
	buf = '';
	var stream = fs.createReadStream(dnsLogPath, {flags: 'r', encoding: 'utf-8'});
	stream.on('readable', () => {
		//console.log(typeof(stream.read()));
	    buf += stream.read(); // when data is read, stash it in a string buffer
	    //console.log('readable:', stream.read());
	    pump(); // then process the buffer
	});
}

function pump() {
    var pos;
    var fileLineCount = 0;
    while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
        if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
            buf = buf.slice(1); // discard it
            continue; // so that the next iteration will start with data
        }
        fileLineCount += 1;
        if(fileLineCount > lineCount){
        	processLine(buf.slice(0,pos)); // hand off the line
        }
        buf = buf.slice(pos+1); // and slice the processed data off the buffer
    }
}

function processLine(line) { // here's where we do something with a line

    if (line[line.length-1] == '\r') line=line.substr(0,line.length-1); // discard CR (0x0D)
    if (line.length > 0) { // ignore empty lines
        var obj = JSON.parse(line); // parse the JSON
        writeToTimefile(obj);
        lineCount += 1; //line counter
        //console.log(lineCount);
        //console.log(obj); // do something with the data here!
    }
}

function writeToTimefile(obj){

	var date = new Date(obj.timestamp_s*1000);
    var dates = "0" +date.getDate();
    var months = "0" + (date.getMonth() + 1);
    var years = date.getFullYear();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();

	var writeLogPath = './log/'+dates.substr(-2) + '-' + months.substr(-2) + '-' + years + '+' + hours + ':' + minutes.substr(-2) + ':00.json';
	console.log(writeLogPath)
	fs.appendFile(writeLogPath, JSON.stringify(obj)+'\n', (err) => {
	  if (err) throw err;
	}); //we can have sync version if we want.
}

setInterval(readLog, 5*1000);