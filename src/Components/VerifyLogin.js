import LocalStorage from "./LocalStorage";
import axios from "axios";
async function VerifyLogin() {
  let path = process.env.REACT_APP_PATH;
  let token = await LocalStorage("token", "", "get");
  let myProfile = await axios.get(path + "/getMyprofile", {
    headers: {
      Authorization: token,
    },
  });
  return myProfile;
}

export default VerifyLogin;
