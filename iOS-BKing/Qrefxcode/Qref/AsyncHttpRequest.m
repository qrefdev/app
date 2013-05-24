//
//  AsyncHttpRequest.m
//  nsquared
//
//  Created by Aaron Klick on 3/30/13.
//  Copyright (c) 2013 Vantage Technic. All rights reserved.
//

#import "AsyncHttpRequest.h"

static NSArray *userAgents;

@implementation AsyncHttpRequest
- (id) initWithUrl:(NSURL *)location {
    self = [super init];
    if(self) {
        self->url = location;
        
        if(userAgents == nil) {
            [self initUserAgents];
        }
    }
    return self;
}

- (void) initUserAgents {
    NSString *agentList = [NSString stringWithContentsOfFile:@"useragents.txt" encoding:NSUTF8StringEncoding error:nil];
    userAgents = [agentList componentsSeparatedByString:@"\r\n"];
}

- (NSString *) randomAgent {
    int item = round(arc4random() * userAgents.count);
    
    return [userAgents objectAtIndex:item];
}

- (void) load {
    self.responseData = [[NSMutableData alloc] init];
    
    NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:self->url cachePolicy:NSURLCacheStorageAllowed timeoutInterval:1500];
    [request setValue:[self randomAgent] forHTTPHeaderField:@"User-Agent"];
    self->connection = [NSURLConnection connectionWithRequest:request delegate:self];
    [self->connection start];
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response {    
    [self.responseData setLength:0];
}

- (void) connection:(NSURLConnection *)connection didReceiveData:(NSData *)data {
    [self.responseData appendData:data];
}

- (void) connectionDidFinishLoading:(NSURLConnection *)connection {
    if(self.delegate != nil) {
        if(self.responseData.length > 0) {
            [self.delegate dataReceived:self.responseData fromUrl:[self->url absoluteString]];
        }
    }
}

@end
