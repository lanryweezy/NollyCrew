# Google Form Setup for Waitlist

## Step 1: Create Google Form
1. Go to [Google Forms](https://forms.google.com)
2. Create a new form titled "NollyCrew Waitlist"
3. Add these fields:
   - **Email** (Short answer, required)
   - **Name** (Short answer, optional)
   - **Source** (Short answer, optional) - for tracking where signups came from

## Step 2: Get Form Submission URL
1. In your Google Form, click the "Send" button
2. Click the link icon (🔗) to get the form URL
3. The URL will look like: `https://docs.google.com/forms/d/FORM_ID/viewform`
4. Replace `viewform` with `formResponse` to get the submission URL:
   `https://docs.google.com/forms/d/FORM_ID/formResponse`

## Step 3: Get Field Entry IDs
1. Right-click on the form and "View Page Source"
2. Search for `entry.` to find the field IDs
3. Look for patterns like:
   - `entry.1234567890` for email field
   - `entry.0987654321` for name field
   - `entry.1122334455` for source field

## Step 4: Update Environment Variables
Add these to your Render environment variables:
```
GOOGLE_FORM_URL=https://docs.google.com/forms/d/YOUR_FORM_ID/formResponse
GOOGLE_FORM_EMAIL_ENTRY=entry.1234567890
GOOGLE_FORM_NAME_ENTRY=entry.0987654321
GOOGLE_FORM_SOURCE_ENTRY=entry.1122334455
```

## Alternative: Use Formspree or Netlify Forms
If Google Forms is too complex, we can use:
- **Formspree**: Simple form handling service
- **Netlify Forms**: If you deploy to Netlify instead of Render

Let me know which option you prefer!
