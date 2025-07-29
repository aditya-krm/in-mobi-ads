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
  const { userId, pageUrl, domain, adSlots } = req.body;
  console.log("Received request body:", req.body);

  interface AdSlot {
    id?: string;
    height: number;
    width: number;
    pos?: number;
    bidfloor?: number;
    placementId: string;
  }

  interface ImpObject {
    id: string;
    banner: {
      h: number;
      w: number;
      pos?: number;
    };
    bidfloor: number;
    tagid: string;
  }

  const imp: ImpObject[] = (adSlots || []).map((slot: AdSlot, idx: number) => ({
    id: slot.id || `slot${idx + 1}`,
    banner: {
      h: slot.height,
      w: slot.width,
      pos: slot.pos,
    },
    bidfloor: slot.bidfloor || 0.05,
    tagid: slot.placementId,
  }));

  const requestBody = {
    id: userId || `req-${Date.now() * Math.floor(Math.random() * 1000)}`,
    imp,
    site: {
      id: "freeboomshare-main", // i don't know what to put in all these fields
      domain: domain || "app.freeboomshare.com",
      page: pageUrl || req.headers.referer || "https://app.freeboomshare.com",
      publisher: {
        id: "freeboomshare-pub",
        name: "freeboomshare",
        domain: domain || "app.freeboomshare.com",
      },
    },
    user: { id: userId },
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
    console.log("InMobi response:", response.data);

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
