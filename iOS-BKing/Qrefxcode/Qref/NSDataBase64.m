//
//  NSDataBase64.m
//  Qref
//
//  Created by Aaron Klick on 9/19/12.
//
//

#import "NSDataBase64.h"

static char encodingTable[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; static char decodingTable[128];

@implementation NSData (Base64Add)

+ (NSData *) decodeBase64String:(NSString *)sdata {
    memset(decodingTable, 0, sizeof(decodingTable));
    for (NSInteger i = 0; i < sizeof(encodingTable); i++) {
        decodingTable[encodingTable[i]] = i;
    }
    const char *string = [sdata cStringUsingEncoding:NSASCIIStringEncoding];
    
    NSInteger inputLength = [sdata length];
    
    if (inputLength % 4 != 0) {
        return nil;
    }
    
    while (inputLength > 0 && string[inputLength - 1] == '=') {
        inputLength--;
    }
    
    NSInteger outputLength = inputLength * 3 / 4;
    NSMutableData *data = [NSMutableData dataWithLength:outputLength];
    uint8_t *output = data.mutableBytes;
    
    NSInteger inputPoint = 0;
    NSInteger outputPoint = 0;
    while (inputPoint < inputLength) {
        char i0 = string[inputPoint++];
        char i1 = string[inputPoint++];
        char i2 = inputPoint < inputLength ? string[inputPoint++] : 'A';
        char i3 = inputPoint < inputLength ? string[inputPoint++] : 'A';
        
        output[outputPoint++] = (decodingTable[i0] << 2) | (decodingTable[i1] >> 4);
        if (outputPoint < outputLength) {
            output[outputPoint++] = ((decodingTable[i1] & 0xf) << 4) | (decodingTable[i2] >> 2);
        }
        if (outputPoint < outputLength) {
            output[outputPoint++] = ((decodingTable[i2] & 0x3) << 6) | decodingTable[i3];
        }
    }
    
    return data;
}
@end
