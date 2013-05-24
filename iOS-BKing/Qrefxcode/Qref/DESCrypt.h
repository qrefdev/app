//
//  DESCrypt.h
//  Qref
//
//  Created by Aaron Klick on 9/19/12.
//
//

#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonCrypto.h>
#import <CommonCrypto/CommonDigest.h>
#import <CommonCrypto/CommonCryptor.h>
#import "QSUtilities.h"

@interface DESCrypt : NSObject

+ (NSData *) crypt: (NSString *) data password: (NSString *) password;
+ (NSString *) decrypt: (NSData *) data password: (NSString *) password;

+ (NSData *) ccrypt: (NSString *) data key: (NSString *) key;
+ (NSData *) cdecrypt: (NSData *) data key: (NSString *) key;

@end
