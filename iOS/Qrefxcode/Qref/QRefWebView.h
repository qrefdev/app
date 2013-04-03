//
//  QRefWebView.h
//  Qref
//
//  Created by Aaron Klick on 9/17/12.
//
//

#import <UIKit/UIKit.h>
#import "Reachability.h"
#import "QrefInAppPurchaseManager.h"
#import "DESCrypt.h"
#import "SSKeychain.h"
#import "ImageDownloader.h"

@interface QRefWebView : UIViewController <UIWebViewDelegate, QrefAppPurchaseDelegate, ImageDownloaderDelegate> {
    UIWebView *webView;
    NSUserDefaults *preferences;
    QrefInAppPurchaseManager *purchaseManager;
    NSMutableString *incomingData;
    NSString *server;
    NSTimer *refreshTimer;
    UIImage *startUpImage;
    UIImageView *imageView;
    Reachability * reach;
}

@property (nonatomic, strong) NSOperationQueue *imageQueue;

- (void) gotoURL: (NSURLRequest *) url;
- (void) onload;
//- (void) saveChecklists: (NSString *) checklists;

- (void) completeTransaction:(SKPaymentTransaction *)transaction;
- (void) failedTransaction:(SKPaymentTransaction *)transaction;
- (void) productRequest:(SKProduct *)product canPurchase:(BOOL)canPurchase;
- (void) canceledTransaction;
//- (void) loadChecklist;
- (void) hasImageInCache: (NSString *) imageJSON;
- (void) refreshToken: (NSTimer *) timer;

@end
