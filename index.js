const express = require("express");
const app = express();
const axios = require("axios");
app.use(express.json());

const Authorization = `Basic ${Buffer.from(`${process.env.RESTkey}:${process.env.RESTsecret}`).toString("base64")}`;

app.get("/", (req, res) => res.send("Agora Cloud Recording Server"));

app.post("/acquire", async (req, res) => {
  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${process.env.appID}/cloud_recording/acquire`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        resourceExpiredHour: 24,
      },
    },
    { headers: { Authorization } }
  );

  res.send(acquire.data);
});

app.post("/start", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;

  const start = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/individual/start`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        recordingConfig: {
          maxIdleTime: 30,
          streamTypes: 2,
          channelType: 0,
          subscribeUidGroup: 0,
        },
        snapshotConfig: {
          captureInterval: 10,
          fileType: ["jpg"],
        },
        storageConfig: {
          vendor: 1,
          region: 2,
          bucket: process.env.bucket,
          accessKey: process.env.accessKey,
          secretKey: process.env.secretKey,
          fileNamePrefix: ["directory1", "directory2"],
        },
      },
    },
    { headers: { Authorization } }
  );

  res.send(start.data);
});

app.post("/stop", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const sid = req.body.sid;

  const stop = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/individual/stop`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {},
    },
    { headers: { Authorization } }
  );
  res.send(stop.data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Agora Cloud Recording Server listening at Port ${port}`));
