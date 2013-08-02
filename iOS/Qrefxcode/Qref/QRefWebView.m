//
//  QRefWebView.m
//  Qref
//
//  Created by Aaron Klick on 9/17/12.
//
//

#import "QRefWebView.h"

@implementation QRefWebView

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
        
        self->server = @"https://my.qref.com/";
        
        [self setWantsFullScreenLayout:YES];
        
        self.imageQueue = [[NSOperationQueue alloc] init];
        self.savingQueue = [[NSOperationQueue alloc] init];
        CGRect bounds = [[UIScreen mainScreen] bounds];
        CGFloat screenScale = [[UIScreen mainScreen] scale];
        
        if([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone) {
            if(screenScale > 1) {
                if(bounds.size.width * screenScale > 1000 || bounds.size.height * screenScale > 1000) {
                    self->startUpImage = [UIImage imageNamed:@"Default-568h@2x.png"];
                }
                else {
                    self->startUpImage = [UIImage imageNamed:@"Default@2x.png"];
                }
            }
            else {
                self->startUpImage = [UIImage imageNamed:@"Default.png"];
            }
        }
        else if([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPad) {
            if(screenScale > 1) {
                if([[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeLeft || [[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeRight) {
                    self->startUpImage = [UIImage imageNamed:@"Default-Landscape@2x~ipad.png"];
                }
                else {
                    self->startUpImage = [UIImage imageNamed:@"Default-Portrait@2x~ipad.png"];
                }
            }
            else {
                if([[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeLeft || [[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeRight) {
                    self->startUpImage = [UIImage imageNamed:@"Default-Landscape~ipad.png"];
                }
                else {
                    self->startUpImage = [UIImage imageNamed:@"Default-Portrait~ipad.png"];
                }
            }
        }
        
        if([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone) {
            self->imageView = [[UIImageView alloc] initWithFrame:bounds];
        }
        else if([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPad) {
            if([[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeLeft || [[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeRight) {
                self->imageView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, bounds.size.height, bounds.size.width)];
            }
            else {
                self->imageView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, bounds.size.width, bounds.size.height)];
            }
        }
        
        self->imageView.image = self->startUpImage;
        
        [self->imageView setContentMode:UIViewContentModeScaleAspectFill];
        
        self.webView = [[UIWebView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
        self.webView.delegate = self;
        
        [self.webView setBackgroundColor:[UIColor clearColor]];
        //[self setView:self.webView];
        
        [self setView:self->imageView];
        
        self->preferences = [NSUserDefaults standardUserDefaults];
        self->purchaseManager = [[QrefInAppPurchaseManager alloc] init];
        [self->purchaseManager setDelegate:self];
        
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardShown:) name:UIKeyboardDidShowNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardHidden:) name:UIKeyboardDidHideNotification object:nil];
        
        self->reach = [Reachability reachabilityWithHostname:@"my.qref.com"];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(reachabilityChanged:)
                                                     name:kReachabilityChangedNotification
                                                   object:nil];
        [self->reach startNotifier];
        
        [[NSURLCache sharedURLCache] removeAllCachedResponses];
    }
   return self;
}

//-(UIStatusBarStyle) preferredStatusBarStyle{
//    return UIStatusBarStyleLightContent;
//}

- (void) reachabilityChanged:(NSNotification *) notif {
    Reachability * rch = [notif object];
    
    if([rch isReachable]) {
        [self.webView stringByEvaluatingJavaScriptFromString:@"reachability = true;"];
        [self.webView stringByEvaluatingJavaScriptFromString:@"AppObserver.set('reachable', true);"];
    }
    else {
        [self.webView stringByEvaluatingJavaScriptFromString:@"reachability = false;"];
        [self.webView stringByEvaluatingJavaScriptFromString:@"AppObserver.set('reachable', false);"];
    }
}

- (void) keyboardShown: (NSNotification *) notif {
    CGSize keyboardSize = [[[notif userInfo] objectForKey:UIKeyboardFrameBeginUserInfoKey] CGRectValue].size;
    
    [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat: @"keyboardShown(%.2f, %.2f);", keyboardSize.height, self.webView.frame.size.height]];
}

- (void) keyboardHidden: (NSNotification *) notif {
    [self.webView stringByEvaluatingJavaScriptFromString:@"keyboardHidden();"];
}


- (void)viewDidLoad
{
    [super viewDidLoad];
    
//    [self setNeedsStatusBarAppearanceUpdate];
	// Do any additional setup after loading the view.
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}

- (void) dealloc {
    self.webView = nil;
    self->preferences = nil;
    self->purchaseManager = nil;
    self->startUpImage = nil;
    self->imageView = nil;
    [self->reach stopNotifier];
    self->reach = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

- (void)gotoURL:(NSURLRequest *)url {
    [self.webView loadRequest:url];
}

- (void) webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    if([error code] == NSURLErrorCancelled)
    {
        return;
    }
}

- (BOOL) canPerformAction:(SEL)action withSender:(id)sender
{
    if (action == @selector(copy:) ||
        action == @selector(paste:)||
        action == @selector(cut:))
    {
        return NO;
    }
    
    return [super canPerformAction:action withSender:sender];
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    NSString *url = [[request URL] absoluteString];
    
    static NSString *urlPrefix = @"qref://";
    static NSString *filePrefix = @"file://";
    
    if ([url hasPrefix:urlPrefix]) {
        NSString *paramsString = [url substringFromIndex:[urlPrefix length]];
        NSArray *paramsArray = [paramsString componentsSeparatedByString:@"&"];
        int paramsAmount = [paramsArray count];
        
        for (int i = 0; i < paramsAmount; i++) {
            NSArray *keyValuePair = [[paramsArray objectAtIndex:i] componentsSeparatedByString:@"="];
            NSString *key = [keyValuePair objectAtIndex:0];
            NSString *value = nil;
            if ([keyValuePair count] > 1) {
                value = [keyValuePair objectAtIndex:1];
            }
            
            if (key && [key length] > 0) {
                if([key isEqualToString:@"onload"])
                {
                    [self onload];
                }
                else if([key isEqualToString:@"imageCache"])
                {
                    if(value != nil)
                    {
                        //NSLog(@"Image cache requested");
                        
                        //to prevent internal caching of webpages in application
                        NSURLCache *sharedCache = [[NSURLCache alloc] initWithMemoryCapacity:0 diskCapacity:0 diskPath:nil];
                        [NSURLCache setSharedURLCache:sharedCache];
                        sharedCache = nil;
                        [self hasImageInCache: value];
                    }
                }
                //Save Checklist
                else if([key isEqualToString:@"sc"]) {
                    NSLog(@"Saving supposedly");
                    if(value != nil) {
                        [self.savingQueue addOperationWithBlock:^{
                            [self saveChecklist:value];
                        }];
                    }
                }
                else if([key isEqualToString:@"hasChecklists"]) {
                    NSThread  * thread = [[NSThread alloc] initWithTarget:self selector:@selector(signinFindCachedChecklists) object:nil];
                    
                    [thread start];
                }
                else if([key isEqualToString:@"setCanCheck"]) {
                    if(value != nil) {
                        [self setCanCheck: value];
                    }
                }
                else if([key isEqualToString:@"setLogin"]) {
                    if(value != nil) {
                        [self setLogin: value];
                    }
                }
                else if([key isEqualToString:@"localLogin"]) {
                    if(value != nil) {
                        [self localLogin: value];
                    }
                    else {
                        [self.webView stringByEvaluatingJavaScriptFromString:@"InvalidSignin();"];
                    }
                }
                else if([key isEqualToString:@"clearChecklistCache"]) {
                    [self clearChecklists];
                }
                else if([key isEqualToString:@"checklistsBegin"])
                {
                    self->incomingData = nil;
                    self->incomingData = [NSMutableString string];
                }
                else if([key isEqualToString:@"checklistsPacket"])
                {
                    if(value != nil)
                    {
                        [self->incomingData appendString:value];
                    }
                }
                else if([key isEqualToString:@"checklistsEnd"])
                {
                    //[self saveChecklists:self->incomingData];
                }
                else if([key isEqualToString:@"daytheme"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"qrefDayTheme"];
                    }
                }
                else if([key isEqualToString:@"nighttheme"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"qrefNightTheme"];
                    }
                }
                else if([key isEqualToString:@"autotheme"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"qrefAutoSwitch"];
                    }
                }
                else if([key isEqualToString:@"nighttimemodetime"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"qrefNightTimeModeTime"];
                    }
                }
                else if([key isEqualToString:@"nighttimemodetimeoff"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"qrefNightTimeModeTimeOff"];
                    }
                }
                else if([key isEqualToString:@"setToken"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"qrefToken"];
                        
                        NSString * user = [self->preferences stringForKey:@"qrefUser"];
                        
                        if(user != nil)
                        {
                            [SSKeychain setPassword:value forService:@"com.qref.qrefChecklists" account:[user stringByAppendingString:@"-Token"]];
                        }
                    }
                }
                else if([key isEqualToString:@"setUser"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"qrefUser"];
                    }
                }
                else if([key isEqualToString:@"setUserId"]) {
                    if(value != nil) {
                        [self->preferences setValue:value forKey:@"qrefUserId"];
                    }
                }
                else if([key isEqualToString:@"clearToken"])
                {
                    [self->preferences setValue:@"" forKey:@"qrefToken"];
                }
                else if([key isEqualToString:@"clearUser"])
                {
                    [self->preferences setValue:@"" forKey:@"qrefUser"];
                    [self->preferences setValue:@"" forKey:@"Checklists"];
                }
                else if([key isEqualToString:@"purchase"])
                {
                    if(value != nil)
                    {
                        [self->purchaseManager requestProduct:value];
                    }
                }
                else if([key isEqualToString:@"clearCache"])
                {
                    //to prevent internal caching of webpages in application
                    NSURLCache *sharedCache = [[NSURLCache alloc] initWithMemoryCapacity:0 diskCapacity:0 diskPath:nil];
                    [NSURLCache setSharedURLCache:sharedCache];
                    sharedCache = nil;

                }
                else if([key isEqualToString:@"nlog"]) {
                    if(value != nil) {
                        NSLog(@"%@", value);
                    }
                }
                else if(![key isEqualToString:@"timestamp"]){
                    if(self.delegate != nil) {
                        [self.delegate webViewResponseReceived:key value:value];
                    }
                }
            }
        }
        
        [self->preferences synchronize];
        
        return NO;
    }
    else if(![url hasPrefix:filePrefix]) {
        [[UIApplication sharedApplication] openURL:[request URL]];
        return NO;
    }
    else {
        return YES;
    }
}

