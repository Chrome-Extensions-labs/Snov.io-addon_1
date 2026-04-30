# How to Create and Link a Database (Google Sheets)

The Snov.io addon fetches email datasets from remote, publicly readable URLs. The easiest way to create and manage these databases is by using Google Sheets and publishing them as CSV files.

Here is a step-by-step guide on how to set this up.

## Step 1: Prepare Your Data
1. Open [Google Sheets](https://docs.google.com/spreadsheets/) and create a new spreadsheet.
2. Enter your email addresses into a single column (e.g., Column A). 
3. **Important:** For best performance, make sure there is only one email address per cell. This minimizes client-side parsing overhead.

## Step 2: Publish the Sheet to the Web
To allow the extension to read the data without authentication, the sheet must be published publicly.
1. In your Google Sheet, click on **File** in the top menu.
2. Select **Share** > **Publish to web**.
3. In the window that appears, change the format from "Web page" to **Comma-separated values (.csv)**.
4. Click the **Publish** button and confirm your choice.

## Step 3: Get the CSV Link
1. After publishing, Google Sheets will generate a direct link.
2. Copy this link. It should end with something similar to `output=csv`.
3. *(Note: The extension requires the URL to start with `http` or `https`).*

## Step 4: Connect the Database to the Extension
1. Open the Snov.io Addon popup in your browser.
2. Paste the copied CSV link into one of the available input fields (e.g., **CSV URL 1**).
3. Click the color picker next to the field to select a highlight color for this specific list.
4. Click the **Save Settings** button.
5. Finally, click **Fetch / Update Databases** to download the emails into the extension's local storage.

### Troubleshooting
* **No highlights appear:** Make sure your URL is valid, publicly accessible, and returns text containing `@` symbols.
* **Empty lists:** If an invalid URL is provided, the extension will safely resolve it to an empty dataset without crashing. Simply correct the link and click "Fetch" again.
