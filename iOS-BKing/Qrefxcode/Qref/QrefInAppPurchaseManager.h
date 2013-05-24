//
//  QrefInAppPurchaseManager.h
//  Qref
//
//  Created by Aaron Klick on 9/19/12.
//
//

#import <Foundation/Foundation.h>
#import <StoreKit/StoreKit.h>

@protocol QrefAppPurchaseDelegate <NSObject>
@optional
- (void) completeTransaction: (SKPaymentTransaction *) transaction;
- (void) failedTransaction: (SKPaymentTransaction *) transaction;
- (void) canceledTransaction;
- (void) productRequest: (SKProduct *) product canPurchase:(BOOL) canPurchase;
@end


@interface QrefInAppPurchaseManager : NSObject <SKProductsRequestDelegate, SKPaymentTransactionObserver>

@property (nonatomic, strong) id <QrefAppPurchaseDelegate> delegate;

- (void) requestProduct: (NSString *) productId;
- (void) productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response;
- (void) paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions;
- (void) completeTransaction: (SKPaymentTransaction *)  transaction;
- (void) restoreTransaction: (SKPaymentTransaction *) transaction;
- (void) failedTransaction: (SKPaymentTransaction *) transaction;
- (void) startTransaction: (SKProduct *) product;

- (void) finishTransaction: (SKPaymentTransaction *) transaction;

- (void) setDelegate:(id<QrefAppPurchaseDelegate>)delegate;

@end
