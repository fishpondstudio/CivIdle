import "cordova-plugin-purchase";
import { UserAttributes } from "../../../shared/utilities/Database";
import { setFlag } from "../../../shared/utilities/Helper";
import { client, getUser } from "../rpc/RPCClient";
import { showModal, showToast } from "../ui/GlobalModal";
import { SupporterPackModal } from "../ui/SupporterPackModal";

let _product: CdvPurchase.Product | undefined;

export function getProduct() {
   return _product;
}

export function initIAP() {
   if (!CdvPurchase || !CdvPurchase.store) {
      return;
   }

   CdvPurchase.store.register({
      id: "cividle_dlc1",
      type: CdvPurchase.ProductType.NON_CONSUMABLE,
      platform: CdvPurchase.Platform.GOOGLE_PLAY,
   });

   CdvPurchase.store.register({
      id: "cividle_dlc1",
      type: CdvPurchase.ProductType.NON_CONSUMABLE,
      platform: CdvPurchase.Platform.APPLE_APPSTORE,
   });

   CdvPurchase.store.error((error) => {
      showToast(error.message);
   });

   CdvPurchase.store
      .when()
      .productUpdated(verifyProduct)
      .approved((transaction) => {
         transaction.finish();
      })
      .finished((_transaction) => {
         const product = CdvPurchase.store.get("cividle_dlc1");
         if (product) {
            verifyProduct(product);
         }
         showModal(<SupporterPackModal />);
      });

   CdvPurchase.store.initialize();
}

function verifyProduct(product: CdvPurchase.Product): void {
   if (product.id === "cividle_dlc1") {
      _product = product;
      const receipt = CdvPurchase.store.findInLocalReceipts(product);
      if (receipt && receipt.state === CdvPurchase.TransactionState.FINISHED) {
         client.verifyReceipt(receipt.transactionId);
         const user = getUser();
         if (user) {
            user.attr = setFlag(user.attr, UserAttributes.DLC1);
         }
      } else {
         client.verifyReceipt();
      }
   }
}

export async function purchaseSupporterPack() {
   const product = CdvPurchase.store.get("cividle_dlc1");
   if (product) {
      console.log(product.owned);
      try {
         await product.getOffer()?.order();
      } catch (error) {
         showToast(String(error));
         console.error(error);
      }
   }
}

export async function restorePurchases(): Promise<void> {
   try {
      await CdvPurchase.store.restorePurchases();
   } catch (error) {
      showToast(String(error));
      console.error(error);
   }
}
