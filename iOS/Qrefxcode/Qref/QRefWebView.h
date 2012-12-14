//
//  QRefWebView.h
//  Qref
//
//  Created by Aaron Klick on 9/17/12.
//
//

#import <UIKit/UIKit.h>
#import "QrefInAppPurchaseManager.h"
#import "DESCrypt.h"

@interface QRefWebView : UIViewController <UIWebViewDelegate, QrefAppPurchaseDelegate> {
    UIWebView *webView;
    NSUserDefaults *preferences;
    QrefInAppPurchaseManager *purchaseManager;
    NSMutableString *incomingData;
    NSString *server;
}

- (void) gotoURL: (NSURLRequest *) url;
- (void) onload;
- (void) saveChecklists: (NSString *) checklists;

- (void) completeTransaction:(SKPaymentTransaction *)transaction;
- (void) failedTransaction:(SKPaymentTransaction *)transaction;
- (void) productRequest:(SKProduct *)product canPurchase:(BOOL)canPurchase;
- (void) canceledTransaction;
- (void) loadChecklist: (NSString *) user checklists: (NSData *) checklistData uid: (NSString *) UID;
- (void) hasImageInCache: (NSString *) imageJSON;

@end
