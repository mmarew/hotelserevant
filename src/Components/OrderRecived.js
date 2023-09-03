import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import { ConsumeContext } from "./ContextProvider";
function OrderRecived() {
  const [{ OrderRecivedItems }, SETORDER] = ConsumeContext();
  const [MyorderLength, setMyorderLength] = useState(0);
  useEffect(() => {
    let Counter = 0;
    OrderRecivedItems?.map((item) => {
      // console.log("item is ", JSON.parse(item.orderContent).length);
      Counter += JSON.parse(item.orderContent).length;
    });
    setMyorderLength(Counter);
  }, [OrderRecivedItems]);

  return (
    <>
      <center className="MyorderLength">
        <h3>You have recived {MyorderLength} items odrer</h3>
      </center>
      <br />
      {/* {console.log("menuItems", OrderRecivedItems)} */}
      {OrderRecivedItems?.map((item, index) => {
        // console.log(item.orderContent);

        return (
          <Menu
            tableNumber={OrderRecivedItems[index]?.tableNumber}
            key={"menuItems_" + index}
            menuItems={JSON.parse(item?.orderContent)}
            SOURCE={"ORDERRECIVED"}
            ORDEREDITEMS={OrderRecivedItems[index]}
          />
        );
      })}
    </>
  );
}
export default OrderRecived;
