import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
   appId: "com.cividle",
   appName: "CivIdle",
   webDir: "dist",
   loggingBehavior: "production",
   // android: { webContentsDebuggingEnabled: true },
   // server: {
   //    url: "http://192.168.3.12:3000/",
   // },
   backgroundColor: "#000000",
   plugins: {
      LiveUpdate: {
         readyTimeout: 30_000,
      },
   },
};

export default config;
