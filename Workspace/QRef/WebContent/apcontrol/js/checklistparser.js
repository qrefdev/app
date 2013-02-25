if (typeof String.prototype.trim != 'function') 
{
	String.prototype.trim = function() 
	{
		return this.replace(/^\s+|\s+$/g,"");
	}
}

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
//Get File Contents
var FileContents = "";
	
//Constants
var TAG_HEADER = "@Header 1";
var TAG_HEADER_SECONDARY = "@Header";
var TAG_BODY = "@Body";
var TAG_BODY_INDENT = "@Body Indent";
var TAG_BODY_CHART = "@Body CHART";
var TAG_NOTE = "@Note";
var TAG_XNOTE= "x@Note";
var TAG_TOC = "@TOC 1";
var TAG_TOC_SECONDARY = "@TOC";
var BULLET = '\u2022';
var TAG_EMPTY="@:";

var HTML_TAG_OPN_UL = "<ul>";
var HTML_TAG_CLS_UL = "</ul>";
var HTML_TAG_OPN_LI = "<li>";
var HTML_TAG_CLS_LI = "</li>";

var QStartTagReg = /@[A-Za-z0-9\s]+=/;
var docTags = new Array();

//Globals
var TagIndex = 0;
var TagStartPos = 0;

var category = 0;

//Nodes
var Qref_N 		= new Qref();
var Section_N 	= new Section("","","","");
var Item_N 		= new Item("","","","");
var TOC_N 		= new TOC("");
var TOCItem_N	= new TOCItem("","");
var Table_N		= new Table();
var Row_N 		= new Row();
var Column_N	= new Column("","");

