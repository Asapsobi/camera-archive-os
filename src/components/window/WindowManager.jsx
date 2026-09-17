import { useWindowStore } from "../../store/windowStore";
import Window from "./Window";
import MyComputerApp from "../layout/MyComputerApp";
import InternetApp from "../layout/InternetApp";
import CameraArchiveApp from "../catalog/CameraArchiveApp";
import ProductDetailApp from "../product/ProductDetailApp";
import WishlistApp from "../product/WishlistApp";
import CartApp from "../cart/CartApp";
import CheckoutApp from "../checkout/CheckoutApp";
import OrderResultApp from "../checkout/OrderResultApp";
import ReadmeApp from "../readme/ReadmeApp";
import RecycleBinApp from "../recyclebin/RecycleBinApp";
import TimelineApp from "../timeline/TimelineApp";
import TerminalApp from "../mystery/TerminalApp";
import Error404App from "../mystery/Error404App";
import MysteryFolderApp from "../mystery/MysteryFolderApp";
import ChatApp from "../mystery/ChatApp";
import ContactApp from "../contact/ContactApp";
import SpecGuideApp from "../product/SpecGuideApp";

const REGISTRY = {
  mycomputer: MyComputerApp,
  internet: InternetApp,
  archive: CameraArchiveApp,
  product: ProductDetailApp,
  wishlist: WishlistApp,
  cart: CartApp,
  checkout: CheckoutApp,
  orderResult: OrderResultApp,
  readme: ReadmeApp,
  recyclebin: RecycleBinApp,
  timeline: TimelineApp,
  terminal: TerminalApp,
  error404: Error404App,
  mysteryfolder: MysteryFolderApp,
  chat: ChatApp,
  contact: ContactApp,
  specguide: SpecGuideApp,
};

export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const topKey = useWindowStore((s) => s.topWindowKey());

  return (
    <>
      {windows.map((win) => {
        const Comp = REGISTRY[win.type];
        if (!Comp) return null;
        return (
          <Window key={win.key} win={win} isTop={win.key === topKey}>
            <Comp winKey={win.key} {...win.props} />
          </Window>
        );
      })}
    </>
  );
}
