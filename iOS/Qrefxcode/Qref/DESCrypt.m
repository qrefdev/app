//
//  DESCrypt.m
//  Qref
//
//  Created by Aaron Klick on 9/19/12.
//
//

#import "DESCrypt.h"

@implementation DESCrypt

+ (NSData *)crypt:(NSString *) data password:(NSString *)password {

    NSData *encodedData = [DESCrypt ccrypt:data key:password];
    
    if(encodedData != nil)
    {
        return encodedData;
    }
    else
    {
        return nil;
    }
}

+ (NSString *)decrypt:(NSData *)data password:(NSString *)password {
    
    NSData *decodedData = [DESCrypt cdecrypt:data key:password];
    
    if(decodedData != nil)
    {
        return [[NSString alloc] initWithData:decodedData encoding:NSUTF8StringEncoding];
    }
    else
    {
        return nil;
    }
}

+ (NSData *)ccrypt:(NSString *)data key:(NSString *)key {
    
    NSData *mKey = [key dataUsingEncoding:NSUTF8StringEncoding];
    NSData *mData = [data dataUsingEncoding:NSUTF8StringEncoding];
    
    size_t bufferPtrSize = 0;
    size_t movedBytes = 0;
    
    bufferPtrSize = ([mData length] + kCCBlockSizeDES);
    NSMutableData *buffer = [NSMutableData dataWithLength:bufferPtrSize];

    CCCryptorStatus ccStatus = CCCrypt(kCCEncrypt, kCCAlgorithmDES, kCCOptionPKCS7Padding | kCCOptionECBMode,[mKey bytes], kCCKeySizeDES, NULL, [mData bytes], [mData length], buffer.mutableBytes, bufferPtrSize, &movedBytes);
    
    if(ccStatus == kCCSuccess)
    {
        NSData *encryptedData = [[NSData alloc] initWithBytes:buffer.mutableBytes length:(NSInteger) movedBytes];
        
        return encryptedData;
    }
    else
    {
        return nil;
    }
}

+ (NSData *)cdecrypt:(NSData *)data key:(NSString *)key {
    NSData *mKey = [key dataUsingEncoding:NSUTF8StringEncoding];
    
    size_t bufferPtrSize = 0;
    size_t movedBytes = 0;
    
    bufferPtrSize = ([data length] + kCCBlockSizeDES);
    NSMutableData *buffer = [NSMutableData dataWithLength:bufferPtrSize];
    CCCryptorStatus ccStatus = CCCrypt(kCCDecrypt, kCCAlgorithmDES, kCCOptionPKCS7Padding | kCCOptionECBMode,[mKey bytes], kCCKeySizeDES, NULL, [data bytes], [data length], buffer.mutableBytes, bufferPtrSize, &movedBytes);
    
    if(ccStatus == kCCSuccess)
    {
        NSData *decryptedData = [[NSData alloc] initWithBytes:buffer.mutableBytes length:(NSInteger)movedBytes];
        
        return decryptedData;
    }
    else if(ccStatus == kCCDecodeError)
    {
        return nil;
    }
    else if(ccStatus == kCCParamError)
    {
        return nil;
    }
    else if(ccStatus == kCCBufferTooSmall)
    {
        return nil;
    }
    else if(ccStatus == kCCMemoryFailure)
    {
        return nil;
    }
    else if(ccStatus == kCCAlignmentError)
    {
        return nil;
    }
    else
    {
        return nil;
    }
}

@end
