import { Preferences } from "@capacitor/preferences";
import "cordova-plugin-purchase";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { UserAttributes } from "../../../shared/utilities/Database";
import { clearFlag, setFlag } from "../../../shared/utilities/Helper";
import { client, getUser } from "../rpc/RPCClient";
import { showModal, showToast } from "../ui/GlobalModal";
import { SupporterPackModal } from "../ui/SupporterPackModal";

let _product: CdvPurchase.Product | undefined;

export function getProduct() {
   return _product;
}

const ProductId = "cividle_dlc1";
const TransactionId = "CivIdleSupporterPackTransactionId";

export function initIAP() {
   if (!CdvPurchase || !CdvPurchase.store) {
      return;
   }

   CdvPurchase.store.register({
      id: ProductId,
      type: CdvPurchase.ProductType.NON_CONSUMABLE,
      platform: CdvPurchase.Platform.GOOGLE_PLAY,
   });

   CdvPurchase.store.register({
      id: ProductId,
      type: CdvPurchase.ProductType.NON_CONSUMABLE,
      platform: CdvPurchase.Platform.APPLE_APPSTORE,
   });

   CdvPurchase.store.error((error) => {
      showToast(error.message);
   });

   CdvPurchase.store
      .when()
      .productUpdated((product) => {
         if (product.id === ProductId) {
            _product = product;
         }
      })
      .approved((transaction) => {
         _product = CdvPurchase.store.get(ProductId);
         if (transaction.products.some((p) => p.id === ProductId)) {
            transaction.finish();
            setPurchased(true);
            showPurchaseModal();
            client.verifyReceipt(transaction.transactionId);
            Preferences.set({ key: TransactionId, value: transaction.transactionId });
         }
      })
      .receiptUpdated(async (receipt) => {
         _product = CdvPurchase.store.get(ProductId);
         const transactionId = (await Preferences.get({ key: TransactionId })).value;
         if (transactionId) {
            setPurchased(true);
            client.verifyReceipt(transactionId);
         } else if (CdvPurchase.store.owned(ProductId)) {
            setPurchased(true);
            for (const t of receipt.transactions) {
               client.verifyReceipt(t.transactionId);
            }
         } else {
            setPurchased(false);
            client.verifyReceipt();
         }
      });

   CdvPurchase.store.initialize();
}

function setPurchased(purchased: boolean): void {
   getGameOptions().supporterPackPurchased = purchased;
   const user = getUser();
   if (user) {
      user.attr = purchased
         ? setFlag(user.attr, UserAttributes.DLC1)
         : clearFlag(user.attr, UserAttributes.DLC1);
   }
}

function showPurchaseModal(): void {
   if (getGameOptions().supporterPackPurchased) return;
   showModal(<SupporterPackModal />);
}

export async function purchaseSupporterPack() {
   const product = CdvPurchase.store.get(ProductId);
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
