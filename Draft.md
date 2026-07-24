## A Big Thank You to the Keepers of Our Server

First of all, a big thank you to all the keepers of our server - almost 100 players have purchased this cosmetic-only DLC. This would have been enough to cover the server costs for almost a year!

However, our hosting provider has [raised the price by almost 300%](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/). This would have been devastating, but the proceeds from the DLC have bought me a bit more time. I have to downgrade our server (by 3x) and get it running with far fewer resources.

I have done a lot of server optimization - 50% of the server has been completely rewritten to squeeze out the last bit of performance. The server is running mostly fine, with occasional spikes that might cause lag. But I guess it's a necessary compromise for the sustainability of the server.

## Chat Improvement

One important server optimization is support for direct message routing. Previously, the server relied heavily on broadcasting, which is very expensive. As a byproduct of this optimization:

- You can now send direct messages in chat with the `/dm <player> <message>` command
- You can now block a player for the current game session in the UI
- Three new chat commands, `/block`, `/unblock`, and `/blocklist`, have been added to help manage blocked players

Direct messaging is very bare-bones - I don't expect it to be used much, so I will keep it simple.

## Redesigned Rebirth History

- Time-series chart with different stats
- Tabular view with a fixed header
- Export and download data in CSV format

## Great People Wiki and Birthdays

- Each Great Person now has a link to their Wikipedia page
- Great People's birthdays (if known) have been added to the game, and each Great Person gets a 2x effect on their birthday (only applies to building-boost Great People)

## United Nations & Wall Street

- Both buildings now show the result of the previous vote, so the community can help watch for anything fishy going on
- Both buildings now show random Keepers of Our Server (similar to Hagia Sophia)

## Trade Map Performance

- The Trade Map has been refactored to improve performance, especially when a tile changes
- When you zoom out, the map will hide details and highlight trade tile buildings. This should make panning much smoother

## Other QoLs

- Increased Max Stockpile Input Capacity to 100x (from 20x). This can improve performance in the very late game
- Increased Max Stockpile to 1000x (from 100x, 0 is unlimited as before)
- Transport arrows with origins and destinations outside the viewport are culled before viewport-based culling
- Watched Tradeable Resources: similar to Watched Resources but for tradeable resources
- When transforming a wild card Great Person, you can now type the amount
- Remember Last Build Range: do not reset building range to 0 after batch building (Options -> Gameplay)
- Carry Over Watched Resources: carry over watched resources to the next run (Options -> Gameplay)
- Carry Over Watched Tradeable Resources: carry over watched tradeable resources to the next run (Options -> Gameplay)
- Added support for `catbox.moe` chat images

## Bugfixes

- Forward/back mouse buttons no longer trigger browser navigation
- Copy & Paste (Command + C/V) now works on macOS
- Improved reconnection logic: it is now more robust and uses exponential backoff to reduce server load
