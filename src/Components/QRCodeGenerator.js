import React from "react";
import QRCode from "qrcode.react";

const QRCodeGenerator = () => {
  let businessName = localStorage.getItem("BuseinessName");
  if (businessName == null) {
    businessName = "";
  }
  // alert("businessName" + businessName);
  const webAddress = `${process.env.REACT_APP_PATH_OF_CLIENT}/Business/${businessName}`;
  return (
    <div
      style={{
        display: "flex",
        padding: "10%",
        margin: "auto",
        width: "75%",
        maxWidth: "400px",
        flexDirection: "column",
      }}
    >
      <h1>Please scan me </h1>
      <br />
      <QRCode value={webAddress} />
      <br />
      This QR code will take you to a page to see hotel menu.
    </div>
  );
};

export default QRCodeGenerator;
