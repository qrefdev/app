//
//  ImageDownloader.h
//  nsquared
//
//  Created by Aaron Klick on 3/30/13.
//  Copyright (c) 2013 Vantage Technic. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "AsyncHttpRequest.h"

@protocol ImageDownloaderDelegate <NSObject>

- (void) downloadComplete: (NSData *) imageData imageName: (NSString *) name;

@end

@interface ImageDownloader : NSObject<AsyncHttpRequestDelegate> {
    NSString *imageName;
}
@property (nonatomic, strong) NSObject<ImageDownloaderDelegate> *delegate;
- (void) download: (NSString *) url imageName: (NSString *) name;
@end
