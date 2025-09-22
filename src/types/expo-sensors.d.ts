declare module 'expo-sensors' {
  export namespace Pedometer {
    type StepCountResult = { steps: number }
    type PermissionStatus = 'granted' | 'denied' | 'undetermined'
    type PermissionResponse = { status: PermissionStatus }

    function isAvailableAsync(): Promise<boolean>
    function requestPermissionsAsync(): Promise<PermissionResponse>
    function getStepCountAsync(start: Date, end: Date): Promise<StepCountResult>
  }
}
