//
//  NSStringBase64.h
//  Qref
//
//  Created by Aaron Klick on 9/19/12.
//
//

#import <Foundation/Foundation.h>

@interface NSString (Base64Add)
+ (NSString *) base64StringFromData: (NSData *)data;
@end