- (void) completeTransaction:(SKPaymentTransaction *)transaction {
    if(transaction != nil)
    {
        NSString * base64Receipt = [QSStrings  encodeBase64WithData:transaction.transactionReceipt];
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat: @"SendReceipt('%@');", base64Receipt]];
        base64Receipt = nil;
    }
}

- (void) failedTransaction:(SKPaymentTransaction *)transaction {
    [self.webView stringByEvaluatingJavaScriptFromString:@"PurchaseFailed();"];
}

- (void) canceledTransaction {
    [self.webView stringByEvaluatingJavaScriptFromString:@"PurchaseCanceled();"];
}

- (void) hasImageInCache:(NSString *)imageJSON {

    [self.imageQueue addOperationWithBlock:^{
        NSArray *array = [imageJSON componentsSeparatedByString:@";"];
        
            NSString *undefinedCheck = [array objectAtIndex:0];
            if(![undefinedCheck isEqualToString:@"undefined"])
            {
                NSString *file = [array objectAtIndex:0];
                NSString *fileType = [array objectAtIndex:2];
                NSArray *fileSegments = [file componentsSeparatedByString:@"/"];
                file = [fileSegments lastObject];
                NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
                NSFileManager *manager = [NSFileManager defaultManager];
                NSString *cachedFilePath = [cachePath stringByAppendingPathComponent:[NSString stringWithFormat:@"/qref/%@", [fileType stringByAppendingString: file]]];
                //NSURL *url = [NSURL fileURLWithPath:cachedFilePath];
            
                if([manager fileExistsAtPath:cachedFilePath])
                {
                    //NSLog(@"file already exists, retrieving...");
                    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
                        NSString *imageInfo = cachedFilePath;
                        //NSLog(@"File path: %@", cachedFilePath);
                        imageInfo = [NSString stringWithFormat:@"%@;%@;%@",imageInfo,[array objectAtIndex:1],[array objectAtIndex:2]];
                        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"PushImage('%@');", imageInfo]];
                        imageInfo = nil;
                    }];
                }
                else
                {
                   // NSLog(@"Downloading file..");
                    NSString *serv = self->server;
                    NSString *serverUrl = [serv stringByAppendingPathComponent:[array objectAtIndex:0]];
                   // NSLog(@"File path: %@", serverUrl);
                    
                    ImageDownloader *downloader = [[ImageDownloader alloc] init];
                    downloader.delegate = self;
                    
                    [downloader download:serverUrl imageName:imageJSON];
                }
                
                cachedFilePath = nil;
                manager = nil;
                cachePath = nil;
                file = nil;
                fileSegments = nil;
                fileType = nil;
                
            }
        
        undefinedCheck = nil;
        array = nil;
    }];
}

