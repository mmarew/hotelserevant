async function LocalStorage(key, value, action) {
  if (action == "set") localStorage.setItem(key, value);
  else if (action == "get") return localStorage.getItem(key);
  else if (action == "logout") {
    console.log("clear");

    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    return;
  } else if (action == "setOrdersLocally") {
    let savedOrders = localStorage.getItem("savedOrders");
    // console.log("savedOrders", savedOrders);
    savedOrders = JSON.parse(savedOrders);
    if (savedOrders == null || !Array.isArray(savedOrders)) {
      savedOrders = [value];
    } else {
      savedOrders.push(value);
    }
    // console.log("savedOrders", savedOrders);
    // return;
    localStorage.setItem("savedOrders", JSON.stringify(savedOrders));
  }
}
export default LocalStorage;
