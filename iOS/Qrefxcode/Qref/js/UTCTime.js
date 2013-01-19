function UTCTime () {
	var self = this;
	
	this.update = function() {
		var now = new Date();
		
		//this.checkThemeMode();
		
		$(".utcCurrent").html(now.toUTCString());
		
		setTimeout(function() {
			self.update();
		}, 1000);
	};
	
	this.checkThemeMode = function() {
		if(AutoSwitch)
		{
			var now = new Date();
			
			var currentHours = now.getHours();
			var currentMinutes = now.getMinutes();
			
			var nightTimeModeOnSplit = NightTimeModeTime.split(":");
			var nightTimeModeOnHour = parseInt(nightTimeModeOnSplit[0]);
			var nightTimeModeOnMinutes = parseInt(nightTimeModeOnSplit[1]);
			
			var nightTimeModeOffSplit = NightTimeModeTimeOff.split(":");
			var nightTimeModeOffHour = parseInt(nightTimeModeOffSplit[0]);
			var nightTimeModeOffMinutes = parseInt(nightTimeModeOffSplit[1]);
			
            
            if(nightTimeModeOffMinutes == nightTimeModeOnMinutes && nightTimeModeOffHour == nightTimeModeOnHour)
            {
                if(Theme.previousTheme != NightTheme)
					Theme.apply(NightTheme);
                
				NightMode = true;
            }
            else if(currentHours >= nightTimeModeOnHour && currentMinutes >= nightTimeModeOnMinutes && !NightMode)
			{
				if(Theme.previousTheme != NightTheme)
					Theme.apply(NightTheme);
					
				NightMode = true;
			}
			else if(currentHours >= nightTimeModeOffHour && currentMinutes >= nightTimeModeOffMinutes && NightMode)
			{
				if(Theme.previousTheme != DayTheme)
					Theme.apply(DayTheme);
					
				NightMode = false;
			}
			else if(currentHours < nightTimeModeOnHour && currentMinutes < nightTimeModeOnMinutes 
				&& currentHours < nightTimeModeOffHour && currentMinutes < nightTimeModeOffMinutes)
			{
				if(Theme.previousTheme != NightTheme)
					Theme.apply(NightTheme);
					
				NightMode = true;
			}
		}
	};
}