- (void) setCanCheck: (NSString *) value {
    [self->preferences setObject:value forKey:@"qrefCanCheck"];
}

- (void) downloadComplete:(NSData *)imageData imageName:(NSString *)name {
        NSArray *array = [name componentsSeparatedByString:@";"];
        
        NSString *undefinedCheck = [array objectAtIndex:0];
        if(![undefinedCheck isEqualToString:@"undefined"])
        {
            NSString *file = [array objectAtIndex:0];
            NSString *fileType = [array objectAtIndex:2];
            NSArray *fileSegments = [file componentsSeparatedByString:@"/"];
            file = [fileSegments lastObject];
            NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
            NSFileManager *manager = [NSFileManager defaultManager];
            NSString *cachedFilePath = [cachePath stringByAppendingPathComponent:[NSString stringWithFormat:@"/qref/%@", [fileType stringByAppendingString: file]]];
            
            if(imageData.length > 0)
            {
                //NSLog(@"Image data > 0");
                
                if([manager fileExistsAtPath:[cachePath stringByAppendingPathComponent:@"/qref"]] == NO)
                {
                    NSError *__autoreleasing * directoryError;
                    if(![manager createDirectoryAtPath:[cachePath stringByAppendingPathComponent:@"/qref"] withIntermediateDirectories:NO attributes:nil error:directoryError])
                    {
                        NSLog(@"Error creating directory %@", [cachePath stringByAppendingPathComponent:@"/qref"]);
                    }
                    
                }
                
                @try {
                    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
                        [imageData writeToFile:cachedFilePath atomically:YES];
                        NSString *imageInfo = cachedFilePath;
                        imageInfo = [NSString stringWithFormat:@"%@;%@;%@",imageInfo,[array objectAtIndex:1],[array objectAtIndex:2]];
                        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"PushImage('%@');", imageInfo]];
                       // NSLog(@"Writing file image file: %@", cachedFilePath);
                    }];
                }
                @catch (NSException *exception) {
                    NSLog(@"Error writing image file");
                }
                @finally {
                    
                }
            }
            
            cachedFilePath = nil;
            manager = nil;
            cachePath = nil;
            file = nil;
            fileSegments = nil;
            fileType = nil;
        }
}

