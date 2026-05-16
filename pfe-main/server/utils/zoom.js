import axios from "axios";

const getZoomAccessToken = async () => {
  const accountId    = process.env.ZOOM_ACCOUNT_ID;
  const clientId     = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  console.log("🔍 ZOOM AUTH CHECK:");
  console.log("  Account ID exists:", !!accountId);
  console.log("  Client ID exists:", !!clientId);
  console.log("  Client Secret exists:", !!clientSecret);

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom credentials not configured in .env");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ Zoom token obtained");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Zoom TOKEN failed:");
    console.error("  Status:", error.response?.status);
    console.error("  Data:", JSON.stringify(error.response?.data, null, 2));
    console.error("  Message:", error.message);
    throw error;
  }
};

export const createZoomMeeting = async (
  hostEmail,
  participantEmail,
  topic = "Consultation",
  sessionDate = null
) => {
  try {
    console.log("🔍 ZOOM MEETING CHECK:");
    console.log("  Host email:", hostEmail);
    console.log("  Participant email:", participantEmail);
    console.log("  Topic:", topic);
    console.log("  Session date:", sessionDate);

    const token = await getZoomAccessToken();

    const startTime = sessionDate
      ? new Date(sessionDate).toISOString()
      : new Date(Date.now() + 3600000).toISOString();

    const response = await axios.post(
      `https://api.zoom.us/v2/users/me/meetings`,
      {
        topic,
        type:       2,
        start_time: startTime,
        duration:   60,
        settings: {
          join_before_host:  true,
          approval_type:     0,
          participant_video: true,
          host_video:        true,
          mute_upon_entry:   false,
          waiting_room:      false,
        },
      },
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Zoom meeting created:", response.data.join_url);
    return response.data.join_url;

  } catch (error) {
    console.error("❌ Zoom MEETING failed:");
    console.error("  Status:", error.response?.status);
    console.error("  Data:", JSON.stringify(error.response?.data, null, 2));
    console.error("  Message:", error.message);
    throw error;
  }
};