function QrefDictionary()
{
	this.Tag = new Array();
	this.Value = new Array();
	
	this.Add = function(tag,value)
	{
		this.Tag.push(tag);
		this.Value.push(value);
	};
	
}
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
function Section(name,subheading,toc,items,table)
{
	this.Name = name;
	this.Subheading = subheading;
	this.Items = new Array();
	this.TOC = toc;
	this.Table = table;
	this.Id = 0;
}
function Item(index,check,response,note)
{
	this.Index = index;
	this.Check = check;
	this.Response = response;
	this.Note = note;
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
function IsPopulated(o)
{
	if( o != "")
	return true;
	else
	return false;
}
function WriteToJSON(rawdata)
{
	
	var splitLines = CreateList(rawdata);
	var Document = "";
	
	docTags = new Array();
	docTags.push(TAG_EMPTY);
	
	for(var i = 1; i < splitLines.length; i++)
	{
		var line = splitLines[i];	
		
		line = RewriteTags(line);
		
		if(line.startsWith("<" + TAG_XNOTE)) {
			
			line = line.replace(TAG_XNOTE, TAG_NOTE);
			
			var temp = line.substring(0, line.indexOf(">") + 1);
			var temp2 = line.substring(line.indexOf(">") + 1, line.length);
			
			temp = temp.replace(/\<|\>/g, '');
			
			line = temp + ' ' + temp2;
			
			line = StripTags(line);
				
			var CapturedTag = GetStartingTag(line);
				docTags.push(CapturedTag);
		}
		else if(line.startsWith("<" + TAG_HEADER)) {
			var sub = line.substring(TAG_HEADER.length + 1, TAG_HEADER.length + 2);
			
			if(sub != ">") {
				var temp = line.substring(0, line.indexOf(">") + 1);
				var temp2 = line.substring(line.indexOf(">") + 1, line.length);
				
				temp = temp.replace(/\<|\>/g, '');
				
				line = temp + ' ' + temp2;
				
				line = StripTags(line);
				
				var CapturedTag = GetStartingTag(line);
				docTags.push(CapturedTag);
			}
		}
		else if(line.startsWith("<" + TAG_HEADER_SECONDARY)) {
			var sub = line.substring(TAG_HEADER_SECONDARY.length + 1, TAG_HEADER_SECONDARY.length + 2);
			
			if(sub != ">") {
				var temp = line.substring(0, line.indexOf(">") + 1);
				var temp2 = line.substring(line.indexOf(">") + 1, line.length);
				
				temp = temp.replace(/\<|\>/g, '');
				
				line = temp + ' ' + temp2;
				
				line = StripTags(line);
				
				var CapturedTag = GetStartingTag(line);
				docTags.push(CapturedTag);
			}
		}
		else {
			line = StripTags(line);
			while(IsStartingTag(line))
			{
				var CapturedTag = GetStartingTag(line);
				
				if(CapturedTag == null || CapturedTag == "")
				{
					i++;
					line = splitLines[i];
					line = RewriteTags(line);
					continue;
				}
				
				docTags.push(CapturedTag);
				
				i++;
				
				line = splitLines[i];
				line = RewriteTags(line);
			}
		}
		
		Document = Document + line +"\r"
	}
	var qd = new QrefDictionary();
	while(ContainsAny(docTags, Document))
	{
		var linetoAdd = "";
		
		linetoAdd = GetTagAndValue(Document);
		
		var templine = docTags[TagIndex];
		var templine2 = linetoAdd.replace(templine,"");
		templine2 = templine2.trim();
		
		qd.Add(templine,templine2);
		
		if(Document.length - linetoAdd.length > 0)
			Document = Document.substring(linetoAdd.length);
		else
			break;
	}
	
	for(var i = 0; i < qd.Tag.length; i++)
	{
		var Tag = qd.Tag[i];
		var CurrentValue = qd.Value[i];
		
		if(CurrentValue == "")
			continue;
		
		if(CurrentValue.toLowerCase().contains("forced landing")) {
			console.log("found forced landing");
		}	
		
		if(Tag.contains(TAG_HEADER))
		{
			if(Section_N.Name != "")
			{
				Section_N.Id = i;
				
				switch(category) {
					case 0:
						Qref_N.preflight.push(Section_N);
						break;
					case 1:
						Qref_N.takeoff.push(Section_N);
						break;
					case 2:
						Qref_N.landing.push(Section_N);
						break;
					case 3:
						Qref_N.emergencies[0].Items.push(Section_N);
						break;
					default:
						Qref_N.Sections.push(Section_N);
						break;
				}
			}
			
			//Switch category based on some key headers and header tag
			if(Tag.toLowerCase().contains("emergencies")) {
				category = 3;
			}
			else {
				if(CurrentValue.toLowerCase().contains("takeoff")) {
					category = 1;
				}
				else if(CurrentValue.toLowerCase().contains("landing")) {
					category = 2;
				}
			}
			
			Section_N = new Section(CurrentValue,"","","","");
			continue;
		}
		if (Tag.contains(TAG_HEADER_SECONDARY))
		{				
			Section_N.Subheading = CurrentValue.replace("\r","");
			continue;
		}
		if(Tag.contains(TAG_BODY) || Tag.contains(TAG_EMPTY))
		{
			var currentSplit = CreateList(CurrentValue);
			
			if(Tag.contains(TAG_BODY_INDENT))
			{
				//May be a bulleted list or lettered list
				//If It Starts with a Bullet
				if(CurrentValue.startsWith(BULLET))
				{
					if(currentSplit.length > 1)
					{
						if(Section_N.Items.length >= 1){
							try{
								Section_N.Items[Section_N.Items.length - 1].Response = "See the next " + currentSplit.length + " items.";
							}
							catch(err){
								Item_N = new Item("","","","See the next " + currentSplit.length + " items.");
								Section_N.Items.push(Item_N);
							}
						}
						
						Item_N = new Item("","","","");
						//Item_N.Response = HTML_TAG_OPN_UL;
						Item_N.Response = "";
						for(var j = 0; j < currentSplit.length; j++)
						{
							var removal = BULLET + "\t";
							var temp = currentSplit[j].replace(removal, '');
							
							if(Section_N.Items.length > 0 ){
								Item_N = new Item(Section_N.Items[Section_N.Items.length - 1].Index,"","","");
							
								for(var k = 0; k < SplitByTab(temp).length; k++)
								{
									var element = SplitByTab(temp)[k];
									
									switch(k)
									{
										case 0:
											Item_N.Check = element;
											break;
										case 1:
											Item_N.Response = element;
											break;
									}
									
								}
							}
							else {
								Item_N = new Item(0,"","","");
								for(var k = 0; k < SplitByTab(temp).length; k++)
								{
									var element = SplitByTab(temp)[k];
									
									switch(k)
									{
										case 0:
											Item_N.Check = element;
											break;
										case 1:
											Item_N.Response = element;
											break;
									}
									
								}
							}
							
							Section_N.Items.push(Item_N);
							//var bulletitem = currentSplit[j];
							//Item_N.Response = Item_N.Response + HTML_TAG_OPN_LI + bulletitem.replace(BULLET,"") + HTML_TAG_CLS_LI;
						}
						//Item_N.Response = Item_N.Response + HTML_TAG_CLS_UL;
					}
					else
					{
						if(Section_N.Items.length >= 1){
							try{
								Section_N.Items[Section_N.Items.length - 1].Response = "See the next item.";
							}
							catch(err){
								Item_N = new Item("","","","See the next " + currentSplit.length + " items.");
								Section_N.Items.push(Item_N);
							}
						}
						
						Item_N = new Item(Section_N.Items[Section_N.Items.length - 1].Index,Section_N.Items[Section_N.Items.length - 1].Check, currentSplit[j] ,Section_N.Items[Section_N.Items.length - 1].Note);
						Section_N.Items.push(Item_N);
						//Item_N.Response =  HTML_TAG_OPN_UL + HTML_TAG_OPN_LI + currentSplit[0] + HTML_TAG_CLS_LI + HTML_TAG_CLS_UL;
					}
					
					//Section_N.Items.push(Item_N);
					
					continue;
				}
				else
				{
					//It does Not Start with a bullet
					if(GetTabularElementCount(currentSplit[0]) == 3)
					{
						for(var k = 0; k < currentSplit.length; k++)
						{
							var s = currentSplit[k];
							var Item_N = new Item("","","","");
							
							for(var j = 0; j < SplitByTab(s).length; j++)
							{
								var element = SplitByTab(s)[j];
								
								switch(j)
								{
									case 0:
										Item_N.Index = element;
										break;
									case 1:
										Item_N.Check = element;
										break;
									case 2:
										Item_N.Response = element;
										break;
								}
							}
							Section_N.Items.push(Item_N);
							continue;
						}
					}
					else
					{
						//It Is Probably a Note
						
						Item_N = new Item("","","","");
						
						for(var j = 0; j < currentSplit.length; j++)
						{
							var element = currentSplit[j];
							Item_N.Note = Item_N.Note + element;
						}
						
						Section_N.Items.push(Item_N);
						continue;
					}
				}
			}
			else
			{
				if (Tag.contains(TAG_BODY_CHART))
				{
					// Create a Table;
					
					var Headers = new Array();
					
					var TabSplit = SplitByTab(currentSplit[0]);
					
					for(var j = 0; j < TabSplit.length; j++)
					{
						Headers.push(TabSplit[j]);
					}
					
					for(var j = 0; j < currentSplit.length; j++)
					{
						Row_N = new Row();
						
						var TabSplit = SplitByTab(currentSplit[j]);
						
						for(var k = 0; k < TabSplit.length; k++)
						{
							var columntext = TabSplit[k];
							
							if( columntext == "")
							continue;
							Column_N = new Column("","");
							Column_N.Name = Headers[k];
							Column_N.Value = columntext;
							Row_N.Columns.push(Column_N);
						}
						
						
						Table_N.Rows.push(Row_N);
					}
					Section_N.Table = Table_N;
					continue;
					
				}
				else
				{
					//Nothing Special. Probably Index Check and Response
					for(var k = 0; k < currentSplit.length; k++)
					{
						var s = currentSplit[k];
						var Item_N = new Item("","","","");
						
						for(var j = 0; j < SplitByTab(s).length; j++)
						{
							var element = SplitByTab(s)[j];
							
							switch(j)
							{
								case 0:
									Item_N.Index = element;
									break;
								case 1:
									Item_N.Check = element;
									break;
								case 2:
									Item_N.Response = element;
									break;
							}
						}
						
						if(Item_N.Check != "" && Item_N.Response != "") {
							Section_N.Items.push(Item_N);
							break;
						}
					}
				}
			}
		}
		
		if(Tag.contains(TAG_TOC) || Tag.contains(TAG_TOC_SECONDARY))
		{
			var currentSplit = CreateList(CurrentValue);
			
			if(Tag.contains(TAG_TOC) && LookAhead(qd.Tag,i).contains(TAG_TOC_SECONDARY))
			{
				TOC_N = new TOC(currentSplit[0]);
			}
			else
			{
				TOC_N.Items = new Array();
				
				for(var j = 0; j < currentSplit.length; j++)
				{
					var s = currentSplit[j];
					TOCItem_N = new TOCItem("","");
					TOCItem_N.Index = GetTOCIndex(s).replace("\t","");
					TOCItem_N.Text = s.replace(GetTOCIndex(s),"").replace("\t","").trim();
					
					TOC_N.Items.push(TOCItem_N);
				}
				
				Section_N.TOC = TOC_N;
			}
			
			continue;
		}
		if (Tag.contains(TAG_NOTE))
		{
			var currentSplit = CreateList(CurrentValue);
			var nextData = LookAhead(qd.Tag,i);
			if(nextData != undefined && nextData.contains(TAG_BODY_INDENT))
			{
				// We have a note Item
				var NextValue = qd.Value[i + 1];
				var nextcurrentSplit = CreateList(NextValue);
				
				if(nextcurrentSplit.length > 1){ //We have Multiple Notes
					Item_N = new Item("",CurrentValue,"See the next " + nextcurrentSplit.length + " items.","");
					Section_N.Items.push(Item_N);
				}
				else if (nextcurrentSplit.length == 1){ // We have 1 note
					Item_N = new Item("",CurrentValue,"See the next item.","");
					Section_N.Items.push(Item_N);
				}
				
				for(var j = 0; j < nextcurrentSplit.length; j++){
					if(nextcurrentSplit[j].contains(TAG_BODY_INDENT)) {
						Item_N = new Item(Section_N.Items[Section_N.Items.length - 1].Index,"","","");
						
						for(var k = 0; k < SplitByTab(nextcurrentSplit[j]).length; k++)
						{
								var element = SplitByTab(nextcurrentSplit[j])[k];
								
								switch(k)
								{
									case 0:
										Item_N.Index = element;
										break;
									case 1:
										Item_N.Check = element;
										break;
									case 2:
										Item_N.Response = element;
										break;
								}
						}
						
						Section_N.Items.push(Item_N);
						i++;
					}
					else {
						break;
					}
				}
			}
			else if(nextData != undefined) {
				Item_N = new Item("",CurrentValue,"","");
				Section_N.Items.push(Item_N);
			}
		}
	}
	
	Section_N.Id = qd.Tag.length;
	Qref_N.emergencies.push(Section_N);
	
	postingChecklist = true;
	//DEBUG ENVIRONMENT
	return CreateJSON(rawdata);
	//return CreateJSON();
	
	
}
//DEBUG ENVIRONMENT
function CreateJSON(rawData)
//function CreateJSON()
{
	
	var chkList = new ChecklistDev();
	//DEBUG ENVIRONMENT
	chkList.raw = rawData;
	
	
	for(var i = 0; i < Qref_N.preflight.length; i++)
	{
		var section = new ChecklistSection();
		section.sectionType="standard";
		section.index = i;
		section.name = Qref_N.preflight[i].Name;
		
		for(var j = 0; j < Qref_N.preflight[i].Items.length; j++)
		{
			var Qitem = Qref_N.preflight[i].Items[j];
		
			var item = new ChecklistItem();
			item.icon = "null";
			item.index = j;
			item.check = Qitem.Check;
			
			if(item.check == "")
				item.check = ""
			
			item.response = Qitem.Response;
			
			if(item.response == "")
				item.response = "";
			
			if(item.check != "null" && item.response != "null")
				section.items.push(item);
			else
				section.items.push(item);
		}
		
		chkList.preflight.push(section);
	}
	
	for(var i = 0; i < Qref_N.takeoff.length; i++)
	{
		var section = new ChecklistSection();
		section.sectionType="standard";
		section.index = i;
		section.name = Qref_N.takeoff[i].Name;
		
		for(var j = 0; j < Qref_N.takeoff[i].Items.length; j++)
		{
			var Qitem = Qref_N.takeoff[i].Items[j];
		
			var item = new ChecklistItem();
			item.icon = "null";
			item.index = j;
			item.check = Qitem.Check;
			
			if(item.check == "")
				item.check = ""
			
			item.response = Qitem.Response;
			
			if(item.response == "")
				item.response = "";
			
			if(item.check != "null" && item.response != "null")
				section.items.push(item);
			else
				section.items.push(item);
		}
		
		chkList.takeoff.push(section);
	}
	
	for(var i = 0; i < Qref_N.landing.length; i++)
	{
		var section = new ChecklistSection();
		section.sectionType="standard";
		section.index = i;
		section.name = Qref_N.landing[i].Name;
		
		for(var j = 0; j < Qref_N.landing[i].Items.length; j++)
		{
			var Qitem = Qref_N.landing[i].Items[j];
		
			var item = new ChecklistItem();
			item.icon = "null";
			item.index = j;
			item.check = Qitem.Check;
			
			if(item.check == "")
				item.check = ""
			
			item.response = Qitem.Response;
			
			if(item.response == "")
				item.response = "";
			
			if(item.check != "null" && item.response != "null")
				section.items.push(item);
			else
				section.items.push(item);
		}
		
		chkList.landing.push(section);
	}
	
	var section = new ChecklistSection();
	section.sectionType="standard";
	section.index = 0;
	section.name = Qref_N.emergencies[0].Name;
	
	for(var j = 0; j < Qref_N.emergencies[0].Items.length; j++)
	{
		var sectionItem = Qref_N.emergencies[0].Items[j];
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
			
			if(item.check != "null" && item.response != "null")
				subSection.items.push(item);
		}
		
		section.items.push(subSection);
	}
	
	chkList.emergencies.push(section);
	
	//Reset
	FileContents = "";
		
	TAG_HEADER = "@Header 1";
	TAG_HEADER_SECONDARY = "@Header";
	TAG_BODY = "@Body";
	TAG_BODY_INDENT = "@Body Indent";
	TAG_BODY_CHART = "@Body CHART";
	TAG_NOTE = "@Note";
	TAG_TOC = "@TOC 1";
	TAG_TOC_SECONDARY = "@TOC";
	BULLET = '\u2022';
	TAG_EMPTY="@:";

	HTML_TAG_OPN_UL = "<ul>";
	HTML_TAG_CLS_UL = "</ul>";
	HTML_TAG_OPN_LI = "<li>";
	HTML_TAG_CLS_LI = "</li>";

	QStartTagReg = /@[A-Za-z0-9\s]+=/;
	docTags = new Array();

	TagIndex = 0;
	TagStartPos = 0;

	category = 0;

	Qref_N 		= new Qref();
	Section_N 	= new Section("","","","");
	Item_N 		= new Item("","","","");
	TOC_N 		= new TOC("");
	TOCItem_N	= new TOCItem("","");
	Table_N		= new Table();
	Row_N 		= new Row();
	Column_N	= new Column("","");
	Qref_N = new Qref();
	
	return chkList;
}
	