- (void) productRequest:(SKProduct *)product canPurchase:(BOOL)canPurchase {
    if(canPurchase)
    {
        if(product != nil)
        {
            [self->purchaseManager startTransaction:product];
        }
        else
        {
            [self.webView stringByEvaluatingJavaScriptFromString:@"InvalidProduct();"];
        }
    }
    else
    {
        [self.webView stringByEvaluatingJavaScriptFromString:@"CannotPurchase();"];
    }
}

/*- (void) saveChecklists: (NSString *) checklists {
    NSString *UID = [self->preferences stringForKey:@"qrefUID"];
    NSString *user = [self->preferences stringForKey:@"qrefUser"];
    
    if(UID != nil && user != nil && checklists != nil)
    {
        NSString *combinedUserUID = [user stringByAppendingString:UID];
        NSData *encryptedData = nil;
        
        NSData *decoded = [QSStrings decodeBase64WithString:checklists];
        
        NSString *dataToEncrypt = [[NSString alloc] initWithBytes:[decoded bytes] length:[decoded length] encoding:NSASCIIStringEncoding];
        
        @try {
            encryptedData = [DESCrypt crypt:dataToEncrypt password:combinedUserUID];
        }
        @catch (NSException *exception) {
            encryptedData = [dataToEncrypt dataUsingEncoding:NSASCIIStringEncoding];
        }
        
        [self->preferences setValue:encryptedData forKey:@"Checklists"];
    }
}
*/

