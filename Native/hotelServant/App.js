import React from "react";
import { WebView } from "react-native-webview";

const MyWebView = () => {
  return (
    <>
      <WebView
        style={{ marginTop: 20 }}
        source={{ uri: "https://hotel.masetawosha.com/" }}
      />
    </>
  );
};

export default MyWebView;
