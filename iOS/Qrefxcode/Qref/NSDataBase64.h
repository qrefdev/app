//
//  NSDataBase64.h
//  Qref
//
//  Created by Aaron Klick on 9/19/12.
//
//

#import <Foundation/Foundation.h>

@interface NSData (Base64Add)
+ (NSData *) decodeBase64String: (NSString *)data;
@end
