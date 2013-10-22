var TAG_HEADER = '@Header';
var TAG_HEADER2 = '@Header 1';
var TAG_HEADER3 = '@Header 2';
var TAG_HEADER4 = '@Header 3';
var TAG_HEADER5 = '@Header 4';
var TAG_BODY = '@Body';
var TAG_NOTE = '@Note';
var TAG_INDENT = "@Body Indent";
var TAG_CHART = "@Body CHART";
var TAG_TOC = '@TOC';
var TAG_TOC2 = '@TOC 1';
var TAG_TOC3 = '@TOC 2';
var TAG_TOC4 = '@TOC 3';
var TAG_TOC5 = '@TOC 4';
var TAG_EMERGENCIES = 'EMERGENCIES';
var BULLET = '\u2022';
var LINE_SEPARATOR = '\r';
var LINE_SEPARATOR2 = '\n';
var TAG_EXCLUDE = 'EXCLUDE FROM TOC';

/** String Extensions **/
if (typeof String.prototype.startsWith != 'function') 
{
	String.prototype.startsWith = function (str)
	{
		return this.slice(0, str.length) == str;
	};
}

if (typeof String.prototype.contains != 'function') 
{
	String.prototype.contains = function (str)
	{
		return this.indexOf(str) != -1;
	};
}

