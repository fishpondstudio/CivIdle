declare const Steamworks:
   | {
        writeTextToFile: (name: string, content: string) => Promise<void>;
        readTextFromFile: (name: string) => Promise<string>;
     }
   | undefined;
