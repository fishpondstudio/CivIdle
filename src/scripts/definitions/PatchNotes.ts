interface PatchNote {
   version: string;
   content: string[][];
}

export const PatchNotes: PatchNote[] = [
   {
      version: "0.1.57",
      content: [
         ["Bugfix", "Disable claiming an ocean tile: you have to be on land to trade"],
         ["Bugfix", "Fix Stonehenge failing to provide production multiplier"],
         ["QoL", "Add a patch notes page and start to write patch notes :-)"],
         ["QoL", "You can click the name in the chat to mention someone, and the player mentioned will be notified"],
      ],
   },
];
