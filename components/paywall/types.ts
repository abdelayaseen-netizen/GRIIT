import type { ListRenderItem } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";

export type PaywallVariant = "control" | "social_proof";

export type PaywallBodyProps = {
  loading: boolean;
  packages: PurchasesPackage[];
  selectedPackage: PurchasesPackage | null;
  purchasing: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  onClose: () => void;
  onCta: () => void;
  onRestore: () => void;
  renderPlanItem: ListRenderItem<PurchasesPackage>;
  selectedTitle: string;
  selectedPrice: string;
  cancelNote: string;
  insetsBottom: number;
};