- (void) saveChecklist:(NSString *) cId {
    NSString *UID = [self->preferences stringForKey:@"qrefUID"];
    NSString *user = [self->preferences stringForKey:@"qrefUserId"];
    
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
        NSString *checklist = [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat: @"AppObserver.getChecklist('%@');", cId]];
        
        //NSLog(@"Checklist Item count: %d", items.count);
        
        if(checklist.length > 0) {
            NSString *file = [cId stringByAppendingString:@".qrf"];
            NSString *content = checklist;
            
            //NSLog(@"Beginning Saving checklist: %@", file);
            
            if(UID != nil && user != nil && content != nil)
            {
                NSMutableArray *ids = [NSMutableArray arrayWithArray:[self->preferences arrayForKey:[user stringByAppendingString:@"userChecklistIds"]]];
                
                if(ids == nil) {
                    ids = [NSMutableArray array];
                }
                
                if(![ids containsObject:file]) {
                    [ids addObject:file];
                    [self->preferences setValue:ids forKey:[user stringByAppendingString:@"userChecklistIds"]];
                    [self->preferences synchronize];
                }
                
                NSString *combinedUserUID = [user stringByAppendingString:UID];
                NSData *encryptedData = nil;
                
                NSData *decoded = [content dataUsingEncoding:NSASCIIStringEncoding];
                
                NSString *dataToEncrypt = [[NSString alloc] initWithBytes:[decoded bytes] length:[decoded length] encoding:NSASCIIStringEncoding];
                
                @try {
                    encryptedData = [DESCrypt crypt:dataToEncrypt password:combinedUserUID];
                }
                @catch (NSException *exception) {
                    encryptedData = [dataToEncrypt dataUsingEncoding:NSASCIIStringEncoding];
                }
                
                NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
                NSFileManager *manager = [NSFileManager defaultManager];
                NSString *cachedFilePath = [cachePath stringByAppendingPathComponent:[NSString stringWithFormat:@"/qref/%@", file]];
                
                if([manager fileExistsAtPath:[cachePath stringByAppendingString:@"/qref"]] == NO)
                {
                    NSError *__autoreleasing * directoryError;
                    if(![manager createDirectoryAtPath:[cachePath stringByAppendingPathComponent:@"/qref"] withIntermediateDirectories:NO attributes:nil error:directoryError])
                    {
                        NSLog(@"Error creating directory %@", [cachePath stringByAppendingPathComponent:@"/qref"]);
                    }
                    
                }
            
                [[NSOperationQueue mainQueue] addOperationWithBlock:^{
                   // NSLog(@"Saving checklist: %@", file);
                    [encryptedData writeToFile:cachedFilePath atomically:YES];
                }];
                
                cachePath = nil;
                manager = nil;
                cachedFilePath = nil;
                decoded = nil;
                dataToEncrypt = nil;
                encryptedData = nil;
                combinedUserUID = nil;
            }
            
            file = nil;
            content = nil;
        }
    }];
}

- (void) signinFindCachedChecklists {
    NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
    NSFileManager *manager = [NSFileManager defaultManager];
    NSMutableArray * cached = [NSMutableArray array];
    
    NSUserDefaults * pref = [NSUserDefaults standardUserDefaults];
    NSString *user = [pref stringForKey:@"qrefUserId"];
    
    if(user != nil) {
        NSMutableArray *ids = [NSMutableArray arrayWithArray:[pref arrayForKey:[user stringByAppendingString:@"userChecklistIds"]]];
        
        if([manager fileExistsAtPath:[cachePath stringByAppendingString:@"/qref"]] == YES) {
            NSArray * contents = [manager contentsOfDirectoryAtPath:[cachePath stringByAppendingString:@"/qref"] error:nil];
            
            for(int i = 0; i < contents.count; i++) {
                NSString *filename = [contents objectAtIndex:i];
                
                BOOL contains = [ids containsObject:filename];
                if([filename hasSuffix:@".qrf"] && contains) {
                    [cached addObject:filename];
                }
            }
            
            for(int i = 0; i < cached.count; i++) {
                NSData * content = [manager contentsAtPath:[cachePath stringByAppendingString:[NSString stringWithFormat:@"/qref/%@", [cached objectAtIndex:i]]]];
                
                [self loadChecklist:content];
                content = nil;
            }
        }
        
        cachePath = nil;
        manager = nil;
        cached = nil;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.webView stringByEvaluatingJavaScriptFromString:@"signinLoadChecklists();"];
    });
}

