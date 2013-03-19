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
        
        CGRect bounds = [[UIScreen mainScreen] bounds];
        CGFloat screenScale = [[UIScreen mainScreen] scale];
        
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
        
        self->imageView = [[UIImageView alloc] initWithImage:self->startUpImage];
        [self->imageView setContentMode:UIViewContentModeScaleAspectFill];
        
        self->webView = [[UIWebView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
        self->webView.delegate = self;
        
        [self->webView setBackgroundColor:[UIColor clearColor]];
        //[self setView:self->webView];
        
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
    }
   return self;
}

- (void) reachabilityChanged:(NSNotification *) notif {
    Reachability * rch = [notif object];
    
    if([rch isReachable]) {
        [self->webView stringByEvaluatingJavaScriptFromString:@"reachability = true;"];
    }
    else {
        [self->webView stringByEvaluatingJavaScriptFromString:@"reachability = false;"];
    }
}

- (void) keyboardShown: (NSNotification *) notif {
    CGSize keyboardSize = [[[notif userInfo] objectForKey:UIKeyboardFrameBeginUserInfoKey] CGRectValue].size;
    
    [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat: @"keyboardShown(%.2f, %.2f);", keyboardSize.height, self->webView.frame.size.height]];
}

- (void) keyboardHidden: (NSNotification *) notif {
    [self->webView stringByEvaluatingJavaScriptFromString:@"keyboardHidden();"];
}


- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}

- (void) dealloc {
    self->webView = nil;
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
    [self->webView loadRequest:url];
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
        
        BOOL somethingChanged = NO;
        
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
                    somethingChanged = YES;
                }
                else if([key isEqualToString:@"imageCache"])
                {
                    if(value != nil)
                    {
                        //to prevent internal caching of webpages in application
                        NSURLCache *sharedCache = [[NSURLCache alloc] initWithMemoryCapacity:0 diskCapacity:0 diskPath:nil];
                        [NSURLCache setSharedURLCache:sharedCache];
                        sharedCache = nil;
                        [self hasImageInCache: value];
                    }
                }
                //Save Checklist
                else if([key isEqualToString:@"sc"]) {
                    if(value != nil) {
                        [self saveChecklist:value];
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
                    somethingChanged = YES;
                }
                else if([key isEqualToString:@"daytheme"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"DayTheme"];
                        somethingChanged = YES;
                    }
                }
                else if([key isEqualToString:@"nighttheme"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"NightTheme"];
                        somethingChanged = YES;
                    }
                }
                else if([key isEqualToString:@"autotheme"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"AutoSwitch"];
                        somethingChanged = YES;
                    }
                }
                else if([key isEqualToString:@"nighttimemodetime"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"NightTimeModeTime"];
                        somethingChanged = YES;
                    }
                }
                else if([key isEqualToString:@"nighttimemodetimeoff"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"NightTimeModeTimeOff"];
                        somethingChanged = YES;
                    }
                }
                else if([key isEqualToString:@"setToken"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"Token"];
                        somethingChanged = YES;
                    }
                }
                else if([key isEqualToString:@"setUser"])
                {
                    if(value != nil)
                    {
                        [self->preferences setValue:value forKey:@"User"];
                        somethingChanged = YES;
                    }
                }
                else if([key isEqualToString:@"clearToken"])
                {
                    [self->preferences setValue:@"" forKey:@"Token"];
                    somethingChanged = YES;
                }
                else if([key isEqualToString:@"clearUser"])
                {
                    [self->preferences setValue:@"" forKey:@"User"];
                    [self->preferences setValue:@"" forKey:@"Checklists"];
                    somethingChanged = YES;
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
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat: @"SendReceipt('%@');", base64Receipt]];
        base64Receipt = nil;
    }
}

- (void) failedTransaction:(SKPaymentTransaction *)transaction {
    [self->webView stringByEvaluatingJavaScriptFromString:@"PurchaseFailed();"];
}

- (void) canceledTransaction {
    [self->webView stringByEvaluatingJavaScriptFromString:@"PurchaseCanceled();"];
}

