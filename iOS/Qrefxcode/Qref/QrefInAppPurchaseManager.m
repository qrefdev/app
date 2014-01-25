//
//  QrefInAppPurchaseManager.m
//  Qref
//
//  Created by Aaron Klick on 9/19/12.
//
//

#import "QrefInAppPurchaseManager.h"

@implementation QrefInAppPurchaseManager

@synthesize delegate = _delegate;

- (id) init {
    self = [super init];
    
    return self;
}

- (void) setDelegate:(id<QrefAppPurchaseDelegate>)kDelegate {
    self->_delegate = kDelegate;
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
}

- (void) requestProduct:(NSString *)productId {
    SKProductsRequest *request= [[SKProductsRequest alloc] initWithProductIdentifiers: [NSSet setWithObject: productId]];
    
    request.delegate = self;
    
    [request start];
}

- (void) productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
    if(self.delegate)
    {
        if([SKPaymentQueue canMakePayments])
        {
            NSArray *products = response.products;
            
            if([products count] == 1)
            {
                SKProduct * product = [products objectAtIndex:0];
                
                [self.delegate productRequest:product canPurchase:YES];
            }
            else
            {
                [self.delegate productRequest:nil canPurchase:YES];
            }
        }
        else
        {
            [self.delegate productRequest:nil canPurchase:NO];
        }
    }
}

- (void) restoreAll {
    [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
}

- (void) startTransaction: (SKProduct *) product {
    SKPayment *payment = [SKPayment paymentWithProduct:product];
    [[SKPaymentQueue defaultQueue] addPayment:payment];
}

- (void) paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions {
    for (SKPaymentTransaction *transaction in transactions)
    {
        switch (transaction.transactionState)
        {
            case SKPaymentTransactionStatePurchased:
                [self completeTransaction:transaction];
                break;
            case SKPaymentTransactionStateFailed:
                [self failedTransaction:transaction];
                break;
            case SKPaymentTransactionStateRestored:
                [self restoreTransaction:transaction];
                break;
            default:
                break;
        }
    }
}

- (void) completeTransaction:(SKPaymentTransaction *)transaction {
    if(self.delegate)
    {
        [self.delegate completeTransaction:transaction];
        [self finishTransaction:transaction];
    }
}

- (void) restoreTransaction:(SKPaymentTransaction *)transaction {
    if(self.delegate)
    {
        //[self.delegate completeTransaction:transaction.originalTransaction];
        [self finishTransaction:transaction];
    }
}

- (void) paymentQueue:(SKPaymentQueue *)queue restoreCompletedTransactionsFailedWithError:(NSError *)error {
    if(self.delegate) {
        [self.delegate restoreCompletedTransactions:NO];
    }
}

- (void) paymentQueueRestoreCompletedTransactionsFinished:(SKPaymentQueue *)queue {
    
    if(self.delegate) {
        [self.delegate restoreCompletedTransactions:YES];
    }
    
}

- (void) failedTransaction:(SKPaymentTransaction *)transaction {
    if (transaction.error.code != SKErrorPaymentCancelled)
    {
        if(self.delegate)
        {
            [self.delegate failedTransaction:transaction];
            [self finishTransaction:transaction];
        }
    }
    else
    {
        if(self.delegate)
        {
            [self.delegate canceledTransaction];
        }
        // this is fine, the user just cancelled, so don’t notify
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
    }
}

- (void) finishTransaction:(SKPaymentTransaction *)transaction {
    [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
}

- (void) dealloc {
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}

@end
