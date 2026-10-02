import { useCameraPermission } from 'react-native-vision-camera';

export interface PermissionCamera {
  accordee: boolean;
  peutDemander: boolean;
  demander: () => Promise<boolean>;
}

/**
 * Enrobe `useCameraPermission` de `react-native-vision-camera`, qui délègue
 * déjà à `PermissionsAndroid` en interne sur Android (permission runtime
 * obligatoire depuis Android 6) et à `AVCaptureDevice` sur iOS.
 */
export function usePermissionCamera(): PermissionCamera {
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  return {
    accordee: hasPermission,
    peutDemander: canRequestPermission,
    demander: requestPermission,
  };
}