- (void) hasImageInCache:(NSString *)imageJSON {
    NSArray *array = [imageJSON componentsSeparatedByString:@";"];
    
        NSString *undefinedCheck = [array objectAtIndex:0];
        if(![undefinedCheck isEqualToString:@"undefined"])
        {
            NSString *file = [array objectAtIndex:0];
            NSString *fileType = [array objectAtIndex:2];
            NSArray *fileSegments = [file componentsSeparatedByString:@"/"];
            file = [fileSegments lastObject];
            NSString *resourcePath = [[NSBundle mainBundle] resourcePath];
            NSString *resourceFilePath = [resourcePath stringByAppendingString:[NSString stringWithFormat:@"/%@", [array objectAtIndex:0]]];
            NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
            NSFileManager *manager = [NSFileManager defaultManager];
            NSString *cachedFilePath = [cachePath stringByAppendingString:[NSString stringWithFormat:@"/qref/%@", [fileType stringByAppendingString: file]]];
            //NSURL *url = [NSURL fileURLWithPath:cachedFilePath];
        
            if([manager fileExistsAtPath:resourceFilePath])
            {
                [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"PushImage('%@');", imageJSON]];
            }
            else if([manager fileExistsAtPath:cachedFilePath])
            {
                NSString *imageInfo = cachedFilePath;
                imageInfo = [NSString stringWithFormat:@"%@;%@;%@",imageInfo,[array objectAtIndex:1],[array objectAtIndex:2]];
                [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"PushImage('%@');", imageInfo]];
                imageInfo = nil;
            }
            else
            {
                NSString *serv = self->server;
                NSURL *serverUrl = [NSURL URLWithString:[serv stringByAppendingString:[array objectAtIndex:0]]];
        
                NSData *imageData = [[NSData alloc] initWithContentsOfURL:serverUrl];

                if(imageData.length > 0)
                {
                    @try {
                        //UIImage *image = [UIImage imageWithData:imageData];
                        
                        if([manager fileExistsAtPath:[cachePath stringByAppendingString:@"/qref"]] == NO)
                        {
                            NSError *__autoreleasing * directoryError;
                            if(![manager createDirectoryAtPath:[cachePath stringByAppendingString:@"/qref"] withIntermediateDirectories:NO attributes:nil error:directoryError])
                            {
                                NSLog(@"Error creating directory %@", [cachePath stringByAppendingString:@"/qref"]);
                            }
                        
                        }
                        
                        BOOL ok = [manager createFileAtPath:cachedFilePath contents:nil attributes:nil];
                        
                        if (!ok) {
                            NSLog(@"Error creating file %@", cachedFilePath);
                        } else {
                            NSFileHandle* myFileHandle = [NSFileHandle fileHandleForWritingAtPath:cachedFilePath];
                            [myFileHandle writeData:imageData];
                            [myFileHandle closeFile];
                            myFileHandle = nil;
                        }
                    
                        NSString *imageInfo = cachedFilePath;
                        imageInfo = [NSString stringWithFormat:@"%@;%@;%@",imageInfo,[array objectAtIndex:1],[array objectAtIndex:2]];
                    
                        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"PushImage('%@');", imageInfo]];
                        
                        imageInfo = nil;
                    }
                    @catch (NSException *exception) {
                    
                    }
                    @finally {
                    
                    }
                }
                
                imageData = nil;
                serverUrl = nil;
                serv = nil;
            }
            
            cachedFilePath = nil;
            manager = nil;
            resourceFilePath = nil;
            resourcePath = nil;
            cachePath = nil;
            file = nil;
            fileSegments = nil;
            fileType = nil;
            
        }
    
    undefinedCheck = nil;
    array = nil;
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
            [self->webView stringByEvaluatingJavaScriptFromString:@"InvalidProduct();"];
        }
    }
    else
    {
        [self->webView stringByEvaluatingJavaScriptFromString:@"CannotPurchase();"];
    }
}

