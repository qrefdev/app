//
//  AsyncHttpRequest.h
//  nsquared
//
//  Created by Aaron Klick on 3/30/13.
//  Copyright (c) 2013 Vantage Technic. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol AsyncHttpRequestDelegate <NSObject>

- (void) dataReceived: (NSData *) contents fromUrl: (NSString *) url;

@end

@interface AsyncHttpRequest : NSObject <NSURLConnectionDelegate,NSURLConnectionDataDelegate> {
    NSURL * url;
    NSURLConnection *connection;
}

@property (nonatomic, strong) NSMutableData *responseData;
@property (nonatomic, strong) NSObject<AsyncHttpRequestDelegate> *delegate;

- (id) initWithUrl: (NSURL *) location;
- (void) load;

@end
