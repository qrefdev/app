//
//  ImageDownloader.m
//  nsquared
//
//  Created by Aaron Klick on 3/30/13.
//  Copyright (c) 2013 Vantage Technic. All rights reserved.
//

#import "ImageDownloader.h"

@implementation ImageDownloader

- (void) download:(NSString *)url imageName: (NSString *) name {
    self->imageName = name;
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
        AsyncHttpRequest *request = [[AsyncHttpRequest alloc] initWithUrl:[NSURL URLWithString:url]];
        request.delegate = self;
        [request load];
    }];
}

- (void) dataReceived:(NSData *)contents fromUrl:(NSString *)url {
    @try {
        [self.delegate downloadComplete:contents imageName:self->imageName];
    }@catch (NSException *e) {
        NSLog(@"Error downloading image: %@", e.debugDescription);
    }
    
}

@end
