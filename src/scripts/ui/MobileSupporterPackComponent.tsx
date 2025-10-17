import { UserAttributes } from "../../../shared/utilities/Database";
import { hasFlag } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useUser } from "../rpc/RPCClient";
import { getProduct, purchaseSupporterPack, restorePurchases } from "../utilities/IAP";
import { MiscTextureComponent } from "./TextureSprites";

export function MobileSupporterPackComponent(): React.ReactNode {
   const product = getProduct();
   const user = useUser();
   if (hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.DLC1)) return null;
   if (!product?.canPurchase) return null;
   if (product.owned) {
      return (
         <div className="row mt5 g5 inset-shallow p5">
            <div>{t(L.SupporterPack)}</div>
            <MiscTextureComponent name="Supporter" scale={0.17} />
            <div className="f1" />
            <div className="m-icon small text-green">check_circle</div>
         </div>
      );
   }
   return (
      <>
         <button className="mt5 w100 row g5" onClick={() => purchaseSupporterPack()}>
            {t(L.BuySupporterPack)}
            <MiscTextureComponent name="Supporter" scale={0.17} />
            <div className="f1" />
            {product.pricing ? ` ${product.pricing.price}` : null}
         </button>
         <button className="w100 row g5" onClick={() => restorePurchases()}>
            {t(L.RestorePurchases)}
            <div className="f1" />
            <div className="m-icon small">restore</div>
         </button>
      </>
   );
}
