#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AlarmManager, RCTEventEmitter)
RCT_EXTERN_METHOD(
  start:(NSString *)iso8601String
  soundName:(NSString *)soundName
  duration:(nonnull NSNumber *)duration
  vibrationEnabled:(nonnull NSNumber *)vibrationEnabled
  soundEnabled:(nonnull NSNumber *)soundEnabled
)
RCT_EXTERN_METHOD(stop)
@end