- (void) findCachedChecklists {
    NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
    NSFileManager *manager = [NSFileManager defaultManager];
    NSMutableArray * cached = [NSMutableArray array];
    
    NSUserDefaults * pref = [NSUserDefaults standardUserDefaults];
    NSString *user = [pref stringForKey:@"qrefUserId"];
    
    if(user != nil) {
        NSMutableArray *ids = [NSMutableArray arrayWithArray:[pref arrayForKey:[user stringByAppendingString:@"userChecklistIds"]]];
        
        if([manager fileExistsAtPath:[cachePath stringByAppendingString:@"/qref"]] == YES) {
            NSArray * contents = [manager contentsOfDirectoryAtPath:[cachePath stringByAppendingString:@"/qref"] error:nil];
            
            for(int i = 0; i < contents.count; i++) {
                NSString *filename = [contents objectAtIndex:i];
                
                BOOL contains = [ids containsObject:filename];
                if([filename hasSuffix:@".qrf"] && contains) {
                    [cached addObject:filename];
                }
            }
            
            for(int i = 0; i < cached.count; i++) {
                NSData * content = [manager contentsAtPath:[cachePath stringByAppendingString:[NSString stringWithFormat:@"/qref/%@", [cached objectAtIndex:i]]]];
                
                [self loadChecklist:content];
                content = nil;
            }
        }
        
        cachePath = nil;
        manager = nil;
        cached = nil;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.webView stringByEvaluatingJavaScriptFromString:@"DataLoaded();"];
        CGRect bounds = [[UIScreen mainScreen] bounds];
        
        [self setView:self.webView];
        
        if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationLandscapeLeft) {
            
            [self.webView setFrame:CGRectMake(22, 0, bounds.size.width - 22, bounds.size.height)];
        }
        else if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationLandscapeRight) {
            [self.webView setFrame:CGRectMake(0, 0, bounds.size.width - 22, bounds.size.height)];
        }
        else if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationPortrait) {
            [self.webView setFrame: CGRectMake(0, 22, bounds.size.width, bounds.size.height - 22)];
        }
        else if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationPortraitUpsideDown) {
            [self.webView setFrame: CGRectMake(0, 22, bounds.size.width, bounds.size.height - 22)];
        }
        
        [[UIApplication sharedApplication] setStatusBarHidden:NO];
        
        [self->imageView removeFromSuperview];
        self->imageView = nil;
        
        self->startUpImage = nil;
        
        if(self.delegate) {
            [self.delegate webViewDidLoad];
        }
    });
}

- (void) viewDidLayoutSubviews {
    CGRect bounds = [[UIScreen mainScreen] bounds];
    
    if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationLandscapeLeft) {
        
        [self.webView setFrame:CGRectMake(22, 0, bounds.size.width - 22, bounds.size.height)];
    }
    else if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationLandscapeRight) {
        [self.webView setFrame:CGRectMake(0, 0, bounds.size.width - 22, bounds.size.height)];
    }
    else if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationPortrait) {
        [self.webView setFrame: CGRectMake(0, 22, bounds.size.width, bounds.size.height - 22)];
    }
    else if([[UIApplication sharedApplication] statusBarOrientation] == UIInterfaceOrientationPortraitUpsideDown) {
        [self.webView setFrame: CGRectMake(0, 22, bounds.size.width, bounds.size.height - 22)];
    }
}

- (void) clearChecklists {
    NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
    NSFileManager *manager = [NSFileManager defaultManager];
    NSMutableArray * cached = [NSMutableArray array];
    
    if([manager fileExistsAtPath:[cachePath stringByAppendingString:@"/qref"]] == YES) {
        NSArray * contents = [manager contentsOfDirectoryAtPath:[cachePath stringByAppendingString:@"/qref"] error:nil];
        
        for(int i = 0; i < contents.count; i++) {
            NSString *filename = [contents objectAtIndex:i];
            
            if([filename hasSuffix:@".qrf"]) {
                [cached addObject:filename];
            }
        }
        
        for(int i = 0; i < cached.count; i++) {
            [manager removeItemAtPath:[cachePath stringByAppendingString:[NSString stringWithFormat:@"/qref/%@", [cached objectAtIndex:i]]] error:nil];
        }
    }
    
    cachePath = nil;
    manager = nil;
    cached = nil;
}

