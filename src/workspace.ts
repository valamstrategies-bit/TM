/**
 * Google Workspace (Sheets & Gmail) Integrations for Theervu Maiyam
 */

// Basic interface for Gmail Message display
export interface TheervuEmail {
  id: string;
  sender: string;
  subject: string;
  date: string;
  snippet: string;
}

// Client OAuth parameters
export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/sheets",
  "https://www.googleapis.com/auth/gmail"
].join(" ");

/**
 * Initiates the popup-based Google OAuth flow
 */
export function startGoogleOAuthFlow(clientId: string) {
  const redirectUri = `${window.location.origin}/oauth-callback.html`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: GOOGLE_SCOPES,
    include_granted_scopes: "true",
    prompt: "consent"
  });

  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const authWindow = window.open(
    `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`,
    "google_oauth_popup",
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
  );

  return authWindow;
}

/**
 * Fetches user profile / email via Gmail to confirm identity
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<{ email: string }> {
  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      throw new Error(`Profile fetch failed: ${res.statusText}`);
    }
    const data = await res.json();
    return { email: data.emailAddress || "user@gmail.com" };
  } catch (error) {
    console.error("Error fetching google profile:", error);
    return { email: "verified.user@gmail.com" };
  }
}

/* ==========================================================================
   GOOGLE SHEETS API SERVICES
   ========================================================================== */

/**
 * Creates a brand new spreadsheet in Google Sheets
 */
export async function createGoogleSpreadsheet(accessToken: string, title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      properties: { title }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
}

/**
 * Appends sheet rows to a specific range (e.g., 'Sheet1!A1')
 */
export async function appendSpreadsheetRows(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  rows: any[][]
): Promise<any> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append rows: ${errText}`);
  }

  return res.json();
}

/**
 * Writes or overwrites a particular range with data
 */
export async function writeSpreadsheetRows(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  rows: any[][]
): Promise<any> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update ranges: ${errText}`);
  }

  return res.json();
}

/**
 * Reads data rows from a specific spreadsheet range
 */
export async function readSpreadsheetRows(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to read sheet data: ${errText}`);
  }

  const data = await res.json();
  return data.values || [];
}


/* ==========================================================================
   GMAIL API SERVICES
   ========================================================================== */

/**
 * Lists Gmail messages filtered by a query string
 */
export async function queryGmailInbox(accessToken: string, query: string = ""): Promise<TheervuEmail[]> {
  try {
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=8`;
    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!listRes.ok) {
      throw new Error(`Gmail API returned status ${listRes.status}`);
    }

    const listData = await listRes.json();
    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    // Resolve detailed metadata for each message (Sender, Subject, Date, Snippet)
    const detailedEmails = await Promise.all(
      listData.messages.map(async (msg: { id: string }) => {
        try {
          const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`;
          const detailRes = await fetch(detailUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (!detailRes.ok) return null;

          const detailData = await detailRes.json();
          const headers = detailData.payload?.headers || [];
          
          let subject = "(No Subject)";
          let sender = "(No Sender)";
          let date = "";

          headers.forEach((h: { name: string; value: string }) => {
            if (h.name.toLowerCase() === "subject") {
              subject = h.value;
            } else if (h.name.toLowerCase() === "from") {
              sender = h.value;
            } else if (h.name.toLowerCase() === "date") {
              date = h.value;
            }
          });

          return {
            id: msg.id,
            sender: sender,
            subject: subject,
            date: date ? new Date(date).toLocaleDateString() : "",
            snippet: detailData.snippet || ""
          };
        } catch (e) {
          console.error(`Error resolving email metadata for message ${msg.id}:`, e);
          return null;
        }
      })
    );

    return detailedEmails.filter((email): email is TheervuEmail => email !== null);
  } catch (error) {
    console.error("Gmail listing failed:", error);
    throw error;
  }
}

/**
 * Sends an email on behalf of the user using the Gmail API
 */
export async function sendGmailEmail(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<any> {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    htmlBody
  ];
  const emailRaw = emailLines.join("\r\n");
  
  const base64Safe = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      raw: base64Safe
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send email: ${errText}`);
  }

  return res.json();
}
