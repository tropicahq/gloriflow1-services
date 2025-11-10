import Axios from 'axios';
import { buildMemoryStorage, setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
export const axios = setupCache(instance, {
  storage: buildMemoryStorage("double", 600000, 20),
  debug(msg) {
    console.log(msg)
  }
});
