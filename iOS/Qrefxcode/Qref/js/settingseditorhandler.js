function SettingsEditorHandler() {
	var self = this;
	
	this.init = function() {
		$(".saveSettings").tap(function(event) {
			self.save();
		});
	};
	
	this.save = function() {
		this.getNightTimeOff();
		this.getNightTimeOn();
		
		
		DayTheme = $("#dayTheme").val();
		NightTheme = $("#nightTheme").val();
		
		var mode = parseInt($("#autoThemeMode").val());
		
		if(mode == 0)
			AutoSwitch = false;
		else
			AutoSwitch = true;
			
		window.location.href = "qref://daytheme=" + DayTheme +"&nighttheme=" + NightTheme +"&autotheme=" + AutoSwitch + "&nighttimemodetime=" + NightTimeModeTime + "&nighttimemodetimeoff=" + NightTimeModeTimeOff;	
		
		Navigation.go("dashboard");
	};
	
	
	this.updateSettingsView = function() {
		$("#dayTheme").children().each(function() {
			var ele = $(this);
			
			if(ele.val() == DayTheme)
				ele.attr("selected", "selected");
			else
				ele.removeAttr("selected");
		});
		
		$("#nightTheme").children().each(function() {
			var ele = $(this);
			
			if(ele.val() == NightTheme)
				ele.attr("selected", "selected");
			else
				ele.removeAttr("selected");
		});
		
		var nightTimeOnSplit = NightTimeModeTime.split(":");
		var nightTimeOffSplit = NightTimeModeTimeOff.split(":");
		
		$("#nightTimeModeOnHour").val(nightTimeOnSplit[0]);
		$("#nightTimeModeOnMinutes").val(nightTimeOnSplit[1]);
		$("#nightTimeModeOffHour").val(nightTimeOffSplit[0]);
		$("#nightTimeModeOffMinutes").val(nightTimeOffSplit[1]);
		
		if(AutoSwitch)
		{
			$($("#autoThemeMode").children()[1]).attr("selected", "selected");
			$($("#autoThemeMode").children()[0]).removeAttr("selected");
		}
		else
		{
			$($("#autoThemeMode").children()[1]).removeAttr("selected");
			$($("#autoThemeMode").children()[0]).attr("selected", "selected");
		}
	};
	
	this.getNightTimeOn = function() {
		/** Night Mode On Time **/
		var nightModeOnHour = parseInt($("#nightTimeModeOnHour").val());
		var nightModeOnMinutes = parseInt($("#nightTimeModeOnMinutes").val());
		
		if(nightModeOnHour == "NaN") nightModeOnHour = 18;
		if(nightModeOnMinutes == "NaN") nightModeOnMinutes = 0;
		
		if(nightModeOnHour > 23) nightModeOnHour = 23;
		if(nightModeOnHour < 0) nightModeOnHour = 0;
		
		if(nightModeOnMinutes > 59) nightModeOnMinutes = 59;
		if(nightModeOnMinutes < 0) nightModeOnMinutes = 0;
		
		var nightModeOnHourString = "";
		var nightModeOnMinutesString = "";
		
		if(nightModeOnHour < 10)
			nightModeOnHourString = "0" + nightModeOnHour;
		else
			nightModeOnHourString = "" + nightModeOnHour;
			
		if(nightModeOnMinutes < 10)
			nightModeOnMinutesString = "0" + nightModeOnMinutes;
		else
			nightModeOnMinutesString = "" + nightModeOnMinutes;
			
		$("#nightTimeModeOnHour").val(nightModeOnHourString);
		$("#nightTimeModeOnMinutes").val(nightModeOnMinutesString);
		
		NightTimeModeTime = nightModeOnHourString + ":" + nightModeOnMinutesString;
	};
	
	this.getNightTimeOff = function() {
		/** Night Mode On Time **/
		var nightModeOffHour = parseInt($("#nightTimeModeOffHour").val());
		var nightModeOffMinutes = parseInt($("#nightTimeModeOffMinutes").val());
		
		if(nightModeOffHour == "NaN") nightModeOffHour = 18;
		if(nightModeOffMinutes == "NaN") nightModeOffMinutes = 0;
		
		if(nightModeOffHour > 23) nightModeOffHour = 23;
		if(nightModeOffHour < 0) nightModeOffHour = 0;
		
		if(nightModeOffMinutes > 59) nightModeOffMinutes = 59;
		if(nightModeOffMinutes < 0) nightModeOffMinutes = 0;
		
		var nightModeOffHourString = "";
		var nightModeOffMinutesString = "";
		
		if(nightModeOffHour < 10)
			nightModeOffHourString = "0" + nightModeOffHour;
		else
			nightModeOffHourString = "" + nightModeOffHour;
			
		if(nightModeOffMinutes < 10)
			nightModeOffMinutesString = "0" + nightModeOffMinutes;
		else
			nightModeOffMinutesString = "" + nightModeOffMinutes;
			
		$("#nightTimeModeOffHour").val(nightModeOffHourString);
		$("#nightTimeModeOffMinutes").val(nightModeOffMinutesString);
		
		NightTimeModeTimeOff = nightModeOffHourString + ":" + nightModeOffMinutesString;
	};
}