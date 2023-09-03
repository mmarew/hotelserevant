import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import { ConsumeContext } from "./ContextProvider";
function OrderRequested() {
  const [{ OrderMenuItems }, SETORDER] = ConsumeContext();
  const [MyorderLength, setMyorderLength] = useState(0);
  useEffect(() => {
    let Counter = 0;
    OrderMenuItems?.map((item) => {
      // console.log("item is ===", JSON.parse(item.orderContent));
      Counter += JSON.parse(item.orderContent).length;
    });
    setMyorderLength(Counter);
  }, [OrderMenuItems]);

  return (
    <>
      <center className="MyorderLength">
        <h3>You have sent {MyorderLength} items order</h3>
      </center>
      <br />
      {OrderMenuItems?.map((item, index) => {
        return (
          <Menu
            tableNumber={OrderMenuItems[index]?.tableNumber}
            key={"menuItems_" + index}
            menuItems={JSON.parse(item.orderContent)}
            SOURCE={"ORDER"}
            ORDEREDITEMS={OrderMenuItems[index]}
            // getOrderItems={getItems}
          />
        );
      })}
    </>
  );
}
export default OrderRequested;