- (void) loadChecklist: (NSData *) data {
    NSUserDefaults * preference = [NSUserDefaults standardUserDefaults];
    NSString *user = [preference stringForKey:@"qrefUserId"];
    NSString *UID = [preference stringForKey:@"qrefUID"];
    
    if(user != nil && data != nil && UID != nil)
    {
        NSString *combinedUserUID = [user stringByAppendingString: UID];
        
        NSString *decryptedChecklistData = nil;
        
        @try {
            decryptedChecklistData = [DESCrypt decrypt:data password:combinedUserUID];
        }
        @catch (NSException *exception) {
            decryptedChecklistData = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
        }
        
        if([decryptedChecklistData length] > 0)
        {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"AppendChecklist('%@');", decryptedChecklistData]];
            });
        }
    }
}
/*
- (void) loadChecklist {
    NSUserDefaults * preference = [NSUserDefaults standardUserDefaults];
    NSString *user = [preference stringForKey:@"qrefUser"];
    NSString *UID = [preference stringForKey:@"qrefUID"];
    NSData *checklistData = [preference dataForKey:@"Checklists"];
    
    if(user != nil && checklistData != nil && UID != nil)
    {
        NSString *combinedUserUID = [user stringByAppendingString: UID];
        
        NSString *decryptedChecklistData = nil;
        
        @try {
            decryptedChecklistData = [DESCrypt decrypt:checklistData password:combinedUserUID];
        }
        @catch (NSException *exception) {
            decryptedChecklistData = [[NSString alloc] initWithData:checklistData encoding:NSUTF8StringEncoding];
        }
        
        if([decryptedChecklistData length] > 0)
        {
            
            if([decryptedChecklistData length] > 6024)
            {
                int totalChunks = ceil([decryptedChecklistData length] / 6024);
            
                for(int i = 0; i <= totalChunks; i++)
                {
                    if((i + 1) * 6024 < [decryptedChecklistData length])
                    {
                        NSRange range;
                        range.location = i * 6024;
                        range.length = 6024;
                        NSString *chunk = [decryptedChecklistData substringWithRange:range];
                
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
                        });
                       // [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
                    }
                    else if(i * 6024 < [decryptedChecklistData length])
                    {
                        int current = i * 6024;
                        int leftOver = [decryptedChecklistData length] - current;
                    
                        NSRange range;
                        range.location = i * 6024;
                        range.length = leftOver;
                    
                        NSString *chunk = [decryptedChecklistData substringWithRange:range];
                    
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
                        });
                        //[self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
                    }
                }
            }
            else
            {
                [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", decryptedChecklistData]];
            }
        }
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.webView stringByEvaluatingJavaScriptFromString:@"DataLoaded();"];
        CGRect bounds = [[UIScreen mainScreen] bounds];
        [self setView:self.webView];
        [self.webView setFrame: CGRectMake(0, 18, bounds.size.width, bounds.size.height - 18)];
        [[UIApplication sharedApplication] setStatusBarHidden:NO];
    });
}*/

- (void) onload {
    
    if(self.delegate != nil) {
        [self.delegate webViewBeforeLoad];
    }
    
    NSString *nightTimeModeTime = [self->preferences stringForKey:@"qrefNightTimeModeTime"];
    NSString *nightTimeModeTimeOff = [self->preferences stringForKey:@"qrefNightTimeModeTimeOff"];
    NSString *nightTheme = [self->preferences stringForKey:@"qrefNightTheme"];
    NSString *dayTheme = [self->preferences stringForKey:@"qrefDayTheme"];
    NSString *autoSwitch = [self->preferences stringForKey:@"qrefAutoSwitch"];
    NSString *user = [self->preferences stringForKey:@"qrefUser"];
    NSString *token = [self->preferences stringForKey:@"qrefToken"];
    NSString *UID = [self->preferences stringForKey:@"qrefUID"];
    NSString *canCheck = [self->preferences stringForKey:@"qrefCanCheck"];
    
    NSString * jsCallBack = @"window.getSelection().removeAllRanges();";
    [self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
    
    if(UID == nil)
    {
        CFUUIDRef ref = CFUUIDCreate(CFAllocatorGetDefault());
        
        NSString *uid = CFBridgingRelease(CFUUIDCreateString(CFAllocatorGetDefault(), ref));
        
        CFRelease(ref);
        
        [self->preferences setObject:uid forKey:@"qrefUID"];
        
        UID = uid;
    }
    
    if(user != nil)
    {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"UpdateLoginDisplay('%@');", user]];
    }
    
    if(token != nil)
    {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"AppObserver.set('token', '%@');", token]];
    }
    
    NSThread  * thread = [[NSThread alloc] initWithTarget:self selector:@selector(findCachedChecklists) object:nil];
    
    [thread start];
    
    if(nightTimeModeTime != nil)
    {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"NightTimeModeTime = '%@';", nightTimeModeTime]];
    }
    
    if(nightTimeModeTimeOff != nil)
    {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"NightTimeModeTimeOff = '%@';", nightTimeModeTimeOff]];
    }
    
    if(nightTheme != nil)
    {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"NightTheme = '%@';", nightTheme]];
    }
    
    if(dayTheme != nil)
    {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"DayTheme = '%@';", dayTheme]];
    }
    
    if(autoSwitch != nil)
    {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"AutoSwitch = '%@';", autoSwitch]];
    }
    
    if(canCheck != nil) {
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"ChecklistObserver.set('canCheck', %@);", canCheck]];
    }
    
    if([self->reach isReachable]) {
        [self.webView stringByEvaluatingJavaScriptFromString:@"reachability = true;"];
    }
    else {
        [self.webView stringByEvaluatingJavaScriptFromString:@"reachability = false;"];
    }
    
    [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"MenuObserver.set('version', '%@');", [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"]]];
    
    self->refreshTimer = [NSTimer scheduledTimerWithTimeInterval:600.0 target:self selector:@selector(refreshToken:) userInfo:nil  repeats:YES];
}

- (void) refreshToken:(NSTimer *)timer {
    [self.webView stringByEvaluatingJavaScriptFromString:@"RefreshToken();"];
}

//Trys to do a local login
- (void) localLogin: (NSString *) data {
    NSArray * details = [data componentsSeparatedByString:@"(QREFUPS)"];
    NSString * user = [details objectAtIndex:0];
    NSString * pass = [details objectAtIndex:1];
    
    NSString * storedPass = [SSKeychain passwordForService:@"com.qref.qrefChecklists" account:user];
    
    if([pass isEqualToString:storedPass]) {
        NSString * token = [SSKeychain passwordForService:@"com.qref.qrefChecklists" account:[user stringByAppendingString:@"-Token"]];
        
        NSString * userId = [SSKeychain passwordForService:@"com.qref.qrefChecklists" account:[user stringByAppendingString:@"-ID"]];
        
        [self->preferences setValue:token forKey:@"qrefToken"];
        [self->preferences setValue:userId forKey:@"qrefUserId"];
        [self->preferences setValue:user forKey:@"qrefUser"];
        
        
        //Update the javascript
        if(user != nil)
        {
            [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"UpdateLoginDisplay('%@');", user]];
        }
        
        if(token != nil)
        {
            [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"AppObserver.set('token', '%@');", token]];
        }
        
        //Try and get cached checklists
        NSThread  * thread = [[NSThread alloc] initWithTarget:self selector:@selector(signinFindCachedChecklists) object:nil];
        
        [thread start];
        
        [self->preferences synchronize];
    }
    else {
        [self.webView stringByEvaluatingJavaScriptFromString:@"InvalidSignin();"];
    }
}