/*- (void) saveChecklists: (NSString *) checklists {
    NSString *UID = [self->preferences stringForKey:@"UID"];
    NSString *user = [self->preferences stringForKey:@"User"];
    
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

- (void) saveChecklist:(NSString *) checklist {
    NSString *UID = [self->preferences stringForKey:@"UID"];
    NSString *user = [self->preferences stringForKey:@"User"];
    
    NSArray * items = [checklist componentsSeparatedByString:@"-FN-"];
    
    if(items.count == 2) {
        NSString *file = [items objectAtIndex:0];
        NSString *content = [items objectAtIndex:1];
        
        if(UID != nil && user != nil && content != nil)
        {
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
            NSString *cachedFilePath = [cachePath stringByAppendingString:[NSString stringWithFormat:@"/qref/%@", file]];
            
            if([manager fileExistsAtPath:[cachePath stringByAppendingString:@"/qref"]] == NO)
            {
                NSError *__autoreleasing * directoryError;
                if(![manager createDirectoryAtPath:[cachePath stringByAppendingString:@"/qref"] withIntermediateDirectories:NO attributes:nil error:directoryError])
                {
                    NSLog(@"Error creating directory %@", [cachePath stringByAppendingString:@"/qref"]);
                }
                
            }
            
            BOOL ok = [manager createFileAtPath:cachedFilePath contents:nil attributes:nil];
            
            if(ok) {
                NSFileHandle* myFileHandle = [NSFileHandle fileHandleForWritingAtPath:cachedFilePath];
                [myFileHandle writeData:encryptedData];
                [myFileHandle closeFile];
                myFileHandle = nil;
            }
            
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
    
    items = nil;
    user = nil;
    UID = nil;
}

- (void) findCachedChecklists {
    NSString *cachePath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
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
            NSData * contents = [manager contentsAtPath:[cachePath stringByAppendingString:[NSString stringWithFormat:@"/qref/%@", [cached objectAtIndex:i]]]];
            
            [self loadChecklist:contents];
            contents = nil;
        }
    }
    
    cachePath = nil;
    manager = nil;
    cached = nil;
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->webView stringByEvaluatingJavaScriptFromString:@"DataLoaded();"];
        CGRect bounds = [[UIScreen mainScreen] bounds];
        
        [self setView:self->webView];
        [self->webView setFrame: CGRectMake(0, 18, bounds.size.width, bounds.size.height - 18)];
        [[UIApplication sharedApplication] setStatusBarHidden:NO];
        
        [self->imageView removeFromSuperview];
        self->imageView = nil;
        
        self->startUpImage = nil;
    });
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
    NSString *user = [preference stringForKey:@"User"];
    NSString *UID = [preference stringForKey:@"UID"];
    
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
                [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"AppendChecklist('%@');", decryptedChecklistData]];
            });
        }
    }
}
/*
- (void) loadChecklist {
    NSUserDefaults * preference = [NSUserDefaults standardUserDefaults];
    NSString *user = [preference stringForKey:@"User"];
    NSString *UID = [preference stringForKey:@"UID"];
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
                            [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
                        });
                       // [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
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
                            [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
                        });
                        //[self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", chunk]];
                    }
                }
            }
            else
            {
                [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"LoadChecklistPacket('%@');", decryptedChecklistData]];
            }
        }
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->webView stringByEvaluatingJavaScriptFromString:@"DataLoaded();"];
        CGRect bounds = [[UIScreen mainScreen] bounds];
        [self setView:self->webView];
        [self->webView setFrame: CGRectMake(0, 18, bounds.size.width, bounds.size.height - 18)];
        [[UIApplication sharedApplication] setStatusBarHidden:NO];
    });
}*/

- (void) onload {
    
    NSString *nightTimeModeTime = [self->preferences stringForKey:@"NightTimeModeTime"];
    NSString *nightTimeModeTimeOff = [self->preferences stringForKey:@"NightTimeModeTimeOff"];
    NSString *nightTheme = [self->preferences stringForKey:@"NightTheme"];
    NSString *dayTheme = [self->preferences stringForKey:@"DayTheme"];
    NSString *autoSwitch = [self->preferences stringForKey:@"AutoSwitch"];
    NSString *user = [self->preferences stringForKey:@"User"];
    NSString *token = [self->preferences stringForKey:@"Token"];
    NSString *UID = [self->preferences stringForKey:@"UID"];
    
    NSString * jsCallBack = @"window.getSelection().removeAllRanges();";
    [self->webView stringByEvaluatingJavaScriptFromString:jsCallBack];
    
    if(UID == nil)
    {
        CFUUIDRef ref = CFUUIDCreate(CFAllocatorGetDefault());
        
        NSString *uid = CFBridgingRelease(CFUUIDCreateString(CFAllocatorGetDefault(), ref));
        
        CFRelease(ref);
        
        [self->preferences setObject:uid forKey:@"UID"];
        
        UID = uid;
    }
    
    if(user != nil)
    {
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"UpdateLoginDisplay('%@');", user]];
    }
    
    if(token != nil)
    {
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"AppObserver.set('token', '%@');", token]];
    }
    
    NSThread  * thread = [[NSThread alloc] initWithTarget:self selector:@selector(findCachedChecklists) object:nil];
    
    [thread start];
    
    if(nightTimeModeTime != nil)
    {
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"NightTimeModeTime = '%@';", nightTimeModeTime]];
    }
    
    if(nightTimeModeTimeOff != nil)
    {
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"NightTimeModeTimeOff = '%@';", nightTimeModeTimeOff]];
    }
    
    if(nightTheme != nil)
    {
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"NightTheme = '%@';", nightTheme]];
    }
    
    if(dayTheme != nil)
    {
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"DayTheme = '%@';", dayTheme]];
    }
    
    if(autoSwitch != nil)
    {
        [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"AutoSwitch = '%@';", autoSwitch]];
    }
    
    [self->webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"MenuObserver.set('version', '%@');", [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"]]];
    
    self->refreshTimer = [NSTimer scheduledTimerWithTimeInterval:600.0 target:self selector:@selector(refreshToken:) userInfo:nil  repeats:YES];
}

- (void) refreshToken:(NSTimer *)timer {
    [self->webView stringByEvaluatingJavaScriptFromString:@"RefreshToken();"];
}

@end
