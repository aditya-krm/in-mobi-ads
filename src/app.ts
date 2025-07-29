import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the oRTB backend!", status: "running" });
});

app.post("/get-inmobi-ads", async (req, res): Promise<void> => {

  const imp = {
    id: "Top Banner",
    banner: {
      h: 250,
      w: 300,
      pos: 1,
    },
    bidfloor: 0.05,
    tagid: "10000433284",
  };

  const requestBody = {
    id: "ae38b28f379745e0b9356ee2cddd8e99",
    imp,
    site: {
      id: "10000075085",
      domain: "app.freeboomshare.com",
      page: req.headers.referer || "https://app.freeboomshare.com/ad-testing",
      publisher: {
        id: "freeboomshare-pub",
        name: "freeboomshare",
        domain: "app.freeboomshare.com",
      },
    },
    user: {
      id: "ae38b28f379745e0b9356ee2cddd8e99",
    },
    device: {
      ua: req.headers["user-agent"],
      ip: req.ip,
    },
    at: 1,
    cur: ["USD"],
  };

  try {
    const response = await axios.post(
      "https://api.w.inmobi.com/ortb",
      requestBody,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("InMobi response:", response.status, response.data);

    res.status(response.status).json(response.data);
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: { status?: number; data?: any };
      message?: string;
    };
    res.status(errorResponse.response?.status || 500).json({
      error:
        errorResponse.response?.data ||
        errorResponse.message ||
        "Unknown error",
    });
  }
});

app.listen(3000, () => {
  console.log(`oRTB backend listening on port 3000`);
});
