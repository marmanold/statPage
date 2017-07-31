# statPage
A serverless function to show my current status.

As a dad who works from home from time-to-time I needed a simple way for my wife and daughter to know whether I was in a call or not.

This simple Serverless app gives me an end-pooint --- currStat --- that delivers a simple HTML page that can be hit by my wife's iPhone or any other device to quickly show my current status (busy or free).

Further, I can update my status by simply clicking my AWS IoT button sitting on my desk --- toggleStat.

The HTML page automatically refreshes every 60 seconds to show my current status, so my wife can just leave the page open when I'm working and always know (with just a little delay) my current status.

Additionally, I've found this to be of use at the office --- people are never sure if I'm listening to music at my desk or on a conference call --- so I've added the ability to set my status from [Alfred](https://www.alfredapp.com) as well --- updateStat.

Fork this repo and put it on your own AWS account and you, too, can have a quick status page for your family that works on any device with a web browser and a network connection.