function ChecklistDev()
{
	//DEBUG ENVIRONMENT
	this.raw = "";
	this.manufacturer = "";
	this.model= "";
	this.serialNumber="000-00-001";
	this.tailNumber="0001";
	this.version = 1;
	this.productIcon = "";
	this.coverImage = "";
	this.preflight = new Array();
	//this.preflight.push(EmptySection());
	
	this.takeoff = new Array();
	//this.takeoff.push(EmptySection());
	
	this.landing = new Array();
	//this.landing.push(EmptySection());
	
	this.emergencies = new Array();
	//this.emergencies.push(EmptySection());
}

function EmptySection()
{
	var item = new ChecklistItem();
	item.icon = "0";
	item.index = 0;
	item.check = "0";
	item.response = "0";
	
	var section = new ChecklistSection();
	
	section.items.push(item);
	
	return section;
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

function GetTextArea()
{
	return document.getElementById("id_TextArea").innerHTML.toString();
}

function CreateList(text)
{
	var textarray = new Array();
	
	textarray = text.split(getLineSeparator());
	
	return textarray;
}

function getLineSeparator() 
{
  return "\r";
}

function StripTags(line)
{
	return line.replace(/(<[^>]+>)|(E\\[^>]+>)/g,"");
}

function RewriteTags(line)
{
	if(line.contains("&lt"))
	{
		line = line.replace(/\&lt;/g,"<");
	}
	if(line.contains("&gt;"))
	{
		line = line.replace(/\&gt;/g,">");
	}
	
	return line;
}

function Remove(line,startindex,endindex)
{
	var FinalString = "";
	var IsRemoving = false;
	
	for(var i = 0; i < line.length; i++)
	{
		var c = line[i];
		
		if(i == startindex)
		{
			IsRemoving = true;
		}
		if( i == endindex)
		{
			IsRemoving = false;
		}
		
		if(!IsRemoving)
		{
			FinalString += c;
		}
	}
	
	return FinalString;
}

function LookAhead(List, index)
{
	try
	{
		return List[index + 1];
	}
	catch(err)
	{
		return "";
	}
}

function GetTOCIndex(s)
{
	finalstring = "";
	
	if(s == "")
	{
		return "";
	}
	if(HasIntData(s,false))
	{
		if(HasIntData(s,true))
		{
			var Index = s.indexOf("\t");
			var sub = s.slice(Index);
			return sub;
		}
		else
		{
			var Index = s.indexOf('\t');
			var sub = s.substring(Index);
			return sub;
		}
	}
	else
	{
		var Index = s.indexOf('\t');

			if (Index == 0)
			{
				return "";
			}
			else
			{
				return s.substring(Index);
			}
	}
}

function HasIntData(s, startsWithIntData)
{
	var i = 0;
	
	if(startsWithIntData)
	{
		if( s.toString().match(/^(\d)/) != null)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else
	{
		if(s.toString().match(/(\d)/) != null)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
}

function GetTagAndValue(s)
{
	var finalstring = "";
	
	for(var i = 0; i < s.length; i++)
	{
		var c = s[i];
		
		if( i == 0 && c == "@")
		{
			finalstring = finalstring + c;
		}
		else
		{
			if(c == "@")
			{
				break;
			}
			finalstring = finalstring.toString() + c.toString();
		}
	}
	
	return finalstring;
}

function ContainsAny(Tags,line)
{
	TagStartPos = 0;
	TagIndex = 0;
	
	for(var i = 0; i < Tags.length; i++)
	{
		var currTag = Tags[i];
		
		if(line.startsWith(currTag))
		{
			TagIndex = i;
			TagStartPos = line.indexOf(currTag);
			return true;
		}
	}
	return false;
}

function IsStartingTag(s)
{
	/*
	return s.startsWith("@") && (s.contains("=[") || s.contains("=<"));*/
	
	return (s.startsWith("@") || s.contains("=<"));
}

function GetStartingTag(s)
{
	if(s.toString().match(QStartTagReg) != null)
	{
		return s.toString().match(QStartTagReg).toString().replace("=","").trim() + ":";
	}
	else
	{
		return "";
	}
}

function GetFewer(a,b)
{
	if( a < b )
		return a;
	else
		return b;
}

function StartsWithIndex(s)
{
	return HasIntData(s,true);
}

function EndsWithInt(s)
{
	s = s.trim();
	return HasIntData(s[s.length - 1].toString(),false);
}

function SplitByTab(s)
{
	return s.split("\t");
}

function GetTabularElementCount(s)
{
	return SplitByTab(s).length;
}