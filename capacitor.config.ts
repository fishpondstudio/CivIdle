import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
   appId: "com.cividle",
   appName: "CivIdle",
   webDir: "dist",
   server: {
      androidScheme: "https",
   },
};

export default config;
