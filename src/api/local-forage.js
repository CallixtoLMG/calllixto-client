import localforage from "localforage";

const instance = localforage.createInstance({
  name: "callixto",
});

export default instance;
