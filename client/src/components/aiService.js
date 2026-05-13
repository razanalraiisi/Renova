import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

let model = null;

// Load model once
const loadModel = async () => {

  if (!model) {

    model =
      await mobilenet.load();

    console.log(
      "MobileNet loaded successfully"
    );
  }

  return model;
};

// Allowed electronics keywords
const electronicsMap = {

  Laptop: [
    "laptop",
    "notebook",
  ],

  Phone: [
    "cellular telephone",
    "mobile phone",
    "smartphone",
    "iphone",
    "ipod",
  ],

  Tablet: [
    "tablet",
    "ipad",
  ],

  PSP: [
    "hand-held computer",
    "handheld computer",
    "game console",
  ],

  Console: [
    "console",
    "playstation",
    "xbox",
    "nintendo",
  ],

  Keyboard: [
    "keyboard",
  ],

  Mouse: [
    "mouse",
  ],

  Monitor: [
    "monitor",
    "screen",
  ],

  TV: [
    "television",
    "tv",
  ],

  Camera: [
    "reflex camera",
    "camera",
    "digital camera",
    "webcam",
  ],

  Headphones: [
    "headphone",
    "headset",
    "earphone",
    "earbuds",
  ],

  Speaker: [
    "speaker",
    "loudspeaker",
  ],

  Printer: [
    "printer",
  ],

  "Remote Control": [
    "remote control",
  ],

  "Hair Dryer": [
    "hand blower",
    "hair dryer",
    "blow dryer",
  ],

  "Coffee Maker": [
    "coffee maker",
    "espresso maker",
  ],

  Microwave: [
    "microwave",
  ],

  Refrigerator: [
    "refrigerator",
    "fridge",
  ],

  "Washing Machine": [
    "washer",
    "washing machine",
  ],

  "Vacuum Cleaner": [
    "vacuum",
    "vacuum cleaner",
  ],

  Joystick: [
    "joystick",
    "game controller",
  ],
};

// NON-electronics to reject
const bannedObjects = [

  "wallet",
  "purse",
  "lens cap",
  "can opener",
  "stove",
  "plate",
  "spoon",
  "fork",
  "shoe",
  "bag",
  "backpack",
  "book",
  "cup",
  "bottle",
  "food",
  "banana",
  "orange",
  "dog",
  "cat",
  "person",
];

// Find best electronics match
const detectElectronic =
  (predictions) => {

    for (
      const prediction
      of predictions
    ) {

      const rawLabel =
        prediction.className
          .toLowerCase();

      const confidence =
        prediction.probability * 100;

      // Ignore weak predictions
      if (confidence < 20) {
        continue;
      }

      // Reject banned objects
      const isBanned =
        bannedObjects.some(
          (bad) =>
            rawLabel.includes(bad)
        );

      if (isBanned) {
        continue;
      }

      // Rename labels if mapped
      for (
        const device
        in electronicsMap
      ) {

        const keywords =
          electronicsMap[device];

        const matched =
          keywords.some(
            (keyword) =>
              rawLabel.includes(
                keyword
              )
          );

        if (matched) {

          return {
            detectedDevice:
              device,

            confidence:
              confidence.toFixed(2),
          };
        }
      }

      // If not renamed,
      // use original MobileNet label
      return {

        detectedDevice:
          prediction.className
            .split(",")[0]
            .replace(/_/g, " ")
            .replace(
              /\b\w/g,
              (char) =>
                char.toUpperCase()
            ),

        confidence:
          confidence.toFixed(2),
      };
    }

    return {

      detectedDevice:
        "Unknown Electronic Device",

      confidence: "0",
    };
};

// Recommendation logic
const getRecommendation =
  (condition) => {

    switch (condition) {

      case "working":
        return "Upcycle";

      case "damaged":
        return "Recycle";

      case "dangerous":
        return "Dispose";

      default:
        return "Recycle";
    }
};

// Main AI function
export const getAIRecommendation =
  async (
    imageFile,
    condition
  ) => {

    try {

      const loadedModel =
        await loadModel();

      // Create image
      const img =
        document.createElement(
          "img"
        );

      img.src =
        URL.createObjectURL(
          imageFile
        );

      // Wait for load
      await new Promise(
        (resolve) => {

          img.onload =
            resolve;
        }
      );

      // Predict image
      const predictions =
        await loadedModel.classify(
          img
        );

      console.log(
        "Predictions:",
        predictions
      );

      // Detect electronic
      const result =
        detectElectronic(
          predictions
        );

      return {

        recommendation:
          getRecommendation(
            condition
          ),

        detectedDevice:
          result.detectedDevice,

        confidence:
          result.confidence,
      };

    } catch (error) {

      console.error(
        "AI Error:",
        error
      );

      return {

        recommendation:
          "Recycle",

        detectedDevice:
          "Unknown Electronic Device",

        confidence: "0",
      };
    }
};