import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
   appId: "com.cividle",
   appName: "CivIdle",
   webDir: "dist",
   server: {
      url: "http://192.168.3.12:3000/",
   },
};

export default config;