if (typeof String.prototype.endsWith != 'function') 
{
	String.prototype.endsWith = function(suffix) 
	{
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

if (typeof String.prototype.capitalize != 'function') {
	String.prototype.capitalize = function() {
    	return this.charAt(0).toUpperCase() + this.slice(1);
	}
}

/** Objects / Helper Function **/
function Qref()
{
	//Overall Sections - Deprecated
	this.Sections = new Array();
	//Category Nodes
	this.preflight = [];
	this.takeoff = [];
	this.landing = [];
	this.emergencies = [];
	this.emergencies.push(new Section("Emergencies", "", "", [], ""));
}

function Section(name)
{
	this.Name = name;
	this.Items = new Array();
}

function Item(index,check,response)
{
	this.Index = index;
	this.Check = check;
	this.Response = response;
}

function TOC(header)
{
	this.Items = new Array();
	this.Header = header;
}

function TOCItem(index,text)
{
	this.Index = index;
	this.Text = text;
}

function Table()
{
	this.Rows = new Array();
}

function Row()
{
	this.Columns = new Array();
}

function Column(name,value)
{
	this.Name = name;
	this.Value = value;
}

function isPopulated(o)
{
	if( o != "")
	return true;
	else
	return false;
}

function ChecklistDev()
{
	//DEBUG ENVIRONMENT
	this.raw = "";
	this.cleaned = "";
	
	this.manufacturer = "";
	this.model= "";
	this.serialNumber="000-00-001";
	this.tailNumber="0001";
	this.version = 1;
	this.productIcon = "";
	this.coverImage = "";
	
	this.preflight = new Array();
	
	this.takeoff = new Array();
	
	this.landing = new Array();
	
	this.emergencies = new Array();
}

function ChecklistSection()
{
	this.sectionType = 'standard';
	this.index = 0;
	this.name = "0";
	this.items = new Array();
	this.sectionIcon = "";
}

function ChecklistItem()
{
	this.icon = "";
	this.index = 0;
	this.check = "0";
	this.response = "0";
}

function Tag(name, type) {
	this.name = name;
	this.type = type;
}


/** Parser **/

function QuarkParser(contents) {
	this.fileContents = contents;
	
	this.lines = [];
	this.position = 0;
	
	this.parsed = new Qref();
	
	this.getLines = function() {
		this.lines = this.fileContents.split(LINE_SEPARATOR);
	};
	
	//Clean up any lines with tabs at the very beginning!
	//If there is a tab, then it means its a line that is part of the previous line!
	this.clean = function() {
		var firstPass = [];
		var secondPass = [];
		var previousLinePosition = 0;
		
		this.getLines();
		
		//First Pass Remove Tabs and Join Lines
		for(var i = 0; i < this.lines.length; i++) {
			var line = this.lines[i];
			
			if(!line.startsWith('\t') && line != '') {
				firstPass.push(line);
				previousLinePosition = firstPass.length - 1;
			}
			else if(line.startsWith('\t') && line != '') {
				line = skipTabsAtStart(line);
				firstPass[previousLinePosition] = firstPass[previousLinePosition] + ' ' + line;
			}
		}	
		
		//Second Pass Correct Malformed Lines and Strip Tags
		for(var i = 0; i < firstPass.length; i++) {
			var line = firstPass[i];
			
			line = correctMalformedLine(line);
			
			if(line.indexOf('\n') > -1) {
				lines = line.split('\n');
				
				for(var e = 0; e < lines.length; e++) {
					var nLine = lines[e];
					
					nLine = correctMalformedLine(nLine);
					nLine = stripTags(nLine);
					
					if(nLine != '') {
						secondPass.push(nLine);
					}
				}
				
				continue;
			}
			
			line = stripTags(line);
			
			if(line != '') {
				secondPass.push(line);
			}
		}
		
		this.lines = secondPass;
	};
	
	function skipTabsAtStart(line) {
		var characters = line.split('');
		var index = 0;
		
		for(var i = 0; i < characters.length; i++) {
			var character = characters[i];
			if(character != '\t') { 
				index = i;
				break;
			}
		}
		
		return line.substring(i, line.length);
	}
	
	this.parse = function() {
		var currentSectionHeader = "";
		var parentHeader = "";
		var parentTag = undefined;
		var section = undefined;
		var item = undefined;
		
		var inBody = false;
		var inIndent = false;
		
		var inChart = true;
		var inToc = true;
		
		var category = 0;
		var indentLineCount = 0;
		
		this.parsed = new Qref();
		
		this.clean();
		
		this.position = 0;
		
		while(this.position < this.lines.length) {
			this.skipNewLines();
			
			if(this.position >= this.lines.length) break;
			
			var line = this.lines[this.position];
			var tag = getLineTag(line);
			
			if(line.toLowerCase().contains('engine failure after takeoff')) {
				console.log("Found cruise");
			}
			
			if(tag != undefined) {
				if(tag.type == 0 && tag.name.contains(TAG_HEADER)) {
					//Preventative measure!
					//Keeps the header from duplicating into the actual list items
					inToc = false;
					inChart = false;
					inIndent = false;
					inBody = true;
					
					var newSection = this.parseHeader(parentHeader).trim();
					
					var tempLine = this.lines[this.position];
					var tempTag = getLineTag(tempLine);
					
					if(tempTag && tempTag.name.contains(TAG_HEADER))
						tag = tempTag;
					
					if(newSection && newSection != '' && newSection != ' ') {
						newSection = newSection.capitalize();
						
						if(!tag.name.contains(TAG_HEADER3) && !tag.name.contains(TAG_HEADER4) && !tag.name.contains(TAG_HEADER5)) {
							parentHeader = newSection;
						}
						
						if(currentSectionHeader != newSection) {
							currentSectionHeader = newSection;
							
							if(section != undefined) {
								switch(category) {
									case 0:
										this.parsed.preflight.push(section);
										break;
									case 1:
										this.parsed.takeoff.push(section);
										break;
									case 2:
										this.parsed.landing.push(section);
										break;
									case 3:
										this.parsed.emergencies[0].Items.push(section);
										break;
									default:
										this.parsed.Sections.push(section);
										break;
								}
							}
							
							//Switch category based on some key headers and header tag
							if(tag.name.toLowerCase().contains("emergencies")) {
								category = 3;
							}
							else {
								if(newSection.toLowerCase().contains("takeoff") || newSection.toLowerCase().contains("runup")) {
									category = 1;
								}
								else if(newSection.toLowerCase().contains("landing") || newSection.toLowerCase().contains("descent")) {
									category = 2;
								}
							}
							
							section = new Section(newSection);
						}
					}
					this.position++;
					continue;
					//Else ignore as we already tried looping through to find its data!
				}
				else if(tag.type == 0 && tag.name.contains(TAG_BODY)) {
					inBody = true;
					
					if(tag.name.contains('Indent')) {
						inIndent = true;
					}
					else if(tag.name.contains('CHART')) {
						inBody = false;
						inChart = true;
						inToc = false;
						inIndent = false;
						
						//Start of Chart Capture!
						var data = getLineData(line).trim();
						data = data.replace(/\t/g, ' ');
						var dataItems = data.split(' ');
						
						var formattedData = '';
						for(var it = 0; it < dataItems.length; it++) {
							formattedData += '<div class="CPcell">' + dataItems[it] + '</div>'; 
						}
						
						item = new Item(section.Items.length,'<div class="CProw">' + formattedData + '</div>',"");
						section.Items.push(item);
						this.position++;
						continue;
					}
					else {
						inIndent = false;
					}
				}
				else if(tag.type == 0 && tag.name.contains(TAG_NOTE)) {
					inBody = true;
					inToc = false;
					inChart = false;
					
					inIndent = false;
				}
				else if(tag.type == 0 && tag.name.contains(TAG_TOC)) {
					inBody = false;
					inToc = true;
					inChart = false;
					
					inIndent = false;
				}
				else if(tag.type == 1) {
					inBody = false;
					
					//Preventative measure!
					inToc = true;
					inChart = true;
					inIndent = false;
				}
			}
			else {
				if(line && !inToc && !inChart) {
					var split = charactersUntilWhiteSpace(line);
					
					if(split) {
						if(/^\d+$/.test(split)) {
							inBody = true;
							inToc = false;
							inChart = false;
							inHeader = false;
						}
						else if(split.contains(BULLET)) {
							inBody = true;
							inToc = false;
							inChart = false;
							inHeader = false;
						}
					}
				}
			}
			
			if(inBody) {
				if(!inIndent) {
					if(tag != undefined) {
						var data = getLineData(line).trim();
						
						if(data) {
							item = parseLine(data, section.Items.length);
							section.Items.push(item);
						} 
					}
					else {
						item = parseLine(line, section.Items.length);
						section.Items.push(item);
					}
				}
				else {
					if(tag != undefined) {
						var data = getLineData(line).trim();
					
						if(data) {
							var itm = parseLine(data, section.Items.length);
							itm.Check = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + itm.Check;
							itm.Response = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + itm.Response;
							section.Items.push(itm);
						}	
					}
					else {
						var itm = parseLine(line, section.Items.length);
						itm.Check = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + itm.Check;
						itm.Response = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + itm.Response;
						section.Items.push(itm);
					}
				}
			}
			else if(!inBody && tag == undefined && !inToc && !inChart) {
				if(!inIndent) {
					var data = getLineData(line).trim();
					
					if(data) {
						item = parseLine(data, section.Items.length);
						section.Items.push(item);
					} 
				}
				else {
					var data = getLineData(line).trim();
					
					if(data) {
						var itm = parseLine(data, section.Items.length);
						itm.Check = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + itm.Check;
						itm.Response = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + itm.Response;
						section.Items.push(itm);
					}
				}
			}
			else if(!inBody && tag == undefined && inChart && !inToc) {
				var data = line;
				data = data.replace(/\t/g, ' ');
				var dataItems = data.split(' ');
						
				var formattedData = '';
				for(var it = 0; it < dataItems.length; it++) {
					formattedData += '<div class="CPcell">' + dataItems[it] + '</div>'; 
				}
				
				if(data == '') {
					item.Check += '<div class="CPspacer"></div>';
				}
				else {
					item.Check += '<div class="CProw">' + formattedData + '</div>';
				}
			}
			
			this.position++;
		}
		
		this.parsed.emergencies[0].Items.push(section);
	};
	
	this.getJson = function() {
		var chkList = new ChecklistDev();
		
		//DEBUG ENVIRONMENT
		chkList.raw = this.fileContents.split('\r').join('<br>');
		chkList.clean = this.lines.join('<br>');
		
		for(var i = 0; i < this.parsed.preflight.length; i++)
		{
			var section = new ChecklistSection();
			section.sectionType="standard";
			section.index = i;
			section.name = this.parsed.preflight[i].Name;
			
			for(var j = 0; j < this.parsed.preflight[i].Items.length; j++)
			{
				var Qitem = this.parsed.preflight[i].Items[j];
			
				var item = new ChecklistItem();
				item.icon = "null";
				item.index = j;
				item.check = Qitem.Check;
				
				if(item.check == "")
					item.check = ""
				
				item.response = Qitem.Response;
				
				if(item.response == "")
					item.response = "";
				
				if(item.check.toLowerCase() == 'continued' && item.response == '')
					continue;
				
				if(item.check != "" && item.response != "")
					section.items.push(item);
				else if(item.check != "" && item.response == '')
					section.items.push(item);
				else if(item.check == "" && item.response != '')
					section.items.push(item);
			}
			
			chkList.preflight.push(section);
		}
		
		for(var i = 0; i < this.parsed.takeoff.length; i++)
		{
			var section = new ChecklistSection();
			section.sectionType="standard";
			section.index = i;
			section.name = this.parsed.takeoff[i].Name;
			
			for(var j = 0; j < this.parsed.takeoff[i].Items.length; j++)
			{
				var Qitem = this.parsed.takeoff[i].Items[j];
			
				var item = new ChecklistItem();
				item.icon = "null";
				item.index = j;
				item.check = Qitem.Check;
				
				if(item.check == "")
					item.check = ""
				
				item.response = Qitem.Response;
				
				if(item.response == "")
					item.response = "";
					
				if(item.check.toLowerCase() == 'continued' && item.response == '')
					continue;
				
				if(item.check != "" && item.response != "")
					section.items.push(item);
				else if(item.check != "" && item.response == '')
					section.items.push(item);
				else if(item.check == "" && item.response != '')
					section.items.push(item);
			}
			
			chkList.takeoff.push(section);
		}
		
		for(var i = 0; i < this.parsed.landing.length; i++)
		{
			var section = new ChecklistSection();
			section.sectionType="standard";
			section.index = i;
			section.name = this.parsed.landing[i].Name;
			
			for(var j = 0; j < this.parsed.landing[i].Items.length; j++)
			{
				var Qitem = this.parsed.landing[i].Items[j];
			
				var item = new ChecklistItem();
				item.icon = "null";
				item.index = j;
				item.check = Qitem.Check;
				
				if(item.check == "")
					item.check = ""
				
				item.response = Qitem.Response;
				
				if(item.response == "")
					item.response = "";
				
				if(item.check.toLowerCase() == 'continued' && item.response == '')
					continue;
				
				if(item.check != "" && item.response != "")
					section.items.push(item);
				else if(item.check != "" && item.response == '')
					section.items.push(item);
				else if(item.check == "" && item.response != '')
					section.items.push(item);
			}
			
			chkList.landing.push(section);
		}
		
		var section = new ChecklistSection();
		section.sectionType="standard";
		section.index = 0;
		section.name = this.parsed.emergencies[0].Name;
		
		for(var j = 0; j < this.parsed.emergencies[0].Items.length; j++)
		{
			var sectionItem = this.parsed.emergencies[0].Items[j];
			var subSection = new ChecklistSection();
			subSection.sectionType = "standard";
			subSection.index = j;
			subSection.name = sectionItem.Name;
		
			for(var e = 0; e < sectionItem.Items.length; e++) {
				var Qitem = sectionItem.Items[e];
			
				var item = new ChecklistItem();
				item.icon = "null";
				item.index = e;
				item.check = Qitem.Check;
				
				if(item.check == "")
					item.check = ""
				
				item.response = Qitem.Response;
				
				if(item.response == "")
					item.response = "";
				
				if(item.check.toLowerCase() == 'continued' && item.response == '')
					continue;
				
				if(item.check != "" && item.response != "")
					subSection.items.push(item);
				else if(item.check != "" && item.response == '')
					subSection.items.push(item);
				else if(item.check == "" && item.response != '')
					subSection.items.push(item);
			}
			
			section.items.push(subSection);
		}
		
		chkList.emergencies.push(section);
		
		return chkList;
	};
	
	function charactersUntilWhiteSpace(line) {
		var characters = line.split('');
		var temp = '';
		
		for(var i = 0; i < characters.length; i++) {
			var character = characters[i];
			if(/\s+/.test(character))
				break;
			
			temp += character;
		}
		
		return temp;
	}
	
	this.skipNewLines = function() {
		var line = this.lines[this.position];
		
		if(this.position < this.lines.length) {
			while(line.startsWith(LINE_SEPARATOR2) || line == '') {
				this.position++;
				line = this.lines[this.position];
				
				if(this.position >= this.lines.length)
					break;
			}
		}
	};
	
	function parseLine(line, index) {
		var item = new Item(index,"","");
		
		line = skipTabsAtStart(line);
		
		if(line.contains(BULLET + '\t')) {
			line = line.replace(BULLET + '\t', '');
		}
	
	
		var splitted = splitAtTabs(line);
		var actual = [];
		
		for(var i = 0; i < splitted.length; i++) {
			if(splitted[i])
				actual.push(splitted[i].trim());
		}
		
		if(actual.length > 2) {
			for(var i = 0; i < actual.length; i++) {
				//Check to see if the number is not separated by a tab!!!
				
				if(actual[i] != undefined) {
					switch(i) {
						case 0:
							item.Index = parseInt(actual[i]);
							break;
						case 1:
							item.Check = actual[i];
							break;
						case 2:
							item.Response = actual[i];
							break;
						default:
							item.Response += ' ' + actual[i];
							break;
					}
				}
			} 
		}
		else {
			for(var i = 0; i < actual.length; i++) {
				//If it is a number then it is an index
				if(/^\d+$/.test(actual[i])) {
					item.Index = parseInt(actual[i]);
					
					//Go ahead and remove it!
					actual.splice(0,1);
				}
				
				if(actual[i] != undefined) {	
					switch(i) {
						case 0:
							item.Check = actual[i];
							break;
						case 1:
							item.Response = actual[i];
							break;
					}
				}
			}
		}
		
		return item;
	}
	
	function getLineTag(line) {
		if(line.startsWith('@')) {
		
			if(line.indexOf(':') > -1) {
				var tag = line.substring(0, line.indexOf(':'));
			
				return new Tag(tag, 0);
			}
			else if(line.indexOf('=') > -1) {
				var tag = line.substring(0, line.indexOf('='));
			
				return new Tag(tag, 1);
			}
			else {
				return undefined;
			}
		}
	}
	
	function getLineData(line) {
		var data = '';
		var characters = line.split('');
		var inData = false;
		
		for(var i = 0; i < characters.length; i++) {
			var character = characters[i];
			
			if(character == ':' && !inData) {
				inData = true;
			}
			else if(inData) {
				data += character;
			}
		}
		
		return data.trim();
	}
	
	//Helper function to try all possible header variations and get index of in line
	function indexOfHeaderTag(line) {
		var actualIndex = line.indexOf(TAG_HEADER5 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
		
		actualIndex = line.indexOf(TAG_HEADER4 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER3 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER2 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER5 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER4 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER3 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER2 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_HEADER + ':');
		
		return actualIndex;
	}
	
	//Alternate Helper function to try all possible header variations and get index of in line
	function indexOfAlternateHeaderTag(line) {
		var actualIndex = line.indexOf('<' + TAG_HEADER5 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
		
		actualIndex = line.indexOf('<' + TAG_HEADER4 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER3 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER2 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER5 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER4 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER3 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER2 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_HEADER + '>');
		
		if(actualIndex > -1)
			return actualIndex;
		
		actualIndex = line.indexOf('<x' + TAG_HEADER5 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
		
		actualIndex = line.indexOf('<x' + TAG_HEADER4 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER3 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER2 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER5 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER4 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER3 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER2 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_HEADER + '>');
		
		return actualIndex;
	}
	
	//Alternate Toc Tag Helper
	function indexOfAlternateTocTag(line) {
		var actualIndex = line.indexOf('<' + TAG_TOC5 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC4 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC3 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC2 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;	
		
		actualIndex = line.indexOf('<' + TAG_TOC5 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC4 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC3 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC2 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<' + TAG_TOC + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC5 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC4 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC3 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC2 + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC + ' ' + TAG_EMERGENCIES + '>');
		
		if(actualIndex > -1)
			return actualIndex;	
		
		actualIndex = line.indexOf('<x' + TAG_TOC5 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC4 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC3 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC2 + '>');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf('<x' + TAG_TOC + '>');
		
		return actualIndex;
	}
	
	//Helper function to try all possible variations of TOC header and get index of
	function indexOfTocTag(line) {
		var actualIndex = line.indexOf(TAG_TOC5 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC4 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC3 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC2 + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC + ' ' + TAG_EMERGENCIES + ':');
		
		if(actualIndex > -1)
			return actualIndex;	
		
		actualIndex = line.indexOf(TAG_TOC5 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC4 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC3 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC2 + ':');
		
		if(actualIndex > -1)
			return actualIndex;
			
		actualIndex = line.indexOf(TAG_TOC + ':');
		
		return actualIndex;
	}
	
	function isRealTag(line) {
		if(line.startsWith(TAG_BODY))
			return true;
			
		if(line.startsWith(TAG_HEADER))
			return true;
			
		if(line.startsWith(TAG_TOC))
			return true;
			
		if(line.startsWith(TAG_NOTE))
			return true;
			
		return false;
	}
	
	function correctMalformedLine(line) {
		if(line.toLowerCase().contains("electrical")) {
			console.log("Found flap");
		}
		
		//A really bad malformed tag!
		//Even though it starts with an @ the tag between that and : is unknown and should
		//Be stripped
		if(line.startsWith("@")) {
			if(!isRealTag(line) && line.indexOf(':') > -1) {
				//Strips out everything before the first :
				line = getLineData(line);
			}
		}
		
		//This is another odd case, where in something else is combined on the same line
		//Instead of being a separate line like it should be!
		//We join the line with \n for the clean method to parse
		if(!line.startsWith("@") && line.contains(TAG_HEADER)) {
			var temp = line.substring(line.indexOf(TAG_HEADER), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_HEADER) - 1);
			
			//Safety just to make sure we have a real header and not one in brackets
			var colonIndex = temp.indexOf(':');
			
			if(colonIndex > -1) {
				
				var actualIndex = indexOfHeaderTag(line);
				
				if(actualIndex > -1) {
					temp2 = line.substring(0, actualIndex);	
					temp = line.substring(actualIndex, line.length);
				
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			} 
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(!line.startsWith("@") && line.contains(TAG_BODY + ":")) {
			var temp = line.substring(line.indexOf(TAG_BODY + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_BODY + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(!line.startsWith("@") && line.contains(TAG_INDENT + ":")) {
			var temp = line.substring(line.indexOf(TAG_INDENT + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_INDENT + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(!line.startsWith("@") && line.contains(TAG_CHART + ":")) {
			var temp = line.substring(line.indexOf(TAG_CHART + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_CHART + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(!line.startsWith("@") && line.contains(TAG_TOC)) {
			var temp = line.substring(line.indexOf(TAG_TOC), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_TOC) - 1);
			
			var colonIndex = temp.indexOf(':');
			
			if(colonIndex > -1) {
				var actualIndex = indexOfTocTag(line);
				
				if(actualIndex > -1) {
					temp = line.substring(actualIndex, line.length);
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(!line.startsWith("@") && line.contains(TAG_NOTE + ":")) {
			var temp = line.substring(line.indexOf(TAG_NOTE + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_NOTE + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		
		//Specific corrections even if the line starts right!
		//Just making sure we take every possibility into account!
		if(line.startsWith(TAG_BODY + ":") && line.contains(TAG_HEADER)) {
			var temp = line.substring(line.indexOf(TAG_HEADER), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_HEADER) - 1);
			
			//Safety just to make sure we have a real header and not one in brackets
			var colonIndex = temp.indexOf(':');
			var hLength = TAG_HEADER.length;
			
			if(colonIndex > -1) {
				
				var actualIndex = indexOfHeaderTag(line);
				
				if(actualIndex > -1) {
					temp2 = line.substring(0, actualIndex);	
					temp = line.substring(actualIndex, line.length);
				
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				//Try alternate!
				actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			} 
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(line.startsWith(TAG_BODY + ":") && line.contains(TAG_INDENT + ":")) {
			var temp = line.substring(line.indexOf(TAG_INDENT + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_INDENT + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_BODY + ":") && line.contains(TAG_CHART + ":")) {
			var temp = line.substring(line.indexOf(TAG_CHART + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_CHART + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_BODY + ":") && line.contains(TAG_TOC)) {
			var temp = line.substring(line.indexOf(TAG_TOC), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_TOC) - 1);
			
			var colonIndex = temp.indexOf(':');
			
			if(colonIndex > -1) {
				var actualIndex = indexOfTocTag(line);
				
				if(actualIndex > -1) {
					temp = line.substring(actualIndex, line.length);
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(line.startsWith(TAG_BODY + ":") && line.contains(TAG_NOTE + ":")) {
			var temp = line.substring(line.indexOf(TAG_NOTE + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_NOTE + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		//Header Specific Situations
		else if(line.startsWith(TAG_HEADER) && line.contains(TAG_BODY + ":")) {
			var temp = line.substring(line.indexOf(TAG_BODY + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_BODY + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_HEADER) && line.contains(TAG_INDENT + ":")) {
			var temp = line.substring(line.indexOf(TAG_INDENT + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_INDENT + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_HEADER) && line.contains(TAG_CHART + ":")) {
			var temp = line.substring(line.indexOf(TAG_CHART + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_CHART + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_HEADER2 + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER3 + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		
		else if(line.startsWith(TAG_HEADER4 + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER5 + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER2 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER3 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER4 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER5 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2 + ' ' + TAG_EMERGENCIES)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER2 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER2 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER3)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER2 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER4)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER2 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER5)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER3 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER4 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER5 + ' ' + TAG_EXCLUDE + ':') && line.contains(TAG_HEADER2)) {
			var index = indexOfHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
			
			index = indexOfAlternateHeaderTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				var temp2 = line.substring(0, index - 1);
				
				return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
			}
		}
		else if(line.startsWith(TAG_HEADER) && line.contains(TAG_TOC)) {
			var temp = line.substring(line.indexOf(TAG_TOC), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_TOC) - 1);
			
			var colonIndex = temp.indexOf(':');
			
			if(colonIndex > -1) {
				var actualIndex = indexOfTocTag(line);
				
				if(actualIndex > -1) {
					temp = line.substring(actualIndex, line.length);
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(line.startsWith(TAG_HEADER) && line.contains(TAG_NOTE + ":")) {
			var temp = line.substring(line.indexOf(TAG_NOTE + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_NOTE + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		//Indent Specific Situations
		else if(line.startsWith(TAG_INDENT + ":") && line.contains(TAG_HEADER)) {
			var temp = line.substring(line.indexOf(TAG_HEADER), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_HEADER) - 1);
			
			//Safety just to make sure we have a real header and not one in brackets
			var colonIndex = temp.indexOf(':');
			var hLength = TAG_HEADER.length;
			
			if(colonIndex > -1) {
				
				var actualIndex = indexOfHeaderTag(line);
					
				if(actualIndex > -1) {
					temp2 = line.substring(0, actualIndex);	
					temp = line.substring(actualIndex, line.length);
				
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
				
			} 
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			} 
		}
		else if(line.startsWith(TAG_INDENT + ":") && line.contains(TAG_BODY + ":")) {
			var temp = line.substring(line.indexOf(TAG_BODY + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_BODY + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_INDENT + ":") && line.contains(TAG_CHART + ":")) {
			var temp = line.substring(line.indexOf(TAG_CHART + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_CHART + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_INDENT + ":") && line.contains(TAG_TOC)) {
			var temp = line.substring(line.indexOf(TAG_TOC), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_TOC) - 1);
			
			var colonIndex = temp.indexOf(':');
			
			if(colonIndex > -1) {
				var actualIndex = indexOfTocTag(line);
				
				if(actualIndex > -1) {
					temp = line.substring(actualIndex, line.length);
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(line.startsWith(TAG_INDENT + ":") && line.contains(TAG_NOTE + ":")) {
			var temp = line.substring(line.indexOf(TAG_NOTE + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_NOTE + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		//Note Specific Situations
		else if(line.startsWith(TAG_NOTE + ":") && line.contains(TAG_HEADER)) {
			var temp = line.substring(line.indexOf(TAG_HEADER), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_HEADER) - 1);
			
			//Safety just to make sure we have a real header and not one in brackets
			var colonIndex = temp.indexOf(':');
			
			if(colonIndex > -1) {
				
				var actualIndex = indexOfHeaderTag(line);
				
				if(actualIndex > -1) {
					temp2 = line.substring(0, actualIndex);	
					temp = line.substring(actualIndex, line.length);
				
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
				
			} 
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateHeaderTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(line.startsWith(TAG_NOTE + ":") && line.contains(TAG_BODY + ":")) {
			var temp = line.substring(line.indexOf(TAG_BODY + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_BODY + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_NOTE + ":") && line.contains(TAG_CHART + ":")) {
			var temp = line.substring(line.indexOf(TAG_CHART + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_CHART + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
		else if(line.startsWith(TAG_NOTE + ":") && line.contains(TAG_TOC)) {
			var temp = line.substring(line.indexOf(TAG_TOC), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_TOC) - 1);
			
			var colonIndex = temp.indexOf(':');
			
			if(colonIndex > -1) {
				var actualIndex = indexOfTocTag(line);
				
				if(actualIndex > -1) {
					temp = line.substring(actualIndex, line.length);
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
				}
				
				actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
			else {
				//Try alternate!
				var actualIndex = indexOfAlternateTocTag(line);
				
				if(actualIndex > -1) {
					var temp3 = line.substring(line.indexOf('>', actualIndex) + 1, line.length);
					temp = line.substring(actualIndex, line.indexOf('>',actualIndex));
					temp = temp.replace(/\>|\<\x|\</g, '');
					temp2 = line.substring(0, actualIndex);
					return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp + ':' + temp3);
				}
			}
		}
		else if(line.startsWith(TAG_NOTE + ":") && line.contains(TAG_INDENT + ":")) {
			var temp = line.substring(line.indexOf(TAG_INDENT + ":"), line.length);
			var temp2 = line.substring(0, line.indexOf(TAG_INDENT + ":") - 1);
			
			return correctMalformedLine(temp2) + '\n' + correctMalformedLine(temp);
		}
	
		if(line.startsWith("<@")) {
			var temp = line.substring(1, line.indexOf('>'));
			var temp2 = line.substring(line.indexOf('>') + 1, line.length);
			
			return correctMalformedLine(temp + ":" + temp2);
		}
		else if(line.startsWith("<x@")) {
			var temp = line.substring(2, line.indexOf('>'));
			var temp2 = line.substring(line.indexOf('>') + 1, line.length);
			
			return correctMalformedLine(temp + ":" + temp2);
		}
		//This is an interesting case as the next tag is technically empty
		//But the next tag can be a @Header or even a @Body or just gibberish!
		else if(line.startsWith("@:")) {
			var temp = line.substring(2, line.length);
			
			temp = stripWhiteSpaceFromStart(temp);
			
			if(temp.startsWith("<@") || temp.startsWith("<x@")) {
				return correctMalformedLine(temp);
			}
			//Gibberish!
			else if(temp.startsWith("<")) {
				temp = temp.substring(temp.indexOf('>') + 1, temp.length);
				
				temp = stripWhiteSpaceFromStart(temp);
				
				//Even though the first thing was gibberish
				//The next thing could possibly be a real tag!
				return correctMalformedLine(temp);
			}
			
			//Just incase!
			return correctMalformedLine(temp);
		}
		//It starts with html but there could possibly be a real tag hidden
		//After the first html tag and so forth
		else if(line.startsWith("<")) {
			var index = skipHtmlUntilMalformedTag(line);
			
			if(index > -1) {
				var temp = line.substring(index, line.length);
				
				return correctMalformedLine(temp);
			}
		}
		
		//If nothing triggers than were done and we can just return the line
		return line;
	}
	
	//Get index of first malformed real tag possibility
	function skipHtmlUntilMalformedTag(line) {
		var characters = line.split('');
		var inTag = 0;
		var previousCharacter 
		
		for(var i = 0; i < characters.length; i++) {
			var character = characters[i];
			
			if(character == '<') {
				inTag++;
				previousCharacter = character;
			}
			else if(character == '>') {
				inTag--;
				previousCharacter = character;
			}
			else if(inTag <= 0) {
				//We exited tags and hit the first real non html data
				//But we didn't find a real tag we were looking for!
				return -1;
			}
			else if(inTag > 0) {
				if(previousCharacter + character == '<@') {
					return i - 1;
				}
				
				var preview = characters[i + 1];
				
				if(preview) {
					if(previousCharacter + character + preview == '<x@')
						return i - 1;
				}
			}
		}
		
		return -1;
	}
	
	function stripWhiteSpaceFromStart(line) {
		//Strip whitespace at beginning of line!
		line = line.replace(/^\s+/gm, '');
		
		return line;
	}
	
	function stripTags(line) {
		var tempAppending = "";
		
		var characters = line.split('');
		
		var inTag = 0;
		
		for(var i = 0; i < characters.length; i++) {
			var character = characters[i];
			
			if(character == '<') {
				inTag++;
			}
			else if(character == '>') {
				inTag--;
			}
			else if(inTag <= 0) {
				tempAppending += character;
			}
		}
		
		return tempAppending;
	}
	
	function splitAtTabs(line) {
		return line.split('\t');
	}
	
	this.parseHeader = function(parent) {
		var line = this.lines[this.position];
		
		if(line.toLowerCase().contains('takeoff - short field')) {
			console.log('Found engine flight');
		}
		
		while(line.startsWith(LINE_SEPARATOR2) || line == '') {
			this.position++;
			line = this.lines[this.position];
		}
		
		var tag = getLineTag(line);
		
		//It's a header!
		if(tag != undefined && tag.type == 0 && tag.name.contains(TAG_HEADER)) {
			newSection = getLineData(line).trim().replace('\t', '');
			
			if((tag.name.contains(TAG_HEADER3) || tag.name.contains(TAG_HEADER4) || tag.name.contains(TAG_HEADER5)) && newSection) {
				newSection = parent + ' - ' + newSection;
			}
		}
		else if(tag != undefined && tag.type == 0 && !tag.name.contains(TAG_HEADER)) {
			//Oops we aren't in Kansas anymore!
			this.position--;
			return '';
		}
		else {
			newSection = line;
		}
		
		var preview = this.lines[this.position + 1];
		var previewTag = getLineTag(preview);
		
		if(previewTag != undefined && previewTag.type == 0 && previewTag.name.contains(TAG_HEADER) && !previewTag.name.contains(TAG_HEADER3) && !previewTag.name.contains(TAG_HEADER4) && !previewTag.name.contains(TAG_HEADER5)) {
			this.position++;
			newSection = newSection + ' ' + this.parseHeader(parent);
		}
		else if(previewTag == undefined) {
			this.position++;
			var firstTextElement = charactersUntilWhiteSpace(preview);
			
			if(/^\d+$/.test(firstTextElement)) {
				this.position--;
				return newSection;
			}
			else {
				newSection = newSection + ' ' + this.parseHeader(parent);
			}
		}
		
		if(newSection) {
			return newSection;
		}
		else {
			this.position++;
			return this.parseHeader(parent);
		}
	};
}