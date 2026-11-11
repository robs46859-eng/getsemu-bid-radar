# SEMU Parking Structure Bid Radar

Run with Node 20 or later and set SIGNUP_DIR to a writable persistent directory outside any public document root. The web process must be able to create files there. Set PORT if the hosting platform does not inject it. Start with npm start. The site serves both / and /bid-radar/.

Signup requests are stored in SIGNUP_DIR as one private JSON record per email address. Use these opt-ins to manage the four-week trial and deliver the weekly briefs from the business mailbox. This application captures consent and preferences. Email delivery is manual.