//Sets the login info to keychain
- (void) setLogin: (NSString *) data {
    NSArray * details = [data componentsSeparatedByString:@"(QREFUPS)"];
    NSString * user = [details objectAtIndex:0];
    NSString * userId = [details objectAtIndex:1];
    NSString * pass = [details objectAtIndex:2];
    
    [SSKeychain setPassword:pass forService:@"com.qref.qrefChecklists" account:user];
    [SSKeychain setPassword:userId forService:@"com.qref.qreChecklists" account:[user stringByAppendingString:@"-ID"]];
}

//BKing API Additions
- (NSString *) decodeValue:(NSString *)value {
    NSString *baseDecoded = [[NSString alloc] initWithData: [QSStrings decodeBase64WithString:value] encoding:NSUTF8StringEncoding];

    return [baseDecoded stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
}

- (UIImage *) getCachedImage:(NSString *)url {
    NSString *file = url;
    NSArray *fileSegments = [file componentsSeparatedByString:@"/"];
    file = [fileSegments lastObject];
    NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
    NSFileManager *manager = [NSFileManager defaultManager];
    NSString *cachedFilePath = [cachePath stringByAppendingPathComponent:[NSString stringWithFormat:@"/qref/%@", file]];
    UIImage *image = nil;
    
    if([manager fileExistsAtPath:cachedFilePath])
    {
        image = [UIImage imageWithContentsOfFile:cachedFilePath];
    }
    else {
        if([file hasPrefix:@"productDetails"]) {
            @try {
                NSString *urlWithoutPrefix = [url stringByReplacingOccurrencesOfString:@"productDetails" withString:@""];
                NSString *serv = self->server;
                
                NSString *serverUrl = [serv stringByAppendingPathComponent:urlWithoutPrefix];
                
                NSURL *nsurl = [NSURL URLWithString:serverUrl];
                NSData *data = [NSData dataWithContentsOfURL:nsurl];
                image = [UIImage imageWithData:data];
                [data writeToFile:cachedFilePath atomically:YES];
            } @catch (NSException *e) {
                return nil;
            }
        }
        else if([file hasPrefix:@"checklistlisting"]) {
            @try {
                NSString *urlWithoutPrefix = [url stringByReplacingOccurrencesOfString:@"checklistlisting" withString:@""];
                NSString *serv = self->server;
                
                NSString *serverUrl = [serv stringByAppendingPathComponent:urlWithoutPrefix];
                
                NSURL *nsurl = [NSURL URLWithString:serverUrl];
                NSData *data = [NSData dataWithContentsOfURL:nsurl];
                image = [UIImage imageWithData:data];
                [data writeToFile:cachedFilePath atomically:YES];
            } @catch (NSException *e) {
                return nil;
            }
        }
    }
    
    return image;
}

@end
