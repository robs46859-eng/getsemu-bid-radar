# SEMU Parking Structure Bid Radar

Run with Node 20 or later. Signups default to .getsemu-bid-radar-signups in the hosting account’s home directory, outside the app release. Set SIGNUP_DIR to override this with a writable persistent directory outside any public document root. Keep the same directory across deployments to retain signups. Set PORT if the hosting platform does not inject it. Start with npm start. The site serves both / and /bid-radar/.

Signup requests are stored in SIGNUP_DIR as one private JSON record per email address. Use these opt-ins to manage the four-week trial and deliver the weekly briefs from the business mailbox. This application captures consent and preferences. Email delivery is manual.
