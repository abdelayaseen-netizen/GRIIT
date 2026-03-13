declare module "@react-native-community/netinfo" {
  interface NetInfoState {
    isConnected?: boolean | null;
  }
  const NetInfo: {
    addEventListener: (listener: (state: NetInfoState) => void) => () => void;
  };
  export default NetInfo;
}
