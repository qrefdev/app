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
var TAG_TOC = "@TOC 1";
var TAG_TOC_SECONDARY = "@TOC";
var BULLET = "�";
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
	this.Sections = new Array();
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
		if(Tag.contains(TAG_HEADER))
		{
			if(Section_N.Name != "")
			{
				Section_N.Id = i;
				Qref_N.Sections.push(Section_N);
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
			var splitlines = CreateList(CurrentValue);
			
			if(Tag.contains(TAG_BODY_INDENT))
			{
				//May be a bulleted list or lettered list
				//If It Starts with a Bullet
				if(CurrentValue.startsWith(BULLET))
				{
					if(splitlines.length > 1)
					{
						Item_N = new Item("","","","");
						Item_N.Response = HTML_TAG_OPN_UL;
						for(var j = 0; j < splitlines.length; j++)
						{
							var bulletitem = splitlines[j];
							Item_N.Response = Item_N.Response + HTML_TAG_OPN_LI + bulletitem.replace(BULLET,"") + HTML_TAG_CLS_LI;
						}
						Item_N.Response = Item_N.Response + HTML_TAG_CLS_UL;
					}
					else
					{
						Item_N = new Item("","","","");
						Item_N.Response =  HTML_TAG_OPN_UL + HTML_TAG_OPN_LI + splitlines[0] + HTML_TAG_CLS_LI + HTML_TAG_CLS_UL;
					}
					
					Section_N.Items.push(Item_N);
					
					continue;
				}
				else
				{
					//It does Not Start with a bullet
					if(GetTabularElementCount(splitlines[0]) == 3)
					{
						for(var k = 0; k < splitlines.length; k++)
						{
							var s = splitlines[k];
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
						
						for(var j = 0; j < splitlines.length; j++)
						{
							var element = splitlines[j];
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
					
					var TabSplit = SplitByTab(splitlines[0]);
					
					for(var j = 0; j < TabSplit.length; j++)
					{
						Headers.push(TabSplit[j]);
					}
					
					for(var j = 0; j < splitlines.length; j++)
					{
						Row_N = new Row();
						
						var TabSplit = SplitByTab(splitlines[j]);
						
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
					for(var k = 0; k < splitlines.length; k++)
					{
						var s = splitlines[k];
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
			}
		}
		
		if(Tag.contains(TAG_TOC) || Tag.contains(TAG_TOC_SECONDARY))
		{
			var splitlines = CreateList(CurrentValue);
			
			if(Tag.contains(TAG_TOC) && LookAhead(qd.Tag,i).contains(TAG_TOC_SECONDARY))
			{
				TOC_N = new TOC(splitlines[0]);
			}
			else
			{
				TOC_N.Items = new Array();
				
				for(var j = 0; j < splitlines.length; j++)
				{
					var s = splitlines[j];
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
			var splitlines = CreateList(CurrentValue);
			
			Item_N = new Item("","","","");
			
			Item_N.Note = CurrentValue;
			
			Section_N.Items.push(Item_N);
			continue;
		}
	}
	
	postingChecklist = true;
	return CreateJSON();
	
	
}
function CreateJSON()
{
	
	var chkList = new ChecklistDev();
	
	for(var i = 0; i < Qref_N.Sections.length; i++)
	{
		var section = new ChecklistSection();
		section.sectionType="standard";
		section.index = i;
		section.name = Qref_N.Sections[i].Name;
		
		for(var j = 0; j < Qref_N.Sections[i].Items.length; j++)
		{
			var Qitem = Qref_N.Sections[i].Items[j];
		
			var item = new ChecklistItem();
			item.icon = "null";
			item.index = j;
			item.check = Qitem.Check;
			
			if(item.check == "")
				item.check = "null"
			
			item.response = Qitem.Response;
			
			if(item.response == "")
				item.response = "null";
			
			if(item.check != "null" && item.response != "null")
				section.items.push(item);
			else if(item.check != "null" && item.response == "null")
				section.items.push(item);
		}
		
		chkList.preflight.push(section);
	}
	
	
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
	BULLET = "�";
	TAG_EMPTY="@:";

	HTML_TAG_OPN_UL = "<ul>";
	HTML_TAG_CLS_UL = "</ul>";
	HTML_TAG_OPN_LI = "<li>";
	HTML_TAG_CLS_LI = "</li>";

	QStartTagReg = /@[A-Za-z0-9\s]+=/;
	docTags = new Array();

	TagIndex = 0;
	TagStartPos = 0;

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
	return s.contains("@") && (s.contains("=[") || s.contains("=<"));
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